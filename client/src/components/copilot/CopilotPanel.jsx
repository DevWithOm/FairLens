import React, { useState, useRef, useEffect } from 'react'
import { useData } from '../../lib/DataContext'
import {
  X, Send, Sparkles, Bot, User, Copy, RotateCcw, Loader2, AlertTriangle
} from 'lucide-react'

const SYSTEM_PROMPT_EN = `You are FairLens Copilot, an AI fairness expert assistant. You help users understand bias in their datasets and suggest remediation strategies. Be concise, precise, and use technical fairness terminology. Format responses with markdown when helpful.`

const SYSTEM_PROMPT_HI = `You are FairLens Copilot. IMPORTANT: Respond entirely in Hindi language (Devanagari script). You help users understand bias in their datasets and suggest remediation strategies. Be concise and use simple Hindi.`

const SUGGESTED_PROMPTS = [
  "What bias metrics should I focus on?",
  "Explain disparate impact ratio",
  "How can I fix gender bias in hiring data?",
  "What does the 4/5ths rule mean?",
  "Suggest remediation for this dataset",
  "Which compliance frameworks apply?"
]

export default function CopilotPanel({ onClose }) {
  const data = useData()
  const isHindi = data?.language === 'hindi'
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: `👋 Hi! I'm the **FairLens Copilot** — your AI fairness assistant.\n\nI can help you:\n- Understand bias metrics and their implications\n- Suggest remediation strategies\n- Explain compliance requirements (EEOC, EU AI Act)\n- Interpret your analysis results\n\nWhat would you like to know?`
    }
  ])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const chatEndRef = useRef(null)
  const inputRef = useRef(null)

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const getContextString = () => {
    let ctx = ''
    if (data.datasetName) {
      ctx += `\nCurrent dataset: ${data.datasetName}`
      ctx += `\nRows: ${data.rows.length}, Columns: ${data.columns.length}`
      ctx += `\nTarget: ${data.targetColumn || 'not set'}`
      ctx += `\nSensitive attrs: ${data.sensitiveAttrs.join(', ') || 'none'}`
    }
    if (data.analysisResults) {
      Object.entries(data.analysisResults).forEach(([attr, result]) => {
        if (!result) return
        ctx += `\n\nBias Analysis for ${attr}:`
        ctx += `\n- Disparate Impact: ${(result.disparateImpact*100).toFixed(1)}%`
        ctx += `\n- Statistical Parity Gap: ${(result.statisticalParity*100).toFixed(1)}%`
        ctx += `\n- Bias Level: ${result.biasLevel}`
        ctx += `\n- 4/5ths Rule: ${result.disparateImpact >= 0.8 ? 'PASS' : 'FAIL'}`
      })
    }
    return ctx
  }

  const sendMessage = async (text) => {
    const userMsg = text || input.trim()
    if (!userMsg) return
    
    setInput('')
    setMessages(prev => [...prev, { role: 'user', content: userMsg }])
    setLoading(true)

    try {
      // Build context object to send to backend
      const context = {
        datasetName: data.datasetName,
        rowCount: data.rows.length,
        columnCount: data.columns.length,
        targetColumn: data.targetColumn,
        sensitiveAttrs: data.sensitiveAttrs,
        analysisResults: data.analysisResults
      }

      const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'
      const langInstruction = isHindi ? '\nIMPORTANT: Respond entirely in Hindi (Devanagari script).' : ''
      const resp = await fetch(`${API_BASE}/copilot/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: userMsg + langInstruction, context, language: data?.language })
      })
      const json = await resp.json()
      
      if (json.success && json.response) {
        setMessages(prev => [...prev, { 
          role: 'assistant', 
          content: json.response,
          source: json.source,
          errorType: json.errorType
        }])
      } else {
        throw new Error('No response from server')
      }
    } catch (err) {
      // Fallback to local response if backend is unreachable or returns error
      const response = generateLocalResponse(userMsg, data)
      setMessages(prev => [...prev, { role: 'assistant', content: response, source: 'local-unreachable' }])
    }
    
    setLoading(false)
  }


  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  return (
    <div style={{
      position: 'fixed',
      right: 0,
      top: 0,
      bottom: 0,
      width: '400px',
      background: 'var(--bg-secondary)',
      borderLeft: '1px solid var(--border-subtle)',
      display: 'flex',
      flexDirection: 'column',
      zIndex: 50,
      boxShadow: '-10px 0 40px rgba(0,0,0,0.3)',
      animation: 'slideInRight 0.3s ease-out'
    }}>
      {/* Header */}
      <div style={{
        padding: '16px 20px',
        borderBottom: '1px solid var(--border-subtle)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div className="gemini-bubble" style={{ width: '32px', height: '32px' }}>
            <Sparkles size={14} color="white" />
          </div>
          <div>
            <h3 style={{ fontSize: '0.9375rem', fontWeight: 700 }}>FairLens Copilot</h3>
            <p style={{ fontSize: '0.6875rem', color: 'var(--text-muted)' }}>Powered by Groq</p>
          </div>
        </div>
        <button
          className="btn btn-ghost btn-icon"
          onClick={onClose}
          id="close-copilot"
        >
          <X size={18} />
        </button>
      </div>

      {/* Messages */}
      <div style={{
        flex: 1,
        overflowY: 'auto',
        padding: '16px',
        display: 'flex',
        flexDirection: 'column',
        gap: '16px'
      }}>
        {messages.map((msg, i) => (
          <div
            key={i}
            style={{
              display: 'flex',
              gap: '10px',
              alignItems: 'flex-start',
              flexDirection: msg.role === 'user' ? 'row-reverse' : 'row'
            }}
          >
            <div style={{
              width: '28px',
              height: '28px',
              borderRadius: '50%',
              background: msg.role === 'user' ? 'var(--bg-elevated)' : 'var(--gradient-gemini)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0
            }}>
              {msg.role === 'user' ? <User size={14} /> : <Bot size={14} color="white" />}
            </div>
            <div style={{
              padding: '10px 14px',
              borderRadius: 'var(--radius-md)',
              background: msg.role === 'user' ? 'var(--bg-elevated)' : 'var(--bg-tertiary)',
              border: `1px solid ${msg.role === 'user' ? 'var(--border-default)' : 'var(--border-subtle)'}`,
              maxWidth: '85%',
              fontSize: '0.8125rem',
              lineHeight: 1.6,
              color: 'var(--text-primary)',
              whiteSpace: 'pre-wrap'
            }}>
              {msg.content}
              {msg.source === 'local-fallback' && (
                <div style={{ marginTop: '8px', fontSize: '0.6875rem', color: 'var(--accent-yellow)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <AlertTriangle size={10} />
                  Offline Mode: {
                    msg.errorType === 'rate-limit' ? 'Rate Limit Reached' : 
                    msg.errorType === 'model-overloaded' ? 'Model Overloaded (High Demand)' : 
                    msg.errorType === 'invalid-key' ? 'Invalid API Key' :
                    'Connect Error'
                  }
                </div>
              )}
            </div>
          </div>
        ))}
        {loading && (
          <div style={{ display: 'flex', gap: '10px', alignItems: 'flex-start' }}>
            <div className="gemini-bubble" style={{ width: '28px', height: '28px', flexShrink: 0 }}>
              <Bot size={14} color="white" />
            </div>
            <div style={{
              padding: '12px 16px',
              borderRadius: 'var(--radius-md)',
              background: 'var(--bg-tertiary)',
              border: '1px solid var(--border-subtle)'
            }}>
              <div className="bias-heartbeat" style={{ height: '20px' }}>
                <div className="bar" style={{ height: '100%' }} />
                <div className="bar" style={{ height: '100%' }} />
                <div className="bar" style={{ height: '100%' }} />
                <div className="bar" style={{ height: '100%' }} />
              </div>
            </div>
          </div>
        )}
        <div ref={chatEndRef} />
      </div>

      {/* Suggestions */}
      {messages.length <= 1 && (
        <div style={{ padding: '0 16px 12px', display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
          {SUGGESTED_PROMPTS.map(prompt => (
            <button
              key={prompt}
              onClick={() => sendMessage(prompt)}
              style={{
                padding: '5px 12px',
                borderRadius: '100px',
                border: '1px solid var(--border-default)',
                background: 'var(--bg-tertiary)',
                color: 'var(--text-secondary)',
                fontSize: '0.75rem',
                cursor: 'pointer',
                fontFamily: 'var(--font-sans)',
                transition: 'all var(--transition-fast)'
              }}
              onMouseEnter={e => {
                e.currentTarget.style.borderColor = 'var(--accent-blue)'
                e.currentTarget.style.color = 'var(--accent-blue)'
              }}
              onMouseLeave={e => {
                e.currentTarget.style.borderColor = 'var(--border-default)'
                e.currentTarget.style.color = 'var(--text-secondary)'
              }}
            >
              {prompt}
            </button>
          ))}
        </div>
      )}

      {/* Input */}
      <div style={{
        padding: '12px 16px',
        borderTop: '1px solid var(--border-subtle)',
        display: 'flex',
        gap: '8px'
      }}>
        <input
          ref={inputRef}
          className="input"
          placeholder="Ask about bias, fairness, or compliance..."
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          id="copilot-input"
          style={{ fontSize: '0.8125rem' }}
        />
        <button
          className="btn btn-primary btn-icon"
          onClick={() => sendMessage()}
          disabled={!input.trim() || loading}
          id="copilot-send"
        >
          <Send size={16} />
        </button>
      </div>
    </div>
  )
}

// ── Local Response Generator (fallback without API key) ──
function generateLocalResponse(question, data) {
  const q = question.toLowerCase()
  
  if (q.includes('disparate impact') || q.includes('di ratio')) {
    return `**Disparate Impact Ratio** measures the ratio of the positive outcome rate of the unprivileged group to the privileged group.\n\n**Formula:** DI = Rate(unprivileged) / Rate(privileged)\n\n**Threshold:** DI ≥ 0.8 (80%) passes the "4/5ths Rule" from EEOC guidelines.\n\n- **DI = 1.0**: Perfect parity\n- **DI < 0.8**: Potential adverse impact\n- **DI < 0.5**: Severe bias detected${data.analysisResults ? `\n\nYour current DI: ${(Object.values(data.analysisResults).find(Boolean)?.disparateImpact * 100 || 0).toFixed(1)}%` : ''}`
  }
  
  if (q.includes('4/5') || q.includes('four-fifths') || q.includes('four fifths')) {
    return `**The 4/5ths (80%) Rule** is from the EEOC Uniform Guidelines on Employee Selection Procedures.\n\n**Rule:** The selection rate for any protected group should be at least 80% (4/5ths) of the rate for the group with the highest selection rate.\n\n**Example:** If men are hired at 50%, women should be hired at ≥ 40% (50% × 0.8) to pass.\n\n⚠️ This is a rule of *thumb*, not a legal standard. Courts consider multiple factors.`
  }
  
  if (q.includes('remediat') || q.includes('fix') || q.includes('mitigat')) {
    return `**Common Bias Remediation Strategies:**\n\n**Pre-processing (data-level):**\n1. **Re-weighting**: Assign weights to balance outcome rates\n2. **Re-sampling**: Over/under-sample to achieve balance\n3. **Feature suppression**: Remove sensitive attributes & proxies\n\n**In-processing (model-level):**\n4. **Adversarial debiasing**: Train model to be accurate but unable to predict protected class\n5. **Fair constraints**: Add fairness constraints to optimization\n\n**Post-processing (decision-level):**\n6. **Threshold adjustment**: Apply group-specific decision thresholds\n7. **Reject-option classification**: Generate fair labels for borderline decisions\n\n💡 **Recommendation**: Start with re-weighting (least disruptive), then try threshold adjustment if needed.`
  }
  
  if (q.includes('compliance') || q.includes('legal') || q.includes('framework')) {
    return `**Key AI Fairness Compliance Frameworks:**\n\n🇺🇸 **EEOC / Title VII**: 4/5ths rule for employment decisions\n🇪🇺 **EU AI Act**: Requires transparency and bias documentation for high-risk AI\n🇺🇸 **CCPA/CPRA**: Data rights for California consumers\n🇺🇸 **ECOA**: Equal Credit Opportunity Act for lending\n🌐 **ISO/IEC 24027**: International standard for AI bias\n\n📋 FairLens helps you document compliance with automated audit reports.`
  }
  
  if (q.includes('metric') || q.includes('what') && q.includes('focus')) {
    return `**Key Fairness Metrics to Focus On:**\n\n1. **Disparate Impact Ratio (DI)**: Most widely used, tests 4/5ths rule\n2. **Statistical Parity Difference (SPD)**: Gap between group outcome rates\n3. **Equal Opportunity Difference**: Gap in true positive rates\n4. **Predictive Parity**: Gap in precision across groups\n5. **Calibration**: Whether predicted probabilities match actual outcomes\n\n⚠️ **Important**: No single metric captures all aspects of fairness. These metrics can conflict with each other (Chouldechova's theorem).${data.analysisResults ? '\n\n📊 Based on your current analysis, focus on **DI** and **SPD** first.' : ''}`
  }

  if (q.includes('gender') || q.includes('hiring') || q.includes('hr')) {
    return `**Addressing Gender Bias in Hiring Data:**\n\n1. **Audit**: Compare hiring/selection rates across genders\n2. **Identify proxies**: Check if features like "years_experience" or "education_level" correlate with gender\n3. **Re-weight**: Balance the dataset by assigning higher weights to underrepresented groups\n4. **Blind review**: Remove or mask gender-related features\n5. **Monitor continuously**: Set up alerts for metric drift\n\n📊 Use the **Measure** tab to see exact DI scores, then apply **Re-weighting** in the **Fix** tab.`
  }
  
  return `Thank you for your question about "${question}". Here's what I can help with:\n\n- **Bias Metrics**: DI ratio, statistical parity, equalized odds\n- **Remediation**: Re-weighting, re-sampling, threshold adjustment\n- **Compliance**: EEOC, EU AI Act, CCPA frameworks\n- **Interpretation**: Understanding your analysis results\n\nCould you please rephrase or ask about a specific topic?`
}
