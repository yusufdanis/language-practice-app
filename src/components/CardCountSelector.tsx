import React from 'react';

interface CardCountSelectorProps {
  totalCards: number;
  onSelectCount: (count: number) => void;
}

const CardCountSelector: React.FC<CardCountSelectorProps> = ({ totalCards, onSelectCount }) => {
  const options = [10, 30, 50].filter(n => n <= totalCards);

  return (
    <div className="language-selector" style={styles.container}>
      <h2 style={styles.heading}>How many cards?</h2>
      <p style={styles.subtitle}>Choose the number of questions</p>
      <div style={styles.optionsContainer}>
        {options.map(count => (
          <button
            key={count}
            className="mode-selector-button"
            style={styles.button}
            onClick={() => onSelectCount(count)}
          >
            <span style={styles.buttonTitle}>{count}</span>
          </button>
        ))}
        <button
          className="mode-selector-button"
          style={styles.button}
          onClick={() => onSelectCount(totalCards)}
        >
          <span style={styles.buttonTitle}>All ({totalCards})</span>
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
    gap: '15px',
    width: '100%',
    maxWidth: '320px',
  },
  button: {
    display: 'flex',
    flexDirection: 'column' as const,
    alignItems: 'center',
    padding: '16px',
    fontSize: '1em',
    cursor: 'pointer',
    border: 'none',
    borderRadius: '12px',
    backgroundColor: '#007bff',
    color: 'white',
    transition: 'background-color 0.2s ease, transform 0.1s ease',
    gap: '4px',
  },
  buttonTitle: {
    fontSize: '1.15em',
    fontWeight: 600 as const,
  },
};

export default CardCountSelector;
