import { useState } from 'react';

type Mode = 'work' | 'shortBreak' | 'longBreak';

interface Session {
  id: string;
  date: string;
  mode: Mode;
  duration: number;
  task: string;
  interruptions: number;
  notes?: string;
  tags?: string[];
}

interface SessionHistoryProps {
  sessions: Session[];
}

export default function SessionHistory({ sessions }: SessionHistoryProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterMode, setFilterMode] = useState<string>('all');
  const [filterTag, setFilterTag] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'date' | 'duration' | 'interruptions'>('date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  const getAllTags = () => {
    const tagSet = new Set<string>();
    sessions.forEach(s => s.tags?.forEach(t => tagSet.add(t)));
    return Array.from(tagSet);
  };

  const filteredAndSortedSessions = sessions
    .filter(session => {
      // Search filter
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        const matchesTask = session.task?.toLowerCase().includes(query);
        const matchesNotes = session.notes?.toLowerCase().includes(query);
        if (!matchesTask && !matchesNotes) return false;
      }

      // Mode filter
      if (filterMode !== 'all' && session.mode !== filterMode) {
        return false;
      }

      // Tag filter
      if (filterTag !== 'all' && !session.tags?.includes(filterTag)) {
        return false;
      }

      return true;
    })
    .sort((a, b) => {
      let comparison = 0;

      if (sortBy === 'date') {
        comparison = new Date(a.date).getTime() - new Date(b.date).getTime();
      } else if (sortBy === 'duration') {
        comparison = a.duration - b.duration;
      } else if (sortBy === 'interruptions') {
        comparison = a.interruptions - b.interruptions;
      }

      return sortOrder === 'asc' ? comparison : -comparison;
    });

  const getTagColor = (tagName: string) => {
    const colors: Record<string, string> = {
      'deep-work': '#3b82f6',
      'creative': '#8b5cf6',
      'learning': '#10b981',
      'admin': '#f59e0b',
      'meeting': '#ef4444',
      'planning': '#06b6d4',
    };
    return colors[tagName] || '#6b7280';
  };

  const getTagIcon = (tagName: string) => {
    const icons: Record<string, string> = {
      'deep-work': '🎯',
      'creative': '🎨',
      'learning': '📚',
      'admin': '📋',
      'meeting': '👥',
      'planning': '📅',
    };
    return icons[tagName] || '🏷️';
  };

  const totalStats = {
    sessions: filteredAndSortedSessions.length,
    focusMinutes: filteredAndSortedSessions
      .filter(s => s.mode === 'work')
      .reduce((sum, s) => sum + s.duration / 60, 0),
    interruptions: filteredAndSortedSessions
      .reduce((sum, s) => sum + s.interruptions, 0),
  };

  return (
    <div className="session-history">
      <div className="history-header">
        <h2>📜 Session History</h2>
        <p className="history-subtitle">Search and filter your past sessions</p>
      </div>

      <div className="history-stats">
        <div className="history-stat">
          <div className="stat-value">{totalStats.sessions}</div>
          <div className="stat-label">Sessions</div>
        </div>
        <div className="history-stat">
          <div className="stat-value">{Math.round(totalStats.focusMinutes)} min</div>
          <div className="stat-label">Focus Time</div>
        </div>
        <div className="history-stat">
          <div className="stat-value">{totalStats.interruptions}</div>
          <div className="stat-label">Interruptions</div>
        </div>
      </div>

      <div className="history-filters">
        <div className="search-box">
          <input
            type="text"
            placeholder="🔍 Search sessions..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="search-input"
          />
        </div>

        <div className="filter-row">
          <select
            className="filter-select"
            value={filterMode}
            onChange={(e) => setFilterMode(e.target.value)}
          >
            <option value="all">All Modes</option>
            <option value="work">Focus</option>
            <option value="shortBreak">Short Break</option>
            <option value="longBreak">Long Break</option>
          </select>

          <select
            className="filter-select"
            value={filterTag}
            onChange={(e) => setFilterTag(e.target.value)}
          >
            <option value="all">All Tags</option>
            {getAllTags().map(tag => (
              <option key={tag} value={tag}>
                {getTagIcon(tag)} {tag}
              </option>
            ))}
          </select>

          <select
            className="filter-select"
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
          >
            <option value="date">Sort by Date</option>
            <option value="duration">Sort by Duration</option>
            <option value="interruptions">Sort by Interruptions</option>
          </select>

          <button
            className="sort-order-btn"
            onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
          >
            {sortOrder === 'desc' ? '↓' : '↑'}
          </button>
        </div>
      </div>

      <div className="history-list">
        {filteredAndSortedSessions.length === 0 ? (
          <div className="empty-history">
            <p>No sessions found</p>
          </div>
        ) : (
          filteredAndSortedSessions.map(session => (
            <div key={session.id} className="history-item">
              <div className="history-item-header">
                <div className="history-mode">
                  {session.mode === 'work' ? '🍅' : session.mode === 'shortBreak' ? '☕' : '🌴'}
                </div>
                <div className="history-task">{session.task || 'Focus session'}</div>
                <div className="history-duration">
                  {Math.round(session.duration / 60)} min
                </div>
              </div>

              <div className="history-item-meta">
                <div className="history-date">
                  {new Date(session.date).toLocaleString()}
                </div>
                {session.interruptions > 0 && (
                  <div className="history-interruptions">
                    ⚡ {session.interruptions}
                  </div>
                )}
              </div>

              {session.tags && session.tags.length > 0 && (
                <div className="history-tags">
                  {session.tags.map(tag => (
                    <span
                      key={tag}
                      className="history-tag"
                      style={{
                        backgroundColor: getTagColor(tag) + '20',
                        color: getTagColor(tag),
                      }}
                    >
                      {getTagIcon(tag)} {tag}
                    </span>
                  ))}
                </div>
              )}

              {session.notes && (
                <div className="history-notes">
                  {session.notes.substring(0, 150)}
                  {session.notes.length > 150 ? '...' : ''}
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
