import React, { useState, useMemo } from 'react'
import { simulateFlip, isPositive } from '../../lib/biasEngine'
import { ArrowRight, AlertTriangle, CheckCircle, RotateCcw, User, Zap } from 'lucide-react'
import { useData } from '../../lib/DataContext'

export default function ProfileFlipper({ rows, columns, sensitiveAttrs, targetColumn }) {
  const { t } = useData()
  const [selectedRow, setSelectedRow] = useState(0)
  const [flipAttr, setFlipAttr] = useState(sensitiveAttrs[0] || '')
  const [flipValue, setFlipValue] = useState('')
  const [result, setResult] = useState(null)
  const [animating, setAnimating] = useState(false)

  // Get unique values for the selected flip attribute
  const flipOptions = useMemo(() => {
    if (!flipAttr) return []
    const vals = [...new Set(rows.map(r => String(r[flipAttr] ?? '')))]
    return vals.filter(Boolean).sort()
  }, [flipAttr, rows])

  const currentRow = rows[selectedRow]

  const doFlip = () => {
    if (!flipAttr || !flipValue || !currentRow) return
    setAnimating(true)
    setTimeout(() => {
      const res = simulateFlip(rows, selectedRow, flipAttr, flipValue, targetColumn)
      setResult(res)
      setAnimating(false)
    }, 600)
  }

  const reset = () => {
    setResult(null)
    setFlipValue('')
  }

  return (
    <div className="card fade-in-up" style={{ marginBottom: '24px' }}>
      <div className="card-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{
            width: '32px', height: '32px', borderRadius: 'var(--radius-md)',
            background: 'rgba(183,148,244,0.15)', display: 'flex',
            alignItems: 'center', justifyContent: 'center'
          }}>
            <RotateCcw size={16} style={{ color: 'var(--accent-purple)' }} />
          </div>
          <div>
            <h3 style={{ fontSize: '1rem', fontWeight: 600 }}>{t('Profile Flipper')}</h3>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              {t('Counterfactual simulation — flip one attribute, see if the decision changes')}
            </p>
          </div>
        </div>
      </div>

      <div className="card-body">
        {/* Controls */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr auto', gap: '12px', marginBottom: '20px', alignItems: 'end' }}>
          <div>
            <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: '6px' }}>
              {t('Row Index')}
            </label>
            <input
              type="number"
              className="input"
              value={selectedRow}
              onChange={e => { setSelectedRow(Math.max(0, Math.min(rows.length - 1, +e.target.value))); setResult(null) }}
              min={0}
              max={rows.length - 1}
              style={{ fontFamily: 'var(--font-mono)' }}
            />
          </div>
          <div>
            <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: '6px' }}>
              {t('Attribute to Flip')}
            </label>
            <select
              className="input select"
              value={flipAttr}
              onChange={e => { setFlipAttr(e.target.value); setFlipValue(''); setResult(null) }}
            >
              <option value="">{t('Select...')}</option>
              {sensitiveAttrs.map(a => <option key={a} value={a}>{a}</option>)}
              {columns.filter(c => !sensitiveAttrs.includes(c) && c !== targetColumn).map(c =>
                <option key={c} value={c}>{c}</option>
              )}
            </select>
          </div>
          <div>
            <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: '6px' }}>
              Flip to Value
            </label>
            <select
              className="input select"
              value={flipValue}
              onChange={e => { setFlipValue(e.target.value); setResult(null) }}
            >
              <option value="">{t('Select...')}</option>
              {flipOptions
                .filter(v => currentRow && String(currentRow[flipAttr]) !== v)
                .map(v => <option key={v} value={v}>{v}</option>)}
            </select>
          </div>
          <button
            className="btn btn-primary"
            onClick={doFlip}
            disabled={!flipAttr || !flipValue || animating}
            style={{ marginBottom: '1px' }}
          >
            <Zap size={16} />
            {animating ? t('Flipping...') : t('Flip')}
          </button>
        </div>

        {/* Current row preview */}
        {currentRow && (
          <div style={{
            padding: '12px 16px',
            borderRadius: 'var(--radius-md)',
            background: 'var(--bg-tertiary)',
            border: '1px solid var(--border-subtle)',
            marginBottom: '16px',
            fontSize: '0.8125rem'
          }}>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
              {Object.entries(currentRow).slice(0, 10).map(([key, val]) => (
                <span key={key} style={{
                  padding: '2px 8px',
                  borderRadius: '4px',
                  background: key === flipAttr ? 'rgba(183,148,244,0.2)' : key === targetColumn ? 'rgba(99,179,237,0.15)' : 'var(--bg-card)',
                  border: `1px solid ${key === flipAttr ? 'var(--accent-purple)' : 'var(--border-subtle)'}`,
                  fontFamily: 'var(--font-mono)',
                  fontSize: '0.75rem'
                }}>
                  <span style={{ color: 'var(--text-muted)' }}>{key}: </span>
                  <span style={{ color: key === flipAttr ? 'var(--accent-purple)' : 'var(--text-primary)', fontWeight: 600 }}>
                    {String(val)}
                  </span>
                </span>
              ))}
            </div>
          </div>
        )}

        {/* 3D Flip Result */}
        {animating && (
          <div style={{ textAlign: 'center', padding: '40px' }}>
            <div style={{
              width: '80px', height: '80px', margin: '0 auto',
              borderRadius: '50%', border: '3px solid var(--accent-purple)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              animation: 'spin 0.6s linear infinite'
            }}>
              <RotateCcw size={30} style={{ color: 'var(--accent-purple)' }} />
            </div>
            <p style={{ marginTop: '16px', color: 'var(--text-secondary)', fontWeight: 500 }}>
              {t('Simulating counterfactual scenario...')}
            </p>
          </div>
        )}

        {result && !animating && (
          <div className="fade-in-up">
            {/* Decision comparison */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: '1fr auto 1fr',
              gap: '16px',
              alignItems: 'center',
              marginBottom: '16px'
            }}>
              {/* Original */}
              <div style={{
                padding: '20px',
                borderRadius: 'var(--radius-lg)',
                background: 'var(--bg-card)',
                border: '1px solid var(--border-subtle)',
                textAlign: 'center'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', marginBottom: '8px' }}>
                  <User size={16} style={{ color: 'var(--text-secondary)' }} />
                  <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase' }}>{t('Original')}</span>
                </div>
                <div style={{
                  fontSize: '0.875rem', fontWeight: 600, marginBottom: '8px',
                  fontFamily: 'var(--font-mono)', color: 'var(--accent-purple)'
                }}>
                  {flipAttr}: {currentRow?.[flipAttr] ?? '—'}
                </div>
                <div style={{
                  padding: '8px 16px',
                  borderRadius: '100px',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  background: result.originalOutcome === 'Positive' ? 'rgba(72,187,120,0.15)' : 'rgba(252,129,129,0.15)',
                  color: result.originalOutcome === 'Positive' ? 'var(--accent-green)' : 'var(--accent-red)',
                  fontWeight: 700,
                  fontSize: '0.875rem'
                }}>
                  {result.originalOutcome === 'Positive' ? <CheckCircle size={14} /> : <AlertTriangle size={14} />}
                  {t(result.originalOutcome)}
                </div>
              </div>

              {/* Arrow */}
              <div style={{ textAlign: 'center' }}>
                <ArrowRight size={24} style={{
                  color: result.changed ? 'var(--accent-red)' : 'var(--accent-green)',
                  animation: result.changed ? 'heartbeat 1.2s ease-in-out infinite' : 'none'
                }} />
              </div>

              {/* Flipped */}
              <div style={{
                padding: '20px',
                borderRadius: 'var(--radius-lg)',
                background: result.changed ? 'rgba(252,129,129,0.05)' : 'rgba(72,187,120,0.05)',
                border: `2px solid ${result.changed ? 'rgba(252,129,129,0.3)' : 'rgba(72,187,120,0.3)'}`,
                textAlign: 'center'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', marginBottom: '8px' }}>
                  <RotateCcw size={16} style={{ color: 'var(--text-secondary)' }} />
                  <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase' }}>{t('Flipped')}</span>
                </div>
                <div style={{
                  fontSize: '0.875rem', fontWeight: 600, marginBottom: '8px',
                  fontFamily: 'var(--font-mono)', color: 'var(--accent-purple)'
                }}>
                  {flipAttr}: {flipValue}
                </div>
                <div style={{
                  padding: '8px 16px',
                  borderRadius: '100px',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  background: result.flippedOutcome === 'Positive' ? 'rgba(72,187,120,0.15)' : 'rgba(252,129,129,0.15)',
                  color: result.flippedOutcome === 'Positive' ? 'var(--accent-green)' : 'var(--accent-red)',
                  fontWeight: 700,
                  fontSize: '0.875rem'
                }}>
                  {result.flippedOutcome === 'Positive' ? <CheckCircle size={14} /> : <AlertTriangle size={14} />}
                  {t(result.flippedOutcome)}
                </div>
              </div>
            </div>

            {/* Alert banner */}
            <div style={{
              padding: '14px 18px',
              borderRadius: 'var(--radius-md)',
              background: result.changed ? 'rgba(252,129,129,0.1)' : 'rgba(72,187,120,0.1)',
              border: `1px solid ${result.changed ? 'rgba(252,129,129,0.3)' : 'rgba(72,187,120,0.3)'}`,
              display: 'flex',
              alignItems: 'center',
              gap: '12px'
            }}>
              {result.changed ? (
                <AlertTriangle size={20} style={{ color: 'var(--accent-red)', flexShrink: 0 }} />
              ) : (
                <CheckCircle size={20} style={{ color: 'var(--accent-green)', flexShrink: 0 }} />
              )}
              <div>
                <p style={{
                  fontWeight: 700,
                  fontSize: '0.875rem',
                  color: result.changed ? 'var(--accent-red)' : 'var(--accent-green)'
                }}>
                  {result.changed
                    ? `${t('Decision flipped!')} ${t('Changing')} ${flipAttr} ${t('from')} "${currentRow?.[flipAttr]}" ${t('to')} "${flipValue}" ${t('reverses the outcome')}.`
                    : `✓ ${t('Decision stable.')} ${t('Changing')} ${flipAttr} ${t('does not affect the outcome')}.`
                  }
                </p>
                <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                  Based on {result.sampleSize} similar profiles • Positive rate: {(result.positiveRate * 100).toFixed(1)}%
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
