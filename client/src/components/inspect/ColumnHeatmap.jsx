import React, { useState, useEffect } from 'react'
import { classifyColumnRisk, classifyBiasType } from '../../lib/biasEngine'
import { AlertTriangle, Shield, Eye, Info, Zap } from 'lucide-react'

export default function ColumnHeatmap({ columns, rows, sensitiveAttrs, targetColumn, onToggleSensitive, t = (s) => s }) {
  const [scanPos, setScanPos] = useState(0)
  const [revealed, setRevealed] = useState(false)
  const [hoveredCol, setHoveredCol] = useState(null)

  // X-Ray scan animation on mount
  useEffect(() => {
    let pos = 0
    const interval = setInterval(() => {
      pos += 2
      setScanPos(pos)
      if (pos >= 100) { clearInterval(interval); setRevealed(true) }
    }, 30)
    return () => clearInterval(interval)
  }, [columns.length])

  const columnRisks = columns.map(col => ({
    col,
    ...classifyColumnRisk(col, columns, rows),
    isTarget: col === targetColumn,
    isSensitive: sensitiveAttrs.includes(col)
  }))

  const highRisk = columnRisks.filter(c => c.level === 'high')
  const mediumRisk = columnRisks.filter(c => c.level === 'medium')

  const riskColor = (level) => {
    if (level === 'high') return { bg: 'rgba(252,129,129,0.12)', border: 'rgba(252,129,129,0.4)', text: '#FC8181' }
    if (level === 'medium') return { bg: 'rgba(236,201,75,0.12)', border: 'rgba(236,201,75,0.4)', text: '#ECC94B' }
    return { bg: 'rgba(72,187,120,0.08)', border: 'rgba(72,187,120,0.3)', text: '#48BB78' }
  }

  const biasTypeColor = (type) => {
    switch (type) {
      case 'Historical bias': return 'badge-red'
      case 'Selection bias': return 'badge-yellow'
      case 'Proxy bias': return 'badge-orange'
      case 'Measurement bias': return 'badge-blue'
      default: return 'badge-teal'
    }
  }

  return (
    <div className="card" style={{ marginBottom: '24px', position: 'relative', overflow: 'hidden' }}>
      {/* X-Ray Scan Line */}
      {!revealed && (
        <div style={{
          position: 'absolute',
          left: 0,
          right: 0,
          top: `${scanPos}%`,
          height: '2px',
          background: 'linear-gradient(90deg, transparent, var(--accent-blue), var(--accent-teal), transparent)',
          boxShadow: '0 0 20px rgba(99,179,237,0.5), 0 0 40px rgba(56,178,172,0.3)',
          zIndex: 10,
          transition: 'top 30ms linear',
          pointerEvents: 'none'
        }} />
      )}

      <div className="card-header">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Eye size={18} style={{ color: 'var(--accent-blue)' }} />
            <h3 style={{ fontSize: '1rem', fontWeight: 600 }}>{t('Column X-Ray')}</h3>
            <span className="badge badge-blue">{columns.length} {t('Columns')}</span>
          </div>
          <div style={{ display: 'flex', gap: '8px' }}>
            {highRisk.length > 0 && (
              <span className="badge badge-red">
                <AlertTriangle size={12} /> {highRisk.length} high risk
              </span>
            )}
            {mediumRisk.length > 0 && (
              <span className="badge badge-yellow">
                {mediumRisk.length} proxy/medium
              </span>
            )}
          </div>
        </div>
      </div>

      <div className="card-body">
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
          {columnRisks.map((item, idx) => {
            const colors = riskColor(item.level)
            const isVisible = revealed || (scanPos > (idx / columnRisks.length) * 100)
            return (
              <div
                key={item.col}
                onMouseEnter={() => setHoveredCol(item.col)}
                onMouseLeave={() => setHoveredCol(null)}
                onClick={() => onToggleSensitive && onToggleSensitive(item.col)}
                style={{
                  position: 'relative',
                  padding: '10px 14px',
                  borderRadius: 'var(--radius-md)',
                  border: `1px solid ${item.isSensitive ? 'var(--accent-purple)' : colors.border}`,
                  background: item.isSensitive ? 'rgba(183,148,244,0.1)' : colors.bg,
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                  opacity: isVisible ? 1 : 0.1,
                  transform: isVisible ? 'translateY(0)' : 'translateY(4px)',
                  minWidth: '120px'
                }}
              >
                {/* Risk indicator dot */}
                <div style={{
                  position: 'absolute',
                  top: '6px',
                  right: '6px',
                  width: '8px',
                  height: '8px',
                  borderRadius: '50%',
                  background: colors.text,
                  boxShadow: `0 0 6px ${colors.text}`
                }} />

                <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.8125rem', fontWeight: 600, marginBottom: '4px' }}>
                  {item.isSensitive && '🔒 '}{item.isTarget && '🎯 '}{item.col}
                </div>

                <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
                  <span className={`badge ${biasTypeColor(item.biasType)}`} style={{ fontSize: '0.625rem' }}>
                    {item.type}
                  </span>
                  {item.biasType && item.level !== 'low' && (
                    <span className={`badge ${biasTypeColor(item.biasType)}`} style={{ fontSize: '0.625rem' }}>
                      {item.biasType}
                    </span>
                  )}
                  {item.level === 'medium' && (
                    <span className="badge badge-orange" style={{ fontSize: '0.625rem' }}>PROXY</span>
                  )}
                </div>

                <div style={{
                  marginTop: '6px',
                  height: '3px',
                  borderRadius: '100px',
                  background: 'var(--bg-tertiary)',
                  overflow: 'hidden'
                }}>
                  <div style={{
                    height: '100%',
                    width: `${item.score}%`,
                    borderRadius: '100px',
                    background: `linear-gradient(90deg, ${colors.text}, ${colors.text}88)`,
                    transition: 'width 0.8s ease'
                  }} />
                </div>

                {/* Hover Tooltip */}
                {hoveredCol === item.col && (
                  <div style={{
                    position: 'absolute',
                    bottom: 'calc(100% + 8px)',
                    left: '50%',
                    transform: 'translateX(-50%)',
                    background: 'var(--bg-elevated)',
                    border: '1px solid var(--border-default)',
                    borderRadius: 'var(--radius-sm)',
                    padding: '8px 12px',
                    fontSize: '0.75rem',
                    color: 'var(--text-primary)',
                    whiteSpace: 'nowrap',
                    zIndex: 20,
                    boxShadow: 'var(--shadow-lg)'
                  }}>
                    <strong>Risk Score:</strong> {item.score}/100 <br/>
                    <strong>Type:</strong> {item.type} <br/>
                    {item.biasType && <><strong>Bias:</strong> {item.biasType}</>}
                  </div>
                )}
              </div>
            )
          })}
        </div>

        {/* Legend */}
        <div style={{ display: 'flex', gap: '20px', marginTop: '16px', paddingTop: '12px', borderTop: '1px solid var(--border-subtle)' }}>
          {[
            { color: '#FC8181', label: 'High Risk (Sensitive)' },
            { color: '#ECC94B', label: 'Medium Risk (Proxy)' },
            { color: '#48BB78', label: 'Low Risk (Technical)' },
          ].map(legend => (
            <div key={legend.label} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: legend.color }} />
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{legend.label}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
