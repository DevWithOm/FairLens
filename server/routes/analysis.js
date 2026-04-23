import express from 'express'
import { GoogleGenerativeAI } from '@google/generative-ai'
import { trainModel, predictRow, remediate } from '../ml/modelEngine.js'

const router = express.Router()

// In-memory model store (per-session, simple approach)
let currentModel = null

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

// ── Statistical Bias Analysis (existing) ──
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

// ── Train ML Model ──
router.post('/train', (req, res) => {
  try {
    const { rows, columns, sensitiveAttrs, targetColumn } = req.body

    if (!rows || !columns || !sensitiveAttrs || !targetColumn) {
      return res.status(400).json({ error: 'Missing required fields: rows, columns, sensitiveAttrs, targetColumn' })
    }

    console.log(`🧠 Training model: ${rows.length} rows, ${columns.length} features, target=${targetColumn}`)

    const result = trainModel(rows, columns, targetColumn, sensitiveAttrs)

    // Store model for predictions
    currentModel = {
      classifier: result.classifier,
      classifiers: result.classifiers,
      features: result.features,
      encoders: result.encoders,
      targetColumn,
      sensitiveAttrs
    }

    // Don't send the classifier/encoder objects to the client
    const { classifier, classifiers, encoders, ...clientResult } = result

    console.log(`✅ Model trained in ${result.trainingTime}ms — Accuracy: ${result.metrics.accuracy}, F1: ${result.metrics.f1}, Ensemble: ${result.numTrees} trees`)

    res.json({ success: true, ...clientResult })
  } catch (err) {
    console.error('❌ Model training failed:', err.message)
    res.status(500).json({ error: 'Model training failed: ' + err.message })
  }
})

// ── Predict Single Row (for Profile Flipper) ──
router.post('/predict', (req, res) => {
  try {
    const { row, flippedRow } = req.body

    if (!currentModel) {
      return res.status(400).json({ error: 'No model trained yet. Run /train first.' })
    }

    const { classifier, features, encoders } = currentModel

    const originalPred = predictRow(classifier, row, features, encoders)

    let flippedPred = null
    if (flippedRow) {
      flippedPred = predictRow(classifier, flippedRow, features, encoders)
    }

    res.json({
      success: true,
      original: originalPred,
      flipped: flippedPred,
      changed: flippedPred ? originalPred.prediction !== flippedPred.prediction : false
    })
  } catch (err) {
    console.error('❌ Prediction failed:', err.message)
    res.status(500).json({ error: 'Prediction failed: ' + err.message })
  }
})

// ── Remediate: Re-train with bias mitigation strategy ──
router.post('/remediate', (req, res) => {
  try {
    const { rows, columns, sensitiveAttrs, targetColumn, strategy } = req.body

    if (!rows || !columns || !sensitiveAttrs || !targetColumn || !strategy) {
      return res.status(400).json({ error: 'Missing required fields' })
    }

    console.log(`🔧 Remediation: strategy=${strategy}, ${rows.length} rows`)

    // Train original model for comparison (baseline)
    const baseline = trainModel(rows, columns, targetColumn, sensitiveAttrs)

    // Train remediated model
    const remediated = remediate(rows, columns, targetColumn, sensitiveAttrs, strategy)

    // Compute improvement
    const baselineFairness = baseline.fairnessMetrics[sensitiveAttrs[0]]
    const remediatedFairness = remediated.fairnessMetrics[sensitiveAttrs[0]]

    const comparison = {
      baseline: {
        accuracy: baseline.metrics.accuracy,
        precision: baseline.metrics.precision,
        recall: baseline.metrics.recall,
        f1: baseline.metrics.f1,
        modelDI: baselineFairness?.modelDI,
        equalizedOdds: baselineFairness?.equalizedOdds,
        statisticalParity: baselineFairness?.statisticalParity,
        biasLevel: baselineFairness?.biasLevel,
        groups: baselineFairness?.groups
      },
      remediated: {
        accuracy: remediated.metrics.accuracy,
        precision: remediated.metrics.precision,
        recall: remediated.metrics.recall,
        f1: remediated.metrics.f1,
        modelDI: remediatedFairness?.modelDI,
        equalizedOdds: remediatedFairness?.equalizedOdds,
        statisticalParity: remediatedFairness?.statisticalParity,
        biasLevel: remediatedFairness?.biasLevel,
        groups: remediatedFairness?.groups
      },
      improvement: {
        diChange: ((remediatedFairness?.modelDI || 0) - (baselineFairness?.modelDI || 0)),
        diChangePercent: Math.round(((remediatedFairness?.modelDI || 0) - (baselineFairness?.modelDI || 0)) * 100),
        accuracyChange: Math.round(((remediated.metrics.accuracy - baseline.metrics.accuracy)) * 1000) / 1000,
        fairnessImproved: (remediatedFairness?.modelDI || 0) > (baselineFairness?.modelDI || 0)
      },
      strategy,
      removedProxies: remediated.removedProxies || [],
      trainingTime: remediated.trainingTime
    }

    console.log(`✅ Remediation complete — DI: ${(baselineFairness?.modelDI * 100).toFixed(1)}% → ${(remediatedFairness?.modelDI * 100).toFixed(1)}%`)

    res.json({ success: true, comparison })
  } catch (err) {
    console.error('❌ Remediation failed:', err.message)
    res.status(500).json({ error: 'Remediation failed: ' + err.message })
  }
})

// ── Generate Report (existing) ──
router.post('/report', async (req, res) => {
  try {
    const { datasetName, sensitiveAttributes, targetColumn, analysisResults, remediationResults, modelResults } = req.body
    
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
    
    Statistical Analysis Results: ${JSON.stringify(analysisResults)}
    ML Model Results: ${JSON.stringify(modelResults || 'No ML model trained')}
    Remediation Efforts: ${JSON.stringify(remediationResults)}
    
    Structure the report with:
    1. Executive Summary
    2. Data Composition Analysis
    3. Statistical Bias Findings (reference Disparate Impact and Statistical Parity)
    4. ML Model Pipeline Analysis (CRITICAL: You MUST explicitly mention the Model Type such as "Ensemble Bagged Classifier" and the number of trees if available. Mention the Predictive Accuracy, F1 Score, and list the Top Decision Driver Features based on the provided modelResults)
    5. Compliance Assessment (EEOC 4/5ths Rule)
    6. Remediation Recommendations
    
    Format using Markdown headers and bullet points. Be highly professional, balanced, and authoritative as if writing a compliance dossier.`

    const result = await model.generateContent(prompt)
    const report = result.response.text()

    if (!report) throw new Error('Empty report from AI')

    res.json({ success: true, report, source: 'gemini' })
  } catch (err) {
    console.error('❌ Report Generation Gemini Error:', err.message || err)
    if (err.status) console.error('Status:', err.status)

    let errorType = 'gemini-error'
    if (err.message?.includes('429') || err.message?.includes('quota')) {
      errorType = 'rate-limit'
    } else if (err.message?.includes('401') || err.message?.includes('key')) {
      errorType = 'invalid-key'
    }

    res.json({ 
      success: true, 
      source: 'local-fallback', 
      report: null,
      error: err.message,
      errorType
    })
  }
})

export default router
