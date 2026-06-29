import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { RULES, RULE_CATEGORIES } from '../../data/rules';
import type { RuleCategory, Rule } from '../../data/rules';
import { getAllRuleStats, getCached, setCached, recordAttempt } from '../../lib/storage';
import type { RuleStats } from '../../lib/storage';
import { generateRuleCard, generateExercise } from '../../lib/api';
import type { RuleCard, ExerciseItem } from '../../lib/api';
import { Skeleton } from '../../components/Skeleton';

function RuleCardPanel({ rule, onClose }: { rule: Rule; onClose: () => void }) {
  const [card, setCard] = useState<RuleCard | null>(null);
  const [loadingCard, setLoadingCard] = useState(false);
  const [cardError, setCardError] = useState('');
  const [exercise, setExercise] = useState<ExerciseItem | null>(null);
  const [loadingEx, setLoadingEx] = useState(false);
  const [exError, setExError] = useState('');
  const [exPhase, setExPhase] = useState<'question' | 'result'>('question');
  const [selectedToken, setSelectedToken] = useState('');
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);

  useEffect(() => {
    async function load() {
      const cacheKey = `rule_card_${rule.id}`;
      const cached = await getCached<RuleCard>(cacheKey);
      if (cached) { setCard(cached); return; }
      setLoadingCard(true);
      try {
        const c = await generateRuleCard(rule);
        await setCached(cacheKey, c);
        setCard(c);
      } catch (e) {
        setCardError(e instanceof Error ? e.message : 'Erreur de chargement.');
      } finally {
        setLoadingCard(false);
      }
    }
    load();
  }, [rule]);

  async function loadExercise() {
    setLoadingEx(true);
    setExError('');
    setExercise(null);
    setExPhase('question');
    setSelectedToken('');
    setIsCorrect(null);
    try {
      const ex = await generateExercise(rule);
      setExercise(ex);
    } catch (e) {
      setExError(e instanceof Error ? e.message : 'Erreur de génération.');
    } finally {
      setLoadingEx(false);
    }
  }

  function tokenize(s: string) { return s.match(/\S+|\s+/g) ?? []; }

  async function handleTokenClick(token: string) {
    if (!exercise || exPhase === 'result') return;
    const correct = token.trim().toLowerCase() === exercise.faultyWord.trim().toLowerCase();
    setSelectedToken(token);
    setIsCorrect(correct);
    setExPhase('result');
    await recordAttempt({ ruleId: rule.id, correct, timestamp: Date.now() });
  }

  const tokens = exercise ? tokenize(exercise.sentence) : [];

  return (
    <motion.div
      initial={{ opacity: 0, x: 24 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 24 }}
      className="bg-white border border-[#D4CFC6] rounded-lg p-6 shadow-sm space-y-5"
    >
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-xl text-[#0B1F3A]" style={{ fontFamily: 'Source Serif 4, Georgia, serif' }}>
            {rule.name}
          </h2>
          <div className="flex items-center gap-2 mt-1">
            <span className="text-xs bg-[#0B1F3A]/10 text-[#0B1F3A] px-2 py-0.5 rounded font-medium">{rule.category}</span>
            <span className="text-xs text-[#3D5A73]">Niveau {rule.level}/10</span>
          </div>
        </div>
        <button
          onClick={onClose}
          className="text-[#3D5A73] hover:text-[#0B1F3A] text-lg leading-none p-1 focus:outline-none focus:ring-2 focus:ring-[#3D5A73] rounded"
          aria-label="Fermer"
        >
          ×
        </button>
      </div>

      {/* Fiche explicative */}
      {loadingCard ? (
        <div className="space-y-2">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-5/6" />
          <Skeleton className="h-4 w-4/5" />
        </div>
      ) : cardError ? (
        <p className="text-sm text-[#A8342A]">{cardError}</p>
      ) : card ? (
        <div className="space-y-4">
          <p className="text-sm leading-relaxed text-[#0B1F3A]">{card.explanation}</p>
          {card.pitfalls.length > 0 && (
            <div>
              <p className="text-xs font-semibold text-[#0B1F3A] uppercase tracking-wide mb-2">Pièges fréquents</p>
              <ul className="space-y-1">
                {card.pitfalls.map((p, i) => (
                  <li key={i} className="text-sm text-[#3D5A73] flex gap-2">
                    <span className="text-[#A8342A] shrink-0">·</span>{p}
                  </li>
                ))}
              </ul>
            </div>
          )}
          {card.examples.length > 0 && (
            <div className="space-y-3">
              <p className="text-xs font-semibold text-[#0B1F3A] uppercase tracking-wide">Exemples</p>
              {card.examples.map((ex, i) => (
                <div key={i} className="text-sm space-y-0.5 bg-[#F7F5F0] rounded p-3">
                  <p className="text-[#A8342A]">✗ {ex.incorrect}</p>
                  <p className="text-[#1E5E3A]">✓ {ex.correct}</p>
                  <p className="text-[#3D5A73] text-xs mt-1">{ex.comment}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      ) : null}

      {/* Zone d'exercice */}
      <div className="border-t border-[#D4CFC6] pt-5">
        <div className="flex items-center justify-between mb-3">
          <p className="text-xs font-semibold text-[#0B1F3A] uppercase tracking-wide">Exercice</p>
          <button
            onClick={loadExercise}
            disabled={loadingEx}
            className="text-xs text-[#3D5A73] border border-[#D4CFC6] px-3 py-1 rounded hover:border-[#3D5A73] transition-colors disabled:opacity-40"
          >
            {exercise ? 'Exemple suivant' : 'Générer un exemple'}
          </button>
        </div>

        {loadingEx && <Skeleton className="h-12 w-full" />}
        {exError && <p className="text-sm text-[#A8342A]">{exError}</p>}

        {exercise && !loadingEx && (
          <div className="space-y-3">
            <p className="text-sm leading-relaxed" style={{ fontFamily: 'Source Serif 4, Georgia, serif' }}>
              {tokens.map((token, i) => {
                if (/^\s+$/.test(token)) return <span key={i}>{token}</span>;
                const isTarget = token.trim().toLowerCase() === exercise.faultyWord.trim().toLowerCase();
                let cls = 'cursor-pointer px-0.5 rounded transition-colors hover:bg-[#0B1F3A]/10';
                if (exPhase === 'result') {
                  if (isTarget) cls += ' bg-[#1E5E3A]/15 text-[#1E5E3A] font-semibold';
                  else if (selectedToken === token && !isCorrect) cls += ' bg-[#A8342A]/15 text-[#A8342A]';
                }
                return (
                  <span key={i} onClick={() => handleTokenClick(token)} className={cls}
                    role={exPhase === 'question' ? 'button' : undefined}
                    tabIndex={exPhase === 'question' ? 0 : undefined}
                    onKeyDown={(e) => e.key === 'Enter' && handleTokenClick(token)}>
                    {token}
                  </span>
                );
              })}
            </p>
            {exPhase === 'result' && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-2">
                <p className={`text-sm font-medium ${isCorrect ? 'text-[#1E5E3A]' : 'text-[#A8342A]'}`}>
                  {isCorrect ? '✓ Correct' : `✗ Le mot fautif était : ${exercise.faultyWord} → ${exercise.correction}`}
                </p>
                <p className="text-sm text-[#3D5A73] border-l-2 border-[#D4CFC6] pl-3">{exercise.explanation}</p>
              </motion.div>
            )}
          </div>
        )}
      </div>
    </motion.div>
  );
}

export function Rules() {
  const [stats, setStats] = useState<RuleStats[]>([]);
  const [categoryFilter, setCategoryFilter] = useState<RuleCategory | 'all'>('all');
  const [levelFilter, setLevelFilter] = useState<number | 'all'>('all');
  const [selectedRule, setSelectedRule] = useState<Rule | null>(null);

  useEffect(() => {
    getAllRuleStats().then(setStats);
  }, []);

  const statMap = new Map(stats.map((s) => [s.ruleId, s]));

  const filtered = RULES.filter((r) => {
    if (categoryFilter !== 'all' && r.category !== categoryFilter) return false;
    if (levelFilter !== 'all' && r.level !== levelFilter) return false;
    return true;
  });

  function getRate(ruleId: string): number | null {
    const s = statMap.get(ruleId);
    if (!s || s.attempts < 2) return null;
    return s.correct / s.attempts;
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
      className="max-w-5xl mx-auto px-4 py-8"
    >
      <h1 className="text-2xl text-[#0B1F3A] mb-6" style={{ fontFamily: 'Source Serif 4, Georgia, serif' }}>
        Règles
      </h1>

      {/* Filtres */}
      <div className="flex flex-wrap gap-2 mb-6">
        <select
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value as RuleCategory | 'all')}
          className="text-sm border border-[#D4CFC6] rounded px-3 py-1.5 bg-white text-[#0B1F3A] focus:outline-none focus:border-[#3D5A73]"
        >
          <option value="all">Toutes catégories</option>
          {RULE_CATEGORIES.map((c) => (
            <option key={c.value} value={c.value}>{c.label}</option>
          ))}
        </select>
        <select
          value={levelFilter}
          onChange={(e) => setLevelFilter(e.target.value === 'all' ? 'all' : Number(e.target.value))}
          className="text-sm border border-[#D4CFC6] rounded px-3 py-1.5 bg-white text-[#0B1F3A] focus:outline-none focus:border-[#3D5A73]"
        >
          <option value="all">Tous niveaux</option>
          {Array.from({ length: 10 }, (_, i) => i + 1).map((l) => (
            <option key={l} value={l}>Niveau {l}</option>
          ))}
        </select>
        <span className="text-xs text-[#3D5A73] self-center ml-1">{filtered.length} règle{filtered.length > 1 ? 's' : ''}</span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Liste */}
        <div className="space-y-2">
          {filtered.map((rule) => {
            const rate = getRate(rule.id);
            const isSelected = selectedRule?.id === rule.id;
            return (
              <button
                key={rule.id}
                onClick={() => setSelectedRule(isSelected ? null : rule)}
                className={`w-full text-left border rounded-lg px-4 py-3 transition-colors focus:outline-none focus:ring-2 focus:ring-[#3D5A73] ${
                  isSelected
                    ? 'border-[#0B1F3A] bg-[#0B1F3A]/5'
                    : 'border-[#D4CFC6] bg-white hover:border-[#3D5A73]'
                }`}
              >
                <div className="flex items-center justify-between gap-2">
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-[#0B1F3A] truncate">{rule.name}</p>
                    <p className="text-xs text-[#3D5A73] mt-0.5 truncate">{rule.shortDesc}</p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className="text-xs font-mono text-[#3D5A73]">niv.{rule.level}</span>
                    {rate !== null && (
                      <span className={`text-xs font-mono ${rate >= 0.8 ? 'text-[#1E5E3A]' : rate >= 0.5 ? 'text-[#9C7A2E]' : 'text-[#A8342A]'}`}>
                        {Math.round(rate * 100)}%
                      </span>
                    )}
                  </div>
                </div>
              </button>
            );
          })}
        </div>

        {/* Panneau règle */}
        <div className="lg:sticky lg:top-20 lg:self-start">
          <AnimatePresence mode="wait">
            {selectedRule ? (
              <RuleCardPanel key={selectedRule.id} rule={selectedRule} onClose={() => setSelectedRule(null)} />
            ) : (
              <motion.div
                key="empty"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="bg-white border border-dashed border-[#D4CFC6] rounded-lg p-8 text-center text-sm text-[#3D5A73]"
              >
                Sélectionner une règle pour afficher la fiche et générer des exercices.
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </motion.div>
  );
}
