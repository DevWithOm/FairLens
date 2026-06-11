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
