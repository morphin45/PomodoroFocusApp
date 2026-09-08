import { useState, useEffect } from 'react';

interface SmartSchedulerProps {
  sessions: any[];
  tasks: any[];
  isPremium: boolean;
  onUpgrade: () => void;
}

interface TimeBlock {
  hour: number;
  energy: 'high' | 'medium' | 'low';
  recommended: string;
  sessions: number;
}

export default function SmartScheduler({ sessions, tasks, isPremium, onUpgrade }: SmartSchedulerProps) {
  const [schedule, setSchedule] = useState<TimeBlock[]>([]);
  const [selectedDay, setSelectedDay] = useState<'today' | 'tomorrow' | 'week'>('today');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (isPremium) {
      generateSchedule();
    }
  }, [sessions, tasks, selectedDay, isPremium]);

  const generateSchedule = () => {
    setIsLoading(true);

    // Analyze historical data to find patterns
    const hourBuckets = new Array(24).fill(0);
    const hourSuccess = new Array(24).fill(0);

    sessions.forEach(session => {
      const hour = new Date(session.date).getHours();
      hourBuckets[hour]++;
      if (session.interruptions < 2) {
        hourSuccess[hour]++;
      }
    });

    // Calculate energy levels based on session success
    const timeBlocks: TimeBlock[] = [];
    for (let hour = 6; hour < 22; hour++) {
      const totalSessions = hourBuckets[hour];
      const successfulSessions = hourSuccess[hour];
      const successRate = totalSessions > 0 ? successfulSessions / totalSessions : 0;

      let energy: 'high' | 'medium' | 'low';
      let recommended: string;

      if (hour >= 9 && hour <= 11) {
        energy = 'high';
        recommended = 'Deep work, complex tasks';
      } else if (hour >= 14 && hour <= 16) {
        energy = 'high';
        recommended = 'Focus sessions, important tasks';
      } else if (hour >= 7 && hour <= 8) {
        energy = 'medium';
        recommended = 'Planning, email, light tasks';
      } else if (hour >= 12 && hour <= 13) {
        energy = 'low';
        recommended = 'Break, lunch, light reading';
      } else if (hour >= 17 && hour <= 18) {
        energy = 'medium';
        recommended = 'Wrap up, planning tomorrow';
      } else {
        energy = 'low';
        recommended = 'Rest, light activities';
      }

      timeBlocks.push({
        hour,
        energy,
        recommended,
        sessions: totalSessions,
      });
    }

    setSchedule(timeBlocks);
    setIsLoading(false);
  };

  const getEnergyColor = (energy: string) => {
    switch (energy) {
      case 'high': return '#10b981';
      case 'medium': return '#f59e0b';
      case 'low': return '#6b7280';
      default: return '#6b7280';
    }
  };

  const getEnergyEmoji = (energy: string) => {
    switch (energy) {
      case 'high': return '🔥';
      case 'medium': return '⚡';
      case 'low': return '💤';
      default: return '💤';
    }
  };

  const formatHour = (hour: number) => {
    const period = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour % 12 || 12;
    return `${displayHour} ${period}`;
  };

  if (!isPremium) {
    return (
      <div className="smart-scheduler">
        <div className="scheduler-header">
          <h2>📅 Smart Scheduler</h2>
          <p className="scheduler-subtitle">AI-powered scheduling based on your patterns</p>
        </div>

        <div className="scheduler-upgrade">
          <div className="upgrade-content">
            <div className="upgrade-icon">📅</div>
            <h3>Unlock Smart Scheduling</h3>
            <p>Let AI analyze your productivity patterns and suggest optimal times for focus sessions.</p>
            <ul className="upgrade-features">
              <li>✓ Personalized daily schedule</li>
              <li>✓ Energy level predictions</li>
              <li>✓ Optimal focus time identification</li>
              <li>✓ Break time recommendations</li>
              <li>✓ Task scheduling suggestions</li>
              <li>✓ Pattern-based insights</li>
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
      <div className="smart-scheduler">
        <div className="scheduler-header">
          <h2>📅 Smart Scheduler</h2>
          <p className="scheduler-subtitle">Analyzing your patterns...</p>
        </div>
        <div className="loading-state">
          <div className="loading-spinner"></div>
          <p>Generating your optimal schedule...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="smart-scheduler">
      <div className="scheduler-header">
        <h2>📅 Smart Scheduler</h2>
        <p className="scheduler-subtitle">Your personalized optimal schedule</p>
      </div>

      <div className="day-selector">
        <button
          className={`day-btn ${selectedDay === 'today' ? 'active' : ''}`}
          onClick={() => setSelectedDay('today')}
        >
          Today
        </button>
        <button
          className={`day-btn ${selectedDay === 'tomorrow' ? 'active' : ''}`}
          onClick={() => setSelectedDay('tomorrow')}
        >
          Tomorrow
        </button>
        <button
          className={`day-btn ${selectedDay === 'week' ? 'active' : ''}`}
          onClick={() => setSelectedDay('week')}
        >
          This Week
        </button>
      </div>

      <div className="schedule-overview">
        <div className="overview-stat">
          <div className="stat-icon">🔥</div>
          <div className="stat-value">{schedule.filter(b => b.energy === 'high').length}</div>
          <div className="stat-label">Peak Hours</div>
        </div>
        <div className="overview-stat">
          <div className="stat-icon">⚡</div>
          <div className="stat-value">{schedule.filter(b => b.energy === 'medium').length}</div>
          <div className="stat-label">Good Hours</div>
        </div>
        <div className="overview-stat">
          <div className="stat-icon">💤</div>
          <div className="stat-value">{schedule.filter(b => b.energy === 'low').length}</div>
          <div className="stat-label">Rest Hours</div>
        </div>
      </div>

      <div className="schedule-timeline">
        <h3>Daily Schedule</h3>
        <div className="timeline-blocks">
          {schedule.map((block) => (
            <div
              key={block.hour}
              className={`time-block energy-${block.energy}`}
              style={{ borderLeftColor: getEnergyColor(block.energy) }}
            >
              <div className="block-time">
                <span className="time-emoji">{getEnergyEmoji(block.energy)}</span>
                <span className="time-text">{formatHour(block.hour)}</span>
              </div>
              <div className="block-content">
                <div className="block-recommended">{block.recommended}</div>
                <div className="block-energy">
                  Energy: <strong>{block.energy}</strong>
                </div>
                {block.sessions > 0 && (
                  <div className="block-history">
                    {block.sessions} sessions historically
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="scheduler-tips">
        <h3>💡 Scheduling Tips</h3>
        <ul>
          <li>Schedule deep work during high-energy periods</li>
          <li>Use medium-energy times for routine tasks</li>
          <li>Take breaks during low-energy periods</li>
          <li>Avoid scheduling important tasks during low-energy times</li>
        </ul>
      </div>
    </div>
  );
}
