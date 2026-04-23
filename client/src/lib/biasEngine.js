// ═══════════════════════════════════════════════════════════════
// FairLens — Bias Engine (Core Calculation Utilities)
// ═══════════════════════════════════════════════════════════════

// ── Is a value a "positive" outcome? ──
export function isPositive(value) {
  return value === 1 || value === '1' || value === 'Yes' || value === 'yes' ||
    value === true || value === 'Approved' || value === 'approved' ||
    value === 'Selected' || value === 'selected' || value === 'Hired' || value === 'hired'
}

// ── Group outcome rates ──
export function groupOutcomeRates(rows, groupCol, outcomeCol) {
  const groups = {}
  rows.forEach(row => {
    const g = String(row[groupCol] ?? 'Unknown')
    if (!groups[g]) groups[g] = { total: 0, positive: 0 }
    groups[g].total++
    if (isPositive(row[outcomeCol])) groups[g].positive++
  })
  return Object.entries(groups).map(([group, { total, positive }]) => ({
    group,
    total,
    positive,
    rate: total > 0 ? positive / total : 0,
  })).sort((a, b) => b.rate - a.rate)
}

// ── Four-Fifths Rule (80% Rule) ──
export function fourFifthsRule(rates) {
  const best = Math.max(...rates.map(r => r.rate))
  return rates.map(r => ({
    ...r,
    ratio: best > 0 ? r.rate / best : 1,
    passes: best > 0 ? (r.rate / best) >= 0.8 : true,
  }))
}

// ── Overall fairness score (0–100) ──
export function fairnessScore(rates) {
  if (rates.length < 2) return 100
  const rateVals = rates.map(r => r.rate)
  const maxRate = Math.max(...rateVals)
  const minRate = Math.min(...rateVals)
  const disparity = maxRate > 0 ? (maxRate - minRate) / maxRate : 0
  return Math.round((1 - disparity) * 100)
}

// ── Disparate Impact Ratio ──
export function disparateImpact(rates) {
  const rateVals = rates.map(r => r.rate)
  const maxRate = Math.max(...rateVals)
  const minRate = Math.min(...rateVals)
  return maxRate > 0 ? minRate / maxRate : 1
}

// ── Intersectional matrix: rowGroup × colGroup → outcome rate ──
export function intersectionalMatrix(rows, rowCol, colCol, outcomeCol) {
  const rowSet = new Set()
  const colSet = new Set()
  const counts = {} // key: "rowVal|colVal"

  rows.forEach(row => {
    const r = String(row[rowCol] ?? '')
    const c = String(row[colCol] ?? '')
    if (!r || !c) return

    rowSet.add(r)
    colSet.add(c)

    const key = `${r}|${c}`
    if (!counts[key]) counts[key] = { total: 0, positive: 0 }
    counts[key].total++
    if (isPositive(row[outcomeCol])) counts[key].positive++
  })

  const rowValues = [...rowSet].sort()
  const colValues = [...colSet].sort()
  const matrix = {}

  rowValues.forEach(r => {
    matrix[r] = {}
    colValues.forEach(c => {
      const key = `${r}|${c}`
      const cell = counts[key]
      matrix[r][c] = {
        rate: cell ? cell.positive / cell.total : null,
        count: cell ? cell.total : 0,
        positive: cell ? cell.positive : 0
      }
    })
  })

  return { rowValues, colValues, matrix }
}

// ── Profile Flipper: counterfactual simulation ──
export function simulateFlip(rows, rowIndex, flipCol, flipValue, outcomeCol) {
  const row = rows[rowIndex]
  if (!row) return null
  const originalOutcome = row[outcomeCol]

  // Find rows matching the flipped profile (same values except flipped col)
  const otherCols = Object.keys(row).filter(k => k !== flipCol && k !== outcomeCol)
  
  // Optimization: Pre-filter by flip value to reduce pool quickly
  const candidates = rows.filter(r => String(r[flipCol]) === String(flipValue))
  
  const similar = candidates.filter(r =>
    otherCols.every(k => r[k] === row[k])
  )

  // If no exact match, use candidates pool
  const pool = similar.length > 3 ? similar : candidates
  if (pool.length === 0) return null

  const positiveCount = pool.filter(r => isPositive(r[outcomeCol])).length
  const positiveRate = positiveCount / pool.length

  const flippedOutcome = positiveRate >= 0.5
  const changed = isPositive(originalOutcome) !== flippedOutcome

  return {
    originalOutcome: isPositive(originalOutcome) ? 'Positive' : 'Negative',
    flippedOutcome: flippedOutcome ? 'Positive' : 'Negative',
    confidence: Math.abs(positiveRate - 0.5) * 2,
    sampleSize: pool.length,
    positiveRate,
    changed
  }
}

// ── Detect proxy columns ──
const PROXY_KEYWORDS = [
  'zip', 'pin', 'postal', 'city', 'area', 'region', 'district',
  'college', 'school', 'university', 'neighborhood', 'property',
  'vehicle', 'income', 'development_index', 'address', 'location',
  'state', 'country', 'marital', 'name'
]

const SENSITIVE_KEYWORDS = [
  'gender', 'sex', 'race', 'ethnicity', 'caste', 'religion', 'age',
  'disability', 'orientation', 'nationality', 'tribe', 'color'
]

export function detectProxies(columns) {
  return columns.filter(col =>
    PROXY_KEYWORDS.some(kw => col.toLowerCase().includes(kw))
  )
}

export function detectSensitive(columns) {
  return columns.filter(col =>
    SENSITIVE_KEYWORDS.some(kw => col.toLowerCase().includes(kw))
  )
}

// ── Column risk classification ──
export function classifyColumnRisk(col, columns, rows) {
  const colLower = col.toLowerCase()

  // High risk: directly sensitive
  if (SENSITIVE_KEYWORDS.some(kw => colLower.includes(kw))) {
    return { level: 'high', score: 90, type: 'Sensitive Attribute', biasType: 'Historical bias' }
  }

  // Medium risk: proxy variable
  if (PROXY_KEYWORDS.some(kw => colLower.includes(kw))) {
    return { level: 'medium', score: 60, type: 'Proxy Variable', biasType: 'Proxy bias' }
  }

  // Check if column has low cardinality (categorical) — could be a hidden demographic
  if (rows.length > 0) {
    const uniqueValues = new Set(rows.slice(0, 500).map(r => r[col]))
    if (uniqueValues.size <= 5 && uniqueValues.size >= 2) {
      return { level: 'medium', score: 40, type: 'Low Cardinality', biasType: 'Selection bias' }
    }
  }

  // Low risk: numeric/technical
  return { level: 'low', score: 15, type: 'Technical', biasType: null }
}

// ── Bias Type Classifier ──
export function classifyBiasType(col, rows) {
  const colLower = col.toLowerCase()

  if (SENSITIVE_KEYWORDS.some(kw => colLower.includes(kw))) {
    return 'Historical bias'
  }
  if (PROXY_KEYWORDS.some(kw => colLower.includes(kw))) {
    return 'Proxy bias'
  }

  // Check for data imbalance (selection bias)
  if (rows.length > 0) {
    const values = rows.map(r => r[col])
    const counts = {}
    values.forEach(v => { counts[String(v)] = (counts[String(v)] || 0) + 1 })
    const maxCount = Math.max(...Object.values(counts))
    const minCount = Math.min(...Object.values(counts))
    if (maxCount / minCount > 10) return 'Selection bias'
  }

  return 'Measurement bias'
}

// ── Fairness Grade (A–F) per group ──
export function fairnessGrade(rate, bestRate) {
  if (bestRate === 0) return 'A'
  const disparity = Math.abs(bestRate - rate) / bestRate * 100
  if (disparity <= 5) return 'A'
  if (disparity <= 10) return 'B'
  if (disparity <= 20) return 'C'
  if (disparity <= 30) return 'D'
  return 'F'
}

// ── Simulate fairness-accuracy tradeoff ──
export function simulateTradeoff(rates, fairnessWeight) {
  // fairnessWeight: 0 = maximize accuracy, 1 = maximize fairness
  const avgRate = rates.reduce((s, r) => s + r.rate, 0) / rates.length
  return rates.map(r => {
    const adjustedRate = r.rate + (avgRate - r.rate) * fairnessWeight
    return { ...r, adjustedRate }
  })
}

// ── Demographic distribution analysis ──
export function demographicDistribution(rows, col) {
  const counts = {}
  rows.forEach(row => {
    const v = String(row[col] ?? 'Unknown')
    counts[v] = (counts[v] || 0) + 1
  })
  const total = rows.length
  return Object.entries(counts)
    .map(([value, count]) => ({
      value,
      count,
      percentage: (count / total) * 100,
      underrepresented: (count / total) < 0.1  // < 10% = underrepresented
    }))
    .sort((a, b) => b.count - a.count)
}
