import React from 'react';
import { Language } from '../types'; // Import Language type

interface WelcomeScreenProps {
  onStart: () => void; // Callback function when the 'Let's Start' button is clicked
  language: Language; // Add language prop
}

const WelcomeScreen: React.FC<WelcomeScreenProps> = ({ onStart, language }) => {
  const practiceLanguage = language === 'en' ? 'English' : 'German';

  return (
    <div className="screen-container">
      <h1>Welcome to the {practiceLanguage} Vocabulary Practice App!</h1>
      <p>Ready for {practiceLanguage} Practice?</p>
      <button onClick={onStart} className="button-start">
        Let's Start 🚀
      </button>
    </div>
  );
};

export default WelcomeScreen; 