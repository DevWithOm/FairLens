import React from 'react'
import { useData } from '../../lib/DataContext'
import {
  Search, Eye, BarChart3, Wrench, FileText,
  Database, ChevronRight, Sparkles, Shield, Aperture
} from 'lucide-react'
import { FairLensLogo } from '../common/FairLensLogo'
const navItems = [
  { id: 'inspect', label: 'Inspect', icon: Eye, desc: 'Load & explore data' },
  { id: 'measure', label: 'Measure', icon: BarChart3, desc: 'Bias metrics & charts' },
  { id: 'fix', label: 'Fix', icon: Wrench, desc: 'Remediate bias' },
  { id: 'report', label: 'Report', icon: FileText, desc: 'Export audit reports' }
]

export default function Sidebar({ activeTab, onTabChange, isOpen, datasetName, onLogoClick }) {
  const { t } = useData()
  return (
    <aside className={`app-sidebar ${isOpen ? 'open' : 'closed'}`}>
      {/* Logo */}
      <div 
        onClick={onLogoClick}
        style={{
          padding: '20px 20px 16px',
          borderBottom: '1px solid var(--border-subtle)',
          cursor: 'pointer',
          transition: 'background 0.2s'
        }}
        onMouseEnter={(e) => e.currentTarget.style.background = 'var(--bg-hover)'}
        onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
        title={t('Return to Landing View')}
      >
        <FairLensLogo />
      </div>

      {/* Navigation */}
      <nav style={{ flex: 1, padding: '12px' }}>
        <p style={{
          fontSize: '0.6875rem',
          fontWeight: 600,
          color: 'var(--text-muted)',
          textTransform: 'uppercase',
          letterSpacing: '0.08em',
          padding: '8px 12px 8px',
          marginBottom: '4px'
        }}>{t('Workflow')}</p>
        {navItems.map((item, i) => {
          const Icon = item.icon
          const isActive = activeTab === item.id
          return (
            <button
              key={item.id}
              id={`nav-${item.id}`}
              onClick={() => onTabChange(item.id)}
              style={{
                width: '100%',
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                padding: '10px 12px',
                borderRadius: 'var(--radius-md)',
                border: 'none',
                cursor: 'pointer',
                fontFamily: 'var(--font-sans)',
                fontSize: '0.875rem',
                fontWeight: isActive ? 600 : 500,
                color: isActive ? 'var(--text-primary)' : 'var(--text-secondary)',
                background: isActive ? 'var(--bg-elevated)' : 'transparent',
                transition: 'all var(--transition-fast)',
                marginBottom: '2px',
                position: 'relative',
                textAlign: 'left'
              }}
              onMouseEnter={e => {
                if (!isActive) {
                  e.currentTarget.style.background = 'var(--bg-hover)'
                  e.currentTarget.style.color = 'var(--text-primary)'
                }
              }}
              onMouseLeave={e => {
                if (!isActive) {
                  e.currentTarget.style.background = 'transparent'
                  e.currentTarget.style.color = 'var(--text-secondary)'
                }
              }}
            >
              {isActive && (
                <div style={{
                  position: 'absolute',
                  left: 0,
                  top: '50%',
                  transform: 'translateY(-50%)',
                  width: '3px',
                  height: '20px',
                  borderRadius: '0 4px 4px 0',
                  background: 'var(--gradient-primary)'
                }} />
              )}
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: '20px'
              }}>
                <span style={{
                  fontSize: '0.6875rem',
                  fontWeight: 700,
                  fontFamily: 'var(--font-mono)',
                  color: isActive ? 'var(--accent-blue)' : 'var(--text-muted)',
                  minWidth: '16px'
                }}>{String(i + 1).padStart(2, '0')}</span>
              </div>
              <Icon size={18} />
              <div style={{ flex: 1 }}>
                <div>{t(item.label)}</div>
                <div style={{
                  fontSize: '0.6875rem',
                  color: 'var(--text-muted)',
                  fontWeight: 400
                }}>{t(item.desc)}</div>
              </div>
              {isActive && <ChevronRight size={14} style={{ color: 'var(--text-muted)' }} />}
            </button>
          )
        })}
      </nav>

      {/* Dataset Status */}
      <div style={{
        padding: '16px',
        borderTop: '1px solid var(--border-subtle)'
      }}>
        <div style={{
          padding: '12px 14px',
          borderRadius: 'var(--radius-md)',
          background: 'var(--bg-tertiary)',
          border: '1px solid var(--border-subtle)'
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            marginBottom: '6px'
          }}>
            <Database size={14} style={{ color: 'var(--accent-teal)' }} />
            <span style={{
              fontSize: '0.75rem',
              fontWeight: 600,
              color: 'var(--text-secondary)'
            }}>{t('Dataset')}</span>
          </div>
          <p style={{
            fontSize: '0.8125rem',
            fontWeight: 500,
            color: datasetName ? 'var(--text-primary)' : 'var(--text-muted)',
            fontFamily: datasetName ? 'var(--font-mono)' : 'var(--font-sans)'
          }}>
            {datasetName || t('No dataset loaded')}
          </p>
        </div>
      </div>
    </aside>
  )
}
