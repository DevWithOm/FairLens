import React from 'react';
import DriftChart from './DriftChart';

export default function BiasMonitor({ onTabChange }) {
  const currentDI = 0.87;
  const isDICompliant = currentDI >= 0.80;

  const alerts = [
    { type: 'Critical', text: 'Gender DI dropped below 0.70 threshold', meta: 'Session 8 · 3 days ago', color: 'var(--color-red, #ef4444)' },
    { type: 'Warning', text: 'Statistical Parity worsening (-0.22)', meta: 'Session 7 · 5 days ago', color: 'var(--color-amber, #fbbf24)' },
    { type: 'Resolved', text: 'Re-weighting fix applied — DI restored to 0.87', meta: 'Session 9 · 2 hours ago', color: 'var(--color-lime, #a3e635)' },
    { type: 'Info', text: 'New dataset version loaded: hiring_bias_v2.csv', meta: 'Session 10 · 1 hour ago', color: 'var(--color-blue, #60a5fa)' },
  ];

  const history = [
    { session: 'Session 12', dataset: 'hiring_bias_v2.csv', di: 0.87, spd: -0.05, status: 'Compliant' },
    { session: 'Session 11', dataset: 'hiring_bias_v2.csv', di: 0.86, spd: -0.06, status: 'Compliant' },
    { session: 'Session 10', dataset: 'hiring_bias_v2.csv', di: 0.85, spd: -0.08, status: 'Compliant' },
    { session: 'Session 9', dataset: 'hiring_bias_v1.csv', di: 0.65, spd: -0.28, status: 'Critical' },
    { session: 'Session 8', dataset: 'hiring_bias_v1.csv', di: 0.68, spd: -0.25, status: 'Critical' },
  ];

  const getStatusColor = (status) => {
    if (status === 'Compliant') return 'var(--color-lime, #a3e635)';
    if (status === 'At Risk') return 'var(--color-amber, #fbbf24)';
    return 'var(--color-red, #ef4444)';
  };

  return (
    <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '24px', fontFamily: 'inherit', color: 'var(--color-text, #f5f5f5)' }}>
      {/* Section 1: Live Status Bar */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px' }}>
        <div style={{ background: 'var(--color-surface, #14181c)', border: '1px solid var(--color-border, rgba(255,255,255,0.1))', borderRadius: '12px', padding: '20px' }}>
          <div style={{ fontSize: '0.875rem', color: 'var(--color-muted, #878c91)', marginBottom: '8px' }}>Current DI Score</div>
          <div style={{ fontSize: '2rem', fontWeight: 'bold', color: isDICompliant ? 'var(--color-lime, #a3e635)' : 'var(--color-red, #ef4444)' }}>
            {currentDI}
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--color-muted, #878c91)', marginTop: '4px' }}>Disparate Impact</div>
        </div>
        
        <div style={{ background: 'var(--color-surface, #14181c)', border: '1px solid var(--color-border, rgba(255,255,255,0.1))', borderRadius: '12px', padding: '20px' }}>
          <div style={{ fontSize: '0.875rem', color: 'var(--color-muted, #878c91)', marginBottom: '8px' }}>Sessions Audited</div>
          <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#ffffff' }}>12</div>
          <div style={{ fontSize: '0.75rem', color: 'var(--color-muted, #878c91)', marginTop: '4px' }}>Total audits run</div>
        </div>

        <div style={{ background: 'var(--color-surface, #14181c)', border: '1px solid var(--color-border, rgba(255,255,255,0.1))', borderRadius: '12px', padding: '20px' }}>
          <div style={{ fontSize: '0.875rem', color: 'var(--color-muted, #878c91)', marginBottom: '8px' }}>Last Audit</div>
          <div style={{ fontSize: '2rem', fontWeight: 'bold', color: 'var(--color-muted, #878c91)' }}>2 hours ago</div>
          <div style={{ fontSize: '0.75rem', color: 'var(--color-muted, #878c91)', marginTop: '4px' }}>System automated run</div>
        </div>
      </div>

      {/* Section 2: DriftChart */}
      <div style={{ background: 'var(--color-surface, #14181c)', border: '1px solid var(--color-border, rgba(255,255,255,0.1))', borderRadius: '12px', padding: '20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
          <h2 style={{ fontSize: '1.125rem', fontWeight: '600', margin: 0, color: 'var(--color-text, #f5f5f5)' }}>Fairness Score Over Time</h2>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'rgba(163, 230, 53, 0.1)', padding: '4px 8px', borderRadius: '12px', border: '1px solid rgba(163, 230, 53, 0.2)' }}>
            <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--color-lime, #a3e635)', animation: 'pulse 2s infinite' }} />
            <span style={{ fontSize: '0.75rem', fontWeight: '600', color: 'var(--color-lime, #a3e635)' }}>LIVE</span>
          </div>
        </div>
        <p style={{ fontSize: '0.875rem', color: 'var(--color-muted, #878c91)', margin: '0 0 20px 0' }}>
          Last 12 audit sessions — tracks Disparate Impact and Statistical Parity
        </p>
        <div style={{ height: '280px', width: '100%' }}>
          <DriftChart />
        </div>
      </div>

      {/* Section 3: Dataset Comparison & Alert Feed */}
      <div style={{ display: 'grid', gridTemplateColumns: '65% calc(35% - 24px)', gap: '24px' }}>
        
        {/* Dataset Comparison */}
        <div style={{ background: 'var(--color-surface, #14181c)', border: '1px solid var(--color-border, rgba(255,255,255,0.1))', borderRadius: '12px', padding: '20px', overflow: 'hidden' }}>
          <h3 style={{ fontSize: '1rem', fontWeight: '600', margin: '0 0 16px 0', color: 'var(--color-text, #f5f5f5)' }}>Audit History</h3>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
              <thead>
                <tr style={{ background: 'var(--color-surface-2, rgba(255,255,255,0.03))' }}>
                  <th style={{ padding: '12px', fontSize: '0.75rem', color: 'var(--color-muted, #878c91)', fontWeight: '600', borderBottom: '1px solid var(--color-border, rgba(255,255,255,0.1))' }}>Session</th>
                  <th style={{ padding: '12px', fontSize: '0.75rem', color: 'var(--color-muted, #878c91)', fontWeight: '600', borderBottom: '1px solid var(--color-border, rgba(255,255,255,0.1))' }}>Dataset</th>
                  <th style={{ padding: '12px', fontSize: '0.75rem', color: 'var(--color-muted, #878c91)', fontWeight: '600', borderBottom: '1px solid var(--color-border, rgba(255,255,255,0.1))' }}>DI Score</th>
                  <th style={{ padding: '12px', fontSize: '0.75rem', color: 'var(--color-muted, #878c91)', fontWeight: '600', borderBottom: '1px solid var(--color-border, rgba(255,255,255,0.1))' }}>SPD</th>
                  <th style={{ padding: '12px', fontSize: '0.75rem', color: 'var(--color-muted, #878c91)', fontWeight: '600', borderBottom: '1px solid var(--color-border, rgba(255,255,255,0.1))' }}>Status</th>
                  <th style={{ padding: '12px', fontSize: '0.75rem', color: 'var(--color-muted, #878c91)', fontWeight: '600', borderBottom: '1px solid var(--color-border, rgba(255,255,255,0.1))' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {history.map((row, i) => (
                  <tr key={i} style={{ borderBottom: '1px solid var(--color-border, rgba(255,255,255,0.1))' }}>
                    <td style={{ padding: '12px', fontSize: '0.875rem' }}>{row.session}</td>
                    <td style={{ padding: '12px', fontSize: '0.875rem', color: 'var(--color-muted, #878c91)' }}>{row.dataset}</td>
                    <td style={{ padding: '12px', fontSize: '0.875rem', fontWeight: '500' }}>{row.di.toFixed(2)}</td>
                    <td style={{ padding: '12px', fontSize: '0.875rem', fontWeight: '500' }}>{row.spd.toFixed(2)}</td>
                    <td style={{ padding: '12px' }}>
                      <span style={{ 
                        padding: '4px 8px', 
                        borderRadius: '4px', 
                        fontSize: '0.75rem', 
                        fontWeight: '600',
                        color: getStatusColor(row.status),
                        background: `color-mix(in srgb, ${getStatusColor(row.status)} 15%, transparent)`
                      }}>
                        {row.status}
                      </span>
                    </td>
                    <td style={{ padding: '12px' }}>
                      <button 
                        onClick={() => onTabChange && onTabChange('report')}
                        style={{
                        background: 'transparent',
                        border: '1px solid var(--color-border, rgba(255,255,255,0.1))',
                        color: 'var(--color-text, #f5f5f5)',
                        padding: '4px 12px',
                        borderRadius: '6px',
                        fontSize: '0.75rem',
                        cursor: 'pointer'
                      }}>View Report</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Alert Feed */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <h3 style={{ fontSize: '1rem', fontWeight: '600', margin: 0, color: 'var(--color-text, #f5f5f5)' }}>Drift Alerts</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {alerts.map((alert, i) => (
              <div key={i} style={{ 
                background: 'var(--color-surface, #14181c)', 
                border: '1px solid var(--color-border, rgba(255,255,255,0.1))',
                borderLeft: `3px solid ${alert.color}`,
                borderRadius: '8px', 
                padding: '12px',
                display: 'flex',
                gap: '12px'
              }}>
                <div style={{ marginTop: '4px' }}>
                  <div style={{ 
                    width: '8px', 
                    height: '8px', 
                    borderRadius: '50%', 
                    background: alert.color,
                    animation: alert.type === 'Critical' ? 'pulse 2s infinite' : 'none'
                  }} />
                </div>
                <div>
                  <div style={{ fontSize: '0.875rem', fontWeight: '500', marginBottom: '4px', color: 'var(--color-text, #f5f5f5)' }}>{alert.text}</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--color-muted, #878c91)' }}>{alert.meta}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>

      <style dangerouslySetInnerHTML={{__html: `
        @keyframes pulse {
          0% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.5; transform: scale(1.5); }
          100% { opacity: 1; transform: scale(1); }
        }
      `}} />
    </div>
  );
}
