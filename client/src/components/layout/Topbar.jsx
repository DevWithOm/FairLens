import React from 'react'
import { Menu, Sparkles, Bell, Globe } from 'lucide-react'
import { useData } from '../../lib/DataContext'

export default function Topbar({ onToggleSidebar, onToggleCopilot, copilotOpen, datasetName, language, setLanguage }) {
  const { t } = useData()
  return (
    <header className="app-topbar">
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
        <button
          className="btn btn-ghost btn-icon"
          onClick={onToggleSidebar}
          id="toggle-sidebar"
          aria-label={t("Toggle sidebar")}
        >
          <Menu size={20} />
        </button>
        
        {datasetName && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div className="bias-heartbeat">
              <div className="bar" style={{ height: '100%' }} />
              <div className="bar" style={{ height: '100%' }} />
              <div className="bar" style={{ height: '100%' }} />
              <div className="bar" style={{ height: '100%' }} />
              <div className="bar" style={{ height: '100%' }} />
              <div className="bar" style={{ height: '100%' }} />
            </div>
            <span style={{
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

      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        {/* Hindi Language Toggle */}
        <button
          onClick={() => setLanguage && setLanguage(l => l === 'english' ? 'hindi' : 'english')}
          id="toggle-language"
          aria-label="Toggle language"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            padding: '6px 14px',
            borderRadius: 'var(--radius-md)',
            border: `1px solid ${language === 'hindi' ? 'rgba(237,137,54,0.4)' : 'var(--border-default)'}`,
            background: language === 'hindi' ? 'rgba(237,137,54,0.1)' : 'var(--bg-elevated)',
            color: language === 'hindi' ? 'var(--accent-orange)' : 'var(--text-secondary)',
            cursor: 'pointer',
            fontFamily: 'var(--font-sans)',
            fontSize: '0.8125rem',
            fontWeight: 600,
            transition: 'all var(--transition-fast)'
          }}
        >
          <Globe size={14} />
          {language === 'english' ? 'हिंदी' : 'English'}
        </button>

        <button
          className="btn btn-ghost btn-icon"
          id="toggle-notifications"
          aria-label="Notifications"
        >
          <Bell size={18} />
        </button>

        <button
          id="toggle-copilot"
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
          <span>{t('Copilot')}</span>
        </button>
      </div>
    </header>
  )
}
