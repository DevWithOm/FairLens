// ═══════════════════════════════════════════════════════════════
// FairLens — ML Model Engine v2 (Ensemble Decision Tree Classifier)
// ═══════════════════════════════════════════════════════════════
import { DecisionTreeClassifier as DTClassifier } from 'ml-cart'
import { ConfusionMatrix } from 'ml-confusion-matrix'

// ── Is a value a "positive" outcome? ──
function isPositive(value) {
  return value === 1 || value === '1' || value === 'Yes' || value === 'yes' ||
    value === true || value === 'Approved' || value === 'approved' ||
    value === 'Selected' || value === 'selected' || value === 'Hired' || value === 'hired'
}

// ── Label encode categorical features ──
function buildLabelEncoders(rows, featureCols) {
  const encoders = {}
  featureCols.forEach(col => {
    const sampleValues = rows.slice(0, Math.min(500, rows.length)).map(r => r[col]).filter(v => v != null)
    const isNumeric = sampleValues.length > 0 && sampleValues.every(v => !isNaN(Number(v)))

    if (!isNumeric) {
      const uniqueVals = [...new Set(rows.map(r => String(r[col] ?? 'Unknown')))]
      const mapping = {}
      uniqueVals.forEach((val, i) => { mapping[val] = i })
      encoders[col] = mapping
    }
  })
  return encoders
}

function encodeRow(row, featureCols, encoders) {
  return featureCols.map(col => {
    const val = row[col]
    if (encoders[col]) {
      return encoders[col][String(val ?? 'Unknown')] ?? 0
    }
    const num = Number(val)
    return isNaN(num) ? 0 : num
  })
}

// ── Impute missing values with column median/mode ──
function imputeMissing(rows, featureCols) {
  const imputed = rows.map(r => ({ ...r }))
  
  featureCols.forEach(col => {
    const values = rows.map(r => r[col]).filter(v => v != null && v !== '' && v !== 'Unknown')
    const isNumeric = values.length > 0 && values.every(v => !isNaN(Number(v)))

    if (isNumeric) {
      // Median imputation for numeric
      const sorted = values.map(Number).sort((a, b) => a - b)
      const median = sorted[Math.floor(sorted.length / 2)]
      imputed.forEach(r => {
        if (r[col] == null || r[col] === '' || isNaN(Number(r[col]))) {
          r[col] = median
        }
      })
    } else {
      // Mode imputation for categorical
      const freq = {}
      values.forEach(v => { freq[String(v)] = (freq[String(v)] || 0) + 1 })
      const mode = Object.entries(freq).sort((a, b) => b[1] - a[1])[0]?.[0] || 'Unknown'
      imputed.forEach(r => {
        if (r[col] == null || r[col] === '') {
          r[col] = mode
        }
      })
    }
  })
  return imputed
}

// ── Shuffle array (Fisher-Yates, deterministic) ──
function shuffle(arr, seed = 42) {
  const a = [...arr]
  let s = seed
  for (let i = a.length - 1; i > 0; i--) {
    s = (s * 16807) % 2147483647
    const j = s % (i + 1)
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

// ── Compute per-group fairness metrics from predictions ──
function computeGroupMetrics(rows, predictions, trueLabels, sensitiveAttr) {
  const groups = {}

  for (let i = 0; i < rows.length; i++) {
    const group = String(rows[i][sensitiveAttr] ?? 'Unknown')
    if (!groups[group]) {
      groups[group] = { total: 0, positive_pred: 0, positive_true: 0, tp: 0, fp: 0, fn: 0, tn: 0 }
    }
    const g = groups[group]
    g.total++
    if (predictions[i] === 1) g.positive_pred++
    if (trueLabels[i] === 1) g.positive_true++

    if (predictions[i] === 1 && trueLabels[i] === 1) g.tp++
    else if (predictions[i] === 1 && trueLabels[i] === 0) g.fp++
    else if (predictions[i] === 0 && trueLabels[i] === 1) g.fn++
    else g.tn++
  }

  const groupStats = Object.entries(groups).map(([name, g]) => {
    const predRate = g.total > 0 ? g.positive_pred / g.total : 0
    const trueRate = g.total > 0 ? g.positive_true / g.total : 0
    const tpr = (g.tp + g.fn) > 0 ? g.tp / (g.tp + g.fn) : 0
    const fpr = (g.fp + g.tn) > 0 ? g.fp / (g.fp + g.tn) : 0
    const precision = (g.tp + g.fp) > 0 ? g.tp / (g.tp + g.fp) : 0
    const accuracy = g.total > 0 ? (g.tp + g.tn) / g.total : 0

    return {
      name, total: g.total, predRate, trueRate, tpr, fpr, precision, accuracy,
      tp: g.tp, fp: g.fp, fn: g.fn, tn: g.tn
    }
  }).sort((a, b) => b.predRate - a.predRate)

  const predRates = groupStats.map(g => g.predRate)
  const maxPredRate = Math.max(...predRates)
  const minPredRate = Math.min(...predRates)
  const modelDI = maxPredRate > 0 ? minPredRate / maxPredRate : 1

  const tprs = groupStats.map(g => g.tpr)
  const fprs = groupStats.map(g => g.fpr)
  const tprDiff = Math.max(...tprs) - Math.min(...tprs)
  const fprDiff = Math.max(...fprs) - Math.min(...fprs)
  const equalizedOdds = 1 - Math.max(tprDiff, fprDiff)

  const statisticalParity = maxPredRate - minPredRate

  return {
    groups: groupStats, modelDI, equalizedOdds, statisticalParity,
    privilegedGroup: groupStats[0]?.name,
    unprivilegedGroup: groupStats[groupStats.length - 1]?.name,
    biasLevel: modelDI >= 0.8 ? 'low' : modelDI >= 0.6 ? 'moderate' : modelDI >= 0.4 ? 'high' : 'critical'
  }
}

// ══════════════════════════════════════════════════
// Ensemble: Train multiple trees (Bagging)
// ══════════════════════════════════════════════════
function trainBaggedEnsemble(X_train, y_train, numTrees, dtOptions, seed = 42, subsampleRatio = 1.0) {
  const trees = []
  const n = X_train.length
  const subsampleSize = Math.floor(n * subsampleRatio)

  for (let t = 0; t < numTrees; t++) {
    // Bootstrap sample or subsample
    const bootstrapIndices = []
    let s = seed + t * 1337
    for (let i = 0; i < subsampleSize; i++) {
      s = (s * 16807 + i) % 2147483647
      bootstrapIndices.push(s % n)
    }

    const X_boot = bootstrapIndices.map(i => X_train[i])
    const y_boot = bootstrapIndices.map(i => y_train[i])

    const tree = new DTClassifier(dtOptions)
    tree.train(X_boot, y_boot)
    trees.push(tree)
  }
  return trees
}

function predictEnsemble(trees, X) {
  return X.map(row => {
    const votes = trees.map(t => t.predict([row])[0])
    const ones = votes.filter(v => v === 1).length
    return ones > votes.length / 2 ? 1 : 0
  })
}

// ══════════════════════════════════════════════════
// Main: Train Model (v2 — Ensemble + Better Tuning)
// ══════════════════════════════════════════════════
export function trainModel(rows, featureCols, targetColumn, sensitiveAttrs, options = {}) {
  const startTime = Date.now()

  // 0. Impute missing values
  const cleanRows = imputeMissing(rows, featureCols)

  // 1. Prepare labels (binary: 0/1)
  const labels = cleanRows.map(r => isPositive(r[targetColumn]) ? 1 : 0)

  // 2. Remove sensitive attrs and target from features
  const excludeCols = new Set([targetColumn, ...(options.excludeColumns || [])])
  if (!options.keepSensitive) {
    sensitiveAttrs.forEach(a => excludeCols.add(a))
  }
  const modelFeatures = featureCols.filter(c => !excludeCols.has(c))

  // 3. Build encoders and encode data
  const encoders = buildLabelEncoders(cleanRows, modelFeatures)
  const encodedData = cleanRows.map(r => encodeRow(r, modelFeatures, encoders))

  // 4. Train/test split — adaptive ratio based on dataset size
  const splitRatio = rows.length > 5000 ? 0.85 : rows.length > 2000 ? 0.80 : 0.75
  const indices = shuffle(Array.from({ length: cleanRows.length }, (_, i) => i))
  const splitIdx = Math.floor(indices.length * splitRatio)
  const trainIndices = indices.slice(0, splitIdx)
  const testIndices = indices.slice(splitIdx)

  const X_train = trainIndices.map(i => encodedData[i])
  const y_train = trainIndices.map(i => labels[i])
  const X_test = testIndices.map(i => encodedData[i])
  const y_test = testIndices.map(i => labels[i])

  // 5. Apply sample weights if provided (oversample minority)
  let X_trainFinal = X_train
  let y_trainFinal = y_train
  if (options.sampleWeights) {
    const weightMap = options.sampleWeights
    const augX = []
    const augY = []
    for (let i = 0; i < X_train.length; i++) {
      const originalRow = cleanRows[trainIndices[i]]
      const group = String(originalRow[sensitiveAttrs[0]] ?? 'Unknown')
      const weight = weightMap[group] || 1
      const repeats = Math.round(weight)
      for (let r = 0; r < repeats; r++) {
        augX.push(X_train[i])
        augY.push(y_train[i])
      }
    }
    X_trainFinal = augX
    y_trainFinal = augY
  }

  // 6. Adaptive hyperparameters based on dataset size
  // ml-cart is pure JS — we trade depth for speed on large datasets
  const autoMaxDepth = rows.length > 8000 ? 8 : rows.length > 5000 ? 10 : rows.length > 2000 ? 12 : 10
  const autoMinSamples = rows.length > 8000 ? 25 : rows.length > 5000 ? 15 : rows.length > 2000 ? 5 : 3

  const dtOptions = {
    gainFunction: 'gini',
    maxDepth: options.maxDepth || autoMaxDepth,
    minNumSamples: options.minNumSamples || autoMinSamples
  }

  // 7. Ensemble bagging — fewer trees for large data to keep training fast
  const numTrees = rows.length > 8000 ? 3 : rows.length > 3000 ? 3 : 3

  // Subsample for large datasets: train each tree on a random subset
  const subsampleRatio = rows.length > 8000 ? 0.4 : rows.length > 5000 ? 0.5 : 1.0
  const trees = trainBaggedEnsemble(X_trainFinal, y_trainFinal, numTrees, dtOptions, 42, subsampleRatio)

  // Use first tree for single-row predictions (faster than ensemble for /predict)
  const singleTree = trees[0]

  // 8. Predictions on test set (ensemble)
  const y_pred = predictEnsemble(trees, X_test)

  // 9. Compute overall metrics
  const cm = ConfusionMatrix.fromLabels(y_test, y_pred)
  const accuracy = cm.getAccuracy()

  let tp = 0, fp = 0, fn = 0, tn = 0
  for (let i = 0; i < y_test.length; i++) {
    if (y_pred[i] === 1 && y_test[i] === 1) tp++
    else if (y_pred[i] === 1 && y_test[i] === 0) fp++
    else if (y_pred[i] === 0 && y_test[i] === 1) fn++
    else tn++
  }
  const precision = (tp + fp) > 0 ? tp / (tp + fp) : 0
  const recall = (tp + fn) > 0 ? tp / (tp + fn) : 0
  const f1 = (precision + recall) > 0 ? 2 * (precision * recall) / (precision + recall) : 0

  // 10. Per-group fairness metrics
  const testRows = testIndices.map(i => cleanRows[i])
  const fairnessMetrics = {}
  sensitiveAttrs.forEach(attr => {
    fairnessMetrics[attr] = computeGroupMetrics(testRows, y_pred, y_test, attr)
  })

  // 11. Feature importance (correlation-based approximation)
  const featureImportance = modelFeatures.map((col, idx) => {
    // Compute point-biserial correlation between feature and label
    const featureVals = encodedData.map(r => r[idx])
    const labelVals = labels
    const n = featureVals.length
    const meanF = featureVals.reduce((s, v) => s + v, 0) / n
    const meanL = labelVals.reduce((s, v) => s + v, 0) / n
    let cov = 0, varF = 0, varL = 0
    for (let i = 0; i < n; i++) {
      cov += (featureVals[i] - meanF) * (labelVals[i] - meanL)
      varF += (featureVals[i] - meanF) ** 2
      varL += (labelVals[i] - meanL) ** 2
    }
    const correlation = (varF > 0 && varL > 0) ? Math.abs(cov / Math.sqrt(varF * varL)) : 0

    return { feature: col, importance: Math.round(correlation * 1000) / 1000 }
  }).sort((a, b) => b.importance - a.importance)

  const trainingTime = Date.now() - startTime

  return {
    success: true,
    modelType: 'DecisionTree',
    ensemble: true,
    numTrees,
    features: modelFeatures,
    encoders,
    classifier: singleTree,     // single tree for predict API
    classifiers: trees,          // ensemble for accuracy
    metrics: {
      accuracy: Math.round(accuracy * 1000) / 1000,
      precision: Math.round(precision * 1000) / 1000,
      recall: Math.round(recall * 1000) / 1000,
      f1: Math.round(f1 * 1000) / 1000,
      tp, fp, fn, tn,
      testSize: y_test.length,
      trainSize: X_trainFinal.length
    },
    fairnessMetrics,
    featureImportance,
    trainingTime,
    splitRatio: `${Math.round(splitRatio * 100)}/${Math.round((1 - splitRatio) * 100)}`
  }
}

// ══════════════════════════════════════════════════
// Predict single row
// ══════════════════════════════════════════════════
export function predictRow(classifier, row, modelFeatures, encoders) {
  const encoded = encodeRow(row, modelFeatures, encoders)
  const prediction = classifier.predict([encoded])
  return {
    prediction: prediction[0],
    label: prediction[0] === 1 ? 'Positive' : 'Negative'
  }
}

// ══════════════════════════════════════════════════
// Remediate: Train with different strategies
// ══════════════════════════════════════════════════
export function remediate(rows, featureCols, targetColumn, sensitiveAttrs, strategy) {
  const options = {}

  switch (strategy) {
    case 'reweighing': {
      const attr = sensitiveAttrs[0]
      const groups = {}
      rows.forEach(r => {
        const g = String(r[attr] ?? 'Unknown')
        if (!groups[g]) groups[g] = { total: 0, positive: 0 }
        groups[g].total++
        if (isPositive(r[targetColumn])) groups[g].positive++
      })
      const avgRate = Object.values(groups).reduce((s, g) => s + g.positive / g.total, 0) / Object.keys(groups).length
      const weights = {}
      Object.entries(groups).forEach(([name, g]) => {
        const groupRate = g.positive / g.total
        weights[name] = groupRate > 0 ? Math.max(1, Math.round(avgRate / groupRate * 1.5)) : 2
      })
      options.sampleWeights = weights
      break
    }

    case 'proxy_removal': {
      const PROXY_KEYWORDS = [
        'zip', 'pin', 'postal', 'city', 'area', 'region', 'district',
        'college', 'school', 'university', 'neighborhood', 'property',
        'vehicle', 'address', 'location', 'state', 'country', 'marital', 'name',
        'insurance', 'income_bracket', 'zip_risk'
      ]
      const proxyCols = featureCols.filter(col =>
        PROXY_KEYWORDS.some(kw => col.toLowerCase().includes(kw))
      )
      options.excludeColumns = proxyCols
      options.removedProxies = proxyCols
      break
    }

    case 'threshold': {
      break
    }

    case 'calibrated': {
      const attr = sensitiveAttrs[0]
      const groups = {}
      rows.forEach(r => {
        const g = String(r[attr] ?? 'Unknown')
        if (!groups[g]) groups[g] = { total: 0, positive: 0 }
        groups[g].total++
        if (isPositive(r[targetColumn])) groups[g].positive++
      })
      const avgRate = Object.values(groups).reduce((s, g) => s + g.positive / g.total, 0) / Object.keys(groups).length
      const weights = {}
      Object.entries(groups).forEach(([name, g]) => {
        const groupRate = g.positive / g.total
        weights[name] = groupRate > 0 ? Math.max(1, Math.round(avgRate / groupRate * 2)) : 3
      })
      options.sampleWeights = weights
      options.maxDepth = 6
      break
    }

    default:
      break
  }

  const result = trainModel(rows, featureCols, targetColumn, sensitiveAttrs, options)

  return {
    ...result,
    strategy,
    removedProxies: options.removedProxies || []
  }
}
