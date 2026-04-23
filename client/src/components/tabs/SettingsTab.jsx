import React, { useState } from 'react'
import {
  Settings, Key, Cpu, Eye, EyeOff, Save, RefreshCw, Layers
} from 'lucide-react'

export default function SettingsTab() {
  const [showKey, setShowKey] = useState(false)
  const [apiKey, setApiKey] = useState('sk-proj-xxxxxxxxxxxxxxxxxxxxxxxxxxxx')
  const [temp, setTemp] = useState(0.7)
  const [topK, setTopK] = useState(40)
  
  const [saving, setSaving] = useState(false)

  const handleSave = () => {
    setSaving(true)
    setTimeout(() => setSaving(false), 800)
  }

  return (
    <div className="fade-in-up">
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
            <Settings size={20} style={{ color: 'var(--accent-purple)' }} />
            <h2 style={{ fontSize: '1.5rem', fontWeight: 700, fontFamily: 'var(--font-heading)' }}>
              ML Engine V2
            </h2>
          </div>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>
            Configure model parameters and system preferences.
          </p>
        </div>
        <button 
          className="btn btn-primary" 
          onClick={handleSave} 
          disabled={saving}
          style={{ width: '140px' }}
        >
          {saving ? <RefreshCw size={16} className="spin" /> : <Save size={16} />}
          {saving ? 'Saving...' : 'Save Changes'}
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: '24px' }}>
        {/* Main Settings Area */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          
          {/* Model Configuration */}
          <div className="card">
            <div className="card-header" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Layers size={18} style={{ color: 'var(--accent-blue)' }} />
              <h3 style={{ fontSize: '1rem', fontWeight: 600 }}>Model Configuration</h3>
            </div>
            <div className="card-body">
              <div style={{ marginBottom: '24px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                  <label style={{ fontSize: '0.875rem', fontWeight: 500 }}>Temperature</label>
                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.8125rem', color: 'var(--accent-blue)' }}>{temp}</span>
                </div>
                <input 
                  type="range" 
                  min="0" max="2" step="0.1" 
                  value={temp} 
                  onChange={e => setTemp(parseFloat(e.target.value))} 
                />
                <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '8px' }}>
                  Controls randomness: Lowering results in less random completions.
                </p>
              </div>

              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                  <label style={{ fontSize: '0.875rem', fontWeight: 500 }}>Top-K</label>
                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.8125rem', color: 'var(--accent-blue)' }}>{topK}</span>
                </div>
                <input 
                  type="range" 
                  min="1" max="100" step="1" 
                  value={topK} 
                  onChange={e => setTopK(parseInt(e.target.value))} 
                />
                <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '8px' }}>
                  Limits vocabulary to the top K tokens at each step.
                </p>
              </div>
            </div>
          </div>

          {/* API Configuration */}
          <div className="card">
            <div className="card-header" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Key size={18} style={{ color: 'var(--accent-yellow)' }} />
              <h3 style={{ fontSize: '1rem', fontWeight: 600 }}>API Access</h3>
            </div>
            <div className="card-body">
              <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, marginBottom: '8px' }}>
                Provider Key
              </label>
              <div style={{ position: 'relative' }}>
                <input 
                  type={showKey ? "text" : "password"} 
                  className="input" 
                  value={apiKey}
                  onChange={e => setApiKey(e.target.value)}
                  style={{ paddingRight: '40px', fontFamily: 'var(--font-mono)' }}
                />
                <button 
                  onClick={() => setShowKey(!showKey)}
                  style={{ 
                    position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)',
                    background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer'
                  }}
                >
                  {showKey ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar Preferences */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          <div className="card">
            <div className="card-header">
              <h3 style={{ fontSize: '1rem', fontWeight: 600 }}>System Status</h3>
            </div>
            <div className="card-body" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>Status</span>
                <span className="badge badge-green">Online</span>
              </div>
              
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>Version</span>
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.8125rem' }}>v2.4.1-obsidian</span>
              </div>
              
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>Latency</span>
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.8125rem', color: 'var(--accent-teal)' }}>24ms</span>
              </div>

              <div style={{ marginTop: '16px', paddingTop: '16px', borderTop: '1px solid var(--border-subtle)' }}>
                <button className="btn btn-secondary" style={{ width: '100%', justifyContent: 'center' }}>
                  <Cpu size={16} /> Run Diagnostics
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
