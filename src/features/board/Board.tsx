import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { getAllRuleStats, getRecentHistory } from '../../lib/storage';
import type { RuleStats, RuleAttempt } from '../../lib/storage';
import { computeKPIs, getWeakestRules } from '../../lib/spaced-repetition';
import { RULES } from '../../data/rules';
import { Skeleton } from '../../components/Skeleton';

const LEVEL_NAMES = [
  '', 'Initié', 'Apprenti', 'Praticien', 'Confirmé', 'Avancé',
  'Expert', 'Maître', 'Grand maître', 'Éditorialiste', 'Académicien',
];

function KPICard({ label, value, sub }: { label: string; value: string | number; sub?: string }) {
  return (
    <div className="bg-white border border-[#D4CFC6] rounded-lg p-4">
      <div className="text-xs text-[#3D5A73] uppercase tracking-wide mb-1">{label}</div>
      <div className="text-3xl font-mono text-[#0B1F3A] font-medium">{value}</div>
      {sub && <div className="text-xs text-[#3D5A73] mt-0.5">{sub}</div>}
    </div>
  );
}

export function Board() {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<RuleStats[]>([]);
  const [history, setHistory] = useState<RuleAttempt[]>([]);

  useEffect(() => {
    Promise.all([getAllRuleStats(), getRecentHistory(30)]).then(([s, h]) => {
      setStats(s);
      setHistory(h);
      setLoading(false);
    });
  }, []);

  if (loading) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-8 space-y-6">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[1,2,3,4].map(i => <Skeleton key={i} className="h-24" />)}
        </div>
        <Skeleton className="h-40" />
        <Skeleton className="h-48" />
      </div>
    );
  }

  const kpi = computeKPIs(stats, history);
  const weakest = getWeakestRules(stats, 6);
  const ruleMap = new Map(RULES.map((r) => [r.id, r]));

  // Level progression
  const levels = Array.from({ length: 10 }, (_, i) => i + 1);

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
      className="max-w-5xl mx-auto px-4 py-8 space-y-8"
    >
      <div>
        <h1 className="text-2xl text-[#0B1F3A] mb-1" style={{ fontFamily: 'Source Serif 4, Georgia, serif' }}>
          Tableau de bord
        </h1>
        <p className="text-sm text-[#3D5A73]">
          Niveau actuel : <span className="font-semibold">{LEVEL_NAMES[kpi.currentLevel]}</span> ({kpi.currentLevel}/10)
        </p>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <KPICard label="Score (30 derniers)" value={`${kpi.recentScore}%`} sub={`sur ${history.length} exercices`} />
        <KPICard label="Niveau" value={kpi.currentLevel} sub={LEVEL_NAMES[kpi.currentLevel]} />
        <KPICard label="Règles maîtrisées" value={kpi.masteredCount} sub={`sur ${RULES.length}`} />
        <KPICard label="Total exercices" value={kpi.totalAttempts} />
      </div>

      {/* Level progression */}
      <div className="bg-white border border-[#D4CFC6] rounded-lg p-5">
        <h2 className="text-sm font-semibold text-[#0B1F3A] uppercase tracking-wide mb-4">Progression par niveau</h2>
        <div className="space-y-2">
          {levels.map((lvl) => {
            const rulesAtLevel = RULES.filter((r) => r.level === lvl);
            const mastered = stats.filter((s) => {
              const r = ruleMap.get(s.ruleId);
              return r && r.level === lvl && s.attempts >= 3 && s.correct / s.attempts >= 0.8;
            });
            const pct = rulesAtLevel.length > 0
              ? Math.round((mastered.length / rulesAtLevel.length) * 100)
              : 0;
            const isActive = lvl <= kpi.currentLevel + 1;

            return (
              <div key={lvl} className="flex items-center gap-3">
                <div className={`text-xs font-mono w-6 text-right ${lvl <= kpi.currentLevel ? 'text-[#0B1F3A]' : 'text-[#3D5A73]'}`}>
                  {lvl}
                </div>
                <div className="flex-1 bg-[#F7F5F0] rounded-full h-2 overflow-hidden border border-[#D4CFC6]">
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{
                      width: `${pct}%`,
                      backgroundColor: lvl <= kpi.currentLevel ? '#1E5E3A' : '#3D5A73',
                      opacity: isActive ? 1 : 0.4,
                    }}
                  />
                </div>
                <div className="text-xs font-mono text-[#3D5A73] w-28 shrink-0">
                  {mastered.length}/{rulesAtLevel.length} règles · {pct}%
                </div>
                {lvl <= kpi.currentLevel && (
                  <span className="text-xs text-[#1E5E3A] font-medium shrink-0">✓</span>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Weakest rules */}
      {weakest.length > 0 && (
        <div className="bg-white border border-[#D4CFC6] rounded-lg p-5">
          <h2 className="text-sm font-semibold text-[#0B1F3A] uppercase tracking-wide mb-4">Points faibles</h2>
          <div className="space-y-2">
            {weakest.map(({ rule, rate }) => (
              <div key={rule.id} className="flex items-center gap-3">
                <div className="flex-1 min-w-0">
                  <span className="text-sm text-[#0B1F3A]">{rule.name}</span>
                  <span className="text-xs text-[#3D5A73] ml-2">{rule.category} · niv. {rule.level}</span>
                </div>
                <div className="text-sm font-mono text-[#A8342A] shrink-0">
                  {Math.round(rate * 100)}%
                </div>
                <div className="w-20 bg-[#F7F5F0] rounded-full h-1.5 border border-[#D4CFC6] shrink-0">
                  <div
                    className="h-full rounded-full bg-[#A8342A]"
                    style={{ width: `${Math.round(rate * 100)}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {history.length === 0 && (
        <p className="text-sm text-[#3D5A73] text-center py-4">
          Aucun exercice effectué. Commencer par l'onglet Entraînement.
        </p>
      )}

      {/* Recent activity */}
      {history.length > 0 && (
        <div className="bg-white border border-[#D4CFC6] rounded-lg p-5">
          <h2 className="text-sm font-semibold text-[#0B1F3A] uppercase tracking-wide mb-3">Activité récente (30 derniers)</h2>
          <div className="flex flex-wrap gap-1">
            {history.map((h, i) => (
              <div
                key={i}
                className={`w-4 h-4 rounded-sm ${h.correct ? 'bg-[#1E5E3A]' : 'bg-[#A8342A]'}`}
                title={h.correct ? 'Correct' : 'Incorrect'}
              />
            ))}
          </div>
        </div>
      )}
    </motion.div>
  );
}
