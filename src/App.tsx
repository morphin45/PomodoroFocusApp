import { useState, useEffect } from 'react';
import { usePomodoro, ACTIVITIES } from './hooks/usePomodoro';
import PhysicalTomato from './components/PhysicalTomato';
import type { TimerMode } from './hooks/usePomodoro';

type Tab = 'timer' | 'tasks' | 'stats' | 'device';

function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

export default function App() {
  const pomo = usePomodoro();
  const [activeTab, setActiveTab] = useState<Tab>('timer');
  const [activityInput, setActivityInput] = useState('');
  const [newTaskName, setNewTaskName] = useState('');
  const [newTaskEstimate, setNewTaskEstimate] = useState(1);
  const [showActivityPicker, setShowActivityPicker] = useState(false);
  const [vibrating, setVibrating] = useState(false);

  // Update document title with timer
  useEffect(() => {
    const modeLabel = pomo.mode === 'focus' ? '🍅 Focus' : pomo.mode === 'shortBreak' ? '☕ Break' : '🌊 Long Break';
    document.title = pomo.timerState === 'running'
      ? `${formatTime(pomo.timeLeft)} — ${modeLabel}`
      : 'PomoDevice — Physical Pomodoro Companion';
  }, [pomo.timeLeft, pomo.timerState, pomo.mode]);

  // Vibrate on session complete
  useEffect(() => {
    if (pomo.timerState === 'idle' && pomo.timeLeft === 0) {
      setVibrating(true);
      const t = setTimeout(() => setVibrating(false), 700);
      return () => clearTimeout(t);
    }
  }, [pomo.timerState, pomo.timeLeft]);

  const modeColor = pomo.mode === 'focus' ? '#ef4444' : pomo.mode === 'shortBreak' ? '#22c55e' : '#3b82f6';
  const modeLabel = pomo.mode === 'focus' ? 'Focus' : pomo.mode === 'shortBreak' ? 'Short Break' : 'Long Break';

  const handleStart = () => {
    pomo.start();
  };

  const handleTomatoClick = () => {
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
    <div className="app-shell">
      {/* Background gradient */}
      <div className="bg-gradient" style={{
        background: pomo.mode === 'focus'
          ? 'radial-gradient(circle at top left, #fed7aa, transparent 35%), #fff7ed'
          : pomo.mode === 'shortBreak'
          ? 'radial-gradient(circle at top left, #bbf7d0, transparent 35%), #f0fdf4'
          : 'radial-gradient(circle at top left, #bfdbfe, transparent 35%), #eff6ff'
      }} />

      <main className="app">
        {/* Left panel */}
        <section className="left-panel">
          <div className="logo">
            <span style={{ color: modeColor }}>●</span> Focus device
          </div>

          <h1>Work with<br />intention.</h1>

          <p className="description">
            Focus on one meaningful activity at a time. The physical-style
            tomato dial shows your progress as the timer moves.
          </p>

          {/* Activity input */}
          <div className="activity-box">
            <label htmlFor="activity">What are you working on?</label>
            <input
              id="activity"
              type="text"
              placeholder="Example: Read chapter 3"
              value={activityInput}
              onChange={e => setActivityInput(e.target.value)}
            />
          </div>

          {/* Mode buttons */}
          <div className="mode-buttons">
            <button
              className={`mode-button ${pomo.mode === 'focus' ? 'active' : ''}`}
              style={pomo.mode === 'focus' ? { background: '#ef4444' } : {}}
              onClick={() => pomo.setMode('focus')}
            >
              Focus · {pomo.currentActivity.focusMinutes} min
            </button>
            <button
              className={`mode-button ${pomo.mode === 'shortBreak' ? 'active' : ''}`}
              style={pomo.mode === 'shortBreak' ? { background: '#22c55e' } : {}}
              onClick={() => pomo.setMode('shortBreak')}
            >
              Short break · {pomo.currentActivity.breakMinutes} min
            </button>
            <button
              className={`mode-button ${pomo.mode === 'longBreak' ? 'active' : ''}`}
              style={pomo.mode === 'longBreak' ? { background: '#3b82f6' } : {}}
              onClick={() => pomo.setMode('longBreak')}
            >
              Long break · {pomo.currentActivity.longBreakMinutes} min
            </button>
          </div>

          {/* Activity selector */}
          <button
            className="activity-selector"
            onClick={() => setShowActivityPicker(!showActivityPicker)}
          >
            <span>{pomo.currentActivity.icon} {pomo.currentActivity.name}</span>
            <span className="chevron">{showActivityPicker ? '▲' : '▼'}</span>
          </button>

          {showActivityPicker && (
            <div className="activity-picker">
              {ACTIVITIES.map(a => (
                <button
                  key={a.id}
                  className={`activity-option ${pomo.currentActivity.id === a.id ? 'selected' : ''}`}
                  onClick={() => {
                    pomo.setActivity(a);
                    setShowActivityPicker(false);
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

          {/* Timer display */}
          <div className="timer" style={{ color: modeColor }}>
            {formatTime(pomo.timeLeft)}
          </div>

          {/* Control buttons */}
          <div className="control-buttons">
            <button
              className="control-button start-button"
              style={{ background: modeColor, boxShadow: `0 8px 20px ${modeColor}40` }}
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
            <div className="stat">
              <strong>{pomo.todayStat.sessions}</strong>
              <span>Sessions today</span>
            </div>
            <div className="stat">
              <strong>{pomo.sessionsCompleted}</strong>
              <span>Total sessions</span>
            </div>
            <div className="stat">
              <strong>{pomo.currentStreak}🔥</strong>
              <span>Day streak</span>
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

          {/* Break activity suggestion */}
          {pomo.mode !== 'focus' && pomo.timerState !== 'running' && (
            <div className="break-suggestion">
              💡 Suggested break: <strong>{pomo.breakActivity}</strong>
            </div>
          )}
        </section>

        {/* Right panel - Physical device */}
        <section className="right-panel">
          <PhysicalTomato
            mode={pomo.mode}
            timerState={pomo.timerState}
            progress={pomo.progress}
            servoAngle={pomo.servoAngle}
            isVibrating={vibrating}
            onClick={handleTomatoClick}
          />

          {/* Tabs */}
          <div className="panel-tabs">
            <button className={`tab ${activeTab === 'timer' ? 'active' : ''}`} onClick={() => setActiveTab('timer')}>
              Timer
            </button>
            <button className={`tab ${activeTab === 'tasks' ? 'active' : ''}`} onClick={() => setActiveTab('tasks')}>
              Tasks
            </button>
            <button className={`tab ${activeTab === 'stats' ? 'active' : ''}`} onClick={() => setActiveTab('stats')}>
              Stats
            </button>
            <button className={`tab ${activeTab === 'device' ? 'active' : ''}`} onClick={() => setActiveTab('device')}>
              Device
            </button>
          </div>

          {/* Tab content */}
          <div className="tab-content">
            {activeTab === 'timer' && (
              <div className="timer-info">
                <div className="info-row">
                  <span className="info-label">Mode</span>
                  <span className="info-value" style={{ color: modeColor }}>{modeLabel}</span>
                </div>
                <div className="info-row">
                  <span className="info-label">Servo angle</span>
                  <span className="info-value">{Math.round(pomo.servoAngle)}°</span>
                </div>
                <div className="info-row">
                  <span className="info-label">Progress</span>
                  <span className="info-value">{Math.round(pomo.progress * 100)}%</span>
                </div>
                <div className="info-row">
                  <span className="info-label">Next long break</span>
                  <span className="info-value">
                    in {pomo.settings.longBreakInterval - (pomo.sessionsCompleted % pomo.settings.longBreakInterval)} sessions
                  </span>
                </div>
                <div className="session-dots">
                  {Array.from({ length: pomo.settings.longBreakInterval }).map((_, i) => (
                    <div
                      key={i}
                      className="session-dot"
                      style={{
                        background: i < (pomo.sessionsCompleted % pomo.settings.longBreakInterval)
                          ? modeColor
                          : '#e7e5e4'
                      }}
                    />
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'tasks' && (
              <div className="tasks-panel">
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
                    <div className="empty-state">
                      No tasks yet. Add one to get started!
                    </div>
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

            {activeTab === 'stats' && (
              <div className="stats-panel">
                <div className="stats-grid">
                  <div className="stat-card">
                    <div className="stat-card-value">{pomo.todayStat.sessions}</div>
                    <div className="stat-card-label">Today</div>
                  </div>
                  <div className="stat-card">
                    <div className="stat-card-value">{pomo.todayStat.focusMinutes}</div>
                    <div className="stat-card-label">Minutes focused</div>
                  </div>
                  <div className="stat-card">
                    <div className="stat-card-value">{pomo.currentStreak}</div>
                    <div className="stat-card-label">Day streak</div>
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

            {activeTab === 'device' && (
              <div className="device-panel">
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
          </div>
        </section>
      </main>
    </div>
  );
}
