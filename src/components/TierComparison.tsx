import { useState } from 'react';
import { TIER_CONFIGS, type Tier, type BillingCycle } from '../utils/tierSystem';

interface TierComparisonProps {
  currentTier: Tier;
  onSelectTier: (tier: Tier, billing: BillingCycle) => void;
  onClose: () => void;
}

export default function TierComparison({ currentTier, onSelectTier, onClose }: TierComparisonProps) {
  const [billing, setBilling] = useState<BillingCycle>('yearly');

  const tiers = [
    TIER_CONFIGS.free,
    TIER_CONFIGS.pro,
    TIER_CONFIGS.premium,
    TIER_CONFIGS.team,
  ];

  const getPrice = (tier: typeof TIER_CONFIGS.free) => {
    if (tier.id === 'free') return 'Free';
    return billing === 'monthly' 
      ? `$${tier.monthlyPrice}` 
      : `$${tier.yearlyPrice}`;
  };

  const getPeriod = (tier: typeof TIER_CONFIGS.free) => {
    if (tier.id === 'free') return 'forever';
    return billing === 'monthly' ? '/month' : '/year';
  };

  const getSavings = (tier: typeof TIER_CONFIGS.free) => {
    if (tier.id === 'free' || billing === 'monthly') return null;
    const monthlyTotal = tier.monthlyPrice * 12;
    const savings = ((monthlyTotal - tier.yearlyPrice) / monthlyTotal * 100).toFixed(0);
    return `Save ${savings}%`;
  };

  return (
    <div className="tier-comparison-overlay" onClick={onClose}>
      <div className="tier-comparison-modal" onClick={(e) => e.stopPropagation()}>
        <button className="tier-modal-close" onClick={onClose}>✕</button>
        
        <div className="tier-modal-header">
          <h1>Choose Your Plan</h1>
          <p>Invest in your productivity. Cancel anytime.</p>
          
          <div className="billing-toggle-premium">
            <button
              className={`billing-option ${billing === 'monthly' ? 'active' : ''}`}
              onClick={() => setBilling('monthly')}
            >
              Monthly
            </button>
            <button
              className={`billing-option ${billing === 'yearly' ? 'active' : ''}`}
              onClick={() => setBilling('yearly')}
            >
              Yearly
              <span className="save-badge">Save up to 37%</span>
            </button>
          </div>
        </div>

        <div className="tier-cards">
          {tiers.map((tier) => {
            const isCurrentTier = tier.id === currentTier;
            const price = getPrice(tier);
            const period = getPeriod(tier);
            const savings = getSavings(tier);

            return (
              <div
                key={tier.id}
                className={`tier-card ${tier.popular ? 'popular' : ''} ${isCurrentTier ? 'current' : ''}`}
                style={{
                  '--tier-color': tier.color,
                  '--tier-gradient': tier.gradient,
                } as React.CSSProperties}
              >
                {tier.badge && (
                  <div className="tier-badge" style={{ background: tier.gradient }}>
                    {tier.badge}
                  </div>
                )}
                {isCurrentTier && (
                  <div className="current-tier-badge">Current Plan</div>
                )}

                <div className="tier-card-header">
                  <div className="tier-icon">{tier.icon}</div>
                  <h2>{tier.name}</h2>
                  <p className="tier-tagline">{tier.tagline}</p>
                </div>

                <div className="tier-pricing">
                  <span className="tier-price">{price}</span>
                  <span className="tier-period">{period}</span>
                  {savings && (
                    <div className="tier-savings">{savings}</div>
                  )}
                </div>

                <button
                  className={`tier-cta ${isCurrentTier ? 'current' : ''}`}
                  onClick={() => !isCurrentTier && onSelectTier(tier.id, billing)}
                  disabled={isCurrentTier}
                  style={isCurrentTier ? {} : { background: tier.gradient }}
                >
                  {isCurrentTier ? '✓ Current Plan' : tier.id === 'free' ? 'Get Started' : 'Upgrade Now'}
                </button>

                <div className="tier-features">
                  {tier.features.map((feature, idx) => (
                    <div key={idx} className="tier-feature">
                      <span className="feature-check">✓</span>
                      <span>{feature}</span>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>

        <div className="tier-modal-footer">
          <div className="trust-badges">
            <div className="trust-badge">
              <span>🔒</span>
              <span>Secure Payment</span>
            </div>
            <div className="trust-badge">
              <span>💯</span>
              <span>30-Day Money Back</span>
            </div>
            <div className="trust-badge">
              <span>⚡</span>
              <span>Instant Access</span>
            </div>
            <div className="trust-badge">
              <span>🚫</span>
              <span>Cancel Anytime</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
