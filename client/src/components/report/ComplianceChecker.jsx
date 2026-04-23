import React from 'react'
import { Shield, CheckCircle, AlertTriangle, XCircle, Scale, Globe, Landmark } from 'lucide-react'

import { useData } from '../../lib/DataContext'

export default function ComplianceChecker({ analysisResults, sensitiveAttrs, remediationResults, rows }) {
  const { t } = useData()
  const firstResult = analysisResults ? Object.values(analysisResults).find(Boolean) : null
  const di = firstResult?.disparateImpact || 0
  const sp = firstResult?.statisticalParity || 0
  const minGroupSize = firstResult ? Math.min(...firstResult.groups.map(g => g.total)) : 0

  const COMPLIANCE_FRAMEWORKS = [
    {
      id: 'eeoc',
      name: t('EEOC 4/5ths Rule (US)'),
      icon: Scale,
      desc: t('Equal Employment Opportunity Commission — Uniform Guidelines on Employee Selection Procedures'),
      checks: [
        {
          id: 'di_ratio',
          label: t('Disparate Impact Ratio ≥ 80%'),
          test: (data) => data.di >= 0.8,
          detail: t('Selection rate for any group must be ≥ 80% of the highest group')
        },
        {
          id: 'group_size',
          label: t('Adequate sample size per group'),
          test: (data) => data.minGroupSize >= 30,
          detail: t('Minimum 30 records per demographic group for statistical significance')
        },
        {
          id: 'documentation',
          label: t('Bias audit documentation available'),
          test: () => true,
          detail: t('FairLens provides audit reports as documentation artifact')
        }
      ]
    },
    {
      id: 'dpdp',
      name: t('India DPDP Act 2023'),
      icon: Landmark,
      desc: t('Digital Personal Data Protection Act — Data minimization, purpose limitation, consent requirements'),
      checks: [
        {
          id: 'data_min',
          label: t('Data minimization — sensitive attributes justified'),
          test: (data) => data.sensitiveCount <= 3,
          detail: t('Processing of sensitive data must be limited to what is necessary')
        },
        {
          id: 'parity',
          label: t('Statistical parity gap ≤ 20%'),
          test: (data) => data.sp <= 0.20,
          detail: t('DPDP recommends proportionality checks across protected groups')
        },
        {
          id: 'purpose',
          label: t('Purpose limitation documented'),
          test: () => true,
          detail: t('Data usage purpose should be clearly documented in the audit')
        },
        {
          id: 'consent',
          label: t('Consent mechanism present'),
          test: () => false,
          detail: t('Explicit consent required for processing sensitive personal data')
        }
      ]
    },
    {
      id: 'euai',
      name: t('EU AI Act (High-Risk)'),
      icon: Globe,
      desc: t('European Union AI Act — Transparency, human oversight, accuracy, and non-discrimination requirements'),
      checks: [
        {
          id: 'transparency',
          label: t('Model transparency documentation'),
          test: () => true,
          detail: t('Article 13: Users must be provided with sufficient transparency')
        },
        {
          id: 'bias_testing',
          label: t('Bias testing performed'),
          test: (data) => data.hasAnalysis,
          detail: t('Article 10: Training data must be examined for possible biases')
        },
        {
          id: 'human_oversight',
          label: t('Human oversight mechanism'),
          test: () => false,
          detail: t('Article 14: High-risk AI systems must allow human oversight')
        },
        {
          id: 'accuracy',
          label: t('Fairness-accuracy balance documented'),
          test: (data) => data.di >= 0.7,
          detail: t('System must achieve appropriate levels of accuracy and non-discrimination')
        },
        {
          id: 'risk_mgmt',
          label: t('Risk management system in place'),
          test: (data) => data.hasRemediation,
          detail: t('Article 9: Risk management throughout the AI lifecycle')
        }
      ]
    },
    {
      id: 'rbi',
      name: t('RBI Guidelines (India Finance)'),
      icon: Landmark,
      desc: t('Reserve Bank of India guidelines on algorithmic fairness in financial lending models'),
      checks: [
        {
          id: 'caste_check',
          label: t('Caste-based discrimination check'),
          test: (data) => data.di >= 0.8 || !data.hasCasteAttr,
          detail: t('Lending decisions must not discriminate based on caste/community')
        },
        {
          id: 'gender_parity',
          label: t('Gender parity in outcomes'),
          test: (data) => data.sp <= 0.15,
          detail: t('Equal credit opportunity regardless of gender')
        },
        {
          id: 'explainability',
          label: t('Model explainability provided'),
          test: () => true,
          detail: t('Reasons for rejection must be explainable to applicants')
        }
      ]
    }
  ]

  const testData = {
    di,
    sp,
    minGroupSize,
    sensitiveCount: sensitiveAttrs?.length || 0,
    hasAnalysis: !!analysisResults,
    hasRemediation: !!remediationResults,
    hasCasteAttr: sensitiveAttrs?.some(a => a.toLowerCase().includes('caste')) || false,
  }

  return (
    <div className="card fade-in-up" style={{ marginBottom: '24px' }}>
      <div className="card-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <Shield size={18} style={{ color: 'var(--accent-teal)' }} />
          <h3 style={{ fontSize: '1rem', fontWeight: 600 }}>{t('Compliance Checker')}</h3>
          <span className="badge badge-teal">{COMPLIANCE_FRAMEWORKS.length} {t('Frameworks')}</span>
        </div>
      </div>

      <div className="card-body" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {COMPLIANCE_FRAMEWORKS.map(fw => {
          const Icon = fw.icon
          const results = fw.checks.map(check => ({
            ...check,
            passed: check.test(testData)
          }))
          const passCount = results.filter(r => r.passed).length
          const totalChecks = results.length
          const allPass = passCount === totalChecks

          return (
            <div key={fw.id} style={{
              padding: '16px 20px',
              borderRadius: 'var(--radius-lg)',
              background: 'var(--bg-card)',
              border: `1px solid ${allPass ? 'rgba(72,187,120,0.3)' : 'rgba(252,129,129,0.2)'}`,
            }}>
              {/* Framework header */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <div style={{
                    width: '32px', height: '32px', borderRadius: 'var(--radius-sm)',
                    background: allPass ? 'rgba(72,187,120,0.15)' : 'rgba(252,129,129,0.1)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center'
                  }}>
                    <Icon size={16} style={{ color: allPass ? 'var(--accent-green)' : 'var(--accent-red)' }} />
                  </div>
                  <div>
                    <h4 style={{ fontSize: '0.875rem', fontWeight: 700 }}>{fw.name}</h4>
                    <p style={{ fontSize: '0.6875rem', color: 'var(--text-muted)', maxWidth: '400px' }}>{fw.desc}</p>
                  </div>
                </div>
                <span style={{
                  padding: '4px 12px',
                  borderRadius: '100px',
                  fontSize: '0.75rem',
                  fontWeight: 700,
                  background: allPass ? 'rgba(72,187,120,0.15)' : passCount >= totalChecks * 0.5 ? 'rgba(236,201,75,0.15)' : 'rgba(252,129,129,0.15)',
                  color: allPass ? '#48BB78' : passCount >= totalChecks * 0.5 ? '#ECC94B' : '#FC8181'
                }}>
                  {passCount}/{totalChecks} {t('Passed')}
                </span>
              </div>

              {/* Checks */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                {results.map(check => (
                  <div key={check.id} style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                    padding: '6px 10px',
                    borderRadius: 'var(--radius-sm)',
                    background: check.passed ? 'rgba(72,187,120,0.05)' : 'rgba(252,129,129,0.05)',
                  }}>
                    {check.passed ? (
                      <CheckCircle size={14} style={{ color: '#48BB78', flexShrink: 0 }} />
                    ) : (
                      <XCircle size={14} style={{ color: '#FC8181', flexShrink: 0 }} />
                    )}
                    <div style={{ flex: 1 }}>
                      <span style={{
                        fontSize: '0.8125rem',
                        fontWeight: 500,
                        color: check.passed ? 'var(--text-primary)' : 'var(--accent-red)'
                      }}>
                        {check.label}
                      </span>
                      <span style={{
                        fontSize: '0.6875rem',
                        color: 'var(--text-muted)',
                        marginLeft: '8px'
                      }}>
                        — {check.detail}
                      </span>
                    </div>
                    <span style={{
                      fontSize: '0.6875rem',
                      fontWeight: 700,
                      color: check.passed ? '#48BB78' : '#FC8181'
                    }}>
                      {check.passed ? '✓' : '✕'}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
