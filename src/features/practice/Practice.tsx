import { useState, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { getAllRuleStats, recordAttempt } from '../../lib/storage';
import { selectNextRule, computeCurrentLevel } from '../../lib/spaced-repetition';
import { generateExercise } from '../../lib/api';
import type { ExerciseItem } from '../../lib/api';
import type { Rule } from '../../data/rules';
import { ExerciseSkeleton } from '../../components/Skeleton';

type Mode = 'click' | 'write';
type Phase = 'question' | 'result';

function tokenize(sentence: string): string[] {
  return sentence.match(/\S+|\s+/g) ?? [];
}

export function Practice() {
  const [rule, setRule] = useState<Rule | null>(null);
  const [exercise, setExercise] = useState<ExerciseItem | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [mode, setMode] = useState<Mode>('click');
  const [phase, setPhase] = useState<Phase>('question');
  const [selectedToken, setSelectedToken] = useState('');
  const [writtenAnswer, setWrittenAnswer] = useState('');
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [streak, setStreak] = useState(0);

  const loadNext = useCallback(async () => {
    setLoading(true);
    setError('');
    setPhase('question');
    setSelectedToken('');
    setWrittenAnswer('');
    setIsCorrect(null);
    setExercise(null);

    try {
      const stats = await getAllRuleStats();
      const level = computeCurrentLevel(stats);
      const nextRule = selectNextRule({ stats, currentLevel: level });
      setRule(nextRule);
      const ex = await generateExercise(nextRule);
      setExercise(ex);
      setMode(Math.random() < 0.6 ? 'click' : 'write');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Erreur inattendue. Réessayer.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadNext(); }, [loadNext]);

  async function handleTokenClick(token: string) {
    if (!exercise || !rule || phase === 'result') return;
    const correct = token.trim().toLowerCase() === exercise.faultyWord.trim().toLowerCase();
    setSelectedToken(token);
    setIsCorrect(correct);
    setPhase('result');
    setStreak(s => correct ? s + 1 : 0);
    await recordAttempt({ ruleId: rule.id, correct, timestamp: Date.now() });
  }

  async function handleWriteSubmit() {
    if (!exercise || !rule || !writtenAnswer.trim()) return;
    // Simple check: answer contains the correction
    const correct = writtenAnswer.toLowerCase().includes(exercise.correction.toLowerCase());
    setIsCorrect(correct);
    setPhase('result');
    setStreak(s => correct ? s + 1 : 0);
    await recordAttempt({ ruleId: rule.id, correct, timestamp: Date.now() });
  }

  const tokens = exercise ? tokenize(exercise.sentence) : [];

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
      className="max-w-3xl mx-auto px-4 py-8"
    >
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl text-[#0B1F3A]" style={{ fontFamily: 'Source Serif 4, Georgia, serif' }}>
          Entraînement
        </h1>
        {streak > 1 && (
          <div className="text-sm font-mono text-[#1E5E3A] bg-[#1E5E3A]/10 px-3 py-1 rounded-full">
            {streak} consécutifs
          </div>
        )}
      </div>

      {rule && (
        <div className="text-xs text-[#3D5A73] mb-4 flex items-center gap-2">
          <span className="bg-[#0B1F3A]/10 px-2 py-0.5 rounded font-medium text-[#0B1F3A]">{rule.category}</span>
          <span>niv. {rule.level}/10</span>
          <span className="font-medium">{rule.name}</span>
        </div>
      )}

      <div className="bg-white border border-[#D4CFC6] rounded-lg p-6 shadow-sm min-h-[200px]">
        {loading && <ExerciseSkeleton />}

        {error && !loading && (
          <div className="space-y-3">
            <p className="text-sm text-[#A8342A]">{error}</p>
            <button
              onClick={loadNext}
              className="text-sm text-[#3D5A73] underline hover:text-[#0B1F3A]"
            >
              Réessayer
            </button>
          </div>
        )}

        {exercise && !loading && (
          <AnimatePresence mode="wait">
            <motion.div
              key={exercise.sentence}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15 }}
            >
              {mode === 'click' ? (
                <div>
                  <p className="text-xs text-[#3D5A73] uppercase tracking-wide mb-3">
                    Cliquez sur le mot fautif
                  </p>
                  <p className="text-lg leading-relaxed" style={{ fontFamily: 'Source Serif 4, Georgia, serif' }}>
                    {tokens.map((token, i) => {
                      if (/^\s+$/.test(token)) return <span key={i}>{token}</span>;
                      const isSelected = selectedToken === token;
                      const isTarget = token.trim().toLowerCase() === exercise.faultyWord.trim().toLowerCase();
                      let cls = 'cursor-pointer px-0.5 rounded transition-colors hover:bg-[#0B1F3A]/10';
                      if (phase === 'result') {
                        if (isTarget) cls += ' bg-[#1E5E3A]/15 text-[#1E5E3A] font-semibold';
                        else if (isSelected && !isCorrect) cls += ' bg-[#A8342A]/15 text-[#A8342A]';
                      }
                      return (
                        <span
                          key={i}
                          onClick={() => handleTokenClick(token)}
                          className={cls}
                          role={phase === 'question' ? 'button' : undefined}
                          tabIndex={phase === 'question' ? 0 : undefined}
                          onKeyDown={(e) => e.key === 'Enter' && handleTokenClick(token)}
                        >
                          {token}
                        </span>
                      );
                    })}
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  <p className="text-xs text-[#3D5A73] uppercase tracking-wide">Identifiez et expliquez l'erreur</p>
                  <p className="text-lg leading-relaxed" style={{ fontFamily: 'Source Serif 4, Georgia, serif' }}>
                    {exercise.sentence}
                  </p>
                  {phase === 'question' && (
                    <div className="space-y-2 pt-2">
                      <textarea
                        value={writtenAnswer}
                        onChange={(e) => setWrittenAnswer(e.target.value)}
                        placeholder="Identifiez le mot fautif et expliquez la règle…"
                        rows={3}
                        className="w-full border border-[#D4CFC6] rounded px-3 py-2 text-sm text-[#0B1F3A] focus:outline-none focus:border-[#3D5A73] resize-none bg-[#F7F5F0]"
                      />
                      <button
                        onClick={handleWriteSubmit}
                        disabled={!writtenAnswer.trim()}
                        className="bg-[#0B1F3A] text-white text-sm px-4 py-2 rounded hover:bg-[#1a3556] disabled:opacity-40 transition-colors"
                      >
                        Valider
                      </button>
                    </div>
                  )}
                </div>
              )}

              {phase === 'result' && (
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-5 space-y-3"
                >
                  <div className={`flex items-center gap-2 text-sm font-medium ${isCorrect ? 'text-[#1E5E3A]' : 'text-[#A8342A]'}`}>
                    <span>{isCorrect ? '✓ Correct' : '✗ Incorrect'}</span>
                    {!isCorrect && (
                      <span className="text-[#0B1F3A] font-normal">
                        Le mot fautif était : <em>{exercise.faultyWord}</em> → <strong>{exercise.correction}</strong>
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-[#3D5A73] leading-relaxed border-l-2 border-[#D4CFC6] pl-3">
                    {exercise.explanation}
                  </p>
                  <button
                    onClick={loadNext}
                    className="mt-2 bg-[#0B1F3A] text-white text-sm px-5 py-2.5 rounded hover:bg-[#1a3556] transition-colors focus:outline-none focus:ring-2 focus:ring-[#3D5A73] focus:ring-offset-2"
                  >
                    Exercice suivant
                  </button>
                </motion.div>
              )}
            </motion.div>
          </AnimatePresence>
        )}
      </div>
    </motion.div>
  );
}
