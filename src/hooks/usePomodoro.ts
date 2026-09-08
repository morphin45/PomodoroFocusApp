import { useState, useEffect, useRef, useCallback } from 'react';

// ---------- Types ----------
export type TimerMode = 'focus' | 'shortBreak' | 'longBreak';
export type TimerState = 'idle' | 'running' | 'paused';

export interface Activity {
  id: string;
  name: string;
  focusMinutes: number;
  breakMinutes: number;
  longBreakMinutes: number;
  icon: string;
  description: string;
}

export interface Task {
  id: string;
  name: string;
  estimatedPomodoros: number;
  completedPomodoros: number;
  done: boolean;
}

export interface SessionRecord {
  id: string;
  mode: TimerMode;
  duration: number;
  activity: string;
  completedAt: number;
  interruptions: number;
}

export interface DailyStats {
  date: string;
  sessions: number;
  focusMinutes: number;
  interruptions: number;
}

export interface Settings {
  longBreakInterval: number;
  dailyGoal: number;
  autoStartBreaks: boolean;
  autoStartFocus: boolean;
  soundEnabled: boolean;
  vibrationEnabled: boolean;
}

export const ACTIVITIES: Activity[] = [
  { id: 'study', name: 'Study', focusMinutes: 25, breakMinutes: 5, longBreakMinutes: 15, icon: '📚', description: 'Classic 25/5 study sessions' },
  { id: 'deep', name: 'Deep Work', focusMinutes: 50, breakMinutes: 10, longBreakMinutes: 30, icon: '🧠', description: 'Extended focus for complex tasks' },
  { id: 'reading', name: 'Reading', focusMinutes: 30, breakMinutes: 5, longBreakMinutes: 15, icon: '📖', description: 'Steady reading pace' },
  { id: 'exercise', name: 'Exercise', focusMinutes: 40, breakMinutes: 10, longBreakMinutes: 20, icon: '🏃', description: 'Active intervals with rest' },
  { id: 'breathing', name: 'Breathing', focusMinutes: 5, breakMinutes: 1, longBreakMinutes: 3, icon: '🌬️', description: 'Short mindful sessions' },
  { id: 'custom', name: 'Custom', focusMinutes: 25, breakMinutes: 5, longBreakMinutes: 15, icon: '⚙️', description: 'Your own timing' },
];

export const BREAK_ACTIVITIES = [
  '🚶 Take a short walk',
  '🧘 Do some stretching',
  '💧 Drink a glass of water',
  '👀 Look out the window (20-20-20 rule)',
  '🌱 Water a plant',
  '🫁 Try box breathing (4-4-4-4)',
  '🎵 Listen to one song',
  '📵 Step away from all screens',
  '🍎 Have a healthy snack',
  '🪥 Quick tidy-up',
];

// ---------- Helpers ----------
const todayKey = () => new Date().toISOString().split('T')[0];

const loadJSON = <T,>(key: string, fallback: T): T => {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
};

const saveJSON = (key: string, value: unknown) => {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // ignore
  }
};

const DEFAULT_SETTINGS: Settings = {
  longBreakInterval: 4,
  dailyGoal: 8,
  autoStartBreaks: true,
  autoStartFocus: false,
  soundEnabled: true,
  vibrationEnabled: true,
};

// ---------- Hook ----------
export function usePomodoro() {
  // --- State ---
  const [timerState, setTimerState] = useState<TimerState>('idle');
  const [mode, setMode] = useState<TimerMode>('focus');
  const [timeLeft, setTimeLeft] = useState(ACTIVITIES[0].focusMinutes * 60);
  const [currentActivity, setCurrentActivity] = useState<Activity>(ACTIVITIES[0]);
  const [sessionsCompleted, setSessionsCompleted] = useState(0);
  const [interruptions, setInterruptions] = useState(0);
  const [currentInterruptions, setCurrentInterruptions] = useState(0);
  const [tasks, setTasks] = useState<Task[]>(() => loadJSON('pomo_tasks', []));
  const [settings, setSettings] = useState<Settings>(() => loadJSON('pomo_settings', DEFAULT_SETTINGS));
  const [dailyStats, setDailyStats] = useState<DailyStats[]>(() => loadJSON('pomo_stats', []));
  const [sessionHistory, setSessionHistory] = useState<SessionRecord[]>(() => loadJSON('pomo_history', []));
  const [breakActivity, setBreakActivity] = useState(BREAK_ACTIVITIES[0]);

  // --- Refs ---
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const startTimeRef = useRef<number | null>(null);
  const pausedTimeLeftRef = useRef<number | null>(null);

  // --- Derived ---
  const totalTime = currentActivity.focusMinutes * 60;
  const breakTime = mode === 'shortBreak'
    ? currentActivity.breakMinutes * 60
    : currentActivity.longBreakMinutes * 60;
  const currentTotal = mode === 'focus' ? totalTime : breakTime;
  const progress = currentTotal > 0 ? 1 - timeLeft / currentTotal : 0;
  const servoAngle = 10 + progress * 160; // 10° to 170°

  const today = todayKey();
  const todayStat = dailyStats.find(s => s.date === today) || { date: today, sessions: 0, focusMinutes: 0, interruptions: 0 };
  const dailyProgress = Math.min(1, todayStat.sessions / settings.dailyGoal);

  const currentStreak = (() => {
    let streak = 0;
    const d = new Date();
    for (let i = 0; i < 365; i++) {
      const key = d.toISOString().split('T')[0];
      const stat = dailyStats.find(s => s.date === key);
      if (stat && stat.sessions > 0) {
        streak++;
        d.setDate(d.getDate() - 1);
      } else if (i === 0) {
        d.setDate(d.getDate() - 1);
        continue;
      } else {
        break;
      }
    }
    return streak;
  })();

  // --- Persistence ---
  useEffect(() => { saveJSON('pomo_tasks', tasks); }, [tasks]);
  useEffect(() => { saveJSON('pomo_settings', settings); }, [settings]);
  useEffect(() => { saveJSON('pomo_stats', dailyStats); }, [dailyStats]);
  useEffect(() => { saveJSON('pomo_history', sessionHistory); }, [sessionHistory]);

  // --- Sound ---
  const playSound = useCallback((type: 'complete' | 'tick' | 'start') => {
    if (!settings.soundEnabled) return;
    try {
      const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);

      if (type === 'complete') {
        osc.frequency.setValueAtTime(523.25, ctx.currentTime);
        osc.frequency.setValueAtTime(659.25, ctx.currentTime + 0.15);
        osc.frequency.setValueAtTime(783.99, ctx.currentTime + 0.3);
        gain.gain.setValueAtTime(0.2, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.6);
        osc.start();
        osc.stop(ctx.currentTime + 0.6);
      } else if (type === 'start') {
        osc.frequency.value = 440;
        gain.gain.setValueAtTime(0.1, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.15);
        osc.start();
        osc.stop(ctx.currentTime + 0.15);
      } else {
        osc.frequency.value = 800;
        gain.gain.setValueAtTime(0.05, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.05);
        osc.start();
        osc.stop(ctx.currentTime + 0.05);
      }
    } catch {
      // ignore audio errors
    }
  }, [settings.soundEnabled]);

  const vibrate = useCallback((pattern: number | number[]) => {
    if (!settings.vibrationEnabled) return;
    if ('vibrate' in navigator) {
      navigator.vibrate(pattern);
    }
  }, [settings.vibrationEnabled]);

  // --- Timer core ---
  const tick = useCallback(() => {
    setTimeLeft(prev => {
      if (prev <= 1) {
        return 0;
      }
      return prev - 1;
    });
  }, []);

  const stopInterval = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  const startInterval = useCallback(() => {
    stopInterval();
    intervalRef.current = setInterval(tick, 1000);
  }, [tick, stopInterval]);

  // --- Session completion ---
  const completeSession = useCallback(() => {
    stopInterval();
    playSound('complete');
    vibrate([200, 100, 200]);

    const record: SessionRecord = {
      id: Date.now().toString(),
      mode,
      duration: currentTotal,
      activity: currentActivity.name,
      completedAt: Date.now(),
      interruptions: currentInterruptions,
    };
    setSessionHistory(prev => [record, ...prev].slice(0, 100));

    // Update daily stats
    setDailyStats(prev => {
      const existing = prev.find(s => s.date === today);
      if (existing) {
        return prev.map(s => s.date === today ? {
          ...s,
          sessions: s.sessions + (mode === 'focus' ? 1 : 0),
          focusMinutes: s.focusMinutes + (mode === 'focus' ? currentActivity.focusMinutes : 0),
          interruptions: s.interruptions + currentInterruptions,
        } : s);
      }
      return [...prev, {
        date: today,
        sessions: mode === 'focus' ? 1 : 0,
        focusMinutes: mode === 'focus' ? currentActivity.focusMinutes : 0,
        interruptions: currentInterruptions,
      }].slice(-30);
    });

    // Update task progress
    if (mode === 'focus') {
      setTasks(prev => prev.map(t => {
        if (!t.done && t.completedPomodoros < t.estimatedPomodoros) {
          // Update first incomplete task
          return { ...t, completedPomodoros: t.completedPomodoros + 1 };
        }
        return t;
      }).map((t, i, arr) => {
        // Only update the first incomplete one
        const firstIncomplete = arr.find(x => !x.done && x.completedPomodoros < x.estimatedPomodoros);
        if (firstIncomplete && t.id === firstIncomplete.id) {
          return { ...t, completedPomodoros: t.completedPomodoros };
        }
        return t;
      }));
      // Simpler: just increment the first non-done task
      setTasks(prev => {
        const idx = prev.findIndex(t => !t.done && t.completedPomodoros < t.estimatedPomodoros);
        if (idx >= 0) {
          const copy = [...prev];
          copy[idx] = { ...copy[idx], completedPomodoros: copy[idx].completedPomodoros + 1 };
          return copy;
        }
        return prev;
      });
    }

    // Switch mode
    if (mode === 'focus') {
      const newSessions = sessionsCompleted + 1;
      setSessionsCompleted(newSessions);
      const isLongBreak = newSessions % settings.longBreakInterval === 0;
      const nextMode: TimerMode = isLongBreak ? 'longBreak' : 'shortBreak';
      setMode(nextMode);
      const nextTotal = isLongBreak
        ? currentActivity.longBreakMinutes * 60
        : currentActivity.breakMinutes * 60;
      setTimeLeft(nextTotal);
      setBreakActivity(BREAK_ACTIVITIES[Math.floor(Math.random() * BREAK_ACTIVITIES.length)]);
      setCurrentInterruptions(0);
      if (settings.autoStartBreaks) {
        setTimeout(() => {
          setTimerState('running');
          startTimeRef.current = Date.now();
        }, 100);
      } else {
        setTimerState('idle');
      }
    } else {
      setMode('focus');
      setTimeLeft(currentActivity.focusMinutes * 60);
      setCurrentInterruptions(0);
      if (settings.autoStartFocus) {
        setTimeout(() => {
          setTimerState('running');
          startTimeRef.current = Date.now();
        }, 100);
      } else {
        setTimerState('idle');
      }
    }
  }, [stopInterval, playSound, vibrate, mode, currentTotal, currentActivity, sessionsCompleted, settings, currentInterruptions, today]);

  // Handle completion
  useEffect(() => {
    if (timeLeft === 0 && timerState === 'running') {
      completeSession();
    }
  }, [timeLeft, timerState, completeSession]);

  // --- Actions ---
  const start = useCallback(() => {
    if (timerState === 'running') {
      // Pause
      stopInterval();
      pausedTimeLeftRef.current = timeLeft;
      setTimerState('paused');
      return;
    }
    playSound('start');
    vibrate(50);
    startTimeRef.current = Date.now();
    setTimerState('running');
    startInterval();
  }, [timerState, timeLeft, stopInterval, startInterval, playSound, vibrate]);

  const reset = useCallback(() => {
    stopInterval();
    setTimerState('idle');
    startTimeRef.current = null;
    pausedTimeLeftRef.current = null;
    setCurrentInterruptions(0);
    if (mode === 'focus') {
      setTimeLeft(currentActivity.focusMinutes * 60);
    } else if (mode === 'shortBreak') {
      setTimeLeft(currentActivity.breakMinutes * 60);
    } else {
      setTimeLeft(currentActivity.longBreakMinutes * 60);
    }
  }, [stopInterval, mode, currentActivity]);

  const skip = useCallback(() => {
    stopInterval();
    setTimerState('idle');
    if (mode === 'focus') {
      const newSessions = sessionsCompleted + 1;
      setSessionsCompleted(newSessions);
      const isLongBreak = newSessions % settings.longBreakInterval === 0;
      setMode(isLongBreak ? 'longBreak' : 'shortBreak');
      setTimeLeft(isLongBreak ? currentActivity.longBreakMinutes * 60 : currentActivity.breakMinutes * 60);
    } else {
      setMode('focus');
      setTimeLeft(currentActivity.focusMinutes * 60);
    }
    setCurrentInterruptions(0);
  }, [stopInterval, mode, sessionsCompleted, settings, currentActivity]);

  const setActivity = useCallback((activity: Activity) => {
    stopInterval();
    setTimerState('idle');
    setCurrentActivity(activity);
    setMode('focus');
    setTimeLeft(activity.focusMinutes * 60);
    setCurrentInterruptions(0);
  }, [stopInterval]);

  const logInterruption = useCallback(() => {
    setCurrentInterruptions(prev => prev + 1);
    playSound('tick');
    vibrate(100);
  }, [playSound, vibrate]);

  // --- Task actions ---
  const addTask = useCallback((name: string, estimated: number) => {
    const task: Task = {
      id: Date.now().toString(),
      name,
      estimatedPomodoros: estimated,
      completedPomodoros: 0,
      done: false,
    };
    setTasks(prev => [...prev, task]);
  }, []);

  const toggleTask = useCallback((id: string) => {
    setTasks(prev => prev.map(t => t.id === id ? { ...t, done: !t.done } : t));
  }, []);

  const deleteTask = useCallback((id: string) => {
    setTasks(prev => prev.filter(t => t.id !== id));
  }, []);

  const updateTask = useCallback((id: string, updates: Partial<Task>) => {
    setTasks(prev => prev.map(t => t.id === id ? { ...t, ...updates } : t));
  }, []);

  // --- Settings ---
  const updateSettings = useCallback((updates: Partial<Settings>) => {
    setSettings(prev => ({ ...prev, ...updates }));
  }, []);

  // --- Cleanup ---
  useEffect(() => {
    return () => stopInterval();
  }, [stopInterval]);

  return {
    // Timer
    timerState,
    mode,
    timeLeft,
    totalTime: currentTotal,
    progress,
    servoAngle,
    sessionsCompleted,
    interruptions: currentInterruptions,
    currentActivity,
    breakActivity,

    // Stats
    todayStat,
    dailyProgress,
    dailyStats,
    sessionHistory,
    currentStreak,
    settings,

    // Tasks
    tasks,

    // Actions
    start,
    reset,
    skip,
    setActivity,
    logInterruption,
    addTask,
    toggleTask,
    deleteTask,
    updateTask,
    updateSettings,
    setMode: (m: TimerMode) => {
      stopInterval();
      setTimerState('idle');
      setMode(m);
      if (m === 'focus') setTimeLeft(currentActivity.focusMinutes * 60);
      else if (m === 'shortBreak') setTimeLeft(currentActivity.breakMinutes * 60);
      else setTimeLeft(currentActivity.longBreakMinutes * 60);
    },
    setDailyGoal: (goal: number) => updateSettings({ dailyGoal: goal }),
    resetStats: () => {
      setDailyStats([]);
      setSessionHistory([]);
      setSessionsCompleted(0);
    },
  };
}

export function getRandomBreakActivity() {
  return BREAK_ACTIVITIES[Math.floor(Math.random() * BREAK_ACTIVITIES.length)];
}
