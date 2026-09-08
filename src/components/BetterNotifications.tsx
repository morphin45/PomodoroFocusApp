import { useState, useEffect } from 'react';

interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'success' | 'warning' | 'info';
  timestamp: number;
  snoozed?: boolean;
}

interface BetterNotificationsProps {
  notifications: Notification[];
  onDismiss: (id: string) => void;
  onSnooze: (id: string, minutes: number) => void;
}

export default function BetterNotifications({
  notifications,
  onDismiss,
  onSnooze,
}: BetterNotificationsProps) {
  const [showHistory, setShowHistory] = useState(false);

  const activeNotifications = notifications.filter((n) => !n.snoozed);
  const snoozedNotifications = notifications.filter((n) => n.snoozed);

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'success':
        return '✅';
      case 'warning':
        return '⚠️';
      case 'info':
        return 'ℹ️';
      default:
        return '🔔';
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'success':
        return '#10b981';
      case 'warning':
        return '#f59e0b';
      case 'info':
        return '#3b82f6';
      default:
        return '#6b7280';
    }
  };

  const formatTime = (timestamp: number) => {
    const diff = Date.now() - timestamp;
    const minutes = Math.floor(diff / 60000);
    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    return `${days}d ago`;
  };

  return (
    <div className="better-notifications">
      <div className="notifications-header">
        <h2>🔔 Notifications</h2>
        <button
          className="history-toggle"
          onClick={() => setShowHistory(!showHistory)}
        >
          {showHistory ? 'Active' : 'History'} ({showHistory ? snoozedNotifications.length : activeNotifications.length})
        </button>
      </div>

      <div className="notifications-list">
        {(showHistory ? snoozedNotifications : activeNotifications).length === 0 ? (
          <div className="notifications-empty">
            <p>{showHistory ? 'No snoozed notifications' : 'No active notifications'}</p>
          </div>
        ) : (
          (showHistory ? snoozedNotifications : activeNotifications).map((notification) => (
            <div
              key={notification.id}
              className={`notification-item ${notification.snoozed ? 'snoozed' : ''}`}
              style={{
                '--notification-color': getTypeColor(notification.type),
              } as React.CSSProperties}
            >
              <div className="notification-icon">
                {getTypeIcon(notification.type)}
              </div>
              <div className="notification-content">
                <div className="notification-title">{notification.title}</div>
                <div className="notification-message">{notification.message}</div>
                <div className="notification-time">{formatTime(notification.timestamp)}</div>
              </div>
              <div className="notification-actions">
                {!notification.snoozed && (
                  <>
                    <button
                      className="snooze-btn"
                      onClick={() => onSnooze(notification.id, 5)}
                      title="Snooze 5 minutes"
                    >
                      5m
                    </button>
                    <button
                      className="snooze-btn"
                      onClick={() => onSnooze(notification.id, 15)}
                      title="Snooze 15 minutes"
                    >
                      15m
                    </button>
                    <button
                      className="dismiss-btn"
                      onClick={() => onDismiss(notification.id)}
                    >
                      ✕
                    </button>
                  </>
                )}
                {notification.snoozed && (
                  <span className="snoozed-badge">Snoozed</span>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
