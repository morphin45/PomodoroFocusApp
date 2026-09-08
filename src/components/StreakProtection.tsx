import { useState } from 'react';

interface StreakProtectionProps {
  currentStreak: number;
  longestStreak: number;
  streakFreezes: number;
  onUseFreeze: () => void;
  onBuyFreeze: () => void;
}

export default function StreakProtection({
  currentStreak,
  longestStreak,
  streakFreezes,
  onUseFreeze,
  onBuyFreeze,
}: StreakProtectionProps) {
  const [showConfirmation, setShowConfirmation] = useState(false);

  const handleUseFreeze = () => {
    if (streakFreezes > 0) {
      setShowConfirmation(true);
    }
  };

  const confirmUseFreeze = () => {
    onUseFreeze();
    setShowConfirmation(false);
  };

  return (
    <div className="streak-protection">
      <div className="streak-header">
        <h2>Streak Protection</h2>
        <p className="streak-subtitle">Protect your hard-earned progress</p>
      </div>

      <div className="streak-stats">
        <div className="streak-stat">
          <div className="streak-icon">🔥</div>
          <div className="streak-value">{currentStreak}</div>
          <div className="streak-label">Current Streak</div>
        </div>
        <div className="streak-stat">
          <div className="streak-icon">🏆</div>
          <div className="streak-value">{longestStreak}</div>
          <div className="streak-label">Longest Streak</div>
        </div>
        <div className="streak-stat">
          <div className="streak-icon">❄️</div>
          <div className="streak-value">{streakFreezes}</div>
          <div className="streak-label">Freezes Available</div>
        </div>
      </div>

      <div className="streak-info">
        <h3>What are Streak Freezes?</h3>
        <p>
          Life happens! Streak freezes allow you to miss a day without losing your streak.
          Use them wisely - they're precious!
        </p>
      </div>

      <div className="streak-actions">
        <button
          className="use-freeze-btn"
          onClick={handleUseFreeze}
          disabled={streakFreezes === 0 || currentStreak === 0}
        >
          <span className="btn-icon">❄️</span>
          Use Streak Freeze
        </button>

        <button className="buy-freeze-btn" onClick={onBuyFreeze}>
          <span className="btn-icon">💎</span>
          Buy More Freezes
          <span className="premium-badge">PRO</span>
        </button>
      </div>

      <div className="streak-tips">
        <h3>💡 Tips to Maintain Your Streak</h3>
        <ul>
          <li>Set daily reminders to stay on track</li>
          <li>Start with shorter focus sessions if needed</li>
          <li>Even one pomodoro counts!</li>
          <li>Use streak freezes for emergencies only</li>
        </ul>
      </div>

      {showConfirmation && (
        <div className="confirmation-modal">
          <div className="confirmation-content">
            <h3>Use Streak Freeze?</h3>
            <p>
              This will protect your current streak of {currentStreak} days.
              You have {streakFreezes - 1} freeze{streakFreezes - 1 !== 1 ? 's' : ''} remaining.
            </p>
            <div className="confirmation-actions">
              <button className="cancel-btn" onClick={() => setShowConfirmation(false)}>
                Cancel
              </button>
              <button className="confirm-btn" onClick={confirmUseFreeze}>
                Use Freeze
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
