import { useState, useEffect } from 'react';
import { usePomodoro, getRandomBreakActivity } from './hooks/usePomodoro';
import PomodoroScene from './components/PomodoroScene';

function App() {
  const {
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
  } = usePomodoro();

  const [showSettings, setShowSettings] = useState(false);
  const [showTasks, setShowTasks] = useState(false);
  const [showInterruptions, setShowInterruptions] = useState(false);
  const [showDailyPlan, setShowDailyPlan] = useState(false);
  const [showReflection, setShowReflection] = useState(false);
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskEstimate, setNewTaskEstimate] = useState(1);
  const [interruptionNote, setInterruptionNote] = useState('');
  const [interruptionType, setInterruptionType] = useState<'internal' | 'external'>('internal');
  const [activeTab, setActiveTab] = useState<'timer' | 'tasks' | 'stats'>('timer');

  // Update page title with timer
  useEffect(() => {
    const minutes = Math.floor(timeLeft / 60);
    const seconds = timeLeft % 60;
    const timeStr = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    const modeLabel = mode === 'focus' ? '🍅' : mode === 'shortBreak' ? '☕' : '🌿';
    document.title = `${timeStr} ${modeLabel} Pomodoro Focus`;
  }, [timeLeft, mode]);

  const handleAddTask = () => {
    if (newTaskTitle.trim()) {
      addTask(newTaskTitle, newTaskEstimate);
      setNewTaskTitle('');
      setNewTaskEstimate(1);
    }
  };

  const handleLogInterruption = () => {
    if (interruptionNote.trim()) {
      logInterruption(interruptionType, interruptionNote);
      setInterruptionNote('');
    }
  };

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const modeColors = {
    focus: { bg: 'from-red-950/40 to-orange-950/40', accent: 'text-red-400', border: 'border-red-500/30', btn: 'bg-red-600 hover:bg-red-700' },
    shortBreak: { bg: 'from-green-950/40 to-emerald-950/40', accent: 'text-green-400', border: 'border-green-500/30', btn: 'bg-green-600 hover:bg-green-700' },
    longBreak: { bg: 'from-blue-950/40 to-indigo-950/40', accent: 'text-blue-400', border: 'border-blue-500/30', btn: 'bg-blue-600 hover:bg-blue-700' },
  };
  const colors = modeColors[mode];

  return (
    <div className={`min-h-screen bg-gradient-to-br ${colors.bg} from-gray-950 to-gray-900 text-white overflow-hidden relative`}>
      {/* 3D Scene Background */}
      <div className="absolute inset-0 z-0">
        <PomodoroScene
          mode={mode}
          timeLeft={timeLeft}
          totalTime={totalTime}
          isRunning={isRunning}
          sessionsCompleted={sessionsCompleted}
          longBreakInterval={settings.longBreakInterval}
          dailyProgress={todayProgress}
          interruptions={interruptions.length}
        />
      </div>

      {/* UI Overlay */}
      <div className="relative z-10 min-h-screen flex flex-col">
        {/* Header */}
        <header className="p-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-2xl">🍅</span>
            <h1 className="text-lg font-bold tracking-tight">Pomodoro Focus</h1>
          </div>
          <div className="flex items-center gap-2">
            {stats.currentStreak > 0 && (
              <div className="flex items-center gap-1 px-2 py-1 rounded-full bg-orange-500/20 border border-orange-500/30 text-xs">
                <span>🔥</span>
                <span className="text-orange-300">{stats.currentStreak} day streak</span>
              </div>
            )}
          </div>
        </header>

        {/* Main Content */}
        <div className="flex-1 flex flex-col items-center justify-center px-4 pb-4">
          {/* Timer Display */}
          <div className="text-center mb-4">
            <div className={`text-6xl md:text-7xl font-mono font-bold ${colors.accent} drop-shadow-lg`}>
              {formatTime(timeLeft)}
            </div>
            <div className="text-sm text-gray-400 mt-2 uppercase tracking-wider">
              {mode === 'focus' ? 'Focus Session' : mode === 'shortBreak' ? 'Short Break' : 'Long Break'}
            </div>
          </div>

          {/* Break Activity Suggestion */}
          {mode !== 'focus' && (
            <div className="mb-4 px-4 py-2 rounded-xl bg-white/5 border border-white/10 backdrop-blur-sm text-center max-w-xs">
              <p className="text-xs text-gray-400 mb-1">💡 Suggested break activity:</p>
              <p className="text-sm text-white">{breakActivity}</p>
            </div>
          )}

          {/* Controls */}
          <div className="flex items-center gap-3 mb-4">
            <button
              onClick={reset}
              className="w-12 h-12 rounded-full bg-white/10 hover:bg-white/20 border border-white/20 flex items-center justify-center transition-all"
              title="Reset"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
            </button>

            <button
              onClick={isRunning ? pause : start}
              className={`w-16 h-16 rounded-full ${colors.btn} flex items-center justify-center transition-all shadow-lg`}
            >
              {isRunning ? (
                <svg className="w-7 h-7" fill="currentColor" viewBox="0 0 24 24">
                  <rect x="6" y="4" width="4" height="16" />
                  <rect x="14" y="4" width="4" height="16" />
                </svg>
              ) : (
                <svg className="w-7 h-7 ml-1" fill="currentColor" viewBox="0 0 24 24">
                  <polygon points="5,3 19,12 5,21" />
                </svg>
              )}
            </button>

            <button
              onClick={skip}
              className="w-12 h-12 rounded-full bg-white/10 hover:bg-white/20 border border-white/20 flex items-center justify-center transition-all"
              title="Skip"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <polygon points="5,4 15,12 5,20" />
                <rect x="17" y="4" width="2" height="16" />
              </svg>
            </button>
          </div>

          {/* Mode Selector */}
          <div className="flex gap-2 mb-4">
            {(['focus', 'shortBreak', 'longBreak'] as const).map((m) => (
              <button
                key={m}
                onClick={() => switchMode(m)}
                className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                  mode === m
                    ? 'bg-white/20 border border-white/30 text-white'
                    : 'bg-white/5 border border-white/10 text-gray-400 hover:bg-white/10'
                }`}
              >
                {m === 'focus' ? '🍅 Focus' : m === 'shortBreak' ? '☕ Short' : '🌿 Long'}
              </button>
            ))}
          </div>

          {/* Daily Progress Bar */}
          <div className="w-full max-w-xs mb-4">
            <div className="flex justify-between text-xs text-gray-400 mb-1">
              <span>Daily Goal: {dailyPlan.completedPomodoros}/{dailyPlan.targetPomodoros} 🍅</span>
              {goalReached && <span className="text-green-400">✅ Goal reached!</span>}
            </div>
            <div className="h-2 bg-white/10 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-500 ${
                  goalReached ? 'bg-green-500' : 'bg-gradient-to-r from-red-500 to-orange-500'
                }`}
                style={{ width: `${Math.min(todayProgress * 100, 100)}%` }}
              />
            </div>
          </div>

          {/* Quick Action Tabs */}
          <div className="flex gap-1 mb-3 bg-white/5 rounded-xl p-1 backdrop-blur-sm">
            <button
              onClick={() => setActiveTab('timer')}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                activeTab === 'timer' ? 'bg-white/20 text-white' : 'text-gray-400 hover:text-white'
              }`}
            >
              ⏱ Timer
            </button>
            <button
              onClick={() => setActiveTab('tasks')}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                activeTab === 'tasks' ? 'bg-white/20 text-white' : 'text-gray-400 hover:text-white'
              }`}
            >
              📋 Tasks ({tasks.filter(t => !t.isCompleted).length})
            </button>
            <button
              onClick={() => setActiveTab('stats')}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                activeTab === 'stats' ? 'bg-white/20 text-white' : 'text-gray-400 hover:text-white'
              }`}
            >
              📊 Stats
            </button>
          </div>

          {/* Tab Content */}
          <div className="w-full max-w-sm">
            {activeTab === 'timer' && (
              <div className="space-y-2">
                {/* Session progress toward long break */}
                <div className="flex items-center justify-center gap-1.5 py-2">
                  {Array.from({ length: settings.longBreakInterval }).map((_, i) => (
                    <div
                      key={i}
                      className={`w-3 h-3 rounded-full transition-all ${
                        i < sessionsCompleted % settings.longBreakInterval
                          ? 'bg-red-500 shadow-sm shadow-red-500/50'
                          : 'bg-white/20'
                      }`}
                    />
                  ))}
                  <span className="text-xs text-gray-400 ml-2">
                    {sessionsCompleted % settings.longBreakInterval}/{settings.longBreakInterval} to long break
                  </span>
                </div>

                {/* Quick actions */}
                <div className="flex gap-2 justify-center">
                  <button
                    onClick={() => setShowDailyPlan(!showDailyPlan)}
                    className="px-3 py-2 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-xs transition-all"
                  >
                    📅 Plan Day
                  </button>
                  <button
                    onClick={() => setShowInterruptions(!showInterruptions)}
                    className="px-3 py-2 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-xs transition-all relative"
                  >
                    ⚡ Log Interruption
                    {interruptions.length > 0 && (
                      <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-red-500 text-[10px] flex items-center justify-center">
                        {interruptions.length}
                      </span>
                    )}
                  </button>
                  <button
                    onClick={() => setShowSettings(!showSettings)}
                    className="px-3 py-2 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-xs transition-all"
                  >
                    ⚙️ Settings
                  </button>
                </div>
              </div>
            )}

            {activeTab === 'tasks' && (
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {/* Add task form */}
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newTaskTitle}
                    onChange={(e) => setNewTaskTitle(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleAddTask()}
                    placeholder="Add a task..."
                    className="flex-1 px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-sm placeholder-gray-500 focus:outline-none focus:border-white/30"
                  />
                  <select
                    value={newTaskEstimate}
                    onChange={(e) => setNewTaskEstimate(Number(e.target.value))}
                    className="px-2 py-2 rounded-lg bg-white/5 border border-white/10 text-sm focus:outline-none"
                  >
                    {[1, 2, 3, 4, 5].map(n => (
                      <option key={n} value={n} className="bg-gray-900">{n}🍅</option>
                    ))}
                  </select>
                  <button
                    onClick={handleAddTask}
                    className="px-3 py-2 rounded-lg bg-white/10 hover:bg-white/20 border border-white/20 text-sm transition-all"
                  >
                    +
                  </button>
                </div>

                {/* Pomodoro rules reminder */}
                <div className="text-[10px] text-gray-500 text-center px-2">
                  💡 Tasks &gt;4🍅 should be broken down • Small tasks can be batched together
                </div>

                {/* Task list */}
                {tasks.map((task, index) => (
                  <div
                    key={task.id}
                    className={`flex items-center gap-2 p-2 rounded-lg border transition-all ${
                      task.isCompleted
                        ? 'bg-green-500/10 border-green-500/20'
                        : index === tasks.findIndex(t => !t.isCompleted)
                        ? 'bg-white/10 border-white/20'
                        : 'bg-white/5 border-white/10'
                    }`}
                  >
                    <button
                      onClick={() => updateTask(task.id, { isCompleted: !task.isCompleted })}
                      className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${
                        task.isCompleted
                          ? 'bg-green-500 border-green-500'
                          : 'border-gray-500 hover:border-white'
                      }`}
                    >
                      {task.isCompleted && (
                        <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                        </svg>
                      )}
                    </button>
                    <div className="flex-1 min-w-0">
                      <p className={`text-sm truncate ${task.isCompleted ? 'line-through text-gray-500' : ''}`}>
                        {task.title}
                      </p>
                      <div className="flex items-center gap-1 mt-0.5">
                        {Array.from({ length: task.estimatedPomodoros }).map((_, i) => (
                          <span key={i} className={`text-[10px] ${i < task.completedPomodoros ? 'text-red-400' : 'text-gray-600'}`}>
                            🍅
                          </span>
                        ))}
                      </div>
                    </div>
                    <div className="flex items-center gap-1">
                      {index > 0 && (
                        <button
                          onClick={() => reorderTasks(index, index - 1)}
                          className="p-1 text-gray-500 hover:text-white"
                        >
                          ↑
                        </button>
                      )}
                      {index < tasks.length - 1 && (
                        <button
                          onClick={() => reorderTasks(index, index + 1)}
                          className="p-1 text-gray-500 hover:text-white"
                        >
                          ↓
                        </button>
                      )}
                      <button
                        onClick={() => deleteTask(task.id)}
                        className="p-1 text-gray-500 hover:text-red-400"
                      >
                        ×
                      </button>
                    </div>
                  </div>
                ))}

                {tasks.length === 0 && (
                  <p className="text-center text-gray-500 text-sm py-4">
                    No tasks yet. Add tasks with pomodoro estimates! 🍅
                  </p>
                )}
              </div>
            )}

            {activeTab === 'stats' && (
              <div className="space-y-3">
                {/* Today's stats */}
                <div className="grid grid-cols-3 gap-2">
                  <div className="bg-white/5 border border-white/10 rounded-xl p-3 text-center">
                    <div className="text-2xl font-bold text-red-400">{stats.sessionsCompleted}</div>
                    <div className="text-[10px] text-gray-400 mt-1">Sessions</div>
                  </div>
                  <div className="bg-white/5 border border-white/10 rounded-xl p-3 text-center">
                    <div className="text-2xl font-bold text-orange-400">{Math.floor(stats.totalFocusTime / 60)}h</div>
                    <div className="text-[10px] text-gray-400 mt-1">Focus Time</div>
                  </div>
                  <div className="bg-white/5 border border-white/10 rounded-xl p-3 text-center">
                    <div className="text-2xl font-bold text-yellow-400">{stats.interruptions}</div>
                    <div className="text-[10px] text-gray-400 mt-1">Interruptions</div>
                  </div>
                </div>

                {/* Streak */}
                <div className="bg-white/5 border border-white/10 rounded-xl p-3 flex items-center justify-between">
                  <div>
                    <div className="text-sm font-medium">🔥 Current Streak</div>
                    <div className="text-xs text-gray-400">Longest: {stats.longestStreak} days</div>
                  </div>
                  <div className="text-3xl font-bold text-orange-400">{stats.currentStreak}</div>
                </div>

                {/* History mini chart */}
                {stats.history.length > 0 && (
                  <div className="bg-white/5 border border-white/10 rounded-xl p-3">
                    <div className="text-xs text-gray-400 mb-2">Last 7 days</div>
                    <div className="flex items-end gap-1 h-12">
                      {stats.history.slice(-7).map((day, i) => {
                        const maxSessions = Math.max(...stats.history.slice(-7).map(d => d.sessions), 1);
                        const height = (day.sessions / maxSessions) * 100;
                        return (
                          <div key={i} className="flex-1 flex flex-col items-center gap-1">
                            <div
                              className="w-full rounded-t bg-gradient-to-t from-red-600 to-orange-500"
                              style={{ height: `${Math.max(height, 5)}%` }}
                            />
                            <span className="text-[8px] text-gray-500">
                              {new Date(day.date).toLocaleDateString('en', { weekday: 'short' }).slice(0, 2)}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Reflection prompt */}
                <button
                  onClick={() => setShowReflection(!showReflection)}
                  className="w-full py-2 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-xs transition-all"
                >
                  📝 End of Day Reflection
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Modals/Panels */}
        {showSettings && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4" onClick={() => setShowSettings(false)}>
            <div className="bg-gray-900 border border-white/10 rounded-2xl p-6 max-w-sm w-full" onClick={(e) => e.stopPropagation()}>
              <h2 className="text-lg font-bold mb-4">⚙️ Settings</h2>
              <div className="space-y-4">
                <div>
                  <label className="text-xs text-gray-400 block mb-1">Focus Duration (min)</label>
                  <input
                    type="number"
                    value={settings.focusDuration}
                    onChange={(e) => updateSettings({ focusDuration: Math.max(1, Number(e.target.value)) })}
                    className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-sm focus:outline-none focus:border-white/30"
                    min={1}
                    max={120}
                  />
                </div>
                <div>
                  <label className="text-xs text-gray-400 block mb-1">Short Break (min)</label>
                  <input
                    type="number"
                    value={settings.shortBreakDuration}
                    onChange={(e) => updateSettings({ shortBreakDuration: Math.max(1, Number(e.target.value)) })}
                    className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-sm focus:outline-none focus:border-white/30"
                    min={1}
                    max={30}
                  />
                </div>
                <div>
                  <label className="text-xs text-gray-400 block mb-1">Long Break (min)</label>
                  <input
                    type="number"
                    value={settings.longBreakDuration}
                    onChange={(e) => updateSettings({ longBreakDuration: Math.max(1, Number(e.target.value)) })}
                    className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-sm focus:outline-none focus:border-white/30"
                    min={1}
                    max={60}
                  />
                </div>
                <div>
                  <label className="text-xs text-gray-400 block mb-1">Long Break After (sessions)</label>
                  <input
                    type="number"
                    value={settings.longBreakInterval}
                    onChange={(e) => updateSettings({ longBreakInterval: Math.max(2, Number(e.target.value)) })}
                    className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-sm focus:outline-none focus:border-white/30"
                    min={2}
                    max={10}
                  />
                </div>
                <div>
                  <label className="text-xs text-gray-400 block mb-1">Daily Goal (pomodoros)</label>
                  <input
                    type="number"
                    value={settings.dailyGoal}
                    onChange={(e) => updateSettings({ dailyGoal: Math.max(1, Number(e.target.value)) })}
                    className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-sm focus:outline-none focus:border-white/30"
                    min={1}
                    max={20}
                  />
                </div>
                <div className="text-[10px] text-gray-500 bg-white/5 rounded-lg p-2">
                  💡 Tip: Most people find 25-50 min focus with 5-15 min breaks optimal. Experiment to find your sweet spot!
                </div>
              </div>
              <button
                onClick={() => setShowSettings(false)}
                className="w-full mt-4 py-2 rounded-lg bg-white/10 hover:bg-white/20 text-sm transition-all"
              >
                Done
              </button>
            </div>
          </div>
        )}

        {showDailyPlan && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4" onClick={() => setShowDailyPlan(false)}>
            <div className="bg-gray-900 border border-white/10 rounded-2xl p-6 max-w-sm w-full" onClick={(e) => e.stopPropagation()}>
              <h2 className="text-lg font-bold mb-4">📅 Daily Plan</h2>
              <div className="space-y-4">
                <div className="bg-white/5 border border-white/10 rounded-xl p-4">
                  <div className="text-xs text-gray-400 mb-2">Today's Target</div>
                  <div className="flex items-center gap-3">
                    <input
                      type="range"
                      min={1}
                      max={16}
                      value={dailyPlan.targetPomodoros}
                      onChange={(e) => updateDailyPlan({ targetPomodoros: Number(e.target.value) })}
                      className="flex-1"
                    />
                    <span className="text-lg font-bold text-red-400">{dailyPlan.targetPomodoros} 🍅</span>
                  </div>
                </div>
                <div className="bg-white/5 border border-white/10 rounded-xl p-4">
                  <div className="text-xs text-gray-400 mb-2">Overflow Buffer</div>
                  <div className="flex items-center gap-3">
                    <input
                      type="range"
                      min={0}
                      max={6}
                      value={dailyPlan.overflowBuffer}
                      onChange={(e) => updateDailyPlan({ overflowBuffer: Number(e.target.value) })}
                      className="flex-1"
                    />
                    <span className="text-lg font-bold text-orange-400">+{dailyPlan.overflowBuffer} 🍅</span>
                  </div>
                  <p className="text-[10px] text-gray-500 mt-1">Buffer for unexpected tasks or overruns</p>
                </div>
                <div className="bg-white/5 border border-white/10 rounded-xl p-4">
                  <div className="flex justify-between text-xs">
                    <span className="text-gray-400">Completed</span>
                    <span className="text-white">{dailyPlan.completedPomodoros} / {dailyPlan.targetPomodoros}</span>
                  </div>
                  <div className="h-2 bg-white/10 rounded-full mt-2 overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-red-500 to-orange-500 rounded-full transition-all"
                      style={{ width: `${(dailyPlan.completedPomodoros / dailyPlan.targetPomodoros) * 100}%` }}
                    />
                  </div>
                </div>
                <div className="text-[10px] text-gray-500 bg-white/5 rounded-lg p-2">
                  💡 Plan 12-14 pomodoros max for an 8-hour day. Build in 2-4 overflow pomodoros for flexibility.
                </div>
                <button
                  onClick={() => { resetDailyPlan(); setShowDailyPlan(false); }}
                  className="w-full py-2 rounded-lg bg-white/10 hover:bg-white/20 text-sm transition-all"
                >
                  Reset Day
                </button>
              </div>
              <button
                onClick={() => setShowDailyPlan(false)}
                className="w-full mt-4 py-2 rounded-lg bg-red-600 hover:bg-red-700 text-sm transition-all"
              >
                Done
              </button>
            </div>
          </div>
        )}

        {showInterruptions && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4" onClick={() => setShowInterruptions(false)}>
            <div className="bg-gray-900 border border-white/10 rounded-2xl p-6 max-w-sm w-full" onClick={(e) => e.stopPropagation()}>
              <h2 className="text-lg font-bold mb-4">⚡ Interruption Tracker</h2>
              <div className="space-y-3">
                <div className="flex gap-2">
                  <button
                    onClick={() => setInterruptionType('internal')}
                    className={`flex-1 py-2 rounded-lg text-xs transition-all ${
                      interruptionType === 'internal'
                        ? 'bg-purple-500/30 border border-purple-500/50 text-purple-300'
                        : 'bg-white/5 border border-white/10 text-gray-400'
                    }`}
                  >
                    🧠 Internal (my thoughts)
                  </button>
                  <button
                    onClick={() => setInterruptionType('external')}
                    className={`flex-1 py-2 rounded-lg text-xs transition-all ${
                      interruptionType === 'external'
                        ? 'bg-orange-500/30 border border-orange-500/50 text-orange-300'
                        : 'bg-white/5 border border-white/10 text-gray-400'
                    }`}
                  >
                    📱 External (others)
                  </button>
                </div>
                <input
                  type="text"
                  value={interruptionNote}
                  onChange={(e) => setInterruptionNote(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleLogInterruption()}
                  placeholder="What interrupted you?"
                  className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-sm placeholder-gray-500 focus:outline-none focus:border-white/30"
                />
                <button
                  onClick={handleLogInterruption}
                  className="w-full py-2 rounded-lg bg-orange-600 hover:bg-orange-700 text-sm transition-all"
                >
                  Log Interruption
                </button>

                {/* Interruption list */}
                {interruptions.length > 0 && (
                  <div className="max-h-40 overflow-y-auto space-y-1 mt-2">
                    {interruptions.slice().reverse().map((int) => (
                      <div key={int.id} className="flex items-center gap-2 p-2 rounded-lg bg-white/5 text-xs">
                        <span>{int.type === 'internal' ? '🧠' : '📱'}</span>
                        <span className="flex-1 text-gray-300 truncate">{int.note}</span>
                        <span className="text-gray-500">
                          {new Date(int.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                    ))}
                  </div>
                )}

                <div className="text-[10px] text-gray-500 bg-white/5 rounded-lg p-2">
                  💡 Track interruptions to identify patterns. Note them and return to later — don't break your pomodoro!
                </div>

                {interruptions.length > 0 && (
                  <button
                    onClick={clearInterruptions}
                    className="w-full py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-xs text-gray-400 transition-all"
                  >
                    Clear All
                  </button>
                )}
              </div>
              <button
                onClick={() => setShowInterruptions(false)}
                className="w-full mt-4 py-2 rounded-lg bg-white/10 hover:bg-white/20 text-sm transition-all"
              >
                Done
              </button>
            </div>
          </div>
        )}

        {showReflection && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4" onClick={() => setShowReflection(false)}>
            <div className="bg-gray-900 border border-white/10 rounded-2xl p-6 max-w-sm w-full" onClick={(e) => e.stopPropagation()}>
              <h2 className="text-lg font-bold mb-4">📝 Daily Reflection</h2>
              <div className="space-y-3">
                <div className="bg-white/5 border border-white/10 rounded-xl p-4">
                  <div className="text-xs text-gray-400 mb-2">Today's Summary</div>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div>🍅 Sessions: <span className="text-red-400 font-bold">{stats.sessionsCompleted}</span></div>
                    <div>⏱ Focus: <span className="text-orange-400 font-bold">{Math.floor(stats.totalFocusTime / 60)}h {stats.totalFocusTime % 60}m</span></div>
                    <div>⚡ Interruptions: <span className="text-yellow-400 font-bold">{stats.interruptions}</span></div>
                    <div>🔥 Streak: <span className="text-orange-400 font-bold">{stats.currentStreak} days</span></div>
                  </div>
                </div>
                <div className="bg-white/5 border border-white/10 rounded-xl p-4">
                  <div className="text-xs text-gray-400 mb-2">Tasks Completed</div>
                  <div className="text-sm">
                    {tasks.filter(t => t.isCompleted).length} / {tasks.length} tasks done
                  </div>
                </div>
                <div className="text-[10px] text-gray-500 bg-white/5 rounded-lg p-2">
                  💡 Reflect on what went well and how you can improve tomorrow. Each pomodoro is a fresh start!
                </div>
              </div>
              <button
                onClick={() => setShowReflection(false)}
                className="w-full mt-4 py-2 rounded-lg bg-white/10 hover:bg-white/20 text-sm transition-all"
              >
                Close
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
