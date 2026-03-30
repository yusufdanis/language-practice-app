import React from 'react';
import { getSessionHistory, getLanguageLabel, SessionRecord } from '../utils/sessionHistory';
import { Language } from '../types';

interface UserHistoryProps {
  onBack: () => void;
}

interface LanguageStats {
  label: string;
  sessions: number;
  totalCorrect: number;
  totalIncorrect: number;
  lastPlayed: string;
}

const UserHistory: React.FC<UserHistoryProps> = ({ onBack }) => {
  const history = getSessionHistory();

  // Group by language
  const statsByLanguage = new Map<Language, LanguageStats>();
  for (const session of history) {
    const existing = statsByLanguage.get(session.language);
    if (existing) {
      existing.sessions++;
      existing.totalCorrect += session.correct;
      existing.totalIncorrect += session.incorrect;
      if (session.date > existing.lastPlayed) {
        existing.lastPlayed = session.date;
      }
    } else {
      statsByLanguage.set(session.language, {
        label: getLanguageLabel(session.language),
        sessions: 1,
        totalCorrect: session.correct,
        totalIncorrect: session.incorrect,
        lastPlayed: session.date,
      });
    }
  }

  const stats = Array.from(statsByLanguage.values()).sort(
    (a, b) => b.lastPlayed.localeCompare(a.lastPlayed)
  );

  const totalSessions = history.length;
  const totalCorrect = history.reduce((sum, s) => sum + s.correct, 0);
  const totalIncorrect = history.reduce((sum, s) => sum + s.incorrect, 0);
  const totalAnswered = totalCorrect + totalIncorrect;
  const overallPercentage = totalAnswered > 0 ? Math.round((totalCorrect / totalAnswered) * 100) : 0;

  const recentSessions = [...history].reverse();

  const formatDate = (iso: string) => {
    const d = new Date(iso);
    return d.toLocaleDateString('tr-TR', { day: 'numeric', month: 'short', year: 'numeric' });
  };

  const formatTime = (iso: string) => {
    const d = new Date(iso);
    return d.toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="screen-container" style={styles.container}>
      <button className="home-button" onClick={onBack} title="Back" style={{ position: 'absolute', top: '10px', left: '10px' }}>
        🏠
      </button>

      <h2 style={styles.title}>Practice History</h2>

      {history.length === 0 ? (
        <p style={styles.empty}>No practice sessions yet. Start playing to see your history here!</p>
      ) : (
        <>
          {/* Overall stats */}
          <div style={styles.overallCard}>
            <div style={styles.overallRow}>
              <span style={styles.overallLabel}>Total Sessions</span>
              <span style={styles.overallValue}>{totalSessions}</span>
            </div>
            <div style={styles.overallRow}>
              <span style={styles.overallLabel}>Total Answers</span>
              <span style={styles.overallValue}>{totalAnswered}</span>
            </div>
            <div style={styles.overallRow}>
              <span style={styles.overallLabel}>Overall Score</span>
              <span style={styles.overallValue}>{overallPercentage}%</span>
            </div>
          </div>

          {/* Per-language breakdown */}
          <h3 style={styles.sectionTitle}>By Practice Type</h3>
          {stats.map((s) => {
            const total = s.totalCorrect + s.totalIncorrect;
            const pct = total > 0 ? Math.round((s.totalCorrect / total) * 100) : 0;
            return (
              <div key={s.label} style={styles.langCard}>
                <div style={styles.langHeader}>{s.label}</div>
                <div style={styles.langDetails}>
                  <span>{s.sessions} session{s.sessions !== 1 ? 's' : ''}</span>
                  <span>✅ {s.totalCorrect} / ❌ {s.totalIncorrect}</span>
                  <span>{pct}%</span>
                </div>
                <div style={styles.langDate}>Last played: {formatDate(s.lastPlayed)}</div>
              </div>
            );
          })}

          {/* Recent sessions */}
          <h3 style={styles.sectionTitle}>All Sessions</h3>
          {recentSessions.map((s: SessionRecord, i: number) => {
            const total = s.correct + s.incorrect;
            const pct = total > 0 ? Math.round((s.correct / total) * 100) : 0;
            return (
              <div key={i} style={styles.recentCard}>
                <div style={styles.recentHeader}>
                  <span>{getLanguageLabel(s.language)}</span>
                  <span style={styles.recentDate}>{formatDate(s.date)} {formatTime(s.date)}</span>
                </div>
                <div style={styles.recentScore}>
                  ✅ {s.correct} / ❌ {s.incorrect} ({pct}%)
                </div>
              </div>
            );
          })}
        </>
      )}
    </div>
  );
};

const styles = {
  container: {
    maxWidth: '400px',
    margin: '0 auto',
    padding: '20px',
    paddingTop: '50px',
  },
  title: {
    textAlign: 'center' as const,
    marginBottom: '20px',
  },
  empty: {
    textAlign: 'center' as const,
    opacity: 0.7,
    marginTop: '40px',
  },
  overallCard: {
    backgroundColor: '#007bff',
    color: 'white',
    borderRadius: '12px',
    padding: '16px',
    marginBottom: '24px',
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '8px',
  },
  overallRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  overallLabel: {
    fontSize: '0.95em',
    opacity: 0.9,
  },
  overallValue: {
    fontSize: '1.1em',
    fontWeight: 700 as const,
  },
  sectionTitle: {
    marginBottom: '12px',
    marginTop: '8px',
  },
  langCard: {
    border: '1px solid #ddd',
    borderRadius: '10px',
    padding: '12px',
    marginBottom: '10px',
  },
  langHeader: {
    fontWeight: 600 as const,
    marginBottom: '6px',
  },
  langDetails: {
    display: 'flex',
    justifyContent: 'space-between',
    fontSize: '0.9em',
    opacity: 0.85,
  },
  langDate: {
    fontSize: '0.8em',
    opacity: 0.6,
    marginTop: '6px',
  },
  recentCard: {
    border: '1px solid #eee',
    borderRadius: '8px',
    padding: '10px',
    marginBottom: '8px',
  },
  recentHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    fontSize: '0.85em',
    marginBottom: '4px',
  },
  recentDate: {
    opacity: 0.6,
    fontSize: '0.8em',
  },
  recentScore: {
    fontSize: '0.9em',
  },
};

export default UserHistory;
