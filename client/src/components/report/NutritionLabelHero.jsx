import React, { useRef } from 'react';
import html2canvas from 'html2canvas';

export default function NutritionLabelHero({ metrics, datasetName, analysisDate, remediationApplied }) {
  const labelRef = useRef(null);

  const handleDownload = async () => {
    if (!labelRef.current) return;
    try {
      const canvas = await html2canvas(labelRef.current, {
        backgroundColor: '#FFFFFF',
        scale: 2,
        logging: false
      });
      const dataUrl = canvas.toDataURL('image/png');
      const a = document.createElement('a');
      a.href = dataUrl;
      a.download = `fairlens-nutrition-label-${datasetName || 'dataset'}.png`;
      a.click();
    } catch (err) {
      console.error('Failed to generate PNG:', err);
    }
  };

  const scoreColor = (metrics?.disparateImpact !== undefined && metrics?.disparateImpact < 0.80) ? '#dc2626' : '#16a34a';

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '24px 0', width: '100%' }}>
      <div 
        ref={labelRef}
        style={{
          maxWidth: '520px',
          width: '100%',
          background: '#FFFFFF',
          color: '#000000',
          fontFamily: 'system-ui, "Segoe UI", Arial, sans-serif',
          borderRadius: '4px',
          boxShadow: '0 4px 32px rgba(0,0,0,0.4)',
          padding: '12px 16px',
          boxSizing: 'border-box'
        }}
      >
        {/* ── THICK TOP BAR ── */}
        <div style={{ fontSize: '28px', fontWeight: 900, textAlign: 'center', padding: '12px', borderBottom: '8px solid #000', margin: '-12px -16px 0', boxSizing: 'border-box' }}>
          AI Nutrition Label
        </div>

        {/* ── SERVING SIZE ROW ── */}
        <div style={{ padding: '8px 0', borderBottom: '4px solid #000', fontSize: '14px', display: 'flex', justifyContent: 'space-between' }}>
          <strong>Dataset</strong> <span>{datasetName || 'Unknown'}</span>
        </div>

        {/* ── CALORIES EQUIVALENT ROW ── */}
        <div style={{ padding: '12px 0', borderBottom: '4px solid #000', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ fontSize: '13px', fontWeight: 700 }}>
            Fairness Score
          </div>
          <div style={{ display: 'flex', alignItems: 'baseline' }}>
            <span style={{ fontSize: '48px', fontWeight: 900, color: scoreColor, lineHeight: 1 }}>
              {metrics?.disparateImpact !== undefined ? metrics.disparateImpact.toFixed(2) : '—'}
            </span>
            <span style={{ fontSize: '16px', color: '#666', marginLeft: '2px' }}>
              /1.00
            </span>
          </div>
        </div>

        {/* ── METRIC ROWS ── */}
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px solid #000', fontSize: '14px' }}>
            <span>Disparate Impact Ratio</span>
            <strong style={{ fontWeight: 700 }}>{metrics?.disparateImpact !== undefined ? metrics.disparateImpact.toFixed(3) : '—'}</strong>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px solid #000', fontSize: '14px' }}>
            <span>Statistical Parity Difference</span>
            <span>{metrics?.statisticalParity !== undefined ? metrics.statisticalParity.toFixed(3) : '—'}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px solid #000', fontSize: '14px' }}>
            <span>Equalized Odds</span>
            <span>{metrics?.equalizedOdds !== undefined ? metrics.equalizedOdds.toFixed(3) : '—'}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px solid #000', fontSize: '14px' }}>
            <span>EEOC Compliance</span>
            <strong style={{ fontWeight: 700, color: scoreColor }}>
              {metrics?.disparateImpact !== undefined ? (metrics.disparateImpact >= 0.80 ? "✓ COMPLIANT" : "✗ NOT COMPLIANT") : '—'}
            </strong>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px solid #000', fontSize: '14px' }}>
            <span>Remediation Applied</span>
            <span>{remediationApplied || "None"}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px solid #000', fontSize: '14px' }}>
            <span>Dataset</span>
            <span>{datasetName || 'Unknown'}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px solid #000', fontSize: '14px' }}>
            <span>Records Analyzed</span>
            <span>{metrics?.totalRows ? metrics.totalRows.toLocaleString() : '—'}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', fontSize: '14px' }}>
            <span>Analysis Date</span>
            <span>{analysisDate || new Date().toLocaleDateString()}</span>
          </div>
        </div>

        {/* ── THICK BOTTOM BAR ── */}
        <div style={{ borderTop: '8px solid #000', fontSize: '9px', textAlign: 'center', padding: '6px 0 0 0', color: '#666', marginTop: '4px' }}>
          Generated by FairLens · AI Fairness Auditor · Google Solution Challenge 2026
        </div>
      </div>

      <div style={{ maxWidth: '520px', width: '100%', textAlign: 'center', marginTop: '12px' }}>
        <p style={{ fontSize: '12px', fontStyle: 'italic', color: 'var(--text-muted)', marginBottom: '16px' }}>
          * Fairness metrics computed using EEOC 4/5ths Rule standard. Not a substitute for legal compliance review.
        </p>

        <button 
          onClick={handleDownload}
          style={{
            background: 'var(--color-lime, #a3e635)',
            color: '#000',
            fontWeight: 700,
            borderRadius: '8px',
            padding: '10px 24px',
            border: 'none',
            cursor: 'pointer',
            fontSize: '14px',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            boxShadow: '0 2px 8px rgba(163, 230, 53, 0.2)',
            transition: 'transform 0.1s ease, box-shadow 0.1s ease'
          }}
          onMouseDown={(e) => e.currentTarget.style.transform = 'scale(0.96)'}
          onMouseUp={(e) => e.currentTarget.style.transform = 'scale(1)'}
          onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
        >
          ⬇ Download as PNG
        </button>
      </div>
    </div>
  );
}
