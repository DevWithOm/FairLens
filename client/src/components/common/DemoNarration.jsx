import React from 'react';
import { createPortal } from 'react-dom';
import './DemoNarration.css';

const NARRATION_TEXTS = [
  "Welcome to FairLens. Watch as we detect, measure, and fix algorithmic bias in 90 seconds.",
  "Loading the Hiring Bias dataset — 15,000 real hiring decisions with Gender, Race, and Education data.",
  "Auto-detecting sensitive attributes... Gender and Race flagged as protected characteristics.",
  "Computing fairness metrics... Disparate Impact is 0.67 — below the EEOC threshold of 0.80. Critical.",
  "Running intersectional analysis... SC/ST women face 2.3× worse outcomes than upper-caste men.",
  "Applying Re-weighting remediation... Retraining ensemble model with balanced group weights.",
  "Disparate Impact improved from 0.67 → 0.91. EEOC compliant. Accuracy impact: only -1.8%.",
  "Generating AI-powered compliance report via Google Gemini... Ready to export as PDF."
];

export default function DemoNarration({ step, isVisible, onSkip }) {
  if (!isVisible) return null;

  const content = (
    <div className="demo-narration-panel">
      <button className="demo-skip-btn outline" onClick={onSkip}>
        Skip Demo
      </button>
      
      <div className="demo-progress-container">
        <div 
          className="demo-progress-bar" 
          style={{ width: `${(step / 7) * 100}%` }}
        />
      </div>

      <div className="demo-step-indicator">
        Step {step}/7
      </div>

      <div className="demo-narration-text">
        {NARRATION_TEXTS[step]}<span className="demo-cursor"></span>
      </div>
    </div>
  );

  return createPortal(content, document.body);
}
