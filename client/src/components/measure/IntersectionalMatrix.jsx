import React, { useMemo, useState } from 'react'
import { intersectionalMatrix } from '../../lib/biasEngine'
import { Grid3x3, AlertTriangle } from 'lucide-react'
import { useData } from '../../lib/DataContext'

function rateToColor(rate) {
  if (rate === null) return 'var(--bg-tertiary)'
  // Green (high rate) → Yellow (medium) → Red (low rate)
  if (rate >= 0.6) return `rgba(72, 187, 120, ${0.2 + rate * 0.5})`
  if (rate >= 0.3) return `rgba(236, 201, 75, ${0.2 + rate * 0.5})`
  return `rgba(252, 129, 129, ${0.3 + (1 - rate) * 0.4})`
}

function rateToTextColor(rate) {
  if (rate === null) return 'var(--text-muted)'
  if (rate >= 0.6) return '#48BB78'
  if (rate >= 0.3) return '#ECC94B'
  return '#FC8181'
}

export default function IntersectionalMatrix({ rows, columns, sensitiveAttrs, targetColumn }) {
  const { t } = useData()
  const [rowAttr, setRowAttr] = useState(sensitiveAttrs[0] || '')
  const [colAttr, setColAttr] = useState(sensitiveAttrs[1] || columns.find(c => !sensitiveAttrs.includes(c) && c !== targetColumn) || '')
  const [hoveredCell, setHoveredCell] = useState(null)

  const matrixData = useMemo(() => {
    if (!rowAttr || !colAttr || !targetColumn || rows.length === 0) return null
    return intersectionalMatrix(rows, rowAttr, colAttr, targetColumn)
  }, [rows, rowAttr, colAttr, targetColumn])

  // Find the worst intersection
  const worstCell = useMemo(() => {
    if (!matrixData) return null
    let worst = { rate: 1, row: '', col: '' }
    matrixData.rowValues.forEach(r => {
      matrixData.colValues.forEach(c => {
        const cell = matrixData.matrix[r]?.[c]
        if (cell && cell.rate !== null && cell.rate < worst.rate && cell.count >= 5) {
          worst = { rate: cell.rate, row: r, col: c, count: cell.count }
        }
      })
    })
    return worst.row ? worst : null
  }, [matrixData])

  if (!sensitiveAttrs.length || sensitiveAttrs.length < 1) {
    return null
  }

  return (
    <div className="card fade-in-up" style={{ marginBottom: '24px' }}>
      <div className="card-header">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{
              width: '32px', height: '32px', borderRadius: 'var(--radius-md)',
              background: 'rgba(237,137,54,0.15)', display: 'flex',
              alignItems: 'center', justifyContent: 'center'
            }}>
              <Grid3x3 size={16} style={{ color: 'var(--accent-orange)' }} />
            </div>
            <div>
              <h3 style={{ fontSize: '1rem', fontWeight: 600 }}>{t('Intersectional Bias Matrix')}</h3>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                {t('Analyze compounded disadvantage across two attributes')}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="card-body">
        {/* Attribute selectors */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '20px' }}>
          <div>
            <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: '6px' }}>
              {t('Row Attribute')}
            </label>
            <select className="input select" value={rowAttr} onChange={e => setRowAttr(e.target.value)}>
              <option value="">{t('Select...')}</option>
              {columns.filter(c => c !== targetColumn && c !== colAttr).map(c =>
                <option key={c} value={c}>{c}</option>
              )}
            </select>
          </div>
          <div>
            <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: '6px' }}>
              {t('Column Attribute')}
            </label>
            <select className="input select" value={colAttr} onChange={e => setColAttr(e.target.value)}>
              <option value="">{t('Select...')}</option>
              {columns.filter(c => c !== targetColumn && c !== rowAttr).map(c =>
                <option key={c} value={c}>{c}</option>
              )}
            </select>
          </div>
        </div>

        {/* Matrix Grid */}
        {matrixData && matrixData.rowValues.length > 0 && matrixData.colValues.length > 0 ? (
          <>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ borderCollapse: 'separate', borderSpacing: '4px', width: '100%' }}>
                <thead>
                  <tr>
                    <th style={{
                      padding: '8px 12px', fontSize: '0.75rem', fontWeight: 700,
                      color: 'var(--accent-orange)', textTransform: 'uppercase',
                      letterSpacing: '0.05em', textAlign: 'left',
                      fontFamily: 'var(--font-mono)'
                    }}>
                      {rowAttr} ↓ / {colAttr} →
                    </th>
                    {matrixData.colValues.map(c => (
                      <th key={c} style={{
                        padding: '8px 12px', fontSize: '0.75rem', fontWeight: 600,
                        color: 'var(--text-secondary)', textAlign: 'center',
                        minWidth: '80px'
                      }}>
                        {c}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {matrixData.rowValues.map(r => (
                    <tr key={r}>
                      <td style={{
                        padding: '8px 12px', fontSize: '0.8125rem', fontWeight: 600,
                        color: 'var(--text-secondary)', whiteSpace: 'nowrap'
                      }}>
                        {r}
                      </td>
                      {matrixData.colValues.map(c => {
                        const cell = matrixData.matrix[r]?.[c]
                        const isWorst = worstCell && worstCell.row === r && worstCell.col === c
                        const cellKey = `${r}-${c}`
                        return (
                          <td
                            key={c}
                            onMouseEnter={() => setHoveredCell(cellKey)}
                            onMouseLeave={() => setHoveredCell(null)}
                            style={{
                              padding: '12px',
                              textAlign: 'center',
                              borderRadius: 'var(--radius-sm)',
                              background: cell?.rate !== null ? rateToColor(cell.rate) : 'var(--bg-tertiary)',
                              border: isWorst ? '2px solid var(--accent-red)' : '1px solid var(--border-subtle)',
                              position: 'relative',
                              cursor: 'pointer',
                              transition: 'all var(--transition-fast)'
                            }}
                          >
                            <div style={{
                              fontFamily: 'var(--font-mono)',
                              fontWeight: 700,
                              fontSize: '1rem',
                              color: cell?.rate !== null ? rateToTextColor(cell.rate) : 'var(--text-muted)'
                            }}>
                              {cell?.rate !== null ? `${(cell.rate * 100).toFixed(0)}%` : '—'}
                            </div>
                            <div style={{ fontSize: '0.625rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                              n={cell?.count || 0}
                            </div>
                            {isWorst && (
                              <div style={{
                                position: 'absolute', top: '-4px', right: '-4px',
                                width: '16px', height: '16px', borderRadius: '50%',
                                background: 'var(--accent-red)', display: 'flex',
                                alignItems: 'center', justifyContent: 'center'
                              }}>
                                <AlertTriangle size={10} color="white" />
                              </div>
                            )}
                          </td>
                        )
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Worst intersection alert */}
            {worstCell && (
              <div style={{
                marginTop: '16px',
                padding: '12px 16px',
                borderRadius: 'var(--radius-md)',
                background: 'rgba(252,129,129,0.08)',
                border: '1px solid rgba(252,129,129,0.25)',
                display: 'flex',
                alignItems: 'center',
                gap: '10px'
              }}>
                <AlertTriangle size={16} style={{ color: 'var(--accent-red)', flexShrink: 0 }} />
                <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>
                  <strong style={{ color: 'var(--accent-red)' }}>{t('Compounded disadvantage detected')}:</strong>{' '}
                  <span style={{ fontFamily: 'var(--font-mono)', color: 'var(--text-primary)' }}>
                    {worstCell.row} × {worstCell.col}
                  </span>{' '}
                  {t('has the lowest positive outcome rate at')}{' '}
                  <strong style={{ color: 'var(--accent-red)' }}>{(worstCell.rate * 100).toFixed(1)}%</strong>
                  {' '}(n={worstCell.count})
                </p>
              </div>
            )}

            {/* Color Legend */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginTop: '12px' }}>
              <span style={{ fontSize: '0.6875rem', color: 'var(--text-muted)', fontWeight: 600 }}>{t('OUTCOME RATE')}:</span>
              <div style={{
                display: 'flex', alignItems: 'center', gap: '4px',
                height: '12px', width: '200px', borderRadius: '6px', overflow: 'hidden'
              }}>
                <div style={{ flex: 1, height: '100%', background: 'rgba(252,129,129,0.5)' }} />
                <div style={{ flex: 1, height: '100%', background: 'rgba(236,201,75,0.5)' }} />
                <div style={{ flex: 1, height: '100%', background: 'rgba(72,187,120,0.5)' }} />
              </div>
              <span style={{ fontSize: '0.625rem', color: 'var(--text-muted)' }}>{t('Low → High')}</span>
            </div>
          </>
        ) : (
          <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>
            <Grid3x3 size={40} style={{ opacity: 0.3, margin: '0 auto 12px', display: 'block' }} />
            <p>{t('Select two attributes to generate the intersectional matrix')}</p>
          </div>
        )}
      </div>
    </div>
  )
}
