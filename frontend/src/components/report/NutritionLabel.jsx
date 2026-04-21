import React, { useRef } from 'react'
import { Shield, Download, AlertTriangle, CheckCircle } from 'lucide-react'
import { useData } from '../../lib/DataContext'
import html2canvas from 'html2canvas'

export default function NutritionLabel({ datasetName, rows, columns, sensitiveAttrs, targetColumn, analysisResults, remediationResults }) {
  const { t } = useData()
  const labelRef = useRef(null)

  const firstResult = analysisResults ? Object.values(analysisResults).find(Boolean) : null
  const di = firstResult?.disparateImpact || 0
  const sp = firstResult?.statisticalParity || 0
  const biasLevel = firstResult?.biasLevel || 'unknown'
  const passes = di >= 0.8
  const fairScore = Math.round((1 - sp) * 100)

  const riskLevel = biasLevel === 'low' ? 'Low' : biasLevel === 'moderate' ? 'Medium' : 'High'
  const riskColor = biasLevel === 'low' ? '#48BB78' : biasLevel === 'moderate' ? '#ECC94B' : '#FC8181'

  const handleDownload = async () => {
    if (!labelRef.current) return
    const canvas = await html2canvas(labelRef.current, {
      backgroundColor: '#151D2E',
      scale: 2,
    })
    const url = canvas.toDataURL('image/png')
    const a = document.createElement('a')
    a.href = url
    a.download = `fairlens-nutrition-label-${Date.now()}.png`
    a.click()
  }

  return (
    <div className="card fade-in-up" style={{ marginBottom: '24px' }}>
      <div className="card-header">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Shield size={18} style={{ color: 'var(--accent-blue)' }} />
            <h3 style={{ fontSize: '1rem', fontWeight: 600 }}>{t('AI Nutrition Label')}</h3>
            <span className="badge badge-blue">{t('Model Card')}</span>
          </div>
          <button className="btn btn-secondary btn-sm" onClick={handleDownload}>
            <Download size={14} /> {t('Download PNG')}
          </button>
        </div>
      </div>

      <div className="card-body" style={{ display: 'flex', justifyContent: 'center' }}>
        <div
          ref={labelRef}
          style={{
            width: '420px',
            background: '#151D2E',
            border: '3px solid var(--accent-blue)',
            borderRadius: '16px',
            overflow: 'hidden',
            fontFamily: 'var(--font-sans)'
          }}
        >
          {/* Header */}
          <div style={{
            background: 'linear-gradient(135deg, #63B3ED, #38B2AC)',
            padding: '16px 20px',
            textAlign: 'center'
          }}>
            <div style={{ fontSize: '0.6875rem', fontWeight: 700, letterSpacing: '0.15em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.8)', marginBottom: '4px' }}>
              {t('AI FAIRNESS AUDIT')}
            </div>
            <div style={{ fontSize: '1.25rem', fontWeight: 800, color: 'white', letterSpacing: '-0.02em' }}>
              {t('Nutrition Label')}
            </div>
          </div>

          {/* Thick separator */}
          <div style={{ height: '8px', background: 'var(--accent-blue)' }} />

          {/* Content */}
          <div style={{ padding: '16px 20px' }}>
            {/* Dataset info */}
            <Row label={t('Dataset')} value={datasetName || '—'} bold />
            <Row label={t('Records Analyzed')} value={rows?.length?.toLocaleString() || '0'} />
            <Row label={t('Features')} value={columns?.length || '0'} />
            <Divider />

            {/* Sensitive attrs */}
            <Row label={t('Sensitive Attributes')} value={sensitiveAttrs?.join(', ') || 'None'} />
            <Row label={t('Target Column')} value={targetColumn || '—'} />
            <Divider thick />

            {/* Fairness Score */}
            <div style={{ textAlign: 'center', padding: '12px 0' }}>
              <div style={{ fontSize: '0.6875rem', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '8px' }}>
                {t('OVERALL FAIRNESS SCORE')}
              </div>
              <div style={{
                fontSize: '3rem',
                fontWeight: 900,
                fontFamily: 'var(--font-mono)',
                color: fairScore >= 70 ? '#48BB78' : fairScore >= 40 ? '#ECC94B' : '#FC8181',
                lineHeight: 1,
                letterSpacing: '-0.04em'
              }}>
                {fairScore}
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                {t('out of 100')}
              </div>
            </div>

            <Divider />

            {/* Key metrics */}
            <div style={{ fontSize: '0.6875rem', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '8px' }}>
              {t('KEY METRICS')}
            </div>
            <MetricRow label={t('Disparate Impact Ratio')} value={`${(di * 100).toFixed(1)}%`} status={di >= 0.8 ? 'pass' : 'fail'} />
            <MetricRow label={t('Statistical Parity Gap')} value={`${(sp * 100).toFixed(1)}%`} status={sp <= 0.1 ? 'pass' : sp <= 0.2 ? 'warn' : 'fail'} />
            <MetricRow label={t('4/5ths Rule (EEOC)')} value={passes ? 'PASS' : 'FAIL'} status={passes ? 'pass' : 'fail'} />

            <Divider thick />

            {/* Risk Level */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 0' }}>
              <span style={{ fontSize: '0.8125rem', fontWeight: 700, color: 'var(--text-primary)' }}>{t('Risk Level')}</span>
              <span style={{
                padding: '4px 16px',
                borderRadius: '100px',
                background: `${riskColor}22`,
                color: riskColor,
                fontWeight: 800,
                fontSize: '0.875rem',
                border: `1px solid ${riskColor}44`
              }}>
                {t(riskLevel)}
              </span>
            </div>

            {/* Known biases */}
            {firstResult && (
              <>
                <Divider />
                <div style={{ fontSize: '0.6875rem', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '8px' }}>
                  {t('KNOWN BIASES')}
                </div>
                <div style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                  • {t('Privileged group')}: <strong style={{ color: 'var(--text-primary)' }}>{firstResult.privilegedGroup}</strong><br/>
                  • {t('Unprivileged group')}: <strong style={{ color: 'var(--text-primary)' }}>{firstResult.unprivilegedGroup}</strong><br/>
                  • {t('Outcome disparity')}: <strong style={{ color: riskColor }}>{(sp * 100).toFixed(1)}%</strong>
                </div>
              </>
            )}

            {remediationResults && (
              <>
                 <Divider />
                <div style={{ fontSize: '0.6875rem', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '8px' }}>
                  {t('REMEDIATION APPLIED')}
                </div>
                 <MetricRow
                  label={`${t('Strategy')}: ${t(remediationResults.strategy)}`}
                  value={`DI: ${(remediationResults.origDI * 100).toFixed(0)}% → ${(remediationResults.newDI * 100).toFixed(0)}%`}
                  status={remediationResults.newDI >= 0.8 ? 'pass' : 'warn'}
                />
              </>
            )}

            <Divider thick />

             {/* Compliance */}
            <div style={{ fontSize: '0.6875rem', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '8px' }}>
              {t('COMPLIANCE')}
            </div>
            <ComplianceRow label="EEOC 4/5ths Rule" status={passes} />
            <ComplianceRow label="India DPDP Act 2023" status={sp <= 0.2} />
            <ComplianceRow label="EU AI Act (High-Risk)" status={di >= 0.7} />

            <Divider />

            {/* Footer */}
            <div style={{ textAlign: 'center', padding: '8px 0 4px' }}>
              <div style={{ fontSize: '0.625rem', color: 'var(--text-muted)' }}>
                Generated by <strong style={{ color: 'var(--accent-blue)' }}>FairLens</strong> • {new Date().toLocaleDateString()}
              </div>
              <div style={{ fontSize: '0.5625rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                Inspired by Google Model Cards • AI Bias Detection & Remediation Platform
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function Row({ label, value, bold }) {
  return (
    <div style={{
      display: 'flex',
      justifyContent: 'space-between',
      padding: '4px 0',
      fontSize: '0.8125rem'
    }}>
      <span style={{ color: 'var(--text-secondary)' }}>{label}</span>
      <span style={{
        color: 'var(--text-primary)',
        fontWeight: bold ? 700 : 500,
        fontFamily: 'var(--font-mono)',
        fontSize: '0.8125rem'
      }}>{value}</span>
    </div>
  )
}

function MetricRow({ label, value, status }) {
  const color = status === 'pass' ? '#48BB78' : status === 'warn' ? '#ECC94B' : '#FC8181'
  return (
    <div style={{
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: '5px 0',
      fontSize: '0.8125rem'
    }}>
      <span style={{ color: 'var(--text-secondary)' }}>{label}</span>
      <span style={{
        color,
        fontWeight: 700,
        fontFamily: 'var(--font-mono)',
        fontSize: '0.8125rem'
      }}>
        {value}
      </span>
    </div>
  )
}

function ComplianceRow({ label, status }) {
  const { t } = useData()
  return (
    <div style={{
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: '3px 0',
      fontSize: '0.8125rem'
    }}>
      <span style={{ color: 'var(--text-secondary)' }}>{label}</span>
      {status ? (
        <span style={{ color: '#48BB78', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px' }}>
          <CheckCircle size={12} /> Compliant
        </span>
      ) : (
         <span style={{ color: '#FC8181', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px' }}>
          <AlertTriangle size={12} /> {t('Review Needed')}
        </span>
      )}
    </div>
  )
}

function Divider({ thick }) {
  return (
    <div style={{
      height: thick ? '4px' : '1px',
      background: thick ? 'var(--accent-blue)' : 'var(--border-subtle)',
      margin: '8px 0',
      borderRadius: thick ? '2px' : 0
    }} />
  )
}
