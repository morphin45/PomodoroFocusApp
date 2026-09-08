import { useState, useEffect, useRef } from 'react';

type Mode = 'work' | 'shortBreak' | 'longBreak';
type Technique = 'classic' | 'extended' | 'short' | 'deep';

interface State {
  mode: Mode;
  timeLeft: number;
  isRunning: boolean;
  completedSessions: number;
  task: string;
  technique: Technique;
}

interface TechniqueConfig {
  name: string;
  work: number;
  shortBreak: number;
  longBreak: number;
  description: string;
}

const TECHNIQUES: Record<Technique, TechniqueConfig> = {
  classic: {
    name: 'Classic Pomodoro',
    work: 25 * 60,
    shortBreak: 5 * 60,
    longBreak: 15 * 60,
    description: 'Work for 25 minutes, then take a 5-minute break. After four focus sessions, take a longer break.',
  },
  extended: {
    name: 'Extended Focus',
    work: 50 * 60,
    shortBreak: 10 * 60,
    longBreak: 30 * 60,
    description: 'Work for 50 minutes and rest for 10 minutes. This is useful for longer tasks such as studying or coding.',
  },
  short: {
    name: 'Short Focus',
    work: 15 * 60,
    shortBreak: 3 * 60,
    longBreak: 10 * 60,
    description: 'Work for 15 minutes with a 3-minute break. This is useful when starting difficult or unfamiliar tasks.',
  },
  deep: {
    name: 'Deep Work',
    work: 90 * 60,
    shortBreak: 20 * 60,
    longBreak: 30 * 60,
    description: 'Work deeply for 90 minutes, then take a 20-minute recovery break.',
  },
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
      return { ...parsed, isRunning: false, technique: parsed.technique || 'classic' };
    }
    return {
      mode: 'work',
      timeLeft: TECHNIQUES.classic.work,
      isRunning: false,
      completedSessions: 0,
      task: '',
      technique: 'classic',
    };
  });

  const currentTechnique = TECHNIQUES[state.technique];

  const getDuration = (mode: Mode, technique: Technique = state.technique): number => {
    return TECHNIQUES[technique][mode];
  };

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
              timeLeft: getDuration(newMode, prev.technique),
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
      timeLeft: getDuration(prev.mode, prev.technique),
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
        timeLeft: getDuration(newMode, prev.technique),
        isRunning: false,
      };
    });
  };

  const selectMode = (mode: Mode) => {
    setState(prev => ({
      ...prev,
      mode,
      timeLeft: getDuration(mode, prev.technique),
      isRunning: false,
    }));
  };

  const updateTask = (task: string) => {
    setState(prev => ({ ...prev, task }));
  };

  // Calculate progress
  const totalDuration = getDuration(state.mode, state.technique);
  const progress = ((totalDuration - state.timeLeft) / totalDuration) * 360;
  const color = COLORS[state.mode];

  // Calculate message
  const getMessage = () => {
    if (state.isRunning) {
      return state.task || 'Stay focused...';
    }
    if (state.timeLeft === totalDuration) {
      return 'Ready to focus?';
    }
    return 'Timer paused';
  };

  const changeTechnique = (technique: Technique) => {
    setState(prev => ({
      ...prev,
      technique,
      mode: 'work',
      timeLeft: getDuration('work', technique),
      isRunning: false,
    }));
  };

  return (
    <div className="app">
      <div className="brand">
        <div className="tomato-logo" aria-label="Pomodoro tomato logo">
          <svg viewBox="0 0 120 120" role="img">
            <path
              className="tomato-leaf"
              d="M60 31
                 C48 17 29 19 22 30
                 C35 29 43 35 49 43
                 C37 37 24 41 20 52
                 C35 48 47 54 55 64
                 C58 67 62 67 65 64
                 C73 54 85 48 100 52
                 C96 41 83 37 71 43
                 C77 35 85 29 98 30
                 C91 19 72 17 60 31Z"
            />
            <path
              className="tomato-body"
              d="M60 38
                 C35 36 17 51 17 75
                 C17 99 36 111 60 111
                 C84 111 103 99 103 75
                 C103 51 85 36 60 38Z"
            />
            <path
              className="tomato-highlight"
              d="M37 58
                 C31 65 30 76 33 82
                 C35 86 40 85 41 80
                 C40 70 43 64 47 59
                 C50 55 42 53 37 58Z"
            />
            <path
              className="tomato-line"
              d="M60 45 C57 61 57 88 60 103"
            />
          </svg>
        </div>
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

        <div className="technique-box">
          <label htmlFor="technique">Pomodoro technique</label>
          <select
            id="technique"
            value={state.technique}
            onChange={e => changeTechnique(e.target.value as Technique)}
          >
            <option value="classic">Classic Pomodoro — 25/5</option>
            <option value="extended">Extended Focus — 50/10</option>
            <option value="short">Short Focus — 15/3</option>
            <option value="deep">Deep Work — 90/20</option>
          </select>
          <p>{currentTechnique.description}</p>
        </div>

        <div
          className="timer-ring"
          style={{
            background: `conic-gradient(${color} ${progress}deg, #f5e8e3 ${progress}deg)`,
          }}
        >
          <div className="timer-content">
            <div className="timer-tomato">
              <svg viewBox="0 0 120 120">
                <path
                  className="tomato-leaf"
                  d="M60 31
                     C48 17 29 19 22 30
                     C35 29 43 35 49 43
                     C37 37 24 41 20 52
                     C35 48 47 54 55 64
                     C58 67 62 67 65 64
                     C73 54 85 48 100 52
                     C96 41 83 37 71 43
                     C77 35 85 29 98 30
                     C91 19 72 17 60 31Z"
                />
                <path
                  className="tomato-body"
                  d="M60 38
                     C35 36 17 51 17 75
                     C17 99 36 111 60 111
                     C84 111 103 99 103 75
                     C103 51 85 36 60 38Z"
                />
                <path
                  className="tomato-highlight"
                  d="M37 58
                     C31 65 30 76 33 82
                     C35 86 40 85 41 80
                     C40 70 43 64 47 59
                     C50 55 42 53 37 58Z"
                />
              </svg>
            </div>
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

        <div className="guide">
          <h2>How to use Pomodoro</h2>
          <ol>
            <li>Choose one task to work on.</li>
            <li>Start the focus timer.</li>
            <li>Work without interruptions until the timer ends.</li>
            <li>Take a short break.</li>
            <li>Repeat four times, then take a longer break.</li>
          </ol>
          <div className="tip">
            <strong>Tip:</strong> If another task comes to mind, write it down instead of switching tasks.
          </div>
        </div>
      </section>

      <div className="footer">
        Focus for {Math.round(currentTechnique.work / 60)} minutes. Rest. Repeat.
      </div>
    </div>
  );
}
