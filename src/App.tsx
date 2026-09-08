import { useState, useEffect, useRef } from 'react';
import { usePomodoro, type TimerMode } from './hooks/usePomodoro';

function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

// Theme colors per mode
const themes = {
  focus: {
    bg: 'from-rose-50 via-red-50 to-orange-50',
    accent: '#e11d48',
    accentSoft: '#fecdd3',
    ring: 'from-rose-400 to-red-500',
    text: '#9f1239',
    surface: 'rgba(255, 255, 255, 0.7)',
  },
  shortBreak: {
    bg: 'from-emerald-50 via-teal-50 to-cyan-50',
    accent: '#059669',
    accentSoft: '#a7f3d0',
    ring: 'from-emerald-400 to-teal-500',
    text: '#065f46',
    surface: 'rgba(255, 255, 255, 0.7)',
  },
  longBreak: {
    bg: 'from-blue-50 via-indigo-50 to-violet-50',
    accent: '#2563eb',
    accentSoft: '#bfdbfe',
    ring: 'from-blue-400 to-indigo-500',
    text: '#1e40af',
    surface: 'rgba(255, 255, 255, 0.7)',
  },
};

export default function App() {
  const pomo = usePomodoro();
  const [showTasks, setShowTasks] = useState(false);
  const [showStats, setShowStats] = useState(false);
  const [taskInput, setTaskInput] = useState('');
  const theme = themes[pomo.mode];
  const prevMode = useRef(pomo.mode);

  // Update document title
  useEffect(() => {
    const label = pomo.mode === 'focus' ? '🍅' : pomo.mode === 'shortBreak' ? '☕' : '🌊';
    document.title = pomo.timerState === 'running'
      ? `${formatTime(pomo.timeLeft)} ${label}`
      : 'Pomodoro';
  }, [pomo.timeLeft, pomo.timerState, pomo.mode]);

  // Subtle sound on mode change
  useEffect(() => {
    if (prevMode.current !== pomo.mode && pomo.timerState === 'idle') {
      const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.frequency.value = pomo.mode === 'focus' ? 440 : pomo.mode === 'shortBreak' ? 523 : 659;
      gain.gain.setValueAtTime(0.08, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.3);
      osc.start();
      osc.stop(ctx.currentTime + 0.3);
    }
    prevMode.current = pomo.mode;
  }, [pomo.mode, pomo.timerState]);

  const progress = pomo.totalTime > 0 ? (pomo.totalTime - pomo.timeLeft) / pomo.totalTime : 0;
  const degrees = progress * 360;

  const handleAddTask = () => {
    if (taskInput.trim()) {
      pomo.addTask(taskInput.trim(), 1);
      setTaskInput('');
    }
  };

  return (
    <div className={`min-h-screen w-full bg-gradient-to-br ${theme.bg} transition-all duration-1000 flex flex-col overflow-hidden`}>
      {/* Top bar - minimal */}
      <header className="w-full px-6 md:px-12 pt-6 flex items-center justify-between z-10">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-sm"
            style={{ background: theme.accent }}>
            🍅
          </div>
          <span className="font-semibold tracking-tight" style={{ color: theme.text }}>Pomodoro</span>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => { setShowStats(!showStats); setShowTasks(false); }}
            className="w-9 h-9 rounded-full flex items-center justify-center transition-all hover:scale-110"
            style={{ background: theme.surface, backdropFilter: 'blur(10px)' }}
            title="Statistics"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={theme.text} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="20" x2="18" y2="10" />
              <line x1="12" y1="20" x2="12" y2="4" />
              <line x1="6" y1="20" x2="6" y2="14" />
            </svg>
          </button>
          <button
            onClick={() => { setShowTasks(!showTasks); setShowStats(false); }}
            className="w-9 h-9 rounded-full flex items-center justify-center transition-all hover:scale-110"
            style={{ background: theme.surface, backdropFilter: 'blur(10px)' }}
            title="Tasks"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={theme.text} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 11l3 3L22 4" />
              <path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11" />
            </svg>
          </button>
        </div>
      </header>

      {/* Main content - centered */}
      <main className="flex-1 flex flex-col items-center justify-center px-6 relative">
        {/* Mode selector - pill style */}
        <div className="flex gap-1 p-1 rounded-full mb-12 md:mb-16"
          style={{ background: theme.surface, backdropFilter: 'blur(10px)' }}>
          {([
            { id: 'focus' as TimerMode, label: 'Focus', time: '25' },
            { id: 'shortBreak' as TimerMode, label: 'Short Break', time: '5' },
            { id: 'longBreak' as TimerMode, label: 'Long Break', time: '15' },
          ]).map(m => (
            <button
              key={m.id}
              onClick={() => pomo.setMode(m.id)}
              className="px-4 md:px-6 py-2 rounded-full text-sm font-medium transition-all duration-300"
              style={{
                background: pomo.mode === m.id ? theme.accent : 'transparent',
                color: pomo.mode === m.id ? 'white' : theme.text,
                transform: pomo.mode === m.id ? 'scale(1.02)' : 'scale(1)',
              }}
            >
              {m.label}
            </button>
          ))}
        </div>

        {/* THE TIMER - Hero element */}
        <div className="relative mb-12">
          {/* Outer glow */}
          <div
            className="absolute inset-0 rounded-full blur-3xl opacity-30 transition-all duration-1000"
            style={{
              background: theme.accent,
              transform: pomo.timerState === 'running' ? 'scale(1.1)' : 'scale(1)',
            }}
          />

          {/* Timer circle */}
          <div
            className="relative w-72 h-72 md:w-96 md:h-96 rounded-full flex items-center justify-center transition-all duration-500"
            style={{
              background: `conic-gradient(${theme.accent} ${degrees}deg, rgba(255,255,255,0.3) ${degrees}deg)`,
              boxShadow: `0 20px 60px ${theme.accent}30, inset 0 0 0 2px rgba(255,255,255,0.5)`,
            }}
          >
            {/* Inner circle */}
            <div
              className="w-[88%] h-[88%] rounded-full flex flex-col items-center justify-center transition-all duration-500"
              style={{
                background: theme.surface,
                backdropFilter: 'blur(20px)',
                boxShadow: 'inset 0 2px 20px rgba(255,255,255,0.8), inset 0 -2px 20px rgba(0,0,0,0.03)',
              }}
            >
              {/* Mode label */}
              <div
                className="text-xs font-semibold uppercase tracking-widest mb-2 transition-colors duration-500"
                style={{ color: theme.accent }}
              >
                {pomo.mode === 'focus' ? 'Focus Time' : pomo.mode === 'shortBreak' ? 'Short Break' : 'Long Break'}
              </div>

              {/* Time display */}
              <div
                className="font-bold tabular-nums transition-colors duration-500 leading-none"
                style={{
                  color: theme.text,
                  fontSize: 'clamp(3.5rem, 12vw, 6rem)',
                  letterSpacing: '-0.02em',
                }}
              >
                {formatTime(pomo.timeLeft)}
              </div>

              {/* Status */}
              <div
                className="text-xs mt-3 transition-colors duration-500 opacity-70"
                style={{ color: theme.text }}
              >
                {pomo.timerState === 'running' ? '● Running' : pomo.timerState === 'paused' ? '❚❚ Paused' : 'Ready'}
              </div>
            </div>
          </div>

          {/* Decorative dots around the timer */}
          {Array.from({ length: 60 }).map((_, i) => {
            const angle = (i / 60) * Math.PI * 2 - Math.PI / 2;
            const radius = 52;
            const x = Math.cos(angle) * radius;
            const y = Math.sin(angle) * radius;
            const isMajor = i % 5 === 0;
            return (
              <div
                key={i}
                className="absolute rounded-full"
                style={{
                  width: isMajor ? '4px' : '2px',
                  height: isMajor ? '4px' : '2px',
                  background: i / 60 <= progress ? theme.accent : `${theme.text}20`,
                  left: `calc(50% + ${x}% - ${isMajor ? 2 : 1}px)`,
                  top: `calc(50% + ${y}% - ${isMajor ? 2 : 1}px)`,
                  transition: 'background 0.3s',
                }}
              />
            );
          })}
        </div>

        {/* Controls */}
        <div className="flex items-center gap-4 mb-8">
          {/* Reset */}
          <button
            onClick={pomo.reset}
            className="w-12 h-12 rounded-full flex items-center justify-center transition-all hover:scale-110 active:scale-95"
            style={{ background: theme.surface, backdropFilter: 'blur(10px)' }}
            title="Reset"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={theme.text} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
              <path d="M3 3v5h5" />
            </svg>
          </button>

          {/* Play/Pause - main button */}
          <button
            onClick={pomo.start}
            className="w-20 h-20 rounded-full flex items-center justify-center transition-all hover:scale-105 active:scale-95 shadow-lg"
            style={{
              background: theme.accent,
              boxShadow: `0 10px 30px ${theme.accent}50`,
            }}
            title={pomo.timerState === 'running' ? 'Pause' : 'Start'}
          >
            {pomo.timerState === 'running' ? (
              <svg width="28" height="28" viewBox="0 0 24 24" fill="white">
                <rect x="6" y="4" width="4" height="16" rx="1" />
                <rect x="14" y="4" width="4" height="16" rx="1" />
              </svg>
            ) : (
              <svg width="28" height="28" viewBox="0 0 24 24" fill="white">
                <polygon points="6,3 20,12 6,21" />
              </svg>
            )}
          </button>

          {/* Skip */}
          <button
            onClick={pomo.skip}
            className="w-12 h-12 rounded-full flex items-center justify-center transition-all hover:scale-110 active:scale-95"
            style={{ background: theme.surface, backdropFilter: 'blur(10px)' }}
            title="Skip"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={theme.text} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polygon points="5,4 15,12 5,20" fill={theme.text} />
              <line x1="19" y1="5" x2="19" y2="19" />
            </svg>
          </button>
        </div>

        {/* Session progress dots */}
        <div className="flex items-center gap-2">
          {Array.from({ length: pomo.settings.longBreakInterval }).map((_, i) => {
            const completed = i < (pomo.sessionsCompleted % pomo.settings.longBreakInterval);
            const isCurrent = i === (pomo.sessionsCompleted % pomo.settings.longBreakInterval);
            return (
              <div
                key={i}
                className="rounded-full transition-all duration-500"
                style={{
                  width: isCurrent ? '24px' : '8px',
                  height: '8px',
                  background: completed ? theme.accent : isCurrent ? `${theme.accent}60` : `${theme.text}20`,
                }}
              />
            );
          })}
        </div>

        {/* Quick stats */}
        <div className="mt-8 flex items-center gap-6 text-sm" style={{ color: theme.text }}>
          <div className="flex items-center gap-2 opacity-70">
            <span className="font-semibold">{pomo.todayStat.sessions}</span>
            <span>sessions today</span>
          </div>
          <div className="w-px h-4" style={{ background: `${theme.text}30` }} />
          <div className="flex items-center gap-2 opacity-70">
            <span className="font-semibold">{pomo.currentStreak}</span>
            <span>day streak 🔥</span>
          </div>
        </div>
      </main>

      {/* Tasks panel - slides up from bottom */}
      {showTasks && (
        <div
          className="fixed bottom-0 left-0 right-0 max-w-md mx-auto rounded-t-3xl p-6 shadow-2xl animate-slide-up"
          style={{
            background: theme.surface,
            backdropFilter: 'blur(20px)',
            maxHeight: '60vh',
          }}
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-lg" style={{ color: theme.text }}>Tasks</h3>
            <button onClick={() => setShowTasks(false)} className="w-8 h-8 rounded-full flex items-center justify-center" style={{ background: `${theme.text}10` }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={theme.text} strokeWidth="2.5" strokeLinecap="round">
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          </div>

          <div className="flex gap-2 mb-4">
            <input
              type="text"
              value={taskInput}
              onChange={e => setTaskInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleAddTask()}
              placeholder="What are you working on?"
              className="flex-1 px-4 py-2.5 rounded-full text-sm outline-none"
              style={{ background: 'rgba(255,255,255,0.8)', color: theme.text }}
            />
            <button
              onClick={handleAddTask}
              className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold"
              style={{ background: theme.accent }}
            >
              +
            </button>
          </div>

          <div className="space-y-2 overflow-y-auto max-h-80">
            {pomo.tasks.length === 0 && (
              <p className="text-center py-8 text-sm opacity-50" style={{ color: theme.text }}>
                No tasks yet. Add one above.
              </p>
            )}
            {pomo.tasks.map(task => (
              <div
                key={task.id}
                className="flex items-center gap-3 p-3 rounded-2xl transition-all"
                style={{ background: 'rgba(255,255,255,0.6)' }}
              >
                <button
                  onClick={() => pomo.toggleTask(task.id)}
                  className="w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-all"
                  style={{
                    borderColor: task.done ? theme.accent : `${theme.text}40`,
                    background: task.done ? theme.accent : 'transparent',
                  }}
                >
                  {task.done && (
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                  )}
                </button>
                <span
                  className="flex-1 text-sm"
                  style={{
                    color: theme.text,
                    opacity: task.done ? 0.5 : 1,
                    textDecoration: task.done ? 'line-through' : 'none',
                  }}
                >
                  {task.name}
                </span>
                <button
                  onClick={() => pomo.deleteTask(task.id)}
                  className="opacity-40 hover:opacity-100 transition-opacity"
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={theme.text} strokeWidth="2" strokeLinecap="round">
                    <line x1="18" y1="6" x2="6" y2="18" />
                    <line x1="6" y1="6" x2="18" y2="18" />
                  </svg>
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Stats panel */}
      {showStats && (
        <div
          className="fixed bottom-0 left-0 right-0 max-w-md mx-auto rounded-t-3xl p-6 shadow-2xl animate-slide-up"
          style={{
            background: theme.surface,
            backdropFilter: 'blur(20px)',
            maxHeight: '60vh',
          }}
        >
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-semibold text-lg" style={{ color: theme.text }}>Statistics</h3>
            <button onClick={() => setShowStats(false)} className="w-8 h-8 rounded-full flex items-center justify-center" style={{ background: `${theme.text}10` }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={theme.text} strokeWidth="2.5" strokeLinecap="round">
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          </div>

          {/* Stats grid */}
          <div className="grid grid-cols-2 gap-3 mb-6">
            <div className="p-4 rounded-2xl" style={{ background: 'rgba(255,255,255,0.6)' }}>
              <div className="text-3xl font-bold" style={{ color: theme.accent }}>{pomo.todayStat.sessions}</div>
              <div className="text-xs opacity-60 mt-1" style={{ color: theme.text }}>Sessions today</div>
            </div>
            <div className="p-4 rounded-2xl" style={{ background: 'rgba(255,255,255,0.6)' }}>
              <div className="text-3xl font-bold" style={{ color: theme.accent }}>{pomo.todayStat.focusMinutes}</div>
              <div className="text-xs opacity-60 mt-1" style={{ color: theme.text }}>Minutes focused</div>
            </div>
            <div className="p-4 rounded-2xl" style={{ background: 'rgba(255,255,255,0.6)' }}>
              <div className="text-3xl font-bold" style={{ color: theme.accent }}>{pomo.sessionsCompleted}</div>
              <div className="text-xs opacity-60 mt-1" style={{ color: theme.text }}>Total sessions</div>
            </div>
            <div className="p-4 rounded-2xl" style={{ background: 'rgba(255,255,255,0.6)' }}>
              <div className="text-3xl font-bold" style={{ color: theme.accent }}>{pomo.currentStreak}</div>
              <div className="text-xs opacity-60 mt-1" style={{ color: theme.text }}>Day streak 🔥</div>
            </div>
          </div>

          {/* 7-day chart */}
          <div className="mb-4">
            <div className="text-xs font-semibold uppercase tracking-wider mb-3 opacity-60" style={{ color: theme.text }}>Last 7 days</div>
            <div className="flex items-end gap-2 h-24">
              {Array.from({ length: 7 }).map((_, i) => {
                const d = new Date();
                d.setDate(d.getDate() - (6 - i));
                const key = d.toISOString().split('T')[0];
                const stat = pomo.dailyStats.find(s => s.date === key);
                const sessions = stat?.sessions || 0;
                const maxSessions = Math.max(pomo.settings.dailyGoal, ...pomo.dailyStats.map(s => s.sessions), 1);
                const height = Math.max(4, (sessions / maxSessions) * 100);
                return (
                  <div key={key} className="flex-1 flex flex-col items-center gap-1">
                    <div
                      className="w-full rounded-t-md transition-all"
                      style={{
                        height: `${height}%`,
                        background: sessions >= pomo.settings.dailyGoal ? theme.accent : `${theme.accent}60`,
                      }}
                    />
                    <div className="text-[10px] opacity-50" style={{ color: theme.text }}>
                      {d.toLocaleDateString('en', { weekday: 'short' }).slice(0, 2)}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Goal progress */}
          <div className="p-4 rounded-2xl" style={{ background: 'rgba(255,255,255,0.6)' }}>
            <div className="flex justify-between text-xs mb-2" style={{ color: theme.text }}>
              <span className="opacity-60">Daily goal</span>
              <span className="font-semibold">{pomo.todayStat.sessions} / {pomo.settings.dailyGoal}</span>
            </div>
            <div className="h-2 rounded-full overflow-hidden" style={{ background: `${theme.text}15` }}>
              <div
                className="h-full rounded-full transition-all duration-500"
                style={{
                  width: `${Math.min(100, (pomo.todayStat.sessions / pomo.settings.dailyGoal) * 100)}%`,
                  background: theme.accent,
                }}
              />
            </div>
          </div>
        </div>
      )}

      {/* Backdrop for panels */}
      {(showTasks || showStats) && (
        <div
          className="fixed inset-0 bg-black/20 backdrop-blur-sm z-0 animate-fade-in"
          onClick={() => { setShowTasks(false); setShowStats(false); }}
        />
      )}
    </div>
  );
}
