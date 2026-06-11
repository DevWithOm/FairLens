import React, { createContext, useContext, useState, useCallback, useEffect, useRef } from 'react'

// ── Context ──
const ToastContext = createContext(null)

// ── Hook ──
export function useToast() {
  const ctx = useContext(ToastContext)
  if (!ctx) {
    // Fallback: return no-ops so components don't crash if used outside provider
    return {
      success: (m) => console.log('[toast.success]', m),
      error: (m) => console.error('[toast.error]', m),
      warning: (m) => console.warn('[toast.warning]', m),
      info: (m) => console.info('[toast.info]', m)
    }
  }
  return ctx
}

// ── Toast type config ──
const TOAST_CONFIG = {
  success: { bg: '#052e16', border: '#22c55e', icon: '✓' },
  error:   { bg: '#450a0a', border: '#ef4444', icon: '✗' },
  warning: { bg: '#422006', border: '#f59e0b', icon: '⚠' },
  info:    { bg: '#0c1a2e', border: '#60a5fa', icon: 'ℹ' }
}

// ── Single Toast Card ──
function ToastCard({ toast, onDismiss }) {
  const [exiting, setExiting] = useState(false)
  const [progress, setProgress] = useState(100)
  const timerRef = useRef(null)
  const startRef = useRef(Date.now())

  const config = TOAST_CONFIG[toast.type] || TOAST_CONFIG.info
  const duration = toast.duration || 4000

  useEffect(() => {
    // Progress bar animation
    const interval = setInterval(() => {
      const elapsed = Date.now() - startRef.current
      const remaining = Math.max(0, 100 - (elapsed / duration) * 100)
      setProgress(remaining)
      if (remaining <= 0) clearInterval(interval)
    }, 30)

    // Auto-dismiss
    timerRef.current = setTimeout(() => {
      setExiting(true)
      setTimeout(() => onDismiss(toast.id), 300)
    }, duration)

    return () => {
      clearInterval(interval)
      clearTimeout(timerRef.current)
    }
  }, [duration, toast.id, onDismiss])

  const handleDismiss = () => {
    clearTimeout(timerRef.current)
    setExiting(true)
    setTimeout(() => onDismiss(toast.id), 300)
  }

  return (
    <div
      style={{
        background: config.bg,
        borderLeft: `4px solid ${config.border}`,
        borderRadius: '8px',
        padding: '12px 16px',
        minWidth: '280px',
        maxWidth: '420px',
        backdropFilter: 'blur(4px)',
        opacity: exiting ? 0 : 0.95,
        transform: exiting ? 'translateX(40px) scale(0.95)' : 'translateX(0)',
        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        animation: 'toastSlideIn 0.35s cubic-bezier(0.22, 1, 0.36, 1)',
        position: 'relative',
        overflow: 'hidden',
        cursor: 'pointer',
        boxShadow: '0 4px 20px rgba(0,0,0,0.4)'
      }}
      onClick={handleDismiss}
    >
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
        {/* Icon */}
        <span style={{
          fontSize: '16px',
          lineHeight: 1,
          color: config.border,
          fontWeight: 700,
          flexShrink: 0,
          marginTop: '1px'
        }}>
          {config.icon}
        </span>

        {/* Message */}
        <p style={{
          fontSize: '14px',
          color: '#fff',
          margin: 0,
          lineHeight: 1.5,
          wordBreak: 'break-word',
          flex: 1
        }}>
          {toast.message}
        </p>

        {/* Close X */}
        <button
          onClick={(e) => { e.stopPropagation(); handleDismiss() }}
          style={{
            background: 'none',
            border: 'none',
            color: 'rgba(255,255,255,0.4)',
            cursor: 'pointer',
            fontSize: '14px',
            padding: 0,
            lineHeight: 1,
            flexShrink: 0
          }}
          aria-label="Dismiss"
        >
          ×
        </button>
      </div>

      {/* Progress bar */}
      <div style={{
        position: 'absolute',
        bottom: 0,
        left: 0,
        height: '2px',
        width: `${progress}%`,
        background: config.border,
        transition: 'width 0.1s linear',
        borderRadius: '0 0 0 8px'
      }} />
    </div>
  )
}

// ── Toast Container ──
function ToastContainer({ toasts, removeToast }) {
  if (toasts.length === 0) return null

  return (
    <div style={{
      position: 'fixed',
      top: '20px',
      right: '20px',
      zIndex: 9999,
      display: 'flex',
      flexDirection: 'column',
      gap: '8px',
      pointerEvents: 'none'
    }}>
      <style>{`
        @keyframes toastSlideIn {
          from {
            opacity: 0;
            transform: translateX(80px) scale(0.9);
          }
          to {
            opacity: 0.95;
            transform: translateX(0) scale(1);
          }
        }
      `}</style>
      {toasts.map(t => (
        <div key={t.id} style={{ pointerEvents: 'auto' }}>
          <ToastCard toast={t} onDismiss={removeToast} />
        </div>
      ))}
    </div>
  )
}

// ── Provider ──
let toastIdCounter = 0

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([])

  const removeToast = useCallback((id) => {
    setToasts(prev => prev.filter(t => t.id !== id))
  }, [])

  const addToast = useCallback((type, message, duration = 4000) => {
    const id = ++toastIdCounter
    setToasts(prev => [{ id, type, message, duration }, ...prev].slice(0, 6))
  }, [])

  const toast = {
    success: useCallback((msg, dur) => addToast('success', msg, dur), [addToast]),
    error: useCallback((msg, dur) => addToast('error', msg, dur || 6000), [addToast]),
    warning: useCallback((msg, dur) => addToast('warning', msg, dur || 5000), [addToast]),
    info: useCallback((msg, dur) => addToast('info', msg, dur), [addToast])
  }

  return (
    <ToastContext.Provider value={toast}>
      {children}
      <ToastContainer toasts={toasts} removeToast={removeToast} />
    </ToastContext.Provider>
  )
}
