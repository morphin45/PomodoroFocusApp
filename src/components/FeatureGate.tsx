import { type Tier, TIER_CONFIGS } from '../utils/tierSystem';

interface FeatureGateProps {
  feature: string;
  description: string;
  icon: string;
  requiredTier: Tier;
  currentTier: Tier;
  onUpgrade: () => void;
  children?: React.ReactNode;
}

export default function FeatureGate({
  feature,
  description,
  icon,
  requiredTier,
  currentTier,
  onUpgrade,
  children,
}: FeatureGateProps) {
  const tierOrder: Tier[] = ['free', 'pro', 'premium', 'team'];
  const currentIndex = tierOrder.indexOf(currentTier);
  const requiredIndex = tierOrder.indexOf(requiredTier);
  const isLocked = currentIndex < requiredIndex;

  if (!isLocked) {
    return <>{children}</>;
  }

  const requiredConfig = TIER_CONFIGS[requiredTier];

  return (
    <div className="feature-gate">
      <div className="feature-gate-content">
        <div className="feature-gate-icon">{icon}</div>
        <h3>{feature}</h3>
        <p>{description}</p>
        <div className="feature-gate-cta">
          <div className="required-tier">
            <span className="tier-icon">{requiredConfig.icon}</span>
            <span>Available in {requiredConfig.name}</span>
          </div>
          <button className="feature-gate-btn" onClick={onUpgrade}>
            Upgrade to {requiredConfig.name}
          </button>
        </div>
      </div>
      <div className="feature-gate-blur">
        {children}
      </div>
    </div>
  );
}
