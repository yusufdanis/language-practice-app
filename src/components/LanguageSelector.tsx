import React from 'react';
import { Language } from '../types'; // Import the Language type

interface LanguageSelectorProps {
  onSelectLanguage: (language: Language) => void; // Function to call when a language is selected
}

const LanguageSelector: React.FC<LanguageSelectorProps> = ({ onSelectLanguage }) => {
  return (
    <div className="language-selector" style={styles.selectorContainer}>
      <h1 style={styles.greeting}>Hello Zeynep <span style={{color: 'red'}}>❤️</span></h1>
      <h2 style={styles.heading}>Choose Your Practice Language</h2>
      <div className="language-options" style={styles.optionsContainer}>
        <button style={styles.button} onClick={() => onSelectLanguage('en')}>
          English Practice <span role="img" aria-label="UK flag">🇬🇧</span>
        </button>
        <button style={styles.button} onClick={() => onSelectLanguage('de')}>
          German Practice <span role="img" aria-label="Germany flag">🇩🇪</span>
        </button>
      </div>
    </div>
  );
};

// Basic inline styles (consider moving to CSS file/module later)
const styles = {
  selectorContainer: {
    display: 'flex',
    flexDirection: 'column' as 'column', // Explicit type assertion
    alignItems: 'center',
    justifyContent: 'center',
    height: '100vh', /* Full viewport height */
    textAlign: 'center' as 'center' // Explicit type assertion
  },
  greeting: {
    marginBottom: '10px',
  },
  heading: {
    marginBottom: '30px'
  },
  optionsContainer: {
    display: 'flex',
    gap: '20px', /* Space between buttons */
  },
  button: {
    padding: '15px 30px',
    fontSize: '1.2em',
    cursor: 'pointer',
    border: 'none',
    borderRadius: '8px',
    backgroundColor: '#007bff',
    color: 'white',
    transition: 'background-color 0.2s ease'
    // Add hover styles via CSS or state if needed
  }
};

export default LanguageSelector; 