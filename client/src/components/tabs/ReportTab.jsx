import React, { useState, useRef } from 'react'
import { useData } from '../../lib/DataContext'
import {
  FileText, Download, Shield, CheckCircle, AlertTriangle,
  ChevronRight, Loader2, FileDown
} from 'lucide-react'
import NutritionLabel from '../report/NutritionLabel'
import ComplianceChecker from '../report/ComplianceChecker'
import jsPDF from 'jspdf'
import html2canvas from 'html2canvas'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'

export default function ReportTab() {
  const { rows, columns, datasetName, sensitiveAttrs, targetColumn, analysisResults, remediationResults, modelResults, t } = useData()
  const [generating, setGenerating] = useState(false)
  const [reportText, setReportText] = useState('')
  const [activeSection, setActiveSection] = useState('nutrition')
  const reportRef = useRef(null)

  const hasAnalysis = !!analysisResults
  const firstResult = analysisResults ? Object.values(analysisResults).find(Boolean) : null

  // Generate full report from API
  const generateReport = async () => {
    if (!hasAnalysis) return
    setGenerating(true)
    try {
      const resp = await fetch(`${API_URL}/analysis/report`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          datasetName,
          sensitiveAttributes: sensitiveAttrs,
          targetColumn,
          analysisResults,
          remediationResults,
          modelResults
        })
      })
      if (!resp.ok) throw new Error('API error')
      const data = await resp.json()
      if (data.report) {
        setReportText(data.report)
      } else {
        // Source was local-fallback or report was null
        setReportText(generateLocalReport())
      }
    } catch (e) {
      // Fallback: generate locally
      const report = generateLocalReport()
      setReportText(report)
    }
    setGenerating(false)
  }

  const generateLocalReport = () => {
    const di = firstResult?.disparateImpact || 0
    const sp = firstResult?.statisticalParity || 0
    const biasLevel = firstResult?.biasLevel || 'unknown'
    
    let remediationText = ''
    if (remediationResults) {
      remediationText = `
## Bias Remediation Applied
- **Strategy:** ${remediationResults.strategy}
- **DI Improvement:** ${remediationResults.improvement}%
- **New Disparate Impact:** ${(remediationResults.newDI * 100).toFixed(1)}%
- **Status After Fix:** ${remediationResults.newScore === 'PASS' ? '✅ COMPLIANT' : '⚠️ PARTIALLY MITIGATED'}
`
    }

    let mlEngineText = ''
    if (modelResults) {
      mlEngineText = `
## ML Pipeline Audit
- **Model Type:** ${modelResults.ensemble ? `Ensemble Bagged (${modelResults.numTrees} trees)` : 'Decision Tree Classifier'}
- **Predictive Accuracy:** ${(modelResults.metrics.accuracy * 100).toFixed(1)}%
- **F1 Score:** ${(modelResults.metrics.f1 * 100).toFixed(1)}%
- **Top Decision Drivers:** ${modelResults.featureImportance ? modelResults.featureImportance.slice(0,3).map(f => f.feature).join(', ') : 'Unknown'}
`
    }

    return `
# FairLens Audit Report
## Dataset: ${datasetName}
### Generated: ${new Date().toLocaleString()}

---

## Executive Summary
This report presents the findings of a bias audit conducted on the **${datasetName}** dataset using FairLens AI Bias Detection Platform.

- **Records Analyzed:** ${rows.length.toLocaleString()}
- **Features:** ${columns.length}
- **Sensitive Attributes:** ${sensitiveAttrs.join(', ') || 'Not specified'}
- **Target Column:** ${targetColumn || 'Not specified'}

## Key Findings (Before Mitigation)

### Disparate Impact Ratio: ${(di * 100).toFixed(1)}%
${di >= 0.8 ? '✅ PASSES the EEOC 4/5ths Rule (≥80%)' : '❌ FAILS the EEOC 4/5ths Rule (<80%)'}

### Statistical Parity Gap: ${(sp * 100).toFixed(1)}%
${sp <= 0.1 ? '✅ Within acceptable range (≤10%)' : sp <= 0.2 ? '⚠️ Marginal (10-20%)' : '❌ Significant disparity (>20%)'}

### Overall Bias Level: ${biasLevel.toUpperCase()}
${mlEngineText}
${remediationText}
## Group Analysis
${firstResult?.groups?.map(g => `- **${g.name}**: ${(g.rate * 100).toFixed(1)}% positive outcome rate (n=${g.total.toLocaleString()})`).join('\n') || 'No analysis performed'}

## Recommendations
1. ${di < 0.8 && !remediationResults ? 'CRITICAL: Apply reweighing or threshold adjustment to meet 4/5ths Rule compliance' : remediationResults ? 'Deploy the remediated model pipeline and monitor for drift' : 'Maintain current fairness levels with regular monitoring'}
2. Implement bias drift monitoring to detect fairness degradation over time
3. Document all bias mitigation steps for regulatory compliance
4. Consider intersectional analysis across multiple protected attributes

## Compliance Assessment
- **EEOC 4/5ths Rule:** ${remediationResults ? (remediationResults.newDI >= 0.8 ? 'COMPLIANT' : 'PARTIALLY COMPLIANT') : (di >= 0.8 ? 'COMPLIANT' : 'NON-COMPLIANT')}
- **India DPDP Act 2023:** ${sp <= 0.2 ? 'COMPLIANT' : 'REVIEW NEEDED'}
- **EU AI Act (High-Risk):** ${di >= 0.7 ? 'LIKELY COMPLIANT' : 'NON-COMPLIANT'}

---
*Generated by FairLens — AI Bias Detection & Remediation Platform*
*Built for Google Solution Challenge 2026*
    `.trim()
  }

  // PDF Export
  const exportPDF = async () => {
    const el = reportRef.current
    if (!el) return

    const canvas = await html2canvas(el, {
      backgroundColor: '#151D2E',
      scale: 2,
      logging: false
    })
    const imgData = canvas.toDataURL('image/png')
    const pdf = new jsPDF('p', 'mm', 'a4')
    const imgWidth = 210
    const imgHeight = (canvas.height * imgWidth) / canvas.width

    let heightLeft = imgHeight
    let position = 0

    pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight)
    heightLeft -= 297

    while (heightLeft >= 0) {
      position = heightLeft - imgHeight
      pdf.addPage()
      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight)
      heightLeft -= 297
    }

    pdf.save(`FairLens-Audit-${datasetName}-${Date.now()}.pdf`)
  }

  if (!hasAnalysis) {
    return (
      <div className="fade-in-up" style={{ textAlign: 'center', paddingTop: '80px' }}>
        <div style={{
          width: '80px', height: '80px', borderRadius: '50%',
          background: 'rgba(99,179,237,0.1)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          margin: '0 auto 20px'
        }}>
          <FileText size={36} style={{ color: 'var(--accent-blue)', opacity: 0.5 }} />
        </div>
        <h2 style={{ fontSize: '1.375rem', fontWeight: 700, marginBottom: '8px' }}>
          {t('No Analysis Available')}
        </h2>
        <p style={{ color: 'var(--text-secondary)', maxWidth: '400px', margin: '0 auto' }}>
          {t('Run bias analysis in the Measure tab first to generate reports.')}
        </p>
      </div>
    )
  }

  return (
    <div className="fade-in-up">
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
            <FileText size={20} style={{ color: 'var(--accent-teal)' }} />
            <h2 style={{ fontSize: '1.375rem', fontWeight: 700, letterSpacing: '-0.02em' }}>
              {t('Audit Reports')}
            </h2>
          </div>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.8125rem' }}>
            {t('Generate compliance-ready reports and visual documentation')}
          </p>
        </div>
        <div style={{ display: 'flex', gap: '8px' }}>
          <button className="btn btn-secondary" onClick={generateReport} disabled={generating}>
            {generating ? <Loader2 size={16} className="spin" /> : <FileText size={16} />}
            {generating ? t('Generating...') : t('Generate Report')}
          </button>
          {activeSection === 'report' && (
            <button className="btn btn-primary" onClick={exportPDF}>
              <FileDown size={16} /> {t('Export Official Dossier')}
            </button>
          )}
        </div>
      </div>

      {/* Section Tabs */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '24px' }}>
        {[
          { id: 'nutrition', label: t('AI Nutrition Label'), icon: Shield },
          { id: 'compliance', label: t('Compliance Checker'), icon: CheckCircle },
          { id: 'report', label: t('Full Report'), icon: FileText },
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveSection(tab.id)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '8px 18px',
              borderRadius: 'var(--radius-md)',
              border: `1px solid ${activeSection === tab.id ? 'var(--accent-blue)' : 'var(--border-default)'}`,
              background: activeSection === tab.id ? 'rgba(99,179,237,0.1)' : 'var(--bg-card)',
              color: activeSection === tab.id ? 'var(--accent-blue)' : 'var(--text-secondary)',
              cursor: 'pointer',
              fontFamily: 'var(--font-sans)',
              fontWeight: 600,
              fontSize: '0.875rem',
              transition: 'all var(--transition-fast)'
            }}
          >
            <tab.icon size={16} />
            {tab.label}
          </button>
        ))}
      </div>

      <div ref={reportRef}>
        {/* Nutrition Label */}
        {activeSection === 'nutrition' && (
          <NutritionLabel
            datasetName={datasetName}
            rows={rows}
            columns={columns}
            sensitiveAttrs={sensitiveAttrs}
            targetColumn={targetColumn}
            analysisResults={analysisResults}
            remediationResults={remediationResults}
            modelResults={modelResults}
          />
        )}

        {/* Compliance Checker */}
        {activeSection === 'compliance' && (
          <ComplianceChecker
            analysisResults={analysisResults}
            sensitiveAttrs={sensitiveAttrs}
            remediationResults={remediationResults}
            rows={rows}
          />
        )}

        {/* Full Text Report */}
        {activeSection === 'report' && (
          <div className="card">
            <div className="card-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <FileText size={18} style={{ color: 'var(--accent-blue)' }} />
                <h3 style={{ fontSize: '1rem', fontWeight: 600 }}>{t('Full Audit Report')}</h3>
              </div>
            </div>
            <div className="card-body">
              {reportText ? (
                <div style={{
                  fontFamily: 'var(--font-sans)',
                  fontSize: '0.9rem',
                  lineHeight: 1.7,
                  color: 'var(--text-secondary)'
                }}>
                  {reportText.split('\n').map((line, i) => {
                    if (line.startsWith('# ')) return <h1 key={i} style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-primary)', margin: '24px 0 12px' }}>{line.slice(2)}</h1>
                    if (line.startsWith('## ')) return <h2 key={i} style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--text-primary)', margin: '20px 0 10px' }}>{line.slice(3)}</h2>
                    if (line.startsWith('### ')) return <h3 key={i} style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--accent-blue)', margin: '16px 0 8px' }}>{line.slice(4)}</h3>
                    if (line.startsWith('---')) return <hr key={i} style={{ border: 'none', borderTop: '1px solid var(--border-subtle)', margin: '20px 0' }} />
                    if (line.startsWith('- ')) return <p key={i} style={{ paddingLeft: '16px', margin: '4px 0' }}>• {line.slice(2)}</p>
                    if (line.startsWith('*')) return <p key={i} style={{ fontStyle: 'italic', color: 'var(--text-muted)', margin: '4px 0' }}>{line.replace(/\*/g, '')}</p>
                    if (line.match(/^[0-9]+\./)) return <p key={i} style={{ paddingLeft: '16px', margin: '4px 0' }}>{line}</p>
                    if (line.trim() === '') return <br key={i} />
                    return <p key={i} style={{ margin: '4px 0' }}>{line}</p>
                  })}
                </div>
              ) : (
                <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>
                  <FileText size={40} style={{ opacity: 0.3, margin: '0 auto 12px', display: 'block' }} />
                  <p>{t('Click "Generate Report" to create a detailed audit report')}</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
