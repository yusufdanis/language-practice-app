import React from 'react';
import { Language, Score } from '../types';

interface ResultsScreenProps {
  score: Score;
  onStartAgain: () => void;
  onChangeLanguage: () => void;
  language: Language;
}

const ResultsScreen: React.FC<ResultsScreenProps> = ({ score, onStartAgain, onChangeLanguage, language }) => {
  const totalAnswered = score.correct + score.incorrect;
  const percentage = totalAnswered > 0 ? Math.round((score.correct / totalAnswered) * 100) : 0;

  let message = "Keep practicing! 🤔📚";
  if (totalAnswered === 0) {
    message = "Ready to try again?";
  } else if (percentage === 100) {
    message = "Perfect score! Amazing job! 🎉💯";
  } else if (percentage >= 80) {
    message = "Great work! You're doing really well! 👍✨";
  } else if (percentage >= 50) {
    message = "Good effort! Keep it up! 💪";
  }

  return (
    <div className="screen-container">
      <h2>Session Results</h2>
      <p style={{ fontSize: '1.2em', fontWeight: 'bold' }}>
          Correct: ✅ {score.correct} / Incorrect: ❌ {score.incorrect}
      </p>
      {totalAnswered > 0 && (
          <p style={{ fontSize: '1.1em' }}>
              ({percentage}% Correct)
          </p>
      )}
      <p style={{ fontStyle: 'italic', marginTop: '15px' }}>
          {message}
      </p>
      <div style={{
          marginTop: '25px',
          display: 'flex', 
          flexDirection: 'column',
          alignItems: 'center',
          gap: '15px'
      }}>
          <button
            onClick={onStartAgain}
            className="button-start"
            style={{ fontSize: '1em', width: '200px'}}
          >
            Start Again ({language === 'en' ? 'English' : 'German'}) 🔄
          </button>
          <button
            onClick={onChangeLanguage}
            className="button-secondary"
            style={{ fontSize: '1em', width: '200px'}}
          >
            Change Language 🌐
          </button>
      </div>
    </div>
  );
};

export default ResultsScreen; 