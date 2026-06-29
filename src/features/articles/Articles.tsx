import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { explainPassage, generateArticleQuestions } from '../../lib/api';
import type { ArticleQuestions } from '../../lib/api';
import { Skeleton } from '../../components/Skeleton';

interface ArticleEntry {
  title: string;
  source: string;
  url: string;
  register: 'economique' | 'scientifique' | 'strategie';
  registerLabel: string;
  level: number;
  date: string;
  summary: string;
  excerpts: string[];
}

const CURATED_ARTICLES: ArticleEntry[] = [
  {
    title: `La désindustrialisation française : bilan et leviers de reconversion`,
    source: 'Les Échos',
    url: 'https://www.lesechos.fr',
    register: 'economique',
    registerLabel: 'économique',
    level: 6,
    date: '2024',
    summary: `L'industrie française représente aujourd'hui 10 % du PIB, contre 18 % en 1980. Cet article examine les causes structurelles de ce recul, les politiques publiques engagées depuis 2017, et les obstacles qui subsistent à toute politique de réindustrialisation ambitieuse.`,
    excerpts: [
      `La perte de compétitivité-coût ne saurait expliquer à elle seule l'érosion du tissu industriel : les défaillances en matière de formation, la fragmentation du tissu de sous-traitance et l'instabilité fiscale ont joué un rôle au moins aussi déterminant.`,
      `Les zones d'emploi les plus affectées présentent une structure sectorielle concentrée sur deux ou trois filières, ce qui amplifie les effets de chaque fermeture de site sur le marché local du travail.`,
    ],
  },
  {
    title: `L'intelligence artificielle générative en entreprise : promesses et limites organisationnelles`,
    source: 'La Tribune',
    url: 'https://www.latribune.fr',
    register: 'strategie',
    registerLabel: 'stratégie',
    level: 7,
    date: '2024',
    summary: `Après deux ans de déploiements pilotes, les entreprises constatent que l'adoption de l'IA générative bute moins sur des obstacles techniques que sur des résistances organisationnelles : gouvernance des données, repositionnement des métiers, et déficit de compétences d'interprétation des sorties du modèle.`,
    excerpts: [
      `La valeur produite par un modèle de langage ne se mesure pas à la qualité intrinsèque de ses sorties, mais à la capacité de l'organisation à formuler des requêtes pertinentes, à évaluer les réponses et à intégrer les résultats dans ses processus décisionnels.`,
      `Les directions qui ont obtenu les résultats les plus tangibles sont celles qui ont traité l'IA générative comme un outil d'augmentation de compétences existantes, non comme un substitut à des expertises absentes.`,
    ],
  },
  {
    title: `Plasticité synaptique et consolidation mémorielle : les mécanismes moléculaires`,
    source: 'CNRS Le Journal',
    url: 'https://lejournal.cnrs.fr',
    register: 'scientifique',
    registerLabel: 'scientifique',
    level: 8,
    date: '2024',
    summary: `Les recherches récentes sur la potentialisation à long terme (LTP) ont permis d'identifier les cascades de signalisation intracellulaire qui sous-tendent la consolidation synaptique. Cet article présente les principaux résultats obtenus sur modèles murins et discute leur portée pour la compréhension des déficits mnésiques humains.`,
    excerpts: [
      `La phosphorylation du récepteur AMPA par la kinase CaMKII constitue l'une des étapes initiales de la LTP ; elle entraîne l'insertion de nouveaux récepteurs dans la membrane postsynaptique et augmente ainsi la conductance de la synapse.`,
      `Les auteurs soulignent que la corrélation observée entre l'expression de la protéine Arc et la durée de la LTP ne permet pas de conclure à un lien de causalité sans un protocole de suppression sélective de l'expression génique.`,
    ],
  },
  {
    title: `Transition énergétique : le financement des infrastructures en question`,
    source: 'Alternatives Économiques',
    url: 'https://www.alternatives-economiques.fr',
    register: 'economique',
    registerLabel: 'économique',
    level: 5,
    date: '2024',
    summary: `Le déploiement des énergies renouvelables requiert des investissements en infrastructures de réseau que ni les opérateurs privés ni les finances publiques ne semblent en mesure d'assurer seuls. Cet article examine les différents modèles de financement mixte expérimentés en Europe.`,
    excerpts: [
      `Le réseau de transport d'électricité a été conçu pour acheminer une production centralisée vers des consommateurs diffus ; l'inversion partielle de cette logique, avec la multiplication des producteurs décentralisés, impose une refonte du dimensionnement des lignes et des postes de transformation.`,
      `Les mécanismes de garantie publique permettent d'abaisser le coût du capital pour les investisseurs privés, mais ils transfèrent une partie du risque sur le contribuable sans toujours que cette socialisation soit explicitement débattue.`,
    ],
  },
  {
    title: `Stratégies de croissance externe : ce que les études d'événements révèlent`,
    source: 'Le Monde',
    url: 'https://www.lemonde.fr',
    register: 'strategie',
    registerLabel: 'stratégie',
    level: 9,
    date: '2024',
    summary: `Quarante ans d'études d'événements sur les fusions-acquisitions aboutissent à un résultat robuste : en moyenne, les acquéreurs détruisent de la valeur pour leurs actionnaires. Cet article discute les biais méthodologiques qui peuvent nuancer ce constat et les conditions dans lesquelles certaines acquisitions créent de la valeur.`,
    excerpts: [
      `L'excédent de confiance des équipes dirigeantes dans leur capacité à réaliser les synergies annoncées constitue l'explication comportementale la plus solidement étayée de la prime d'acquisition excessive.`,
      `Les acquisitions réalisées en bas de cycle, avec un ratio prix/bénéfices de la cible inférieur à la médiane sectorielle, présentent une probabilité de création de valeur significativement supérieure à celles réalisées lors de périodes d'euphorie boursière.`,
    ],
  },
];

const REGISTER_COLORS: Record<string, string> = {
  economique: '#3D5A73',
  scientifique: '#1E5E3A',
  strategie: '#9C7A2E',
};

export function Articles() {
  const [selected, setSelected] = useState<ArticleEntry | null>(null);
  const [explanation, setExplanation] = useState<{ passage: string; text: string } | null>(null);
  const [loadingExpl, setLoadingExpl] = useState(false);
  const [questions, setQuestions] = useState<ArticleQuestions | null>(null);
  const [loadingQ, setLoadingQ] = useState(false);
  const [qError, setQError] = useState('');
  const [registerFilter, setRegisterFilter] = useState<string>('all');
  const [levelFilter, setLevelFilter] = useState<number | 'all'>('all');

  async function handlePassageClick(passage: string) {
    if (!selected) return;
    setLoadingExpl(true);
    setExplanation(null);
    try {
      const result = await explainPassage(passage, `Article : "${selected.title}", source : ${selected.source}`);
      setExplanation({ passage, text: result.explanation });
    } catch {
      setExplanation({ passage, text: 'Explication non disponible. Réessayer.' });
    } finally {
      setLoadingExpl(false);
    }
  }

  async function loadQuestions() {
    if (!selected) return;
    setLoadingQ(true);
    setQError('');
    try {
      const q = await generateArticleQuestions(selected.summary, selected.title);
      setQuestions(q);
    } catch (e) {
      setQError(e instanceof Error ? e.message : 'Erreur de génération.');
    } finally {
      setLoadingQ(false);
    }
  }

  const filtered = CURATED_ARTICLES.filter((a) => {
    if (registerFilter !== 'all' && a.register !== registerFilter) return false;
    if (levelFilter !== 'all' && a.level !== levelFilter) return false;
    return true;
  });

  if (selected) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-3xl mx-auto px-4 py-8 space-y-6"
      >
        <button
          onClick={() => { setSelected(null); setExplanation(null); setQuestions(null); }}
          className="text-sm text-[#3D5A73] hover:text-[#0B1F3A] flex items-center gap-1"
        >
          ← Retour aux articles
        </button>

        <div>
          <div className="flex items-center gap-2 mb-2">
            <span
              className="text-xs px-2 py-0.5 rounded font-medium text-white"
              style={{ backgroundColor: REGISTER_COLORS[selected.register] }}
            >
              {selected.registerLabel}
            </span>
            <span className="text-xs font-mono text-[#3D5A73]">niv. {selected.level}/10</span>
            <span className="text-xs text-[#3D5A73]">{selected.source} · {selected.date}</span>
          </div>
          <h1 className="text-2xl text-[#0B1F3A]" style={{ fontFamily: 'Source Serif 4, Georgia, serif' }}>
            {selected.title}
          </h1>
          <a
            href={selected.url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-[#3D5A73] underline mt-1 inline-block hover:text-[#0B1F3A]"
          >
            Lire l&apos;article complet sur {selected.source} ↗
          </a>
        </div>

        <div className="bg-white border border-[#D4CFC6] rounded-lg p-5">
          <p className="text-xs text-[#3D5A73] uppercase tracking-wide mb-2 font-semibold">Résumé factuel</p>
          <p className="text-sm leading-relaxed text-[#0B1F3A]">{selected.summary}</p>
        </div>

        <div className="bg-white border border-[#D4CFC6] rounded-lg p-5 space-y-3">
          <p className="text-xs text-[#3D5A73] uppercase tracking-wide font-semibold">
            Extraits — cliquer sur un passage pour analyser
          </p>
          {selected.excerpts.map((excerpt, i) => (
            <button
              key={i}
              onClick={() => handlePassageClick(excerpt)}
              className="w-full text-left text-sm leading-relaxed text-[#0B1F3A] p-3 rounded border border-[#D4CFC6] hover:border-[#3D5A73] hover:bg-[#F7F5F0] transition-colors focus:outline-none focus:ring-2 focus:ring-[#3D5A73]"
              style={{ fontFamily: 'Source Serif 4, Georgia, serif' }}
            >
              « {excerpt} »
            </button>
          ))}
        </div>

        <AnimatePresence>
          {(loadingExpl || explanation) && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="bg-[#F7F5F0] border border-[#D4CFC6] rounded-lg p-5"
            >
              {loadingExpl ? (
                <div className="space-y-2">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-4/5" />
                </div>
              ) : explanation ? (
                <div>
                  <p className="text-xs text-[#3D5A73] uppercase tracking-wide mb-2 font-semibold">Analyse du passage</p>
                  <p className="text-xs text-[#3D5A73] italic mb-2">« {explanation.passage} »</p>
                  <p className="text-sm leading-relaxed text-[#0B1F3A]">{explanation.text}</p>
                </div>
              ) : null}
            </motion.div>
          )}
        </AnimatePresence>

        <div className="bg-white border border-[#D4CFC6] rounded-lg p-5">
          <div className="flex items-center justify-between mb-3">
            <p className="text-xs text-[#3D5A73] uppercase tracking-wide font-semibold">Questions d&apos;exploitation</p>
            {!questions && (
              <button
                onClick={loadQuestions}
                disabled={loadingQ}
                className="text-xs border border-[#D4CFC6] px-3 py-1 rounded text-[#3D5A73] hover:border-[#3D5A73] transition-colors disabled:opacity-40"
              >
                {loadingQ ? 'Génération…' : 'Générer les questions'}
              </button>
            )}
          </div>
          {qError && <p className="text-sm text-[#A8342A]">{qError}</p>}
          {loadingQ && (
            <div className="space-y-2">
              {[1,2,3].map(i => <Skeleton key={i} className="h-10 w-full" />)}
            </div>
          )}
          {questions && (
            <div className="space-y-4">
              {questions.questions.map((q, i) => (
                <QuestionItem key={i} index={i + 1} question={q.question} answer={q.answer} />
              ))}
            </div>
          )}
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-5xl mx-auto px-4 py-8"
    >
      <h1 className="text-2xl text-[#0B1F3A] mb-2" style={{ fontFamily: 'Source Serif 4, Georgia, serif' }}>
        Articles
      </h1>
      <p className="text-sm text-[#3D5A73] mb-6 leading-relaxed">
        Sélection de textes de référence pour travailler l&apos;exposition à un français de qualité.
        Chaque article propose des extraits analysables et des questions sur le vocabulaire et les constructions syntaxiques.
      </p>

      <div className="flex flex-wrap gap-2 mb-6">
        <select
          value={registerFilter}
          onChange={(e) => setRegisterFilter(e.target.value)}
          className="text-sm border border-[#D4CFC6] rounded px-3 py-1.5 bg-white text-[#0B1F3A] focus:outline-none focus:border-[#3D5A73]"
        >
          <option value="all">Tous registres</option>
          <option value="economique">Économique</option>
          <option value="scientifique">Scientifique</option>
          <option value="strategie">Stratégie</option>
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
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {filtered.map((article, i) => (
          <button
            key={i}
            onClick={() => { setSelected(article); setExplanation(null); setQuestions(null); }}
            className="text-left bg-white border border-[#D4CFC6] rounded-lg p-5 hover:border-[#3D5A73] transition-colors focus:outline-none focus:ring-2 focus:ring-[#3D5A73] space-y-2"
          >
            <div className="flex items-center gap-2">
              <span
                className="text-xs px-2 py-0.5 rounded font-medium text-white"
                style={{ backgroundColor: REGISTER_COLORS[article.register] }}
              >
                {article.registerLabel}
              </span>
              <span className="text-xs font-mono text-[#3D5A73]">niv. {article.level}</span>
            </div>
            <h2 className="text-sm font-semibold text-[#0B1F3A] leading-snug" style={{ fontFamily: 'Source Serif 4, Georgia, serif' }}>
              {article.title}
            </h2>
            <p className="text-xs text-[#3D5A73]">{article.source} · {article.date}</p>
            <p className="text-xs text-[#3D5A73] leading-relaxed line-clamp-3">{article.summary}</p>
          </button>
        ))}
      </div>
    </motion.div>
  );
}

function QuestionItem({ index, question, answer }: { index: number; question: string; answer: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border border-[#D4CFC6] rounded p-3 space-y-2">
      <p className="text-sm text-[#0B1F3A]">
        <span className="font-mono text-xs text-[#3D5A73] mr-2">{index}.</span>
        {question}
      </p>
      <button
        onClick={() => setOpen(!open)}
        className="text-xs text-[#3D5A73] underline hover:text-[#0B1F3A]"
      >
        {open ? 'Masquer la réponse' : 'Voir la réponse'}
      </button>
      {open && (
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-sm text-[#1E5E3A] border-l-2 border-[#1E5E3A]/30 pl-3"
        >
          {answer}
        </motion.p>
      )}
    </div>
  );
}
