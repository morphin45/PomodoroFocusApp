import { useMemo } from 'react';

interface Session {
  id: string;
  date: string;
  mode: string;
  duration: number;
  task: string;
  interruptions: number;
}

interface TimelineViewProps {
  sessions: Session[];
}

export default function TimelineView({ sessions }: TimelineViewProps) {
  const timelineData = useMemo(() => {
    const sortedSessions = [...sessions].sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
    );

    // Group by date
    const grouped = sortedSessions.reduce((acc, session) => {
      const date = new Date(session.date).toLocaleDateString();
      if (!acc[date]) {
        acc[date] = [];
      }
      acc[date].push(session);
      return acc;
    }, {} as Record<string, Session[]>);

    return Object.entries(grouped).slice(0, 7); // Last 7 days
  }, [sessions]);

  const getModeIcon = (mode: string) => {
    switch (mode) {
      case 'focus':
        return '🍅';
      case 'shortBreak':
        return '☕';
      case 'longBreak':
        return '🌴';
      default:
        return '⏸️';
    }
  };

  const getModeColor = (mode: string) => {
    switch (mode) {
      case 'focus':
        return '#ef4444';
      case 'shortBreak':
        return '#10b981';
      case 'longBreak':
        return '#3b82f6';
      default:
        return '#6b7280';
    }
  };

  const totalStats = useMemo(() => {
    const totalSessions = sessions.length;
    const totalMinutes = sessions.reduce((sum, s) => sum + s.duration, 0);
    const totalInterruptions = sessions.reduce((sum, s) => sum + s.interruptions, 0);

    return {
      sessions: totalSessions,
      minutes: Math.round(totalMinutes / 60),
      interruptions: totalInterruptions,
    };
  }, [sessions]);

  return (
    <div className="timeline-view">
      <div className="timeline-header">
        <h2>📊 Timeline View</h2>
        <p className="timeline-subtitle">Visual history of your focus sessions</p>
      </div>

      <div className="timeline-stats">
        <div className="timeline-stat">
          <div className="stat-icon">🍅</div>
          <div className="stat-value">{totalStats.sessions}</div>
          <div className="stat-label">Total Sessions</div>
        </div>
        <div className="timeline-stat">
          <div className="stat-icon">⏱️</div>
          <div className="stat-value">{totalStats.minutes}m</div>
          <div className="stat-label">Total Time</div>
        </div>
        <div className="timeline-stat">
          <div className="stat-icon">⚡</div>
          <div className="stat-value">{totalStats.interruptions}</div>
          <div className="stat-label">Interruptions</div>
        </div>
      </div>

      <div className="timeline-container">
        {timelineData.length === 0 ? (
          <div className="timeline-empty">
            <p>No sessions yet. Start your first pomodoro!</p>
          </div>
        ) : (
          timelineData.map(([date, daySessions]) => (
            <div key={date} className="timeline-day">
              <div className="timeline-date">{date}</div>
              <div className="timeline-sessions">
                {daySessions.map((session) => (
                  <div
                    key={session.id}
                    className="timeline-session"
                    style={{
                      '--session-color': getModeColor(session.mode),
                    } as React.CSSProperties}
                  >
                    <div className="session-marker">
                      <span className="session-icon">{getModeIcon(session.mode)}</span>
                    </div>
                    <div className="session-content">
                      <div className="session-task">
                        {session.task || 'Focus session'}
                      </div>
                      <div className="session-meta">
                        <span className="session-duration">
                          {Math.round(session.duration / 60)}m
                        </span>
                        <span className="session-time">
                          {new Date(session.date).toLocaleTimeString([], {
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </span>
                        {session.interruptions > 0 && (
                          <span className="session-interruptions">
                            ⚡ {session.interruptions}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
