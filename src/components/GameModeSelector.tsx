import React from 'react';

export type GameMode = 'text' | 'sound';

interface GameModeSelectorProps {
  onSelectMode: (mode: GameMode) => void;
}

const GameModeSelector: React.FC<GameModeSelectorProps> = ({ onSelectMode }) => {
  return (
    <div className="language-selector" style={styles.container}>
      <h2 style={styles.heading}>March 2026</h2>
      <p style={styles.subtitle}>Choose your game mode</p>
      <div style={styles.optionsContainer}>
        <button
          className="mode-selector-button"
          style={styles.button}
          onClick={() => onSelectMode('text')}
        >
          <span style={styles.emoji}>📖</span>
          <span style={styles.buttonTitle}>Text</span>
          <span style={styles.buttonDesc}>Read the definition</span>
        </button>
        <button
          className="mode-selector-button"
          style={styles.button}
          onClick={() => onSelectMode('sound')}
        >
          <span style={styles.emoji}>🔊</span>
          <span style={styles.buttonTitle}>Sound</span>
          <span style={styles.buttonDesc}>Listen to the definition</span>
        </button>
      </div>
    </div>
  );
};

const styles = {
  container: {
    display: 'flex',
    flexDirection: 'column' as const,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: '60vh',
    textAlign: 'center' as const,
  },
  heading: {
    marginBottom: '5px',
  },
  subtitle: {
    marginBottom: '30px',
    opacity: 0.7,
  },
  optionsContainer: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '20px',
    width: '100%',
    maxWidth: '320px',
  },
  button: {
    display: 'flex',
    flexDirection: 'column' as const,
    alignItems: 'center',
    padding: '20px',
    fontSize: '1em',
    cursor: 'pointer',
    border: 'none',
    borderRadius: '12px',
    backgroundColor: '#007bff',
    color: 'white',
    transition: 'background-color 0.2s ease, transform 0.1s ease',
    gap: '6px',
  },
  emoji: {
    fontSize: '1.8em',
  },
  buttonTitle: {
    fontSize: '1.15em',
    fontWeight: 600 as const,
  },
  buttonDesc: {
    fontSize: '0.85em',
    opacity: 0.85,
  },
};

export default GameModeSelector;
