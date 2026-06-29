import { RULES } from '../data/rules';
import type { Rule } from '../data/rules';
import type { RuleStats } from './storage';

export interface SelectionContext {
  stats: RuleStats[];
  currentLevel: number;
}

/**
 * Compute the current user level (1–10).
 * A level is "unlocked" when the user has attempted at least 3 rules
 * at that level with a success rate ≥ 0.65.
 */
export function computeCurrentLevel(stats: RuleStats[]): number {
  const statMap = new Map(stats.map((s) => [s.ruleId, s]));

  for (let lvl = 10; lvl >= 1; lvl--) {
    const rulesAtLevel = RULES.filter((r) => r.level === lvl);
    const attempted = rulesAtLevel.filter((r) => {
      const s = statMap.get(r.id);
      return s && s.attempts >= 2;
    });
    if (attempted.length === 0) continue;
    const passing = attempted.filter((r) => {
      const s = statMap.get(r.id)!;
      return s.correct / s.attempts >= 0.65;
    });
    if (passing.length >= Math.ceil(rulesAtLevel.length * 0.6)) return lvl;
  }
  return 1;
}

/**
 * Pick the next rule to practice.
 * Rules never seen come first (weighted higher).
 * Among seen rules, lower success rate → higher weight.
 * Constrains to rules at or below current level + 1 (exploration window).
 */
export function selectNextRule(ctx: SelectionContext): Rule {
  const { stats, currentLevel } = ctx;
  const statMap = new Map(stats.map((s) => [s.ruleId, s]));

  const maxLevel = Math.min(currentLevel + 1, 10);
  const candidates = RULES.filter((r) => r.level <= maxLevel);

  const weights = candidates.map((rule) => {
    const s = statMap.get(rule.id);
    if (!s || s.attempts === 0) return 3.0; // Unseen rules get highest priority
    const rate = s.correct / s.attempts;
    return Math.max(0.1, 1.0 - rate + 0.2); // Floor at 0.1 so mastered rules still appear occasionally
  });

  const total = weights.reduce((a, b) => a + b, 0);
  let rand = Math.random() * total;
  for (let i = 0; i < candidates.length; i++) {
    rand -= weights[i];
    if (rand <= 0) return candidates[i];
  }
  return candidates[candidates.length - 1];
}

/**
 * Returns the weakest rules (sorted by success rate ascending),
 * limited to rules with at least 2 attempts.
 */
export function getWeakestRules(stats: RuleStats[], limit = 5): Array<{ rule: Rule; rate: number }> {
  const ruleMap = new Map(RULES.map((r) => [r.id, r]));
  return stats
    .filter((s) => s.attempts >= 2)
    .map((s) => ({ rule: ruleMap.get(s.ruleId)!, rate: s.correct / s.attempts }))
    .filter((x) => x.rule !== undefined)
    .sort((a, b) => a.rate - b.rate)
    .slice(0, limit);
}

/**
 * Returns summary KPIs.
 */
export function computeKPIs(
  stats: RuleStats[],
  recentHistory: { correct: boolean }[],
): {
  recentScore: number;
  currentLevel: number;
  masteredCount: number;
  totalAttempts: number;
} {
  const correct = recentHistory.filter((h) => h.correct).length;
  const recentScore = recentHistory.length > 0 ? Math.round((correct / recentHistory.length) * 100) : 0;
  const currentLevel = computeCurrentLevel(stats);
  const masteredCount = stats.filter(
    (s) => s.attempts >= 3 && s.correct / s.attempts >= 0.8,
  ).length;
  const totalAttempts = stats.reduce((acc, s) => acc + s.attempts, 0);
  return { recentScore, currentLevel, masteredCount, totalAttempts };
}
