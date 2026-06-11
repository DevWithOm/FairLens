import React, { Component } from 'react'

class ErrorBoundary extends Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false, error: null, errorInfo: null }
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error }
  }

  componentDidCatch(error, errorInfo) {
    this.setState({ error, errorInfo })
    console.error('[FairLens ErrorBoundary]', error, errorInfo)
  }

  render() {
    if (this.state.hasError) {
      return <FallbackUI error={this.state.error} />
    }
    return this.props.children
  }
}

function FallbackUI({ error }) {
  const truncatedMessage = error?.message
    ? error.message.length > 120
      ? error.message.slice(0, 120) + '…'
      : error.message
    : 'An unexpected error occurred.'

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: '#0B0F19',
      fontFamily: 'system-ui, -apple-system, "Segoe UI", Roboto, sans-serif',
      color: '#e2e8f0',
      zIndex: 99999
    }}>
      <div style={{
        textAlign: 'center',
        maxWidth: '480px',
        padding: '40px 32px'
      }}>
        {/* Warning Icon */}
        <div style={{
          width: '80px',
          height: '80px',
          borderRadius: '50%',
          background: 'rgba(239,68,68,0.12)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          margin: '0 auto 24px'
        }}>
          <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
            <line x1="12" y1="9" x2="12" y2="13" />
            <line x1="12" y1="17" x2="12.01" y2="17" />
          </svg>
        </div>

        {/* Title */}
        <h1 style={{
          fontSize: '24px',
          fontWeight: 700,
          marginBottom: '12px',
          color: '#f1f5f9'
        }}>
          Something went wrong
        </h1>

        {/* Error message */}
        <p style={{
          fontSize: '14px',
          color: '#94a3b8',
          lineHeight: 1.6,
          marginBottom: '32px',
          fontFamily: 'monospace',
          background: 'rgba(239,68,68,0.08)',
          border: '1px solid rgba(239,68,68,0.2)',
          borderRadius: '8px',
          padding: '12px 16px',
          wordBreak: 'break-word'
        }}>
          {truncatedMessage}
        </p>

        {/* Buttons */}
        <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', marginBottom: '32px' }}>
          <button
            onClick={() => window.location.reload()}
            style={{
              padding: '10px 24px',
              borderRadius: '8px',
              border: 'none',
              background: '#a3e635',
              color: '#000',
              fontWeight: 700,
              fontSize: '14px',
              cursor: 'pointer',
              fontFamily: 'inherit'
            }}
          >
            Try Again
          </button>
          <button
            onClick={() => { window.location.href = '/' }}
            style={{
              padding: '10px 24px',
              borderRadius: '8px',
              border: '1px solid rgba(255,255,255,0.15)',
              background: 'rgba(255,255,255,0.06)',
              color: '#e2e8f0',
              fontWeight: 600,
              fontSize: '14px',
              cursor: 'pointer',
              fontFamily: 'inherit'
            }}
          >
            Go to Home
          </button>
        </div>

        {/* Helper text */}
        <p style={{
          fontSize: '12px',
          color: '#64748b',
          lineHeight: 1.5,
          marginBottom: '40px'
        }}>
          Error details have been logged. If this persists, clear your browser cache.
        </p>

        {/* Footer */}
        <p style={{
          fontSize: '11px',
          color: '#475569',
          letterSpacing: '0.04em'
        }}>
          FairLens · Google Solution Challenge 2026
        </p>
      </div>
    </div>
  )
}

export default ErrorBoundary
