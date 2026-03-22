import { VocabularyItem, Language } from '../types';

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

const WEIGHT_NEVER_PLAYED = 10;
const WEIGHT_INCORRECT = 5;
const WEIGHT_CORRECT = 1;

function weightedRandomPick(items: { item: VocabularyItem; weight: number }[], count: number): VocabularyItem[] {
  const pool = [...items];
  const result: VocabularyItem[] = [];

  for (let i = 0; i < count && pool.length > 0; i++) {
    const totalWeight = pool.reduce((sum, entry) => sum + entry.weight, 0);
    let rand = Math.random() * totalWeight;

    for (let j = 0; j < pool.length; j++) {
      rand -= pool[j].weight;
      if (rand <= 0) {
        result.push(pool[j].item);
        pool.splice(j, 1);
        break;
      }
    }
  }

  return result;
}

export function selectPrioritizedQuestions(vocabulary: VocabularyItem[], language: Language, count: number): VocabularyItem[] {
  const history = getHistory(language);

  const weighted = vocabulary.map(item => {
    const status = history[getCardKey(item)];
    let weight: number;
    if (!status) {
      weight = WEIGHT_NEVER_PLAYED;
    } else if (status === 'incorrect') {
      weight = WEIGHT_INCORRECT;
    } else {
      weight = WEIGHT_CORRECT;
    }
    return { item, weight };
  });

  return weightedRandomPick(weighted, count);
}
