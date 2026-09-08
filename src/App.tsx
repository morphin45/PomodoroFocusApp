import { useState, useEffect, useRef } from 'react';
import { usePomodoro, ACTIVITIES } from './hooks/usePomodoro';
import TomatoScene from './components/TomatoScene';
import type { TimerMode } from './hooks/usePomodoro';

// Physical ticking sound effect
function useTickSound(isRunning: boolean) {
  const audioCtxRef = useRef<AudioContext | null>(null);
  const intervalRef = useRef<number | null>(null);

  useEffect(() => {
    if (isRunning) {
      if (!audioCtxRef.current) {
        audioCtxRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      }
      const ctx = audioCtxRef.current;

      const playTick = () => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.frequency.value = 800 + Math.random() * 100;
        osc.type = 'sine';
        gain.gain.setValueAtTime(0.02, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.05);
        osc.start();
        osc.stop(ctx.currentTime + 0.05);
      };

      intervalRef.current = window.setInterval(playTick, 1000);
      return () => {
        if (intervalRef.current) clearInterval(intervalRef.current);
      };
    } else {
      if (intervalRef.current) clearInterval(intervalRef.current);
    }
  }, [isRunning]);
}

// Bell ring sound when timer completes
function playBellSound() {
  const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
  
  // Play three bell strikes
  [0, 0.3, 0.6].forEach((delay) => {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.frequency.value = 1200;
    osc.type = 'sine';
    gain.gain.setValueAtTime(0, ctx.currentTime + delay);
    gain.gain.linearRampToValueAtTime(0.15, ctx.currentTime + delay + 0.01);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + delay + 0.4);
    osc.start(ctx.currentTime + delay);
    osc.stop(ctx.currentTime + delay + 0.4);
  });
}

function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

export default function App() {
  const pomo = usePomodoro();
  const [activityInput, setActivityInput] = useState('');
  const [showActivities, setShowActivities] = useState(false);
  const [activePanel, setActivePanel] = useState<'none' | 'tasks' | 'stats' | 'device'>('none');
  const [newTaskName, setNewTaskName] = useState('');
  const [newTaskEstimate, setNewTaskEstimate] = useState(1);
  const [isWinding, setIsWinding] = useState(false);
  const prevTimerState = useRef(pomo.timerState);

  // Update document title
  useEffect(() => {
    const modeLabel = pomo.mode === 'focus' ? '🍅 Focus' : pomo.mode === 'shortBreak' ? '☕ Break' : '🌊 Long Break';
    document.title = pomo.timerState === 'running'
      ? `${formatTime(pomo.timeLeft)} — ${modeLabel}`
      : '3D Pomodoro — Focus Timer';
  }, [pomo.timeLeft, pomo.timerState, pomo.mode]);

  const modeColor = pomo.mode === 'focus' ? '#ef4444' : pomo.mode === 'shortBreak' ? '#22c55e' : '#3b82f6';
  const modeLabel = pomo.mode === 'focus' ? 'Focus' : pomo.mode === 'shortBreak' ? 'Short Break' : 'Long Break';

  // Physical ticking sound when running
  useTickSound(pomo.timerState === 'running');

  // Trigger winding animation when timer starts
  useEffect(() => {
    if (pomo.timerState === 'running' && prevTimerState.current !== 'running') {
      setIsWinding(true);
      const timeout = setTimeout(() => setIsWinding(false), 600);
      // Play bell sound when session completes (transitioning from running to idle)
    } else if (pomo.timerState === 'idle' && prevTimerState.current === 'running') {
      playBellSound();
    }
    prevTimerState.current = pomo.timerState;
  }, [pomo.timerState]);

  const handleStart = () => {
    // Physical click sound
    const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.frequency.value = 400;
    osc.type = 'square';
    gain.gain.setValueAtTime(0.05, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.05);
    osc.start();
    osc.stop(ctx.currentTime + 0.05);
    
    pomo.start();
  };

  const handleAddTask = () => {
    if (newTaskName.trim()) {
      pomo.addTask(newTaskName.trim(), newTaskEstimate);
      setNewTaskName('');
      setNewTaskEstimate(1);
    }
  };

  return (
    <div className="app-container">
      {/* Sidebar */}
      <aside className="sidebar">
        <div className="brand">3D Focus Timer</div>

        <h1>Focus with<br />intention.</h1>

        <p className="subtitle">
          A visual Pomodoro timer with a 3D tomato that shows your progress.
        </p>

        {/* Activity input */}
        <label className="field-label" htmlFor="activity">Current activity</label>
        <input
          id="activity"
          className="activity-input"
          type="text"
          placeholder="Example: Study JavaScript"
          value={activityInput}
          onChange={e => setActivityInput(e.target.value)}
        />

        {/* Activity preset selector */}
        <button
          className="activity-preset-btn"
          onClick={() => setShowActivities(!showActivities)}
        >
          <span>{pomo.currentActivity.icon} {pomo.currentActivity.name}</span>
          <span className="chevron">{showActivities ? '▲' : '▼'}</span>
        </button>

        {showActivities && (
          <div className="activity-picker">
            {ACTIVITIES.map(a => (
              <button
                key={a.id}
                className={`activity-option ${pomo.currentActivity.id === a.id ? 'selected' : ''}`}
                onClick={() => {
                  pomo.setActivity(a);
                  setShowActivities(false);
                }}
              >
                <span className="activity-icon">{a.icon}</span>
                <div className="activity-info">
                  <div className="activity-name">{a.name}</div>
                  <div className="activity-desc">{a.description}</div>
                </div>
                <div className="activity-time">{a.focusMinutes}/{a.breakMinutes}</div>
              </button>
            ))}
          </div>
        )}

        {/* Mode buttons */}
        <div className="mode-buttons">
          <button
            className={`mode-button ${pomo.mode === 'focus' ? 'active' : ''}`}
            style={pomo.mode === 'focus' ? { background: modeColor } : {}}
            onClick={() => pomo.setMode('focus')}
          >
            Focus · {pomo.currentActivity.focusMinutes} minutes
          </button>
          <button
            className={`mode-button ${pomo.mode === 'shortBreak' ? 'active' : ''}`}
            style={pomo.mode === 'shortBreak' ? { background: modeColor } : {}}
            onClick={() => pomo.setMode('shortBreak')}
          >
            Short break · {pomo.currentActivity.breakMinutes} minutes
          </button>
          <button
            className={`mode-button ${pomo.mode === 'longBreak' ? 'active' : ''}`}
            style={pomo.mode === 'longBreak' ? { background: modeColor } : {}}
            onClick={() => pomo.setMode('longBreak')}
          >
            Long break · {pomo.currentActivity.longBreakMinutes} minutes
          </button>
        </div>

        {/* Timer display */}
        <div className={`timer ${pomo.timerState === 'running' ? 'running' : ''}`} style={{ color: modeColor }}>
          {formatTime(pomo.timeLeft)}
        </div>

        {/* Controls */}
        <div className="controls">
          <button
            className="control-button start-button"
            style={{ background: modeColor, boxShadow: `0 7px 18px ${modeColor}40` }}
            onClick={handleStart}
          >
            {pomo.timerState === 'running' ? 'Pause' : pomo.timerState === 'paused' ? 'Resume' : `Start ${modeLabel.toLowerCase()}`}
          </button>
          <button className="control-button reset-button" onClick={pomo.reset}>
            Reset
          </button>
          {pomo.timerState !== 'idle' && (
            <button className="control-button skip-button" onClick={pomo.skip}>
              Skip
            </button>
          )}
        </div>

        {/* Interruption tracker */}
        {pomo.timerState === 'running' && pomo.mode === 'focus' && (
          <button className="interruption-btn" onClick={pomo.logInterruption}>
            ⚡ Log interruption ({pomo.interruptions})
          </button>
        )}

        {/* Stats */}
        <div className="stats">
          <div>
            <span className="stat-number">{pomo.todayStat.sessions}</span>
            <span className="stat-label">Sessions today</span>
          </div>
          <div>
            <span className="stat-number">{pomo.sessionsCompleted}</span>
            <span className="stat-label">Total sessions</span>
          </div>
          <div>
            <span className="stat-number">{pomo.currentStreak}🔥</span>
            <span className="stat-label">Day streak</span>
          </div>
        </div>

        {/* Daily goal progress */}
        <div className="daily-goal">
          <div className="daily-goal-header">
            <span>Daily goal</span>
            <span>{pomo.todayStat.sessions}/{pomo.settings.dailyGoal}</span>
          </div>
          <div className="daily-goal-bar">
            <div
              className="daily-goal-fill"
              style={{
                width: `${Math.min(100, (pomo.todayStat.sessions / pomo.settings.dailyGoal) * 100)}%`,
                background: modeColor,
              }}
            />
          </div>
        </div>

        {/* Break suggestion */}
        {pomo.mode !== 'focus' && pomo.timerState !== 'running' && (
          <div className="break-suggestion">
            💡 Suggested break: <strong>{pomo.breakActivity}</strong>
          </div>
        )}

        {/* Panel tabs */}
        <div className="panel-tabs">
          <button
            className={`panel-tab ${activePanel === 'tasks' ? 'active' : ''}`}
            onClick={() => setActivePanel(activePanel === 'tasks' ? 'none' : 'tasks')}
          >
            📋 Tasks
          </button>
          <button
            className={`panel-tab ${activePanel === 'stats' ? 'active' : ''}`}
            onClick={() => setActivePanel(activePanel === 'stats' ? 'none' : 'stats')}
          >
            📊 Stats
          </button>
          <button
            className={`panel-tab ${activePanel === 'device' ? 'active' : ''}`}
            onClick={() => setActivePanel(activePanel === 'device' ? 'none' : 'device')}
          >
            🔧 Device
          </button>
        </div>

        {/* Tasks panel */}
        {activePanel === 'tasks' && (
          <div className="panel-content">
            <div className="task-input-row">
              <input
                type="text"
                placeholder="Add a task..."
                value={newTaskName}
                onChange={e => setNewTaskName(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleAddTask()}
                className="task-input"
              />
              <select
                value={newTaskEstimate}
                onChange={e => setNewTaskEstimate(Number(e.target.value))}
                className="task-estimate"
              >
                {[1, 2, 3, 4, 5, 6, 7, 8].map(n => (
                  <option key={n} value={n}>{n}🍅</option>
                ))}
              </select>
              <button className="task-add-btn" onClick={handleAddTask}>+</button>
            </div>

            <div className="task-list">
              {pomo.tasks.length === 0 && (
                <div className="empty-state">No tasks yet</div>
              )}
              {pomo.tasks.map(task => (
                <div key={task.id} className={`task-item ${task.done ? 'done' : ''}`}>
                  <button
                    className="task-check"
                    onClick={() => pomo.toggleTask(task.id)}
                  >
                    {task.done ? '✓' : ''}
                  </button>
                  <div className="task-info">
                    <div className="task-name">{task.name}</div>
                    <div className="task-progress">
                      {task.completedPomodoros}/{task.estimatedPomodoros} 🍅
                    </div>
                  </div>
                  <button
                    className="task-delete"
                    onClick={() => pomo.deleteTask(task.id)}
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>

            {pomo.tasks.length > 0 && (
              <div className="tasks-summary">
                Total: {pomo.tasks.reduce((sum, t) => sum + t.estimatedPomodoros, 0)} 🍅 estimated ·{' '}
                {pomo.tasks.reduce((sum, t) => sum + t.completedPomodoros, 0)} 🍅 completed
              </div>
            )}
          </div>
        )}

        {/* Stats panel */}
        {activePanel === 'stats' && (
          <div className="panel-content">
            <div className="stats-grid">
              <div className="stat-card">
                <div className="stat-card-value">{pomo.todayStat.focusMinutes}</div>
                <div className="stat-card-label">Minutes focused</div>
              </div>
              <div className="stat-card">
                <div className="stat-card-value">{pomo.todayStat.interruptions}</div>
                <div className="stat-card-label">Interruptions</div>
              </div>
            </div>

            {/* 7-day chart */}
            <div className="chart-section">
              <h3>Last 7 days</h3>
              <div className="chart">
                {Array.from({ length: 7 }).map((_, i) => {
                  const d = new Date();
                  d.setDate(d.getDate() - (6 - i));
                  const key = d.toISOString().split('T')[0];
                  const stat = pomo.dailyStats.find(s => s.date === key);
                  const sessions = stat?.sessions || 0;
                  const maxSessions = Math.max(pomo.settings.dailyGoal, ...pomo.dailyStats.map(s => s.sessions), 1);
                  const height = (sessions / maxSessions) * 100;
                  return (
                    <div key={key} className="chart-bar-container">
                      <div
                        className="chart-bar"
                        style={{
                          height: `${height}%`,
                          background: sessions >= pomo.settings.dailyGoal ? '#22c55e' : modeColor,
                        }}
                      />
                      <div className="chart-label">
                        {d.toLocaleDateString('en', { weekday: 'short' }).slice(0, 2)}
                      </div>
                      <div className="chart-value">{sessions}</div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Recent sessions */}
            <div className="recent-sessions">
              <h3>Recent sessions</h3>
              {pomo.sessionHistory.length === 0 && (
                <div className="empty-state">No sessions yet</div>
              )}
              {pomo.sessionHistory.slice(0, 5).map(s => (
                <div key={s.id} className="session-row">
                  <span className="session-mode" style={{
                    color: s.mode === 'focus' ? '#ef4444' : s.mode === 'shortBreak' ? '#22c55e' : '#3b82f6'
                  }}>
                    {s.mode === 'focus' ? '🍅' : s.mode === 'shortBreak' ? '☕' : '🌊'}
                  </span>
                  <span className="session-activity">{s.activity}</span>
                  <span className="session-time">
                    {Math.round(s.duration / 60)} min
                    {s.interruptions > 0 && <span className="session-interruptions"> · {s.interruptions}⚡</span>}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Device panel */}
        {activePanel === 'device' && (
          <div className="panel-content">
            <div className="device-status">
              <div className="device-indicator connected">
                <span className="dot" />
                <span>ESP32 Simulator — Connected</span>
              </div>
              <div className="device-details">
                <div className="detail-row">
                  <span>Firmware</span>
                  <span>v1.2.0</span>
                </div>
                <div className="detail-row">
                  <span>Servo position</span>
                  <span>{Math.round(pomo.servoAngle)}°</span>
                </div>
                <div className="detail-row">
                  <span>LED state</span>
                  <span style={{ color: modeColor }}>● {modeLabel}</span>
                </div>
                <div className="detail-row">
                  <span>Battery</span>
                  <span>87%</span>
                </div>
                <div className="detail-row">
                  <span>Signal</span>
                  <span>Strong</span>
                </div>
              </div>
            </div>

            <div className="device-commands">
              <h3>Commands sent</h3>
              <div className="command-log">
                <div className="command">
                  <span className="cmd-time">now</span>
                  <span className="cmd-text">SYNC_STATE → servo:{Math.round(pomo.servoAngle)}° led:{modeColor}</span>
                </div>
                <div className="command">
                  <span className="cmd-time">-1s</span>
                  <span className="cmd-text">SET_MODE → {pomo.mode}</span>
                </div>
                {pomo.timerState === 'running' && (
                  <div className="command">
                    <span className="cmd-time">-2s</span>
                    <span className="cmd-text">START_TIMER → {Math.round(pomo.totalTime / 60)}min</span>
                  </div>
                )}
              </div>
            </div>

            <div className="device-info">
              <h3>About the physical device</h3>
              <p>
                This app simulates a physical ESP32-based pomodoro device.
                In a real implementation, the servo would physically rotate
                the dial as the timer progresses, and LEDs would indicate
                the current mode.
              </p>
              <div className="hardware-list">
                <div className="hw-item">🔧 ESP32 microcontroller</div>
                <div className="hw-item">⚙️ SG90 servo motor</div>
                <div className="hw-item">💡 RGB LED ring</div>
                <div className="hw-item">🔔 Buzzer / vibration</div>
                <div className="hw-item">🔘 Push button</div>
              </div>
            </div>
          </div>
        )}
      </aside>

      {/* 3D Scene */}
      <section className="scene-container">
        <div className="scene-title">Interactive 3D Pomodoro</div>
        <div className={`scene-wrapper ${isWinding ? 'winding' : ''}`}>
          <TomatoScene
            mode={pomo.mode}
            timerState={pomo.timerState}
            progress={pomo.progress}
            onClick={handleStart}
          />
        </div>
        <div className="scene-help">
          {pomo.timerState === 'running' ? '🔊 Tick... tick... tick...' : 'Drag to rotate · Scroll to zoom · Click tomato to start'}
        </div>

        {/* Session dots overlay */}
        <div className="session-dots-overlay">
          {Array.from({ length: pomo.settings.longBreakInterval }).map((_, i) => (
            <div
              key={i}
              className="session-dot"
              style={{
                background: i < (pomo.sessionsCompleted % pomo.settings.longBreakInterval)
                  ? modeColor
                  : 'rgba(255, 255, 255, 0.3)',
              }}
            />
          ))}
          <span className="session-dots-label">
            {pomo.sessionsCompleted % pomo.settings.longBreakInterval}/{pomo.settings.longBreakInterval} to long break
          </span>
        </div>
      </section>
    </div>
  );
}
