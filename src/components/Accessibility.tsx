import { useState, useEffect } from 'react';

interface AccessibilitySettings {
  highContrast: boolean;
  reducedMotion: boolean;
  largeText: boolean;
  screenReader: boolean;
  keyboardNav: boolean;
}

interface AccessibilityProps {
  settings: AccessibilitySettings;
  onUpdateSettings: (settings: AccessibilitySettings) => void;
}

export default function Accessibility({
  settings,
  onUpdateSettings,
}: AccessibilityProps) {
  const [testMode, setTestMode] = useState<string | null>(null);

  useEffect(() => {
    // Apply settings to document
    document.body.classList.toggle('high-contrast', settings.highContrast);
    document.body.classList.toggle('reduced-motion', settings.reducedMotion);
    document.body.classList.toggle('large-text', settings.largeText);
  }, [settings]);

  const handleToggle = (key: keyof AccessibilitySettings) => {
    onUpdateSettings({
      ...settings,
      [key]: !settings[key],
    });
  };

  return (
    <div className="accessibility">
      <div className="accessibility-header">
        <h2>♿ Accessibility</h2>
        <p className="accessibility-subtitle">
          Customize the app for your needs
        </p>
      </div>

      <div className="accessibility-options">
        <div className="accessibility-option">
          <div className="option-info">
            <div className="option-icon">🔲</div>
            <div className="option-content">
              <div className="option-title">High Contrast</div>
              <div className="option-description">
                Increase contrast for better visibility
              </div>
            </div>
          </div>
          <label className="toggle-switch">
            <input
              type="checkbox"
              checked={settings.highContrast}
              onChange={() => handleToggle('highContrast')}
            />
            <span className="toggle-slider"></span>
          </label>
        </div>

        <div className="accessibility-option">
          <div className="option-info">
            <div className="option-icon">⏸️</div>
            <div className="option-content">
              <div className="option-title">Reduced Motion</div>
              <div className="option-description">
                Minimize animations and transitions
              </div>
            </div>
          </div>
          <label className="toggle-switch">
            <input
              type="checkbox"
              checked={settings.reducedMotion}
              onChange={() => handleToggle('reducedMotion')}
            />
            <span className="toggle-slider"></span>
          </label>
        </div>

        <div className="accessibility-option">
          <div className="option-info">
            <div className="option-icon">🔤</div>
            <div className="option-content">
              <div className="option-title">Large Text</div>
              <div className="option-description">
                Increase text size for better readability
              </div>
            </div>
          </div>
          <label className="toggle-switch">
            <input
              type="checkbox"
              checked={settings.largeText}
              onChange={() => handleToggle('largeText')}
            />
            <span className="toggle-slider"></span>
          </label>
        </div>

        <div className="accessibility-option">
          <div className="option-info">
            <div className="option-icon">🔊</div>
            <div className="option-content">
              <div className="option-title">Screen Reader</div>
              <div className="option-description">
                Optimize for screen reader navigation
              </div>
            </div>
          </div>
          <label className="toggle-switch">
            <input
              type="checkbox"
              checked={settings.screenReader}
              onChange={() => handleToggle('screenReader')}
            />
            <span className="toggle-slider"></span>
          </label>
        </div>

        <div className="accessibility-option">
          <div className="option-info">
            <div className="option-icon">⌨️</div>
            <div className="option-content">
              <div className="option-title">Keyboard Navigation</div>
              <div className="option-description">
                Enhanced keyboard shortcuts and focus indicators
              </div>
            </div>
          </div>
          <label className="toggle-switch">
            <input
              type="checkbox"
              checked={settings.keyboardNav}
              onChange={() => handleToggle('keyboardNav')}
            />
            <span className="toggle-slider"></span>
          </label>
        </div>
      </div>

      <div className="accessibility-preview">
        <h3>Preview</h3>
        <div className="preview-buttons">
          <button
            className="preview-btn"
            onClick={() => setTestMode('high-contrast')}
          >
            Test High Contrast
          </button>
          <button
            className="preview-btn"
            onClick={() => setTestMode('large-text')}
          >
            Test Large Text
          </button>
          <button
            className="preview-btn"
            onClick={() => setTestMode(null)}
          >
            Reset
          </button>
        </div>
      </div>

      <div className="accessibility-help">
        <h3>Keyboard Shortcuts</h3>
        <div className="shortcuts-list">
          <div className="shortcut-item">
            <kbd>Space</kbd>
            <span>Start/Pause timer</span>
          </div>
          <div className="shortcut-item">
            <kbd>R</kbd>
            <span>Reset timer</span>
          </div>
          <div className="shortcut-item">
            <kbd>S</kbd>
            <span>Skip session</span>
          </div>
          <div className="shortcut-item">
            <kbd>D</kbd>
            <span>Toggle dark mode</span>
          </div>
          <div className="shortcut-item">
            <kbd>?</kbd>
            <span>Show shortcuts</span>
          </div>
        </div>
      </div>
    </div>
  );
}
