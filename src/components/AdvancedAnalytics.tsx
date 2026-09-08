import { useMemo } from 'react';

interface Session {
  id: string;
  date: string;
  mode: string;
  duration: number;
  task?: string;
  interruptions?: number;
}

interface DailyStats {
  date: string;
  sessions: number;
  focusMinutes: number;
  interruptions: number;
}

interface AdvancedAnalyticsProps {
  sessions: Session[];
  dailyStats: DailyStats[];
  isPremium: boolean;
  onUpgrade: () => void;
}

export default function AdvancedAnalytics({
  sessions,
  dailyStats,
  isPremium,
  onUpgrade,
}: AdvancedAnalyticsProps) {
  const analytics = useMemo(() => {
    if (!isPremium) return null;

    const now = new Date();
    const last30Days = dailyStats.filter(stat => {
      const statDate = new Date(stat.date);
      const diffDays = (now.getTime() - statDate.getTime()) / (1000 * 60 * 60 * 24);
      return diffDays <= 30;
    });

    const totalFocusMinutes = last30Days.reduce((sum, stat) => sum + stat.focusMinutes, 0);
    const totalSessions = last30Days.reduce((sum, stat) => sum + stat.sessions, 0);
    const avgSessionsPerDay = totalSessions / 30;
    const totalInterruptions = last30Days.reduce((sum, stat) => sum + stat.interruptions, 0);
    const avgInterruptionsPerSession = totalSessions > 0 ? totalInterruptions / totalSessions : 0;

    // Find peak productivity hours
    const hourBuckets = new Array(24).fill(0);
    sessions.forEach(session => {
      if (session.mode === 'work') {
        const hour = new Date(session.date).getHours();
        hourBuckets[hour]++;
      }
    });
    const peakHour = hourBuckets.indexOf(Math.max(...hourBuckets));

    // Calculate focus score (0-100)
    const focusScore = Math.min(100, Math.round(
      (avgSessionsPerDay * 10) + 
      (totalFocusMinutes / 60) - 
      (avgInterruptionsPerSession * 5)
    ));

    // Weekly comparison
    const thisWeek = last30Days.slice(-7);
    const lastWeek = last30Days.slice(-14, -7);
    const thisWeekSessions = thisWeek.reduce((sum, stat) => sum + stat.sessions, 0);
    const lastWeekSessions = lastWeek.reduce((sum, stat) => sum + stat.sessions, 0);
    const weekOverWeekChange = lastWeekSessions > 0 
      ? ((thisWeekSessions - lastWeekSessions) / lastWeekSessions) * 100 
      : 0;

    // Best performing day
    const bestDay = last30Days.reduce((best, stat) => 
      stat.sessions > (best?.sessions || 0) ? stat : best, 
      last30Days[0]
    );

    return {
      totalFocusMinutes,
      totalSessions,
      avgSessionsPerDay,
      totalInterruptions,
      avgInterruptionsPerSession,
      peakHour,
      focusScore,
      weekOverWeekChange,
      bestDay,
      hourBuckets,
    };
  }, [sessions, dailyStats, isPremium]);

  if (!isPremium) {
    return (
      <div className="analytics-locked">
        <div className="analytics-locked-content">
          <div className="analytics-locked-icon">📊</div>
          <h2>Advanced Analytics</h2>
          <p>Unlock detailed productivity insights, focus patterns, and personalized recommendations</p>
          <ul className="analytics-features">
            <li>✓ 30-day productivity trends</li>
            <li>✓ Peak performance hours analysis</li>
            <li>✓ Focus score calculation</li>
            <li>✓ Interruption patterns</li>
            <li>✓ Week-over-week comparisons</li>
            <li>✓ Best performing days</li>
          </ul>
          <button className="upgrade-btn" onClick={onUpgrade}>
            Unlock with Premium
          </button>
        </div>
      </div>
    );
  }

  if (!analytics) return null;

  const formatHour = (hour: number) => {
    const period = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour % 12 || 12;
    return `${displayHour}${period}`;
  };

  return (
    <div className="advanced-analytics">
      <div className="analytics-header">
        <h2>Advanced Analytics</h2>
        <div className="analytics-period">Last 30 Days</div>
      </div>

      {/* Focus Score */}
      <div className="focus-score-card">
        <div className="focus-score-circle">
          <svg viewBox="0 0 100 100">
            <circle
              cx="50"
              cy="50"
              r="45"
              fill="none"
              stroke="rgba(255,255,255,0.1)"
              strokeWidth="8"
            />
            <circle
              cx="50"
              cy="50"
              r="45"
              fill="none"
              stroke="url(#scoreGradient)"
              strokeWidth="8"
              strokeDasharray={`${(analytics.focusScore / 100) * 283} 283`}
              strokeLinecap="round"
              transform="rotate(-90 50 50)"
            />
            <defs>
              <linearGradient id="scoreGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#f06060" />
                <stop offset="100%" stopColor="#c94040" />
              </linearGradient>
            </defs>
          </svg>
          <div className="focus-score-value">{analytics.focusScore}</div>
        </div>
        <div className="focus-score-info">
          <h3>Focus Score</h3>
          <p>Based on consistency, focus time, and interruptions</p>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="analytics-metrics">
        <div className="metric-card">
          <div className="metric-icon">⏱️</div>
          <div className="metric-value">{Math.floor(analytics.totalFocusMinutes / 60)}h {analytics.totalFocusMinutes % 60}m</div>
          <div className="metric-label">Total Focus Time</div>
        </div>
        <div className="metric-card">
          <div className="metric-icon">🎯</div>
          <div className="metric-value">{analytics.totalSessions}</div>
          <div className="metric-label">Sessions Completed</div>
        </div>
        <div className="metric-card">
          <div className="metric-icon">📈</div>
          <div className="metric-value">{analytics.avgSessionsPerDay.toFixed(1)}</div>
          <div className="metric-label">Avg Sessions/Day</div>
        </div>
        <div className="metric-card">
          <div className="metric-icon">⚡</div>
          <div className="metric-value">{analytics.avgInterruptionsPerSession.toFixed(1)}</div>
          <div className="metric-label">Avg Interruptions</div>
        </div>
      </div>

      {/* Peak Hours */}
      <div className="analytics-section">
        <h3>Peak Productivity Hours</h3>
        <div className="peak-hours-chart">
          {analytics.hourBuckets.map((count, hour) => {
            const maxCount = Math.max(...analytics.hourBuckets);
            const height = maxCount > 0 ? (count / maxCount) * 100 : 0;
            return (
              <div key={hour} className="hour-bar">
                <div
                  className="hour-bar-fill"
                  style={{ height: `${height}%` }}
                  title={`${formatHour(hour)}: ${count} sessions`}
                />
                {hour % 3 === 0 && (
                  <div className="hour-label">{formatHour(hour)}</div>
                )}
              </div>
            );
          })}
        </div>
        <div className="peak-hours-insight">
          <span className="insight-icon">💡</span>
          <span>Your most productive hour is <strong>{formatHour(analytics.peakHour)}</strong></span>
        </div>
      </div>

      {/* Week over Week */}
      <div className="analytics-section">
        <h3>Week-over-Week Performance</h3>
        <div className="wow-comparison">
          <div className="wow-item">
            <div className="wow-label">This Week</div>
            <div className="wow-value">{analytics.weekOverWeekChange >= 0 ? '📈' : '📉'} {Math.abs(analytics.weekOverWeekChange).toFixed(1)}%</div>
          </div>
          <div className="wow-item">
            <div className="wow-label">Best Day</div>
            <div className="wow-value">
              {analytics.bestDay ? new Date(analytics.bestDay.date).toLocaleDateString('en', { weekday: 'short' }) : 'N/A'}
            </div>
          </div>
        </div>
      </div>

      {/* Recommendations */}
      <div className="analytics-section">
        <h3>Personalized Recommendations</h3>
        <div className="recommendations">
          {analytics.avgInterruptionsPerSession > 2 && (
            <div className="recommendation">
              <span className="rec-icon">⚠️</span>
              <div className="rec-content">
                <strong>High interruption rate</strong>
                <p>Try using "Do Not Disturb" mode during focus sessions</p>
              </div>
            </div>
          )}
          {analytics.avgSessionsPerDay < 4 && (
            <div className="recommendation">
              <span className="rec-icon">🎯</span>
              <div className="rec-content">
                <strong>Increase daily sessions</strong>
                <p>Aim for at least 4 sessions per day for optimal productivity</p>
              </div>
            </div>
          )}
          {analytics.focusScore < 60 && (
            <div className="recommendation">
              <span className="rec-icon">💪</span>
              <div className="rec-content">
                <strong>Improve consistency</strong>
                <p>Try to maintain a daily streak to boost your focus score</p>
              </div>
            </div>
          )}
          {analytics.focusScore >= 80 && (
            <div className="recommendation">
              <span className="rec-icon">🏆</span>
              <div className="rec-content">
                <strong>Excellent performance!</strong>
                <p>You're in the top 20% of users. Keep up the great work!</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
