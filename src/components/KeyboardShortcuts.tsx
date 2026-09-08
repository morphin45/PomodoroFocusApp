import { useState, useEffect } from 'react';

interface Shortcut {
  key: string;
  action: string;
  icon: string;
  category: 'timer' | 'navigation' | 'general';
}

const SHORTCUTS: Shortcut[] = [
  { key: 'Space', action: 'Start/Pause timer', icon: '⏯️', category: 'timer' },
  { key: 'R', action: 'Reset timer', icon: '🔄', category: 'timer' },
  { key: 'S', action: 'Skip session', icon: '⏭️', category: 'timer' },
  { key: 'T', action: 'Switch to Timer tab', icon: '⏱️', category: 'navigation' },
  { key: 'K', action: 'Switch to Tasks tab', icon: '✓', category: 'navigation' },
  { key: 'A', action: 'Switch to Analytics tab', icon: '📊', category: 'navigation' },
  { key: 'C', action: 'Switch to Calendar tab', icon: '📅', category: 'navigation' },
  { key: 'D', action: 'Toggle dark mode', icon: '🌓', category: 'general' },
  { key: 'N', action: 'New task', icon: '➕', category: 'general' },
  { key: '?', action: 'Show this help', icon: '❓', category: 'general' },
];

interface KeyboardShortcutsProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function KeyboardShortcuts({ isOpen, onClose }: KeyboardShortcutsProps) {
  const [filter, setFilter] = useState<'all' | 'timer' | 'navigation' | 'general'>('all');

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const filteredShortcuts = filter === 'all' 
    ? SHORTCUTS 
    : SHORTCUTS.filter(s => s.category === filter);

  return (
    <div className="shortcuts-overlay" onClick={onClose}>
      <div className="shortcuts-modal" onClick={(e) => e.stopPropagation()}>
        <div className="shortcuts-header">
          <h2>⌨️ Keyboard Shortcuts</h2>
          <button className="close-btn" onClick={onClose}>
            ✕
          </button>
        </div>

        <div className="shortcuts-filters">
          <button
            className={`filter-btn ${filter === 'all' ? 'active' : ''}`}
            onClick={() => setFilter('all')}
          >
            All
          </button>
          <button
            className={`filter-btn ${filter === 'timer' ? 'active' : ''}`}
            onClick={() => setFilter('timer')}
          >
            Timer
          </button>
          <button
            className={`filter-btn ${filter === 'navigation' ? 'active' : ''}`}
            onClick={() => setFilter('navigation')}
          >
            Navigation
          </button>
          <button
            className={`filter-btn ${filter === 'general' ? 'active' : ''}`}
            onClick={() => setFilter('general')}
          >
            General
          </button>
        </div>

        <div className="shortcuts-list">
          {filteredShortcuts.map((shortcut, index) => (
            <div key={index} className="shortcut-item">
              <div className="shortcut-icon">{shortcut.icon}</div>
              <div className="shortcut-info">
                <div className="shortcut-action">{shortcut.action}</div>
              </div>
              <kbd className="shortcut-key">{shortcut.key}</kbd>
            </div>
          ))}
        </div>

        <div className="shortcuts-footer">
          <p>💡 Pro tip: Press <kbd>?</kbd> anytime to show this help</p>
        </div>
      </div>
    </div>
  );
}

export { SHORTCUTS };
