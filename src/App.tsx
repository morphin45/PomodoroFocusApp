import { useState } from 'react';
import { usePomodoro, TimerMode } from './hooks/usePomodoro';

function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

function getModeLabel(mode: TimerMode): string {
  switch (mode) {
    case 'focus': return 'Focus';
    case 'shortBreak': return 'Short Break';
    case 'longBreak': return 'Long Break';
  }
}

function getModeEmoji(mode: TimerMode): string {
  switch (mode) {
    case 'focus': return '🎯';
    case 'shortBreak': return '☕';
    case 'longBreak': return '🌿';
  }
}

function getModeColor(mode: TimerMode): string {
  switch (mode) {
    case 'focus': return '#ef4444';
    case 'shortBreak': return '#22c55e';
    case 'longBreak': return '#3b82f6';
  }
}

function getModeAccentBg(mode: TimerMode): string {
  switch (mode) {
    case 'focus': return 'bg-red-500/10 border-red-500/20';
    case 'shortBreak': return 'bg-green-500/10 border-green-500/20';
    case 'longBreak': return 'bg-blue-500/10 border-blue-500/20';
  }
}

function getModeButtonBg(mode: TimerMode): string {
  switch (mode) {
    case 'focus': return 'bg-red-500 hover:bg-red-600 shadow-red-500/25';
    case 'shortBreak': return 'bg-green-500 hover:bg-green-600 shadow-green-500/25';
    case 'longBreak': return 'bg-blue-500 hover:bg-blue-600 shadow-blue-500/25';
  }
}

// Circular Progress Ring
function ProgressRing({ progress, mode, size = 280 }: { progress: number; mode: TimerMode; size?: number }) {
  const strokeWidth = 6;
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - (progress / 100) * circumference;
  const color = getModeColor(mode);

  return (
    <svg width={size} height={size} className="transform -rotate-90 drop-shadow-sm">
      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        fill="none"
        stroke="currentColor"
        strokeWidth={strokeWidth}
        className="text-gray-200/80 dark:text-gray-700/50"
      />
      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        fill="none"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeDasharray={circumference}
        strokeDashoffset={offset}
        strokeLinecap="round"
        className="transition-all duration-1000 ease-linear"
        style={{ filter: `drop-shadow(0 0 6px ${color}40)` }}
      />
    </svg>
  );
}

// Settings Panel
function SettingsPanel({
  settings,
  onUpdate,
  isOpen,
  onToggle,
}: {
  settings: { focusDuration: number; shortBreakDuration: number; longBreakDuration: number; longBreakInterval: number };
  onUpdate: (s: Partial<typeof settings>) => void;
  isOpen: boolean;
  onToggle: () => void;
}) {
  return (
    <div className="w-full max-w-md mx-auto">
      <button
        onClick={onToggle}
        className="flex items-center gap-2 text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300 transition-colors mx-auto group"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 group-hover:rotate-90 transition-transform duration-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.066 2.573c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.573 1.066c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.066-2.573c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
        <span className="text-sm font-medium">Customize Durations</span>
        <svg xmlns="http://www.w3.org/2000/svg" className={`w-3.5 h-3.5 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      <div className={`overflow-hidden transition-all duration-300 ${isOpen ? 'max-h-80 opacity-100 mt-4' : 'max-h-0 opacity-0'}`}>
        <div className="p-5 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl shadow-lg border border-gray-100 dark:border-gray-700/50 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1.5 uppercase tracking-wide">Focus</label>
              <div className="relative">
                <input
                  type="number"
                  min="1"
                  max="120"
                  value={settings.focusDuration}
                  onChange={e => onUpdate({ focusDuration: Math.max(1, Math.min(120, parseInt(e.target.value) || 1)) })}
                  className="w-full px-3 py-2.5 rounded-xl border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700/50 text-gray-900 dark:text-white text-sm font-medium focus:outline-none focus:ring-2 focus:ring-red-500/30 focus:border-red-500/50 transition-all"
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-400">min</span>
              </div>
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1.5 uppercase tracking-wide">Short Break</label>
              <div className="relative">
                <input
                  type="number"
                  min="1"
                  max="30"
                  value={settings.shortBreakDuration}
                  onChange={e => onUpdate({ shortBreakDuration: Math.max(1, Math.min(30, parseInt(e.target.value) || 1)) })}
                  className="w-full px-3 py-2.5 rounded-xl border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700/50 text-gray-900 dark:text-white text-sm font-medium focus:outline-none focus:ring-2 focus:ring-green-500/30 focus:border-green-500/50 transition-all"
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-400">min</span>
              </div>
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1.5 uppercase tracking-wide">Long Break</label>
              <div className="relative">
                <input
                  type="number"
                  min="1"
                  max="60"
                  value={settings.longBreakDuration}
                  onChange={e => onUpdate({ longBreakDuration: Math.max(1, Math.min(60, parseInt(e.target.value) || 1)) })}
                  className="w-full px-3 py-2.5 rounded-xl border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700/50 text-gray-900 dark:text-white text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500/50 transition-all"
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-400">min</span>
              </div>
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1.5 uppercase tracking-wide">Long Break After</label>
              <div className="relative">
                <input
                  type="number"
                  min="2"
                  max="10"
                  value={settings.longBreakInterval}
                  onChange={e => onUpdate({ longBreakInterval: Math.max(2, Math.min(10, parseInt(e.target.value) || 2)) })}
                  className="w-full px-3 py-2.5 rounded-xl border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700/50 text-gray-900 dark:text-white text-sm font-medium focus:outline-none focus:ring-2 focus:ring-purple-500/30 focus:border-purple-500/50 transition-all"
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-400">sessions</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Statistics Panel
function StatsPanel({
  todayFocusMinutes,
  todaySessionCount,
  completedFocusSessions,
  mode,
}: {
  todayFocusMinutes: number;
  todaySessionCount: number;
  completedFocusSessions: number;
  mode: TimerMode;
}) {
  const hours = Math.floor(todayFocusMinutes / 60);
  const mins = todayFocusMinutes % 60;
  const focusTimeDisplay = hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;

  return (
    <div className="w-full max-w-md mx-auto">
      <div className="grid grid-cols-3 gap-3">
        <div className={`p-4 rounded-xl border ${getModeAccentBg(mode)} text-center transition-colors duration-500`}>
          <div className="text-2xl font-bold text-gray-800 dark:text-white">{todaySessionCount}</div>
          <div className="text-[11px] text-gray-500 dark:text-gray-400 mt-1 font-medium">Sessions Today</div>
        </div>
        <div className={`p-4 rounded-xl border ${getModeAccentBg(mode)} text-center transition-colors duration-500`}>
          <div className="text-2xl font-bold text-gray-800 dark:text-white">{focusTimeDisplay}</div>
          <div className="text-[11px] text-gray-500 dark:text-gray-400 mt-1 font-medium">Focus Time</div>
        </div>
        <div className={`p-4 rounded-xl border ${getModeAccentBg(mode)} text-center transition-colors duration-500`}>
          <div className="text-2xl font-bold text-gray-800 dark:text-white">{completedFocusSessions}</div>
          <div className="text-[11px] text-gray-500 dark:text-gray-400 mt-1 font-medium">All Time</div>
        </div>
      </div>
    </div>
  );
}

export default function App() {
  const pomodoro = usePomodoro();
  const [settingsOpen, setSettingsOpen] = useState(false);

  const {
    mode,
    timeLeft,
    isRunning,
    completedFocusSessions,
    settings,
    todayFocusMinutes,
    todaySessionCount,
    start,
    pause,
    reset,
    switchMode,
    updateSettings,
    getDuration,
  } = pomodoro;

  const totalDuration = getDuration(mode);
  const progress = ((totalDuration - timeLeft) / totalDuration) * 100;

  const modes: TimerMode[] = ['focus', 'shortBreak', 'longBreak'];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-gray-50 to-stone-100 dark:from-gray-950 dark:via-gray-900 dark:to-slate-950 flex flex-col items-center justify-center px-4 py-8 transition-colors duration-500">
      {/* Background decorative elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className={`absolute -top-40 -right-40 w-80 h-80 rounded-full blur-3xl opacity-20 transition-colors duration-1000 ${
          mode === 'focus' ? 'bg-red-300' : mode === 'shortBreak' ? 'bg-green-300' : 'bg-blue-300'
        }`} />
        <div className={`absolute -bottom-40 -left-40 w-80 h-80 rounded-full blur-3xl opacity-15 transition-colors duration-1000 ${
          mode === 'focus' ? 'bg-orange-200' : mode === 'shortBreak' ? 'bg-emerald-200' : 'bg-indigo-200'
        }`} />
      </div>

      {/* Content */}
      <div className="relative z-10 flex flex-col items-center w-full max-w-lg">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800 dark:text-white tracking-tight flex items-center justify-center gap-2">
            <span className="text-4xl">🍅</span>
            <span>Pomodoro Focus</span>
          </h1>
          <p className="text-gray-400 dark:text-gray-500 text-sm mt-2 font-medium">Stay focused. Take breaks. Be productive.</p>
        </div>

        {/* Mode Tabs */}
        <div className="flex gap-1 p-1.5 bg-white/70 dark:bg-gray-800/70 backdrop-blur-md rounded-2xl shadow-sm border border-gray-200/50 dark:border-gray-700/50 mb-10">
          {modes.map(m => (
            <button
              key={m}
              onClick={() => switchMode(m)}
              className={`px-5 py-2.5 rounded-xl text-sm font-semibold transition-all duration-300 ${
                mode === m
                  ? 'bg-gray-900 dark:bg-white text-white dark:text-gray-900 shadow-md'
                  : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-100/50 dark:hover:bg-gray-700/30'
              }`}
            >
              <span className="mr-1.5">{getModeEmoji(m)}</span>
              {getModeLabel(m)}
            </button>
          ))}
        </div>

        {/* Timer Display */}
        <div className="relative mb-8">
          <div className={`absolute inset-0 rounded-full blur-2xl opacity-20 transition-colors duration-1000 ${
            mode === 'focus' ? 'bg-red-400' : mode === 'shortBreak' ? 'bg-green-400' : 'bg-blue-400'
          } ${isRunning ? 'animate-pulse' : ''}`} />
          <div className="relative">
            <ProgressRing progress={progress} mode={mode} size={280} />
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className={`text-6xl font-mono font-bold text-gray-800 dark:text-white tracking-wider transition-opacity ${isRunning ? 'opacity-100' : 'opacity-90'}`}>
                {formatTime(timeLeft)}
              </span>
              <span className="text-xs font-semibold text-gray-400 dark:text-gray-500 mt-3 uppercase tracking-widest">
                {getModeLabel(mode)}
              </span>
            </div>
          </div>
        </div>

        {/* Controls */}
        <div className="flex items-center gap-5 mb-8">
          {/* Reset Button */}
          <button
            onClick={reset}
            className="w-12 h-12 flex items-center justify-center rounded-2xl bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border border-gray-200/80 dark:border-gray-700/50 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:border-gray-300 dark:hover:border-gray-600 transition-all shadow-sm hover:shadow-md active:scale-95"
            title="Reset timer"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
          </button>

          {/* Start/Pause Button */}
          <button
            onClick={isRunning ? pause : start}
            disabled={timeLeft === 0}
            className={`w-18 h-18 w-[72px] h-[72px] flex items-center justify-center rounded-2xl text-white shadow-xl transition-all transform hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed ${getModeButtonBg(mode)}`}
          >
            {isRunning ? (
              <svg xmlns="http://www.w3.org/2000/svg" className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24">
                <rect x="6" y="4" width="4" height="16" rx="1" />
                <rect x="14" y="4" width="4" height="16" rx="1" />
              </svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" className="w-8 h-8 ml-1" fill="currentColor" viewBox="0 0 24 24">
                <path d="M8 5.14v13.72a1 1 0 001.5.86l11.04-6.86a1 1 0 000-1.72L9.5 4.28A1 1 0 008 5.14z" />
              </svg>
            )}
          </button>

          {/* Skip Button */}
          <button
            onClick={() => {
              if (mode === 'focus') {
                const nextMode = (completedFocusSessions + 1) % settings.longBreakInterval === 0 ? 'longBreak' : 'shortBreak';
                switchMode(nextMode);
              } else {
                switchMode('focus');
              }
            }}
            className="w-12 h-12 flex items-center justify-center rounded-2xl bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border border-gray-200/80 dark:border-gray-700/50 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:border-gray-300 dark:hover:border-gray-600 transition-all shadow-sm hover:shadow-md active:scale-95"
            title="Skip to next phase"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M13 5l7 7-7 7M5 5l7 7-7 7" />
            </svg>
          </button>
        </div>

        {/* Session Progress Dots */}
        <div className="flex items-center gap-2.5 mb-10">
          {Array.from({ length: settings.longBreakInterval }).map((_, i) => {
            const isCompleted = i < (completedFocusSessions % settings.longBreakInterval);
            return (
              <div
                key={i}
                className={`w-3 h-3 rounded-full transition-all duration-500 ${
                  isCompleted
                    ? 'bg-red-500 shadow-sm shadow-red-500/30 scale-100'
                    : 'bg-gray-200 dark:bg-gray-700 scale-90'
                }`}
              />
            );
          })}
          <span className="text-xs text-gray-400 dark:text-gray-500 ml-1 font-medium">
            {completedFocusSessions % settings.longBreakInterval}/{settings.longBreakInterval} to long break
          </span>
        </div>

        {/* Statistics */}
        <div className="w-full mb-8">
          <h2 className="text-[11px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest text-center mb-3">
            Today's Progress
          </h2>
          <StatsPanel
            todayFocusMinutes={todayFocusMinutes}
            todaySessionCount={todaySessionCount}
            completedFocusSessions={completedFocusSessions}
            mode={mode}
          />
        </div>

        {/* Settings */}
        <div className="w-full">
          <SettingsPanel
            settings={settings}
            onUpdate={updateSettings}
            isOpen={settingsOpen}
            onToggle={() => setSettingsOpen(!settingsOpen)}
          />
        </div>

        {/* Footer */}
        <div className="mt-10 text-center">
          <p className="text-[11px] text-gray-300 dark:text-gray-600 font-medium">
            💾 Progress saved locally
          </p>
        </div>
      </div>
    </div>
  );
}
