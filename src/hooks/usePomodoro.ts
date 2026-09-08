import { useState, useEffect, useRef, useCallback } from 'react';

export type TimerMode = 'focus' | 'shortBreak' | 'longBreak';

export interface PomodoroSettings {
  focusDuration: number;
  shortBreakDuration: number;
  longBreakDuration: number;
  longBreakInterval: number;
  dailyGoal: number;
}

export interface PomodoroStats {
  sessionsCompleted: number;
  totalFocusTime: number;
  lastSessionDate: string;
  currentStreak: number;
  longestStreak: number;
  interruptions: number;
  history: { date: string; sessions: number; focusMinutes: number }[];
}

export interface Task {
  id: string;
  title: string;
  estimatedPomodoros: number;
  completedPomodoros: number;
  isCompleted: boolean;
  createdAt: number;
}

export interface Interruption {
  id: string;
  timestamp: number;
  type: 'internal' | 'external';
  note: string;
  sessionId: string;
}

export interface DailyPlan {
  date: string;
  targetPomodoros: number;
  overflowBuffer: number;
  completedPomodoros: number;
}

const DEFAULT_SETTINGS: PomodoroSettings = {
  focusDuration: 25,
  shortBreakDuration: 5,
  longBreakDuration: 15,
  longBreakInterval: 4,
  dailyGoal: 8,
};

const BREAK_ACTIVITIES = [
  '🚶 Take a short walk',
  '🧘 Do some stretching',
  '💧 Drink some water',
  '👀 Look out the window (20-20-20 rule)',
  '🌿 Step outside for fresh air',
  '🎵 Listen to a short song',
  '📖 Read a page of a book',
  '🤸 Do some light exercises',
  '🧹 Tidy up your space',
  '🍎 Grab a healthy snack',
  '😌 Practice deep breathing',
  '🐦 Watch birds or nature',
];

function getTodayString(): string {
  return new Date().toDateString();
}

function loadFromStorage<T>(key: string, fallback: T): T {
  try {
    const saved = localStorage.getItem(key);
    return saved ? JSON.parse(saved) : fallback;
  } catch {
    return fallback;
  }
}

function playNotificationSound() {
  try {
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    const notes = [523.25, 659.25, 783.99];
    notes.forEach((freq, i) => {
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);
      oscillator.frequency.value = freq;
      oscillator.type = 'sine';
      gainNode.gain.setValueAtTime(0.3, audioContext.currentTime + i * 0.15);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + i * 0.15 + 0.4);
      oscillator.start(audioContext.currentTime + i * 0.15);
      oscillator.stop(audioContext.currentTime + i * 0.15 + 0.4);
    });
  } catch { /* ignore audio errors */ }
}

export function getRandomBreakActivity(): string {
  return BREAK_ACTIVITIES[Math.floor(Math.random() * BREAK_ACTIVITIES.length)];
}

export function usePomodoro() {
  const [settings, setSettings] = useState<PomodoroSettings>(
    () => loadFromStorage('pomodoro-settings', DEFAULT_SETTINGS)
  );
  const [mode, setMode] = useState<TimerMode>('focus');
  const [timeLeft, setTimeLeft] = useState(settings.focusDuration * 60);
  const [isRunning, setIsRunning] = useState(false);
  const [sessionsCompleted, setSessionsCompleted] = useState(0);
  const [currentSessionId, setCurrentSessionId] = useState<string>(Date.now().toString());
  const intervalRef = useRef<number | null>(null);

  // Tasks
  const [tasks, setTasks] = useState<Task[]>(() => loadFromStorage('pomodoro-tasks', []));

  // Interruptions (today only)
  const [interruptions, setInterruptions] = useState<Interruption[]>(() => {
    const saved = loadFromStorage<Interruption[]>('pomodoro-interruptions', []);
    const today = getTodayString();
    return saved.filter(i => new Date(i.timestamp).toDateString() === today);
  });

  // Daily plan
  const [dailyPlan, setDailyPlan] = useState<DailyPlan>(() => {
    const saved = loadFromStorage<DailyPlan | null>('pomodoro-daily-plan', null);
    const today = getTodayString();
    if (saved && saved.date === today) return saved;
    return {
      date: today,
      targetPomodoros: settings.dailyGoal,
      overflowBuffer: 2,
      completedPomodoros: 0,
    };
  });

  // Stats
  const [stats, setStats] = useState<PomodoroStats>(() => {
    const saved = loadFromStorage<PomodoroStats | null>('pomodoro-stats', null);
    const today = getTodayString();
    const defaultStats: PomodoroStats = {
      sessionsCompleted: 0,
      totalFocusTime: 0,
      lastSessionDate: today,
      currentStreak: 0,
      longestStreak: 0,
      interruptions: 0,
      history: [],
    };
    if (!saved) return defaultStats;
    if (saved.lastSessionDate === today) return saved;
    // New day - keep streaks and history, reset daily counters
    return {
      ...saved,
      sessionsCompleted: 0,
      totalFocusTime: 0,
      interruptions: 0,
    };
  });

  // Break activity suggestion
  const [breakActivity, setBreakActivity] = useState<string>(getRandomBreakActivity());

  // Save to localStorage
  useEffect(() => { localStorage.setItem('pomodoro-settings', JSON.stringify(settings)); }, [settings]);
  useEffect(() => { localStorage.setItem('pomodoro-stats', JSON.stringify(stats)); }, [stats]);
  useEffect(() => { localStorage.setItem('pomodoro-tasks', JSON.stringify(tasks)); }, [tasks]);
  useEffect(() => { localStorage.setItem('pomodoro-interruptions', JSON.stringify(interruptions)); }, [interruptions]);
  useEffect(() => { localStorage.setItem('pomodoro-daily-plan', JSON.stringify(dailyPlan)); }, [dailyPlan]);

  const totalTime = mode === 'focus'
    ? settings.focusDuration * 60
    : mode === 'shortBreak'
    ? settings.shortBreakDuration * 60
    : settings.longBreakDuration * 60;

  const handleTimerComplete = useCallback(() => {
    playNotificationSound();

    if (mode === 'focus') {
      const newSessions = sessionsCompleted + 1;
      setSessionsCompleted(newSessions);

      // Update stats
      setStats((prev) => {
        const today = getTodayString();
        const yesterday = new Date(Date.now() - 86400000).toDateString();
        let newStreak = prev.currentStreak;

        if (prev.lastSessionDate === yesterday && prev.currentStreak === 0) {
          newStreak = 1;
        } else if (prev.lastSessionDate !== today && prev.lastSessionDate !== yesterday) {
          newStreak = 1;
        } else if (prev.lastSessionDate === today && prev.sessionsCompleted === 0) {
          newStreak = prev.currentStreak + 1;
        }

        // Update history
        const historyEntry = prev.history.find(h => h.date === today);
        let newHistory = [...prev.history];
        if (historyEntry) {
          newHistory = newHistory.map(h =>
            h.date === today
              ? { ...h, sessions: h.sessions + 1, focusMinutes: h.focusMinutes + settings.focusDuration }
              : h
          );
        } else {
          newHistory.push({ date: today, sessions: 1, focusMinutes: settings.focusDuration });
        }
        // Keep last 30 days
        newHistory = newHistory.slice(-30);

        return {
          sessionsCompleted: prev.sessionsCompleted + 1,
          totalFocusTime: prev.totalFocusTime + settings.focusDuration,
          lastSessionDate: today,
          currentStreak: newStreak,
          longestStreak: Math.max(newStreak, prev.longestStreak),
          interruptions: prev.interruptions,
          history: newHistory,
        };
      });

      // Update daily plan
      setDailyPlan(prev => ({
        ...prev,
        completedPomodoros: prev.completedPomodoros + 1,
      }));

      // Update task progress - advance the first active task
      setTasks((prev) => {
        const activeTask = prev.find(t => !t.isCompleted && t.completedPomodoros < t.estimatedPomodoros);
        if (activeTask) {
          return prev.map(t => {
            if (t.id === activeTask.id) {
              const newCompleted = t.completedPomodoros + 1;
              return {
                ...t,
                completedPomodoros: newCompleted,
                isCompleted: newCompleted >= t.estimatedPomodoros,
              };
            }
            return t;
          });
        }
        return prev;
      });

      // Switch to break
      if (newSessions % settings.longBreakInterval === 0) {
        setMode('longBreak');
        setTimeLeft(settings.longBreakDuration * 60);
      } else {
        setMode('shortBreak');
        setTimeLeft(settings.shortBreakDuration * 60);
      }
      setBreakActivity(getRandomBreakActivity());
    } else {
      // Switch back to focus
      setMode('focus');
      setTimeLeft(settings.focusDuration * 60);
      setCurrentSessionId(Date.now().toString());
    }
  }, [mode, sessionsCompleted, settings]);

  // Timer interval
  useEffect(() => {
    if (isRunning && timeLeft > 0) {
      intervalRef.current = window.setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            handleTimerComplete();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else if (timeLeft === 0 && isRunning) {
      setIsRunning(false);
    }

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isRunning, handleTimerComplete]);

  const start = () => setIsRunning(true);
  const pause = () => setIsRunning(false);

  const reset = () => {
    setIsRunning(false);
    setTimeLeft(totalTime);
  };

  const skip = () => {
    setIsRunning(false);
    handleTimerComplete();
  };

  const updateSettings = (newSettings: Partial<PomodoroSettings>) => {
    setSettings((prev) => ({ ...prev, ...newSettings }));
    if (!isRunning) {
      if (mode === 'focus' && newSettings.focusDuration) {
        setTimeLeft(newSettings.focusDuration * 60);
      } else if (mode === 'shortBreak' && newSettings.shortBreakDuration) {
        setTimeLeft(newSettings.shortBreakDuration * 60);
      } else if (mode === 'longBreak' && newSettings.longBreakDuration) {
        setTimeLeft(newSettings.longBreakDuration * 60);
      }
    }
  };

  const switchMode = (newMode: TimerMode) => {
    setIsRunning(false);
    setMode(newMode);
    if (newMode === 'focus') setTimeLeft(settings.focusDuration * 60);
    else if (newMode === 'shortBreak') setTimeLeft(settings.shortBreakDuration * 60);
    else setTimeLeft(settings.longBreakDuration * 60);
  };

  // Task management
  const addTask = (title: string, estimatedPomodoros: number) => {
    if (!title.trim()) return;
    const newTask: Task = {
      id: Date.now().toString(),
      title: title.trim(),
      estimatedPomodoros,
      completedPomodoros: 0,
      isCompleted: false,
      createdAt: Date.now(),
    };
    setTasks((prev) => [...prev, newTask]);
  };

  const updateTask = (id: string, updates: Partial<Task>) => {
    setTasks((prev) => prev.map(t => t.id === id ? { ...t, ...updates } : t));
  };

  const deleteTask = (id: string) => {
    setTasks((prev) => prev.filter(t => t.id !== id));
  };

  const reorderTasks = (fromIndex: number, toIndex: number) => {
    setTasks(prev => {
      const updated = [...prev];
      const [moved] = updated.splice(fromIndex, 1);
      updated.splice(toIndex, 0, moved);
      return updated;
    });
  };

  // Interruption tracking
  const logInterruption = (type: 'internal' | 'external', note: string) => {
    const newInterruption: Interruption = {
      id: Date.now().toString(),
      timestamp: Date.now(),
      type,
      note,
      sessionId: currentSessionId,
    };
    setInterruptions((prev) => [...prev, newInterruption]);
    setStats((prev) => ({ ...prev, interruptions: prev.interruptions + 1 }));
  };

  const clearInterruptions = () => {
    setInterruptions([]);
    setStats((prev) => ({ ...prev, interruptions: 0 }));
  };

  // Daily plan management
  const updateDailyPlan = (updates: Partial<DailyPlan>) => {
    setDailyPlan(prev => ({ ...prev, ...updates }));
  };

  const resetDailyPlan = () => {
    setDailyPlan({
      date: getTodayString(),
      targetPomodoros: settings.dailyGoal,
      overflowBuffer: 2,
      completedPomodoros: 0,
    });
  };

  // Computed values
  const todayProgress = dailyPlan.targetPomodoros > 0
    ? Math.min(dailyPlan.completedPomodoros / dailyPlan.targetPomodoros, 1)
    : 0;

  const goalReached = dailyPlan.completedPomodoros >= dailyPlan.targetPomodoros;

  const todayHistory = stats.history.find(h => h.date === getTodayString());

  return {
    mode,
    timeLeft,
    totalTime,
    isRunning,
    sessionsCompleted,
    stats,
    settings,
    tasks,
    interruptions,
    dailyPlan,
    breakActivity,
    todayProgress,
    goalReached,
    todayHistory,
    start,
    pause,
    reset,
    skip,
    updateSettings,
    switchMode,
    addTask,
    updateTask,
    deleteTask,
    reorderTasks,
    logInterruption,
    clearInterruptions,
    updateDailyPlan,
    resetDailyPlan,
  };
}
