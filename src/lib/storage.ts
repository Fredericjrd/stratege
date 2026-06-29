import localforage from 'localforage';

localforage.config({
  name: 'stratege',
  storeName: 'app_data',
});

const apiKeyStore = localforage.createInstance({ name: 'stratege', storeName: 'config' });
const progressStore = localforage.createInstance({ name: 'stratege', storeName: 'progress' });
const cacheStore = localforage.createInstance({ name: 'stratege', storeName: 'cache' });

// API key
export async function getApiKey(): Promise<string | null> {
  return apiKeyStore.getItem<string>('api_key');
}

export async function setApiKey(key: string): Promise<void> {
  await apiKeyStore.setItem('api_key', key);
}

export async function clearApiKey(): Promise<void> {
  await apiKeyStore.removeItem('api_key');
}

// Rule history entry
export interface RuleAttempt {
  ruleId: string;
  correct: boolean;
  timestamp: number;
}

export interface RuleStats {
  ruleId: string;
  attempts: number;
  correct: number;
  lastSeen: number;
}

export async function recordAttempt(attempt: RuleAttempt): Promise<void> {
  const key = `rule_stats_${attempt.ruleId}`;
  const existing = await progressStore.getItem<RuleStats>(key) ?? {
    ruleId: attempt.ruleId,
    attempts: 0,
    correct: 0,
    lastSeen: 0,
  };
  existing.attempts++;
  if (attempt.correct) existing.correct++;
  existing.lastSeen = attempt.timestamp;
  await progressStore.setItem(key, existing);

  // Append to history
  const histKey = 'exercise_history';
  const history = await progressStore.getItem<RuleAttempt[]>(histKey) ?? [];
  history.push(attempt);
  // Keep last 500
  if (history.length > 500) history.splice(0, history.length - 500);
  await progressStore.setItem(histKey, history);
}

export async function getAllRuleStats(): Promise<RuleStats[]> {
  const stats: RuleStats[] = [];
  await progressStore.iterate<RuleStats, void>((value, key) => {
    if (key.startsWith('rule_stats_')) stats.push(value);
  });
  return stats;
}

export async function getRuleStat(ruleId: string): Promise<RuleStats | null> {
  return progressStore.getItem<RuleStats>(`rule_stats_${ruleId}`);
}

export async function getRecentHistory(n = 30): Promise<RuleAttempt[]> {
  const history = await progressStore.getItem<RuleAttempt[]>('exercise_history') ?? [];
  return history.slice(-n);
}

// Cache for AI-generated content
export async function getCached<T>(key: string): Promise<T | null> {
  return cacheStore.getItem<T>(key);
}

export async function setCached<T>(key: string, value: T): Promise<void> {
  await cacheStore.setItem(key, value);
}

// Certification history (separate from training)
export interface CertificationResult {
  id: string;
  date: number;
  score: number;
  totalQuestions: number;
  durationSeconds: number;
  mention: string;
}

export async function saveCertification(result: CertificationResult): Promise<void> {
  const key = 'certifications';
  const list = await progressStore.getItem<CertificationResult[]>(key) ?? [];
  list.push(result);
  await progressStore.setItem(key, list);
}

export async function getCertifications(): Promise<CertificationResult[]> {
  const list = await progressStore.getItem<CertificationResult[]>('certifications');
  return list ?? [];
}
