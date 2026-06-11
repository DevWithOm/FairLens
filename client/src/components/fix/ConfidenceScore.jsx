import React from 'react';
import './ConfidenceScore.css';

const ConfidenceScore = ({ 
  confidenceScore = 0, 
  confidenceLabel = 'Low', 
  biasReductionPercent = 0, 
  accuracyTradeoff = 0, 
  recommendation = '', 
  fixName = '',
  attribute = 'sensitive'
}) => {
  let color = 'var(--color-error, #f44336)';
  let bgColor = 'rgba(244, 67, 54, 0.1)';
  
  if (confidenceLabel === 'High') {
    color = 'var(--color-success, #4caf50)';
    bgColor = 'rgba(76, 175, 80, 0.1)';
  } else if (confidenceLabel === 'Medium') {
    color = 'var(--color-warning, #ff9800)';
    bgColor = 'rgba(255, 152, 0, 0.1)';
  }

  const radius = 50;
  const circumference = Math.PI * radius;
  const strokeDashoffset = Math.max(0, circumference - (confidenceScore / 100) * circumference);

  return (
    <div className="confidence-score-card">
      <div className="confidence-main-content">
        <div className="confidence-left">
          <div className="confidence-arc-container">
            <svg width="120" height="60" viewBox="0 0 120 60" className="confidence-arc">
              <path 
                d="M 10 60 A 50 50 0 0 1 110 60" 
                fill="none" 
                stroke="var(--color-surface-2, rgba(255,255,255,0.1))" 
                strokeWidth="12" 
                strokeLinecap="round" 
              />
              <path 
                d="M 10 60 A 50 50 0 0 1 110 60" 
                fill="none" 
                stroke={color} 
                strokeWidth="12" 
                strokeDasharray={circumference} 
                strokeDashoffset={strokeDashoffset} 
                strokeLinecap="round" 
                className="confidence-arc-fill" 
              />
            </svg>
            <div className="confidence-number" style={{ color }}>
              {confidenceScore}<span className="confidence-max">/100</span>
            </div>
          </div>
          <div className="confidence-label">
            {confidenceLabel} Confidence
          </div>
        </div>

        <div className="confidence-right">
          <div className="confidence-stat-row">
            <span className="stat-label">Bias Reduction:</span>
            <span className="stat-value" style={{ color: 'var(--color-success, #4caf50)', fontWeight: 700 }}>
              {biasReductionPercent > 0 ? '+' : ''}{biasReductionPercent}%
            </span>
          </div>
          <div className="confidence-stat-row">
            <span className="stat-label">Accuracy Trade-off:</span>
            <span className="stat-value" style={{ color: accuracyTradeoff > 2 ? 'var(--color-warning, #ff9800)' : 'var(--color-success, #4caf50)' }}>
              {accuracyTradeoff}%
            </span>
          </div>
          <div className="confidence-recommendation">
            {recommendation}
          </div>
        </div>
      </div>

      <div className="confidence-bottom-bar" style={{ backgroundColor: bgColor }}>
        This fix reduces {attribute} bias by {biasReductionPercent}% with {accuracyTradeoff}% accuracy loss — {confidenceLabel} Confidence
      </div>
    </div>
  );
};

export default ConfidenceScore;
