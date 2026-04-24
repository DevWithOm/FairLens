import React, { useState, useMemo, useCallback } from 'react'
import { useData } from '../../lib/DataContext'
import {
  BarChart3, AlertTriangle, CheckCircle, Play,
  TrendingUp, Percent, Users, Scale, Shield,
  ChevronRight, Info, RefreshCw, Cpu, Loader2
} from 'lucide-react'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, RadarChart, PolarGrid,
  PolarAngleAxis, PolarRadiusAxis, Radar,
  PieChart, Pie, Cell, Legend
} from 'recharts'
import { fairnessScore, fairnessGrade, isPositive } from '../../lib/biasEngine'
import ProfileFlipper from '../measure/ProfileFlipper'
import IntersectionalMatrix from '../measure/IntersectionalMatrix'
import MetricExplainer from '../measure/MetricExplainer'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'
const CHART_COLORS = ['#63B3ED', '#38B2AC', '#48BB78', '#ECC94B', '#ED8936', '#FC8181', '#B794F4', '#F687B3']

function calculateBiasMetrics(rows, sensitiveAttr, targetCol) {
  if (!rows || rows.length === 0 || !sensitiveAttr || !targetCol) return null

  const groups = {}
  rows.forEach(row => {
    if (!row) return
    const group = String(row[sensitiveAttr] ?? 'Unknown')
    if (!groups[group]) groups[group] = { total: 0, positive: 0 }
    groups[group].total++
    if (isPositive(row[targetCol])) {
      groups[group].positive++
    }
  })

  const groupStats = Object.entries(groups).map(([name, { total, positive }]) => ({
    name,
    total,
    positive,
    rate: total > 0 ? positive / total : 0
  })).sort((a, b) => b.rate - a.rate)

  if (groupStats.length < 2) return null

  const maxRate = Math.max(...groupStats.map(g => g.rate))
  const minRate = Math.min(...groupStats.map(g => g.rate))

  // Disparate Impact Ratio
  const disparateImpact = maxRate > 0 ? minRate / maxRate : 1
  // Statistical Parity Difference
  const statisticalParity = maxRate - minRate
  // Equal Opportunity (simplified as equalized rate ratio)
  const equalOpportunity = 1 - statisticalParity

  const overallRate = rows.filter(r => isPositive(r[targetCol])).length / rows.length

  return {
    groups: groupStats,
    disparateImpact,
    statisticalParity,
    equalOpportunity,
    overallRate,
    privilegedGroup: groupStats[0].name,
    unprivilegedGroup: groupStats[groupStats.length - 1].name,
    biasLevel: disparateImpact >= 0.8 ? 'low' : disparateImpact >= 0.6 ? 'moderate' : disparateImpact >= 0.4 ? 'high' : 'critical'
  }
}

function BiasGauge({ value, label, thresholds = { good: 0.8, warn: 0.6 } }) {
  const { t } = useData()
  const pct = Math.min(Math.max(value, 0), 1) * 100
  const color = value >= thresholds.good ? 'var(--bias-low)' :
                value >= thresholds.warn ? 'var(--bias-moderate)' :
                value >= 0.4 ? 'var(--bias-high)' : 'var(--bias-critical)'
  
  return (
    <div style={{ textAlign: 'center' }}>
      <div style={{
        position: 'relative',
        width: '120px',
        height: '120px',
        margin: '0 auto 12px'
      }}>
        <svg viewBox="0 0 120 120" style={{ width: '100%', height: '100%' }}>
          <circle cx="60" cy="60" r="52" fill="none" stroke="var(--bg-tertiary)" strokeWidth="8" />
          <circle
            cx="60" cy="60" r="52" fill="none"
            stroke={color}
            strokeWidth="8"
            strokeLinecap="round"
            strokeDasharray={`${pct * 3.27} 327`}
            transform="rotate(-90 60 60)"
            style={{ transition: 'stroke-dasharray 1s ease-out' }}
          />
        </svg>
        <div style={{
          position: 'absolute',
          inset: 0,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          <span style={{
            fontSize: '1.5rem',
            fontWeight: 800,
            color,
            fontFamily: 'var(--font-mono)'
          }}>{(value * 100).toFixed(1)}</span>
          <span style={{
            fontSize: '0.625rem',
            color: 'var(--text-muted)',
            fontWeight: 600,
            textTransform: 'uppercase'
          }}>%</span>
        </div>
      </div>
      <p style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-secondary)' }}>{label}</p>
    </div>
  )
}

function FairnessScoreGauge({ score }) {
  const { t } = useData()
  const color = score >= 71 ? '#48BB78' : score >= 41 ? '#ECC94B' : '#FC8181'
  const showHeartbeat = score < 50

  return (
    <div className="metric-card fade-in-up stagger-1" style={{ textAlign: 'center', position: 'relative' }}>
      {/* Heartbeat rings when score is low */}
      {showHeartbeat && (
        <>
          <div className="pulse-ring" style={{
            position: 'absolute', inset: '20px',
            borderRadius: '50%', pointerEvents: 'none'
          }} />
        </>
      )}
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px', justifyContent: 'center' }}>
        <Shield size={16} style={{ color }} />
        <span className="metric-label" style={{ marginTop: 0 }}>{t('Fairness Score')}</span>
        <MetricExplainer metricName="Fairness Score" value={score} />
      </div>
      <div style={{
        position: 'relative',
        width: '140px',
        height: '140px',
        margin: '0 auto 12px'
      }}>
        <svg viewBox="0 0 140 140" style={{ width: '100%', height: '100%' }}>
          <circle cx="70" cy="70" r="60" fill="none" stroke="var(--bg-tertiary)" strokeWidth="10" />
          <circle
            cx="70" cy="70" r="60" fill="none"
            stroke={color}
            strokeWidth="10"
            strokeLinecap="round"
            strokeDasharray={`${score * 3.77} 377`}
            transform="rotate(-90 70 70)"
            style={{ transition: 'stroke-dasharray 1.5s cubic-bezier(0.4, 0, 0.2, 1)' }}
          />
        </svg>
        <div style={{
          position: 'absolute', inset: 0,
          display: 'flex', flexDirection: 'column',
          alignItems: 'center', justifyContent: 'center'
        }}>
          <span style={{
            fontSize: '2.5rem', fontWeight: 900,
            color, fontFamily: 'var(--font-mono)',
            lineHeight: 1, letterSpacing: '-0.04em'
          }}>{score}</span>
          <span style={{
            fontSize: '0.6875rem', color: 'var(--text-muted)',
            fontWeight: 600, textTransform: 'uppercase'
          }}>/ 100</span>
        </div>
      </div>
      <div style={{
        padding: '4px 14px', borderRadius: '100px', display: 'inline-block',
        background: `${color}22`, color, fontWeight: 700, fontSize: '0.75rem'
      }}>
        {score >= 71 ? t('FAIR') : score >= 41 ? t('NEEDS WORK') : t('UNFAIR')}
      </div>
    </div>
  )
}

// ── Fairness Grade Cards ──
function GradeCards({ result }) {
  if (!result) return null
  const bestRate = result.groups[0]?.rate || 0
  const grades = result.groups.map(g => ({
    ...g,
    grade: fairnessGrade(g.rate, bestRate)
  }))

  const gradeColors = { A: '#48BB78', B: '#38B2AC', C: '#ECC94B', D: '#ED8936', F: '#FC8181' }

  return (
    <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', marginTop: '16px' }}>
      {grades.map((g, i) => (
        <div key={g.name} style={{
          padding: '16px 24px', borderRadius: 'var(--radius-lg)',
          background: 'var(--bg-card)', border: '1px solid var(--border-subtle)',
          textAlign: 'center', minWidth: '100px'
        }}>
          <div style={{
            fontSize: '2rem', fontWeight: 900,
            color: gradeColors[g.grade] || 'var(--text-muted)',
            fontFamily: 'var(--font-mono)',
            lineHeight: 1, marginBottom: '8px'
          }}>
            {g.grade}
          </div>
          <div style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-primary)' }}>
            {g.name}
          </div>
          <div style={{ fontSize: '0.6875rem', color: 'var(--text-muted)', marginTop: '2px' }}>
            {(g.rate * 100).toFixed(1)}% rate
          </div>
        </div>
      ))}
    </div>
  )
}

function CustomTooltip({ active, payload, label }) {
  const { t } = useData()
  if (!active || !payload?.length) return null
  return (
    <div style={{
      background: 'var(--bg-elevated)',
      border: '1px solid var(--border-default)',
      borderRadius: 'var(--radius-sm)',
      padding: '10px 14px',
      fontSize: '0.8125rem'
    }}>
      <p style={{ fontWeight: 600, marginBottom: '4px' }}>{label}</p>
      {payload.map((p, i) => (
        <p key={i} style={{ color: p.color }}>
          {t(p.name)}: {typeof p.value === 'number' ? p.value.toFixed(3) : p.value}
        </p>
      ))}
    </div>
  )
}

export default function MeasureTab() {
  const { rows, columns, sensitiveAttrs, targetColumn, analysisResults, setAnalysisResults, modelResults, setModelResults, t } = useData()
  const [analyzing, setAnalyzing] = useState(false)
  const [trainingModel, setTrainingModel] = useState(false)
  const [activeMetric, setActiveMetric] = useState('disparateImpact')

  const canAnalyze = rows.length > 0 && sensitiveAttrs.length > 0 && targetColumn

  // Train ML model after statistical analysis
  const trainMLModel = useCallback(async () => {
    setTrainingModel(true)
    try {
      const resp = await fetch(API_URL + '/analysis/train', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rows, columns, sensitiveAttrs, targetColumn })
      })
      if (resp.ok) {
        const data = await resp.json()
        if (data.success) {
          setModelResults(data)
        }
      }
    } catch (err) {
      console.error('ML model training failed:', err)
    } finally {
      setTrainingModel(false)
    }
  }, [rows, columns, sensitiveAttrs, targetColumn, setModelResults])

  const runAnalysis = () => {
    setAnalyzing(true)
    setTimeout(async () => {
      try {
        const results = {}
        sensitiveAttrs.forEach(attr => {
          const res = calculateBiasMetrics(rows, attr, targetColumn)
          if (res) results[attr] = res
        })
        setAnalysisResults(results)
        // Also train ML model
        setAnalyzing(false)
        await trainMLModel()
      } catch (err) {
        console.error("Bias analysis failed:", err)
        setAnalyzing(false)
      }
    }, 800)
  }

  const firstResult = analysisResults ? Object.values(analysisResults).find(Boolean) : null

  // Compute overall fairness score (0-100)
  const overallScore = useMemo(() => {
    if (!firstResult) return null
    const rates = firstResult.groups.map(g => ({ rate: g.rate }))
    return fairnessScore(rates)
  }, [firstResult])

  if (!canAnalyze) {
    return (
      <div className="fade-in-up" style={{ textAlign: 'center', paddingTop: '80px' }}>
        <div style={{
          width: '80px',
          height: '80px',
          borderRadius: '50%',
          background: 'rgba(236,201,75,0.1)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          margin: '0 auto 20px'
        }}>
          <AlertTriangle size={36} style={{ color: 'var(--accent-yellow)' }} />
        </div>
        <h2 style={{ fontSize: '1.375rem', fontWeight: 700, marginBottom: '8px' }}>
          {t('Configuration Required')}
        </h2>
        <p style={{ color: 'var(--text-secondary)', maxWidth: '400px', margin: '0 auto 24px' }}>
          {t('Go back to Inspect and configure:')}
        </p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', alignItems: 'center' }}>
          {rows.length === 0 && (
            <span className="badge badge-red">{t('✕ No dataset loaded')}</span>
          )}
          {sensitiveAttrs.length === 0 && (
            <span className="badge badge-yellow">{t('✕ No sensitive attributes selected')}</span>
          )}
          {!targetColumn && (
            <span className="badge badge-yellow">{t('✕ No target column selected')}</span>
          )}
        </div>
      </div>
    )
  }

  return (
    <div className="fade-in-up">
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
            <BarChart3 size={20} style={{ color: 'var(--accent-blue)' }} />
            <h2 style={{ fontSize: '1.375rem', fontWeight: 700, letterSpacing: '-0.02em' }}>
              {t('Bias Measurement')}
            </h2>
          </div>
          <p style={{ color: 'var(--text-primary)', fontSize: '0.875rem' }}>
            {t('Analyze target outcomes across sensitive demographic groups')} <strong style={{ color: 'var(--accent-blue)', fontFamily: 'var(--font-mono)' }}>{targetColumn}</strong> •
            Protected: {sensitiveAttrs.map(a => <span key={a} className="badge badge-purple" style={{ marginLeft: '6px' }}>{a}</span>)}
          </p>
        </div>
        <button
          className="btn btn-primary"
          onClick={runAnalysis}
          disabled={analyzing}
          id="run-analysis"
        >
          {analyzing ? <RefreshCw size={16} className="spin" /> : <Play size={16} />}
          {analyzing ? t('Analyzing...') : analysisResults ? t('Re-analyze') : t('Execute Forensic Audit')}
        </button>
      </div>

      {analyzing && (
        <div style={{ textAlign: 'center', padding: '60px 0' }}>
          <div className="xray-container" style={{
            width: '200px',
            height: '200px',
            margin: '0 auto 20px',
            borderRadius: 'var(--radius-lg)',
            background: 'var(--bg-card)',
            border: '1px solid var(--border-subtle)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <div className="xray-line" />
            <Scale size={60} style={{ color: 'var(--accent-blue)', opacity: 0.3 }} />
          </div>
          <p style={{ fontWeight: 600 }}>{t('Scanning for bias patterns...')}</p>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>{t('Analyzing')} {rows.length.toLocaleString()} {t('records across')} {sensitiveAttrs.length} {t('attributes')}</p>
        </div>
      )}

      {analysisResults && !analyzing && (
        <>
          {/* ═══ NEW: Fairness Score + Summary Cards ═══ */}
          {firstResult && (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginBottom: '32px' }}>
              {/* NEW: Overall Fairness Score (0-100) */}
              {overallScore !== null && <FairnessScoreGauge score={overallScore} />}
              
              <div className="metric-card fade-in-up stagger-2">
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
                  <Scale size={16} style={{ color: 'var(--accent-blue)' }} />
                  <span className="metric-label" style={{ marginTop: 0 }}>{t('Disparate Impact Ratio')}</span>
                  <MetricExplainer metricName="Disparate Impact" value={firstResult.disparateImpact} t={t} />
                </div>
                <BiasGauge value={firstResult.disparateImpact} label={t('Fairness Ratio')} />
                <p style={{
                  marginTop: '8px',
                  fontSize: '0.75rem',
                  color: firstResult.disparateImpact >= 0.8 ? 'var(--bias-low)' : 'var(--bias-critical)',
                  textAlign: 'center',
                  fontWeight: 600
                }}>
                  {firstResult.disparateImpact >= 0.8 ? t('✓ Passes 4/5ths Rule') : t('✕ Fails 4/5ths Rule')}
                </p>
              </div>
              <div className="metric-card fade-in-up stagger-3">
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
                  <TrendingUp size={16} style={{ color: 'var(--accent-teal)' }} />
                  <span className="metric-label" style={{ marginTop: 0 }}>{t('Statistical Parity Gap')}</span>
                  <MetricExplainer metricName="Statistical Parity" value={firstResult.statisticalParity} t={t} />
                </div>
                <BiasGauge value={1 - firstResult.statisticalParity} label={t('Parity Score')} />
                <p style={{
                  marginTop: '8px',
                  fontSize: '0.75rem',
                  color: 'var(--text-muted)',
                  textAlign: 'center'
                }}>
                  {t('Gap:')} {(firstResult.statisticalParity * 100).toFixed(1)}%
                </p>
              </div>
              <div className="metric-card fade-in-up stagger-4">
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
                  <Shield size={16} style={{
                    color: firstResult.biasLevel === 'low' ? 'var(--bias-low)' :
                           firstResult.biasLevel === 'moderate' ? 'var(--bias-moderate)' :
                           firstResult.biasLevel === 'high' ? 'var(--bias-high)' : 'var(--bias-critical)'
                  }} />
                  <span className="metric-label" style={{ marginTop: 0 }}>{t('Bias Level')}</span>
                  <MetricExplainer metricName="Bias Level" value={firstResult.biasLevel.toUpperCase()} />
                </div>
                <div style={{ textAlign: 'center', padding: '20px 0' }}>
                  <span style={{
                    fontSize: '1.25rem',
                    fontWeight: 800,
                    textTransform: 'uppercase',
                    padding: '8px 20px',
                    borderRadius: '100px',
                    background: firstResult.biasLevel === 'low' ? 'rgba(72,187,120,0.15)' :
                                firstResult.biasLevel === 'moderate' ? 'rgba(236,201,75,0.15)' :
                                firstResult.biasLevel === 'high' ? 'rgba(237,137,54,0.15)' : 'rgba(252,129,129,0.15)',
                    color: firstResult.biasLevel === 'low' ? 'var(--bias-low)' :
                           firstResult.biasLevel === 'moderate' ? 'var(--bias-moderate)' :
                           firstResult.biasLevel === 'high' ? 'var(--bias-high)' : 'var(--bias-critical)'
                  }}>
                    {firstResult.biasLevel}
                  </span>
                </div>
                <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textAlign: 'center', marginTop: '8px' }}>
                  {firstResult.privilegedGroup} vs {firstResult.unprivilegedGroup}
                </p>
              </div>
            </div>
          )}

          {/* ═══ NEW: Fairness Grade Cards (A-F) ═══ */}
          {firstResult && (
            <div className="card fade-in-up" style={{ marginBottom: '24px' }}>
              <div className="card-header">
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <Shield size={18} style={{ color: 'var(--accent-teal)' }} />
                  <h3 style={{ fontSize: '1rem', fontWeight: 600 }}>Fairness Grades</h3>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                    A = ≤5% disparity • F = &gt;30% disparity
                  </span>
                </div>
              </div>
              <div className="card-body">
                <GradeCards result={firstResult} />
              </div>
            </div>
          )}

          {/* ═══ ML Model Performance ═══ */}
          {(trainingModel || modelResults) && (
            <div className="card fade-in-up" style={{ marginBottom: '24px', border: '1px solid rgba(99,179,237,0.2)' }}>
              <div className="card-header" style={{ background: 'rgba(99,179,237,0.04)' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div style={{
                      width: '32px', height: '32px', borderRadius: 'var(--radius-md)',
                      background: 'linear-gradient(135deg, #63B3ED, #B794F4)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center'
                    }}>
                      <Cpu size={16} style={{ color: 'white' }} />
                    </div>
                    <div>
                      <h3 style={{ fontSize: '1rem', fontWeight: 700 }}>ML Model Analysis</h3>
                      <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '1px' }}>
                        {modelResults?.ensemble ? `Ensemble Bagged (${modelResults.numTrees} trees)` : 'Decision Tree Classifier'} • {modelResults ? `Trained in ${modelResults.trainingTime}ms` : 'Training...'}
                      </p>
                    </div>
                  </div>
                  {modelResults && (
                    <span className={`badge ${modelResults.metrics.accuracy >= 0.7 ? 'badge-green' : modelResults.metrics.accuracy >= 0.5 ? 'badge-yellow' : 'badge-red'}`}>
                      {modelResults.modelType} • {modelResults.splitRatio} split
                    </span>
                  )}
                </div>
              </div>
              <div className="card-body">
                {trainingModel ? (
                  <div style={{ textAlign: 'center', padding: '40px' }}>
                    <div style={{
                      width: '56px', height: '56px', margin: '0 auto 14px',
                      borderRadius: '50%',
                      background: 'linear-gradient(135deg, rgba(99,179,237,0.15), rgba(183,148,244,0.15))',
                      display: 'flex', alignItems: 'center', justifyContent: 'center'
                    }}>
                      <Loader2 size={24} className="spin" style={{ color: 'var(--accent-blue)' }} />
                    </div>
                    <p style={{ fontWeight: 600, marginBottom: '4px' }}>Training Decision Tree Model...</p>
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.8125rem' }}>
                      {rows.length.toLocaleString()} samples • {columns.length} features
                    </p>
                  </div>
                ) : modelResults ? (
                  <>
                    {/* Performance Metrics Row */}
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px', marginBottom: '24px' }}>
                      {[
                        { label: 'Accuracy', value: modelResults.metrics.accuracy, color: '#63B3ED' },
                        { label: 'Precision', value: modelResults.metrics.precision, color: '#48BB78' },
                        { label: 'Recall', value: modelResults.metrics.recall, color: '#B794F4' },
                        { label: 'F1 Score', value: modelResults.metrics.f1, color: '#38B2AC' }
                      ].map(m => (
                        <div key={m.label} style={{
                          textAlign: 'center', padding: '16px',
                          borderRadius: 'var(--radius-md)',
                          background: 'var(--bg-tertiary)',
                          border: '1px solid var(--border-subtle)'
                        }}>
                          <div style={{
                            position: 'relative', width: '80px', height: '80px', margin: '0 auto 8px'
                          }}>
                            <svg viewBox="0 0 80 80" style={{ width: '100%', height: '100%' }}>
                              <circle cx="40" cy="40" r="34" fill="none" stroke="var(--bg-elevated)" strokeWidth="6" />
                              <circle cx="40" cy="40" r="34" fill="none" stroke={m.color} strokeWidth="6"
                                strokeLinecap="round"
                                strokeDasharray={`${m.value * 213.6} 213.6`}
                                transform="rotate(-90 40 40)"
                                style={{ transition: 'stroke-dasharray 1s ease-out' }}
                              />
                            </svg>
                            <div style={{
                              position: 'absolute', inset: 0, display: 'flex',
                              alignItems: 'center', justifyContent: 'center'
                            }}>
                              <span style={{
                                fontSize: '1.125rem', fontWeight: 800,
                                fontFamily: 'var(--font-mono)', color: m.color
                              }}>{(m.value * 100).toFixed(1)}</span>
                            </div>
                          </div>
                          <p style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)' }}>{m.label}</p>
                        </div>
                      ))}
                    </div>

                    {/* Model Fairness Metrics */}
                    {modelResults.fairnessMetrics && Object.entries(modelResults.fairnessMetrics).map(([attr, fm]) => (
                      <div key={attr} style={{
                        padding: '16px', borderRadius: 'var(--radius-md)',
                        background: 'var(--bg-tertiary)', border: '1px solid var(--border-subtle)',
                        marginBottom: '12px'
                      }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
                          <span className="badge badge-purple">{attr}</span>
                          <span style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
                            Model Fairness
                          </span>
                        </div>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px' }}>
                          <div style={{ textAlign: 'center' }}>
                            <p style={{ fontSize: '0.6875rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '4px' }}>
                              Model DI
                            </p>
                            <span style={{
                              fontSize: '1.375rem', fontWeight: 900, fontFamily: 'var(--font-mono)',
                              color: fm.modelDI >= 0.8 ? 'var(--bias-low)' : fm.modelDI >= 0.6 ? 'var(--bias-moderate)' : 'var(--bias-critical)'
                            }}>
                              {(fm.modelDI * 100).toFixed(1)}%
                            </span>
                            <p style={{ fontSize: '0.625rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                              {fm.modelDI >= 0.8 ? '✓ Passes 4/5ths' : '✕ Fails 4/5ths'}
                            </p>
                          </div>
                          <div style={{ textAlign: 'center' }}>
                            <p style={{ fontSize: '0.6875rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '4px' }}>
                              Equalized Odds
                            </p>
                            <span style={{
                              fontSize: '1.375rem', fontWeight: 900, fontFamily: 'var(--font-mono)',
                              color: fm.equalizedOdds >= 0.8 ? 'var(--accent-green)' : 'var(--accent-orange)'
                            }}>
                              {(fm.equalizedOdds * 100).toFixed(1)}%
                            </span>
                            <p style={{ fontSize: '0.625rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                              TPR/FPR parity
                            </p>
                          </div>
                          <div style={{ textAlign: 'center' }}>
                            <p style={{ fontSize: '0.6875rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '4px' }}>
                              Stat. Parity
                            </p>
                            <span style={{
                              fontSize: '1.375rem', fontWeight: 900, fontFamily: 'var(--font-mono)',
                              color: fm.statisticalParity < 0.1 ? 'var(--accent-green)' : 'var(--accent-orange)'
                            }}>
                              {(fm.statisticalParity * 100).toFixed(1)}%
                            </span>
                            <p style={{ fontSize: '0.625rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                              Prediction gap
                            </p>
                          </div>
                        </div>

                        {/* Per-group model metrics table */}
                        <div style={{ marginTop: '12px', maxHeight: '200px', overflowY: 'auto', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-sm)' }}>
                          <table className="data-table" style={{ margin: 0, border: 'none', fontSize: '0.75rem' }}>
                            <thead>
                              <tr>
                                <th>Group</th>
                                <th>Pred Rate</th>
                                <th>TPR</th>
                                <th>FPR</th>
                                <th>Precision</th>
                                <th>Accuracy</th>
                              </tr>
                            </thead>
                            <tbody>
                              {fm.groups.map((g, i) => (
                                <tr key={g.name}>
                                  <td>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                      <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: CHART_COLORS[i % CHART_COLORS.length] }} />
                                      {g.name}
                                    </div>
                                  </td>
                                  <td style={{ fontFamily: 'var(--font-mono)' }}>{(g.predRate * 100).toFixed(1)}%</td>
                                  <td style={{ fontFamily: 'var(--font-mono)' }}>{(g.tpr * 100).toFixed(1)}%</td>
                                  <td style={{ fontFamily: 'var(--font-mono)' }}>{(g.fpr * 100).toFixed(1)}%</td>
                                  <td style={{ fontFamily: 'var(--font-mono)' }}>{(g.precision * 100).toFixed(1)}%</td>
                                  <td style={{ fontFamily: 'var(--font-mono)' }}>{(g.accuracy * 100).toFixed(1)}%</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    ))}

                    {/* Training info footer */}
                    <div style={{
                      marginTop: '8px', padding: '8px 12px',
                      borderRadius: 'var(--radius-sm)',
                      background: 'rgba(99,179,237,0.06)',
                      border: '1px solid rgba(99,179,237,0.12)',
                      display: 'flex', alignItems: 'center', gap: '8px',
                      fontSize: '0.6875rem', color: 'var(--text-muted)'
                    }}>
                      <Cpu size={12} />
                      {modelResults.ensemble ? `Ensemble: ${modelResults.numTrees} trees` : 'Single tree'} •
                      Train: {modelResults.metrics.trainSize} samples •
                      Test: {modelResults.metrics.testSize} samples •
                      Features: {modelResults.features?.length || '—'} •
                      CM: TP={modelResults.metrics.tp} FP={modelResults.metrics.fp} FN={modelResults.metrics.fn} TN={modelResults.metrics.tn}
                    </div>
                  </>
                ) : null}
              </div>
            </div>
          )}

          {Object.entries(analysisResults).map(([attr, result]) => {
            if (!result) return null
            const barData = result.groups.map(g => ({
              name: g.name,
              rate: +(g.rate * 100).toFixed(2),
              count: g.total
            }))

            const pieData = result.groups.map(g => ({
              name: g.name,
              value: g.total
            }))

            return (
              <div key={attr} className="card fade-in-up" style={{ marginBottom: '24px' }}>
                <div className="card-header">
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <span className="badge badge-purple">{attr}</span>
                    <h3 style={{ fontSize: '1rem', fontWeight: 600 }}>{t('Outcome Rate by Group') || 'Outcome Rate by Group'}</h3>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                      DI = {(result.disparateImpact * 100).toFixed(1)}%
                    </span>
                  </div>
                </div>
                <div className="card-body">
                  <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '24px' }}>
                    {/* Bar Chart */}
                    <div>
                      <ResponsiveContainer width="100%" height={280}>
                        <BarChart data={barData} margin={{ top: 10, right: 10, bottom: 10, left: 10 }}>
                          <CartesianGrid strokeDasharray="3 3" stroke="var(--border-subtle)" />
                          <XAxis dataKey="name" stroke="var(--text-muted)" fontSize={12} tick={barData.length <= 15} />
                          <YAxis stroke="var(--text-muted)" fontSize={12} tickFormatter={v => `${v}%`} />
                          <Tooltip content={<CustomTooltip />} />
                          <Bar dataKey="rate" name={t('Positive Rate %')} radius={[6, 6, 0, 0]}>
                            {barData.map((_, i) => (
                              <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                            ))}
                          </Bar>
                        </BarChart>
                      </ResponsiveContainer>
                    </div>

                    {/* Pie Chart */}
                    <div>
                      <ResponsiveContainer width="100%" height={280}>
                        <PieChart>
                          <Pie
                            data={pieData}
                            dataKey="value"
                            nameKey="name"
                            cx="50%"
                            cy="50%"
                            outerRadius={90}
                            innerRadius={50}
                            paddingAngle={3}
                          >
                            {pieData.map((_, i) => (
                              <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                            ))}
                          </Pie>
                          <Tooltip content={<CustomTooltip />} />
                          {pieData.length <= 15 && (
                            <Legend wrapperStyle={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }} />
                          )}
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                  </div>

                  {/* Group Details Table */}
                  <div style={{ marginTop: '16px', maxHeight: '350px', overflowY: 'auto', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-md)' }}>
                    <table className="data-table" style={{ margin: 0, border: 'none' }}>
                      <thead>
                        <tr>
                          <th>{t('Group')}</th>
                          <th>{t('Total')}</th>
                          <th>{t('Positive')}</th>
                          <th>{t('Rate')}</th>
                          <th>{t('Relative to Max')}</th>
                        </tr>
                      </thead>
                      <tbody>
                        {result.groups.map((g, i) => {
                          const maxRate = result.groups[0].rate
                          const relRate = maxRate > 0 ? g.rate / maxRate : 0
                          return (
                            <tr key={g.name}>
                              <td>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                  <div style={{
                                    width: '8px',
                                    height: '8px',
                                    borderRadius: '50%',
                                    background: CHART_COLORS[i % CHART_COLORS.length]
                                  }} />
                                  {g.name}
                                </div>
                              </td>
                              <td>{g.total.toLocaleString()}</td>
                              <td>{g.positive.toLocaleString()}</td>
                              <td style={{ fontWeight: 600 }}>{(g.rate * 100).toFixed(2)}%</td>
                              <td>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                  <div className="progress-bar" style={{ width: '100px' }}>
                                    <div className="progress-fill" style={{
                                      width: `${relRate * 100}%`,
                                      background: relRate < 0.8 ? 'var(--gradient-danger)' : 'var(--gradient-success)'
                                    }} />
                                  </div>
                                  <span style={{
                                    fontSize: '0.75rem',
                                    color: relRate < 0.8 ? 'var(--bias-critical)' : 'var(--bias-low)',
                                    fontWeight: 600
                                  }}>
                                    {(relRate * 100).toFixed(1)}%
                                  </span>
                                </div>
                              </td>
                            </tr>
                          )
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )
          })}

          {/* ═══ NEW: Profile Flipper ═══ */}
          <ProfileFlipper
            rows={rows}
            columns={columns}
            sensitiveAttrs={sensitiveAttrs}
            targetColumn={targetColumn}
          />

          {/* ═══ NEW: Intersectional Bias Matrix ═══ */}
          <IntersectionalMatrix
            rows={rows}
            columns={columns}
            sensitiveAttrs={sensitiveAttrs}
            targetColumn={targetColumn}
          />
        </>
      )}
    </div>
  )
}
