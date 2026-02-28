/**
 * Represents a single vocabulary entry with English and Turkish details.
 */

// Define score structure
export interface Score {
  correct: number;
  incorrect: number;
}

// Define structure for English vocabulary items
export interface EnglishVocabularyItem {
  word_en: string;
  definition_en: string;
  word_tr: string;
  definition_tr: string;
}

// Define structure for German vocabulary items
export interface GermanVocabularyItem {
  word_de: string;
  word_tr: string;
}

// Simple English word items (word + Turkish translation, no definitions)
export interface EnglishWordItem {
  word_en: string;
  word_tr: string;
}

export type VocabularyItem = EnglishVocabularyItem | GermanVocabularyItem | EnglishWordItem;

export function isEnglishVocabularyItem(item: VocabularyItem): item is EnglishVocabularyItem {
  return 'definition_en' in item;
}

export function isGermanVocabularyItem(item: VocabularyItem): item is GermanVocabularyItem {
  return 'word_de' in item;
}

export function isEnglishWordItem(item: VocabularyItem): item is EnglishWordItem {
  return 'word_en' in item && !('definition_en' in item);
}

export type Language = 'en' | 'en_words' | 'de';

// Define possible application states (if needed outside App.tsx, otherwise keep in App.tsx)
// export type AppState = 'selectingLanguage' | 'loading' | 'welcome' | 'playing' | 'promptContinue' | 'results' | 'error'; 