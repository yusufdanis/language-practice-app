import { VocabularyItem, Language } from '../types';
import { shuffleArray } from './shuffle';

type CardStatus = 'correct' | 'incorrect';

function getStorageKey(language: Language): string {
  return `card_history_${language}`;
}

function getCardKey(item: VocabularyItem): string {
  if ('word_de' in item) return item.word_de;
  return (item as { word_en: string }).word_en;
}

function getHistory(language: Language): Record<string, CardStatus> {
  const raw = localStorage.getItem(getStorageKey(language));
  if (!raw) return {};
  try {
    return JSON.parse(raw);
  } catch {
    return {};
  }
}

function saveHistory(language: Language, history: Record<string, CardStatus>): void {
  localStorage.setItem(getStorageKey(language), JSON.stringify(history));
}

export function recordAnswer(language: Language, item: VocabularyItem, correct: boolean): void {
  const history = getHistory(language);
  history[getCardKey(item)] = correct ? 'correct' : 'incorrect';
  saveHistory(language, history);
}

export function selectPrioritizedQuestions(vocabulary: VocabularyItem[], language: Language, count: number): VocabularyItem[] {
  const history = getHistory(language);

  const neverPlayed: VocabularyItem[] = [];
  const incorrect: VocabularyItem[] = [];
  const correct: VocabularyItem[] = [];

  for (const item of vocabulary) {
    const status = history[getCardKey(item)];
    if (!status) {
      neverPlayed.push(item);
    } else if (status === 'incorrect') {
      incorrect.push(item);
    } else {
      correct.push(item);
    }
  }

  const result: VocabularyItem[] = [
    ...shuffleArray(neverPlayed),
    ...shuffleArray(incorrect),
    ...shuffleArray(correct),
  ];

  return result.slice(0, count);
}
