import { useState, useEffect } from 'react';

interface GoalsProps {
  currentStreak: number;
  totalSessions: number;
  totalFocusMinutes: number;
}

interface Goal {
  id: string;
  type: 'weekly' | 'monthly';
  target: number;
  unit: 'sessions' | 'minutes';
  startDate: string;
  endDate: string;
}

export default function Goals({ currentStreak, totalSessions, totalFocusMinutes }: GoalsProps) {
  const [goals, setGoals] = useState<Goal[]>(() => {
    const saved = localStorage.getItem('pomodoroGoals');
    return saved ? JSON.parse(saved) : [];
  });

  const [showAddGoal, setShowAddGoal] = useState(false);
  const [newGoal, setNewGoal] = useState({
    type: 'weekly' as 'weekly' | 'monthly',
    target: 20,
    unit: 'sessions' as 'sessions' | 'minutes',
  });

  useEffect(() => {
    localStorage.setItem('pomodoroGoals', JSON.stringify(goals));
  }, [goals]);

  const getCurrentPeriodProgress = (goal: Goal) => {
    const now = new Date();
    const startDate = new Date(goal.startDate);
    const endDate = new Date(goal.endDate);

    if (now < startDate || now > endDate) {
      return { current: 0, percentage: 0 };
    }

    // For simplicity, we'll use total stats
    // In a real app, you'd filter by date range
    const current = goal.unit === 'sessions' ? totalSessions : totalFocusMinutes;
    const percentage = Math.min((current / goal.target) * 100, 100);

    return { current, percentage };
  };

  const handleAddGoal = () => {
    const now = new Date();
    const endDate = new Date();
    
    if (newGoal.type === 'weekly') {
      endDate.setDate(now.getDate() + 7);
    } else {
      endDate.setMonth(now.getMonth() + 1);
    }

    const goal: Goal = {
      id: Date.now().toString(),
      type: newGoal.type,
      target: newGoal.target,
      unit: newGoal.unit,
      startDate: now.toISOString(),
      endDate: endDate.toISOString(),
    };

    setGoals([...goals, goal]);
    setShowAddGoal(false);
    setNewGoal({ type: 'weekly', target: 20, unit: 'sessions' });
  };

  const handleDeleteGoal = (goalId: string) => {
    setGoals(goals.filter(g => g.id !== goalId));
  };

  const activeGoals = goals.filter(g => {
    const now = new Date();
    const endDate = new Date(g.endDate);
    return now <= endDate;
  });

  return (
    <div className="goals-container">
      <div className="goals-header">
        <h2>🎯 Goals</h2>
        <p className="goals-subtitle">Set and track your productivity goals</p>
      </div>

      <div className="goals-stats">
        <div className="goal-stat-card">
          <div className="stat-icon">🔥</div>
          <div className="stat-value">{currentStreak}</div>
          <div className="stat-label">Current Streak</div>
        </div>
        <div className="goal-stat-card">
          <div className="stat-icon">🍅</div>
          <div className="stat-value">{totalSessions}</div>
          <div className="stat-label">Total Sessions</div>
        </div>
        <div className="goal-stat-card">
          <div className="stat-icon">⏱️</div>
          <div className="stat-value">{Math.floor(totalFocusMinutes / 60)}h</div>
          <div className="stat-label">Total Focus Time</div>
        </div>
      </div>

      <div className="active-goals">
        <div className="goals-section-header">
          <h3>Active Goals</h3>
          <button className="add-goal-btn" onClick={() => setShowAddGoal(true)}>
            + Add Goal
          </button>
        </div>

        {activeGoals.length === 0 ? (
          <div className="empty-goals">
            <p>No active goals. Set your first goal to stay motivated!</p>
          </div>
        ) : (
          <div className="goals-list">
            {activeGoals.map(goal => {
              const { current, percentage } = getCurrentPeriodProgress(goal);
              const isComplete = percentage >= 100;
              
              return (
                <div key={goal.id} className={`goal-card ${isComplete ? 'completed' : ''}`}>
                  <div className="goal-header">
                    <div className="goal-type">
                      {goal.type === 'weekly' ? '📅 Weekly' : '🗓️ Monthly'} Goal
                    </div>
                    <button 
                      className="delete-goal-btn"
                      onClick={() => handleDeleteGoal(goal.id)}
                    >
                      ✕
                    </button>
                  </div>
                  
                  <div className="goal-target">
                    {goal.target} {goal.unit}
                  </div>

                  <div className="goal-progress">
                    <div className="progress-bar">
                      <div 
                        className="progress-fill"
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                    <div className="progress-text">
                      <span>{current} / {goal.target} {goal.unit}</span>
                      <span>{Math.round(percentage)}%</span>
                    </div>
                  </div>

                  {isComplete && (
                    <div className="goal-completed-badge">
                      ✅ Goal Achieved!
                    </div>
                  )}

                  <div className="goal-dates">
                    {new Date(goal.startDate).toLocaleDateString()} - {new Date(goal.endDate).toLocaleDateString()}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {showAddGoal && (
        <div className="add-goal-overlay" onClick={() => setShowAddGoal(false)}>
          <div className="add-goal-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Add New Goal</h3>
              <button className="close-modal" onClick={() => setShowAddGoal(false)}>✕</button>
            </div>

            <div className="modal-content">
              <div className="form-group">
                <label>Goal Type</label>
                <div className="goal-type-selector">
                  <button
                    className={`type-btn ${newGoal.type === 'weekly' ? 'active' : ''}`}
                    onClick={() => setNewGoal({ ...newGoal, type: 'weekly' })}
                  >
                    📅 Weekly
                  </button>
                  <button
                    className={`type-btn ${newGoal.type === 'monthly' ? 'active' : ''}`}
                    onClick={() => setNewGoal({ ...newGoal, type: 'monthly' })}
                  >
                    🗓️ Monthly
                  </button>
                </div>
              </div>

              <div className="form-group">
                <label>Target</label>
                <input
                  type="number"
                  className="goal-input"
                  value={newGoal.target}
                  onChange={(e) => setNewGoal({ ...newGoal, target: parseInt(e.target.value) || 0 })}
                  min="1"
                />
              </div>

              <div className="form-group">
                <label>Unit</label>
                <div className="goal-type-selector">
                  <button
                    className={`type-btn ${newGoal.unit === 'sessions' ? 'active' : ''}`}
                    onClick={() => setNewGoal({ ...newGoal, unit: 'sessions' })}
                  >
                    🍅 Sessions
                  </button>
                  <button
                    className={`type-btn ${newGoal.unit === 'minutes' ? 'active' : ''}`}
                    onClick={() => setNewGoal({ ...newGoal, unit: 'minutes' })}
                  >
                    ⏱️ Minutes
                  </button>
                </div>
              </div>

              <div className="modal-actions">
                <button className="cancel-btn" onClick={() => setShowAddGoal(false)}>
                  Cancel
                </button>
                <button className="save-btn" onClick={handleAddGoal}>
                  Create Goal
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
