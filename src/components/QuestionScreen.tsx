import React, { useState, useEffect } from 'react';
import { VocabularyItem } from '../types';
import { shuffleArray } from '../utils/shuffle'; // Import from utils

// Define the structure for feedback info, adding labels and English word/definition
interface FeedbackDetail {
  label?: string; // Optional label (e.g., 'Your Answer', 'Correct Answer')
  word_en: string;
  word_tr: string;
  definition_en: string; // Add English definition
  definition_tr: string;
}

interface QuestionScreenProps {
  questionItem: VocabularyItem;
  allVocabulary: VocabularyItem[];
  questionNumber: number;
  totalQuestions: number;
  onAnswerSelected: (selectedWord: string | null) => void; // Renamed prop for score update
  onNextQuestion: () => void; // New prop for advancing state
}

const QuestionScreen: React.FC<QuestionScreenProps> = ({
  questionItem,
  allVocabulary,
  questionNumber,
  totalQuestions,
  onAnswerSelected, // Use renamed prop
  onNextQuestion,   // Use new prop
}) => {
  const [options, setOptions] = useState<string[]>([]);
  const [isAnswered, setIsAnswered] = useState<boolean>(false);
  const [selectedWord, setSelectedWord] = useState<string | null>(null);
  const [feedbackInfo, setFeedbackInfo] = useState<FeedbackDetail[]>([]);
  const [feedbackMessage, setFeedbackMessage] = useState<string>(''); // State for feedback message

  // Reset state when the question item changes (new question loaded)
  useEffect(() => {
    setIsAnswered(false);
    setSelectedWord(null);
    setFeedbackInfo([]);
    setFeedbackMessage(''); // Reset feedback message

    // Generate options
    const correctWord = questionItem.word_en;
    const incorrectOptions = allVocabulary
      .filter(item => item.word_en !== correctWord)
      .map(item => item.word_en);
    const selectedIncorrect = shuffleArray(incorrectOptions).slice(0, 3);
    const allOptions = shuffleArray([correctWord, ...selectedIncorrect]);
    setOptions(allOptions);

  }, [questionItem, allVocabulary]);

  const handleOptionClick = (word: string | null) => {
    if (isAnswered) return; // Do nothing if already answered

    setSelectedWord(word);
    setIsAnswered(true);
    onAnswerSelected(word); // Notify App.tsx to update score

    const correctWordItem = questionItem; // This is the correct item
    let feedback: FeedbackDetail[] = [];
    let message = '';

    if (word === null) { // Passed
      message = 'Passed. The correct answer was:';
      feedback.push({
        label: 'Correct Answer',
        word_en: correctWordItem.word_en,
        word_tr: correctWordItem.word_tr,
        definition_en: correctWordItem.definition_en, // Add English definition
        definition_tr: correctWordItem.definition_tr
      });
    } else if (word === correctWordItem.word_en) { // Correct
      message = 'Correct! Well done!';
      feedback.push({
        word_en: correctWordItem.word_en,
        word_tr: correctWordItem.word_tr,
        definition_en: correctWordItem.definition_en, // Add English definition
        definition_tr: correctWordItem.definition_tr
      });
    } else { // Incorrect
      message = 'Incorrect.';
      const selectedWordItem = allVocabulary.find(item => item.word_en === word);
      if (selectedWordItem) {
        feedback.push({
          label: 'Your Answer',
          word_en: selectedWordItem.word_en, // Add English word
          word_tr: selectedWordItem.word_tr,
          definition_en: selectedWordItem.definition_en, // Add English definition
          definition_tr: selectedWordItem.definition_tr
        });
      }
      feedback.push({
        label: 'Correct Answer',
        word_en: correctWordItem.word_en, // Add English word
        word_tr: correctWordItem.word_tr,
        definition_en: correctWordItem.definition_en, // Add English definition
        definition_tr: correctWordItem.definition_tr
      });
    }
    setFeedbackInfo(feedback);
    setFeedbackMessage(message); // Set the feedback message
  };

  // Determine the CSS class for an option button based on the answer state
  const getOptionButtonClass = (option: string): string => {
    if (!isAnswered) {
      return 'option-button'; // Default class before answering
    }

    const isCorrect = option === questionItem.word_en;
    const isSelected = option === selectedWord;

    if (isCorrect) {
      return 'option-button option-button-correct';
    } else if (isSelected) {
      return 'option-button option-button-incorrect-selected';
    }
    // If answered but not the selected or correct one, it's disabled
    return 'option-button option-button-disabled';
  };

  // Get class for the Pass button
  const getPassButtonClass = (): string => {
    return isAnswered ? 'button-pass option-button-disabled' : 'button-pass';
  }

  return (
    <div className="screen-container">
      <h2>Question {questionNumber}/{totalQuestions}</h2>
      <p style={{ fontStyle: 'italic' }}>
          "{questionItem.definition_en}"
      </p>
      <p>Which word matches this definition?</p>

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
              Pass
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
              Pass
            </button>

            <div className="feedback-area">
              {/* Display the feedback message */}
              {feedbackMessage && <p className="feedback-message">{feedbackMessage}</p>}

              {/* Display detailed feedback */}
              {feedbackInfo.map((info, index) => (
                <div key={index} className="feedback-item">
                  {/* Add label if present */}
                  {info.label && <strong className="feedback-label">{info.label}: </strong>}
                  {/* Show English and Turkish word */}
                  <span className="feedback-word-en">{info.word_en}</span>{' '}
                  (<span className="feedback-word-tr">{info.word_tr}</span>)
                  {/* Show English definition */}
                  <p className="feedback-definition-en">EN: {info.definition_en}</p>
                  {/* Show Turkish definition */}
                  <p className="feedback-definition-tr">TR: {info.definition_tr}</p>
                </div>
              ))}
            </div>

            <button
              onClick={onNextQuestion}
              className="button-next"
            >
              Next Question
            </button>
          </>
        )}
      </div>
    </div>
  );
};

export default QuestionScreen; 