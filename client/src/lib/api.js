// ── FairLens API Client ──
// Communicates with the Express backend at /api/*
// All calls go through apiCall() for unified error handling

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'

const GEMINI_TIMEOUT_MS = 30000

/**
 * Unified API call wrapper with:
 * - Friendly error messages by HTTP status
 * - Network/fetch error handling
 * - Optional AbortController timeout for Gemini calls
 */
async function apiCall(endpoint, options = {}, { timeout = 0 } = {}) {
  let controller
  let timeoutId

  // Set up AbortController timeout if requested
  if (timeout > 0) {
    controller = new AbortController()
    timeoutId = setTimeout(() => controller.abort(), timeout)
    options.signal = controller.signal
  }

  try {
    const response = await fetch(API_BASE + endpoint, {
      headers: { 'Content-Type': 'application/json', ...options.headers },
      ...options
    })

    if (timeoutId) clearTimeout(timeoutId)

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      const message = errorData.error || errorData.message || 'Server error'

      // Friendly messages by status code
      if (response.status === 429) throw new Error('Too many requests — please wait a moment and try again.')
      if (response.status === 503) throw new Error('Gemini API is temporarily unavailable. Try again in 30 seconds.')
      if (response.status === 413) throw new Error('Dataset too large. Please use a file under 10MB.')
      if (response.status >= 500) throw new Error('Server error — ' + message)
      throw new Error(message)
    }

    return await response.json()
  } catch (err) {
    if (timeoutId) clearTimeout(timeoutId)

    if (err.name === 'AbortError') {
      throw new Error('AI response timed out. Your analysis is saved — click Retry to regenerate.')
    }
    if (err.name === 'TypeError' && err.message.includes('fetch')) {
      throw new Error('Cannot reach server. Is the backend running on port 5000?')
    }
    throw err
  }
}

// ── Datasets ──
export async function fetchSampleDatasets() {
  return apiCall('/datasets')
}

export async function loadSampleDataset(datasetId) {
  return apiCall(`/datasets/${datasetId}`)
}

// ── Analysis ──
export async function runBiasAnalysis(rows, sensitiveAttrs, targetColumn) {
  return apiCall('/analysis/bias', {
    method: 'POST',
    body: JSON.stringify({ rows, sensitiveAttrs, targetColumn })
  })
}

export async function runRemediation(rows, sensitiveAttr, targetColumn, strategy) {
  return apiCall('/analysis/remediate', {
    method: 'POST',
    body: JSON.stringify({ rows, sensitiveAttr, targetColumn, strategy })
  })
}

export async function generateReport(reportData, language) {
  return apiCall('/analysis/report', {
    method: 'POST',
    body: JSON.stringify({ ...reportData, language })
  }, { timeout: GEMINI_TIMEOUT_MS })
}

// ── Copilot ──
export async function sendCopilotMessage(message, context, language) {
  return apiCall('/copilot/chat', {
    method: 'POST',
    body: JSON.stringify({ message, context, language })
  }, { timeout: GEMINI_TIMEOUT_MS })
}

export async function scanPrompt(promptData, language) {
  return apiCall('/copilot/scan-prompt', {
    method: 'POST',
    body: JSON.stringify({ ...promptData, language })
  }, { timeout: GEMINI_TIMEOUT_MS })
}

export async function intersectionalExplainer(data, language) {
  return apiCall('/analysis/intersectional', {
    method: 'POST',
    body: JSON.stringify({ ...data, language })
  })
}

// ── Health Check ──
export async function checkHealth() {
  return apiCall('/health')
}

// Export the raw helper for components that need custom calls
export { apiCall }
