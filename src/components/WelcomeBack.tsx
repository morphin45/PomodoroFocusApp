import { useEffect, useState } from 'react';

interface WelcomeBackProps {
  userName: string;
  currentStreak: number;
  todaySessions: number;
  todayFocusMinutes: number;
  lastSessionDate?: string;
}

export default function WelcomeBack({ 
  userName, 
  currentStreak, 
  todaySessions, 
  todayFocusMinutes,
  lastSessionDate 
}: WelcomeBackProps) {
  const [showWelcome, setShowWelcome] = useState(false);
  const [greeting, setGreeting] = useState('');

  useEffect(() => {
    // Show welcome on mount
    setShowWelcome(true);
    
    // Set greeting based on time of day
    const hour = new Date().getHours();
    if (hour < 12) {
      setGreeting('Good morning');
    } else if (hour < 18) {
      setGreeting('Good afternoon');
    } else {
      setGreeting('Good evening');
    }

    // Auto-hide after 5 seconds
    const timer = setTimeout(() => {
      setShowWelcome(false);
    }, 5000);

    return () => clearTimeout(timer);
  }, []);

  const getMotivationalMessage = () => {
    if (currentStreak === 0) {
      return "Let's start a new streak today! 🚀";
    } else if (currentStreak < 3) {
      return `Great start! Keep going to build your streak! 💪`;
    } else if (currentStreak < 7) {
      return `Amazing! ${currentStreak} days in a row! You're on fire! 🔥`;
    } else if (currentStreak < 30) {
      return `Incredible! ${currentStreak} day streak! You're unstoppable! ⭐`;
    } else {
      return `Legendary! ${currentStreak} days! You're a productivity master! 👑`;
    }
  };

  const getLastSessionMessage = () => {
    if (!lastSessionDate) {
      return "Ready to start your first session?";
    }

    const lastDate = new Date(lastSessionDate);
    const today = new Date();
    const diffDays = Math.floor((today.getTime() - lastDate.getTime()) / (1000 * 60 * 60 * 24));

    if (diffDays === 0) {
      return "Welcome back! Let's continue your momentum!";
    } else if (diffDays === 1) {
      return "Great to see you again! Ready for another productive day?";
    } else if (diffDays < 7) {
      return `It's been ${diffDays} days. Let's get back on track!`;
    } else {
      return "Welcome back! Every day is a fresh start!";
    }
  };

  if (!showWelcome) return null;

  return (
    <div className="welcome-back-overlay">
      <div className="welcome-back-card">
        <div className="welcome-icon">👋</div>
        <h2 className="welcome-title">
          {greeting}, {userName || 'there'}!
        </h2>
        <p className="welcome-message">{getLastSessionMessage()}</p>
        
        <div className="welcome-stats">
          {currentStreak > 0 && (
            <div className="welcome-stat">
              <div className="stat-icon">🔥</div>
              <div className="stat-value">{currentStreak}</div>
              <div className="stat-label">Day Streak</div>
            </div>
          )}
          {todaySessions > 0 && (
            <div className="welcome-stat">
              <div className="stat-icon">🍅</div>
              <div className="stat-value">{todaySessions}</div>
              <div className="stat-label">Sessions Today</div>
            </div>
          )}
          {todayFocusMinutes > 0 && (
            <div className="welcome-stat">
              <div className="stat-icon">⏱️</div>
              <div className="stat-value">{todayFocusMinutes}</div>
              <div className="stat-label">Minutes Focused</div>
            </div>
          )}
        </div>

        <p className="welcome-motivation">{getMotivationalMessage()}</p>
      </div>
    </div>
  );
}
