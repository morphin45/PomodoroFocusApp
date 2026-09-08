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

interface SessionNotesProps {
  sessions: Session[];
  onUpdateSession: (sessionId: string, updates: Partial<Session>) => void;
}

const SUGGESTED_TAGS = [
  { name: 'deep-work', color: '#3b82f6', icon: '🎯' },
  { name: 'creative', color: '#8b5cf6', icon: '🎨' },
  { name: 'learning', color: '#10b981', icon: '📚' },
  { name: 'admin', color: '#f59e0b', icon: '📋' },
  { name: 'meeting', color: '#ef4444', icon: '👥' },
  { name: 'planning', color: '#06b6d4', icon: '📅' },
];

export default function SessionNotes({ sessions, onUpdateSession }: SessionNotesProps) {
  const [selectedSession, setSelectedSession] = useState<Session | null>(null);
  const [noteText, setNoteText] = useState('');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [filterTag, setFilterTag] = useState<string>('all');

  const filteredSessions = filterTag === 'all'
    ? sessions
    : sessions.filter(s => s.tags?.includes(filterTag));

  const handleSessionSelect = (session: Session) => {
    setSelectedSession(session);
    setNoteText(session.notes || '');
    setSelectedTags(session.tags || []);
  };

  const handleSaveNote = () => {
    if (selectedSession) {
      onUpdateSession(selectedSession.id, { 
        notes: noteText,
        tags: selectedTags 
      });
      setSelectedSession(null);
      setNoteText('');
      setSelectedTags([]);
    }
  };

  const handleTagToggle = (tagName: string) => {
    setSelectedTags(prev => 
      prev.includes(tagName) 
        ? prev.filter(t => t !== tagName)
        : [...prev, tagName]
    );
  };

  const getTagColor = (tagName: string) => {
    const tag = SUGGESTED_TAGS.find(t => t.name === tagName);
    return tag?.color || '#6b7280';
  };

  const getTagIcon = (tagName: string) => {
    const tag = SUGGESTED_TAGS.find(t => t.name === tagName);
    return tag?.icon || '🏷️';
  };

  const getAllTags = () => {
    const tagSet = new Set<string>();
    sessions.forEach(s => s.tags?.forEach(t => tagSet.add(t)));
    return Array.from(tagSet);
  };

  return (
    <div className="session-notes">
      <div className="notes-header">
        <h2>📝 Session Notes & Tags</h2>
        <p className="notes-subtitle">Add context to your focus sessions</p>
      </div>

      <div className="tag-filters">
        <button
          className={`tag-filter ${filterTag === 'all' ? 'active' : ''}`}
          onClick={() => setFilterTag('all')}
        >
          All Sessions ({sessions.length})
        </button>
        {getAllTags().map(tag => (
          <button
            key={tag}
            className={`tag-filter ${filterTag === tag ? 'active' : ''}`}
            onClick={() => setFilterTag(tag)}
            style={{
              '--tag-color': getTagColor(tag),
            } as React.CSSProperties}
          >
            {getTagIcon(tag)} {tag}
          </button>
        ))}
      </div>

      <div className="sessions-list-notes">
        {filteredSessions.length === 0 ? (
          <div className="empty-notes">
            <p>No sessions found</p>
          </div>
        ) : (
          filteredSessions.slice().reverse().map(session => (
            <div 
              key={session.id} 
              className={`session-note-item ${selectedSession?.id === session.id ? 'selected' : ''}`}
              onClick={() => handleSessionSelect(session)}
            >
              <div className="session-note-header">
                <div className="session-note-task">{session.task || 'Focus session'}</div>
                <div className="session-note-meta">
                  {new Date(session.date).toLocaleDateString()} · {Math.round(session.duration / 60)} min
                </div>
              </div>
              {session.tags && session.tags.length > 0 && (
                <div className="session-note-tags">
                  {session.tags.map(tag => (
                    <span 
                      key={tag} 
                      className="session-tag"
                      style={{ backgroundColor: getTagColor(tag) + '20', color: getTagColor(tag) }}
                    >
                      {getTagIcon(tag)} {tag}
                    </span>
                  ))}
                </div>
              )}
              {session.notes && (
                <div className="session-note-preview">
                  {session.notes.substring(0, 100)}{session.notes.length > 100 ? '...' : ''}
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {selectedSession && (
        <div className="note-editor-overlay" onClick={() => setSelectedSession(null)}>
          <div className="note-editor" onClick={(e) => e.stopPropagation()}>
            <div className="note-editor-header">
              <h3>Edit Session Notes</h3>
              <button className="close-editor" onClick={() => setSelectedSession(null)}>✕</button>
            </div>

            <div className="note-editor-content">
              <div className="note-session-info">
                <div className="info-task">{selectedSession.task || 'Focus session'}</div>
                <div className="info-meta">
                  {new Date(selectedSession.date).toLocaleString()} · {Math.round(selectedSession.duration / 60)} min
                </div>
              </div>

              <div className="note-tags-section">
                <label>Tags</label>
                <div className="tags-grid">
                  {SUGGESTED_TAGS.map(tag => (
                    <button
                      key={tag.name}
                      className={`tag-button ${selectedTags.includes(tag.name) ? 'selected' : ''}`}
                      onClick={() => handleTagToggle(tag.name)}
                      style={{
                        '--tag-color': tag.color,
                      } as React.CSSProperties}
                    >
                      {tag.icon} {tag.name}
                    </button>
                  ))}
                </div>
              </div>

              <div className="note-text-section">
                <label>Notes</label>
                <textarea
                  className="note-textarea"
                  value={noteText}
                  onChange={(e) => setNoteText(e.target.value)}
                  placeholder="What did you work on? Any insights or learnings?"
                  rows={6}
                />
              </div>

              <div className="note-editor-actions">
                <button className="cancel-btn" onClick={() => setSelectedSession(null)}>
                  Cancel
                </button>
                <button className="save-btn" onClick={handleSaveNote}>
                  Save Notes
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
