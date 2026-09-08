import { useEffect } from 'react';

interface KeyboardShortcutsProps {
  onStart: () => void;
  onPause: () => void;
  onReset: () => void;
  onSkip: () => void;
  onToggleTheme: () => void;
  isRunning: boolean;
}

export default function useKeyboardShortcuts({
  onStart,
  onPause,
  onReset,
  onSkip,
  onToggleTheme,
  isRunning,
}: KeyboardShortcutsProps) {
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      // Don't trigger shortcuts when typing in inputs
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return;
      }

      switch (e.key.toLowerCase()) {
        case ' ':
          e.preventDefault();
          if (isRunning) {
            onPause();
          } else {
            onStart();
          }
          break;
        case 'r':
          if (!e.ctrlKey && !e.metaKey) {
            e.preventDefault();
            onReset();
          }
          break;
        case 's':
          if (!e.ctrlKey && !e.metaKey) {
            e.preventDefault();
            onSkip();
          }
          break;
        case 'd':
          if (!e.ctrlKey && !e.metaKey) {
            e.preventDefault();
            onToggleTheme();
          }
          break;
        case '?':
          e.preventDefault();
          // Could open help modal
          console.log('Keyboard shortcuts: Space (start/pause), R (reset), S (skip), D (theme)');
          break;
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [isRunning, onStart, onPause, onReset, onSkip, onToggleTheme]);
}

export const SHORTCUTS = [
  { key: 'Space', action: 'Start/Pause timer', icon: '⏯️' },
  { key: 'R', action: 'Reset timer', icon: '🔄' },
  { key: 'S', action: 'Skip session', icon: '⏭️' },
  { key: 'D', action: 'Toggle dark mode', icon: '🌓' },
  { key: '?', action: 'Show shortcuts', icon: '❓' },
];
