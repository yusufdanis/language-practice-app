import React from 'react';

interface WelcomeScreenProps {
  onStart: () => void; // Callback function when the 'Let's Start' button is clicked
}

const WelcomeScreen: React.FC<WelcomeScreenProps> = ({ onStart }) => {
  return (
    <div className="screen-container">
      <h1>Welcome to the English Vocabulary Practice App!</h1>
      <p>Ready to test your knowledge?</p>
      <button onClick={onStart} className="button-start">
        Let's Start 🚀
      </button>
    </div>
  );
};

export default WelcomeScreen; 