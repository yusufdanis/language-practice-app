import { Language } from '../types';

export interface SessionRecord {
  language: Language;
  correct: number;
  incorrect: number;
  date: string; // ISO string
}

const STORAGE_KEY = 'session_history';

export function getSessionHistory(): SessionRecord[] {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) return [];
  try {
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

export function recordSession(language: Language, correct: number, incorrect: number): void {
  const history = getSessionHistory();
  history.push({
    language,
    correct,
    incorrect,
    date: new Date().toISOString(),
  });
  localStorage.setItem(STORAGE_KEY, JSON.stringify(history));
}

export function getLanguageLabel(language: Language): string {
  switch (language) {
    case 'en': return 'English (April 2025)';
    case 'en_words': return 'English (February 2026)';
    case 'en_march_2026': return 'English (March 2026)';
    case 'de': return 'German (April 2025)';
    case 'de_march_2026': return 'German (March 2026 DE→TR)';
    case 'de_march_2026_tr': return 'German (March 2026 TR→DE)';
    default: return language;
  }
}
