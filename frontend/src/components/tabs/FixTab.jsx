import React, { useState, useMemo, useEffect } from 'react'
import { useData } from '../../lib/DataContext'
import {
  Wrench, Play, AlertTriangle, CheckCircle,
  ArrowRight, RefreshCw, TrendingUp, SlidersHorizontal,
  Zap, RotateCcw, Loader2, Lightbulb, Sparkles, ChevronDown, ChevronUp
} from 'lucide-react'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Cell, LineChart, Line
} from 'recharts'
import { isPositive } from '../../lib/biasEngine'
import MetricExplainer from '../measure/MetricExplainer'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'
const CHART_COLORS = ['#63B3ED', '#38B2AC', '#48BB78', '#ECC94B', '#ED8936', '#FC8181', '#B794F4', '#F687B3']

const STRATEGIES = [
  {
    id: 'reweighing',
    name: 'Reweighing',
    label: 'पुनः भार देना (Reweighing)',
    desc: 'Adjusts sample weights to balance group representation',
    icon: '⚖️',
    simulate: (groups) => {
      const avgRate = groups.reduce((s, g) => s + g.rate, 0) / groups.length
      return groups.map(g => ({
        ...g,
        newRate: g.rate + (avgRate - g.rate) * 0.7
      }))
    }
  },
  {
    id: 'threshold',
    name: 'Threshold Adjustment',
    label: 'थ्रेशोल्ड समायोजन',
    desc: 'Per-group decision thresholds to equalize outcomes',
    icon: '📊',
    simulate: (groups) => {
      const avgRate = groups.reduce((s, g) => s + g.rate, 0) / groups.length
      return groups.map(g => ({
        ...g,
        newRate: g.rate + (avgRate - g.rate) * 0.9
      }))
    }
  },
  {
    id: 'calibrated',
    name: 'Calibrated EO',
    label: 'कैलिब्रेटेड ईओ (Calibrated EO)',
    desc: 'Equalizes true positive rates across groups',
    icon: '🎯',
    simulate: (groups) => {
      const maxRate = Math.max(...groups.map(g => g.rate))
      return groups.map(g => ({
        ...g,
        newRate: g.rate + (maxRate - g.rate) * 0.55
      }))
    }
  },
  {
    id: 'proxy_removal',
    name: 'Proxy Removal',
    label: 'प्रॉक्सी हटाना',
    desc: 'Removes correlated proxy variables from consideration',
    icon: '🧹',
    simulate: (groups) => {
      const avgRate = groups.reduce((s, g) => s + g.rate, 0) / groups.length
      return groups.map(g => ({
        ...g,
        newRate: g.rate + (avgRate - g.rate) * 0.4
      }))
    }
  }
]

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
          {t(p.name)}: {typeof p.value === 'number' ? `${p.value.toFixed(1)}%` : p.value}
        </p>
      ))}
    </div>
  )
}

// ═══════════════════════════════════════════════════
// Plain English Fix Suggestions (Gemini-powered)
// ═══════════════════════════════════════════════════
function PlainEnglishSuggestions({ simResult, analysisResults, language }) {
  const { t } = useData()
  const [suggestions, setSuggestions] = useState(null)
  const [loading, setLoading] = useState(false)
  const [expanded, setExpanded] = useState(true)

  const generateSuggestions = async () => {
    setLoading(true)
    const context = {
      strategy: simResult.strategy,
      originalDI: (simResult.origDI * 100).toFixed(1),
      newDI: (simResult.newDI * 100).toFixed(1),
      improvement: simResult.improvement,
      origScore: simResult.origScore,
      newScore: simResult.newScore,
      groups: simResult.groups?.map(g =>
        g.name + ': ' + (g.rate * 100).toFixed(1) + '% -> ' + (g.newRate * 100).toFixed(1) + '%'
      ).join(', ')
    }

    const prompt = language === 'hindi'
      ? 'You are an AI fairness expert. Given this bias remediation result, provide exactly 3 plain-language action steps in Hindi that a non-technical stakeholder can take. Be specific and practical.\n\nResult: ' + JSON.stringify(context) + '\n\nFormat as 3 numbered steps, each 1-2 sentences.'
      : 'You are an AI fairness expert. Given this bias remediation result, provide exactly 3 plain-English action steps a non-technical stakeholder can take. Be specific and practical.\n\nResult: ' + JSON.stringify(context) + '\n\nFormat as 3 numbered steps, each 1-2 sentences. No markdown headers.'

    try {
      const resp = await fetch(API_URL + '/copilot/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: prompt, context: { analysisResults } })
      })
      if (!resp.ok) throw new Error('API error')
      const data = await resp.json()
      setSuggestions(data.response)
    } catch (e) {
      // Smart local fallback
      const improved = simResult.improvement > 0
      if (improved) {
        setSuggestions(
          '1. **Implement ' + simResult.strategy + '** in your model pipeline before deployment — your Disparate Impact improved from ' + (simResult.origDI * 100).toFixed(1) + '% to ' + (simResult.newDI * 100).toFixed(1) + '%, ' + (simResult.newScore === 'PASS' ? 'achieving compliance with' : 'moving closer to') + ' the EEOC 4/5ths Rule.\n\n' +
          '2. **Schedule quarterly bias audits** using the same dataset split — Disparate Impact can drift as new data comes in, and you want to catch regression early before it causes harm to underrepresented groups.\n\n' +
          '3. **Document this remediation step** in your model card and share with your legal/compliance team — especially note the ' + simResult.improvement + '% DI improvement and which groups benefited most from the ' + simResult.strategy + ' adjustment.'
        )
      } else {
        setSuggestions(
          '1. **Try a stronger remediation strategy** — ' + simResult.strategy + ' only achieved a ' + simResult.improvement + '% DI change. Consider Threshold Adjustment or Calibrated EO which tend to produce larger fairness gains.\n\n' +
          '2. **Review data collection practices upstream** — if the bias is deeply embedded in historical outcomes, post-processing fixes alone may be insufficient. Investigate root causes in how the protected attribute correlates with the target variable.\n\n' +
          '3. **Consult an ethics review board** before deployment — a Disparate Impact of ' + (simResult.newDI * 100).toFixed(1) + '% still ' + (simResult.newScore === 'FAIL' ? 'fails' : 'barely passes') + ' the legal threshold. Document your mitigation efforts regardless of the final decision.'
        )
      }
    }
    setLoading(false)
  }

  useEffect(() => {
    generateSuggestions()
  }, [simResult.strategy, simResult.newDI])

  const parseSuggestions = (text) => {
    if (!text) return []
    return text.split(/\n\n/).filter(s => s.trim()).slice(0, 3)
  }

  const renderMarkdownLine = (text) => {
    const parts = []
    let remaining = text.replace(/^\d+\.\s*/, '')
    const regex = /\*\*(.*?)\*\*/g
    let lastIndex = 0
    let match

    while ((match = regex.exec(remaining)) !== null) {
      if (match.index > lastIndex) {
        parts.push({ bold: false, text: remaining.slice(lastIndex, match.index) })
      }
      parts.push({ bold: true, text: match[1] })
      lastIndex = regex.lastIndex
    }
    if (lastIndex < remaining.length) {
      parts.push({ bold: false, text: remaining.slice(lastIndex) })
    }

    return parts.map((p, i) =>
      p.bold
        ? <strong key={i} style={{ color: 'var(--text-primary)', fontWeight: 700 }}>{p.text}</strong>
        : <span key={i}>{p.text}</span>
    )
  }

  const accentColors = [
    { bg: 'rgba(99,179,237,0.15)', fg: 'var(--accent-blue)' },
    { bg: 'rgba(72,187,120,0.15)', fg: 'var(--accent-green)' },
    { bg: 'rgba(183,148,244,0.15)', fg: 'var(--accent-purple)' }
  ]

  return (
    <div className="card fade-in-up" style={{ marginTop: '24px', border: '1px solid rgba(99,179,237,0.2)' }}>
      <div className="card-header" style={{ background: 'rgba(99,179,237,0.04)' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div className="gemini-bubble" style={{ width: '32px', height: '32px', flexShrink: 0 }}>
              <Sparkles size={15} style={{ color: 'white' }} />
            </div>
            <div>
              <h3 style={{ fontSize: '1rem', fontWeight: 700 }}>{t('Plain English Fix Suggestions')}</h3>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '1px' }}>
                Powered by Gemini AI · Actionable steps for non-technical stakeholders
              </p>
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            {!loading && suggestions && (
              <button
                onClick={generateSuggestions}
                className="btn btn-ghost btn-sm"
                style={{ fontSize: '0.75rem', gap: '5px' }}
                title="Regenerate suggestions"
              >
                <RefreshCw size={12} /> Regenerate
              </button>
            )}
            <button
              onClick={() => setExpanded(!expanded)}
              style={{
                background: 'none', border: 'none', cursor: 'pointer',
                color: 'var(--text-muted)', padding: '4px'
              }}
            >
              {expanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
            </button>
          </div>
        </div>
      </div>

      {expanded && (
        <div className="card-body">
          {loading ? (
            <div style={{ textAlign: 'center', padding: '32px' }}>
              <div className="gemini-bubble" style={{
                width: '48px', height: '48px', margin: '0 auto 14px'
              }}>
                <Loader2 size={22} className="spin" style={{ color: 'white' }} />
              </div>
              <p style={{ fontWeight: 600, marginBottom: '4px' }}>Gemini is analyzing your results...</p>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.8125rem' }}>Generating plain-language action steps</p>
            </div>
          ) : suggestions ? (
            <div>
              {parseSuggestions(suggestions).map((s, idx) => (
                <div key={idx} style={{
                  display: 'flex', gap: '14px', padding: '14px 16px',
                  borderRadius: 'var(--radius-md)',
                  background: idx % 2 === 0 ? 'var(--bg-tertiary)' : 'var(--bg-elevated)',
                  border: '1px solid var(--border-subtle)',
                  marginBottom: '10px'
                }}>
                  <div style={{
                    flexShrink: 0, width: '28px', height: '28px',
                    borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
                    background: accentColors[idx % 3].bg,
                    color: accentColors[idx % 3].fg,
                    fontWeight: 800, fontSize: '0.8rem', fontFamily: 'var(--font-mono)'
                  }}>
                    {idx + 1}
                  </div>
                  <p style={{ fontSize: '0.875rem', lineHeight: 1.65, color: 'var(--text-secondary)', margin: 0 }}>
                    {renderMarkdownLine(s)}
                  </p>
                </div>
              ))}

              <div style={{
                marginTop: '12px', padding: '10px 14px',
                borderRadius: 'var(--radius-sm)',
                background: 'rgba(183,148,244,0.06)',
                border: '1px solid rgba(183,148,244,0.15)',
                display: 'flex', alignItems: 'center', gap: '8px'
              }}>
                <Lightbulb size={14} style={{ color: 'var(--accent-purple)', flexShrink: 0 }} />
                <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', margin: 0 }}>
                  These suggestions are AI-generated guidance. Always validate with domain experts and legal counsel before deployment.
                </p>
              </div>
            </div>
          ) : null}
        </div>
      )}
    </div>
  )
}

// ═══════════════════════════════════════════════════
// Main FixTab Component
// ═══════════════════════════════════════════════════
export default function FixTab() {
  const { rows, columns, sensitiveAttrs, targetColumn, analysisResults, remediationResults, setRemediationResults, language, t } = useData()
  const [selectedStrategy, setSelectedStrategy] = useState(null)
  const [simResult, setSimResult] = useState(null)
  const [applying, setApplying] = useState(false)
  const [fairnessWeight, setFairnessWeight] = useState(0.5) // Trade-off slider

  const firstResult = analysisResults ? Object.values(analysisResults).find(Boolean) : null

  // Trade-off slider simulation
  const tradeoffData = useMemo(() => {
    if (!firstResult) return []
    const steps = 11
    return Array.from({ length: steps }, (_, i) => {
      const weight = i / (steps - 1)
      const rates = firstResult.groups.map(g => g.rate)
      const avgRate = rates.reduce((s, r) => s + r, 0) / rates.length
      const maxRate = Math.max(...rates)
      const minRate = Math.min(...rates)

      const adjustedRates = rates.map(r => r + (avgRate - r) * weight)
      const adjMax = Math.max(...adjustedRates)
      const adjMin = Math.min(...adjustedRates)

      const fairness = adjMax > 0 ? Math.round((1 - (adjMax - adjMin) / adjMax) * 100) : 100
      const accuracy = Math.round((1 - weight * 0.15) * 100) // Simulated accuracy loss
      const precision = Math.round((1 - weight * 0.1) * 100)
      const recall = Math.round((0.85 + weight * 0.08) * 100)

      return { label: `${Math.round(weight * 100)}%`, fairness, accuracy, precision, recall, weight }
    })
  }, [firstResult])

  const runSimulation = (strategy) => {
    if (!firstResult) return
    setApplying(true)
    setSelectedStrategy(strategy.id)

    setTimeout(() => {
      const simGroups = strategy.simulate(firstResult.groups)
      const origDI = firstResult.disparateImpact
      const newRates = simGroups.map(g => g.newRate)
      const newMax = Math.max(...newRates)
      const newMin = Math.min(...newRates)
      const newDI = newMax > 0 ? newMin / newMax : 1
      const newSP = newMax - newMin
      const origScore = firstResult.disparateImpact >= 0.8 ? 'PASS' : 'FAIL'
      const newScore = newDI >= 0.8 ? 'PASS' : 'FAIL'

      const result = {
        strategy: strategy.name,
        groups: simGroups,
        origDI,
        newDI,
        origSP: firstResult.statisticalParity,
        newSP,
        origScore,
        newScore,
        improvement: Math.round((newDI - origDI) * 100)
      }

      setSimResult(result)
      setRemediationResults(result)
      setApplying(false)
    }, 600)
  }

  if (!analysisResults || !firstResult) {
    return (
      <div className="fade-in-up" style={{ textAlign: 'center', paddingTop: '80px' }}>
        <div style={{
          width: '80px', height: '80px', borderRadius: '50%',
          background: 'rgba(99,179,237,0.1)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          margin: '0 auto 20px'
        }}>
          <Wrench size={36} style={{ color: 'var(--accent-blue)', opacity: 0.5 }} />
        </div>
        <h2 style={{ fontSize: '1.375rem', fontWeight: 700, marginBottom: '8px' }}>
          No Analysis Available
        </h2>
        <p style={{ color: 'var(--text-secondary)', maxWidth: '400px', margin: '0 auto' }}>
          Run bias analysis in the <strong>Measure</strong> tab first to see fix options.
        </p>
      </div>
    )
  }

  return (
    <div className="fade-in-up">
      {/* Header */}
      <div style={{ marginBottom: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
            <Wrench size={20} style={{ color: 'var(--accent-purple)' }} />
            <h2 style={{ fontSize: '1.375rem', fontWeight: 700, letterSpacing: '-0.02em' }}>
              {t('Bias Remediation')}
            </h2>
          </div>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.8125rem' }}>
            {t('Simulate debiasing techniques and see their impact on fairness metrics')}
          </p>
      </div>

      {/* ═══ Fairness-Accuracy Trade-off Slider ═══ */}
      <div className="card" style={{ marginBottom: '24px' }}>
        <div className="card-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <SlidersHorizontal size={18} style={{ color: 'var(--accent-purple)' }} />
            <h3 style={{ fontSize: '1rem', fontWeight: 600 }}>Fairness-Accuracy Trade-off</h3>
            <MetricExplainer metricName="Fairness Score" value={tradeoffData[Math.round(fairnessWeight * 10)]?.fairness} />
          </div>
        </div>
        <div className="card-body">
          {/* Slider */}
          <div style={{ marginBottom: '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
              <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--accent-blue)' }}>
                ← {t('Maximize Accuracy')}
              </span>
              <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--accent-green)' }}>
                {t('Maximize Fairness')} →
              </span>
            </div>
            <div style={{ position: 'relative' }}>
              <input
                type="range"
                min="0"
                max="1"
                step="0.1"
                value={fairnessWeight}
                onChange={e => setFairnessWeight(+e.target.value)}
                style={{
                  width: '100%',
                  accentColor: 'var(--accent-teal)',
                  height: '8px',
                  cursor: 'pointer'
                }}
              />
              {/* Ethical Sweet Spot marker */}
              <div
                style={{
                  position: 'absolute',
                  left: '55%',
                  top: '-20px',
                  transform: 'translateX(-50%)',
                  fontSize: '0.625rem',
                  fontWeight: 700,
                  color: 'var(--accent-green)',
                  whiteSpace: 'nowrap',
                  background: 'rgba(72,187,120,0.1)',
                  padding: '2px 8px',
                  borderRadius: '100px',
                  border: '1px solid rgba(72,187,120,0.3)'
                }}
              >
                ● {t('Ethical Sweet Spot')}
              </div>
            </div>
            <div style={{
              display: 'flex',
              gap: '12px',
              marginTop: '12px',
              justifyContent: 'center'
            }}>
              <span className="badge badge-blue">{t('Accuracy')}: {tradeoffData[Math.round(fairnessWeight * 10)]?.accuracy || 100}%</span>
              <span className="badge badge-green">{t('Fairness')}: {tradeoffData[Math.round(fairnessWeight * 10)]?.fairness || 50}%</span>
              <span className="badge badge-teal">{t('Precision')}: {tradeoffData[Math.round(fairnessWeight * 10)]?.precision || 100}%</span>
              <span className="badge badge-purple">{t('Recall')}: {tradeoffData[Math.round(fairnessWeight * 10)]?.recall || 85}%</span>
            </div>
          </div>

          {/* Trade-off Line Chart */}
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={tradeoffData}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border-subtle)" />
              <XAxis dataKey="label" stroke="var(--text-muted)" fontSize={11} label={{ value: t('Fairness Weight'), position: 'bottom', offset: 0 }} />
              <YAxis stroke="var(--text-muted)" fontSize={11} domain={[50, 100]} />
              <Tooltip content={<CustomTooltip />} />
              <Line type="monotone" dataKey="fairness" name={t('Fairness')} stroke="#48BB78" strokeWidth={2} dot={false} />
              <Line type="monotone" dataKey="accuracy" name={t('Accuracy')} stroke="#63B3ED" strokeWidth={2} dot={false} />
              <Line type="monotone" dataKey="precision" name={t('Precision')} stroke="#B794F4" strokeWidth={2} strokeDasharray="5 5" dot={false} />
              <Line type="monotone" dataKey="recall" name={t('Recall')} stroke="#38B2AC" strokeWidth={2} strokeDasharray="5 5" dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* ═══ Debiasing Strategy Cards ═══ */}
      <div className="card" style={{ marginBottom: '24px' }}>
        <div className="card-header">
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <Zap size={18} style={{ color: 'var(--accent-yellow)' }} />
                  <h3 style={{ fontSize: '1rem', fontWeight: 600 }}>{t('Auto-Mitigation Simulator')}</h3>
                </div>
        </div>
        <div className="card-body">
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '12px' }}>
            {STRATEGIES.map(s => (
              <button
                key={s.id}
                onClick={() => runSimulation(s)}
                disabled={applying}
                style={{
                  textAlign: 'left',
                  padding: '16px',
                  borderRadius: 'var(--radius-md)',
                  cursor: 'pointer',
                  fontFamily: 'var(--font-sans)',
                  border: `1px solid ${selectedStrategy === s.id ? 'var(--accent-teal)' : 'var(--border-default)'}`,
                  background: selectedStrategy === s.id ? 'rgba(56,178,172,0.08)' : 'var(--bg-tertiary)',
                  transition: 'all var(--transition-fast)'
                }}
                onMouseEnter={e => { if (selectedStrategy !== s.id) e.currentTarget.style.borderColor = 'var(--accent-blue)' }}
                onMouseLeave={e => { if (selectedStrategy !== s.id) e.currentTarget.style.borderColor = 'var(--border-default)' }}
              >
                <div style={{ fontSize: '1.25rem', marginBottom: '8px' }}>{s.icon}</div>
                <p style={{ fontWeight: 700, fontSize: '0.875rem', color: 'var(--text-primary)', marginBottom: '4px' }}>{t(s.name)}</p>
                <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', lineHeight: 1.4 }}>{t(s.desc)}</p>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ═══ Before/After Results ═══ */}
      {applying && (
        <div style={{ textAlign: 'center', padding: '40px' }}>
          <RefreshCw size={32} className="spin" style={{ color: 'var(--accent-teal)', margin: '0 auto 12px', display: 'block' }} />
          <p style={{ fontWeight: 600 }}>{t('Simulating remediation...')}</p>
        </div>
      )}

      {simResult && !applying && (
        <>
          <div className="card fade-in-up">
            <div className="card-header">
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <TrendingUp size={18} style={{ color: 'var(--accent-green)' }} />
                  <h3 style={{ fontSize: '1rem', fontWeight: 600 }}>Before / After — {simResult.strategy}</h3>
                </div>
                <div style={{
                  padding: '4px 14px',
                  borderRadius: '100px',
                  background: simResult.improvement > 0 ? 'rgba(72,187,120,0.15)' : 'rgba(252,129,129,0.15)',
                  color: simResult.improvement > 0 ? 'var(--accent-green)' : 'var(--accent-red)',
                  fontWeight: 700,
                  fontSize: '0.875rem'
                }}>
                  {simResult.improvement > 0 ? '+' : ''}{simResult.improvement}% DI improvement
                </div>
              </div>
            </div>
            <div className="card-body">
              {/* Metric Comparison with Explainer Chips */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr auto 1fr', gap: '24px', alignItems: 'center', marginBottom: '24px' }}>
                <div style={{ textAlign: 'center' }}>
                  <p style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '8px' }}>Before</p>
                  <div style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px'
                  }}>
                    <span style={{
                      fontSize: '2rem', fontWeight: 900, fontFamily: 'var(--font-mono)',
                      color: simResult.origDI >= 0.8 ? 'var(--accent-green)' : 'var(--accent-red)'
                    }}>
                      {(simResult.origDI * 100).toFixed(1)}%
                    </span>
                    <MetricExplainer metricName="Disparate Impact" value={simResult.origDI} />
                  </div>
                  <span className={`badge ${simResult.origScore === 'PASS' ? 'badge-green' : 'badge-red'}`}>
                    {simResult.origScore === 'PASS' ? '✓' : '✕'} 4/5ths: {simResult.origScore}
                  </span>
                  <MetricExplainer metricName="4/5ths Rule" />
                </div>
                <ArrowRight size={32} style={{ color: 'var(--accent-teal)' }} />
                <div style={{ textAlign: 'center' }}>
                  <p style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '8px' }}>After</p>
                  <div style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px',
                    animation: 'fadeInUp 0.5s ease'
                  }}>
                    <span style={{
                      fontSize: '2rem', fontWeight: 900, fontFamily: 'var(--font-mono)',
                      color: simResult.newDI >= 0.8 ? 'var(--accent-green)' : 'var(--accent-orange)'
                    }}>
                      {(simResult.newDI * 100).toFixed(1)}%
                    </span>
                    <MetricExplainer metricName="Disparate Impact" value={simResult.newDI} />
                  </div>
                  <span className={`badge ${simResult.newScore === 'PASS' ? 'badge-green' : 'badge-orange'}`}>
                    {simResult.newScore === 'PASS' ? '✓' : '△'} 4/5ths: {simResult.newScore}
                  </span>
                </div>
              </div>

              {/* Group Comparison Chart */}
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={simResult.groups.map(g => ({
                  name: g.name,
                  original: +(g.rate * 100).toFixed(1),
                  adjusted: +(g.newRate * 100).toFixed(1)
                }))}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border-subtle)" />
                  <XAxis dataKey="name" stroke="var(--text-muted)" fontSize={12} />
                  <YAxis stroke="var(--text-muted)" fontSize={12} tickFormatter={v => `${v}%`} />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar dataKey="original" name="Before" fill="rgba(252,129,129,0.5)" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="adjusted" name="After" fill="rgba(72,187,120,0.7)" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* ═══ NEW: Plain English Fix Suggestions ═══ */}
          <PlainEnglishSuggestions
            simResult={simResult}
            analysisResults={analysisResults}
            language={language}
          />
        </>
      )}
    </div>
  )
}
