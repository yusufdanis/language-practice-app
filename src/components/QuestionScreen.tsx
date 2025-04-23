import React, { useState, useEffect, useRef } from 'react';
import { VocabularyItem, Language, isEnglishVocabularyItem, isGermanVocabularyItem } from '../types';
import { shuffleArray } from '../utils/shuffle';

interface FeedbackDetail {
  label?: string;
  word_en?: string;
  definition_en?: string;
  word_de?: string;
  word_tr: string;
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
}

const QuestionScreen: React.FC<QuestionScreenProps> = ({
  questionItem,
  allVocabulary,
  questionNumber,
  totalQuestions,
  onAnswerSelected,
  onNextQuestion,
  language,
}) => {
  const [options, setOptions] = useState<string[]>([]);
  const [isAnswered, setIsAnswered] = useState<boolean>(false);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [feedbackInfo, setFeedbackInfo] = useState<FeedbackDetail[]>([]);
  const [feedbackMessage, setFeedbackMessage] = useState<string>('');
  const nextButtonRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setIsAnswered(false);
    setSelectedAnswer(null);
    setFeedbackInfo([]);
    setFeedbackMessage('');

    let correctWord = '';
    let distractors: string[] = [];

    if (language === 'en' && isEnglishVocabularyItem(questionItem)) {
      correctWord = questionItem.word_en;
      distractors = allVocabulary
        .filter(isEnglishVocabularyItem)
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

  }, [questionItem, allVocabulary, language]);

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
    } else if (language === 'de' && isGermanVocabularyItem(questionItem)) {
        isCorrect = selectedOption === questionItem.word_tr;
    }

    if (selectedOption === null) {
        message = 'Passed. The correct answer was: 💡';
        if (language === 'en' && isEnglishVocabularyItem(questionItem)) {
            feedback.push({
                label: 'Correct Answer',
                word_en: questionItem.word_en,
                word_tr: questionItem.word_tr,
                definition_en: questionItem.definition_en,
                definition_tr: questionItem.definition_tr
            });
        } else if (language === 'de' && isGermanVocabularyItem(questionItem)) {
            feedback.push({
                label: 'Correct Answer',
                word_de: questionItem.word_de,
                word_tr: questionItem.word_tr
            });
        }
    } else if (isCorrect) {
        message = 'Correct! Well done! ✅';
        if (language === 'en' && isEnglishVocabularyItem(questionItem)) {
            feedback.push({
                word_en: questionItem.word_en,
                word_tr: questionItem.word_tr,
                definition_en: questionItem.definition_en,
                definition_tr: questionItem.definition_tr
            });
        } else if (language === 'de' && isGermanVocabularyItem(questionItem)) {
            feedback.push({
                word_de: questionItem.word_de,
                word_tr: questionItem.word_tr
            });
        }
    } else {
        message = 'Incorrect. 🤔';
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
  } else if (language === 'de' && isGermanVocabularyItem(questionItem)) {
    questionPrompt = `"${questionItem.word_de}"`;
    questionText = "Which is the correct Turkish translation?";
  } else {
    return <div>Error: Invalid question data for the selected language.</div>;
  }

  return (
    <div className="screen-container">
      <h2>Question {questionNumber}/{totalQuestions}</h2>
      <p style={{ fontStyle: 'italic', fontSize: '1.2em', margin: '20px' }}>
        {questionPrompt}
      </p>
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
            <button
              className={getPassButtonClass()}
              disabled={true}
            >
              Pass ⏭️
            </button>

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