import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import Papa from 'papaparse';
import { useData } from '../../lib/DataContext';
import DemoNarration from './DemoNarration';
import './DemoMode.css';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export default function DemoMode({ setActiveTab }) {
  const { 
    loadDataset, 
    setSensitiveAttrs, 
    setTargetColumn,
    setAnalysisResults,
    setRemediationResults,
    datasetName,
    rows,
    columns,
    sensitiveAttrs,
    targetColumn
  } = useData();

  const [isDemoRunning, setIsDemoRunning] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [showToast, setShowToast] = useState(false);
  
  const timeoutsRef = useRef([]);

  // Clear timeouts if unmounted or skipped
  const clearAllTimeouts = () => {
    timeoutsRef.current.forEach(clearTimeout);
    timeoutsRef.current = [];
  };

  useEffect(() => {
    return () => clearAllTimeouts();
  }, []);

  const handleSkip = () => {
    clearAllTimeouts();
    setIsDemoRunning(false);
    setCurrentStep(0);
  };

  const startDemo = () => {
    if (isDemoRunning) return;
    
    setIsDemoRunning(true);
    setCurrentStep(0);
    setShowToast(false);
    clearAllTimeouts();

    // Step 0 (0ms): Show DemoNarration step 0
    // Already set by currentStep(0) and isDemoRunning(true)

    // Step 1 (2000ms): Switch to Inspect tab, auto-load dataset
    timeoutsRef.current.push(setTimeout(async () => {
      setActiveTab('inspect');
      try {
        const resp = await fetch('/Datasets/hiring_bias_15k.csv');
        const text = await resp.text();
        const result = Papa.parse(text, { header: true, skipEmptyLines: true, dynamicTyping: true });
        
        loadDataset('hiring_bias_15k.csv', result);
        setSensitiveAttrs(['gender', 'race']);
        setTargetColumn('hired');
      } catch (e) {
        console.error('Demo failed to load dataset', e);
      }
      setCurrentStep(1);
    }, 2000));

    // Step 2 (5000ms): Highlight sensitive attribute detection
    timeoutsRef.current.push(setTimeout(() => {
      // Add demo-highlight to sensitive buttons
      const buttons = document.querySelectorAll('button');
      buttons.forEach(btn => {
        if (btn.textContent.includes('gender') || btn.textContent.includes('race')) {
          btn.classList.add('demo-highlight');
          setTimeout(() => btn.classList.remove('demo-highlight'), 4500);
        }
      });
      setCurrentStep(2);
    }, 5000));

    // Step 3 (8000ms): Switch to Measure tab, auto-trigger bias analysis
    timeoutsRef.current.push(setTimeout(() => {
      setActiveTab('measure');
      setCurrentStep(3);
      
      setTimeout(() => {
        const runBtn = document.getElementById('run-analysis');
        if (runBtn) runBtn.click();
      }, 500);
    }, 8000));

    // Step 4 (13000ms): Scroll to IntersectionalMatrix
    timeoutsRef.current.push(setTimeout(() => {
      setCurrentStep(4);
      // Try to find the intersectional matrix component
      const matrixEl = document.querySelector('.intersectional-matrix-container') || 
                       document.getElementById('intersectional-matrix') ||
                       Array.from(document.querySelectorAll('h3')).find(el => el.textContent.includes('Intersectional'));
                       
      if (matrixEl) {
        matrixEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }, 13000));

    // Step 5 (18000ms): Switch to Fix tab, auto-select Re-weighting
    timeoutsRef.current.push(setTimeout(() => {
      setActiveTab('fix');
      setCurrentStep(5);
      
      setTimeout(() => {
        const buttons = document.querySelectorAll('button');
        const reweighBtn = Array.from(buttons).find(b => b.textContent.includes('Reweighing') || b.textContent.includes('पुनः भार'));
        if (reweighBtn) reweighBtn.click();
      }, 500);
    }, 18000));

    // Step 6 (25000ms): BeforeAfterHero animation triggers
    timeoutsRef.current.push(setTimeout(() => {
      setCurrentStep(6);
      // The BeforeAfterHero should ideally react to remediationResults being set.
      // We can simulate an event or just let it naturally animate if it's built to do so.
      window.dispatchEvent(new CustomEvent('demo-trigger-animation'));
    }, 25000));

    // Step 7 (35000ms): Switch to Report tab, auto-trigger report
    timeoutsRef.current.push(setTimeout(() => {
      setActiveTab('report');
      setCurrentStep(7);
      
      setTimeout(() => {
        const buttons = document.querySelectorAll('button');
        const generateBtn = Array.from(buttons).find(b => b.textContent.includes('Generate Report') || b.textContent.includes('रिपोर्ट'));
        if (generateBtn) generateBtn.click();
      }, 500);
    }, 35000));

    // Finish (50000ms)
    timeoutsRef.current.push(setTimeout(() => {
      setIsDemoRunning(false);
      setShowToast(true);
      setTimeout(() => setShowToast(false), 4000);
    }, 50000));
  };

  return (
    <>
      <button 
        className={`demo-trigger-btn ${!isDemoRunning ? 'idle-pulse' : ''}`}
        onClick={isDemoRunning ? handleSkip : startDemo}
      >
        {isDemoRunning ? (
          <span className="demo-running-text">
            <span className="spin-indicator">↻</span> Demo Running... {currentStep}/7
          </span>
        ) : (
          "▶ Watch 90-sec Demo"
        )}
      </button>

      <DemoNarration 
        step={currentStep} 
        isVisible={isDemoRunning} 
        onSkip={handleSkip} 
      />

      {showToast && createPortal(
        <div className="demo-toast">
          Demo Complete! 🎉
        </div>,
        document.body
      )}
    </>
  );
}
