import { useState, useEffect } from 'react';

interface AIRecommendationsProps {
  sessions: any[];
  dailyStats: any[];
  currentStreak: number;
  tasks: any[];
  isPremium: boolean;
  onUpgrade: () => void;
}

interface Recommendation {
  id: string;
  type: 'focus' | 'break' | 'schedule' | 'productivity';
  title: string;
  description: string;
  icon: string;
  priority: 'high' | 'medium' | 'low';
  actionable: boolean;
}

export default function AIRecommendations({
  sessions,
  dailyStats,
  currentStreak,
  tasks,
  isPremium,
  onUpgrade,
}: AIRecommendationsProps) {
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (isPremium) {
      generateRecommendations();
    }
  }, [sessions, dailyStats, currentStreak, tasks, isPremium]);

  const generateRecommendations = () => {
    setIsLoading(true);
    
    const recs: Recommendation[] = [];

    // Analyze session patterns
    const recentSessions = sessions.slice(-10);
    const avgDuration = recentSessions.length > 0
      ? recentSessions.reduce((sum, s) => sum + s.duration, 0) / recentSessions.length
      : 0;

    const avgInterruptions = recentSessions.length > 0
      ? recentSessions.reduce((sum, s) => sum + (s.interruptions || 0), 0) / recentSessions.length
      : 0;

    // Focus recommendations
    if (avgInterruptions > 2) {
      recs.push({
        id: '1',
        type: 'focus',
        title: 'Reduce Interruptions',
        description: 'Your average interruptions per session is high. Try using Focus Mode to block distractions.',
        icon: '🎯',
        priority: 'high',
        actionable: true,
      });
    }

    if (avgDuration < 20 * 60) {
      recs.push({
        id: '2',
        type: 'focus',
        title: 'Extend Focus Sessions',
        description: 'Your sessions are shorter than optimal. Try extending to 25 minutes for better flow.',
        icon: '⏱️',
        priority: 'medium',
        actionable: true,
      });
    }

    // Schedule recommendations
    const hourBuckets = new Array(24).fill(0);
    sessions.forEach(session => {
      const hour = new Date(session.date).getHours();
      hourBuckets[hour]++;
    });

    const peakHour = hourBuckets.indexOf(Math.max(...hourBuckets));
    if (peakHour >= 0) {
      recs.push({
        id: '3',
        type: 'schedule',
        title: 'Optimal Focus Time',
        description: `Your most productive hour is ${peakHour}:00. Schedule important tasks during this time.`,
        icon: '📅',
        priority: 'high',
        actionable: false,
      });
    }

    // Break recommendations
    if (currentStreak >= 3) {
      recs.push({
        id: '4',
        type: 'break',
        title: 'Take Quality Breaks',
        description: 'Great streak! Make sure to take proper breaks to maintain this momentum.',
        icon: '☕',
        priority: 'medium',
        actionable: false,
      });
    }

    // Productivity recommendations
    const completedTasks = tasks.filter(t => t.done).length;
    const totalTasks = tasks.length;
    const completionRate = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;

    if (completionRate < 50 && totalTasks > 5) {
      recs.push({
        id: '5',
        type: 'productivity',
        title: 'Improve Task Completion',
        description: 'Your task completion rate is low. Try breaking large tasks into smaller, manageable chunks.',
        icon: '📊',
        priority: 'high',
        actionable: true,
      });
    }

    // Streak recommendations
    if (currentStreak === 0) {
      recs.push({
        id: '6',
        type: 'productivity',
        title: 'Start Your Streak',
        description: 'Complete one focus session today to start building your streak!',
        icon: '🔥',
        priority: 'high',
        actionable: true,
      });
    } else if (currentStreak >= 7) {
      recs.push({
        id: '7',
        type: 'productivity',
        title: 'Amazing Streak!',
        description: `You're on a ${currentStreak}-day streak! Keep it going to reach new heights.`,
        icon: '🏆',
        priority: 'low',
        actionable: false,
      });
    }

    // Daily stats analysis
    const todayStats = dailyStats.find(s => s.date === new Date().toISOString().split('T')[0]);
    if (todayStats && todayStats.sessions >= 4) {
      recs.push({
        id: '8',
        type: 'productivity',
        title: 'Excellent Daily Performance',
        description: 'You\'ve completed 4+ sessions today. Consider taking a longer break or calling it a day.',
        icon: '⭐',
        priority: 'low',
        actionable: false,
      });
    }

    setRecommendations(recs);
    setIsLoading(false);
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return '#ef4444';
      case 'medium': return '#f59e0b';
      case 'low': return '#10b981';
      default: return '#6b7280';
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'focus': return 'Focus';
      case 'break': return 'Break';
      case 'schedule': return 'Schedule';
      case 'productivity': return 'Productivity';
      default: return type;
    }
  };

  if (!isPremium) {
    return (
      <div className="ai-recommendations">
        <div className="recommendations-header">
          <h2>🤖 AI Recommendations</h2>
          <p className="recommendations-subtitle">Smart insights powered by your data</p>
        </div>

        <div className="recommendations-upgrade">
          <div className="upgrade-content">
            <div className="upgrade-icon">🤖</div>
            <h3>Unlock AI-Powered Insights</h3>
            <p>Get personalized recommendations based on your focus patterns, productivity trends, and work habits.</p>
            <ul className="upgrade-features">
              <li>✓ Smart focus time optimization</li>
              <li>✓ Interruption reduction tips</li>
              <li>✓ Break scheduling advice</li>
              <li>✓ Productivity pattern analysis</li>
              <li>✓ Streak maintenance tips</li>
              <li>✓ Task completion strategies</li>
            </ul>
            <button className="upgrade-btn" onClick={onUpgrade}>
              Upgrade to Premium
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="ai-recommendations">
        <div className="recommendations-header">
          <h2>🤖 AI Recommendations</h2>
          <p className="recommendations-subtitle">Analyzing your patterns...</p>
        </div>
        <div className="loading-state">
          <div className="loading-spinner"></div>
          <p>Generating personalized recommendations...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="ai-recommendations">
      <div className="recommendations-header">
        <h2>🤖 AI Recommendations</h2>
        <p className="recommendations-subtitle">
          {recommendations.length} personalized insights based on your data
        </p>
      </div>

      <div className="recommendations-list">
        {recommendations.length === 0 ? (
          <div className="empty-recommendations">
            <p>No recommendations yet. Keep using the app to get personalized insights!</p>
          </div>
        ) : (
          recommendations.map(rec => (
            <div
              key={rec.id}
              className={`recommendation-card priority-${rec.priority}`}
              style={{ borderLeftColor: getPriorityColor(rec.priority) }}
            >
              <div className="rec-header">
                <span className="rec-icon">{rec.icon}</span>
                <div className="rec-info">
                  <div className="rec-title">{rec.title}</div>
                  <div className="rec-type">{getTypeLabel(rec.type)}</div>
                </div>
                <div
                  className="rec-priority"
                  style={{ background: getPriorityColor(rec.priority) }}
                >
                  {rec.priority}
                </div>
              </div>
              <div className="rec-description">{rec.description}</div>
              {rec.actionable && (
                <button className="rec-action-btn">Take Action</button>
              )}
            </div>
          ))
        )}
      </div>

      <div className="recommendations-footer">
        <p>💡 Recommendations update automatically based on your usage patterns</p>
      </div>
    </div>
  );
}
