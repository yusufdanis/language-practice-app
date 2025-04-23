import React, { useState, useEffect } from 'react';
import { VocabularyItem } from '../types';
import { shuffleArray } from '../utils/shuffle'; // Import from utils

// Define the structure for feedback info
interface FeedbackDetail {
  word_tr: string;
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

  // Reset state when the question item changes (new question loaded)
  useEffect(() => {
    setIsAnswered(false);
    setSelectedWord(null);
    setFeedbackInfo([]);

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

    if (word === null) { // Passed
      feedback.push({ word_tr: correctWordItem.word_tr, definition_tr: correctWordItem.definition_tr });
    } else if (word === correctWordItem.word_en) { // Correct
      feedback.push({ word_tr: correctWordItem.word_tr, definition_tr: correctWordItem.definition_tr });
    } else { // Incorrect
      const selectedWordItem = allVocabulary.find(item => item.word_en === word);
      if (selectedWordItem) {
        feedback.push({ word_tr: selectedWordItem.word_tr, definition_tr: selectedWordItem.definition_tr });
      }
      feedback.push({ word_tr: correctWordItem.word_tr, definition_tr: correctWordItem.definition_tr });
    }
    setFeedbackInfo(feedback);
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
              {feedbackInfo.map((info, index) => (
                <div key={index} className="feedback-item">
                  <strong>{info.word_tr}</strong>: {info.definition_tr}
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