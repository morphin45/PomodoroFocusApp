interface FocusScoreProps {
  score: number;
  isPremium: boolean;
}

export default function FocusScore({ score, isPremium }: FocusScoreProps) {
  const getScoreColor = () => {
    if (score >= 80) return '#10b981';
    if (score >= 60) return '#f59e0b';
    if (score >= 40) return '#f97316';
    return '#ef4444';
  };

  const getScoreLabel = () => {
    if (score >= 90) return 'Exceptional';
    if (score >= 80) return 'Excellent';
    if (score >= 70) return 'Great';
    if (score >= 60) return 'Good';
    if (score >= 50) return 'Fair';
    if (score >= 40) return 'Needs Work';
    return 'Getting Started';
  };

  return (
    <div className="focus-score-widget">
      <div className="focus-score-header">
        <h3>Focus Score</h3>
        {!isPremium && <span className="pro-badge">PRO</span>}
      </div>
      <div className="focus-score-display">
        <svg viewBox="0 0 100 100" className="focus-score-ring">
          <circle
            cx="50"
            cy="50"
            r="45"
            fill="none"
            stroke="rgba(255,255,255,0.1)"
            strokeWidth="8"
          />
          <circle
            cx="50"
            cy="50"
            r="45"
            fill="none"
            stroke={getScoreColor()}
            strokeWidth="8"
            strokeDasharray={`${(score / 100) * 283} 283`}
            strokeLinecap="round"
            transform="rotate(-90 50 50)"
            className="focus-score-progress"
          />
        </svg>
        <div className="focus-score-value">{score}</div>
      </div>
      <div className="focus-score-label" style={{ color: getScoreColor() }}>
        {getScoreLabel()}
      </div>
    </div>
  );
}
