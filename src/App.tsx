import { useState, useEffect } from 'react';
import { usePomodoro, ACTIVITIES } from './hooks/usePomodoro';
import type { Activity, TimerMode } from './hooks/usePomodoro';
import { useDeviceSimulator } from './hooks/useDeviceSimulator';
import PomodoroScene from './components/PomodoroScene';

// Break activity suggestions (screen-free)
const BREAK_ACTIVITIES = [
  { emoji: '🚶', text: 'Take a short walk' },
  { emoji: '🧘', text: 'Do some stretching' },
  { emoji: '💧', text: 'Drink some water' },
  { emoji: '👀', text: 'Look out the window' },
  { emoji: '🌿', text: 'Water a plant' },
  { emoji: '🫁', text: 'Deep breathing exercise' },
  { emoji: '🎵', text: 'Listen to music' },
  { emoji: '📝', text: 'Journal your thoughts' },
  { emoji: '🍎', text: 'Have a healthy snack' },
  { emoji: '🧹', text: 'Tidy your space' },
];

function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
}

export default function App() {
  const pomodoro = usePomodoro();
  const device = useDeviceSimulator(
    pomodoro.mode,
    pomodoro.timerState,
    pomodoro.servoAngle,
    pomodoro.timeLeft,
    pomodoro.sessionsCompleted,
  );

  const [activeTab, setActiveTab] = useState<'timer' | 'tasks' | 'device' | 'stats'>('timer');
  const [breakSuggestion, setBreakSuggestion] = useState(BREAK_ACTIVITIES[0]);
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskEstimate, setNewTaskEstimate] = useState(1);
  const [interruptionNote, setInterruptionNote] = useState('');
  const [showInterruptionModal, setShowInterruptionModal] = useState(false);

  // Rotate break suggestions
  useEffect(() => {
    if (pomodoro.mode !== 'focus' && pomodoro.timerState === 'running') {
      const idx = Math.floor(Math.random() * BREAK_ACTIVITIES.length);
      setBreakSuggestion(BREAK_ACTIVITIES[idx]);
    }
  }, [pomodoro.mode, pomodoro.timerState]);

  // Send commands to device
  useEffect(() => {
    if (pomodoro.timerState === 'running') {
      device.sendCommand({ type: pomodoro.mode === 'focus' ? 'START_FOCUS' : 'START_BREAK' });
    } else if (pomodoro.timerState === 'paused') {
      device.sendCommand({ type: 'PAUSE' });
    } else if (pomodoro.timerState === 'idle') {
      device.sendCommand({ type: 'RESET' });
    }
  }, [pomodoro.timerState, pomodoro.mode]);

  const handleTomatoPress = () => {
    pomodoro.toggleTimer();
  };

  const handleAddTask = () => {
    if (newTaskTitle.trim()) {
      pomodoro.addTask(newTaskTitle, newTaskEstimate);
      setNewTaskTitle('');
      setNewTaskEstimate(1);
    }
  };

  const handleLogInterruption = (type: 'internal' | 'external') => {
    pomodoro.logInterruption(type, interruptionNote || `${type} interruption`);
    setInterruptionNote('');
    setShowInterruptionModal(false);
  };

  const modeColors = {
    focus: { bg: 'from-red-950/30 to-transparent', text: 'text-red-400', border: 'border-red-500/30', glow: 'shadow-red-500/20' },
    shortBreak: { bg: 'from-green-950/30 to-transparent', text: 'text-green-400', border: 'border-green-500/30', glow: 'shadow-green-500/20' },
    longBreak: { bg: 'from-blue-950/30 to-transparent', text: 'text-blue-400', border: 'border-blue-500/30', glow: 'shadow-blue-500/20' },
  };
  const colors = modeColors[pomodoro.mode];

  return (
    <div className="w-full h-screen bg-[#0f0f1a] text-white flex flex-col overflow-hidden">
      {/* Top Status Bar */}
      <div className="flex items-center justify-between px-4 py-2 bg-black/30 backdrop-blur-sm border-b border-white/5 z-20">
        <div className="flex items-center gap-3">
          <div className="text-lg font-bold tracking-tight">
            <span className="text-red-400">🍅</span> PomoDevice
          </div>
          <div className={`flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs ${
            device.connectionState === 'connected'
              ? 'bg-green-500/10 text-green-400 border border-green-500/20'
              : device.connectionState === 'connecting'
              ? 'bg-yellow-500/10 text-yellow-400 border border-yellow-500/20'
              : 'bg-gray-500/10 text-gray-400 border border-gray-500/20'
          }`}>
            <div className={`w-1.5 h-1.5 rounded-full ${
              device.connectionState === 'connected' ? 'bg-green-400 animate-pulse' :
              device.connectionState === 'connecting' ? 'bg-yellow-400 animate-pulse' :
              'bg-gray-400'
            }`} />
            {device.connectionState === 'connected' ? device.device.name : 
             device.connectionState === 'connecting' ? 'Connecting...' : 'Disconnected'}
          </div>
        </div>

        <div className="flex items-center gap-4 text-xs text-gray-400">
          {device.connectionState === 'connected' && (
            <>
              <span className="flex items-center gap-1">
                🔋 {Math.round(device.device.battery)}%
              </span>
              <span className="flex items-center gap-1">
                📶 {Math.round(device.device.signalStrength)}%
              </span>
              <span className="flex items-center gap-1">
                🔄 {Math.round(device.device.servoAngle)}°
              </span>
            </>
          )}
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex relative overflow-hidden">
        {/* 3D Scene - Full background */}
        <div className="absolute inset-0 z-0">
          <PomodoroScene
            mode={pomodoro.mode}
            timerState={pomodoro.timerState}
            timeLeft={pomodoro.timeLeft}
            totalTime={pomodoro.totalTime}
            sessionsCompleted={pomodoro.sessionsCompleted}
            longBreakInterval={pomodoro.currentActivity.longBreakInterval}
            servoAngle={pomodoro.servoAngle}
            device={device.device}
            connectionState={device.connectionState}
            onTomatoPress={handleTomatoPress}
          />
        </div>

        {/* Floating Control Panel */}
        <div className="relative z-10 flex flex-col w-full max-w-md mx-auto p-4 pointer-events-none">
          {/* Timer Display */}
          <div className="pointer-events-auto mt-4">
            <div className={`bg-black/40 backdrop-blur-xl rounded-2xl border ${colors.border} p-6 shadow-2xl ${colors.glow}`}>
              {/* Mode Tabs */}
              <div className="flex gap-1 mb-4 bg-black/30 rounded-lg p-1">
                {(['focus', 'shortBreak', 'longBreak'] as TimerMode[]).map((m) => (
                  <button
                    key={m}
                    onClick={() => pomodoro.switchMode(m)}
                    className={`flex-1 py-1.5 px-2 rounded-md text-xs font-medium transition-all ${
                      pomodoro.mode === m
                        ? `bg-white/10 ${modeColors[m].text}`
                        : 'text-gray-500 hover:text-gray-300'
                    }`}
                  >
                    {m === 'focus' ? '🎯 Focus' : m === 'shortBreak' ? '☕ Short' : '🌊 Long'}
                  </button>
                ))}
              </div>

              {/* Time Display */}
              <div className="text-center mb-4">
                <div className={`text-6xl font-mono font-bold tracking-tight ${colors.text}`}>
                  {formatTime(pomodoro.timeLeft)}
                </div>
                <div className="text-sm text-gray-400 mt-1">
                  {pomodoro.currentActivity.emoji} {pomodoro.currentActivity.name}
                  {pomodoro.timerState === 'running' && ' • Running'}
                  {pomodoro.timerState === 'paused' && ' • Paused'}
                </div>
              </div>

              {/* Progress Bar */}
              <div className="w-full h-1.5 bg-white/5 rounded-full mb-4 overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-1000 ${
                    pomodoro.mode === 'focus' ? 'bg-red-500' :
                    pomodoro.mode === 'shortBreak' ? 'bg-green-500' : 'bg-blue-500'
                  }`}
                  style={{ width: `${pomodoro.progress * 100}%` }}
                />
              </div>

              {/* Controls */}
              <div className="flex items-center justify-center gap-3">
                <button
                  onClick={pomodoro.reset}
                  className="w-10 h-10 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 flex items-center justify-center transition-all"
                  title="Reset"
                >
                  ↺
                </button>
                <button
                  onClick={handleTomatoPress}
                  className={`w-16 h-16 rounded-full flex items-center justify-center transition-all transform hover:scale-105 active:scale-95 shadow-lg ${
                    pomodoro.timerState === 'running'
                      ? 'bg-yellow-500/20 border-2 border-yellow-500/50 text-yellow-400'
                      : pomodoro.mode === 'focus'
                      ? 'bg-red-500/20 border-2 border-red-500/50 text-red-400'
                      : pomodoro.mode === 'shortBreak'
                      ? 'bg-green-500/20 border-2 border-green-500/50 text-green-400'
                      : 'bg-blue-500/20 border-2 border-blue-500/50 text-blue-400'
                  }`}
                  title={pomodoro.timerState === 'running' ? 'Pause' : 'Start'}
                >
                  {pomodoro.timerState === 'running' ? (
                    <span className="text-2xl">⏸</span>
                  ) : (
                    <span className="text-2xl">▶</span>
                  )}
                </button>
                <button
                  onClick={pomodoro.skip}
                  className="w-10 h-10 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 flex items-center justify-center transition-all"
                  title="Skip"
                >
                  ⏭
                </button>
              </div>

              {/* Session info */}
              <div className="flex items-center justify-between mt-4 text-xs text-gray-400">
                <span>🍅 {pomodoro.sessionsCompleted} sessions</span>
                <span>🎯 {pomodoro.todaySessions}/{pomodoro.dailyGoal} today</span>
                {pomodoro.interruptions.length > 0 && (
                  <span className="text-yellow-400">⚡ {pomodoro.interruptions.length} interruptions</span>
                )}
              </div>
            </div>
          </div>

          {/* Break suggestion (during breaks) */}
          {pomodoro.mode !== 'focus' && pomodoro.timerState === 'running' && (
            <div className="pointer-events-auto mt-3 animate-fade-in">
              <div className="bg-green-900/20 backdrop-blur-xl rounded-xl border border-green-500/20 p-3">
                <div className="text-xs text-green-400 font-medium mb-1">💡 Break suggestion</div>
                <div className="text-sm text-green-200">
                  {breakSuggestion.emoji} {breakSuggestion.text}
                </div>
                <div className="text-xs text-green-400/60 mt-1">Get away from screens! 📵</div>
              </div>
            </div>
          )}

          {/* Spacer */}
          <div className="flex-1" />

          {/* Bottom Tab Navigation */}
          <div className="pointer-events-auto mb-2">
            <div className="bg-black/50 backdrop-blur-xl rounded-2xl border border-white/10 p-1.5 flex gap-1">
              {[
                { id: 'timer' as const, icon: '🍅', label: 'Timer' },
                { id: 'tasks' as const, icon: '📋', label: 'Tasks' },
                { id: 'device' as const, icon: '📡', label: 'Device' },
                { id: 'stats' as const, icon: '📊', label: 'Stats' },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex-1 py-2 px-3 rounded-xl text-xs font-medium transition-all ${
                    activeTab === tab.id
                      ? 'bg-white/10 text-white'
                      : 'text-gray-500 hover:text-gray-300'
                  }`}
                >
                  <div className="text-base">{tab.icon}</div>
                  <div>{tab.label}</div>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Side Panel */}
        <div className="absolute right-0 top-0 bottom-0 w-80 z-10 pointer-events-none flex flex-col p-4 pl-0">
          <div className="pointer-events-auto flex-1 overflow-y-auto">
            {/* Activity Selector */}
            {activeTab === 'timer' && (
              <div className="bg-black/40 backdrop-blur-xl rounded-2xl border border-white/10 p-4 mb-3">
                <h3 className="text-sm font-semibold text-gray-300 mb-3 flex items-center gap-2">
                  <span>⚡</span> Activity Mode
                </h3>
                <div className="grid grid-cols-2 gap-2">
                  {ACTIVITIES.map((activity) => (
                    <button
                      key={activity.id}
                      onClick={() => pomodoro.switchActivity(activity)}
                      className={`p-2.5 rounded-xl border text-left transition-all ${
                        pomodoro.currentActivity.id === activity.id
                          ? 'bg-white/10 border-white/20'
                          : 'bg-black/20 border-white/5 hover:bg-white/5 hover:border-white/10'
                      }`}
                    >
                      <div className="text-lg">{activity.emoji}</div>
                      <div className="text-xs font-medium text-white mt-1">{activity.name}</div>
                      <div className="text-[10px] text-gray-400 mt-0.5">{activity.description}</div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Tasks Panel */}
            {activeTab === 'tasks' && (
              <div className="bg-black/40 backdrop-blur-xl rounded-2xl border border-white/10 p-4">
                <h3 className="text-sm font-semibold text-gray-300 mb-3 flex items-center gap-2">
                  <span>📋</span> Today's Tasks
                </h3>

                {/* Add task */}
                <div className="mb-3 space-y-2">
                  <input
                    type="text"
                    value={newTaskTitle}
                    onChange={(e) => setNewTaskTitle(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleAddTask()}
                    placeholder="Add a task..."
                    className="w-full bg-black/30 border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-white/20"
                  />
                  <div className="flex items-center gap-2">
                    <label className="text-xs text-gray-400">🍅 Estimate:</label>
                    <input
                      type="number"
                      min={1}
                      max={10}
                      value={newTaskEstimate}
                      onChange={(e) => setNewTaskEstimate(Number(e.target.value))}
                      className="w-16 bg-black/30 border border-white/10 rounded-lg px-2 py-1 text-sm text-white focus:outline-none focus:border-white/20"
                    />
                    <button
                      onClick={handleAddTask}
                      className="ml-auto px-3 py-1 bg-white/10 hover:bg-white/20 border border-white/10 rounded-lg text-xs transition-all"
                    >
                      Add
                    </button>
                  </div>
                </div>

                {/* Task list */}
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {pomodoro.tasks.length === 0 ? (
                    <div className="text-center text-gray-500 text-xs py-4">
                      No tasks yet. Add tasks to track your pomodoros!
                    </div>
                  ) : (
                    pomodoro.tasks.map((task) => (
                      <div
                        key={task.id}
                        className={`p-2.5 rounded-lg border transition-all ${
                          task.isCompleted
                            ? 'bg-green-500/5 border-green-500/20'
                            : 'bg-black/20 border-white/5'
                        }`}
                      >
                        <div className="flex items-start gap-2">
                          <button
                            onClick={() => pomodoro.updateTask(task.id, { isCompleted: !task.isCompleted })}
                            className={`w-4 h-4 rounded border mt-0.5 flex-shrink-0 ${
                              task.isCompleted
                                ? 'bg-green-500 border-green-500'
                                : 'border-white/20'
                            }`}
                          >
                            {task.isCompleted && <span className="text-[10px]">✓</span>}
                          </button>
                          <div className="flex-1 min-w-0">
                            <div className={`text-xs font-medium ${task.isCompleted ? 'text-gray-500 line-through' : 'text-white'}`}>
                              {task.title}
                            </div>
                            <div className="flex items-center gap-1 mt-1">
                              {Array.from({ length: task.estimatedPomodoros }).map((_, i) => (
                                <span
                                  key={i}
                                  className={`text-[10px] ${
                                    i < task.completedPomodoros ? 'text-red-400' : 'text-gray-600'
                                  }`}
                                >
                                  🍅
                                </span>
                              ))}
                              <span className="text-[10px] text-gray-500 ml-1">
                                {task.completedPomodoros}/{task.estimatedPomodoros}
                              </span>
                            </div>
                          </div>
                          <button
                            onClick={() => pomodoro.deleteTask(task.id)}
                            className="text-gray-600 hover:text-red-400 text-xs"
                          >
                            ✕
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>

                {/* Interruption tracker */}
                <div className="mt-4 pt-4 border-t border-white/5">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="text-xs font-medium text-gray-400">⚡ Interruptions</h4>
                    <button
                      onClick={() => setShowInterruptionModal(!showInterruptionModal)}
                      className="text-xs px-2 py-0.5 bg-yellow-500/10 text-yellow-400 rounded border border-yellow-500/20"
                    >
                      + Log
                    </button>
                  </div>
                  {showInterruptionModal && (
                    <div className="space-y-2 mb-2">
                      <input
                        type="text"
                        value={interruptionNote}
                        onChange={(e) => setInterruptionNote(e.target.value)}
                        placeholder="What interrupted you?"
                        className="w-full bg-black/30 border border-white/10 rounded-lg px-2 py-1.5 text-xs text-white placeholder-gray-500 focus:outline-none"
                      />
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleLogInterruption('internal')}
                          className="flex-1 text-xs py-1 bg-orange-500/10 text-orange-400 rounded border border-orange-500/20"
                        >
                          🧠 Internal
                        </button>
                        <button
                          onClick={() => handleLogInterruption('external')}
                          className="flex-1 text-xs py-1 bg-purple-500/10 text-purple-400 rounded border border-purple-500/20"
                        >
                          📱 External
                        </button>
                      </div>
                    </div>
                  )}
                  {pomodoro.interruptions.length > 0 && (
                    <div className="space-y-1 max-h-24 overflow-y-auto">
                      {pomodoro.interruptions.slice(-5).reverse().map((i) => (
                        <div key={i.id} className="text-[10px] text-gray-500 flex items-center gap-1">
                          <span>{i.type === 'internal' ? '🧠' : '📱'}</span>
                          <span className="truncate">{i.note}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Device Panel */}
            {activeTab === 'device' && (
              <div className="bg-black/40 backdrop-blur-xl rounded-2xl border border-white/10 p-4">
                <h3 className="text-sm font-semibold text-gray-300 mb-3 flex items-center gap-2">
                  <span>📡</span> Physical Device
                </h3>

                {/* Connection status */}
                <div className="mb-4">
                  {device.connectionState === 'connected' ? (
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-gray-400">Device</span>
                        <span className="text-xs text-white">{device.device.name}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-gray-400">Firmware</span>
                        <span className="text-xs text-white">v{device.device.firmware}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-gray-400">Battery</span>
                        <div className="flex items-center gap-2">
                          <div className="w-20 h-1.5 bg-white/10 rounded-full overflow-hidden">
                            <div
                              className={`h-full rounded-full ${
                                device.device.battery > 20 ? 'bg-green-500' : 'bg-red-500'
                              }`}
                              style={{ width: `${device.device.battery}%` }}
                            />
                          </div>
                          <span className="text-xs text-white">{Math.round(device.device.battery)}%</span>
                        </div>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-gray-400">Signal</span>
                        <span className="text-xs text-white">{Math.round(device.device.signalStrength)}%</span>
                      </div>

                      {/* Device status indicators */}
                      <div className="pt-3 border-t border-white/5 space-y-2">
                        <div className="text-xs text-gray-400 font-medium">Hardware Status</div>
                        <div className="grid grid-cols-2 gap-2">
                          <div className="bg-black/30 rounded-lg p-2">
                            <div className="text-[10px] text-gray-500">Servo</div>
                            <div className="text-sm font-mono text-white">{Math.round(device.device.servoAngle)}°</div>
                          </div>
                          <div className="bg-black/30 rounded-lg p-2">
                            <div className="text-[10px] text-gray-500">LED</div>
                            <div className="flex items-center gap-1">
                              <div
                                className="w-3 h-3 rounded-full"
                                style={{ backgroundColor: device.device.ledColor }}
                              />
                              <span className="text-xs text-white">{Math.round(device.device.ledBrightness * 100)}%</span>
                            </div>
                          </div>
                          <div className="bg-black/30 rounded-lg p-2">
                            <div className="text-[10px] text-gray-500">Buzzer</div>
                            <div className={`text-xs ${device.device.isBuzzerActive ? 'text-yellow-400' : 'text-gray-600'}`}>
                              {device.device.isBuzzerActive ? '🔊 Active' : '🔇 Off'}
                            </div>
                          </div>
                          <div className="bg-black/30 rounded-lg p-2">
                            <div className="text-[10px] text-gray-500">Vibration</div>
                            <div className={`text-xs ${device.device.isVibrating ? 'text-purple-400' : 'text-gray-600'}`}>
                              {device.device.isVibrating ? '📳 Active' : '⚪ Off'}
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Command log */}
                      <div className="pt-3 border-t border-white/5">
                        <div className="text-xs text-gray-400 font-medium mb-2">Command Log</div>
                        <div className="space-y-1 max-h-32 overflow-y-auto">
                          {device.commandLog.slice(0, 10).map((log, i) => (
                            <div key={i} className="text-[10px] text-gray-500 font-mono flex items-center gap-2">
                              <span className="text-gray-600">{new Date(log.time).toLocaleTimeString()}</span>
                              <span className={
                                log.command.includes('START') ? 'text-green-400' :
                                log.command === 'PAUSE' ? 'text-yellow-400' :
                                log.command === 'RESET' ? 'text-red-400' : 'text-gray-400'
                              }>{log.command}</span>
                            </div>
                          ))}
                          {device.commandLog.length === 0 && (
                            <div className="text-[10px] text-gray-600">No commands sent yet</div>
                          )}
                        </div>
                      </div>

                      <button
                        onClick={device.disconnect}
                        className="w-full mt-3 py-2 bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 rounded-lg text-xs text-red-400 transition-all"
                      >
                        Disconnect Device
                      </button>
                    </div>
                  ) : (
                    <div className="text-center py-6">
                      <div className="text-4xl mb-3">📡</div>
                      <div className="text-sm text-gray-400 mb-4">
                        {device.connectionState === 'connecting'
                          ? 'Searching for device...'
                          : 'No device connected'}
                      </div>
                      <button
                        onClick={device.connect}
                        disabled={device.connectionState === 'connecting'}
                        className="px-4 py-2 bg-blue-500/20 hover:bg-blue-500/30 border border-blue-500/30 rounded-lg text-sm text-blue-400 transition-all disabled:opacity-50"
                      >
                        {device.connectionState === 'connecting' ? 'Connecting...' : 'Connect Device'}
                      </button>
                    </div>
                  )}
                </div>

                {/* Device info */}
                <div className="pt-3 border-t border-white/5">
                  <div className="text-xs text-gray-500">
                    <p className="mb-1">💡 This simulates a physical ESP32 device with:</p>
                    <ul className="space-y-0.5 text-[10px] text-gray-600">
                      <li>• SG90 servo motor (rotating dial)</li>
                      <li>• RGB LED ring (24 LEDs)</li>
                      <li>• Buzzer for notifications</li>
                      <li>• Vibration motor</li>
                      <li>• Wi-Fi/Bluetooth connection</li>
                    </ul>
                  </div>
                </div>
              </div>
            )}

            {/* Stats Panel */}
            {activeTab === 'stats' && (
              <div className="bg-black/40 backdrop-blur-xl rounded-2xl border border-white/10 p-4">
                <h3 className="text-sm font-semibold text-gray-300 mb-3 flex items-center gap-2">
                  <span>📊</span> Statistics
                </h3>

                {/* Today's progress */}
                <div className="mb-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs text-gray-400">Today's Goal</span>
                    <span className="text-xs text-white">{pomodoro.todaySessions}/{pomodoro.dailyGoal} 🍅</span>
                  </div>
                  <div className="w-full h-3 bg-white/5 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        pomodoro.goalReached ? 'bg-gradient-to-r from-green-500 to-emerald-400' : 'bg-gradient-to-r from-red-500 to-orange-400'
                      }`}
                      style={{ width: `${Math.min(pomodoro.dailyProgress * 100, 100)}%` }}
                    />
                  </div>
                  {pomodoro.goalReached && (
                    <div className="text-xs text-green-400 mt-1 text-center">🎉 Goal reached!</div>
                  )}
                </div>

                {/* Daily goal setting */}
                <div className="mb-4 flex items-center gap-2">
                  <label className="text-xs text-gray-400">Daily goal:</label>
                  <input
                    type="range"
                    min={1}
                    max={16}
                    value={pomodoro.dailyGoal}
                    onChange={(e) => pomodoro.setDailyGoal(Number(e.target.value))}
                    className="flex-1 accent-red-500"
                  />
                  <span className="text-xs text-white w-6">{pomodoro.dailyGoal}</span>
                </div>

                {/* Stats grid */}
                <div className="grid grid-cols-2 gap-2 mb-4">
                  <div className="bg-black/30 rounded-lg p-3">
                    <div className="text-[10px] text-gray-500">Today's Focus</div>
                    <div className="text-lg font-bold text-white">{pomodoro.todayFocusMinutes}<span className="text-xs text-gray-400">min</span></div>
                  </div>
                  <div className="bg-black/30 rounded-lg p-3">
                    <div className="text-[10px] text-gray-500">All-Time Sessions</div>
                    <div className="text-lg font-bold text-white">{pomodoro.stats.totalSessions}</div>
                  </div>
                  <div className="bg-black/30 rounded-lg p-3">
                    <div className="text-[10px] text-gray-500">Total Focus</div>
                    <div className="text-lg font-bold text-white">{Math.round(pomodoro.stats.totalFocusMinutes / 60)}<span className="text-xs text-gray-400">hrs</span></div>
                  </div>
                  <div className="bg-black/30 rounded-lg p-3">
                    <div className="text-[10px] text-gray-500">Current Streak</div>
                    <div className="text-lg font-bold text-white">{pomodoro.stats.currentStreak}<span className="text-xs text-gray-400"> days</span></div>
                  </div>
                </div>

                {/* History chart (simple) */}
                <div className="pt-3 border-t border-white/5">
                  <div className="text-xs text-gray-400 font-medium mb-2">Last 7 Days</div>
                  <div className="flex items-end gap-1 h-20">
                    {Array.from({ length: 7 }).map((_, i) => {
                      const date = new Date();
                      date.setDate(date.getDate() - (6 - i));
                      const dateStr = date.toISOString().split('T')[0];
                      const dayData = pomodoro.stats.history.find(h => h.date === dateStr);
                      const sessions = dayData?.sessions || 0;
                      const height = pomodoro.dailyGoal > 0 ? Math.min((sessions / pomodoro.dailyGoal) * 100, 100) : 0;
                      return (
                        <div key={i} className="flex-1 flex flex-col items-center gap-1">
                          <div className="w-full flex flex-col justify-end h-16">
                            <div
                              className={`w-full rounded-t transition-all ${
                                sessions >= pomodoro.dailyGoal ? 'bg-green-500' : 'bg-red-500/50'
                              }`}
                              style={{ height: `${height}%`, minHeight: sessions > 0 ? '4px' : '0' }}
                            />
                          </div>
                          <div className="text-[8px] text-gray-600">
                            {date.toLocaleDateString('en', { weekday: 'short' }).charAt(0)}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Pomodoro rules reminder */}
                <div className="mt-4 pt-3 border-t border-white/5">
                  <div className="text-xs text-gray-400 font-medium mb-2">📜 Pomodoro Rules</div>
                  <div className="space-y-1 text-[10px] text-gray-500">
                    <p>• Break tasks &gt; 4 pomodoros into smaller steps</p>
                    <p>• Combine small tasks into one session</p>
                    <p>• Once started, a pomodoro cannot be split</p>
                    <p>• Track interruptions and improve next time</p>
                    <p>• Use extra time for overlearning</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Bottom hint */}
      <div className="absolute bottom-2 left-1/2 -translate-x-1/2 z-20 text-[10px] text-gray-600 pointer-events-none">
        Click the 🍅 tomato to {pomodoro.timerState === 'running' ? 'pause' : 'start'} • Drag to rotate view • Scroll to zoom
      </div>
    </div>
  );
}
