// ── FairLens API Client ──
// Communicates with the Express backend at /api/*

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'

async function apiRequest(endpoint, options = {}) {
  try {
    const res = await fetch(`${API_BASE}${endpoint}`, {
      headers: { 'Content-Type': 'application/json' },
      ...options
    })
    const data = await res.json()
    if (!res.ok) throw new Error(data.error || `API error: ${res.status}`)
    return data
  } catch (err) {
    console.error(`API call failed: ${endpoint}`, err)
    throw err
  }
}

// ── Datasets ──
export async function fetchSampleDatasets() {
  return apiRequest('/datasets')
}

export async function loadSampleDataset(datasetId) {
  return apiRequest(`/datasets/${datasetId}`)
}

// ── Analysis ──
export async function runBiasAnalysis(rows, sensitiveAttrs, targetColumn) {
  return apiRequest('/analysis/bias', {
    method: 'POST',
    body: JSON.stringify({ rows, sensitiveAttrs, targetColumn })
  })
}

export async function runRemediation(rows, sensitiveAttr, targetColumn, strategy) {
  return apiRequest('/analysis/remediate', {
    method: 'POST',
    body: JSON.stringify({ rows, sensitiveAttr, targetColumn, strategy })
  })
}

export async function generateReport(reportData) {
  return apiRequest('/analysis/report', {
    method: 'POST',
    body: JSON.stringify(reportData)
  })
}

// ── Copilot ──
export async function sendCopilotMessage(message, context) {
  return apiRequest('/copilot/chat', {
    method: 'POST',
    body: JSON.stringify({ message, context })
  })
}

// ── Health Check ──
export async function checkHealth() {
  return apiRequest('/health')
}
