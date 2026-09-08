import { useState } from 'react';

interface QuickActionsProps {
  onStartFocus: () => void;
  onAddTask: () => void;
  onToggleTheme: () => void;
  onShowShortcuts: () => void;
}

export default function QuickActions({
  onStartFocus,
  onAddTask,
  onToggleTheme,
  onShowShortcuts,
}: QuickActionsProps) {
  const [isOpen, setIsOpen] = useState(false);

  const actions = [
    {
      id: 'focus',
      icon: '🍅',
      label: 'Start Focus',
      action: onStartFocus,
      color: '#ef4444',
    },
    {
      id: 'task',
      icon: '✓',
      label: 'Add Task',
      action: onAddTask,
      color: '#10b981',
    },
    {
      id: 'theme',
      icon: '🌓',
      label: 'Toggle Theme',
      action: onToggleTheme,
      color: '#8b5cf6',
    },
    {
      id: 'shortcuts',
      icon: '⌨️',
      label: 'Shortcuts',
      action: onShowShortcuts,
      color: '#f59e0b',
    },
  ];

  return (
    <div className="quick-actions">
      <div className={`quick-actions-menu ${isOpen ? 'open' : ''}`}>
        {actions.map((action, index) => (
          <button
            key={action.id}
            className="quick-action-item"
            onClick={() => {
              action.action();
              setIsOpen(false);
            }}
            style={{
              '--action-color': action.color,
              '--action-delay': `${index * 0.05}s`,
            } as React.CSSProperties}
          >
            <span className="action-icon">{action.icon}</span>
            <span className="action-label">{action.label}</span>
          </button>
        ))}
      </div>

      <button
        className={`quick-actions-fab ${isOpen ? 'open' : ''}`}
        onClick={() => setIsOpen(!isOpen)}
      >
        <span className="fab-icon">{isOpen ? '✕' : '+'}</span>
      </button>
    </div>
  );
}
