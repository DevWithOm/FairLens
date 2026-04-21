import express from 'express'
import { GoogleGenerativeAI } from '@google/generative-ai'

const router = express.Router()

function calculateBiasMetrics(rows, sensitiveAttr, targetCol) {
  const groups = {}
  rows.forEach(row => {
    const group = String(row[sensitiveAttr] ?? 'Unknown')
    if (!groups[group]) groups[group] = { total: 0, positive: 0 }
    groups[group].total++
    const outcome = row[targetCol]
    if (outcome === 1 || outcome === '1' || outcome === 'Yes' || outcome === 'yes' ||
        outcome === true || outcome === 'Approved' || outcome === 'approved') {
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

  const disparateImpact = maxRate > 0 ? minRate / maxRate : 1
  const statisticalParity = maxRate - minRate
  const equalOpportunity = 1 - statisticalParity

  const overallRate = rows.filter(r => {
    const v = r[targetCol]
    return v === 1 || v === '1' || v === 'Yes' || v === 'yes' || v === true || v === 'Approved'
  }).length / rows.length

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

router.post('/bias', (req, res) => {
  try {
    const { rows, sensitiveAttrs, targetColumn } = req.body
    const results = {}
    if (sensitiveAttrs && rows && targetColumn) {
        sensitiveAttrs.forEach(attr => {
            results[attr] = calculateBiasMetrics(rows, attr, targetColumn)
        })
    }
    res.json({ success: true, results })
  } catch (err) {
    res.status(500).json({ error: 'Analysis failed' })
  }
})

router.post('/report', async (req, res) => {
  try {
    const { datasetName, sensitiveAttributes, targetColumn, analysisResults, remediationResults } = req.body
    
    const apiKey = process.env.GEMINI_API_KEY
    if (!apiKey || apiKey === 'your_gemini_api_key_here') {
      return res.json({ success: true, source: 'local-fallback', report: null })
    }

    const genAI = new GoogleGenerativeAI(apiKey)
    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' })

    const prompt = `You are a professional AI Auditor. Generate a detailed, executive-style fairness audit report for a dataset.
    
    Dataset: ${datasetName}
    Target Column: ${targetColumn}
    Sensitive Attributes: ${sensitiveAttributes.join(', ')}
    
    Analysis Results: ${JSON.stringify(analysisResults)}
    Remediation Efforts: ${JSON.stringify(remediationResults)}
    
    Structure the report with:
    1. Executive Summary
    2. Data Composition Analysis
    3. Bias Findings (reference Disparate Impact and Statistical Parity)
    4. Compliance Assessment (EEOC 4/5ths Rule)
    5. Remediation Recommendations
    
    Format using Markdown headers and bullet points. Be professional and balanced.`

    const result = await model.generateContent(prompt)
    const report = result.response.text()

    if (!report) throw new Error('Empty report from AI')

    res.json({ success: true, report, source: 'gemini' })
  } catch (err) {
    console.error('Report generation error:', err)
    res.json({ success: true, source: 'local-fallback', report: null })
  }
})

export default router
