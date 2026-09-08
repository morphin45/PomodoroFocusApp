import { useState } from 'react';

interface Widget {
  id: string;
  type: 'stats' | 'streak' | 'goals' | 'recent' | 'chart';
  title: string;
  size: 'small' | 'medium' | 'large';
  visible: boolean;
}

interface DashboardWidgetsProps {
  widgets: Widget[];
  onUpdateWidgets: (widgets: Widget[]) => void;
  stats: {
    sessions: number;
    focusMinutes: number;
    streak: number;
    todaySessions: number;
  };
}

export default function DashboardWidgets({
  widgets,
  onUpdateWidgets,
  stats,
}: DashboardWidgetsProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [draggedWidget, setDraggedWidget] = useState<string | null>(null);

  const handleDragStart = (widgetId: string) => {
    setDraggedWidget(widgetId);
  };

  const handleDragOver = (e: React.DragEvent, targetId: string) => {
    e.preventDefault();
    if (!draggedWidget || draggedWidget === targetId) return;

    const newWidgets = [...widgets];
    const draggedIndex = newWidgets.findIndex((w) => w.id === draggedWidget);
    const targetIndex = newWidgets.findIndex((w) => w.id === targetId);

    const [removed] = newWidgets.splice(draggedIndex, 1);
    newWidgets.splice(targetIndex, 0, removed);

    onUpdateWidgets(newWidgets);
  };

  const handleDragEnd = () => {
    setDraggedWidget(null);
  };

  const toggleWidgetVisibility = (widgetId: string) => {
    const newWidgets = widgets.map((w) =>
      w.id === widgetId ? { ...w, visible: !w.visible } : w
    );
    onUpdateWidgets(newWidgets);
  };

  const renderWidget = (widget: Widget) => {
    if (!widget.visible) return null;

    switch (widget.type) {
      case 'stats':
        return (
          <div className="widget-content stats-widget">
            <div className="widget-stat">
              <div className="stat-value">{stats.sessions}</div>
              <div className="stat-label">Total Sessions</div>
            </div>
            <div className="widget-stat">
              <div className="stat-value">{stats.focusMinutes}m</div>
              <div className="stat-label">Focus Time</div>
            </div>
          </div>
        );

      case 'streak':
        return (
          <div className="widget-content streak-widget">
            <div className="streak-display">
              <div className="streak-icon">🔥</div>
              <div className="streak-value">{stats.streak}</div>
              <div className="streak-label">Day Streak</div>
            </div>
          </div>
        );

      case 'goals':
        return (
          <div className="widget-content goals-widget">
            <div className="goals-progress">
              <div className="goal-item">
                <div className="goal-label">Today</div>
                <div className="goal-bar">
                  <div
                    className="goal-fill"
                    style={{ width: `${Math.min((stats.todaySessions / 8) * 100, 100)}%` }}
                  />
                </div>
                <div className="goal-value">{stats.todaySessions}/8</div>
              </div>
            </div>
          </div>
        );

      case 'recent':
        return (
          <div className="widget-content recent-widget">
            <div className="recent-sessions">
              <div className="recent-item">
                <span className="recent-icon">🍅</span>
                <span className="recent-task">Focus session</span>
                <span className="recent-time">2h ago</span>
              </div>
              <div className="recent-item">
                <span className="recent-icon">☕</span>
                <span className="recent-task">Short break</span>
                <span className="recent-time">3h ago</span>
              </div>
            </div>
          </div>
        );

      case 'chart':
        return (
          <div className="widget-content chart-widget">
            <div className="mini-chart">
              {[...Array(7)].map((_, i) => (
                <div key={i} className="chart-bar">
                  <div
                    className="chart-fill"
                    style={{ height: `${Math.random() * 100}%` }}
                  />
                </div>
              ))}
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="dashboard-widgets">
      <div className="widgets-header">
        <h2>🎛️ Dashboard</h2>
        <button
          className="edit-btn"
          onClick={() => setIsEditing(!isEditing)}
        >
          {isEditing ? 'Done' : 'Edit'}
        </button>
      </div>

      <div className="widgets-grid">
        {widgets.map((widget) => (
          <div
            key={widget.id}
            className={`widget widget-${widget.size} ${
              !widget.visible ? 'hidden' : ''
            } ${draggedWidget === widget.id ? 'dragging' : ''}`}
            draggable={isEditing}
            onDragStart={() => handleDragStart(widget.id)}
            onDragOver={(e) => handleDragOver(e, widget.id)}
            onDragEnd={handleDragEnd}
          >
            <div className="widget-header">
              <h3>{widget.title}</h3>
              {isEditing && (
                <button
                  className="toggle-visibility"
                  onClick={() => toggleWidgetVisibility(widget.id)}
                >
                  {widget.visible ? '👁️' : '👁️‍🗨️'}
                </button>
              )}
            </div>
            {renderWidget(widget)}
          </div>
        ))}
      </div>

      {isEditing && (
        <div className="widgets-help">
          <p>💡 Drag widgets to reorder • Click 👁️ to show/hide</p>
        </div>
      )}
    </div>
  );
}
