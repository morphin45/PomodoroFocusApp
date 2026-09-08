import { useState, useEffect, useRef, useCallback } from 'react';
import PomodoroScene from './components/PomodoroScene';

type TimerMode = 'focus' | 'shortBreak' | 'longBreak';

interface Settings {
  focus: number;
  shortBreak: number;
  longBreak: number;
  longBreakInterval: number;
}

interface SessionRecord {
  date: string;
  duration: number;
  completedAt: string;
}

interface Stats {
  sessionsCompleted: number;
  totalFocusMinutes: number;
  sessions: SessionRecord[];
}

const DEFAULT_SETTINGS: Settings = {
  focus: 25,
  shortBreak: 5,
  longBreak: 15,
  longBreakInterval: 4,
};

function getToday(): string {
  return new Date().toISOString().split('T')[0];
}

function loadSettings(): Settings {
  try {
    const saved = localStorage.getItem('pomodoro-settings');
    return saved ? JSON.parse(saved) : DEFAULT_SETTINGS;
  } catch {
    return DEFAULT_SETTINGS;
  }
}

function loadStats(): Stats {
  try {
    const saved = localStorage.getItem('pomodoro-stats');
    if (saved) {
      const stats = JSON.parse(saved);
      const today = getToday();
      const todaySessions = stats.sessions?.filter((s: SessionRecord) => s.date === today) || [];
      return {
        sessionsCompleted: todaySessions.length,
        totalFocusMinutes: todaySessions.reduce((sum: number, s: SessionRecord) => sum + s.duration, 0),
        sessions: stats.sessions || [],
      };
    }
  } catch { /* ignore */ }
  return { sessionsCompleted: 0, totalFocusMinutes: 0, sessions: [] };
}

function playNotificationSound() {
  try {
    const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
    const notes = [523.25, 659.25, 783.99, 1046.5];
    notes.forEach((freq, i) => {
      const oscillator = audioCtx.createOscillator();
      const gainNode = audioCtx.createGain();
      oscillator.connect(gainNode);
      gainNode.connect(audioCtx.destination);
      oscillator.frequency.value = freq;
      oscillator.type = 'sine';
      gainNode.gain.setValueAtTime(0.3, audioCtx.currentTime + i * 0.15);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + i * 0.15 + 0.3);
      oscillator.start(audioCtx.currentTime + i * 0.15);
      oscillator.stop(audioCtx.currentTime + i * 0.15 + 0.3);
    });
  } catch { /* ignore */ }
}

export default function App() {
  const [settings, setSettings] = useState<Settings>(loadSettings);
  const [mode, setMode] = useState<TimerMode>('focus');
  const [timeLeft, setTimeLeft] = useState(settings.focus * 60);
  const [isRunning, setIsRunning] = useState(false);
  const [stats, setStats] = useState<Stats>(loadStats);
  const [showSettings, setShowSettings] = useState(false);
  const [showStats, setShowStats] = useState(false);

  const intervalRef = useRef<number | null>(null);
  const totalTime = settings[mode] * 60;

  // Save settings
  useEffect(() => {
    localStorage.setItem('pomodoro-settings', JSON.stringify(settings));
  }, [settings]);

  // Timer logic
  useEffect(() => {
    if (isRunning && timeLeft > 0) {
      intervalRef.current = window.setInterval(() => {
        setTimeLeft(prev => prev - 1);
      }, 1000);
    } else if (timeLeft === 0 && isRunning) {
      setIsRunning(false);
      playNotificationSound();

      if (mode === 'focus') {
        const newStats = {
          ...stats,
          sessionsCompleted: stats.sessionsCompleted + 1,
          totalFocusMinutes: stats.totalFocusMinutes + settings.focus,
          sessions: [...stats.sessions, {
            date: getToday(),
            duration: settings.focus,
            completedAt: new Date().toISOString(),
          }],
        };
        setStats(newStats);
        localStorage.setItem('pomodoro-stats', JSON.stringify(newStats));

        // Auto switch to break
        const nextMode = (stats.sessionsCompleted + 1) % settings.longBreakInterval === 0
          ? 'longBreak'
          : 'shortBreak';
        setMode(nextMode);
        setTimeLeft(settings[nextMode] * 60);
      } else {
        setMode('focus');
        setTimeLeft(settings.focus * 60);
      }
    }

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isRunning, timeLeft, mode]);

  // Update document title
  useEffect(() => {
    const mins = Math.floor(timeLeft / 60);
    const secs = timeLeft % 60;
    const modeLabel = mode === 'focus' ? '🍅 Focus' : mode === 'shortBreak' ? '☕ Short Break' : '🌴 Long Break';
    document.title = `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')} - ${modeLabel}`;
  }, [timeLeft, mode]);

  const handleStart = useCallback(() => setIsRunning(true), []);
  const handlePause = useCallback(() => setIsRunning(false), []);
  const handleReset = useCallback(() => {
    setIsRunning(false);
    setTimeLeft(settings[mode] * 60);
  }, [mode, settings]);

  const handleModeChange = useCallback((newMode: TimerMode) => {
    setIsRunning(false);
    setMode(newMode);
    setTimeLeft(settings[newMode] * 60);
  }, [settings]);

  const handleSettingChange = useCallback((key: keyof Settings, value: number) => {
    setSettings(prev => ({ ...prev, [key]: value }));
    if (key === mode) {
      setTimeLeft(value * 60);
    }
  }, [mode]);

  const modeColors = {
    focus: { bg: 'from-red-950 via-gray-950 to-gray-950', text: 'text-red-400', border: 'border-red-500/30', btn: 'bg-red-600 hover:bg-red-500' },
    shortBreak: { bg: 'from-green-950 via-gray-950 to-gray-950', text: 'text-green-400', border: 'border-green-500/30', btn: 'bg-green-600 hover:bg-green-500' },
    longBreak: { bg: 'from-blue-950 via-gray-950 to-gray-950', text: 'text-blue-400', border: 'border-blue-500/30', btn: 'bg-blue-600 hover:bg-blue-500' },
  };

  const currentColors = modeColors[mode];

  return (
    <div className={`min-h-screen bg-gradient-to-br ${currentColors.bg} text-white transition-all duration-1000 flex flex-col`}>
      {/* Header */}
      <header className="flex items-center justify-between px-4 sm:px-6 py-4">
        <h1 className="text-xl sm:text-2xl font-bold flex items-center gap-2">
          <span className="text-2xl">🍅</span>
          <span className="bg-clip-text text-transparent bg-gradient-to-r from-red-400 to-orange-400">Pomodoro</span>
        </h1>
        <div className="flex gap-2">
          <button
            onClick={() => setShowStats(!showStats)}
            className="p-2 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 transition-all"
            title="Statistics"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
          </button>
          <button
            onClick={() => setShowSettings(!showSettings)}
            className="p-2 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 transition-all"
            title="Settings"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.066 2.573c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.573 1.066c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.066-2.573c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </button>
        </div>
      </header>

      {/* Mode Tabs */}
      <div className="flex justify-center px-4 pb-2">
        <div className="flex bg-white/5 backdrop-blur-sm rounded-xl p-1 border border-white/10">
          {([
            { key: 'focus' as TimerMode, label: 'Focus', icon: '🎯' },
            { key: 'shortBreak' as TimerMode, label: 'Short Break', icon: '☕' },
            { key: 'longBreak' as TimerMode, label: 'Long Break', icon: '🌴' },
          ]).map(({ key, label, icon }) => (
            <button
              key={key}
              onClick={() => handleModeChange(key)}
              className={`px-3 sm:px-5 py-2 rounded-lg text-sm font-medium transition-all duration-300 ${
                mode === key
                  ? 'bg-white/15 text-white shadow-lg'
                  : 'text-white/50 hover:text-white/80'
              }`}
            >
              <span className="mr-1">{icon}</span>
              <span className="hidden sm:inline">{label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* 3D Scene */}
      <div className="flex-1 relative min-h-[350px] sm:min-h-[400px]">
        <PomodoroScene
          mode={mode}
          timeLeft={timeLeft}
          totalTime={totalTime}
          isRunning={isRunning}
          sessionsCompleted={stats.sessionsCompleted}
          longBreakInterval={settings.longBreakInterval}
        />
        {/* Drag hint */}
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-white/30 text-xs flex items-center gap-1 pointer-events-none">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 11.5V14m0-2.5v-6a1.5 1.5 0 113 0m-3 6a1.5 1.5 0 00-3 0v2a7.5 7.5 0 0015 0v-5a1.5 1.5 0 00-3 0m-6-3V11m0-5.5v-1a1.5 1.5 0 013 0v1m0 0V11m0-5.5a1.5 1.5 0 013 0v3m0 0V11" />
          </svg>
          Drag to rotate • Scroll to zoom
        </div>
      </div>

      {/* Controls */}
      <div className="px-4 pb-4 sm:pb-6">
        <div className="flex justify-center gap-3 sm:gap-4 mb-4">
          {!isRunning ? (
            <button
              onClick={handleStart}
              className={`${currentColors.btn} text-white px-8 py-3 rounded-xl font-semibold text-lg shadow-lg transition-all duration-300 transform hover:scale-105 active:scale-95`}
            >
              <span className="flex items-center gap-2">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M8 5v14l11-7z"/>
                </svg>
                Start
              </span>
            </button>
          ) : (
            <button
              onClick={handlePause}
              className="bg-amber-600 hover:bg-amber-500 text-white px-8 py-3 rounded-xl font-semibold text-lg shadow-lg transition-all duration-300 transform hover:scale-105 active:scale-95"
            >
              <span className="flex items-center gap-2">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z"/>
                </svg>
                Pause
              </span>
            </button>
          )}
          <button
            onClick={handleReset}
            className="bg-white/10 hover:bg-white/20 text-white px-6 py-3 rounded-xl font-semibold text-lg border border-white/20 transition-all duration-300 transform hover:scale-105 active:scale-95"
          >
            <span className="flex items-center gap-2">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              Reset
            </span>
          </button>
        </div>

        {/* Quick Stats Bar */}
        <div className="flex justify-center gap-4 sm:gap-8 text-sm">
          <div className="flex items-center gap-2 text-white/60">
            <span className="text-lg">🍅</span>
            <span>{stats.sessionsCompleted} sessions</span>
          </div>
          <div className="flex items-center gap-2 text-white/60">
            <span className="text-lg">⏱️</span>
            <span>{stats.totalFocusMinutes} min focused</span>
          </div>
        </div>
      </div>

      {/* Settings Panel */}
      {showSettings && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={() => setShowSettings(false)}>
          <div className="bg-gray-900 border border-white/10 rounded-2xl p-6 w-full max-w-md shadow-2xl" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold">Settings</h2>
              <button onClick={() => setShowSettings(false)} className="p-1 hover:bg-white/10 rounded-lg">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="space-y-4">
              {([
                { key: 'focus' as keyof Settings, label: 'Focus Duration', min: 1, max: 120, unit: 'min' },
                { key: 'shortBreak' as keyof Settings, label: 'Short Break', min: 1, max: 30, unit: 'min' },
                { key: 'longBreak' as keyof Settings, label: 'Long Break', min: 5, max: 60, unit: 'min' },
                { key: 'longBreakInterval' as keyof Settings, label: 'Sessions until Long Break', min: 2, max: 10, unit: '' },
              ]).map(({ key, label, min, max, unit }) => (
                <div key={key} className="flex items-center justify-between">
                  <label className="text-white/70 text-sm">{label}</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="range"
                      min={min}
                      max={max}
                      value={settings[key]}
                      onChange={(e) => handleSettingChange(key, Number(e.target.value))}
                      className="w-24 sm:w-32 accent-red-500"
                    />
                    <span className="text-white font-mono w-12 text-right">
                      {settings[key]}{unit}
                    </span>
                  </div>
                </div>
              ))}
            </div>
            <button
              onClick={() => {
                setSettings(DEFAULT_SETTINGS);
                setTimeLeft(DEFAULT_SETTINGS[mode] * 60);
              }}
              className="mt-6 w-full py-2 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-sm text-white/60 transition-all"
            >
              Reset to Defaults
            </button>
          </div>
        </div>
      )}

      {/* Stats Panel */}
      {showStats && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={() => setShowStats(false)}>
          <div className="bg-gray-900 border border-white/10 rounded-2xl p-6 w-full max-w-md shadow-2xl" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold">Today's Statistics</h2>
              <button onClick={() => setShowStats(false)} className="p-1 hover:bg-white/10 rounded-lg">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="bg-white/5 rounded-xl p-4 text-center border border-white/5">
                <div className="text-3xl font-bold text-red-400">{stats.sessionsCompleted}</div>
                <div className="text-xs text-white/50 mt-1">Sessions</div>
              </div>
              <div className="bg-white/5 rounded-xl p-4 text-center border border-white/5">
                <div className="text-3xl font-bold text-orange-400">{stats.totalFocusMinutes}</div>
                <div className="text-xs text-white/50 mt-1">Minutes</div>
              </div>
              <div className="bg-white/5 rounded-xl p-4 text-center border border-white/5">
                <div className="text-3xl font-bold text-yellow-400">{Math.round(stats.totalFocusMinutes / 60 * 10) / 10}</div>
                <div className="text-xs text-white/50 mt-1">Hours</div>
              </div>
              <div className="bg-white/5 rounded-xl p-4 text-center border border-white/5">
                <div className="text-3xl font-bold text-green-400">{settings.longBreakInterval - (stats.sessionsCompleted % settings.longBreakInterval)}</div>
                <div className="text-xs text-white/50 mt-1">Until Long Break</div>
              </div>
            </div>

            {/* Progress to long break */}
            <div className="mb-4">
              <div className="flex justify-between text-sm text-white/50 mb-2">
                <span>Progress to Long Break</span>
                <span>{stats.sessionsCompleted % settings.longBreakInterval}/{settings.longBreakInterval}</span>
              </div>
              <div className="h-3 bg-white/5 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-red-500 to-orange-500 rounded-full transition-all duration-500"
                  style={{ width: `${((stats.sessionsCompleted % settings.longBreakInterval) / settings.longBreakInterval) * 100}%` }}
                />
              </div>
            </div>

            <button
              onClick={() => {
                const emptyStats = { sessionsCompleted: 0, totalFocusMinutes: 0, sessions: [] };
                setStats(emptyStats);
                localStorage.setItem('pomodoro-stats', JSON.stringify(emptyStats));
              }}
              className="mt-2 w-full py-2 rounded-lg bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 text-sm text-red-400 transition-all"
            >
              Clear Today's Data
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
