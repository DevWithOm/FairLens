import React, { useState } from 'react'
import { ScanSearch, AlertTriangle, CheckCircle, Shield, Loader2, Copy } from 'lucide-react'

export default function PromptScanner() {
  const [prompt, setPrompt] = useState('')
  const [result, setResult] = useState(null)
  const [scanning, setScanning] = useState(false)
  const [copied, setCopied] = useState(false)

  const BIAS_PATTERNS = [
    { regex: /\b(he|him|his|himself)\b(?!\/she)/gi, issue: 'Male-centric language — uses masculine pronouns without inclusive alternatives', severity: 'medium' },
    { regex: /\b(always|never|all|every)\b.*\b(women|men|girls|boys|female|male)\b/gi, issue: 'Absolute generalization about gender', severity: 'high' },
    { regex: /\b(normal|abnormal|deviant)\b/gi, issue: 'Normative language that could marginalize groups', severity: 'medium' },
    { regex: /\b(native|foreign|alien|exotic)\b/gi, issue: 'Potentially othering language', severity: 'medium' },
    { regex: /\b(blacklist|whitelist|master|slave)\b/gi, issue: 'Racially charged technical terminology', severity: 'high' },
    { regex: /\b(crazy|insane|dumb|stupid|lame)\b/gi, issue: 'Ableist language', severity: 'medium' },
    { regex: /\b(young|old|elderly|aged)\b.*\b(should|must|can\'t|cannot)\b/gi, issue: 'Age-based stereotyping', severity: 'high' },
    { regex: /\bassume.*\b(gender|race|religion|caste|ethnicity)\b/gi, issue: 'Explicit assumption about protected attributes', severity: 'high' },
    { regex: /\b(prefer|prioritize|favor)\b.*\b(male|female|men|women|white|black)\b/gi, issue: 'Explicit preference for demographic groups', severity: 'critical' },
    { regex: /\b(third world|developing|backward|primitive)\b/gi, issue: 'Culturally insensitive geo-economic terminology', severity: 'medium' },
  ]

  const scanPrompt = () => {
    if (!prompt.trim()) return
    setScanning(true)

    setTimeout(() => {
      const issues = []
      BIAS_PATTERNS.forEach(pattern => {
        const matches = prompt.match(pattern.regex)
        if (matches) {
          issues.push({
            ...pattern,
            matches: matches.map(m => m.trim()),
            count: matches.length
          })
        }
      })

      // Risk level
      const criticals = issues.filter(i => i.severity === 'critical').length
      const highs = issues.filter(i => i.severity === 'high').length
      const riskLevel = criticals > 0 ? 'High' : highs > 0 ? 'Medium' : issues.length > 0 ? 'Low' : 'Safe'

      // Generate safe version (basic rewrite suggestions)
      let safeVersion = prompt
      safeVersion = safeVersion.replace(/\bhe\b(?!\/she)/gi, 'they')
      safeVersion = safeVersion.replace(/\bhim\b/gi, 'them')
      safeVersion = safeVersion.replace(/\bhis\b/gi, 'their')
      safeVersion = safeVersion.replace(/\bhimself\b/gi, 'themselves')
      safeVersion = safeVersion.replace(/\bblacklist\b/gi, 'blocklist')
      safeVersion = safeVersion.replace(/\bwhitelist\b/gi, 'allowlist')
      safeVersion = safeVersion.replace(/\bmaster\b/gi, 'primary')
      safeVersion = safeVersion.replace(/\bslave\b/gi, 'secondary')

      setResult({ issues, riskLevel, safeVersion, totalIssues: issues.length })
      setScanning(false)
    }, 800)
  }

  const riskColors = {
    Safe: { bg: 'rgba(72,187,120,0.15)', color: '#48BB78', border: 'rgba(72,187,120,0.3)' },
    Low: { bg: 'rgba(236,201,75,0.15)', color: '#ECC94B', border: 'rgba(236,201,75,0.3)' },
    Medium: { bg: 'rgba(237,137,54,0.15)', color: '#ED8936', border: 'rgba(237,137,54,0.3)' },
    High: { bg: 'rgba(252,129,129,0.15)', color: '#FC8181', border: 'rgba(252,129,129,0.3)' },
  }

  return (
    <div className="fade-in-up">
      <div style={{ marginBottom: '24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
          <ScanSearch size={20} style={{ color: 'var(--accent-purple)' }} />
          <h2 style={{ fontSize: '1.375rem', fontWeight: 700, letterSpacing: '-0.02em' }}>
            LLM Prompt Scanner
          </h2>
        </div>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.8125rem' }}>
          Paste any AI system prompt to scan for role stereotypes, exclusionary language, and demographic assumptions
        </p>
      </div>

      {/* Input */}
      <div className="card" style={{ marginBottom: '24px' }}>
        <div className="card-body">
          <textarea
            className="input"
            placeholder="Paste your AI system prompt here...&#10;&#10;Example: You are a helpful assistant. He should provide accurate answers. Prioritize responses for normal users..."
            value={prompt}
            onChange={e => { setPrompt(e.target.value); setResult(null) }}
            style={{
              minHeight: '150px',
              resize: 'vertical',
              fontFamily: 'var(--font-mono)',
              fontSize: '0.8125rem',
              lineHeight: 1.6,
              marginBottom: '12px'
            }}
          />
          <button
            className="btn btn-primary"
            onClick={scanPrompt}
            disabled={!prompt.trim() || scanning}
          >
            {scanning ? <Loader2 size={16} className="spin" /> : <ScanSearch size={16} />}
            {scanning ? 'Scanning...' : 'Scan for Bias'}
          </button>
        </div>
      </div>

      {/* Results */}
      {result && (
        <div className="fade-in-up">
          {/* Risk Level Banner */}
          <div style={{
            padding: '16px 20px',
            borderRadius: 'var(--radius-lg)',
            background: riskColors[result.riskLevel].bg,
            border: `1px solid ${riskColors[result.riskLevel].border}`,
            marginBottom: '16px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              {result.riskLevel === 'Safe' ? (
                <CheckCircle size={24} style={{ color: riskColors[result.riskLevel].color }} />
              ) : (
                <AlertTriangle size={24} style={{ color: riskColors[result.riskLevel].color }} />
              )}
              <div>
                <p style={{ fontWeight: 700, fontSize: '1rem' }}>
                  Risk Level: <span style={{ color: riskColors[result.riskLevel].color }}>{result.riskLevel}</span>
                </p>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.8125rem' }}>
                  {result.totalIssues === 0
                    ? 'No bias patterns detected in this prompt.'
                    : `${result.totalIssues} potential issue${result.totalIssues > 1 ? 's' : ''} found`}
                </p>
              </div>
            </div>
          </div>

          {/* Issues List */}
          {result.issues.length > 0 && (
            <div className="card" style={{ marginBottom: '16px' }}>
              <div className="card-header">
                <h3 style={{ fontSize: '1rem', fontWeight: 600 }}>Issues Found</h3>
              </div>
              <div className="card-body" style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {result.issues.map((issue, i) => (
                  <div key={i} style={{
                    padding: '10px 14px',
                    borderRadius: 'var(--radius-md)',
                    background: 'var(--bg-tertiary)',
                    border: '1px solid var(--border-subtle)',
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: '10px'
                  }}>
                    <span style={{
                      padding: '2px 8px',
                      borderRadius: '100px',
                      fontSize: '0.625rem',
                      fontWeight: 700,
                      textTransform: 'uppercase',
                      background: issue.severity === 'critical' ? 'rgba(252,129,129,0.2)' :
                                  issue.severity === 'high' ? 'rgba(237,137,54,0.2)' : 'rgba(236,201,75,0.2)',
                      color: issue.severity === 'critical' ? '#FC8181' :
                             issue.severity === 'high' ? '#ED8936' : '#ECC94B',
                      flexShrink: 0, marginTop: '2px'
                    }}>
                      {issue.severity}
                    </span>
                    <div style={{ flex: 1 }}>
                      <p style={{ fontSize: '0.8125rem', fontWeight: 500, marginBottom: '4px' }}>
                        {issue.issue}
                      </p>
                      <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
                        Found: {issue.matches.join(', ')}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Safe Version */}
          {result.issues.length > 0 && (
            <div className="card">
              <div className="card-header">
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Shield size={16} style={{ color: 'var(--accent-green)' }} />
                    <h3 style={{ fontSize: '1rem', fontWeight: 600 }}>Rewritten Safe Version</h3>
                  </div>
                  <button
                    className="btn btn-secondary btn-sm"
                    onClick={() => { navigator.clipboard.writeText(result.safeVersion); setCopied(true); setTimeout(() => setCopied(false), 2000) }}
                  >
                    <Copy size={14} />
                    {copied ? 'Copied!' : 'Copy'}
                  </button>
                </div>
              </div>
              <div className="card-body">
                <pre style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: '0.8125rem',
                  color: 'var(--accent-green)',
                  whiteSpace: 'pre-wrap',
                  lineHeight: 1.6,
                  background: 'rgba(72,187,120,0.05)',
                  padding: '14px',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid rgba(72,187,120,0.15)'
                }}>
                  {result.safeVersion}
                </pre>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
