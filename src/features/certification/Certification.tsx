import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { generateExercise } from '../../lib/api';
import type { ExerciseItem } from '../../lib/api';
import { RULES } from '../../data/rules';
import { saveCertification, getCertifications } from '../../lib/storage';
import type { CertificationResult } from '../../lib/storage';
import { Skeleton } from '../../components/Skeleton';

const TOTAL_QUESTIONS = 80;
const DURATION_SECONDS = 50 * 60; // 50 minutes
const MAX_SCORE = 1000;

function getMention(score: number): string {
  if (score >= 900) return 'Excellence';
  if (score >= 750) return 'Très bien';
  if (score >= 600) return 'Bien';
  if (score >= 450) return 'Passable';
  return 'Non certifié';
}

function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60).toString().padStart(2, '0');
  const s = (seconds % 60).toString().padStart(2, '0');
  return `${m}:${s}`;
}

function generateCertId(): string {
  return `STR-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).slice(2, 5).toUpperCase()}`;
}

type CertPhase = 'intro' | 'loading' | 'exam' | 'result';

export function Certification() {
  const [phase, setPhase] = useState<CertPhase>('intro');
  const [questions, setQuestions] = useState<Array<{ item: ExerciseItem; rule: typeof RULES[0] }>>([]);
  const [current, setCurrent] = useState(0);
  const [answers, setAnswers] = useState<boolean[]>([]);
  const [timeLeft, setTimeLeft] = useState(DURATION_SECONDS);
  const [selectedToken, setSelectedToken] = useState('');
  const [answered, setAnswered] = useState(false);
  const [certResult, setCertResult] = useState<CertificationResult | null>(null);
  const [history, setHistory] = useState<CertificationResult[]>([]);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    getCertifications().then(setHistory);
  }, []);

  useEffect(() => {
    if (phase === 'exam') {
      timerRef.current = setInterval(() => {
        setTimeLeft((t) => {
          if (t <= 1) { finishExam(); return 0; }
          return t - 1;
        });
      }, 1000);
    }
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [phase]);

  async function startExam() {
    setPhase('loading');
    // Select 8 questions per level
    const allRules = [...RULES].sort(() => Math.random() - 0.5);
    const selected: typeof RULES = [];
    for (let lvl = 1; lvl <= 10; lvl++) {
      const atLevel = allRules.filter((r) => r.level === lvl).slice(0, 8);
      selected.push(...atLevel);
    }
    // Fill up to TOTAL_QUESTIONS if needed
    while (selected.length < TOTAL_QUESTIONS) {
      const r = allRules[Math.floor(Math.random() * allRules.length)];
      if (!selected.find(s => s.id === r.id)) selected.push(r);
    }
    const finalRules = selected.slice(0, TOTAL_QUESTIONS);

    const items: Array<{ item: ExerciseItem; rule: typeof RULES[0] }> = [];
    // Generate in batches of 5 to avoid rate limits
    for (let i = 0; i < finalRules.length; i++) {
      try {
        const item = await generateExercise(finalRules[i]);
        items.push({ item, rule: finalRules[i] });
      } catch {
        // Skip on error
      }
    }

    setQuestions(items);
    setAnswers([]);
    setCurrent(0);
    setTimeLeft(DURATION_SECONDS);
    setSelectedToken('');
    setAnswered(false);
    setPhase('exam');
  }

  function handleTokenClick(token: string) {
    if (answered || !questions[current]) return;
    const { item } = questions[current];
    const correct = token.trim().toLowerCase() === item.faultyWord.trim().toLowerCase();
    setSelectedToken(token);
    setAnswered(true);
    setAnswers((prev) => [...prev, correct]);
  }

  function nextQuestion() {
    if (current + 1 >= questions.length) {
      finishExam();
    } else {
      setCurrent((c) => c + 1);
      setSelectedToken('');
      setAnswered(false);
    }
  }

  function finishExam() {
    if (timerRef.current) clearInterval(timerRef.current);
    const correct = answers.filter(Boolean).length;
    const score = Math.round((correct / TOTAL_QUESTIONS) * MAX_SCORE);
    const mention = getMention(score);
    const elapsed = DURATION_SECONDS - timeLeft;
    const result: CertificationResult = {
      id: generateCertId(),
      date: Date.now(),
      score,
      totalQuestions: TOTAL_QUESTIONS,
      durationSeconds: elapsed,
      mention,
    };
    setCertResult(result);
    saveCertification(result).then(() => getCertifications().then(setHistory));
    setPhase('result');
  }

  if (phase === 'intro') {
    return (
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-3xl mx-auto px-4 py-8 space-y-6"
      >
        <h1 className="text-2xl text-[#0B1F3A]" style={{ fontFamily: 'Source Serif 4, Georgia, serif' }}>
          Certification
        </h1>
        <div className="bg-white border border-[#D4CFC6] rounded-lg p-6 space-y-4">
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <div className="text-2xl font-mono text-[#0B1F3A]">{TOTAL_QUESTIONS}</div>
              <div className="text-xs text-[#3D5A73]">questions</div>
            </div>
            <div>
              <div className="text-2xl font-mono text-[#0B1F3A]">50</div>
              <div className="text-xs text-[#3D5A73]">minutes</div>
            </div>
            <div>
              <div className="text-2xl font-mono text-[#0B1F3A]">{MAX_SCORE}</div>
              <div className="text-xs text-[#3D5A73]">points</div>
            </div>
          </div>
          <div className="border-t border-[#D4CFC6] pt-4 space-y-2 text-sm text-[#3D5A73]">
            <p>L'examen couvre les 10 niveaux, 8 questions par niveau.</p>
            <p>Le chronomètre démarre dès le chargement des questions. Les résultats de cet examen n'alimentent pas l'historique d'entraînement.</p>
            <p className="font-medium text-[#0B1F3A]">Mentions : Excellence (900+) · Très bien (750+) · Bien (600+) · Passable (450+)</p>
          </div>
          <button
            onClick={startExam}
            className="w-full bg-[#0B1F3A] text-white text-sm font-medium rounded px-4 py-3 hover:bg-[#1a3556] transition-colors focus:outline-none focus:ring-2 focus:ring-[#3D5A73] focus:ring-offset-2"
          >
            Démarrer l'examen
          </button>
        </div>

        {history.length > 0 && (
          <div className="bg-white border border-[#D4CFC6] rounded-lg p-5">
            <h2 className="text-sm font-semibold text-[#0B1F3A] uppercase tracking-wide mb-3">Historique</h2>
            <div className="space-y-2">
              {history.slice(-5).reverse().map((h) => (
                <div key={h.id} className="flex items-center justify-between text-sm">
                  <span className="font-mono text-xs text-[#3D5A73]">{h.id}</span>
                  <span className="font-mono text-[#0B1F3A]">{h.score}/{MAX_SCORE}</span>
                  <span className={`text-xs font-medium ${h.mention === 'Excellence' || h.mention === 'Très bien' ? 'text-[#9C7A2E]' : 'text-[#3D5A73]'}`}>
                    {h.mention}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </motion.div>
    );
  }

  if (phase === 'loading') {
    return (
      <div className="max-w-3xl mx-auto px-4 py-8 space-y-4">
        <p className="text-sm text-[#3D5A73]">Préparation de l'examen ({TOTAL_QUESTIONS} questions)…</p>
        <div className="space-y-3">
          {[1,2,3,4].map(i => <Skeleton key={i} className="h-16 w-full" />)}
        </div>
      </div>
    );
  }

  if (phase === 'exam' && questions[current]) {
    const { item, rule } = questions[current];
    const tokens = item.sentence.match(/\S+|\s+/g) ?? [];
    const progress = Math.round((current / TOTAL_QUESTIONS) * 100);
    const isRunningOut = timeLeft < 300;

    return (
      <div className="max-w-3xl mx-auto px-4 py-8 space-y-5">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="text-sm text-[#3D5A73]">
            <span className="font-mono text-[#0B1F3A] font-medium">{current + 1}</span>/{TOTAL_QUESTIONS}
          </div>
          <div className={`font-mono text-lg font-medium ${isRunningOut ? 'text-[#A8342A]' : 'text-[#0B1F3A]'}`}>
            {formatTime(timeLeft)}
          </div>
          <div className="text-sm font-mono text-[#1E5E3A]">
            {answers.filter(Boolean).length} correct{answers.filter(Boolean).length > 1 ? 's' : ''}
          </div>
        </div>

        {/* Progress bar */}
        <div className="bg-[#D4CFC6] rounded-full h-1">
          <div className="bg-[#0B1F3A] h-full rounded-full transition-all" style={{ width: `${progress}%` }} />
        </div>

        <div className="bg-white border border-[#D4CFC6] rounded-lg p-6 space-y-4">
          <div className="flex items-center gap-2">
            <span className="text-xs bg-[#0B1F3A]/10 text-[#0B1F3A] px-2 py-0.5 rounded font-medium">{rule.category}</span>
            <span className="text-xs text-[#3D5A73]">niv. {rule.level}</span>
          </div>
          <p className="text-xs text-[#3D5A73] uppercase tracking-wide">Cliquez sur le mot fautif</p>
          <p className="text-xl leading-relaxed" style={{ fontFamily: 'Source Serif 4, Georgia, serif' }}>
            {tokens.map((token, i) => {
              if (/^\s+$/.test(token)) return <span key={i}>{token}</span>;
              const isTarget = token.trim().toLowerCase() === item.faultyWord.trim().toLowerCase();
              const isSelected = selectedToken === token;
              let cls = 'px-0.5 rounded transition-colors';
              if (!answered) cls += ' cursor-pointer hover:bg-[#0B1F3A]/10';
              if (answered) {
                if (isTarget) cls += ' bg-[#1E5E3A]/15 text-[#1E5E3A] font-semibold';
                else if (isSelected && !answers[answers.length - 1]) cls += ' bg-[#A8342A]/15 text-[#A8342A]';
              }
              return (
                <span
                  key={i}
                  onClick={() => handleTokenClick(token)}
                  className={cls}
                  role={!answered ? 'button' : undefined}
                  tabIndex={!answered ? 0 : undefined}
                  onKeyDown={(e) => !answered && e.key === 'Enter' && handleTokenClick(token)}
                >
                  {token}
                </span>
              );
            })}
          </p>

          {answered && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-2">
              <p className={`text-sm font-medium ${answers[answers.length - 1] ? 'text-[#1E5E3A]' : 'text-[#A8342A]'}`}>
                {answers[answers.length - 1] ? '✓' : `✗ ${item.faultyWord} → ${item.correction}`}
              </p>
              <p className="text-sm text-[#3D5A73] border-l-2 border-[#D4CFC6] pl-3 text-xs">{item.explanation}</p>
              <button
                onClick={nextQuestion}
                className="bg-[#0B1F3A] text-white text-sm px-5 py-2.5 rounded hover:bg-[#1a3556] transition-colors"
              >
                {current + 1 < questions.length ? 'Question suivante' : 'Terminer'}
              </button>
            </motion.div>
          )}
        </div>
      </div>
    );
  }

  if (phase === 'result' && certResult) {
    const isSuccess = certResult.mention !== 'Non certifié';
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.97 }}
        animate={{ opacity: 1, scale: 1 }}
        className="max-w-2xl mx-auto px-4 py-8 space-y-6"
      >
        {/* Diplôme */}
        <div className="bg-white border-2 border-[#D4CFC6] rounded-xl p-8 text-center space-y-4 shadow-sm relative overflow-hidden">
          {isSuccess && (
            <div className="absolute top-0 right-0 w-32 h-32 bg-[#9C7A2E]/5 rounded-full -translate-y-12 translate-x-12" />
          )}
          <p className="text-xs text-[#3D5A73] uppercase tracking-widest font-medium">Certificat Stratège</p>
          <h1 className="text-4xl font-mono text-[#0B1F3A]">{certResult.score}<span className="text-xl text-[#3D5A73]">/{MAX_SCORE}</span></h1>
          <p
            className="text-2xl font-semibold"
            style={{
              fontFamily: 'Source Serif 4, Georgia, serif',
              color: isSuccess ? '#9C7A2E' : '#A8342A',
            }}
          >
            {certResult.mention}
          </p>
          <p className="text-sm text-[#3D5A73]">
            {answers.filter(Boolean).length} réponses correctes sur {TOTAL_QUESTIONS} · {formatTime(certResult.durationSeconds)}
          </p>
          <p className="text-xs font-mono text-[#D4CFC6] mt-2">{certResult.id}</p>
        </div>

        {/* Détail */}
        <div className="bg-white border border-[#D4CFC6] rounded-lg p-5 space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-[#3D5A73]">Questions correctes</span>
            <span className="font-mono text-[#0B1F3A]">{answers.filter(Boolean).length}/{TOTAL_QUESTIONS}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-[#3D5A73]">Taux de réussite</span>
            <span className="font-mono text-[#0B1F3A]">{Math.round((answers.filter(Boolean).length / TOTAL_QUESTIONS) * 100)}%</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-[#3D5A73]">Durée</span>
            <span className="font-mono text-[#0B1F3A]">{formatTime(certResult.durationSeconds)}</span>
          </div>
        </div>

        <button
          onClick={() => { setCertResult(null); setPhase('intro'); }}
          className="w-full border border-[#D4CFC6] text-[#0B1F3A] text-sm px-4 py-2.5 rounded hover:border-[#3D5A73] transition-colors"
        >
          Revenir à l'accueil
        </button>
      </motion.div>
    );
  }

  return null;
}
