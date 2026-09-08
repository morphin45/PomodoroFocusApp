import { useState, useEffect, useCallback, useRef } from 'react';

export type TimerMode = 'focus' | 'shortBreak' | 'longBreak';

export interface PomodoroSettings {
  focusDuration: number;
  shortBreakDuration: number;
  longBreakDuration: number;
  longBreakInterval: number;
}

export interface FocusSession {
  id: string;
  date: string;
  duration: number;
  completedAt: number;
}

const DEFAULT_SETTINGS: PomodoroSettings = {
  focusDuration: 25,
  shortBreakDuration: 5,
  longBreakDuration: 15,
  longBreakInterval: 4,
};

function getTodayString(): string {
  return new Date().toISOString().split('T')[0];
}

function loadState(): { settings?: PomodoroSettings; sessions?: FocusSession[]; completedFocusSessions?: number } {
  try {
    const saved = localStorage.getItem('pomodoro-state');
    if (saved) return JSON.parse(saved);
  } catch (e) {
    console.error('Failed to load state:', e);
  }
  return {};
}

function saveState(data: { settings: PomodoroSettings; sessions: FocusSession[]; completedFocusSessions: number }) {
  try {
    localStorage.setItem('pomodoro-state', JSON.stringify(data));
  } catch (e) {
    console.error('Failed to save state:', e);
  }
}

// Simple beep using Web Audio API
function playNotificationSound() {
  try {
    const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
    const playTone = (freq: number, startTime: number, duration: number) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.frequency.value = freq;
      osc.type = 'sine';
      gain.gain.setValueAtTime(0.3, startTime);
      gain.gain.exponentialRampToValueAtTime(0.01, startTime + duration);
      osc.start(startTime);
      osc.stop(startTime + duration);
    };
    const now = ctx.currentTime;
    playTone(880, now, 0.15);
    playTone(1100, now + 0.18, 0.15);
    playTone(880, now + 0.36, 0.25);
  } catch (e) {
    // Silently fail if audio not available
  }
}

export function usePomodoro() {
  const savedState = useRef(loadState());

  const [settings, setSettings] = useState<PomodoroSettings>(
    savedState.current.settings || DEFAULT_SETTINGS
  );
  const [mode, setMode] = useState<TimerMode>('focus');
  const [timeLeft, setTimeLeft] = useState(settings.focusDuration * 60);
  const [isRunning, setIsRunning] = useState(false);
  const [completedFocusSessions, setCompletedFocusSessions] = useState(
    savedState.current.completedFocusSessions || 0
  );
  const [sessions, setSessions] = useState<FocusSession[]>(
    savedState.current.sessions || []
  );

  // Use refs to avoid stale closures in the interval
  const modeRef = useRef(mode);
  const settingsRef = useRef(settings);
  const completedRef = useRef(completedFocusSessions);

  useEffect(() => { modeRef.current = mode; }, [mode]);
  useEffect(() => { settingsRef.current = settings; }, [settings]);
  useEffect(() => { completedRef.current = completedFocusSessions; }, [completedFocusSessions]);

  const intervalRef = useRef<number | null>(null);

  const getDuration = useCallback((m: TimerMode) => {
    switch (m) {
      case 'focus': return settings.focusDuration * 60;
      case 'shortBreak': return settings.shortBreakDuration * 60;
      case 'longBreak': return settings.longBreakDuration * 60;
    }
  }, [settings]);

  // Save state whenever it changes
  useEffect(() => {
    saveState({ settings, sessions, completedFocusSessions });
  }, [settings, sessions, completedFocusSessions]);

  // Timer countdown
  useEffect(() => {
    if (isRunning) {
      intervalRef.current = window.setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            // Timer completed - handle inline to avoid stale closures
            const currentMode = modeRef.current;
            const currentSettings = settingsRef.current;
            const currentCompleted = completedRef.current;

            setIsRunning(false);
            playNotificationSound();

            if (currentMode === 'focus') {
              const elapsed = currentSettings.focusDuration * 60;
              const newSession: FocusSession = {
                id: Date.now().toString(),
                date: getTodayString(),
                duration: elapsed,
                completedAt: Date.now(),
              };
              setSessions(prev => [...prev, newSession]);
              setCompletedFocusSessions(prev => prev + 1);

              const newCount = currentCompleted + 1;
              if (newCount % currentSettings.longBreakInterval === 0) {
                setMode('longBreak');
                setTimeLeft(currentSettings.longBreakDuration * 60);
              } else {
                setMode('shortBreak');
                setTimeLeft(currentSettings.shortBreakDuration * 60);
              }
            } else {
              setMode('focus');
              setTimeLeft(currentSettings.focusDuration * 60);
            }

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
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isRunning]);

  const start = useCallback(() => {
    if (timeLeft > 0) {
      setIsRunning(true);
    }
  }, [timeLeft]);

  const pause = useCallback(() => {
    setIsRunning(false);
  }, []);

  const reset = useCallback(() => {
    setIsRunning(false);
    const dur = (() => {
      switch (mode) {
        case 'focus': return settings.focusDuration * 60;
        case 'shortBreak': return settings.shortBreakDuration * 60;
        case 'longBreak': return settings.longBreakDuration * 60;
      }
    })();
    setTimeLeft(dur);
  }, [mode, settings]);

  const switchMode = useCallback((newMode: TimerMode) => {
    setIsRunning(false);
    setMode(newMode);
    const dur = (() => {
      switch (newMode) {
        case 'focus': return settings.focusDuration * 60;
        case 'shortBreak': return settings.shortBreakDuration * 60;
        case 'longBreak': return settings.longBreakDuration * 60;
      }
    })();
    setTimeLeft(dur);
  }, [settings]);

  const updateSettings = useCallback((newSettings: Partial<PomodoroSettings>) => {
    setSettings(prev => {
      const updated = { ...prev, ...newSettings };
      return updated;
    });
  }, []);

  // When settings change and timer is not running, update timeLeft
  useEffect(() => {
    if (!isRunning) {
      switch (mode) {
        case 'focus':
          setTimeLeft(settings.focusDuration * 60);
          break;
        case 'shortBreak':
          setTimeLeft(settings.shortBreakDuration * 60);
          break;
        case 'longBreak':
          setTimeLeft(settings.longBreakDuration * 60);
          break;
      }
    }
  }, [settings, isRunning, mode]);

  // Today's statistics
  const todayString = getTodayString();
  const todaySessions = sessions.filter(s => s.date === todayString);
  const todayFocusSeconds = todaySessions.reduce((sum, s) => sum + s.duration, 0);
  const todayFocusMinutes = Math.round(todayFocusSeconds / 60);
  const todaySessionCount = todaySessions.length;

  return {
    mode,
    timeLeft,
    isRunning,
    completedFocusSessions,
    settings,
    todayFocusMinutes,
    todaySessionCount,
    todaySessions,
    start,
    pause,
    reset,
    switchMode,
    updateSettings,
    getDuration,
  };
}
