import { useState, useEffect, useRef, useCallback } from 'react';

export type TimerMode = 'focus' | 'shortBreak' | 'longBreak';
export type TimerState = 'idle' | 'running' | 'paused';
export type ActivityType = 'study' | 'deepWork' | 'reading' | 'exercise' | 'breathing' | 'custom';

export interface Activity {
  id: ActivityType;
  name: string;
  emoji: string;
  description: string;
  focusDuration: number;
  shortBreakDuration: number;
  longBreakDuration: number;
  longBreakInterval: number;
}

export const ACTIVITIES: Activity[] = [
  {
    id: 'study',
    name: 'Study',
    emoji: '📚',
    description: '25 min focus, 5 min break',
    focusDuration: 25,
    shortBreakDuration: 5,
    longBreakDuration: 15,
    longBreakInterval: 4,
  },
  {
    id: 'deepWork',
    name: 'Deep Work',
    emoji: '🧠',
    description: '50 min focus, 10 min break',
    focusDuration: 50,
    shortBreakDuration: 10,
    longBreakDuration: 30,
    longBreakInterval: 3,
  },
  {
    id: 'reading',
    name: 'Reading',
    emoji: '📖',
    description: '30 min focus, 5 min break',
    focusDuration: 30,
    shortBreakDuration: 5,
    longBreakDuration: 20,
    longBreakInterval: 4,
  },
  {
    id: 'exercise',
    name: 'Exercise',
    emoji: '🏋️',
    description: '40 min activity, 10 min rest',
    focusDuration: 40,
    shortBreakDuration: 10,
    longBreakDuration: 20,
    longBreakInterval: 3,
  },
  {
    id: 'breathing',
    name: 'Breathing',
    emoji: '🧘',
    description: '5 min guided, 1 min rest',
    focusDuration: 5,
    shortBreakDuration: 1,
    longBreakDuration: 3,
    longBreakInterval: 5,
  },
  {
    id: 'custom',
    name: 'Custom',
    emoji: '⚙️',
    description: 'Set your own durations',
    focusDuration: 25,
    shortBreakDuration: 5,
    longBreakDuration: 15,
    longBreakInterval: 4,
  },
];

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
}

export interface DailyStats {
  date: string;
  sessions: number;
  focusMinutes: number;
  interruptions: number;
}

export interface PomodoroStats {
  currentStreak: number;
  longestStreak: number;
  totalSessions: number;
  totalFocusMinutes: number;
  history: DailyStats[];
}

export interface PomodoroState {
  timerState: TimerState;
  mode: TimerMode;
  timeLeft: number;
  totalTime: number;
  sessionsCompleted: number;
  currentActivity: Activity;
  tasks: Task[];
  interruptions: Interruption[];
  stats: PomodoroStats;
  todaySessions: number;
  todayFocusMinutes: number;
  dailyGoal: number;
}

function getTodayString(): string {
  return new Date().toISOString().split('T')[0];
}

function loadFromStorage<T>(key: string, fallback: T): T {
  try {
    const saved = localStorage.getItem(key);
    return saved ? JSON.parse(saved) : fallback;
  } catch {
    return fallback;
  }
}

function playSound(type: 'complete' | 'break' | 'click') {
  try {
    const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
    if (type === 'complete') {
      [523.25, 659.25, 783.99, 1046.5].forEach((freq, i) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.frequency.value = freq;
        osc.type = 'sine';
        gain.gain.setValueAtTime(0.3, ctx.currentTime + i * 0.15);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + i * 0.15 + 0.3);
        osc.start(ctx.currentTime + i * 0.15);
        osc.stop(ctx.currentTime + i * 0.15 + 0.3);
      });
    } else if (type === 'break') {
      [783.99, 659.25].forEach((freq, i) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.frequency.value = freq;
        osc.type = 'sine';
        gain.gain.setValueAtTime(0.2, ctx.currentTime + i * 0.2);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + i * 0.2 + 0.3);
        osc.start(ctx.currentTime + i * 0.2);
        osc.stop(ctx.currentTime + i * 0.2 + 0.3);
      });
    } else {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.frequency.value = 1000;
      osc.type = 'sine';
      gain.gain.setValueAtTime(0.1, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.1);
      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + 0.1);
    }
  } catch { /* ignore */ }
}

export function usePomodoro() {
  const [timerState, setTimerState] = useState<TimerState>('idle');
  const [mode, setMode] = useState<TimerMode>('focus');
  const [currentActivity, setCurrentActivity] = useState<Activity>(
    () => loadFromStorage('pomodoro-activity', ACTIVITIES[0])
  );
  const [timeLeft, setTimeLeft] = useState(currentActivity.focusDuration * 60);
  const [sessionsCompleted, setSessionsCompleted] = useState(0);
  const [tasks, setTasks] = useState<Task[]>(() => loadFromStorage('pomodoro-tasks', []));
  const [interruptions, setInterruptions] = useState<Interruption[]>([]);
  const [dailyGoal, setDailyGoal] = useState(() => loadFromStorage('pomodoro-daily-goal', 8));
  const [stats, setStats] = useState<PomodoroStats>(() =>
    loadFromStorage('pomodoro-stats', {
      currentStreak: 0,
      longestStreak: 0,
      totalSessions: 0,
      totalFocusMinutes: 0,
      history: [],
    })
  );

  const intervalRef = useRef<number | null>(null);
  const sessionStartTimeRef = useRef<number | null>(null);

  const totalTime = mode === 'focus'
    ? currentActivity.focusDuration * 60
    : mode === 'shortBreak'
    ? currentActivity.shortBreakDuration * 60
    : currentActivity.longBreakDuration * 60;

  // Save to localStorage
  useEffect(() => { localStorage.setItem('pomodoro-activity', JSON.stringify(currentActivity)); }, [currentActivity]);
  useEffect(() => { localStorage.setItem('pomodoro-tasks', JSON.stringify(tasks)); }, [tasks]);
  useEffect(() => { localStorage.setItem('pomodoro-stats', JSON.stringify(stats)); }, [stats]);
  useEffect(() => { localStorage.setItem('pomodoro-daily-goal', JSON.stringify(dailyGoal)); }, [dailyGoal]);

  // Today's stats
  const today = getTodayString();
  const todayHistory = stats.history.find(h => h.date === today);
  const todaySessions = todayHistory?.sessions || 0;
  const todayFocusMinutes = todayHistory?.focusMinutes || 0;

  // Timer interval
  useEffect(() => {
    if (timerState === 'running') {
      intervalRef.current = window.setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            handleSessionComplete();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [timerState]);

  const handleSessionComplete = useCallback(() => {
    if (mode === 'focus') {
      playSound('complete');
      const newCount = sessionsCompleted + 1;
      setSessionsCompleted(newCount);

      // Update stats
      setStats(prev => {
        const todayStr = getTodayString();
        const existingToday = prev.history.find(h => h.date === todayStr);
        let newHistory = [...prev.history];
        if (existingToday) {
          newHistory = newHistory.map(h =>
            h.date === todayStr
              ? { ...h, sessions: h.sessions + 1, focusMinutes: h.focusMinutes + currentActivity.focusDuration }
              : h
          );
        } else {
          newHistory.push({
            date: todayStr,
            sessions: 1,
            focusMinutes: currentActivity.focusDuration,
            interruptions: 0,
          });
        }
        newHistory = newHistory.slice(-30);

        return {
          ...prev,
          totalSessions: prev.totalSessions + 1,
          totalFocusMinutes: prev.totalFocusMinutes + currentActivity.focusDuration,
          history: newHistory,
        };
      });

      // Update task progress
      setTasks(prev => {
        const activeTask = prev.find(t => !t.isCompleted && t.completedPomodoros < t.estimatedPomodoros);
        if (activeTask) {
          return prev.map(t => {
            if (t.id === activeTask.id) {
              const newCompleted = t.completedPomodoros + 1;
              return { ...t, completedPomodoros: newCompleted, isCompleted: newCompleted >= t.estimatedPomodoros };
            }
            return t;
          });
        }
        return prev;
      });

      // Switch to break
      if (newCount % currentActivity.longBreakInterval === 0) {
        setMode('longBreak');
        setTimeLeft(currentActivity.longBreakDuration * 60);
      } else {
        setMode('shortBreak');
        setTimeLeft(currentActivity.shortBreakDuration * 60);
      }
      setTimerState('running'); // Auto-start break
    } else {
      playSound('break');
      setMode('focus');
      setTimeLeft(currentActivity.focusDuration * 60);
      setTimerState('idle'); // Don't auto-start focus
    }
    sessionStartTimeRef.current = null;
  }, [mode, sessionsCompleted, currentActivity]);

  // Actions
  const start = useCallback(() => {
    playSound('click');
    setTimerState('running');
    sessionStartTimeRef.current = Date.now();
  }, []);

  const pause = useCallback(() => {
    playSound('click');
    setTimerState('paused');
  }, []);

  const resume = useCallback(() => {
    playSound('click');
    setTimerState('running');
  }, []);

  const reset = useCallback(() => {
    playSound('click');
    setTimerState('idle');
    setTimeLeft(totalTime);
    sessionStartTimeRef.current = null;
  }, [totalTime]);

  const skip = useCallback(() => {
    playSound('click');
    setTimerState('idle');
    handleSessionComplete();
  }, [handleSessionComplete]);

  const toggleTimer = useCallback(() => {
    if (timerState === 'idle') start();
    else if (timerState === 'running') pause();
    else if (timerState === 'paused') resume();
  }, [timerState, start, pause, resume]);

  const switchActivity = useCallback((activity: Activity) => {
    setCurrentActivity(activity);
    setTimerState('idle');
    setMode('focus');
    setSessionsCompleted(0);
    setTimeLeft(activity.focusDuration * 60);
    sessionStartTimeRef.current = null;
  }, []);

  const switchMode = useCallback((newMode: TimerMode) => {
    setTimerState('idle');
    setMode(newMode);
    if (newMode === 'focus') setTimeLeft(currentActivity.focusDuration * 60);
    else if (newMode === 'shortBreak') setTimeLeft(currentActivity.shortBreakDuration * 60);
    else setTimeLeft(currentActivity.longBreakDuration * 60);
    sessionStartTimeRef.current = null;
  }, [currentActivity]);

  // Task management
  const addTask = useCallback((title: string, estimatedPomodoros: number) => {
    if (!title.trim()) return;
    setTasks(prev => [...prev, {
      id: Date.now().toString(),
      title: title.trim(),
      estimatedPomodoros,
      completedPomodoros: 0,
      isCompleted: false,
      createdAt: Date.now(),
    }]);
  }, []);

  const updateTask = useCallback((id: string, updates: Partial<Task>) => {
    setTasks(prev => prev.map(t => t.id === id ? { ...t, ...updates } : t));
  }, []);

  const deleteTask = useCallback((id: string) => {
    setTasks(prev => prev.filter(t => t.id !== id));
  }, []);

  // Interruption tracking
  const logInterruption = useCallback((type: 'internal' | 'external', note: string) => {
    setInterruptions(prev => [...prev, {
      id: Date.now().toString(),
      timestamp: Date.now(),
      type,
      note,
    }]);
  }, []);

  const clearInterruptions = useCallback(() => {
    setInterruptions([]);
  }, []);

  // Progress calculation
  const progress = totalTime > 0 ? 1 - timeLeft / totalTime : 0;
  const servoAngle = 10 + progress * 160; // 10° to 170°

  // Daily goal progress
  const dailyProgress = dailyGoal > 0 ? Math.min(todaySessions / dailyGoal, 1) : 0;
  const goalReached = todaySessions >= dailyGoal;

  return {
    // State
    timerState,
    mode,
    timeLeft,
    totalTime,
    progress,
    servoAngle,
    sessionsCompleted,
    currentActivity,
    tasks,
    interruptions,
    stats,
    todaySessions,
    todayFocusMinutes,
    dailyGoal,
    dailyProgress,
    goalReached,

    // Actions
    start,
    pause,
    resume,
    reset,
    skip,
    toggleTimer,
    switchActivity,
    switchMode,
    addTask,
    updateTask,
    deleteTask,
    logInterruption,
    clearInterruptions,
    setDailyGoal,
  };
}
