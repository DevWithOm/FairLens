import React, { useState, useCallback } from 'react'
import { DataContext } from './lib/DataContext'
import Sidebar from './components/layout/Sidebar'
import Topbar from './components/layout/Topbar'
import InspectTab from './components/tabs/InspectTab'
import MeasureTab from './components/tabs/MeasureTab'
import ReportTab from './components/tabs/ReportTab'
import LandingTab from './components/tabs/LandingTab'
import CopilotPanel from './components/copilot/CopilotPanel'
import { translate } from './lib/i18n'

// ── Data context is now imported from ./lib/DataContext ──


export default function App() {
  const [activeTab, setActiveTab] = useState('inspect')
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [copilotOpen, setCopilotOpen] = useState(false)
  const [language, setLanguage] = useState('english')

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
      case 'fix': return <FixTab />
      case 'report': return <ReportTab />
      default: return <InspectTab />
    }
  }

  return (
    <DataContext.Provider value={contextValue}>
      {!isAuthenticated ? (
        <div style={{ minHeight: '100vh', padding: '48px' }}>
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
