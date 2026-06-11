import React, { useState, useEffect } from 'react';

import { useData } from '../../lib/DataContext';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export default function IntersectionalMatrix({ rows, sensitiveAttrs, targetColumn, language }) {
  const { t } = useData();
  const [matrixData, setMatrixData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const [geminiExplanation, setGeminiExplanation] = useState('');
  const [isGeminiLoading, setIsGeminiLoading] = useState(false);

  useEffect(() => {
    async function fetchData() {
      if (!sensitiveAttrs || sensitiveAttrs.length < 2) {
        setError('Need at least 2 sensitive attributes for intersectional analysis.');
        setIsLoading(false);
        return;
      }
      
      const attribute1 = sensitiveAttrs[0];
      const attribute2 = sensitiveAttrs[1];
      const positiveOutcome = '1'; // Defaulting for the generic backend, though backend handles '1', 1, true, or case-insensitive string match
      
      try {
        setIsLoading(true);
        setError(null);
        // Minimize payload by sending only the relevant columns to avoid payload size limits (e.g. 413 Payload Too Large)
        const minimizedData = rows.map(r => ({
          [attribute1]: r[attribute1],
          [attribute2]: r[attribute2],
          [targetColumn]: r[targetColumn]
        }));

        const res = await fetch(`${API_URL}/analysis/intersectional`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ data: minimizedData, attribute1, attribute2, targetColumn, positiveOutcome })
        });
        if (!res.ok) throw new Error('Failed to fetch intersectional data');
        const result = await res.json();
        setMatrixData(result);
      } catch (err) {
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    }
    
    if (rows && sensitiveAttrs && targetColumn) {
      fetchData();
    }
  }, [rows, sensitiveAttrs, targetColumn]);

  const askGemini = async () => {
    if (!matrixData) return;
    try {
      setIsGeminiLoading(true);
      const prompt = `In our ${targetColumn} dataset, ${matrixData.worstGroup.label} has a ${(matrixData.worstGroup.rate * 100).toFixed(0)}% approval rate vs ${matrixData.bestGroup.label}'s ${(matrixData.bestGroup.rate * 100).toFixed(0)}%. Explain in 2 sentences why intersectional bias is worse than single-attribute bias, and what this specific pattern means for fairness compliance.`;
      
      const res = await fetch(`${API_URL}/copilot/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: prompt, language })
      });
      const data = await res.json();
      setGeminiExplanation(data.response || data.reply || data.text || 'Explanation generated.');
    } catch (err) {
      setGeminiExplanation('Failed to get Gemini explanation: ' + err.message);
    } finally {
      setIsGeminiLoading(false);
    }
  };

  const interpolateColor = (rate) => {
    // Red (#ef4444) -> Amber (#f59e0b) -> Green (#22c55e)
    let r, g, b;
    if (rate <= 0.5) {
      const pct = rate / 0.5;
      r = Math.round(239 + (245 - 239) * pct);
      g = Math.round(68 + (158 - 68) * pct);
      b = Math.round(68 + (11 - 68) * pct);
    } else {
      const pct = (rate - 0.5) / 0.5;
      r = Math.round(245 + (34 - 245) * pct);
      g = Math.round(158 + (197 - 158) * pct);
      b = Math.round(11 + (94 - 11) * pct);
    }
    return `rgba(${r}, ${g}, ${b}, 0.8)`;
  };

  const formatMarkdown = (text) => {
    let formatted = text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
    formatted = formatted.replace(/\n/g, '<br/>');
    return formatted;
  };

  if (isLoading) {
    return (
      <div style={{ background: 'var(--bg-card, #14181c)', borderRadius: '12px', padding: '24px', border: '1px solid var(--border-default, rgba(255,255,255,0.1))' }}>
        <h2 style={{ fontSize: '1.25rem', margin: '0 0 4px 0', color: 'var(--text-primary)' }}>{t('Intersectional Bias Matrix')}</h2>
        <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginBottom: '24px' }}>{t('Loading analysis...')}</p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '8px' }}>
          {Array.from({ length: 12 }).map((_, i) => (
            <div key={i} className="skeleton" style={{ height: '72px', borderRadius: '8px' }} />
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ background: 'var(--bg-card, #14181c)', borderRadius: '12px', padding: '24px', border: '1px solid var(--border-default, rgba(255,255,255,0.1))' }}>
        <div style={{ background: 'rgba(239, 68, 68, 0.1)', border: '1px solid #ef4444', borderRadius: '8px', padding: '16px', color: '#ef4444' }}>
          <strong>{t('Error loading matrix:')}</strong> {error}
        </div>
      </div>
    );
  }

  if (!matrixData) return null;

  return (
    <div style={{ background: 'var(--bg-card, rgba(255,255,255,0.03))', borderRadius: '12px', padding: '24px', border: '1px solid var(--border-default, rgba(255,255,255,0.1))' }}>
      <h2 style={{ fontSize: '1.25rem', margin: '0 0 4px 0', color: 'var(--text-primary)' }}>{t('Intersectional Bias Matrix')}</h2>
      <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginBottom: '24px' }}>
        {sensitiveAttrs?.[0] || 'Attribute 1'} × {sensitiveAttrs?.[1] || 'Attribute 2'} — compounded disadvantage
      </p>

      {matrixData.maxDisparity > 0.25 && (
        <div style={{ background: 'rgba(239, 68, 68, 0.1)', border: '1px solid #ef4444', borderRadius: '8px', padding: '16px', marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '12px' }}>
          <span style={{ fontSize: '1.5rem' }}>⚠</span>
          <div>
            <div style={{ color: '#ef4444', fontWeight: 'bold', fontSize: '0.875rem' }}>{t('Worst combination')}</div>
            <div style={{ color: 'var(--text-primary)', fontSize: '0.875rem', marginTop: '4px' }}>
              <strong>{matrixData.worstGroup.label}</strong> {t('has')} <strong>{((1 - matrixData.worstGroup.ratio) * 100).toFixed(0)}%</strong> {t('lower approval rate than')} <strong>{matrixData.bestGroup.label}</strong>
            </div>
          </div>
        </div>
      )}

      <div style={{ overflowX: 'auto', marginBottom: '32px' }}>
        <table style={{ borderCollapse: 'collapse', width: '100%' }}>
          <thead>
            <tr>
              <th style={{ padding: '8px', minWidth: '100px' }}></th>
              {matrixData.attr2Values.map(v2 => (
                <th key={v2} style={{ padding: '8px', minWidth: '90px', color: 'var(--color-muted)', fontSize: '12px', fontWeight: '600', textTransform: 'uppercase', textAlign: 'center' }}>
                  {v2}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {matrixData.attr1Values.map(v1 => (
              <tr key={v1}>
                <th style={{ padding: '8px', color: 'var(--color-muted)', fontSize: '12px', fontWeight: '600', textTransform: 'uppercase', textAlign: 'right', whiteSpace: 'nowrap' }}>
                  {v1}
                </th>
                {matrixData.attr2Values.map(v2 => {
                  const cell = matrixData.matrix[`${v1}_${v2}`];
                  if (!cell) return <td key={v2} />;
                  return (
                    <td key={v2} style={{ padding: '4px' }}>
                      <div 
                        className="intersectional-cell"
                        style={{
                          backgroundColor: interpolateColor(cell.rate),
                          height: '72px',
                          minWidth: '90px',
                          borderRadius: '8px',
                          display: 'flex',
                          flexDirection: 'column',
                          alignItems: 'center',
                          justifyContent: 'center',
                          transition: 'transform 0.2s, box-shadow 0.2s',
                          cursor: 'pointer',
                          position: 'relative',
                          textAlign: 'center'
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.transform = 'scale(1.06)';
                          e.currentTarget.style.zIndex = '10';
                          e.currentTarget.style.boxShadow = '0 10px 25px rgba(0,0,0,0.5)';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.transform = 'scale(1)';
                          e.currentTarget.style.zIndex = '1';
                          e.currentTarget.style.boxShadow = 'none';
                        }}
                        title={`${cell.label}: ${(cell.rate * 100).toFixed(1)}% (${cell.count} people)`}
                      >
                        <div style={{ fontWeight: '700', fontSize: '16px', color: 'white' }}>
                          {(cell.rate * 100).toFixed(0)}%
                        </div>
                        <div style={{ fontSize: '10px', color: 'rgba(255,255,255,0.7)', marginTop: '2px' }}>
                          {cell.count} people
                        </div>
                      </div>
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div style={{ borderTop: '1px solid var(--border-default, rgba(255,255,255,0.1))', paddingTop: '24px' }}>
        <h3 style={{ fontSize: '1rem', color: 'var(--text-primary)', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ color: 'var(--accent-blue, #60a5fa)' }}>✦</span> {t('Why this matters')}
        </h3>
        
        {!geminiExplanation && !isGeminiLoading && (
          <button 
            onClick={askGemini}
            className="btn btn-secondary"
            style={{ 
              background: 'rgba(255,255,255,0.05)', 
              border: '1px solid rgba(255,255,255,0.1)', 
              color: 'var(--text-primary)',
              padding: '8px 16px',
              borderRadius: '6px',
              cursor: 'pointer'
            }}
          >
            {t('Ask Gemini to explain this pattern')}
          </button>
        )}

        {isGeminiLoading && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '16px', background: 'rgba(255,255,255,0.02)', borderRadius: '8px' }}>
            <span style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>{t('Generating insights...')}</span>
            <div className="bias-heartbeat" style={{ height: '16px', display: 'flex', alignItems: 'end', gap: '3px' }}>
              <div className="bar" style={{ width: '3px', height: '16px', background: 'var(--accent-green, #10b981)', animation: 'heartbeat 1.2s ease-in-out infinite 0s' }} />
              <div className="bar" style={{ width: '3px', height: '16px', background: 'var(--accent-teal, #14b8a6)', animation: 'heartbeat 1.2s ease-in-out infinite 0.15s' }} />
              <div className="bar" style={{ width: '3px', height: '16px', background: 'var(--accent-blue, #3b82f6)', animation: 'heartbeat 1.2s ease-in-out infinite 0.3s' }} />
            </div>
            <style dangerouslySetInnerHTML={{__html: `
              @keyframes heartbeat {
                0%, 100% { transform: scaleY(0.3); opacity: 0.4; }
                50% { transform: scaleY(1); opacity: 1; }
              }
            `}} />
          </div>
        )}

        {geminiExplanation && (
          <>
            <div style={{ 
              background: 'var(--bg-elevated, rgba(255,255,255,0.05))',
              borderLeft: '4px solid transparent',
              borderImage: 'linear-gradient(to bottom, var(--accent-blue, #60a5fa), var(--accent-purple, #a855f7)) 1',
              padding: '16px',
              borderRadius: '0 8px 8px 0',
              fontSize: '0.875rem',
              lineHeight: '1.6',
              color: 'var(--text-secondary)'
            }}
            dangerouslySetInnerHTML={{ __html: formatMarkdown(geminiExplanation) }}
            />
            {language === 'hi' && (
              <span style={{
                display: 'inline-block',
                background: '#1a0a2e',
                color: '#a78bfa',
                border: '1px solid #a78bfa',
                fontSize: '10px',
                borderRadius: '4px',
                padding: '1px 6px',
                marginLeft: '8px',
                marginTop: '8px'
              }}>हिंदी</span>
            )}
          </>
        )}
      </div>
    </div>
  );
}
