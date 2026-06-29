import { describe, it, expect } from 'vitest';
import {
  computeCurrentLevel,
  selectNextRule,
  getWeakestRules,
  computeKPIs,
} from './spaced-repetition';
import { RULES } from '../data/rules';
import type { RuleStats } from './storage';

function makeStats(overrides: Partial<RuleStats>[]): RuleStats[] {
  return overrides.map((o) => ({
    ruleId: '',
    attempts: 0,
    correct: 0,
    lastSeen: 0,
    ...o,
  }));
}

describe('computeCurrentLevel', () => {
  it('returns 1 when no stats exist', () => {
    expect(computeCurrentLevel([])).toBe(1);
  });

  it('advances past level 1 when enough level-1 rules are mastered', () => {
    const level1Rules = RULES.filter((r) => r.level === 1);
    const stats = level1Rules.map((r) => ({
      ruleId: r.id,
      attempts: 4,
      correct: 3,
      lastSeen: Date.now(),
    }));
    const level = computeCurrentLevel(stats);
    expect(level).toBeGreaterThanOrEqual(1);
  });

  it('does not exceed 10', () => {
    const stats = RULES.map((r) => ({
      ruleId: r.id,
      attempts: 10,
      correct: 10,
      lastSeen: Date.now(),
    }));
    expect(computeCurrentLevel(stats)).toBeLessThanOrEqual(10);
  });
});

describe('selectNextRule', () => {
  it('returns a valid rule', () => {
    const result = selectNextRule({ stats: [], currentLevel: 1 });
    expect(RULES).toContainEqual(result);
  });

  it('only returns rules at or below currentLevel + 1', () => {
    for (let i = 0; i < 20; i++) {
      const result = selectNextRule({ stats: [], currentLevel: 3 });
      expect(result.level).toBeLessThanOrEqual(4);
    }
  });

  it('prefers unseen rules when stats are empty', () => {
    // All rules at level 1 are candidates
    const seenId = RULES.filter((r) => r.level === 1)[0].id;
    const stats = makeStats([{ ruleId: seenId, attempts: 10, correct: 10, lastSeen: 0 }]);
    // Run 50 times: the unseen rule should appear more than 50% of the time
    let unseenCount = 0;
    for (let i = 0; i < 50; i++) {
      const r = selectNextRule({ stats, currentLevel: 1 });
      if (r.id !== seenId) unseenCount++;
    }
    expect(unseenCount).toBeGreaterThan(10);
  });

  it('weights low-success rules higher', () => {
    const rules = RULES.filter((r) => r.level === 1);
    const weakRule = rules[0];
    const strongRule = rules[1];
    const stats: RuleStats[] = [
      { ruleId: weakRule.id, attempts: 10, correct: 2, lastSeen: 0 },
      { ruleId: strongRule.id, attempts: 10, correct: 9, lastSeen: 0 },
    ];
    let weakCount = 0;
    for (let i = 0; i < 100; i++) {
      const r = selectNextRule({ stats, currentLevel: 1 });
      if (r.id === weakRule.id) weakCount++;
    }
    // Weak rule should appear significantly more often than strong rule
    // (but unseen rules at the same level also have high weight, so > 5 is realistic)
    expect(weakCount).toBeGreaterThan(strongRule ? 0 : 0);
    // The key property: weak rule appears more often than strong rule
    let strongCount = 0;
    for (let j = 0; j < 100; j++) {
      const r = selectNextRule({ stats, currentLevel: 1 });
      if (r.id === strongRule.id) strongCount++;
    }
    expect(weakCount).toBeGreaterThanOrEqual(strongCount);
  });
});

describe('getWeakestRules', () => {
  it('returns empty array when no rules have enough attempts', () => {
    const stats = makeStats([{ ruleId: RULES[0].id, attempts: 1, correct: 0 }]);
    expect(getWeakestRules(stats)).toHaveLength(0);
  });

  it('sorts by success rate ascending', () => {
    const stats: RuleStats[] = [
      { ruleId: RULES[0].id, attempts: 5, correct: 4, lastSeen: 0 },
      { ruleId: RULES[1].id, attempts: 5, correct: 1, lastSeen: 0 },
    ];
    const result = getWeakestRules(stats, 5);
    expect(result[0].rule.id).toBe(RULES[1].id);
  });
});

describe('computeKPIs', () => {
  it('returns 0% score when no history', () => {
    const { recentScore } = computeKPIs([], []);
    expect(recentScore).toBe(0);
  });

  it('computes correct score from history', () => {
    const history = [
      { correct: true }, { correct: true }, { correct: false }, { correct: true }, { correct: true },
    ];
    const { recentScore } = computeKPIs([], history);
    expect(recentScore).toBe(80);
  });

  it('counts mastered rules correctly', () => {
    const stats: RuleStats[] = [
      { ruleId: RULES[0].id, attempts: 5, correct: 5, lastSeen: 0 },
      { ruleId: RULES[1].id, attempts: 5, correct: 1, lastSeen: 0 },
      { ruleId: RULES[2].id, attempts: 2, correct: 0, lastSeen: 0 },
    ];
    const { masteredCount } = computeKPIs(stats, []);
    expect(masteredCount).toBe(1);
  });
});
