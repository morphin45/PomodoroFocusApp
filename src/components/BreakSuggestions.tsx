import { useState, useEffect } from 'react';

interface BreakActivity {
  id: string;
  title: string;
  description: string;
  duration: string;
  icon: string;
  category: 'stretch' | 'eyes' | 'mindfulness' | 'movement' | 'hydration';
}

const BREAK_ACTIVITIES: BreakActivity[] = [
  {
    id: '1',
    title: '20-20-20 Eye Rest',
    description: 'Look at something 20 feet away for 20 seconds',
    duration: '20 sec',
    icon: '👁️',
    category: 'eyes',
  },
  {
    id: '2',
    title: 'Neck Stretches',
    description: 'Gently tilt your head side to side',
    duration: '30 sec',
    icon: '🧘',
    category: 'stretch',
  },
  {
    id: '3',
    title: 'Deep Breathing',
    description: '4 counts in, 4 counts out',
    duration: '1 min',
    icon: '🌬️',
    category: 'mindfulness',
  },
  {
    id: '4',
    title: 'Stand & Walk',
    description: 'Get up and walk around',
    duration: '2 min',
    icon: '🚶',
    category: 'movement',
  },
  {
    id: '5',
    title: 'Hydration Break',
    description: 'Drink a glass of water',
    duration: '30 sec',
    icon: '💧',
    category: 'hydration',
  },
  {
    id: '6',
    title: 'Shoulder Rolls',
    description: 'Roll shoulders forward and backward',
    duration: '30 sec',
    icon: '💪',
    category: 'stretch',
  },
  {
    id: '7',
    title: 'Palm Eye Rest',
    description: 'Cover eyes with warm palms',
    duration: '30 sec',
    icon: '🤲',
    category: 'eyes',
  },
  {
    id: '8',
    title: 'Mindful Moment',
    description: 'Close eyes and focus on breathing',
    duration: '1 min',
    icon: '🧘‍♀️',
    category: 'mindfulness',
  },
  {
    id: '9',
    title: 'Wrist Stretches',
    description: 'Extend and flex your wrists',
    duration: '30 sec',
    icon: '✋',
    category: 'stretch',
  },
  {
    id: '10',
    title: 'Quick Snack',
    description: 'Grab a healthy snack',
    duration: '2 min',
    icon: '🍎',
    category: 'hydration',
  },
];

export default function BreakSuggestions() {
  const [currentActivity, setCurrentActivity] = useState<BreakActivity | null>(null);
  const [timer, setTimer] = useState<number | null>(null);
  const [isRunning, setIsRunning] = useState(false);

  const getRandomActivity = () => {
    const randomIndex = Math.floor(Math.random() * BREAK_ACTIVITIES.length);
    setCurrentActivity(BREAK_ACTIVITIES[randomIndex]);
  };

  useEffect(() => {
    if (isRunning && timer !== null && timer > 0) {
      const interval = setInterval(() => {
        setTimer((prev) => (prev !== null ? prev - 1 : null));
      }, 1000);
      return () => clearInterval(interval);
    } else if (timer === 0) {
      setIsRunning(false);
      // Play completion sound
      const audio = new Audio('data:audio/wav;base64,UklGnoYAWkFWRm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQ==');
      audio.play().catch(() => {});
    }
  }, [isRunning, timer]);

  const startActivity = (activity: BreakActivity) => {
    setCurrentActivity(activity);
    const durationSeconds = parseInt(activity.duration.split(' ')[0]) * (activity.duration.includes('min') ? 60 : 1);
    setTimer(durationSeconds);
    setIsRunning(true);
  };

  const stopActivity = () => {
    setIsRunning(false);
    setTimer(null);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="break-suggestions">
      <div className="break-header">
        <h2>Break Activities</h2>
        <p className="break-subtitle">Make your breaks count</p>
      </div>

      {currentActivity && timer !== null && (
        <div className="active-activity">
          <div className="activity-icon-large">{currentActivity.icon}</div>
          <h3>{currentActivity.title}</h3>
          <p>{currentActivity.description}</p>
          <div className="activity-timer">
            <div className="timer-display">{formatTime(timer)}</div>
            <div className="timer-controls">
              <button
                className={`timer-btn ${isRunning ? 'pause' : 'play'}`}
                onClick={() => setIsRunning(!isRunning)}
              >
                {isRunning ? '⏸' : '▶'}
              </button>
              <button className="timer-btn stop" onClick={stopActivity}>
                ⏹
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="activity-categories">
        <button
          className="random-activity-btn"
          onClick={getRandomActivity}
        >
          🎲 Surprise Me
        </button>
      </div>

      <div className="activities-grid">
        {BREAK_ACTIVITIES.map((activity) => (
          <div
            key={activity.id}
            className="activity-card"
            onClick={() => startActivity(activity)}
          >
            <div className="activity-icon">{activity.icon}</div>
            <div className="activity-info">
              <h4>{activity.title}</h4>
              <p>{activity.description}</p>
              <span className="activity-duration">{activity.duration}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
