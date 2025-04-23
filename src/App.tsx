import { useState } from 'react'
import './App.css'
import WelcomeScreen from './components/WelcomeScreen'
import QuestionScreen from './components/QuestionScreen'
import ContinuePrompt from './components/ContinuePrompt'
import ResultsScreen from './components/ResultsScreen'
import LanguageSelector from './components/LanguageSelector'
import { VocabularyItem, isEnglishVocabularyItem, isGermanVocabularyItem } from './types'
import { shuffleArray } from './utils/shuffle'

// Define possible languages
import { Language } from './types'

// Define possible application states
type AppState = 'selectingLanguage' | 'loading' | 'welcome' | 'playing' | 'promptContinue' | 'results' | 'error'

// Define score structure
interface Score {
  correct: number;
  incorrect: number;
}

function App() {
  // State to manage the current view of the application
  const [appState, setAppState] = useState<AppState>('selectingLanguage')
  // State to store the selected language
  const [selectedLanguage, setSelectedLanguage] = useState<Language | null>(null)
  // State to store the vocabulary data for the selected language
  const [currentVocabulary, setCurrentVocabulary] = useState<VocabularyItem[]>([])
  // State to store potential error messages
  const [error, setError] = useState<string | null>(null)

  // --- Session State ---
  const [currentSessionQuestions, setCurrentSessionQuestions] = useState<VocabularyItem[]>([])
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState<number>(0)
  const [cumulativeScore, setCumulativeScore] = useState<Score>({ correct: 0, incorrect: 0 })
  // ---------------------

  // Function to load data based on selected language
  const loadData = async (language: Language) => {
    setAppState('loading')
    setError(null)
    try {
      let dataModule;
      if (language === 'en') {
        dataModule = await import('./data/definitions_en.json')
      } else { // language === 'de'
        dataModule = await import('./data/definitions_de.json')
      }
      const data = dataModule.default as VocabularyItem[]; // Assume default export is the array

      // Basic validation
      if (Array.isArray(data) && data.length >= 10) { // Ensure at least 10 items
        // Simple structure check for the first item based on language
        const firstItem = data[0];
        let isValid = false;
        if (language === 'en' && firstItem && 'word_en' in firstItem && 'definition_en' in firstItem) {
           isValid = true;
        } else if (language === 'de' && firstItem && 'word_de' in firstItem && 'word_tr' in firstItem) {
           isValid = true;
        }

        if (isValid) {
          setCurrentVocabulary(data)
          setSelectedLanguage(language) // Set selected language
          setAppState('welcome') // Transition to welcome screen
        } else {
          throw new Error(`Invalid data structure in definitions_${language}.json`)
        }
      } else {
        throw new Error(`Insufficient data (< 10 items) or data is not an array in definitions_${language}.json`)
      }
    } catch (err) {
      console.error("Failed to load vocabulary data:", err)
      setError(err instanceof Error ? err.message : 'An unknown error occurred while loading data.')
      setAppState('error') // Transition to error state
      setSelectedLanguage(null) // Reset language on error
      setCurrentVocabulary([]) // Clear vocabulary on error
    }
  }

  // Function to initialize a new 10-question round for the selected language
  const startNewSessionRound = () => {
    if (currentVocabulary.length < 10) {
      setError('Cannot start a new session round, not enough vocabulary data loaded.')
      setAppState('error')
      return
    }
    // Use currentVocabulary which is loaded based on selected language
    const sessionQuestions = shuffleArray(currentVocabulary).slice(0, 10)
    setCurrentSessionQuestions(sessionQuestions)
    setCurrentQuestionIndex(0)
    // Do not reset cumulativeScore here
    setAppState('playing')
  }

  // Function to start a completely fresh game, resetting score for the current language
  const handleStartFresh = () => {
    setCumulativeScore({ correct: 0, incorrect: 0 }) // Reset score
    startNewSessionRound() // Start the first round
  }

  // Handles moving to the next question or triggering the continue prompt
  const handleNextQuestion = () => {
    if (currentQuestionIndex < currentSessionQuestions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1)
    } else {
      setAppState('promptContinue')
    }
  }

  // Updates cumulative score based on the selected language's logic
  const handleAnswerSelected = (selectedWord: string | null) => {
    if (!selectedLanguage) return; // Should not happen in 'playing' state

    const currentQuestion = currentSessionQuestions[currentQuestionIndex]
    const isPass = selectedWord === null
    let isCorrect = false

    if (!isPass) {
      if (selectedLanguage === 'en' && isEnglishVocabularyItem(currentQuestion)) {
        isCorrect = selectedWord === currentQuestion.word_en
      } else if (selectedLanguage === 'de' && isGermanVocabularyItem(currentQuestion)) {
        // For German, the options and selectedWord are Turkish translations
        isCorrect = selectedWord === currentQuestion.word_tr
      }

      if (isCorrect) {
        setCumulativeScore(prev => ({ ...prev, correct: prev.correct + 1 }))
      } else {
        setCumulativeScore(prev => ({ ...prev, incorrect: prev.incorrect + 1 }))
      }
    }
  }

  // Handler for clicking "Yes" on the continue prompt
  const handleContinueYes = () => {
    startNewSessionRound() // Start a new round for the *same* language
  }

  // Handler for clicking "No" on the continue prompt
  const handleContinueNo = () => {
    setAppState('results')
  }

  // Handler to go back to language selection (optional, e.g., from results)
  const handleChangeLanguage = () => {
      setCurrentVocabulary([]);
      setSelectedLanguage(null);
      setCurrentSessionQuestions([]);
      setCurrentQuestionIndex(0);
      setCumulativeScore({ correct: 0, incorrect: 0 });
      setError(null);
      setAppState('selectingLanguage');
  }

  // Render based on state
  if (appState === 'error') {
    // Provide an option to retry or change language on error
    return (
        <div>
            <p>Error: {error}</p>
            <button onClick={() => setAppState('selectingLanguage')}>Change Language</button>
            {/* Optional: Add a retry button if feasible */}
        </div>
    )
  }

  return (
    <div className="App">
      {/* Show Language Selector First */}
      {appState === 'selectingLanguage' && <LanguageSelector onSelectLanguage={loadData} />}

      {/* Show Loading State */}
      {appState === 'loading' && <div>Loading {selectedLanguage === 'en' ? 'English' : selectedLanguage === 'de' ? 'German' : ''} vocabulary...</div>}

      {/* Show Welcome Screen after data is loaded */}
      {appState === 'welcome' && selectedLanguage && (
        <WelcomeScreen 
            onStart={handleStartFresh} 
            language={selectedLanguage} // Pass language to customize message
        />
      )}

      {/* Render the playing state using QuestionScreen */}
      {appState === 'playing' && selectedLanguage && currentSessionQuestions.length > 0 && (
        <QuestionScreen
          // Ensure the questionItem passed matches the expected structure based on language
          questionItem={currentSessionQuestions[currentQuestionIndex]}
          allVocabulary={currentVocabulary} // Pass the full list for generating distractors
          questionNumber={currentQuestionIndex + 1}
          totalQuestions={currentSessionQuestions.length}
          onAnswerSelected={handleAnswerSelected}
          onNextQuestion={handleNextQuestion}
          language={selectedLanguage} // Pass selected language
        />
      )}

      {/* Render the Continue Prompt */}
      {appState === 'promptContinue' && (
        <ContinuePrompt
          onContinue={handleContinueYes}
          onStop={handleContinueNo}
        />
      )}

      {/* Render the results state using ResultsScreen */}
      {appState === 'results' && selectedLanguage && (
        <ResultsScreen
          score={cumulativeScore}
          onStartAgain={handleStartFresh} // Start again with the SAME language
          onChangeLanguage={handleChangeLanguage} // Add option to change language
          language={selectedLanguage} // Pass language for context if needed
        />
      )}
    </div>
  )
}

export default App
