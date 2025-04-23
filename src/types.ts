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

// Union type for any vocabulary item
// This replaces the original VocabularyItem interface
export type VocabularyItem = EnglishVocabularyItem | GermanVocabularyItem;

// Type guard to check if an item is an EnglishVocabularyItem
export function isEnglishVocabularyItem(item: VocabularyItem): item is EnglishVocabularyItem {
  // Use 'in' operator for safer type checking
  return 'definition_en' in item;
}

// Type guard to check if an item is a GermanVocabularyItem
export function isGermanVocabularyItem(item: VocabularyItem): item is GermanVocabularyItem {
  // Use 'in' operator for safer type checking
  return 'word_de' in item;
}

// Define possible languages
export type Language = 'en' | 'de';

// Define possible application states (if needed outside App.tsx, otherwise keep in App.tsx)
// export type AppState = 'selectingLanguage' | 'loading' | 'welcome' | 'playing' | 'promptContinue' | 'results' | 'error'; 