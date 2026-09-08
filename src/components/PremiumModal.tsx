import { useState } from 'react';

interface PremiumModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUpgrade: () => void;
}

export default function PremiumModal({ isOpen, onClose, onUpgrade }: PremiumModalProps) {
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('yearly');

  if (!isOpen) return null;

  const monthlyPrice = 4.99;
  const yearlyPrice = 39.99;
  const yearlySavings = ((monthlyPrice * 12 - yearlyPrice) / (monthlyPrice * 12) * 100).toFixed(0);

  return (
    <div className="premium-modal-overlay" onClick={onClose}>
      <div className="premium-modal" onClick={(e) => e.stopPropagation()}>
        <button className="premium-modal-close" onClick={onClose}>
          ✕
        </button>

        <div className="premium-modal-header">
          <div className="premium-icon">✨</div>
          <h1>Upgrade to Premium</h1>
          <p>Unlock your full productivity potential</p>
        </div>

        {/* Billing Toggle */}
        <div className="billing-toggle">
          <button
            className={`billing-option ${billingCycle === 'monthly' ? 'active' : ''}`}
            onClick={() => setBillingCycle('monthly')}
          >
            Monthly
          </button>
          <button
            className={`billing-option ${billingCycle === 'yearly' ? 'active' : ''}`}
            onClick={() => setBillingCycle('yearly')}
          >
            Yearly
            <span className="savings-badge">Save {yearlySavings}%</span>
          </button>
        </div>

        {/* Price */}
        <div className="premium-price">
          <div className="price-amount">
            ${billingCycle === 'monthly' ? monthlyPrice : yearlyPrice}
          </div>
          <div className="price-period">
            /{billingCycle === 'monthly' ? 'month' : 'year'}
          </div>
        </div>

        {/* Features */}
        <div className="premium-features">
          <div className="feature-category">
            <h3>📊 Advanced Analytics</h3>
            <ul>
              <li>✓ 30-day productivity trends</li>
              <li>✓ Peak performance hours analysis</li>
              <li>✓ Focus score calculation</li>
              <li>✓ Interruption patterns</li>
              <li>✓ Week-over-week comparisons</li>
              <li>✓ Personalized recommendations</li>
            </ul>
          </div>

          <div className="feature-category">
            <h3>🎯 Unlimited Productivity</h3>
            <ul>
              <li>✓ Unlimited tasks and projects</li>
              <li>✓ Custom techniques</li>
              <li>✓ 10+ premium themes</li>
              <li>✓ 50+ ambient sounds</li>
              <li>✓ Full history access</li>
              <li>✓ PDF/CSV reports</li>
            </ul>
          </div>

          <div className="feature-category">
            <h3>☁️ Cloud & Sync</h3>
            <ul>
              <li>✓ Sync across all devices</li>
              <li>✓ Automatic backups</li>
              <li>✓ Offline mode</li>
              <li>✓ Priority support</li>
              <li>✓ Early access to features</li>
              <li>✓ Exclusive achievements</li>
            </ul>
          </div>
        </div>

        {/* CTA */}
        <button className="premium-cta" onClick={onUpgrade}>
          Start 7-Day Free Trial
        </button>

        <div className="premium-guarantee">
          <span className="guarantee-icon">🔒</span>
          <div className="guarantee-text">
            <strong>30-day money-back guarantee</strong>
            <p>No questions asked. Cancel anytime.</p>
          </div>
        </div>

        <div className="premium-trust">
          <div className="trust-item">
            <span>⭐⭐⭐⭐⭐</span>
            <span>4.9/5 rating</span>
          </div>
          <div className="trust-item">
            <span>👥</span>
            <span>10,000+ users</span>
          </div>
          <div className="trust-item">
            <span>🔐</span>
            <span>Secure payment</span>
          </div>
        </div>
      </div>
    </div>
  );
}
