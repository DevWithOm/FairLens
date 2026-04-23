import React, { useState } from 'react'
import { Info, X } from 'lucide-react'
import { useData } from '../../lib/DataContext'

const METRIC_EXPLANATIONS = {
  'Disparate Impact': {
    short: 'Disparate Impact Ratio',
    detail: 'A Disparate Impact ratio ≥ 0.8 (80%) passes the EEOC 4/5ths Rule. Below 0.8 indicates potential adverse impact against the unprivileged group. This is the most widely used legal fairness standard in the US.',
    formula: 'DI = Rate(unprivileged) / Rate(privileged)'
  },
  'Statistical Parity': {
    short: 'Statistical Parity Difference',
    detail: 'Statistical Parity Difference measures whether different groups receive positive outcomes at the same rate. A difference of 0 means perfect fairness. Values > 0.1 (10%) are generally concerning.',
    formula: 'SPD = |Rate(Group A) - Rate(Group B)|'
  },
  'Equal Opportunity': {
    short: 'Equal Opportunity',
    detail: 'Equal Opportunity measures if the model correctly identifies qualified individuals at the same rate for all groups. A difference in true positive rates means the model is better at recognizing talent in one group than another.',
    formula: 'EO = |TPR(Group A) - TPR(Group B)|'
  },
  'Fairness Score': {
    short: 'Fairness Score',
    detail: 'The Fairness Score combines multiple bias metrics into a single number. It measures the disparity between the best and worst performing groups. A score ≥ 71 is considered Fair, 41-70 Needs Work, and ≤ 40 is Unfair.',
    formula: 'Score = (1 - (maxRate - minRate) / maxRate) × 100'
  },
  '4/5ths Rule': {
    short: '4/5ths Rule',
    detail: 'The Four-Fifths Rule comes from the US Equal Employment Opportunity Commission (EEOC) Uniform Guidelines. It states that the selection rate for any protected group should be at least 80% of the rate for the group with the highest selection rate. India\'s DPDP Act recommends similar proportionality checks.',
    formula: 'Pass if: Rate(each group) / Rate(best group) ≥ 0.8'
  },
  'Bias Level': {
    short: 'Bias Level',
    detail: 'Bias Level categorizes the severity of detected bias: Low (DI ≥ 0.8), Moderate (0.6-0.8), High (0.4-0.6), Critical (< 0.4). This helps prioritize remediation efforts.',
    formula: 'Based on Disparate Impact thresholds'
  }
}

export default function MetricExplainer({ metricName, value, context }) {
  const [open, setOpen] = useState(false)
  const { t } = useData()

  const explanation = METRIC_EXPLANATIONS[metricName] || {
    short: metricName,
    detail: `${metricName} measures fairness along this dimension. This metric helps quantify bias in your dataset for ${context || 'the selected attributes'}.`,
    formula: '—'
  }

  return (
    <span style={{ position: 'relative', display: 'inline-flex', alignItems: 'center' }}>
      <button
        onClick={(e) => { e.stopPropagation(); setOpen(!open) }}
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: '18px',
          height: '18px',
          borderRadius: '50%',
          border: '1px solid var(--border-default)',
          background: open ? 'rgba(99,179,237,0.15)' : 'transparent',
          color: open ? 'var(--accent-blue)' : 'var(--text-muted)',
          cursor: 'pointer',
          fontSize: '0.625rem',
          fontWeight: 700,
          marginLeft: '6px',
          transition: 'all var(--transition-fast)',
          flexShrink: 0
        }}
        title={t('Explain')}
      >
        <Info size={11} />
      </button>

      {open && (
        <div
          onClick={e => e.stopPropagation()}
          style={{
            position: 'absolute',
            top: 'calc(100% + 10px)',
            left: '50%',
            transform: 'translateX(-50%)',
            width: '320px',
            background: 'var(--bg-elevated)',
            border: '1px solid var(--border-default)',
            borderRadius: 'var(--radius-md)',
            padding: '14px 16px',
            zIndex: 100,
            boxShadow: 'var(--shadow-lg)',
            animation: 'fadeInUp 0.2s ease-out'
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <span style={{ fontSize: '0.8125rem', fontWeight: 700, color: 'var(--accent-blue)' }}>
              {t(explanation.short)}
            </span>
            <button
              onClick={() => setOpen(false)}
              style={{
                background: 'none', border: 'none', cursor: 'pointer',
                color: 'var(--text-muted)', padding: '2px'
              }}
            >
              <X size={14} />
            </button>
          </div>

          {value !== undefined && (
            <div style={{
              fontFamily: 'var(--font-mono)',
              fontSize: '1.125rem',
              fontWeight: 800,
              color: 'var(--text-primary)',
              marginBottom: '8px'
            }}>
              {typeof value === 'number' ? value.toFixed(3) : value}
            </div>
          )}

          <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', lineHeight: 1.5, marginBottom: '10px' }}>
            {t(explanation.detail)}
          </p>

          <div style={{
            padding: '6px 10px',
            borderRadius: 'var(--radius-sm)',
            background: 'var(--bg-tertiary)',
            border: '1px solid var(--border-subtle)',
            fontFamily: 'var(--font-mono)',
            fontSize: '0.6875rem',
            color: 'var(--accent-teal)'
          }}>
            {explanation.formula}
          </div>
        </div>
      )}
    </span>
  )
}
