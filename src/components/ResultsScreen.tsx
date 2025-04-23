import React from 'react';

interface ResultsScreenProps {
  score: {
    correct: number;
    incorrect: number;
  };
  onStartAgain: () => void;
}

const ResultsScreen: React.FC<ResultsScreenProps> = ({ score, onStartAgain }) => {
  const totalQuestions = score.correct + score.incorrect;
  const percentage = totalQuestions > 0 ? Math.round((score.correct / totalQuestions) * 100) : 0;

  let message = "Keep practicing!";
  if (percentage === 100) {
    message = "Perfect score! Amazing job!";
  } else if (percentage >= 80) {
    message = "Great work! You're doing really well!";
  } else if (percentage >= 50) {
    message = "Good effort! Keep it up!";
  }

  return (
    <div className="screen-container">
      <h2>Session Results</h2>
      <p style={{ fontSize: '1.2em', fontWeight: 'bold' }}>
          Correct: {score.correct} / Incorrect: {score.incorrect}
      </p>
      <p style={{ fontSize: '1.1em' }}>
          ({percentage}% Correct)
      </p>
      <p style={{ fontStyle: 'italic' }}>
          {message}
      </p>
      <button
        onClick={onStartAgain}
        className="button-start"
      >
        Start Again
      </button>
    </div>
  );
};

export default ResultsScreen; 