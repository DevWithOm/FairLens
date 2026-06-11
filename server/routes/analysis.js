import express from 'express'
import { GoogleGenerativeAI } from '@google/generative-ai'
import { trainModel, predictRow, remediate } from '../ml/modelEngine.js'

const router = express.Router()

export const auditStore = new Map()

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

    const beforeDI = baselineFairness?.modelDI || 0;
    const afterDI = remediatedFairness?.modelDI || 0;
    const beforeAccuracy = baseline.metrics.accuracy || 0;
    const afterAccuracy = remediated.metrics.accuracy || 0;
    const beforeSPD = baselineFairness?.statisticalParity || 0;
    const afterSPD = remediatedFairness?.statisticalParity || 0;

    const diImprovement = afterDI - beforeDI;
    const accuracyLoss = beforeAccuracy - afterAccuracy;
    const spdImprovement = beforeSPD - afterSPD;

    let confidenceScore = 60;
    if (diImprovement > 0.15) confidenceScore += 20;
    if (accuracyLoss < 0.02) confidenceScore += 10;
    if (spdImprovement > 0.10) confidenceScore += 10;
    if (accuracyLoss > 0.05) confidenceScore -= 20;
    
    confidenceScore = Math.max(0, Math.min(100, Math.round(confidenceScore)));

    let confidenceLabel = 'Low';
    if (confidenceScore >= 75) confidenceLabel = 'High';
    else if (confidenceScore >= 50) confidenceLabel = 'Medium';

    const biasReductionPercent = beforeDI >= 1 ? 0 : Math.round(((afterDI - beforeDI) / (1 - beforeDI)) * 100);
    const accuracyTradeoff = Math.round(Math.abs(afterAccuracy - beforeAccuracy) * 1000) / 10;

    let recommendation = '';
    if (confidenceLabel === 'High') {
      recommendation = "This remediation strategy is recommended. Bias reduced significantly with minimal accuracy impact.";
    } else if (confidenceLabel === 'Medium') {
      recommendation = "Moderate improvement achieved. Consider combining with Proxy Removal for better results.";
    } else {
      recommendation = "Limited improvement. Try Calibrated Resampling or consult AI Copilot for dataset-specific guidance.";
    }

    console.log(`✅ Remediation complete — DI: ${(baselineFairness?.modelDI * 100).toFixed(1)}% → ${(remediatedFairness?.modelDI * 100).toFixed(1)}%`)

    res.json({
      success: true,
      comparison,
      confidenceScore,
      confidenceLabel,
      biasReductionPercent,
      accuracyTradeoff,
      recommendation
    })
  } catch (err) {
    console.error('❌ Remediation failed:', err.message)
    res.status(500).json({ error: 'Remediation failed: ' + err.message })
  }
})

// ── Generate Report (existing) ──
router.post('/report', async (req, res) => {
  try {
    const { datasetName, sensitiveAttributes, targetColumn, analysisResults, remediationResults, modelResults, localReportText, language } = req.body
    
    const apiKey = process.env.GEMINI_API_KEY
    if (!apiKey || apiKey === 'your_gemini_api_key_here') {
      const auditId = Math.random().toString(36).substring(2, 10).toUpperCase()
      auditStore.set(auditId, { report: localReportText, metrics: { analysisResults, remediationResults, modelResults }, timestamp: Date.now(), dataset: datasetName })
      return res.json({ success: true, source: 'local-fallback', report: localReportText, auditId, shareUrl: "/audit/" + auditId })
    }

    const genAI = new GoogleGenerativeAI(apiKey)
    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' })

    let prompt = `You are a professional AI Auditor. Generate a detailed, executive-style fairness audit report for a dataset.
    
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

    if (language === 'hi') {
      prompt = "Respond entirely in Hindi (Devanagari script). Use simple, clear Hindi language. " + prompt
    }

    const result = await model.generateContent(prompt)
    const report = result.response.text()

    if (!report) throw new Error('Empty report from AI')

    const auditId = Math.random().toString(36).substring(2, 10).toUpperCase()
    auditStore.set(auditId, { report, metrics: { analysisResults, remediationResults, modelResults }, timestamp: Date.now(), dataset: datasetName })

    res.json({ success: true, report, source: 'gemini', auditId, shareUrl: "/audit/" + auditId })
  } catch (err) {
    console.error('❌ Report Generation Gemini Error:', err.message || err)
    if (err.status) console.error('Status:', err.status)

    let errorType = 'gemini-error'
    if (err.message?.includes('429') || err.message?.includes('quota')) {
      errorType = 'rate-limit'
    } else if (err.message?.includes('401') || err.message?.includes('key')) {
      errorType = 'invalid-key'
    }

    const auditId = Math.random().toString(36).substring(2, 10).toUpperCase()
    auditStore.set(auditId, { report: null, metrics: { analysisResults, remediationResults, modelResults }, timestamp: Date.now(), dataset: datasetName })

    res.json({ 
      success: true, 
      source: 'local-fallback', 
      report: null,
      error: err.message,
      errorType,
      auditId,
      shareUrl: "/audit/" + auditId
    })
  }
})

// ── Intersectional Bias Analysis ──
router.post('/intersectional', (req, res) => {
  try {
    const { data, attribute1, attribute2, targetColumn, positiveOutcome } = req.body;
    
    if (!data || !attribute1 || !attribute2 || !targetColumn || !positiveOutcome) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const attr1Values = [...new Set(data.map(row => String(row[attribute1] ?? 'Unknown')))];
    const attr2Values = [...new Set(data.map(row => String(row[attribute2] ?? 'Unknown')))];

    const matrix = {};
    let bestGroup = null;
    let worstGroup = null;

    for (const v1 of attr1Values) {
      for (const v2 of attr2Values) {
        const key = `${v1}_${v2}`;
        const label = `${v1} + ${v2}`;
        
        const filtered = data.filter(r => String(r[attribute1] ?? 'Unknown') === v1 && String(r[attribute2] ?? 'Unknown') === v2);
        const count = filtered.length;
        
        let positiveCount = 0;
        filtered.forEach(r => {
          const outcome = r[targetColumn];
          const isPos = outcome === 1 || outcome === '1' || outcome === 'Yes' || outcome === 'yes' ||
                        outcome === true || outcome === 'Approved' || outcome === 'approved' ||
                        outcome === 'Selected' || outcome === 'selected' || outcome === 'Hired' || outcome === 'hired';
          if (isPos || String(outcome).toLowerCase() === String(positiveOutcome).toLowerCase()) {
            positiveCount++;
          }
        });
        
        const rate = count > 0 ? positiveCount / count : 0;
        
        matrix[key] = { label, rate, count, ratio: 0 };
        
        if (!bestGroup || rate > bestGroup.rate) {
          bestGroup = { label, rate, count, key };
        }
      }
    }

    const bestRate = bestGroup?.rate || 1;
    let maxDisparity = 0;

    for (const key in matrix) {
      const cell = matrix[key];
      const ratio = bestRate > 0 ? cell.rate / bestRate : 1;
      const disparity = 1 - ratio;
      
      cell.ratio = ratio;
      
      if (!worstGroup || disparity > (1 - worstGroup.ratio)) {
        worstGroup = { ...cell, ratio };
      }
      
      if (disparity > maxDisparity) {
        maxDisparity = disparity;
      }
    }

    res.json({
      attribute1,
      attribute2,
      attr1Values,
      attr2Values,
      matrix,
      worstGroup,
      bestGroup,
      maxDisparity
    });
  } catch (err) {
    console.error('❌ Intersectional analysis failed:', err.message);
    res.status(500).json({ error: 'Intersectional analysis failed' });
  }
});

export default router
