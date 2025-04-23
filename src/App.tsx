import { useState, useEffect } from 'react'
import './App.css'
import WelcomeScreen from './components/WelcomeScreen'
import QuestionScreen from './components/QuestionScreen'
import ContinuePrompt from './components/ContinuePrompt'
import ResultsScreen from './components/ResultsScreen'
import { VocabularyItem } from './types'
import definitionsData from './data/definitions.json'
import { shuffleArray } from './utils/shuffle'

// Define possible application states
type AppState = 'welcome' | 'playing' | 'promptContinue' | 'results' | 'loading' | 'error'

function App() {
  // State to manage the current view of the application
  const [appState, setAppState] = useState<AppState>('loading')
  // State to store the vocabulary data
  const [vocabulary, setVocabulary] = useState<VocabularyItem[]>([])
  // State to store potential error messages
  const [error, setError] = useState<string | null>(null)

  // --- Session State ---
  const [currentSessionQuestions, setCurrentSessionQuestions] = useState<VocabularyItem[]>([])
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState<number>(0)
  const [lastSessionScore, setLastSessionScore] = useState<{ correct: number; incorrect: number } | null>(null)
  const [currentScore, setCurrentScore] = useState<{ correct: number; incorrect: number }>({ correct: 0, incorrect: 0 })
  // ---------------------

  // Effect to load data when the component mounts
  useEffect(() => {
    try {
      // Basic validation: Check if data is an array and not empty
      if (Array.isArray(definitionsData) && definitionsData.length >= 10) { // Ensure at least 10 items for a session
        // Check if the data structure is somewhat valid (first item)
        const firstItem = definitionsData[0]
        if (firstItem && 'word_en' in firstItem && 'definition_en' in firstItem && 'word_tr' in firstItem && 'definition_tr' in firstItem) {
          setVocabulary(definitionsData as VocabularyItem[]) // Type assertion
          setAppState('welcome') // Transition to welcome screen after loading
        } else {
          throw new Error('Invalid data structure in definitions.json')
        }
      } else {
        // Throw error if not enough data for a full session
        throw new Error('Insufficient data (< 10 items) or data is not an array in definitions.json')
      }
    } catch (err) {
      console.error("Failed to load vocabulary data:", err)
      setError(err instanceof Error ? err.message : 'An unknown error occurred while loading data.')
      setAppState('error') // Transition to error state
    }
  }, []) // Empty dependency array means this runs once on mount

  // Function to initialize a new session
  const startNewSession = () => {
    if (vocabulary.length < 10) {
      // This check is redundant if the initial load worked, but good practice
      setError('Cannot start a new session, not enough vocabulary data loaded.')
      setAppState('error')
      return
    }
    const sessionQuestions = shuffleArray(vocabulary).slice(0, 10)
    setCurrentSessionQuestions(sessionQuestions)
    setCurrentQuestionIndex(0)
    setCurrentScore({ correct: 0, incorrect: 0 })
    setAppState('playing')
  }

  // Update handleStart to call startNewSession
  const handleStart = () => {
    startNewSession() // Initialize the first session
  }

  // Handles moving to the next question or triggering the continue prompt
  const handleNextQuestion = () => {
    if (currentQuestionIndex < currentSessionQuestions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1)
    } else {
      // Last question answered, save score and show prompt
      setLastSessionScore(currentScore)
      setAppState('promptContinue')
    }
  }

  // Updates score when an answer is selected in QuestionScreen
  const handleAnswerSelected = (selectedWord: string | null) => {
    const currentQuestion = currentSessionQuestions[currentQuestionIndex]
    const isCorrect = selectedWord === currentQuestion.word_en
    const isPass = selectedWord === null

    if (!isPass) {
      if (isCorrect) {
        setCurrentScore(prev => ({ ...prev, correct: prev.correct + 1 }))
      } else {
        setCurrentScore(prev => ({ ...prev, incorrect: prev.incorrect + 1 }))
      }
    }
    console.log(`Answer Selected: ${selectedWord ?? 'Passed'}, Correct: ${isCorrect}`)
  }

  // Handler for clicking "Yes" on the continue prompt
  const handleContinueYes = () => {
    startNewSession() // Start a new 10-question session
  }

  // Handler for clicking "No" on the continue prompt
  const handleContinueNo = () => {
    setAppState('results') // Go to the results screen
  }

  // Render based on state
  if (appState === 'loading') {
    return <div>Loading vocabulary...</div>
  }

  if (appState === 'error') {
    return <div>Error: {error}</div>
  }

  return (
    <div className="App">
      {/* Conditionally render components based on the app state */}
      {appState === 'welcome' && <WelcomeScreen onStart={handleStart} />}

      {/* Render the playing state using QuestionScreen */}
      {appState === 'playing' && currentSessionQuestions.length > 0 && (
        <QuestionScreen
          questionItem={currentSessionQuestions[currentQuestionIndex]}
          allVocabulary={vocabulary} // Pass the full list for generating distractors
          questionNumber={currentQuestionIndex + 1}
          totalQuestions={currentSessionQuestions.length} // Use actual length
          onAnswerSelected={handleAnswerSelected} // Pass the score update handler
          onNextQuestion={handleNextQuestion}    // Pass the state advancement handler
        />
      )}

      {/* Render the Continue Prompt */}
      {appState === 'promptContinue' && (
        <ContinuePrompt
          onContinue={handleContinueYes} // Yes -> Start new session
          onStop={handleContinueNo}       // No -> Go to results
        />
      )}

      {/* Render the results state using ResultsScreen */}
      {appState === 'results' && lastSessionScore && (
        <ResultsScreen
          score={lastSessionScore} // Pass the score of the last completed session
          onStartAgain={handleStart} // Reuse handleStart for the button
        />
      )}
    </div>
  )
}

export default App
