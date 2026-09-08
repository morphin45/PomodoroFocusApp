import { THEMES, type Theme } from '../themes/themes';

interface ThemeSelectorProps {
  currentTheme: string;
  isPremium: boolean;
  onThemeChange: (themeId: string) => void;
  onUpgrade: () => void;
}

export default function ThemeSelector({ 
  currentTheme, 
  isPremium, 
  onThemeChange,
  onUpgrade 
}: ThemeSelectorProps) {
  const freeThemes = THEMES.filter(t => !t.isPremium);
  const premiumThemes = THEMES.filter(t => t.isPremium);

  const handleThemeClick = (theme: Theme) => {
    if (theme.isPremium && !isPremium) {
      onUpgrade();
      return;
    }
    onThemeChange(theme.id);
  };

  return (
    <div className="theme-selector">
      <div className="theme-header">
        <h2>Themes</h2>
        <p className="theme-subtitle">Personalize your focus experience</p>
      </div>

      <div className="themes-section">
        <h3>Free Themes</h3>
        <div className="themes-grid">
          {freeThemes.map(theme => (
            <button
              key={theme.id}
              className={`theme-card ${currentTheme === theme.id ? 'active' : ''}`}
              onClick={() => handleThemeClick(theme)}
              style={{
                borderColor: currentTheme === theme.id ? theme.colors.primary : undefined,
              }}
            >
              <div 
                className="theme-preview"
                style={{ background: `linear-gradient(135deg, ${theme.colors.primary}, ${theme.colors.primaryDark})` }}
              >
                <span className="theme-icon">{theme.icon}</span>
              </div>
              <div className="theme-info">
                <div className="theme-name">{theme.name}</div>
                <div className="theme-description">{theme.description}</div>
              </div>
              {currentTheme === theme.id && (
                <div className="theme-check">✓</div>
              )}
            </button>
          ))}
        </div>
      </div>

      <div className="themes-section">
        <h3>Premium Themes {!isPremium && <span className="pro-badge">PRO</span>}</h3>
        <div className="themes-grid">
          {premiumThemes.map(theme => (
            <button
              key={theme.id}
              className={`theme-card ${currentTheme === theme.id ? 'active' : ''} ${!isPremium ? 'premium-locked' : ''}`}
              onClick={() => handleThemeClick(theme)}
              style={{
                borderColor: currentTheme === theme.id ? theme.colors.primary : undefined,
              }}
            >
              {!isPremium && <div className="theme-lock">🔒</div>}
              <div 
                className="theme-preview"
                style={{ background: `linear-gradient(135deg, ${theme.colors.primary}, ${theme.colors.primaryDark})` }}
              >
                <span className="theme-icon">{theme.icon}</span>
              </div>
              <div className="theme-info">
                <div className="theme-name">{theme.name}</div>
                <div className="theme-description">{theme.description}</div>
              </div>
              {currentTheme === theme.id && (
                <div className="theme-check">✓</div>
              )}
            </button>
          ))}
        </div>
      </div>

      {!isPremium && (
        <div className="themes-upgrade">
          <p>Unlock 7 more premium themes to match your style</p>
          <button className="upgrade-btn" onClick={onUpgrade}>
            Upgrade to Premium
          </button>
        </div>
      )}
    </div>
  );
}
