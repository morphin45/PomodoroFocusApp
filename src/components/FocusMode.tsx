import { useState, useEffect } from 'react';

interface FocusModeProps {
  isActive: boolean;
  onToggle: () => void;
  duration: number; // in minutes
}

export default function FocusMode({ isActive, onToggle, duration }: FocusModeProps) {
  const [timeLeft, setTimeLeft] = useState(duration * 60);
  const [blockedSites, setBlockedSites] = useState<string[]>([
    'facebook.com',
    'twitter.com',
    'instagram.com',
    'youtube.com',
    'reddit.com',
  ]);
  const [newSite, setNewSite] = useState('');

  useEffect(() => {
    if (isActive && timeLeft > 0) {
      const interval = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
      return () => clearInterval(interval);
    } else if (timeLeft === 0) {
      onToggle();
    }
  }, [isActive, timeLeft, onToggle]);

  useEffect(() => {
    if (isActive) {
      setTimeLeft(duration * 60);
    }
  }, [duration, isActive]);

  const formatTime = (seconds: number) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    if (hrs > 0) {
      return `${hrs}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const addBlockedSite = () => {
    if (newSite && !blockedSites.includes(newSite)) {
      setBlockedSites([...blockedSites, newSite]);
      setNewSite('');
    }
  };

  const removeBlockedSite = (site: string) => {
    setBlockedSites(blockedSites.filter((s) => s !== site));
  };

  const progress = ((duration * 60 - timeLeft) / (duration * 60)) * 100;

  return (
    <div className={`focus-mode ${isActive ? 'active' : ''}`}>
      <div className="focus-mode-header">
        <h2>🎯 Focus Mode</h2>
        <p className="focus-mode-subtitle">Block distractions and stay focused</p>
      </div>

      {isActive && (
        <div className="focus-mode-active">
          <div className="focus-timer-circle">
            <svg viewBox="0 0 100 100">
              <circle
                cx="50"
                cy="50"
                r="45"
                fill="none"
                stroke="rgba(0,0,0,0.1)"
                strokeWidth="8"
              />
              <circle
                cx="50"
                cy="50"
                r="45"
                fill="none"
                stroke="var(--red)"
                strokeWidth="8"
                strokeDasharray={`${(progress / 100) * 283} 283`}
                strokeLinecap="round"
                transform="rotate(-90 50 50)"
              />
            </svg>
            <div className="focus-timer-display">{formatTime(timeLeft)}</div>
          </div>
          <p className="focus-mode-message">Stay focused! You're doing great.</p>
        </div>
      )}

      <div className="focus-mode-controls">
        <button
          className={`focus-toggle-btn ${isActive ? 'active' : ''}`}
          onClick={onToggle}
        >
          {isActive ? '🔓 Exit Focus Mode' : '🔒 Enter Focus Mode'}
        </button>
      </div>

      <div className="blocked-sites-section">
        <h3>Blocked Websites</h3>
        <p className="section-description">
          These sites will be blocked during focus mode
        </p>

        <div className="add-site-form">
          <input
            type="text"
            placeholder="Add website (e.g., facebook.com)"
            value={newSite}
            onChange={(e) => setNewSite(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && addBlockedSite()}
          />
          <button onClick={addBlockedSite}>Add</button>
        </div>

        <div className="blocked-sites-list">
          {blockedSites.map((site) => (
            <div key={site} className="blocked-site-item">
              <span className="site-icon">🚫</span>
              <span className="site-name">{site}</span>
              <button
                className="remove-site-btn"
                onClick={() => removeBlockedSite(site)}
              >
                ✕
              </button>
            </div>
          ))}
        </div>
      </div>

      <div className="focus-mode-tips">
        <h3>💡 Focus Mode Tips</h3>
        <ul>
          <li>Close unnecessary browser tabs</li>
          <li>Put your phone in another room</li>
          <li>Use noise-cancelling headphones</li>
          <li>Set a clear goal for this session</li>
          <li>Take breaks seriously when they come</li>
        </ul>
      </div>
    </div>
  );
}
