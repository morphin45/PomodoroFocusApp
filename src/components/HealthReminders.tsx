import { useState, useEffect } from 'react';

interface HealthReminder {
  id: string;
  type: 'hydration' | 'posture' | 'eyes' | 'stand';
  title: string;
  description: string;
  icon: string;
  interval: number; // in minutes
  enabled: boolean;
}

export default function HealthReminders() {
  const [reminders, setReminders] = useState<HealthReminder[]>([
    {
      id: '1',
      type: 'hydration',
      title: 'Hydration Reminder',
      description: 'Time to drink some water!',
      icon: '💧',
      interval: 30,
      enabled: true,
    },
    {
      id: '2',
      type: 'posture',
      title: 'Posture Check',
      description: 'Sit up straight and relax your shoulders',
      icon: '🧘',
      interval: 45,
      enabled: true,
    },
    {
      id: '3',
      type: 'eyes',
      title: 'Eye Rest (20-20-20)',
      description: 'Look at something 20 feet away for 20 seconds',
      icon: '👁️',
      interval: 20,
      enabled: true,
    },
    {
      id: '4',
      type: 'stand',
      title: 'Stand Up',
      description: 'Get up and stretch for a minute',
      icon: '🚶',
      interval: 60,
      enabled: false,
    },
  ]);

  const [activeReminder, setActiveReminder] = useState<HealthReminder | null>(null);
  const [notificationCount, setNotificationCount] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      const now = Date.now();
      reminders.forEach((reminder) => {
        if (reminder.enabled) {
          const lastTriggered = localStorage.getItem(`health_reminder_${reminder.id}`);
          const intervalMs = reminder.interval * 60 * 1000;
          
          if (!lastTriggered || now - parseInt(lastTriggered) >= intervalMs) {
            setActiveReminder(reminder);
            setNotificationCount((prev) => prev + 1);
            localStorage.setItem(`health_reminder_${reminder.id}`, now.toString());
            
            // Show browser notification if permitted
            if ('Notification' in window && Notification.permission === 'granted') {
              new Notification(reminder.title, {
                body: reminder.description,
                icon: reminder.icon,
              });
            }
          }
        }
      });
    }, 60000); // Check every minute

    return () => clearInterval(interval);
  }, [reminders]);

  const toggleReminder = (id: string) => {
    setReminders((prev) =>
      prev.map((r) => (r.id === id ? { ...r, enabled: !r.enabled } : r))
    );
  };

  const updateInterval = (id: string, interval: number) => {
    setReminders((prev) =>
      prev.map((r) => (r.id === id ? { ...r, interval } : r))
    );
  };

  const dismissReminder = () => {
    setActiveReminder(null);
  };

  return (
    <div className="health-reminders">
      <div className="health-header">
        <h2>Health Reminders</h2>
        <p className="health-subtitle">Take care of yourself while you work</p>
        {notificationCount > 0 && (
          <div className="notification-badge">{notificationCount}</div>
        )}
      </div>

      {activeReminder && (
        <div className="active-reminder">
          <div className="reminder-icon-large">{activeReminder.icon}</div>
          <h3>{activeReminder.title}</h3>
          <p>{activeReminder.description}</p>
          <button className="dismiss-btn" onClick={dismissReminder}>
            Got it! ✓
          </button>
        </div>
      )}

      <div className="reminders-list">
        {reminders.map((reminder) => (
          <div key={reminder.id} className="reminder-item">
            <div className="reminder-icon">{reminder.icon}</div>
            <div className="reminder-info">
              <h4>{reminder.title}</h4>
              <p>{reminder.description}</p>
              <div className="reminder-interval">
                <label>Every</label>
                <select
                  value={reminder.interval}
                  onChange={(e) => updateInterval(reminder.id, parseInt(e.target.value))}
                >
                  <option value="15">15 min</option>
                  <option value="30">30 min</option>
                  <option value="45">45 min</option>
                  <option value="60">1 hour</option>
                  <option value="90">1.5 hours</option>
                  <option value="120">2 hours</option>
                </select>
              </div>
            </div>
            <label className="toggle-switch">
              <input
                type="checkbox"
                checked={reminder.enabled}
                onChange={() => toggleReminder(reminder.id)}
              />
              <span className="toggle-slider"></span>
            </label>
          </div>
        ))}
      </div>

      <div className="health-tips">
        <h3>💡 Why Health Reminders Matter</h3>
        <ul>
          <li>Prevent eye strain and headaches</li>
          <li>Reduce back and neck pain</li>
          <li>Stay hydrated for better focus</li>
          <li>Improve circulation and energy</li>
          <li>Boost long-term productivity</li>
        </ul>
      </div>
    </div>
  );
}
