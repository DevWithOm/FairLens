import React, { useState } from 'react'
import { createPortal } from 'react-dom'
import { Menu, Sparkles, Bell, Globe, X, Eye, BarChart3, Wrench, FileText, Activity } from 'lucide-react'
import { useData } from '../../lib/DataContext'
import DemoMode from '../common/DemoMode'

const mobileNavItems = [
  { id: 'inspect',  label: 'Inspect',  icon: Eye },
  { id: 'measure',  label: 'Measure',  icon: BarChart3 },
  { id: 'monitor',  label: 'Monitor',  icon: Activity },
  { id: 'fix',      label: 'Fix',      icon: Wrench },
  { id: 'report',   label: 'Report',   icon: FileText }
]

export default function Topbar({ onToggleSidebar, onToggleCopilot, copilotOpen, datasetName, language, setLanguage, setActiveTab, activeTab }) {
  const { t } = useData()
  const [isDrawerOpen, setIsDrawerOpen] = useState(false)

  const handleDrawerNav = (tabId) => {
    setActiveTab(tabId)
    setIsDrawerOpen(false)
  }

  return (
    <>
      <header className="app-topbar">

        {/* ── Left side ── */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>

          {/* Desktop toggle (hidden on mobile by CSS) */}
          <button
            id="toggle-sidebar"
            className="btn btn-ghost btn-icon"
            onClick={onToggleSidebar}
            aria-label={t('Toggle sidebar')}
          >
            <Menu size={20} />
          </button>

          {/* Mobile hamburger (hidden on desktop by CSS) */}
          <button
            className="mobile-hamburger btn btn-ghost btn-icon"
            onClick={() => setIsDrawerOpen(true)}
            aria-label="Open menu"
          >
            <Menu size={20} />
          </button>

          {/* Dataset heartbeat — hidden on mobile by CSS */}
          {datasetName && (
            <div className="topbar-dataset-info" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div className="bias-heartbeat">
                <div className="bar" style={{ height: '100%' }} />
                <div className="bar" style={{ height: '100%' }} />
                <div className="bar" style={{ height: '100%' }} />
                <div className="bar" style={{ height: '100%' }} />
                <div className="bar" style={{ height: '100%' }} />
                <div className="bar" style={{ height: '100%' }} />
              </div>
              <span className="topbar-dataset-name" style={{
                fontSize: '0.875rem',
                fontWeight: 600,
                color: 'var(--text-primary)',
                fontFamily: 'var(--font-mono)'
              }}>
                {datasetName}
              </span>
            </div>
          )}
        </div>

        {/* ── Right side ── */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>

          <DemoMode setActiveTab={setActiveTab} />

          {/* Language toggle */}
          <div
            id="toggle-language"
            className="topbar-lang-container"
            style={{
              display: 'flex',
              flexDirection: 'row',
              gap: 0,
              border: '1px solid var(--color-border)',
              borderRadius: '8px',
              overflow: 'hidden'
            }}
          >
            <button
              onClick={() => setLanguage && setLanguage('en')}
              style={{
                padding: '6px 12px',
                fontSize: '12px',
                fontWeight: 600,
                border: 'none',
                cursor: 'pointer',
                background: language === 'en' ? 'var(--color-lime, #a3e635)' : 'transparent',
                color: language === 'en' ? '#000' : 'var(--text-muted)',
                transition: 'all 0.2s'
              }}
            >
              EN
            </button>
            <button
              onClick={() => setLanguage && setLanguage('hi')}
              style={{
                padding: '6px 12px',
                fontSize: '12px',
                fontWeight: 600,
                border: 'none',
                borderLeft: '1px solid var(--color-border)',
                cursor: 'pointer',
                background: language === 'hi' ? 'var(--color-lime, #a3e635)' : 'transparent',
                color: language === 'hi' ? '#000' : 'var(--text-muted)',
                transition: 'all 0.2s',
                fontFamily: 'system-ui, -apple-system, sans-serif' // Good for Devanagari
              }}
            >
              हिंदी
            </button>
          </div>

          {/* Notifications */}
          <button
            className="btn btn-ghost btn-icon topbar-bell-btn"
            id="toggle-notifications"
            aria-label="Notifications"
          >
            <Bell size={18} />
          </button>

          {/* AI Copilot */}
          <button
            id="toggle-copilot"
            className="topbar-copilot-btn"
            onClick={onToggleCopilot}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              padding: '8px 16px',
              borderRadius: 'var(--radius-md)',
              border: copilotOpen ? '1px solid rgba(102,126,234,0.4)' : '1px solid var(--border-default)',
              background: copilotOpen ? 'rgba(102,126,234,0.1)' : 'var(--bg-elevated)',
              color: copilotOpen ? '#a78bfa' : 'var(--text-secondary)',
              cursor: 'pointer',
              fontFamily: 'var(--font-sans)',
              fontSize: '0.8125rem',
              fontWeight: 500,
              transition: 'all var(--transition-fast)'
            }}
          >
            <div className="gemini-bubble" style={{ width: '22px', height: '22px' }}>
              <Sparkles size={12} color="white" />
            </div>
            <span className="topbar-copilot-label">{t('Copilot')}</span>
          </button>
        </div>
      </header>

      {/* ── Mobile drawer (portal) ── */}
      {isDrawerOpen && createPortal(
        <>
          {/* Backdrop */}
          <div
            className="mobile-drawer-backdrop"
            onClick={() => setIsDrawerOpen(false)}
          />

          {/* Drawer panel */}
          <div className="mobile-drawer">

            {/* Header */}
            <div style={{
              padding: '16px 20px',
              borderBottom: '1px solid var(--border-subtle)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{
                  width: '32px', height: '32px', borderRadius: '10px',
                  background: 'var(--gradient-primary)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center'
                }}>
                  <Eye size={16} style={{ color: 'var(--text-primary)' }} />
                </div>
                <div>
                  <p style={{ fontWeight: 700, fontSize: '0.9375rem', color: 'var(--text-primary)' }}>FairLens</p>
                  <p style={{ fontSize: '0.625rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>WEB APP</p>
                </div>
              </div>
              <button
                className="btn btn-ghost btn-icon"
                onClick={() => setIsDrawerOpen(false)}
                aria-label="Close menu"
              >
                <X size={18} />
              </button>
            </div>

            {/* Nav items */}
            <nav style={{ flex: 1, padding: '12px', display: 'flex', flexDirection: 'column', gap: '2px' }}>
              <p style={{
                fontSize: '0.625rem', fontWeight: 600,
                color: 'var(--text-muted)', textTransform: 'uppercase',
                letterSpacing: '0.1em', padding: '8px 12px', marginBottom: '4px'
              }}>{t('Navigation')}</p>

              {mobileNavItems.map(item => {
                const Icon = item.icon
                const isActive = activeTab === item.id
                return (
                  <button
                    key={item.id}
                    onClick={() => handleDrawerNav(item.id)}
                    style={{
                      width: '100%',
                      display: 'flex', alignItems: 'center', gap: '12px',
                      padding: '12px 14px',
                      borderRadius: 'var(--radius-md)',
                      border: 'none', cursor: 'pointer',
                      fontFamily: 'var(--font-sans)', fontSize: '0.875rem',
                      fontWeight: isActive ? 600 : 500,
                      color: isActive ? 'var(--text-primary)' : 'var(--text-secondary)',
                      background: isActive ? 'var(--bg-elevated)' : 'transparent',
                      transition: 'all 0.15s ease', textAlign: 'left'
                    }}
                  >
                    <Icon size={18} />
                    <span>{t(item.label)}</span>
                  </button>
                )
              })}
            </nav>

            {/* Dataset status */}
            {datasetName && (
              <div style={{ padding: '12px 16px', borderTop: '1px solid var(--border-subtle)' }}>
                <div style={{
                  padding: '10px 12px', borderRadius: 'var(--radius-md)',
                  background: 'var(--bg-tertiary)', border: '1px solid var(--border-subtle)',
                  fontSize: '0.75rem', color: 'var(--text-secondary)'
                }}>
                  📊 {datasetName}
                </div>
              </div>
            )}
          </div>
        </>,
        document.body
      )}
    </>
  )
}
