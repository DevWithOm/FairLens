import React, { useState, useCallback } from 'react'
import { DataContext } from './lib/DataContext'
import Sidebar from './components/layout/Sidebar'
import Topbar from './components/layout/Topbar'
import InspectTab from './components/tabs/InspectTab'
import MeasureTab from './components/tabs/MeasureTab'
import ReportTab from './components/tabs/ReportTab'
import FixTab from './components/tabs/FixTab'
import LandingTab from './components/tabs/LandingTab'
import BiasMonitor from './components/monitor/BiasMonitor'
import CopilotPanel from './components/copilot/CopilotPanel'
import AuditView from './pages/AuditView'
import { translate } from './lib/i18n'

// ── Data context is now imported from ./lib/DataContext ──

const initialHistory = Array.from({ length: 12 }).map((_, i) => {
  const sessionNum = 12 - i;
  let disparateImpact, statisticalParity;
  if (sessionNum <= 8) {
    disparateImpact = 0.75 - (sessionNum * 0.025);
    statisticalParity = -0.10 - (sessionNum * 0.015);
  } else {
    disparateImpact = 0.88 + ((sessionNum - 9) * 0.005);
    statisticalParity = -0.05 + ((sessionNum - 9) * 0.005);
  }
  const status = disparateImpact >= 0.80 ? 'Compliant' : disparateImpact >= 0.70 ? 'At Risk' : 'Critical';
  return {
    session: `Session ${sessionNum}`,
    dataset: sessionNum <= 8 ? 'hiring_bias_v1.csv' : 'hiring_bias_v2.csv',
    di: Number(disparateImpact.toFixed(2)),
    spd: Number(statisticalParity.toFixed(2)),
    status: status,
    timestamp: sessionNum === 12 ? '2 hours ago' : sessionNum === 11 ? '5 hours ago' : `${12 - sessionNum} days ago`,
    timeLabel: `Jan ${10 + sessionNum - 1}`
  };
});

const initialAlerts = [
  { type: 'Critical', text: 'Gender DI dropped below 0.70 threshold', meta: 'Session 8 · 3 days ago', color: 'var(--color-red, #ef4444)' },
  { type: 'Warning', text: 'Statistical Parity worsening (-0.22)', meta: 'Session 7 · 5 days ago', color: 'var(--color-amber, #fbbf24)' },
  { type: 'Resolved', text: 'Re-weighting fix applied — DI restored to 0.87', meta: 'Session 9 · 2 hours ago', color: 'var(--color-lime, #a3e635)' },
  { type: 'Info', text: 'New dataset version loaded: hiring_bias_v2.csv', meta: 'Session 10 · 1 hour ago', color: 'var(--color-blue, #60a5fa)' },
];

export default function App() {
  const [activeTab, setActiveTab] = useState('inspect')
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [copilotOpen, setCopilotOpen] = useState(false)
  const [language, setLanguage] = useState('en')

  // ── Dataset State ──
  const [dataset, setDataset] = useState(null)
  const [datasetName, setDatasetName] = useState('')
  const [columns, setColumns] = useState([])
  const [rows, setRows] = useState([])
  const [sensitiveAttrs, setSensitiveAttrs] = useState([])
  const [targetColumn, setTargetColumn] = useState('')
  const [analysisResults, setAnalysisResults] = useState(null)
  const [remediationResults, setRemediationResults] = useState(null)
  const [modelResults, setModelResults] = useState(null)
  
  // ── Monitor State ──
  const [auditHistory, setAuditHistory] = useState(initialHistory)
  const [driftAlerts, setDriftAlerts] = useState(initialAlerts)

  const addAuditRecord = useCallback((di, spd, currentDatasetName, actionType = 'Measure') => {
    setAuditHistory(prev => {
      const newSessionNum = parseInt(prev[0].session.split(' ')[1]) + 1;
      const status = di >= 0.80 ? 'Compliant' : di >= 0.70 ? 'At Risk' : 'Critical';
      const newRecord = {
        session: `Session ${newSessionNum}`,
        dataset: currentDatasetName || 'unknown.csv',
        di: Number(di.toFixed(2)),
        spd: Number(spd.toFixed(2)),
        status: status,
        timestamp: 'Just now',
        timeLabel: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
      };
      
      if (actionType === 'Fix') {
        setDriftAlerts(alerts => [{
          type: 'Resolved', text: `Fix applied — DI improved to ${di.toFixed(2)}`, meta: `Session ${newSessionNum} · Just now`, color: 'var(--color-lime, #a3e635)'
        }, ...alerts]);
      } else if (status === 'Critical' || status === 'At Risk') {
        setDriftAlerts(alerts => [{
          type: status === 'Critical' ? 'Critical' : 'Warning', text: `DI dropped to ${di.toFixed(2)} (${status})`, meta: `Session ${newSessionNum} · Just now`, color: status === 'Critical' ? 'var(--color-red, #ef4444)' : 'var(--color-amber, #fbbf24)'
        }, ...alerts]);
      } else {
        setDriftAlerts(alerts => [{
          type: 'Info', text: `Audit passed — DI is ${di.toFixed(2)}`, meta: `Session ${newSessionNum} · Just now`, color: 'var(--color-blue, #60a5fa)'
        }, ...alerts]);
      }
      
      return [newRecord, ...prev];
    });
  }, []);

  const loadDataset = useCallback((name, parsedData) => {
    const cols = parsedData.meta.fields || []
    setDatasetName(name)
    setColumns(cols)
    setRows(parsedData.data.filter(r => Object.values(r).some(v => v !== '')))
    setDataset(parsedData)
    setAnalysisResults(null)
    setRemediationResults(null)
    setModelResults(null)
    setSensitiveAttrs([])
    setTargetColumn('')
  }, [])

  const t = useCallback((text) => translate(text, language), [language])

  const contextValue = {
    dataset, datasetName, columns, rows,
    sensitiveAttrs, setSensitiveAttrs,
    targetColumn, setTargetColumn,
    analysisResults, setAnalysisResults,
    remediationResults, setRemediationResults,
    modelResults, setModelResults,
    auditHistory, driftAlerts, addAuditRecord,
    loadDataset,
    language, setLanguage, t
  }

  const renderTab = () => {
    switch (activeTab) {
      case 'measure': return <MeasureTab />
      case 'monitor': return <BiasMonitor onTabChange={setActiveTab} />
      case 'fix': return <FixTab />
      case 'report': return <ReportTab />
      default: return <InspectTab />
    }
  }

  return (
    <DataContext.Provider value={contextValue}>
      {window.location.pathname.startsWith('/audit/') ? (
        <AuditView auditId={window.location.pathname.split('/')[2]} />
      ) : !isAuthenticated ? (
        <div style={{ minHeight: '100vh' }}>
          <LandingTab onAuth={(tab = 'inspect') => {
            setActiveTab(tab)
            setIsAuthenticated(true)
          }} />
        </div>
      ) : (
        <div className="app-layout">
          <Sidebar
            activeTab={activeTab}
            onTabChange={setActiveTab}
            isOpen={sidebarOpen}
            datasetName={datasetName}
            onLogoClick={() => setIsAuthenticated(false)}
          />
          <main className={`app-main ${!sidebarOpen ? 'sidebar-closed' : ''}`}>
            <Topbar
              onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
              onToggleCopilot={() => setCopilotOpen(!copilotOpen)}
              copilotOpen={copilotOpen}
              datasetName={datasetName}
              language={language}
              setLanguage={setLanguage}
              setActiveTab={setActiveTab}
              activeTab={activeTab}
            />
            <div className="app-content">
              {renderTab()}
            </div>
          </main>
  
          {copilotOpen && (
            <CopilotPanel onClose={() => setCopilotOpen(false)} />
          )}
        </div>
      )}
    </DataContext.Provider>
  )
}
