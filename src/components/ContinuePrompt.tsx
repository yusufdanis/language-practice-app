import React from 'react';

interface ContinuePromptProps {
  onContinue: () => void; // Handler for "Yes"
  onStop: () => void;     // Handler for "No"
}

const ContinuePrompt: React.FC<ContinuePromptProps> = ({ onContinue, onStop }) => {
  return (
    <div className="screen-container">
      <h2>Session Complete!</h2>
      <p>Do you want to start another 10-question session?</p>
      <div style={{ marginTop: '30px', display: 'flex', justifyContent: 'center', gap: '20px' }}>
        <button
          onClick={onContinue}
          className="button-continue-yes"
        >
          Yes ✅
        </button>
        <button
          onClick={onStop}
          className="button-continue-no"
        >
          No ❌
        </button>
      </div>
    </div>
  );
};

export default ContinuePrompt; 