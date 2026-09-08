import { useState, useEffect, useRef } from 'react';
import AchievementSystem from './components/AchievementSystem';
import AdvancedAnalytics from './components/AdvancedAnalytics';
import PremiumModal from './components/PremiumModal';
import FocusScore from './components/FocusScore';
import AmbientSounds from './components/AmbientSounds';
import ThemeSelector from './components/ThemeSelector';
import CustomTechniques from './components/CustomTechniques';
import useKeyboardShortcuts from './hooks/useKeyboardShortcuts';
import { THEMES, getThemeById, applyTheme } from './themes/themes';
import { exportToPDF, exportToCSV } from './utils/exportData';
import Onboarding from './components/Onboarding';
import EmptyState from './components/EmptyState';
import BreakSuggestions from './components/BreakSuggestions';
import StreakProtection from './components/StreakProtection';
import HealthReminders from './components/HealthReminders';
import KeyboardShortcuts from './components/KeyboardShortcuts';
import FocusMode from './components/FocusMode';
import TaskCategories from './components/TaskCategories';
import SessionNotes from './components/SessionNotes';
import WelcomeBack from './components/WelcomeBack';
import Goals from './components/Goals';
import SessionHistory from './components/SessionHistory';

type Mode = 'work' | 'shortBreak' | 'longBreak';
type Technique = 'classic' | 'extended' | 'short' | 'deep';

interface Task {
  id: string;
  name: string;
  estimatedPomodoros: number;
  completedPomodoros: number;
  done: boolean;
  project?: string;
  category?: string;
}

interface Session {
  id: string;
  date: string;
  mode: Mode;
  duration: number;
  task: string;
  interruptions: number;
  notes?: string;
  tags?: string[];
}

interface DailyStats {
  date: string;
  sessions: number;
  focusMinutes: number;
  interruptions: number;
}

interface State {
  mode: Mode;
  timeLeft: number;
  isRunning: boolean;
  completedSessions: number;
  task: string;
  technique: Technique;
  tasks: Task[];
  sessions: Session[];
  dailyStats: DailyStats[];
  dailyGoal: number;
  currentStreak: number;
  longestStreak: number;
  interruptions: number;
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
      return { 
        ...parsed, 
        isRunning: false, 
        technique: parsed.technique || 'classic',
        tasks: parsed.tasks || [],
        sessions: parsed.sessions || [],
        dailyStats: parsed.dailyStats || [],
        dailyGoal: parsed.dailyGoal || 8,
        currentStreak: parsed.currentStreak || 0,
        longestStreak: parsed.longestStreak || 0,
        interruptions: parsed.interruptions || 0,
      };
    }
    return {
      mode: 'work',
      timeLeft: TECHNIQUES.classic.work,
      isRunning: false,
      completedSessions: 0,
      task: '',
      technique: 'classic',
      tasks: [],
      sessions: [],
      dailyStats: [],
      dailyGoal: 8,
      currentStreak: 0,
      longestStreak: 0,
      interruptions: 0,
    };
  });

  const [isDarkMode, setIsDarkMode] = useState(() => {
    const saved = localStorage.getItem('pomodoroTheme');
    return saved === 'dark';
  });

  // Apply theme to body
  useEffect(() => {
    document.body.setAttribute('data-theme', isDarkMode ? 'dark' : 'light');
    localStorage.setItem('pomodoroTheme', isDarkMode ? 'dark' : 'light');
  }, [isDarkMode]);

  const toggleTheme = () => {
    setIsDarkMode(!isDarkMode);
  };

  // Premium state
  const [isPremium, setIsPremium] = useState(() => {
    const saved = localStorage.getItem('pomodoroPremium');
    return saved === 'true';
  });

  const [showPremiumModal, setShowPremiumModal] = useState(false);
  
  const handleUpgrade = () => {
    setIsPremium(true);
    localStorage.setItem('pomodoroPremium', 'true');
    setShowPremiumModal(false);
  };

  // Theme state
  const [currentThemeId, setCurrentThemeId] = useState(() => {
    const saved = localStorage.getItem('pomodoroThemeId');
    return saved || 'classic';
  });

  // Apply theme colors
  useEffect(() => {
    const theme = getThemeById(currentThemeId);
    applyTheme(theme, isDarkMode);
    localStorage.setItem('pomodoroThemeId', currentThemeId);
  }, [currentThemeId, isDarkMode]);

  const handleThemeChange = (themeId: string) => {
    setCurrentThemeId(themeId);
  };

  // User name for personalization
  const [userName, setUserName] = useState(() => {
    return localStorage.getItem('pomodoroUserName') || '';
  });

  // Onboarding state
  const [showOnboarding, setShowOnboarding] = useState(() => {
    return !localStorage.getItem('pomodoroOnboardingComplete');
  });

  // Keyboard shortcuts modal
  const [showShortcuts, setShowShortcuts] = useState(false);

  // Focus mode
  const [focusModeActive, setFocusModeActive] = useState(false);

  // Streak freezes
  const [streakFreezes, setStreakFreezes] = useState(() => {
    const saved = localStorage.getItem('pomodoroStreakFreezes');
    return saved ? parseInt(saved) : 1;
  });

  const handleCompleteOnboarding = (name: string) => {
    setUserName(name);
    localStorage.setItem('pomodoroUserName', name);
    localStorage.setItem('pomodoroOnboardingComplete', 'true');
    setShowOnboarding(false);
  };

  const handleUseStreakFreeze = () => {
    if (streakFreezes > 0) {
      setStreakFreezes(streakFreezes - 1);
      localStorage.setItem('pomodoroStreakFreezes', (streakFreezes - 1).toString());
    }
  };

  const handleBuyStreakFreeze = () => {
    setShowPremiumModal(true);
  };

  const [activeTab, setActiveTab] = useState<'timer' | 'tasks' | 'stats' | 'calendar' | 'achievements' | 'analytics' | 'sounds' | 'themes' | 'custom-techniques' | 'break-activities' | 'health' | 'focus-mode' | 'streak' | 'categories' | 'notes' | 'goals' | 'history'>('timer');
  const currentTechnique = TECHNIQUES[state.technique];
  
  const getDuration = (mode: Mode, technique: Technique = state.technique): number => {
    return TECHNIQUES[technique][mode];
  };

  // Calculate focus score
  const calculateFocusScore = () => {
    const today = new Date().toISOString().split('T')[0];
    const todayStats = state.dailyStats.find(s => s.date === today);
    const sessionsToday = todayStats?.sessions || 0;
    const interruptionsToday = todayStats?.interruptions || 0;
    
    // Base score from sessions (max 40 points)
    const sessionScore = Math.min(40, sessionsToday * 10);
    
    // Streak bonus (max 30 points)
    const streakScore = Math.min(30, state.currentStreak * 3);
    
    // Interruption penalty (max -20 points)
    const interruptionPenalty = Math.min(20, interruptionsToday * 2);
    
    // Consistency bonus (max 10 points)
    const consistencyScore = state.longestStreak >= 7 ? 10 : state.longestStreak >= 3 ? 5 : 0;
    
    return Math.max(0, Math.min(100, sessionScore + streakScore - interruptionPenalty + consistencyScore));
  };

  const focusScore = calculateFocusScore();

  // Calculate tasks completed
  const tasksCompleted = state.tasks.filter(t => t.done).length;

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

            // Record session (will be handled in separate effect)
            setTimeout(() => {
              recordSession(prev.mode, getDuration(prev.mode, prev.technique));
            }, 0);

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

  // Keyboard shortcuts
  useKeyboardShortcuts({
    onStart: startTimer,
    onPause: pauseTimer,
    onReset: resetTimer,
    onSkip: skipSession,
    onToggleTheme: toggleTheme,
    isRunning: state.isRunning,
  });

  // Show keyboard shortcuts modal on "?"
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.key === '?' && !e.ctrlKey && !e.metaKey) {
        if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
          return;
        }
        e.preventDefault();
        setShowShortcuts(true);
      }
    };
    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, []);

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

  // Task management
  const addTask = (name: string, estimatedPomodoros: number = 1) => {
    const newTask: Task = {
      id: Date.now().toString(),
      name,
      estimatedPomodoros,
      completedPomodoros: 0,
      done: false,
    };
    setState(prev => ({ ...prev, tasks: [...prev.tasks, newTask] }));
  };

  const toggleTask = (id: string) => {
    setState(prev => ({
      ...prev,
      tasks: prev.tasks.map(t => t.id === id ? { ...t, done: !t.done } : t),
    }));
  };

  const deleteTask = (id: string) => {
    setState(prev => ({ ...prev, tasks: prev.tasks.filter(t => t.id !== id) }));
  };

  const updateTaskPomodoros = (id: string) => {
    setState(prev => ({
      ...prev,
      tasks: prev.tasks.map(t => 
        t.id === id ? { ...t, completedPomodoros: t.completedPomodoros + 1 } : t
      ),
    }));
  };

  // Interruption tracking
  const logInterruption = () => {
    setState(prev => ({ ...prev, interruptions: prev.interruptions + 1 }));
  };

  // Update daily stats
  const updateDailyStats = (mode: Mode, duration: number) => {
    const today = new Date().toISOString().split('T')[0];
    setState(prev => {
      const existingStats = prev.dailyStats.find(s => s.date === today);
      const focusMinutes = mode === 'work' ? Math.round(duration / 60) : 0;
      
      let newDailyStats;
      if (existingStats) {
        newDailyStats = prev.dailyStats.map(s => 
          s.date === today 
            ? { 
                ...s, 
                sessions: s.sessions + (mode === 'work' ? 1 : 0),
                focusMinutes: s.focusMinutes + focusMinutes,
                interruptions: s.interruptions + (mode === 'work' ? prev.interruptions : 0),
              }
            : s
        );
      } else {
        newDailyStats = [...prev.dailyStats, {
          date: today,
          sessions: mode === 'work' ? 1 : 0,
          focusMinutes,
          interruptions: mode === 'work' ? prev.interruptions : 0,
        }];
      }

      // Update streak
      let currentStreak = prev.currentStreak;
      let longestStreak = prev.longestStreak;
      
      if (mode === 'work') {
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        const yesterdayStr = yesterday.toISOString().split('T')[0];
        const yesterdayStats = prev.dailyStats.find(s => s.date === yesterdayStr);
        
        if (!yesterdayStats || yesterdayStats.sessions === 0) {
          currentStreak = 1;
        } else if (currentStreak === 0) {
          currentStreak = 1;
        } else {
          currentStreak += 1;
        }
        
        longestStreak = Math.max(longestStreak, currentStreak);
      }

      return {
        ...prev,
        dailyStats: newDailyStats,
        currentStreak,
        longestStreak,
        interruptions: mode === 'work' ? 0 : prev.interruptions,
      };
    });
  };

  // Record session
  const recordSession = (mode: Mode, duration: number) => {
    const session: Session = {
      id: Date.now().toString(),
      date: new Date().toISOString(),
      mode,
      duration,
      task: state.task,
      interruptions: state.interruptions,
    };
    
    setState(prev => ({
      ...prev,
      sessions: [...prev.sessions, session],
    }));

    updateDailyStats(mode, duration);

    // Update task pomodoros if working
    if (mode === 'work' && state.tasks.length > 0) {
      const activeTask = state.tasks.find(t => !t.done);
      if (activeTask) {
        updateTaskPomodoros(activeTask.id);
      }
    }
  };

  // Export data
  const exportData = () => {
    const data = {
      sessions: state.sessions,
      dailyStats: state.dailyStats,
      tasks: state.tasks,
      exportedAt: new Date().toISOString(),
    };
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `pomodoro-data-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Get today's stats
  const getTodayStats = () => {
    const today = new Date().toISOString().split('T')[0];
    return state.dailyStats.find(s => s.date === today) || {
      date: today,
      sessions: 0,
      focusMinutes: 0,
      interruptions: 0,
    };
  };

  // Get week stats
  const getWeekStats = () => {
    const days = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      const stats = state.dailyStats.find(s => s.date === dateStr);
      days.push({
        date: dateStr,
        dayName: date.toLocaleDateString('en', { weekday: 'short' }),
        sessions: stats?.sessions || 0,
        focusMinutes: stats?.focusMinutes || 0,
      });
    }
    return days;
  };

  return (
    <div className="app">
      {/* Welcome Back Modal */}
      {userName && !showOnboarding && (
        <WelcomeBack
          userName={userName}
          currentStreak={state.currentStreak}
          todaySessions={state.dailyStats.find(s => s.date === new Date().toISOString().split('T')[0])?.sessions || 0}
          todayFocusMinutes={state.dailyStats.find(s => s.date === new Date().toISOString().split('T')[0])?.focusMinutes || 0}
          lastSessionDate={state.sessions.length > 0 ? state.sessions[state.sessions.length - 1].date : undefined}
        />
      )}

      <header className="brand">
        <div className="brand-title">
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
          <div>
            <h1>Pomodoro Focus</h1>
            <p className="brand-subtitle">Work calmly. Focus deeply.</p>
          </div>
        </div>
        <button 
          className="icon-button theme-toggle" 
          title={isDarkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}
          onClick={toggleTheme}
        >
          {isDarkMode ? (
            <svg className="theme-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="5" />
              <line x1="12" y1="1" x2="12" y2="3" />
              <line x1="12" y1="21" x2="12" y2="23" />
              <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
              <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
              <line x1="1" y1="12" x2="3" y2="12" />
              <line x1="21" y1="12" x2="23" y2="12" />
              <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
              <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
            </svg>
          ) : (
            <svg className="theme-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
            </svg>
          )}
        </button>
      </header>

      <section className="card">
        <div className="tabs">
          <button
            className={`tab ${state.mode === 'work' ? 'active' : ''}`}
            onClick={() => selectMode('work')}
            style={state.mode === 'work' ? { background: color } : {}}
          >
            <svg className="tab-icon" viewBox="0 0 24 24" fill="currentColor">
              <circle cx="12" cy="12" r="10" fill="none" stroke="currentColor" strokeWidth="2" />
              <circle cx="12" cy="12" r="6" fill="none" stroke="currentColor" strokeWidth="2" />
              <circle cx="12" cy="12" r="2" />
            </svg>
            Focus
          </button>
          <button
            className={`tab ${state.mode === 'shortBreak' ? 'active' : ''}`}
            onClick={() => selectMode('shortBreak')}
            style={state.mode === 'shortBreak' ? { background: color } : {}}
          >
            <svg className="tab-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M17 8h1a4 4 0 1 1 0 8h-1" />
              <path d="M3 8h14v9a4 4 0 0 1-4 4H7a4 4 0 0 1-4-4Z" />
              <line x1="6" y1="2" x2="6" y2="4" />
              <line x1="10" y1="2" x2="10" y2="4" />
              <line x1="14" y1="2" x2="14" y2="4" />
            </svg>
            Short Break
          </button>
          <button
            className={`tab ${state.mode === 'longBreak' ? 'active' : ''}`}
            onClick={() => selectMode('longBreak')}
            style={state.mode === 'longBreak' ? { background: color } : {}}
          >
            <svg className="tab-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M20 9V6a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v3" />
              <path d="M2 11v5a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-5a2 2 0 0 0-4 0v2H6v-2a2 2 0 0 0-4 0Z" />
              <path d="M4 18v2" />
              <path d="M20 18v2" />
            </svg>
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
          className={`timer-ring ${state.isRunning ? 'running' : ''}`}
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
            <div className={`timer ${state.isRunning ? 'running' : ''}`}>
              {formatTime(state.timeLeft)}
            </div>
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
            className={`start ${state.isRunning ? 'running' : ''}`}
            onClick={state.isRunning ? pauseTimer : startTimer}
            style={{ background: color }}
          >
            {state.isRunning ? (
              <>
                <svg className="btn-icon" viewBox="0 0 24 24" fill="currentColor">
                  <rect x="6" y="4" width="4" height="16" rx="1" />
                  <rect x="14" y="4" width="4" height="16" rx="1" />
                </svg>
                Pause
              </>
            ) : (
              <>
                <svg className="btn-icon" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M8 5v14l11-7z" />
                </svg>
                Start
              </>
            )}
          </button>
          <button className="secondary" onClick={resetTimer}>
            <svg className="btn-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
              <path d="M3 3v5h5" />
            </svg>
            Reset
          </button>
        </div>

        <button className="skip-btn" onClick={skipSession}>
          <svg className="btn-icon" viewBox="0 0 24 24" fill="currentColor">
            <path d="M5 4l10 8-10 8V4zM19 5v14h-2V5h2z" />
          </svg>
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

        {/* Focus Score Widget */}
        <FocusScore score={focusScore} isPremium={isPremium} />

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

        {/* Navigation tabs */}
        <div className="nav-tabs">
          <button 
            className={`nav-tab ${activeTab === 'timer' ? 'active' : ''}`}
            onClick={() => setActiveTab('timer')}
          >
            <svg className="nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10" />
              <polyline points="12 6 12 12 16 14" />
            </svg>
            Timer
          </button>
          <button 
            className={`nav-tab ${activeTab === 'tasks' ? 'active' : ''}`}
            onClick={() => setActiveTab('tasks')}
          >
            <svg className="nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M9 11l3 3L22 4" />
              <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />
            </svg>
            Tasks
          </button>
          <button 
            className={`nav-tab ${activeTab === 'stats' ? 'active' : ''}`}
            onClick={() => setActiveTab('stats')}
          >
            <svg className="nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="18" y1="20" x2="18" y2="10" />
              <line x1="12" y1="20" x2="12" y2="4" />
              <line x1="6" y1="20" x2="6" y2="14" />
            </svg>
            Stats
          </button>
          <button 
            className={`nav-tab ${activeTab === 'calendar' ? 'active' : ''}`}
            onClick={() => setActiveTab('calendar')}
          >
            <svg className="nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
              <line x1="16" y1="2" x2="16" y2="6" />
              <line x1="8" y1="2" x2="8" y2="6" />
              <line x1="3" y1="10" x2="21" y2="10" />
            </svg>
            Calendar
          </button>
          <button 
            className={`nav-tab ${activeTab === 'achievements' ? 'active' : ''}`}
            onClick={() => setActiveTab('achievements')}
          >
            <svg className="nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="8" r="7" />
              <polyline points="8.21 13.89 7 23 12 20 17 23 15.79 13.88" />
            </svg>
            Achievements
          </button>
          <button 
            className={`nav-tab ${activeTab === 'analytics' ? 'active' : ''} ${!isPremium ? 'premium-tab' : ''}`}
            onClick={() => {
              if (isPremium) {
                setActiveTab('analytics');
              } else {
                setShowPremiumModal(true);
              }
            }}
          >
            <svg className="nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="18" y1="20" x2="18" y2="10" />
              <line x1="12" y1="20" x2="12" y2="4" />
              <line x1="6" y1="20" x2="6" y2="14" />
            </svg>
            Analytics {!isPremium && <span className="pro-badge-small">PRO</span>}
          </button>
          <button 
            className={`nav-tab ${activeTab === 'sounds' ? 'active' : ''}`}
            onClick={() => setActiveTab('sounds')}
          >
            <svg className="nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M9 18V5l12-2v13" />
              <circle cx="6" cy="18" r="3" />
              <circle cx="18" cy="16" r="3" />
            </svg>
            Sounds
          </button>
          <button 
            className={`nav-tab ${activeTab === 'themes' ? 'active' : ''}`}
            onClick={() => setActiveTab('themes')}
          >
            <svg className="nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10" />
              <path d="M12 2a10 10 0 0 1 0 20" />
            </svg>
            Themes
          </button>
          <button 
            className={`nav-tab ${activeTab === 'custom-techniques' ? 'active' : ''} ${!isPremium ? 'premium-tab' : ''}`}
            onClick={() => {
              if (isPremium) {
                setActiveTab('custom-techniques');
              } else {
                setShowPremiumModal(true);
              }
            }}
          >
            <svg className="nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="3" />
              <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
            </svg>
            Custom {!isPremium && <span className="pro-badge-small">PRO</span>}
          </button>
          <button 
            className={`nav-tab ${activeTab === 'break-activities' ? 'active' : ''}`}
            onClick={() => setActiveTab('break-activities')}
          >
            <svg className="nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M18 8h1a4 4 0 0 1 0 8h-1" />
              <path d="M2 8h16v9a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V8z" />
              <line x1="6" y1="1" x2="6" y2="4" />
              <line x1="10" y1="1" x2="10" y2="4" />
              <line x1="14" y1="1" x2="14" y2="4" />
            </svg>
            Breaks
          </button>
          <button 
            className={`nav-tab ${activeTab === 'health' ? 'active' : ''}`}
            onClick={() => setActiveTab('health')}
          >
            <svg className="nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
            </svg>
            Health
          </button>
          <button 
            className={`nav-tab ${activeTab === 'focus-mode' ? 'active' : ''}`}
            onClick={() => setActiveTab('focus-mode')}
          >
            <svg className="nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10" />
              <circle cx="12" cy="12" r="6" />
              <circle cx="12" cy="12" r="2" />
            </svg>
            Focus
          </button>
          <button 
            className={`nav-tab ${activeTab === 'streak' ? 'active' : ''}`}
            onClick={() => setActiveTab('streak')}
          >
            <svg className="nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z" />
            </svg>
            Streak
          </button>
          <button 
            className={`nav-tab ${activeTab === 'categories' ? 'active' : ''}`}
            onClick={() => setActiveTab('categories')}
          >
            <svg className="nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="3" y="3" width="7" height="7" />
              <rect x="14" y="3" width="7" height="7" />
              <rect x="14" y="14" width="7" height="7" />
              <rect x="3" y="14" width="7" height="7" />
            </svg>
            Categories
          </button>
          <button 
            className={`nav-tab ${activeTab === 'notes' ? 'active' : ''}`}
            onClick={() => setActiveTab('notes')}
          >
            <svg className="nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
              <polyline points="14 2 14 8 20 8" />
              <line x1="16" y1="13" x2="8" y2="13" />
              <line x1="16" y1="17" x2="8" y2="17" />
              <polyline points="10 9 9 9 8 9" />
            </svg>
            Notes
          </button>
          <button 
            className={`nav-tab ${activeTab === 'goals' ? 'active' : ''}`}
            onClick={() => setActiveTab('goals')}
          >
            <svg className="nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10" />
              <circle cx="12" cy="12" r="6" />
              <circle cx="12" cy="12" r="2" />
            </svg>
            Goals
          </button>
          <button 
            className={`nav-tab ${activeTab === 'history' ? 'active' : ''}`}
            onClick={() => setActiveTab('history')}
          >
            <svg className="nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10" />
              <polyline points="12 6 12 12 16 14" />
            </svg>
            History
          </button>
        </div>

        {/* Timer view (default) */}
        {activeTab === 'timer' && (
          <div className="tab-content">
            {/* Timer content is already shown above */}
          </div>
        )}

        {/* Tasks view */}
        {activeTab === 'tasks' && (
          <div className="tab-content">
            <div className="tasks-header">
              <h2>Tasks</h2>
              <button className="add-task-btn" onClick={() => {
                const name = prompt('Task name:');
                if (name) {
                  const pomodoros = parseInt(prompt('Estimated pomodoros:', '1') || '1');
                  addTask(name, pomodoros);
                }
              }}>
                <svg className="btn-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="12" y1="5" x2="12" y2="19" />
                  <line x1="5" y1="12" x2="19" y2="12" />
                </svg>
                Add Task
              </button>
            </div>

            <div className="tasks-list">
              {state.tasks.length === 0 ? (
                <div className="empty-state">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M9 11l3 3L22 4" />
                    <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />
                  </svg>
                  <p>No tasks yet. Add your first task to get started!</p>
                </div>
              ) : (
                state.tasks.map(task => (
                  <div key={task.id} className={`task-item ${task.done ? 'done' : ''}`}>
                    <input 
                      type="checkbox" 
                      checked={task.done}
                      onChange={() => toggleTask(task.id)}
                      className="task-checkbox"
                    />
                    <div className="task-info">
                      <div className="task-name">{task.name}</div>
                      <div className="task-progress">
                        {task.completedPomodoros} / {task.estimatedPomodoros} pomodoros
                      </div>
                    </div>
                    <button 
                      className="delete-task-btn"
                      onClick={() => deleteTask(task.id)}
                    >
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <polyline points="3 6 5 6 21 6" />
                        <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                      </svg>
                    </button>
                  </div>
                ))
              )}
            </div>

            {state.tasks.length > 0 && (
              <div className="tasks-summary">
                <div className="summary-item">
                  <span className="summary-label">Total Tasks</span>
                  <span className="summary-value">{state.tasks.length}</span>
                </div>
                <div className="summary-item">
                  <span className="summary-label">Completed</span>
                  <span className="summary-value">{state.tasks.filter(t => t.done).length}</span>
                </div>
                <div className="summary-item">
                  <span className="summary-label">Total Pomodoros</span>
                  <span className="summary-value">
                    {state.tasks.reduce((sum, t) => sum + t.completedPomodoros, 0)}
                  </span>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Stats view */}
        {activeTab === 'stats' && (
          <div className="tab-content">
            <div className="stats-header">
              <h2>Statistics</h2>
              <div className="export-buttons">
                <button 
                  className="export-btn" 
                  onClick={() => exportToPDF(state.sessions, state.dailyStats, state.tasks, state.currentStreak, state.longestStreak)}
                >
                  <svg className="btn-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                    <polyline points="14 2 14 8 20 8" />
                    <line x1="16" y1="13" x2="8" y2="13" />
                    <line x1="16" y1="17" x2="8" y2="17" />
                    <polyline points="10 9 9 9 8 9" />
                  </svg>
                  Export PDF
                </button>
                <button 
                  className="export-btn" 
                  onClick={() => exportToCSV(state.sessions, state.dailyStats, state.tasks)}
                >
                  <svg className="btn-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                    <polyline points="14 2 14 8 20 8" />
                    <line x1="8" y1="13" x2="16" y2="13" />
                    <line x1="8" y1="17" x2="16" y2="17" />
                  </svg>
                  Export CSV
                </button>
              </div>
            </div>

            <div className="stats-grid">
              <div className="stat-card">
                <div className="stat-icon">🔥</div>
                <div className="stat-value">{state.currentStreak}</div>
                <div className="stat-label">Day Streak</div>
              </div>
              <div className="stat-card">
                <div className="stat-icon">🏆</div>
                <div className="stat-value">{state.longestStreak}</div>
                <div className="stat-label">Longest Streak</div>
              </div>
              <div className="stat-card">
                <div className="stat-icon">🍅</div>
                <div className="stat-value">{getTodayStats().sessions}</div>
                <div className="stat-label">Today's Sessions</div>
              </div>
              <div className="stat-card">
                <div className="stat-icon">⏱️</div>
                <div className="stat-value">{getTodayStats().focusMinutes}</div>
                <div className="stat-label">Minutes Focused</div>
              </div>
            </div>

            <div className="weekly-chart">
              <h3>This Week</h3>
              <div className="chart-bars">
                {getWeekStats().map((day, i) => (
                  <div key={i} className="chart-bar-wrapper">
                    <div className="chart-bar-container">
                      <div 
                        className="chart-bar"
                        style={{ 
                          height: `${Math.min((day.sessions / state.dailyGoal) * 100, 100)}%`,
                          background: day.sessions >= state.dailyGoal 
                            ? 'linear-gradient(135deg, #68b879 0%, #4a9d5f 100%)'
                            : `linear-gradient(135deg, ${color} 0%, ${color}dd 100%)`
                        }}
                      />
                    </div>
                    <div className="chart-label">{day.dayName}</div>
                    <div className="chart-value">{day.sessions}</div>
                  </div>
                ))}
              </div>
            </div>

            <div className="goal-progress">
              <h3>Daily Goal Progress</h3>
              <div className="goal-bar">
                <div 
                  className="goal-fill"
                  style={{ 
                    width: `${Math.min((getTodayStats().sessions / state.dailyGoal) * 100, 100)}%`,
                    background: getTodayStats().sessions >= state.dailyGoal
                      ? 'linear-gradient(90deg, #68b879 0%, #4a9d5f 100%)'
                      : `linear-gradient(90deg, ${color} 0%, ${color}dd 100%)`
                  }}
                />
              </div>
              <div className="goal-text">
                {getTodayStats().sessions} / {state.dailyGoal} sessions
              </div>
            </div>

            <div className="interruption-stats">
              <h3>Interruptions Today</h3>
              <div className="interruption-count">
                {getTodayStats().interruptions}
              </div>
              <button className="log-interruption-btn" onClick={logInterruption}>
                + Log Interruption
              </button>
            </div>
          </div>
        )}

        {/* Calendar view */}
        {activeTab === 'calendar' && (
          <div className="tab-content">
            <div className="calendar-header">
              <h2>Activity Calendar</h2>
            </div>

            <div className="calendar-grid">
              {(() => {
                const days = [];
                for (let i = 29; i >= 0; i--) {
                  const date = new Date();
                  date.setDate(date.getDate() - i);
                  const dateStr = date.toISOString().split('T')[0];
                  const stats = state.dailyStats.find(s => s.date === dateStr);
                  const sessions = stats?.sessions || 0;
                  const level = sessions === 0 ? 0 : sessions < 4 ? 1 : sessions < 8 ? 2 : 3;
                  
                  days.push(
                    <div 
                      key={dateStr}
                      className={`calendar-day level-${level}`}
                      title={`${dateStr}: ${sessions} sessions`}
                    >
                      {date.getDate()}
                    </div>
                  );
                }
                return days;
              })()}
            </div>

            <div className="calendar-legend">
              <span>Less</span>
              <div className="calendar-day level-0"></div>
              <div className="calendar-day level-1"></div>
              <div className="calendar-day level-2"></div>
              <div className="calendar-day level-3"></div>
              <span>More</span>
            </div>

            <div className="recent-sessions">
              <h3>Recent Sessions</h3>
              {state.sessions.length === 0 ? (
                <div className="empty-state">
                  <p>No sessions yet. Start your first pomodoro!</p>
                </div>
              ) : (
                <div className="sessions-list">
                  {state.sessions.slice(-10).reverse().map(session => (
                    <div key={session.id} className="session-item">
                      <div className="session-mode">
                        {session.mode === 'work' ? '🍅' : session.mode === 'shortBreak' ? '☕' : '🌴'}
                      </div>
                      <div className="session-details">
                        <div className="session-task">{session.task || 'Focus session'}</div>
                        <div className="session-meta">
                          {Math.round(session.duration / 60)} min · {new Date(session.date).toLocaleDateString()}
                        </div>
                      </div>
                      {session.interruptions > 0 && (
                        <div className="session-interruptions">
                          ⚡ {session.interruptions}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Achievements view */}
        {activeTab === 'achievements' && (
          <div className="tab-content">
            <AchievementSystem
              sessions={state.completedSessions}
              currentStreak={state.currentStreak}
              focusMinutes={state.dailyStats.reduce((sum, stat) => sum + stat.focusMinutes, 0)}
              tasksCompleted={tasksCompleted}
              isPremium={isPremium}
            />
          </div>
        )}

        {/* Analytics view */}
        {activeTab === 'analytics' && (
          <div className="tab-content">
            <AdvancedAnalytics
              sessions={state.sessions}
              dailyStats={state.dailyStats}
              isPremium={isPremium}
              onUpgrade={() => setShowPremiumModal(true)}
            />
          </div>
        )}

        {/* Sounds view */}
        {activeTab === 'sounds' && (
          <div className="tab-content">
            <AmbientSounds
              isPremium={isPremium}
              onUpgrade={() => setShowPremiumModal(true)}
            />
          </div>
        )}

        {/* Themes view */}
        {activeTab === 'themes' && (
          <div className="tab-content">
            <ThemeSelector
              currentTheme={currentThemeId}
              isPremium={isPremium}
              onThemeChange={handleThemeChange}
              onUpgrade={() => setShowPremiumModal(true)}
            />
          </div>
        )}

        {/* Custom Techniques view */}
        {activeTab === 'custom-techniques' && (
          <div className="tab-content">
            <CustomTechniques
              isPremium={isPremium}
              onUpgrade={() => setShowPremiumModal(true)}
            />
          </div>
        )}

        {/* Break Activities view */}
        {activeTab === 'break-activities' && (
          <div className="tab-content">
            <BreakSuggestions />
          </div>
        )}

        {/* Health Reminders view */}
        {activeTab === 'health' && (
          <div className="tab-content">
            <HealthReminders />
          </div>
        )}

        {/* Focus Mode view */}
        {activeTab === 'focus-mode' && (
          <div className="tab-content">
            <FocusMode
              isActive={focusModeActive}
              onToggle={() => setFocusModeActive(!focusModeActive)}
              duration={currentTechnique.work / 60}
            />
          </div>
        )}

        {/* Streak Protection view */}
        {activeTab === 'streak' && (
          <div className="tab-content">
            <StreakProtection
              currentStreak={state.currentStreak}
              longestStreak={state.longestStreak}
              streakFreezes={streakFreezes}
              onUseFreeze={handleUseStreakFreeze}
              onBuyFreeze={handleBuyStreakFreeze}
            />
          </div>
        )}

        {/* Task Categories view */}
        {activeTab === 'categories' && (
          <div className="tab-content">
            <TaskCategories
              tasks={state.tasks}
              onUpdateTask={(taskId, updates) => {
                setState(prev => ({
                  ...prev,
                  tasks: prev.tasks.map(t => 
                    t.id === taskId ? { ...t, ...updates } : t
                  ),
                }));
              }}
            />
          </div>
        )}

        {/* Session Notes view */}
        {activeTab === 'notes' && (
          <div className="tab-content">
            <SessionNotes
              sessions={state.sessions}
              onUpdateSession={(sessionId, updates) => {
                setState(prev => ({
                  ...prev,
                  sessions: prev.sessions.map(s => 
                    s.id === sessionId ? { ...s, ...updates } : s
                  ),
                }));
              }}
            />
          </div>
        )}

        {/* Goals view */}
        {activeTab === 'goals' && (
          <div className="tab-content">
            <Goals
              currentStreak={state.currentStreak}
              totalSessions={state.sessions.length}
              totalFocusMinutes={state.sessions.reduce((sum, s) => sum + s.duration / 60, 0)}
            />
          </div>
        )}

        {/* Session History view */}
        {activeTab === 'history' && (
          <div className="tab-content">
            <SessionHistory sessions={state.sessions} />
          </div>
        )}
      </section>

      {/* Onboarding */}
      {showOnboarding && (
        <Onboarding
          onComplete={() => handleCompleteOnboarding(userName)}
          userName={userName}
          onUserNameChange={setUserName}
        />
      )}

      {/* Keyboard Shortcuts Modal */}
      <KeyboardShortcuts
        isOpen={showShortcuts}
        onClose={() => setShowShortcuts(false)}
      />

      {/* Premium Modal */}
      <PremiumModal
        isOpen={showPremiumModal}
        onClose={() => setShowPremiumModal(false)}
        onUpgrade={handleUpgrade}
      />

      <div className="footer">
        Focus for {Math.round(currentTechnique.work / 60)} minutes. Rest. Repeat.
      </div>
    </div>
  );
}
