import React, { useState, useEffect } from 'react';

function AnimatedCounter({ start, end, duration, startAnimation }) {
  const [value, setValue] = useState(start);

  useEffect(() => {
    if (!startAnimation) {
      setValue(start);
      return;
    }

    let startTime = null;
    let animationFrame;
    const animate = (time) => {
      if (!startTime) startTime = time;
      const progress = Math.min((time - startTime) / duration, 1);
      // easeOutQuart
      const easeProgress = 1 - Math.pow(1 - progress, 4);
      setValue(start + (end - start) * easeProgress);

      if (progress < 1) {
        animationFrame = requestAnimationFrame(animate);
      } else {
        setValue(end);
      }
    };

    animationFrame = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animationFrame);
  }, [startAnimation, start, end, duration]);

  // format correctly with signs for negative values
  return <>{value.toFixed(2)}</>;
}

export default function BeforeAfterHero({ beforeMetrics, afterMetrics, fixName, isAnimating }) {
  const [phase, setPhase] = useState(0);

  useEffect(() => {
    if (isAnimating) {
      setPhase(1); 
      const t2 = setTimeout(() => setPhase(2), 200);
      const t3 = setTimeout(() => setPhase(3), 600);
      const t4 = setTimeout(() => setPhase(4), 800);
      const t5 = setTimeout(() => setPhase(5), 2000);
      const t6 = setTimeout(() => setPhase(6), 2200);
      
      return () => {
        clearTimeout(t2); clearTimeout(t3); clearTimeout(t4);
        clearTimeout(t5); clearTimeout(t6);
      };
    } else {
      setPhase(0);
    }
  }, [isAnimating]);

  const isCompliant = afterMetrics.disparateImpact >= 0.80;
  const bannerBg = isCompliant 
    ? 'linear-gradient(90deg, #14532d, #166534)'
    : 'linear-gradient(90deg, #7f1d1d, #991b1b)';
  const bannerText = isCompliant
    ? '✓ EEOC 4/5ths Rule: COMPLIANT — Disparate Impact ratio above 0.80 threshold'
    : '⚠ EEOC 4/5ths Rule: NOT YET COMPLIANT — Try a different remediation strategy';
  const bannerColor = isCompliant ? '#4ade80' : '#fca5a5';

  const confidenceScore = Math.round(afterMetrics.disparateImpact * 100);
  let barColor = 'var(--color-red, #ef4444)';
  if (confidenceScore > 70) barColor = 'var(--color-lime, #a3e635)';
  else if (confidenceScore >= 40) barColor = 'var(--color-amber, #fbbf24)';

  let confLabel = 'Low';
  if (confidenceScore > 75) confLabel = 'High';
  else if (confidenceScore >= 50) confLabel = 'Medium';

  const deltaDI = Math.round((afterMetrics.disparateImpact - beforeMetrics.disparateImpact) * 100);
  const accLoss = Math.round((beforeMetrics.accuracy - afterMetrics.accuracy) * 100);

  const getDeltaStr = (before, after) => {
    const diff = after - before;
    return diff > 0 ? `+${diff.toFixed(2)}` : diff.toFixed(2);
  };

  const metricsList = [
    {
      label: 'Disparate Impact',
      before: beforeMetrics.disparateImpact,
      after: afterMetrics.disparateImpact,
      deltaStr: getDeltaStr(beforeMetrics.disparateImpact, afterMetrics.disparateImpact),
      deltaColor: 'rgba(163, 230, 53, 0.2)', // green bg
      deltaTextColor: 'var(--color-lime, #a3e635)'
    },
    {
      label: 'Statistical Parity',
      before: beforeMetrics.statisticalParity,
      after: afterMetrics.statisticalParity,
      deltaStr: getDeltaStr(beforeMetrics.statisticalParity, afterMetrics.statisticalParity),
      deltaColor: 'rgba(163, 230, 53, 0.2)',
      deltaTextColor: 'var(--color-lime, #a3e635)'
    },
    {
      label: 'Accuracy',
      before: beforeMetrics.accuracy,
      after: afterMetrics.accuracy,
      deltaStr: getDeltaStr(beforeMetrics.accuracy, afterMetrics.accuracy),
      deltaColor: 'rgba(251, 191, 36, 0.2)', // amber bg
      deltaTextColor: 'var(--color-amber, #fbbf24)'
    }
  ];

  return (
    <div style={{
      width: '100%',
      background: 'linear-gradient(135deg, var(--bg-surface, #1e293b), #0f172a)',
      border: '1px solid var(--color-lime, #a3e635)',
      boxShadow: phase >= 1 ? '0 0 24px rgba(163,230,53,0.15)' : '0 0 0px rgba(163,230,53,0)',
      borderRadius: '16px',
      padding: '32px',
      transition: 'box-shadow 0.8s ease',
      fontFamily: 'system-ui, sans-serif',
      color: 'white',
      overflow: 'hidden',
      position: 'relative'
    }}>
      {/* Header Row */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '40px' }}>
        <div style={{
          background: '#1a2a0a',
          color: 'var(--color-lime, #a3e635)',
          border: '1px solid var(--color-lime, #a3e635)',
          borderRadius: '20px',
          padding: '4px 14px',
          fontSize: '12px',
          fontWeight: 600,
          textTransform: 'uppercase',
          letterSpacing: '0.5px'
        }}>
          Remediation Applied
        </div>
        <div style={{ fontSize: '22px', fontWeight: 700, color: 'white' }}>
          {fixName}
        </div>
        <div style={{ fontSize: '13px', color: 'var(--color-muted, #94a3b8)' }}>
          Just now
        </div>
      </div>

      {/* Main Comparison: 3 Columns */}
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '32px' }}>
        {metricsList.map((m, idx) => (
          <React.Fragment key={m.label}>
            <div style={{ flex: 1, textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <div style={{ fontSize: '14px', color: 'var(--text-muted, #94a3b8)', marginBottom: '20px', fontWeight: 500 }}>
                {m.label}
              </div>
              
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '20px' }}>
                {/* BEFORE */}
                <div style={{
                  opacity: phase >= 2 ? 1 : 0,
                  transform: phase >= 2 ? 'translateY(0)' : 'translateY(10px)',
                  transition: 'opacity 0.4s ease, transform 0.4s ease',
                  textAlign: 'center'
                }}>
                  <div style={{ fontSize: '10px', color: 'var(--color-red, #ef4444)', letterSpacing: '2px', textTransform: 'uppercase', marginBottom: '6px', fontWeight: 600 }}>
                    Before
                  </div>
                  <div style={{ fontSize: '36px', fontWeight: 800, color: 'var(--color-red, #ef4444)', fontFamily: 'monospace' }}>
                    {m.before.toFixed(2)}
                  </div>
                </div>

                {/* ARROW */}
                <div style={{
                  display: 'flex', flexDirection: 'column', alignItems: 'center',
                  opacity: phase >= 3 ? 1 : 0,
                  transform: phase >= 3 ? 'scale(1)' : 'scale(0.8)',
                  transition: 'opacity 0.4s ease, transform 0.4s ease'
                }}>
                  <div style={{
                    fontSize: '32px', 
                    color: phase >= 3 && isAnimating ? 'var(--color-lime, #a3e635)' : 'var(--text-muted, #94a3b8)',
                    animation: phase >= 3 && isAnimating ? 'pulse-arrow 1.5s infinite' : 'none',
                    lineHeight: '1',
                    marginBottom: '6px'
                  }}>
                    →
                  </div>
                  <div style={{
                    background: m.deltaColor,
                    color: m.deltaTextColor,
                    padding: '3px 10px',
                    borderRadius: '12px',
                    fontSize: '11px',
                    fontWeight: 700
                  }}>
                    {m.deltaStr}
                  </div>
                </div>

                {/* AFTER */}
                <div style={{
                  opacity: phase >= 4 ? 1 : 0,
                  transform: phase >= 4 ? 'translateY(0)' : 'translateY(10px)',
                  transition: 'opacity 0.4s ease, transform 0.4s ease',
                  textAlign: 'center'
                }}>
                  <div style={{ fontSize: '10px', color: 'var(--color-lime, #a3e635)', letterSpacing: '2px', textTransform: 'uppercase', marginBottom: '6px', fontWeight: 600 }}>
                    After
                  </div>
                  <div style={{ fontSize: '36px', fontWeight: 800, color: 'var(--color-lime, #a3e635)', fontFamily: 'monospace' }}>
                    <AnimatedCounter start={m.before} end={m.after} duration={1200} startAnimation={phase >= 4} />
                  </div>
                </div>
              </div>
            </div>

            {idx < 2 && (
              <div style={{ width: '1px', background: 'var(--border-subtle, #334155)', margin: '0 24px', opacity: 0.5 }} />
            )}
          </React.Fragment>
        ))}
      </div>

      {/* EEOC Banner */}
      <div style={{
        width: '100%',
        height: '44px',
        background: bannerBg,
        color: bannerColor,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontFamily: 'monospace',
        fontSize: '13px',
        fontWeight: 600,
        borderRadius: '8px',
        marginBottom: '28px',
        opacity: phase >= 5 ? 1 : 0,
        transform: phase >= 5 ? 'translateY(0)' : 'translateY(15px)',
        transition: 'opacity 0.5s ease, transform 0.5s ease'
      }}>
        {bannerText}
      </div>

      {/* Confidence Score */}
      <div style={{
        opacity: phase >= 6 ? 1 : 0,
        transition: 'opacity 0.5s ease',
        display: 'flex',
        flexDirection: 'column',
        gap: '10px'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', color: 'var(--text-muted, #94a3b8)' }}>
          <span style={{ fontWeight: 600 }}>Fix Confidence Score:</span>
          <span style={{ fontWeight: 700, color: barColor }}>{confidenceScore}%</span>
        </div>
        <div style={{ width: '100%', height: '8px', background: 'var(--bg-tertiary, #334155)', borderRadius: '4px', overflow: 'hidden' }}>
          <div style={{
            width: phase >= 6 ? `${confidenceScore}%` : '0%',
            height: '100%',
            background: barColor,
            borderRadius: '4px',
            transition: 'width 1s cubic-bezier(0.4, 0, 0.2, 1)'
          }} />
        </div>
        <div style={{ fontSize: '13px', color: 'var(--text-muted, #94a3b8)', marginTop: '4px', textAlign: 'center' }}>
          This fix reduces bias by <strong style={{color:'white'}}>{deltaDI}%</strong> with <strong style={{color:'white'}}>{accLoss}%</strong> accuracy trade-off — <strong style={{ color: barColor }}>{confLabel} Confidence</strong>
        </div>
      </div>

      <style dangerouslySetInnerHTML={{__html: `
        @keyframes pulse-arrow {
          0%, 100% { opacity: 0.6; transform: translateX(0); color: var(--text-muted, #94a3b8); }
          50% { opacity: 1; transform: translateX(6px); color: var(--color-lime, #a3e635); }
        }
      `}} />
    </div>
  );
}
