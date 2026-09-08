import { useState, useEffect } from 'react';

interface OnboardingProps {
  onComplete: () => void;
  userName: string;
  onUserNameChange: (name: string) => void;
}

export default function Onboarding({ onComplete, userName, onUserNameChange }: OnboardingProps) {
  const [step, setStep] = useState(0);
  const [name, setName] = useState(userName);

  const steps = [
    {
      title: 'Welcome to Pomodoro Focus!',
      subtitle: 'Your premium productivity companion',
      icon: '🍅',
      content: (
        <div className="onboarding-content">
          <p>Transform your work habits with the scientifically-proven Pomodoro Technique.</p>
          <div className="feature-highlights">
            <div className="feature-item">
              <span className="feature-icon">🎯</span>
              <span>Stay focused with timed sessions</span>
            </div>
            <div className="feature-item">
              <span className="feature-icon">📊</span>
              <span>Track your productivity</span>
            </div>
            <div className="feature-item">
              <span className="feature-icon">🏆</span>
              <span>Earn achievements</span>
            </div>
            <div className="feature-item">
              <span className="feature-icon">🎵</span>
              <span>Ambient sounds for focus</span>
            </div>
          </div>
        </div>
      ),
    },
    {
      title: "What's your name?",
      subtitle: 'Let us personalize your experience',
      icon: '👋',
      content: (
        <div className="onboarding-content">
          <input
            type="text"
            className="onboarding-input"
            placeholder="Enter your name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            autoFocus
          />
          <p className="onboarding-hint">We'll use this to personalize your experience</p>
        </div>
      ),
    },
    {
      title: 'Choose your focus style',
      subtitle: 'We recommend starting with Classic',
      icon: '⏱️',
      content: (
        <div className="onboarding-content">
          <div className="technique-options">
            <div className="technique-option recommended">
              <div className="technique-badge">Recommended</div>
              <h3>Classic Pomodoro</h3>
              <p>25 min focus · 5 min break</p>
              <span className="technique-desc">Perfect for most tasks</span>
            </div>
            <div className="technique-option">
              <h3>Extended Focus</h3>
              <p>50 min focus · 10 min break</p>
              <span className="technique-desc">For deep work sessions</span>
            </div>
            <div className="technique-option">
              <h3>Short Sprint</h3>
              <p>15 min focus · 3 min break</p>
              <span className="technique-desc">Quick tasks & learning</span>
            </div>
          </div>
        </div>
      ),
    },
    {
      title: "You're all set!",
      subtitle: 'Ready to boost your productivity?',
      icon: '🚀',
      content: (
        <div className="onboarding-content">
          <div className="completion-message">
            <div className="checkmark-animation">✓</div>
            <p>Let's start your first focus session together!</p>
            <div className="tips-list">
              <div className="tip-item">
                <span>💡</span>
                <span>Press <kbd>Space</kbd> to start/pause</span>
              </div>
              <div className="tip-item">
                <span>💡</span>
                <span>Try ambient sounds for better focus</span>
              </div>
              <div className="tip-item">
                <span>💡</span>
                <span>Take breaks seriously - they're important!</span>
              </div>
            </div>
          </div>
        </div>
      ),
    },
  ];

  const handleNext = () => {
    if (step < steps.length - 1) {
      setStep(step + 1);
    } else {
      onUserNameChange(name);
      onComplete();
    }
  };

  const handleSkip = () => {
    onUserNameChange(name);
    onComplete();
  };

  return (
    <div className="onboarding-overlay">
      <div className="onboarding-modal">
        <div className="onboarding-progress">
          {steps.map((_, i) => (
            <div
              key={i}
              className={`progress-dot ${i === step ? 'active' : ''} ${i < step ? 'completed' : ''}`}
            />
          ))}
        </div>

        <div className="onboarding-icon">{steps[step].icon}</div>
        <h1 className="onboarding-title">{steps[step].title}</h1>
        <p className="onboarding-subtitle">{steps[step].subtitle}</p>

        <div className="onboarding-body">{steps[step].content}</div>

        <div className="onboarding-actions">
          {step > 0 && (
            <button className="onboarding-back" onClick={() => setStep(step - 1)}>
              Back
            </button>
          )}
          <button className="onboarding-next" onClick={handleNext}>
            {step === steps.length - 1 ? "Let's Start!" : 'Continue'}
          </button>
        </div>

        <button className="onboarding-skip" onClick={handleSkip}>
          Skip tutorial
        </button>
      </div>
    </div>
  );
}
