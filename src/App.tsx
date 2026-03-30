import { useState } from 'react'
import './App.css'
import QuestionScreen from './components/QuestionScreen'
import ContinuePrompt from './components/ContinuePrompt'
import ResultsScreen from './components/ResultsScreen'
import LanguageSelector from './components/LanguageSelector'
import EnglishModeSelector from './components/EnglishModeSelector'
import GermanModeSelector from './components/GermanModeSelector'
import GermanDirectionSelector from './components/GermanDirectionSelector'
import GameModeSelector, { GameMode } from './components/GameModeSelector'
import CardCountSelector from './components/CardCountSelector'
import { VocabularyItem, Language, isEnglishVocabularyItem, isEnglishWordItem, isEnglishDefinitionItem, isGermanVocabularyItem } from './types'
import { selectPrioritizedQuestions, recordAnswer } from './utils/cardHistory'
import { recordSession } from './utils/sessionHistory'
import UserHistory from './components/UserHistory'

type AppState = 'selectingLanguage' | 'viewingHistory' | 'selectingEnglishMode' | 'selectingGermanMode' | 'selectingGermanDirection' | 'selectingGameMode' | 'selectingCardCount' | 'loading' | 'playing' | 'promptContinue' | 'results' | 'error'

// Define score structure
interface Score {
  correct: number;
  incorrect: number;
}

function App() {
  const [appState, setAppState] = useState<AppState>('selectingLanguage')
  const [selectedLanguage, setSelectedLanguage] = useState<Language | null>(null)
  const [currentVocabulary, setCurrentVocabulary] = useState<VocabularyItem[]>([])
  const [error, setError] = useState<string | null>(null)
  const [gameMode, setGameMode] = useState<GameMode>('text')
  const [cardCount, setCardCount] = useState<number>(10)

  // --- Session State ---
  const [currentSessionQuestions, setCurrentSessionQuestions] = useState<VocabularyItem[]>([])
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState<number>(0)
  const [cumulativeScore, setCumulativeScore] = useState<Score>({ correct: 0, incorrect: 0 })
  // ---------------------

  const handleLanguageSelect = (language: Language) => {
    if (language === 'en') {
      setAppState('selectingEnglishMode')
    } else if (language === 'de') {
      setAppState('selectingGermanMode')
    } else {
      loadData(language)
    }
  }

  const handleEnglishModeSelect = (language: Language) => {
    if (language === 'en_march_2026') {
      // Load data first, then show game mode selector
      loadData(language, 'selectingGameMode')
    } else {
      loadData(language)
    }
  }

  const handleGermanModeSelect = (language: Language) => {
    if (language === 'de_march_2026') {
      setAppState('selectingGermanDirection')
    } else {
      loadData(language)
    }
  }

  const handleGermanDirectionSelect = (language: Language) => {
    if (language === 'de_march_2026') {
      // DE->TR: load data, then show game mode selector (text/sound)
      loadData(language, 'selectingGameMode')
    } else {
      // TR->DE: text only, go straight to card count
      loadData(language)
    }
  }

  const handleGameModeSelect = (mode: GameMode) => {
    setGameMode(mode)
    setAppState('selectingCardCount')
  }

  const handleCardCountSelect = (count: number) => {
    setCardCount(count)
    setCumulativeScore({ correct: 0, incorrect: 0 })
    startNewSessionRound(count)
  }

  const loadData = async (language: Language, nextState?: AppState) => {
    setAppState('loading')
    setError(null)
    try {
      let dataModule;
      if (language === 'en') {
        dataModule = await import('./data/definitions_en_april_2025.json')
      } else if (language === 'en_words') {
        dataModule = await import('./data/definitions_en_february_2026.json')
      } else if (language === 'en_march_2026') {
        dataModule = await import('./data/definitions_en_march_2026.json')
      } else if (language === 'de_march_2026' || language === 'de_march_2026_tr') {
        dataModule = await import('./data/definitions_de_march_2026.json')
      } else {
        dataModule = await import('./data/definitions_de.json')
      }
      const data = dataModule.default as VocabularyItem[];

      if (Array.isArray(data) && data.length >= 10) {
        const firstItem = data[0];
        let isValid = false;
        if (language === 'en' && firstItem && 'word_en' in firstItem && 'definition_en' in firstItem) {
           isValid = true;
        } else if (language === 'en_words' && firstItem && 'word_en' in firstItem && 'word_tr' in firstItem) {
           isValid = true;
        } else if (language === 'en_march_2026' && firstItem && 'word_en' in firstItem && 'definition_en' in firstItem) {
           isValid = true;
        } else if (language === 'de' && firstItem && 'word_de' in firstItem && 'word_tr' in firstItem) {
           isValid = true;
        } else if (language === 'de_march_2026' && firstItem && 'word_de' in firstItem && 'word_tr' in firstItem) {
           isValid = true;
        } else if (language === 'de_march_2026_tr' && firstItem && 'word_de' in firstItem && 'word_tr' in firstItem) {
           isValid = true;
        }

        if (isValid) {
          setCurrentVocabulary(data)
          setSelectedLanguage(language)
          setAppState(nextState || 'selectingCardCount')
        } else {
          throw new Error(`Invalid data structure in definitions file for mode: ${language}`)
        }
      } else {
        throw new Error(`Insufficient data (< 10 items) or data is not an array for mode: ${language}`)
      }
    } catch (err) {
      console.error("Failed to load vocabulary data:", err)
      setError(err instanceof Error ? err.message : 'An unknown error occurred while loading data.')
      setAppState('error')
      setSelectedLanguage(null)
      setCurrentVocabulary([])
    }
  }

  const startNewSessionRound = (count?: number) => {
    if (currentVocabulary.length < 10 || !selectedLanguage) {
      setError('Cannot start a new session round, not enough vocabulary data loaded.')
      setAppState('error')
      return
    }
    const sessionQuestions = selectPrioritizedQuestions(currentVocabulary, selectedLanguage, count ?? cardCount)
    setCurrentSessionQuestions(sessionQuestions)
    setCurrentQuestionIndex(0)
    setAppState('playing')
  }

  const handleStartFresh = () => {
    setCumulativeScore({ correct: 0, incorrect: 0 })
    startNewSessionRound()
  }

  const handleNextQuestion = () => {
    if (currentQuestionIndex < currentSessionQuestions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1)
    } else {
      setAppState('promptContinue')
    }
  }

  const handleAnswerSelected = (selectedWord: string | null) => {
    if (!selectedLanguage) return;

    const currentQuestion = currentSessionQuestions[currentQuestionIndex]
    const isPass = selectedWord === null
    let isCorrect = false

    if (!isPass) {
      if (selectedLanguage === 'en' && isEnglishVocabularyItem(currentQuestion)) {
        isCorrect = selectedWord === currentQuestion.word_en
      } else if (selectedLanguage === 'en_words' && isEnglishWordItem(currentQuestion)) {
        isCorrect = selectedWord === currentQuestion.word_tr
      } else if (selectedLanguage === 'en_march_2026' && isEnglishDefinitionItem(currentQuestion)) {
        isCorrect = selectedWord === currentQuestion.word_en
      } else if ((selectedLanguage === 'de' || selectedLanguage === 'de_march_2026') && isGermanVocabularyItem(currentQuestion)) {
        isCorrect = selectedWord === currentQuestion.word_tr
      } else if (selectedLanguage === 'de_march_2026_tr' && isGermanVocabularyItem(currentQuestion)) {
        isCorrect = selectedWord === currentQuestion.word_de
      }

      recordAnswer(selectedLanguage, currentQuestion, isCorrect)

      if (isCorrect) {
        setCumulativeScore(prev => ({ ...prev, correct: prev.correct + 1 }))
      } else {
        setCumulativeScore(prev => ({ ...prev, incorrect: prev.incorrect + 1 }))
      }
    }
  }

  const handleContinueYes = () => {
    startNewSessionRound()
  }

  const handleContinueNo = () => {
    if (selectedLanguage && (cumulativeScore.correct + cumulativeScore.incorrect) > 0) {
      recordSession(selectedLanguage, cumulativeScore.correct, cumulativeScore.incorrect)
    }
    setAppState('results')
  }

  const handleChangeLanguage = () => {
      setCurrentVocabulary([]);
      setSelectedLanguage(null);
      setCurrentSessionQuestions([]);
      setCurrentQuestionIndex(0);
      setCumulativeScore({ correct: 0, incorrect: 0 });
      setError(null);
      setGameMode('text');
      setCardCount(10);
      setAppState('selectingLanguage');
  }

  if (appState === 'error') {
    return (
        <div>
            <p>Error: {error}</p>
            <button onClick={() => setAppState('selectingLanguage')}>Change Language</button>
        </div>
    )
  }

  return (
    <div className="App">
      {appState !== 'selectingLanguage' && (
        <button className="home-button" onClick={handleChangeLanguage} title="Home">
          🏠
        </button>
      )}

      {appState === 'selectingLanguage' && (
        <LanguageSelector
          onSelectLanguage={handleLanguageSelect}
          onViewHistory={() => setAppState('viewingHistory')}
        />
      )}

      {appState === 'viewingHistory' && <UserHistory onBack={() => setAppState('selectingLanguage')} />}

      {appState === 'selectingEnglishMode' && <EnglishModeSelector onSelectMode={handleEnglishModeSelect} />}

      {appState === 'selectingGermanMode' && <GermanModeSelector onSelectMode={handleGermanModeSelect} />}

      {appState === 'selectingGermanDirection' && <GermanDirectionSelector onSelectDirection={handleGermanDirectionSelect} />}

      {appState === 'selectingGameMode' && <GameModeSelector onSelectMode={handleGameModeSelect} language={selectedLanguage ?? undefined} />}

      {appState === 'selectingCardCount' && (
        <CardCountSelector totalCards={currentVocabulary.length} onSelectCount={handleCardCountSelect} />
      )}

      {appState === 'loading' && <div>Loading vocabulary...</div>}

      {appState === 'playing' && selectedLanguage && currentSessionQuestions.length > 0 && (
        <QuestionScreen
          questionItem={currentSessionQuestions[currentQuestionIndex]}
          allVocabulary={currentVocabulary}
          questionNumber={currentQuestionIndex + 1}
          totalQuestions={currentSessionQuestions.length}
          onAnswerSelected={handleAnswerSelected}
          onNextQuestion={handleNextQuestion}
          language={selectedLanguage}
          gameMode={(selectedLanguage === 'en_march_2026' || selectedLanguage === 'de_march_2026') ? gameMode : 'text'}
        />
      )}

      {appState === 'promptContinue' && (
        <ContinuePrompt
          onContinue={handleContinueYes}
          onStop={handleContinueNo}
        />
      )}

      {appState === 'results' && selectedLanguage && (
        <ResultsScreen
          score={cumulativeScore}
          onStartAgain={handleStartFresh}
          onChangeLanguage={handleChangeLanguage}
          language={selectedLanguage}
        />
      )}
    </div>
  )
}

export default App
