import React, { useState, useEffect, useRef, useCallback } from 'react';
import { VocabularyItem, Language, isEnglishVocabularyItem, isEnglishWordItem, isEnglishDefinitionItem, isGermanVocabularyItem } from '../types';
import { shuffleArray } from '../utils/shuffle';
import { GameMode } from './GameModeSelector';

function getAudioUrl(wordEn: string): string {
  const filename = wordEn.toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/^_|_$/g, '');
  return `${import.meta.env.BASE_URL}audio/march_2026/${filename}.wav`;
}

interface FeedbackDetail {
  label?: string;
  word_en?: string;
  definition_en?: string;
  word_de?: string;
  word_tr?: string;
  definition_tr?: string;
}

interface QuestionScreenProps {
  questionItem: VocabularyItem;
  allVocabulary: VocabularyItem[];
  questionNumber: number;
  totalQuestions: number;
  onAnswerSelected: (selectedWord: string | null) => void;
  onNextQuestion: () => void;
  language: Language;
  gameMode: GameMode;
}

const QuestionScreen: React.FC<QuestionScreenProps> = ({
  questionItem,
  allVocabulary,
  questionNumber,
  totalQuestions,
  onAnswerSelected,
  onNextQuestion,
  language,
  gameMode,
}) => {
  const [options, setOptions] = useState<string[]>([]);
  const [isAnswered, setIsAnswered] = useState<boolean>(false);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [feedbackInfo, setFeedbackInfo] = useState<FeedbackDetail[]>([]);
  const [feedbackMessage, setFeedbackMessage] = useState<string>('');
  const nextButtonRef = useRef<HTMLDivElement>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const isSoundMode = gameMode === 'sound' && language === 'en_march_2026';

  const playAudio = useCallback(() => {
    if (isSoundMode && isEnglishDefinitionItem(questionItem)) {
      if (audioRef.current) {
        audioRef.current.pause();
      }
      const audio = new Audio(getAudioUrl(questionItem.word_en));
      audioRef.current = audio;
      audio.play().catch(console.error);
    }
  }, [isSoundMode, questionItem]);

  useEffect(() => {
    setIsAnswered(false);
    setSelectedAnswer(null);
    setFeedbackInfo([]);
    setFeedbackMessage('');
    // Stop any playing audio when question changes
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }

    let cleanupTimer: (() => void) | undefined;
    if (isSoundMode) {
      const timer = setTimeout(playAudio, 300);
      cleanupTimer = () => clearTimeout(timer);
    }

    let correctWord = '';
    let distractors: string[] = [];

    if (language === 'en' && isEnglishVocabularyItem(questionItem)) {
      correctWord = questionItem.word_en;
      distractors = allVocabulary
        .filter(isEnglishVocabularyItem)
        .filter(item => item.word_en !== correctWord)
        .map(item => item.word_en);
    } else if (language === 'en_words' && isEnglishWordItem(questionItem)) {
      correctWord = questionItem.word_tr;
      distractors = allVocabulary
        .filter(isEnglishWordItem)
        .filter(item => item.word_tr !== correctWord)
        .map(item => item.word_tr);
    } else if (language === 'en_march_2026' && isEnglishDefinitionItem(questionItem)) {
      correctWord = questionItem.word_en;
      distractors = allVocabulary
        .filter(isEnglishDefinitionItem)
        .filter(item => item.word_en !== correctWord)
        .map(item => item.word_en);
    } else if (language === 'de' && isGermanVocabularyItem(questionItem)) {
      correctWord = questionItem.word_tr;
      distractors = allVocabulary
        .filter(isGermanVocabularyItem)
        .filter(item => item.word_tr !== correctWord)
        .map(item => item.word_tr);
    } else {
      console.error("Mismatched language and question item type:", language, questionItem);
      setOptions([]);
      return;
    }

    const uniqueDistractors = Array.from(new Set(distractors));
    const selectedIncorrect = shuffleArray(uniqueDistractors).slice(0, 3);

    if (selectedIncorrect.length < 3) {
        console.warn("Not enough unique distractors found for question:", questionItem);
    }

    const allOptions = shuffleArray([correctWord, ...selectedIncorrect]);
    setOptions(allOptions);

    return cleanupTimer;
  }, [questionItem, allVocabulary, language, isSoundMode, playAudio]);

  useEffect(() => {
    if (isAnswered) {
      window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
    }
  }, [isAnswered]);

  const handleOptionClick = (selectedOption: string | null) => {
    if (isAnswered) return;

    setSelectedAnswer(selectedOption);
    setIsAnswered(true);
    onAnswerSelected(selectedOption);

    let feedback: FeedbackDetail[] = [];
    let message = '';
    let isCorrect = false;
    
    if (language === 'en' && isEnglishVocabularyItem(questionItem)) {
        isCorrect = selectedOption === questionItem.word_en;
    } else if (language === 'en_words' && isEnglishWordItem(questionItem)) {
        isCorrect = selectedOption === questionItem.word_tr;
    } else if (language === 'en_march_2026' && isEnglishDefinitionItem(questionItem)) {
        isCorrect = selectedOption === questionItem.word_en;
    } else if (language === 'de' && isGermanVocabularyItem(questionItem)) {
        isCorrect = selectedOption === questionItem.word_tr;
    }

    if (selectedOption === null) {
        message = '💡 Passed. The correct answer was:';
        if (language === 'en' && isEnglishVocabularyItem(questionItem)) {
            feedback.push({
                label: 'Correct Answer',
                word_en: questionItem.word_en,
                word_tr: questionItem.word_tr,
                definition_en: questionItem.definition_en,
                definition_tr: questionItem.definition_tr
            });
        } else if (language === 'en_words' && isEnglishWordItem(questionItem)) {
            feedback.push({
                label: 'Correct Answer',
                word_en: questionItem.word_en,
                word_tr: questionItem.word_tr
            });
        } else if (language === 'en_march_2026' && isEnglishDefinitionItem(questionItem)) {
            feedback.push({
                label: 'Correct Answer',
                word_en: questionItem.word_en,
                definition_en: questionItem.definition_en
            });
        } else if (language === 'de' && isGermanVocabularyItem(questionItem)) {
            feedback.push({
                label: 'Correct Answer',
                word_de: questionItem.word_de,
                word_tr: questionItem.word_tr
            });
        }
    } else if (isCorrect) {
        message = '✅ Correct! Well done!';
        if (language === 'en' && isEnglishVocabularyItem(questionItem)) {
            feedback.push({
                word_en: questionItem.word_en,
                word_tr: questionItem.word_tr,
                definition_en: questionItem.definition_en,
                definition_tr: questionItem.definition_tr
            });
        } else if (language === 'en_words' && isEnglishWordItem(questionItem)) {
            feedback.push({
                word_en: questionItem.word_en,
                word_tr: questionItem.word_tr
            });
        } else if (language === 'en_march_2026' && isEnglishDefinitionItem(questionItem)) {
            feedback.push({
                word_en: questionItem.word_en,
                definition_en: questionItem.definition_en
            });
        } else if (language === 'de' && isGermanVocabularyItem(questionItem)) {
            feedback.push({
                word_de: questionItem.word_de,
                word_tr: questionItem.word_tr
            });
        }
    } else {
        message = '🤔 Incorrect.';
        if (language === 'en' && isEnglishVocabularyItem(questionItem)) {
            const selectedWordItem = allVocabulary.find(item =>
                isEnglishVocabularyItem(item) && item.word_en === selectedOption
            );
            if (selectedWordItem && isEnglishVocabularyItem(selectedWordItem)) {
                feedback.push({
                    label: 'Your Answer',
                    word_en: selectedWordItem.word_en,
                    word_tr: selectedWordItem.word_tr,
                    definition_en: selectedWordItem.definition_en,
                    definition_tr: selectedWordItem.definition_tr
                });
            }
            feedback.push({
                label: 'Correct Answer',
                word_en: questionItem.word_en,
                word_tr: questionItem.word_tr,
                definition_en: questionItem.definition_en,
                definition_tr: questionItem.definition_tr
            });
        } else if (language === 'en_words' && isEnglishWordItem(questionItem)) {
            const selectedWordItem = allVocabulary.find(item =>
                isEnglishWordItem(item) && item.word_tr === selectedOption
            );
            if (selectedWordItem && isEnglishWordItem(selectedWordItem)) {
                feedback.push({
                    label: 'Your Answer',
                    word_en: selectedWordItem.word_en,
                    word_tr: selectedWordItem.word_tr
                });
            }
            feedback.push({
                label: 'Correct Answer',
                word_en: questionItem.word_en,
                word_tr: questionItem.word_tr
            });
        } else if (language === 'en_march_2026' && isEnglishDefinitionItem(questionItem)) {
            const selectedWordItem = allVocabulary.find(item =>
                isEnglishDefinitionItem(item) && item.word_en === selectedOption
            );
            if (selectedWordItem && isEnglishDefinitionItem(selectedWordItem)) {
                feedback.push({
                    label: 'Your Answer',
                    word_en: selectedWordItem.word_en,
                    definition_en: selectedWordItem.definition_en
                });
            }
            feedback.push({
                label: 'Correct Answer',
                word_en: questionItem.word_en,
                definition_en: questionItem.definition_en
            });
        } else if (language === 'de' && isGermanVocabularyItem(questionItem)) {
            const selectedWordItem = allVocabulary.find(item =>
                 isGermanVocabularyItem(item) && item.word_tr === selectedOption
            );
            if (selectedWordItem && isGermanVocabularyItem(selectedWordItem)) {
                feedback.push({
                    label: 'Your Answer',
                    word_de: selectedWordItem.word_de,
                    word_tr: selectedWordItem.word_tr
                });
            }
            feedback.push({
                label: 'Correct Answer',
                word_de: questionItem.word_de,
                word_tr: questionItem.word_tr
            });
        }
    }
    setFeedbackInfo(feedback);
    setFeedbackMessage(message);
  };

  const getOptionButtonClass = (option: string): string => {
    if (!isAnswered) return 'option-button';

    let isCorrectOption = false;
    if (language === 'en' && isEnglishVocabularyItem(questionItem)) {
        isCorrectOption = option === questionItem.word_en;
    } else if (language === 'en_words' && isEnglishWordItem(questionItem)) {
        isCorrectOption = option === questionItem.word_tr;
    } else if (language === 'en_march_2026' && isEnglishDefinitionItem(questionItem)) {
        isCorrectOption = option === questionItem.word_en;
    } else if (language === 'de' && isGermanVocabularyItem(questionItem)) {
        isCorrectOption = option === questionItem.word_tr;
    }

    const isSelected = option === selectedAnswer;

    if (isCorrectOption) return 'option-button option-button-correct';
    if (isSelected) return 'option-button option-button-incorrect-selected';
    return 'option-button option-button-disabled';
  };

  const getPassButtonClass = (): string => {
    return isAnswered ? 'button-pass option-button-disabled' : 'button-pass';
  }

  let questionPrompt = "";
  let questionText = "";
  if (language === 'en' && isEnglishVocabularyItem(questionItem)) {
    questionPrompt = `"${questionItem.definition_en}"`;
    questionText = "Which word matches this definition?";
  } else if (language === 'en_words' && isEnglishWordItem(questionItem)) {
    questionPrompt = `"${questionItem.word_en}"`;
    questionText = "Which is the correct Turkish translation?";
  } else if (language === 'en_march_2026' && isEnglishDefinitionItem(questionItem)) {
    questionPrompt = isSoundMode ? '' : `"${questionItem.definition_en}"`;
    questionText = "Which word matches this definition?";
  } else if (language === 'de' && isGermanVocabularyItem(questionItem)) {
    questionPrompt = `"${questionItem.word_de}"`;
    questionText = "Which is the correct Turkish translation?";
  } else {
    return <div>Error: Invalid question data for the selected language.</div>;
  }

  return (
    <div className="screen-container">
      <h2>Question {questionNumber}/{totalQuestions}</h2>
      {isSoundMode ? (
        <div style={{ margin: '20px' }}>
          <button
            onClick={playAudio}
            style={{
              background: 'none',
              border: '2px solid #007bff',
              borderRadius: '50%',
              width: '64px',
              height: '64px',
              fontSize: '2em',
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
            title="Play again"
          >
            🔊
          </button>
          <p style={{ fontSize: '0.85em', opacity: 0.6, marginTop: '8px' }}>Tap to replay</p>
        </div>
      ) : (
        <p style={{ fontStyle: 'italic', fontSize: '1.2em', margin: '20px' }}>
          {questionPrompt}
        </p>
      )}
      <p>{questionText}</p>

      <div className="options-container">
        {!isAnswered ? (
          <>
            {options.map(option => (
              <button
                key={option}
                onClick={() => handleOptionClick(option)}
                className={getOptionButtonClass(option)}
                disabled={isAnswered}
              >
                {option} 
              </button>
            ))}
            <button
              onClick={() => handleOptionClick(null)}
              className={getPassButtonClass()}
              disabled={isAnswered}
            >
              Pass ⏭️
            </button>
          </>
        ) : (
          <>
            {options.map(option => (
              <button
                key={option}
                className={getOptionButtonClass(option)}
                disabled={true}
              >
                {option}
              </button>
            ))}

            <div className="feedback-area">
              {feedbackMessage && <p className="feedback-message">{feedbackMessage}</p>}
              
              {feedbackInfo.map((info, index) => (
                <div key={index} className="feedback-item">
                  {info.label && <strong className="feedback-label">{info.label}: </strong>}
                  
                  {language === 'en' && (
                      <>
                        <span className="feedback-word-en">{info.word_en}</span> (
                        <span className="feedback-word-tr">{info.word_tr}</span>)
                        <p className="feedback-definition-en">EN: {info.definition_en}</p>
                        <p className="feedback-definition-tr">TR: {info.definition_tr}</p>
                      </>
                  )}

                  {language === 'en_march_2026' && (
                      <>
                        <p className="feedback-definition-en">Word: {info.word_en}</p>
                        <p className="feedback-definition-en">Meaning: {info.definition_en}</p>
                      </>
                  )}

                  {language === 'en_words' && (
                      <>
                        <span className="feedback-word-en">{info.word_en}</span> = {' '}
                        <span className="feedback-word-tr">{info.word_tr}</span>
                      </>
                  )}
                  
                  {language === 'de' && (
                      <>
                        <span className="feedback-word-de">{info.word_de}</span> = {' '}
                        <span className="feedback-word-tr">{info.word_tr}</span>
                      </>
                  )}
                </div>
              ))}
            </div>

            <div ref={nextButtonRef} style={{ marginTop: '20px', marginBottom: '40px' }}> 
              <button
                onClick={onNextQuestion}
                className="button-next"
              >
                Next Question 👉
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default QuestionScreen;