import { useState, useEffect, useRef } from 'react';

type Mode = 'work' | 'shortBreak' | 'longBreak';

interface State {
  mode: Mode;
  timeLeft: number;
  isRunning: boolean;
  completedSessions: number;
  task: string;
}

const DURATIONS: Record<Mode, number> = {
  work: 25 * 60,
  shortBreak: 5 * 60,
  longBreak: 15 * 60,
};

const LABELS: Record<Mode, string> = {
  work: 'Focus Time',
  shortBreak: 'Short Break',
  longBreak: 'Long Break',
};

const COLORS: Record<Mode, string> = {
  work: '#ef5350',
  shortBreak: '#65b86b',
  longBreak: '#4f8df7',
};

function formatTime(seconds: number): string {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  return `${String(minutes).padStart(2, '0')}:${String(remainingSeconds).padStart(2, '0')}`;
}

function playSound() {
  const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
  const oscillator = audioContext.createOscillator();
  const gain = audioContext.createGain();

  oscillator.frequency.value = 700;
  gain.gain.value = 0.08;

  oscillator.connect(gain);
  gain.connect(audioContext.destination);

  oscillator.start();
  oscillator.stop(audioContext.currentTime + 0.25);
}

export default function App() {
  const [state, setState] = useState<State>(() => {
    const saved = localStorage.getItem('pomodoroState');
    if (saved) {
      const parsed = JSON.parse(saved);
      return { ...parsed, isRunning: false };
    }
    return {
      mode: 'work',
      timeLeft: DURATIONS.work,
      isRunning: false,
      completedSessions: 0,
      task: '',
    };
  });

  const intervalRef = useRef<number | null>(null);

  // Save state to localStorage
  useEffect(() => {
    localStorage.setItem('pomodoroState', JSON.stringify(state));
  }, [state]);

  // Update document title
  useEffect(() => {
    document.title = `${formatTime(state.timeLeft)} - ${LABELS[state.mode]}`;
  }, [state.timeLeft, state.mode]);

  // Request notification permission
  useEffect(() => {
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }
  }, []);

  // Timer logic
  useEffect(() => {
    if (state.isRunning) {
      intervalRef.current = window.setInterval(() => {
        setState(prev => {
          const newTimeLeft = prev.timeLeft - 1;

          if (newTimeLeft <= 0) {
            // Session complete
            let newMode: Mode;
            let newCompletedSessions = prev.completedSessions;

            if (prev.mode === 'work') {
              newCompletedSessions++;
              newMode = newCompletedSessions % 4 === 0 ? 'longBreak' : 'shortBreak';
            } else {
              newMode = 'work';
            }

            // Play sound
            playSound();

            // Send notification
            if ('Notification' in window && Notification.permission === 'granted') {
              new Notification('Pomodoro complete', {
                body: `Your ${LABELS[newMode]} is ready.`,
              });
            }

            return {
              ...prev,
              mode: newMode,
              timeLeft: DURATIONS[newMode],
              isRunning: false,
              completedSessions: newCompletedSessions,
            };
          }

          return { ...prev, timeLeft: newTimeLeft };
        });
      }, 1000);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [state.isRunning]);

  const startTimer = () => {
    setState(prev => ({ ...prev, isRunning: true }));
  };

  const pauseTimer = () => {
    setState(prev => ({ ...prev, isRunning: false }));
  };

  const resetTimer = () => {
    setState(prev => ({
      ...prev,
      timeLeft: DURATIONS[prev.mode],
      isRunning: false,
    }));
  };

  const skipSession = () => {
    setState(prev => {
      let newMode: Mode;

      if (prev.mode === 'work') {
        newMode = prev.completedSessions % 4 === 3 ? 'longBreak' : 'shortBreak';
      } else {
        newMode = 'work';
      }

      return {
        ...prev,
        mode: newMode,
        timeLeft: DURATIONS[newMode],
        isRunning: false,
      };
    });
  };

  const selectMode = (mode: Mode) => {
    setState(prev => ({
      ...prev,
      mode,
      timeLeft: DURATIONS[mode],
      isRunning: false,
    }));
  };

  const updateTask = (task: string) => {
    setState(prev => ({ ...prev, task }));
  };

  // Calculate progress
  const progress = ((DURATIONS[state.mode] - state.timeLeft) / DURATIONS[state.mode]) * 360;
  const color = COLORS[state.mode];

  // Calculate message
  const getMessage = () => {
    if (state.isRunning) {
      return state.task || 'Stay focused...';
    }
    if (state.timeLeft === DURATIONS[state.mode]) {
      return 'Ready to focus?';
    }
    return 'Timer paused';
  };

  return (
    <div className="app">
      <div className="brand">
        <span className="brand-icon">🍅</span>
        <h1>Pomodoro Focus</h1>
      </div>

      <section className="card">
        <div className="tabs">
          <button
            className={`tab ${state.mode === 'work' ? 'active' : ''}`}
            onClick={() => selectMode('work')}
            style={state.mode === 'work' ? { background: color } : {}}
          >
            Focus
          </button>
          <button
            className={`tab ${state.mode === 'shortBreak' ? 'active' : ''}`}
            onClick={() => selectMode('shortBreak')}
            style={state.mode === 'shortBreak' ? { background: color } : {}}
          >
            Short Break
          </button>
          <button
            className={`tab ${state.mode === 'longBreak' ? 'active' : ''}`}
            onClick={() => selectMode('longBreak')}
            style={state.mode === 'longBreak' ? { background: color } : {}}
          >
            Long Break
          </button>
        </div>

        <div
          className="timer-ring"
          style={{
            background: `conic-gradient(${color} ${progress}deg, #f5e8e3 ${progress}deg)`,
          }}
        >
          <div className="timer-content">
            <div className="phase">{LABELS[state.mode]}</div>
            <div className="timer">{formatTime(state.timeLeft)}</div>
            <div className="message">{getMessage()}</div>
          </div>
        </div>

        <label className="task-label" htmlFor="task">
          What are you working on?
        </label>
        <input
          id="task"
          className="task-input"
          type="text"
          placeholder="Enter a task..."
          value={state.task}
          onChange={e => updateTask(e.target.value)}
        />

        <div className="controls">
          <button
            className="start"
            onClick={state.isRunning ? pauseTimer : startTimer}
            style={{ background: color }}
          >
            {state.isRunning ? 'Pause' : 'Start'}
          </button>
          <button className="secondary" onClick={resetTimer}>
            Reset
          </button>
        </div>

        <button className="secondary skip" onClick={skipSession}>
          Skip Session
        </button>

        <div className="session-area">
          <div className="session-title">
            Today's focus sessions: <strong>{state.completedSessions}</strong>
          </div>

          <div className="session-dots">
            {[0, 1, 2, 3].map(i => (
              <span
                key={i}
                className={`dot ${i < state.completedSessions % 4 ? 'completed' : ''}`}
                style={i < state.completedSessions % 4 ? { background: color } : {}}
              />
            ))}
          </div>
        </div>
      </section>

      <div className="footer">Focus for 25 minutes. Rest. Repeat.</div>
    </div>
  );
}
