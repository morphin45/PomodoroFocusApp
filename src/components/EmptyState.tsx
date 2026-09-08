interface EmptyStateProps {
  type: 'tasks' | 'sessions' | 'achievements' | 'calendar';
  onAction?: () => void;
}

export default function EmptyState({ type, onAction }: EmptyStateProps) {
  const states = {
    tasks: {
      icon: (
        <svg viewBox="0 0 200 200" className="empty-illustration">
          <circle cx="100" cy="100" r="80" fill="#f0f0f0" />
          <rect x="60" y="70" width="80" height="10" rx="5" fill="#d0d0d0" />
          <rect x="60" y="90" width="60" height="10" rx="5" fill="#d0d0d0" />
          <rect x="60" y="110" width="70" height="10" rx="5" fill="#d0d0d0" />
          <circle cx="50" cy="75" r="6" fill="#e0e0e0" />
          <circle cx="50" cy="95" r="6" fill="#e0e0e0" />
          <circle cx="50" cy="115" r="6" fill="#e0e0e0" />
        </svg>
      ),
      title: 'No tasks yet',
      description: 'Add your first task to get started on your productivity journey!',
      action: 'Add Task',
    },
    sessions: {
      icon: (
        <svg viewBox="0 0 200 200" className="empty-illustration">
          <circle cx="100" cy="100" r="80" fill="#f0f0f0" />
          <circle cx="100" cy="100" r="50" fill="none" stroke="#d0d0d0" strokeWidth="8" />
          <line x1="100" y1="100" x2="100" y2="70" stroke="#d0d0d0" strokeWidth="4" strokeLinecap="round" />
          <line x1="100" y1="100" x2="120" y2="100" stroke="#d0d0d0" strokeWidth="4" strokeLinecap="round" />
          <circle cx="100" cy="100" r="4" fill="#d0d0d0" />
        </svg>
      ),
      title: 'No sessions yet',
      description: 'Start your first pomodoro to begin tracking your focus time!',
      action: 'Start Focus',
    },
    achievements: {
      icon: (
        <svg viewBox="0 0 200 200" className="empty-illustration">
          <circle cx="100" cy="100" r="80" fill="#f0f0f0" />
          <circle cx="100" cy="90" r="30" fill="none" stroke="#d0d0d0" strokeWidth="6" />
          <path d="M 85 120 L 100 140 L 115 120" fill="none" stroke="#d0d0d0" strokeWidth="6" strokeLinecap="round" strokeLinejoin="round" />
          <circle cx="100" cy="90" r="10" fill="#e0e0e0" />
        </svg>
      ),
      title: 'No achievements yet',
      description: 'Complete tasks and maintain streaks to unlock achievements!',
      action: null,
    },
    calendar: {
      icon: (
        <svg viewBox="0 0 200 200" className="empty-illustration">
          <circle cx="100" cy="100" r="80" fill="#f0f0f0" />
          <rect x="60" y="70" width="80" height="70" rx="8" fill="none" stroke="#d0d0d0" strokeWidth="4" />
          <line x1="60" y1="90" x2="140" y2="90" stroke="#d0d0d0" strokeWidth="4" />
          <line x1="80" y1="70" x2="80" y2="60" stroke="#d0d0d0" strokeWidth="4" strokeLinecap="round" />
          <line x1="120" y1="70" x2="120" y2="60" stroke="#d0d0d0" strokeWidth="4" strokeLinecap="round" />
          <circle cx="80" cy="110" r="4" fill="#e0e0e0" />
          <circle cx="100" cy="110" r="4" fill="#e0e0e0" />
          <circle cx="120" cy="110" r="4" fill="#e0e0e0" />
          <circle cx="80" cy="125" r="4" fill="#e0e0e0" />
          <circle cx="100" cy="125" r="4" fill="#e0e0e0" />
        </svg>
      ),
      title: 'No activity yet',
      description: 'Your focus calendar will show your productivity patterns over time!',
      action: null,
    },
  };

  const state = states[type];

  return (
    <div className="empty-state-container">
      <div className="empty-illustration-wrapper">{state.icon}</div>
      <h3 className="empty-title">{state.title}</h3>
      <p className="empty-description">{state.description}</p>
      {state.action && onAction && (
        <button className="empty-action-btn" onClick={onAction}>
          {state.action}
        </button>
      )}
    </div>
  );
}
