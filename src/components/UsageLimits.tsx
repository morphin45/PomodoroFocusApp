import { type Tier, type UsageStats, TIER_CONFIGS } from '../utils/tierSystem';

interface UsageLimitsProps {
  tier: Tier;
  usage: UsageStats;
  onUpgrade: () => void;
}

export default function UsageLimits({ tier, usage, onUpgrade }: UsageLimitsProps) {
  const config = TIER_CONFIGS[tier];
  const limits = config.limits;

  const getUsagePercentage = (current: number, max: number) => {
    if (max >= 999) return 0; // Unlimited
    return Math.min((current / max) * 100, 100);
  };

  const getUsageColor = (percentage: number) => {
    if (percentage >= 90) return '#ef4444';
    if (percentage >= 70) return '#f59e0b';
    return '#10b981';
  };

  const usageItems = [
    {
      label: 'Tasks',
      current: usage.tasks,
      max: limits.maxTasks,
      icon: '📋',
    },
    {
      label: 'Session Notes',
      current: usage.notes,
      max: limits.maxNotes,
      icon: '📝',
    },
    {
      label: 'Goals',
      current: usage.goals,
      max: limits.maxGoals,
      icon: '🎯',
    },
    {
      label: 'Projects',
      current: usage.projects,
      max: limits.maxProjects,
      icon: '📁',
    },
    {
      label: 'Exports (this month)',
      current: usage.exportsThisMonth,
      max: limits.exportsPerMonth,
      icon: '📤',
    },
  ];

  const isNearLimit = usageItems.some(item => {
    const percentage = getUsagePercentage(item.current, item.max);
    return percentage >= 80 && item.max < 999;
  });

  return (
    <div className="usage-limits">
      <div className="usage-header">
        <div className="usage-tier-badge" style={{ background: config.gradient }}>
          <span className="tier-icon">{config.icon}</span>
          <span className="tier-name">{config.name} Plan</span>
        </div>
        {tier !== 'team' && (
          <button className="upgrade-btn-small" onClick={onUpgrade}>
            Upgrade
          </button>
        )}
      </div>

      {isNearLimit && (
        <div className="usage-warning">
          <span className="warning-icon">⚠️</span>
          <span>You're approaching your limits. Upgrade for unlimited access!</span>
        </div>
      )}

      <div className="usage-grid">
        {usageItems.map((item) => {
          const percentage = getUsagePercentage(item.current, item.max);
          const isUnlimited = item.max >= 999;
          const color = getUsageColor(percentage);

          return (
            <div key={item.label} className="usage-item">
              <div className="usage-item-header">
                <span className="usage-icon">{item.icon}</span>
                <span className="usage-label">{item.label}</span>
              </div>
              <div className="usage-bar-container">
                <div className="usage-bar">
                  <div
                    className="usage-bar-fill"
                    style={{
                      width: isUnlimited ? '0%' : `${percentage}%`,
                      background: color,
                    }}
                  />
                </div>
                <div className="usage-numbers">
                  <span className="usage-current">{item.current}</span>
                  <span className="usage-max">
                    {isUnlimited ? '∞' : `/ ${item.max}`}
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {tier !== 'team' && (
        <div className="usage-upgrade-prompt">
          <div className="upgrade-prompt-content">
            <h3>Unlock Unlimited Everything</h3>
            <p>Get unlimited tasks, notes, goals, and more with {tier === 'free' ? 'Pro' : 'Premium'}.</p>
            <button className="upgrade-prompt-btn" onClick={onUpgrade}>
              {tier === 'free' ? 'Upgrade to Pro' : 'Upgrade to Premium'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
