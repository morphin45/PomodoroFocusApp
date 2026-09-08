import { useState, useEffect } from 'react';

interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  requirement: number;
  type: 'sessions' | 'streak' | 'focus_minutes' | 'tasks_completed';
  unlocked: boolean;
  unlockedAt?: string;
  premium?: boolean;
}

interface AchievementSystemProps {
  sessions: number;
  currentStreak: number;
  focusMinutes: number;
  tasksCompleted: number;
  isPremium: boolean;
}

export default function AchievementSystem({
  sessions,
  currentStreak,
  focusMinutes,
  tasksCompleted,
  isPremium,
}: AchievementSystemProps) {
  const [achievements, setAchievements] = useState<Achievement[]>(() => {
    const saved = localStorage.getItem('pomodoroAchievements');
    if (saved) {
      return JSON.parse(saved);
    }
    return [
      // Free achievements
      { id: 'first_session', title: 'First Focus', description: 'Complete your first pomodoro session', icon: '🎯', requirement: 1, type: 'sessions', unlocked: false },
      { id: 'five_sessions', title: 'Getting Started', description: 'Complete 5 pomodoro sessions', icon: '⭐', requirement: 5, type: 'sessions', unlocked: false },
      { id: 'ten_sessions', title: 'Focused Mind', description: 'Complete 10 pomodoro sessions', icon: '🧠', requirement: 10, type: 'sessions', unlocked: false },
      { id: 'twenty_five_sessions', title: 'Productivity Pro', description: 'Complete 25 pomodoro sessions', icon: '🏆', requirement: 25, type: 'sessions', unlocked: false },
      { id: 'fifty_sessions', title: 'Focus Master', description: 'Complete 50 pomodoro sessions', icon: '👑', requirement: 50, type: 'sessions', unlocked: false },
      
      { id: 'three_day_streak', title: 'Consistency King', description: 'Maintain a 3-day streak', icon: '🔥', requirement: 3, type: 'streak', unlocked: false },
      { id: 'seven_day_streak', title: 'Week Warrior', description: 'Maintain a 7-day streak', icon: '⚡', requirement: 7, type: 'streak', unlocked: false },
      
      { id: 'hour_focus', title: 'Hour Power', description: 'Accumulate 60 minutes of focus time', icon: '⏰', requirement: 60, type: 'focus_minutes', unlocked: false },
      { id: 'five_hour_focus', title: 'Deep Work', description: 'Accumulate 5 hours of focus time', icon: '💪', requirement: 300, type: 'focus_minutes', unlocked: false },
      
      { id: 'first_task', title: 'Task Master', description: 'Complete your first task', icon: '✅', requirement: 1, type: 'tasks_completed', unlocked: false },
      { id: 'ten_tasks', title: 'Task Crusher', description: 'Complete 10 tasks', icon: '🎯', requirement: 10, type: 'tasks_completed', unlocked: false },
      
      // Premium achievements
      { id: 'hundred_sessions', title: 'Centurion', description: 'Complete 100 pomodoro sessions', icon: '💎', requirement: 100, type: 'sessions', unlocked: false, premium: true },
      { id: 'thirty_day_streak', title: 'Monthly Master', description: 'Maintain a 30-day streak', icon: '🌟', requirement: 30, type: 'streak', unlocked: false, premium: true },
      { id: 'ten_hour_focus', title: 'Focus Legend', description: 'Accumulate 10 hours of focus time', icon: '🏅', requirement: 600, type: 'focus_minutes', unlocked: false, premium: true },
      { id: 'fifty_tasks', title: 'Task Titan', description: 'Complete 50 tasks', icon: '🚀', requirement: 50, type: 'tasks_completed', unlocked: false, premium: true },
    ];
  });

  const [newlyUnlocked, setNewlyUnlocked] = useState<Achievement | null>(null);

  // Check for new achievements
  useEffect(() => {
    const updated = achievements.map(achievement => {
      if (achievement.unlocked) return achievement;
      
      let currentValue = 0;
      switch (achievement.type) {
        case 'sessions':
          currentValue = sessions;
          break;
        case 'streak':
          currentValue = currentStreak;
          break;
        case 'focus_minutes':
          currentValue = focusMinutes;
          break;
        case 'tasks_completed':
          currentValue = tasksCompleted;
          break;
      }
      
      if (currentValue >= achievement.requirement) {
        const unlocked = { ...achievement, unlocked: true, unlockedAt: new Date().toISOString() };
        if (!newlyUnlocked) {
          setNewlyUnlocked(unlocked);
          setTimeout(() => setNewlyUnlocked(null), 3000);
        }
        return unlocked;
      }
      
      return achievement;
    });
    
    setAchievements(updated);
    localStorage.setItem('pomodoroAchievements', JSON.stringify(updated));
  }, [sessions, currentStreak, focusMinutes, tasksCompleted]);

  const unlockedCount = achievements.filter(a => a.unlocked).length;
  const totalCount = achievements.length;
  const progress = (unlockedCount / totalCount) * 100;

  return (
    <div className="achievement-system">
      {/* Achievement notification */}
      {newlyUnlocked && (
        <div className="achievement-notification">
          <div className="achievement-notification-content">
            <div className="achievement-notification-icon">{newlyUnlocked.icon}</div>
            <div className="achievement-notification-text">
              <div className="achievement-notification-title">Achievement Unlocked!</div>
              <div className="achievement-notification-name">{newlyUnlocked.title}</div>
            </div>
          </div>
        </div>
      )}

      <div className="achievement-header">
        <h2>Achievements</h2>
        <div className="achievement-progress">
          <span className="achievement-count">{unlockedCount}/{totalCount}</span>
          <div className="achievement-progress-bar">
            <div className="achievement-progress-fill" style={{ width: `${progress}%` }} />
          </div>
        </div>
      </div>

      <div className="achievement-grid">
        {achievements.map(achievement => (
          <div
            key={achievement.id}
            className={`achievement-card ${achievement.unlocked ? 'unlocked' : 'locked'} ${achievement.premium && !isPremium ? 'premium-locked' : ''}`}
          >
            {achievement.premium && !isPremium && (
              <div className="premium-badge">PRO</div>
            )}
            <div className="achievement-icon">
              {achievement.unlocked ? achievement.icon : '🔒'}
            </div>
            <div className="achievement-info">
              <div className="achievement-title">{achievement.title}</div>
              <div className="achievement-description">{achievement.description}</div>
              {!achievement.unlocked && (
                <div className="achievement-requirement">
                  {achievement.type === 'sessions' && `${sessions}/${achievement.requirement} sessions`}
                  {achievement.type === 'streak' && `${currentStreak}/${achievement.requirement} days`}
                  {achievement.type === 'focus_minutes' && `${Math.floor(focusMinutes / 60)}/${Math.floor(achievement.requirement / 60)} hours`}
                  {achievement.type === 'tasks_completed' && `${tasksCompleted}/${achievement.requirement} tasks`}
                </div>
              )}
              {achievement.unlocked && achievement.unlockedAt && (
                <div className="achievement-date">
                  {new Date(achievement.unlockedAt).toLocaleDateString()}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
