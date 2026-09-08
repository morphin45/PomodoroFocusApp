import { type Tier, TIER_CONFIGS } from '../utils/tierSystem';

interface TierBadgeProps {
  tier: Tier;
  onClick?: () => void;
  showUpgrade?: boolean;
}

export default function TierBadge({ tier, onClick, showUpgrade = true }: TierBadgeProps) {
  const config = TIER_CONFIGS[tier];

  return (
    <div className="tier-badge-container" onClick={onClick}>
      <div
        className="tier-badge-premium"
        style={{ background: config.gradient }}
      >
        <span className="badge-icon">{config.icon}</span>
        <span className="badge-name">{config.name}</span>
      </div>
      {showUpgrade && tier !== 'team' && (
        <div className="tier-upgrade-hint">
          Click to upgrade
        </div>
      )}
    </div>
  );
}
