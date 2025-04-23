/**
 * Shuffles an array in place using the Fisher-Yates (aka Knuth) algorithm.
 * @param array The array to shuffle.
 * @returns The shuffled array (mutated in place).
 */
export function shuffleArray<T>(array: T[]): T[] {
    // Create a copy to avoid mutating the original array passed as prop
    const shuffledArray = [...array]; 
    for (let i = shuffledArray.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        // Swap elements using a temporary variable
        const temp = shuffledArray[i];
        shuffledArray[i] = shuffledArray[j];
        shuffledArray[j] = temp;
    }
    return shuffledArray;
} 