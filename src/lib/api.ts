import { getApiKey } from './storage';
import type { Rule } from '../data/rules';

const CLAUDE_API_URL = 'https://api.anthropic.com/v1/messages';
const MODEL = 'claude-sonnet-4-6';

async function callClaude(systemPrompt: string, userMessage: string): Promise<string> {
  const key = await getApiKey();
  if (!key) throw new Error("Clé API manquante. Configurer la clé dans les paramètres.");

  const response = await fetch(CLAUDE_API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': key,
      'anthropic-version': '2023-06-01',
      'anthropic-dangerous-direct-browser-access': 'true',
    },
    body: JSON.stringify({
      model: MODEL,
      max_tokens: 1200,
      system: systemPrompt,
      messages: [{ role: 'user', content: userMessage }],
    }),
  });

  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error((err as { error?: { message?: string } }).error?.message ?? `Erreur API (${response.status})`);
  }

  const data = await response.json() as { content: Array<{ type: string; text: string }> };
  return data.content.find((c) => c.type === 'text')?.text ?? '';
}

const STYLE_SYSTEM = `Tu rédiges en français soutenu, voix active, phrases variées en longueur.
Interdictions strictes : tirets cadratins, adverbes parasites (notamment, fondamentalement, essentiellement, véritablement, réellement, clairement, simplement, naturellement, effectivement, absolument), mots de dramatisation non chiffrés (crucial, incontournable, révolutionnaire), truismes généraux, personnification de concepts, nominalisation superflue, listes à puces à sous-titres gras par défaut.
Spécificité obligatoire : toute affirmation vague se remplace par un fait précis ou se supprime.`;

export interface ExerciseItem {
  sentence: string;
  faultyWord: string;
  correction: string;
  explanation: string;
}

export async function generateExercise(rule: Rule): Promise<ExerciseItem> {
  const system = `${STYLE_SYSTEM}
Tu génères des exercices de français professionnel pour un francophone natif visant l'excellence rédactionnelle (presse économique, rédaction scientifique, conseil en stratégie).`;

  const user = `Génère un exercice sur la règle suivante : "${rule.name}" (${rule.shortDesc}).

Produis un objet JSON avec ces champs :
- sentence : une phrase avec une erreur unique sur cette règle (registre économique, scientifique ou stratégique, niveau ${rule.level}/10). La phrase doit être réaliste, pas artificielle.
- faultyWord : le mot ou groupe de mots fautif (tel qu'il apparaît dans la phrase).
- correction : le remplacement correct.
- explanation : une explication concise (deux phrases maximum) de la règle appliquée à ce cas précis.

Réponds uniquement avec le JSON, sans balise de code.`;

  const text = await callClaude(system, user);
  try {
    return JSON.parse(text.trim()) as ExerciseItem;
  } catch {
    throw new Error("Réponse de l'API non valide. Réessayer.");
  }
}

export interface RuleCard {
  explanation: string;
  pitfalls: string[];
  examples: Array<{ incorrect: string; correct: string; comment: string }>;
}

export async function generateRuleCard(rule: Rule): Promise<RuleCard> {
  const system = `${STYLE_SYSTEM}
Tu rédiges des fiches pédagogiques de grammaire et de style français pour un francophone natif de haut niveau.`;

  const user = `Rédige une fiche pour la règle "${rule.name}".

Produis un objet JSON :
- explanation : explication de la règle et de sa logique (trois à cinq phrases, prose continue, pas de liste).
- pitfalls : tableau de deux à trois formulations courtes décrivant les pièges fréquents.
- examples : tableau de deux objets { incorrect, correct, comment } montrant la règle en contexte (registre économique, scientifique ou stratégique).

Réponds uniquement avec le JSON, sans balise de code.`;

  const text = await callClaude(system, user);
  try {
    return JSON.parse(text.trim()) as RuleCard;
  } catch {
    throw new Error("Réponse de l'API non valide. Réessayer.");
  }
}

export interface ExplanationResult {
  explanation: string;
}

export async function explainPassage(passage: string, context: string): Promise<ExplanationResult> {
  const system = `${STYLE_SYSTEM}
Tu expliques des tournures, termes techniques ou constructions syntaxiques remarquables à un lecteur cultivé.`;

  const user = `Passage sélectionné dans un article : "${passage}"
Contexte : ${context}

Explique en deux à quatre phrases la tournure, le terme ou la construction remarquable dans ce passage. Précise sa valeur stylistique ou sémantique dans ce contexte.

Réponds uniquement avec un objet JSON { explanation: "..." }, sans balise de code.`;

  const text = await callClaude(system, user);
  try {
    return JSON.parse(text.trim()) as ExplanationResult;
  } catch {
    return { explanation: text.trim() };
  }
}

export interface ArticleQuestions {
  questions: Array<{ question: string; answer: string }>;
}

export async function generateArticleQuestions(summary: string, title: string): Promise<ArticleQuestions> {
  const system = `${STYLE_SYSTEM}
Tu génères des questions d'exploitation linguistique et stylistique sur des articles de presse ou de recherche.`;

  const user = `Article : "${title}"
Résumé : ${summary}

Génère trois à cinq questions portant sur le vocabulaire, les tournures syntaxiques ou les registres rencontrés dans cet article. Chaque question doit demander au lecteur de réfléchir à un choix d'écriture précis, pas au fond du sujet.

Produis un objet JSON { questions: [ { question, answer }, ... ] }, sans balise de code.`;

  const text = await callClaude(system, user);
  try {
    return JSON.parse(text.trim()) as ArticleQuestions;
  } catch {
    throw new Error("Réponse de l'API non valide. Réessayer.");
  }
}

export interface WritingEvaluation {
  isCorrect: boolean;
  feedback: string;
  score: number;
}

export async function evaluateWrittenAnswer(
  rule: Rule,
  prompt: string,
  userAnswer: string,
): Promise<WritingEvaluation> {
  const system = `${STYLE_SYSTEM}
Tu évalues des réponses écrites sur des règles de grammaire et de style français, avec rigueur et précision.`;

  const user = `Règle évaluée : "${rule.name}" (${rule.shortDesc}).
Consigne donnée : "${prompt}"
Réponse de l'utilisateur : "${userAnswer}"

Évalue la réponse. Produis un objet JSON :
- isCorrect : true si la réponse est substantiellement correcte.
- feedback : deux à trois phrases de retour précis sur ce qui est juste ou faux, sans formule de politesse ni encouragement générique.
- score : note entière de 0 à 10.

Réponds uniquement avec le JSON, sans balise de code.`;

  const text = await callClaude(system, user);
  try {
    return JSON.parse(text.trim()) as WritingEvaluation;
  } catch {
    throw new Error("Réponse de l'API non valide. Réessayer.");
  }
}
