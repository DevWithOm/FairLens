import React, { useState, useRef, useCallback } from 'react'
import { useData } from '../../lib/DataContext'
import Papa from 'papaparse'
import {
  Upload, FileSpreadsheet, Database, Columns, Rows3,
  AlertTriangle, CheckCircle, XCircle, Eye, Search,
  ArrowRight, ChevronDown, Trash2, Download, Info
} from 'lucide-react'
import ColumnHeatmap from '../inspect/ColumnHeatmap'
import DemographicCharts from '../inspect/DemographicCharts'

const SAMPLE_DATASETS = [
  { name: 'hiring_bias_15k.csv', path: '/Datasets/hiring_bias_15k.csv', desc: 'Hiring bias — race, gender, age, disability (15K rows)', icon: '🧑‍💼', rows: '15K', sensitive: ['gender', 'race'], target: 'hired', story: 'Unmask hiring discrimination against minorities, women, and disabled candidates in large-scale recruitment data' },
  { name: 'loan_bias_10k.csv', path: '/Datasets/loan_bias_10k.csv', desc: 'Loan approval bias — caste, gender, religion (10K rows)', icon: '🏦', rows: '10K', sensitive: ['Gender', 'Caste_Category'], target: 'loan_approved', story: 'Investigate systemic denial patterns against SC/ST applicants and women in loan decisions' },
  { name: 'medical_bias_12k.csv', path: '/Datasets/medical_bias_12k.csv', desc: 'Medical treatment — race, sex, insurance (12K rows)', icon: '🏥', rows: '12K', sensitive: ['sex', 'race'], target: 'treatment_approved', story: 'Reveal how race and insurance status influence who receives life-saving medical treatment' },
  { name: 'justice_bias_10k.csv', path: '/Datasets/justice_bias_10k.csv', desc: 'Criminal justice risk — race, sex (10K rows)', icon: '⚖️', rows: '10K', sensitive: ['sex', 'race'], target: 'low_risk_approved', story: 'Expose racial disparities in criminal risk assessments and sentencing alternatives' },
  { name: 'hr_dataset.csv', path: '/Datasets/hr_dataset.csv', desc: 'HR pipeline — gender, experience, education', icon: '👤', rows: '5K', sensitive: ['gender'], target: 'looking_for_job_change', story: 'Find out why female candidates are underrepresented in this HR pipeline' },
  { name: 'loan_dataset.csv', path: '/Datasets/loan_dataset.csv', desc: 'Loan approval — caste, gender (small)', icon: '💰', rows: '615', sensitive: ['Gender', 'Caste_Category'], target: 'loan_approved', story: 'Classic Indian loan dataset with caste-based bias' },
  { name: 'medical_dataset.csv', path: '/Datasets/medical_dataset.csv', desc: 'Heart disease diagnosis — age, sex', icon: '❤️', rows: '1K', sensitive: ['sex', 'age_group'], target: 'heart_disease', story: 'Explore whether heart disease is diagnosed equally across sexes and age groups' },
]

export default function InspectTab() {
  const { loadDataset, datasetName, columns, rows, sensitiveAttrs, setSensitiveAttrs, targetColumn, setTargetColumn, t } = useData()
  const [dragActive, setDragActive] = useState(false)
  const [loading, setLoading] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [previewPage, setPreviewPage] = useState(0)
  const fileInputRef = useRef(null)
  const ROWS_PER_PAGE = 20

  const handleFile = useCallback((file) => {
    if (!file) return
    setLoading(true)
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      dynamicTyping: true,
      complete: (result) => {
        loadDataset(file.name, result)
        setLoading(false)
        setPreviewPage(0)
      },
      error: () => setLoading(false)
    })
  }, [loadDataset])

  const handleSampleLoad = useCallback(async (sample) => {
    setLoading(true)
    try {
      const resp = await fetch(sample.path)
      const text = await resp.text()
      const result = Papa.parse(text, { header: true, skipEmptyLines: true, dynamicTyping: true })
      loadDataset(sample.name, result)
      setSensitiveAttrs(sample.sensitive || [])
      if (sample.target) setTargetColumn(sample.target)
      setPreviewPage(0)
    } catch (e) {
      console.error('Failed to load sample:', e)
    }
    setLoading(false)
  }, [loadDataset, setSensitiveAttrs, setTargetColumn])

  const onDragOver = (e) => { e.preventDefault(); setDragActive(true) }
  const onDragLeave = () => setDragActive(false)
  const onDrop = (e) => {
    e.preventDefault()
    setDragActive(false)
    handleFile(e.dataTransfer.files[0])
  }

  const toggleSensitive = (col) => {
    setSensitiveAttrs(prev =>
      prev.includes(col) ? prev.filter(c => c !== col) : [...prev, col]
    )
  }

  // Stats
  const numericCols = columns.filter(c =>
    rows.length > 0 && typeof rows[0][c] === 'number'
  )
  const categoricalCols = columns.filter(c => !numericCols.includes(c))
  const missingCount = rows.reduce((acc, row) =>
    acc + Object.values(row).filter(v => v === null || v === '' || v === undefined).length, 0
  )
  const totalCells = rows.length * columns.length

  const filteredRows = searchTerm
    ? rows.filter(row => Object.values(row).some(v => String(v).toLowerCase().includes(searchTerm.toLowerCase())))
    : rows
  const pagedRows = filteredRows.slice(previewPage * ROWS_PER_PAGE, (previewPage + 1) * ROWS_PER_PAGE)
  const totalPages = Math.ceil(filteredRows.length / ROWS_PER_PAGE)

  // ── No dataset loaded ──
  if (!datasetName) {
    return (
      <div className="fade-in-up">
        {/* Hero */}
        <div style={{ textAlign: 'center', marginBottom: '40px', paddingTop: '20px' }}>
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            padding: '6px 14px',
            borderRadius: '100px',
            background: 'rgba(99,179,237,0.1)',
            border: '1px solid rgba(99,179,237,0.2)',
            marginBottom: '16px'
          }}>
            <Eye size={14} style={{ color: 'var(--accent-blue)' }} />
            <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--accent-blue)' }}>
              Step 1 — Inspect
            </span>
          </div>
          <h2 style={{
            fontSize: '2rem',
            fontWeight: 800,
            letterSpacing: '-0.03em',
            marginBottom: '8px'
          }}>
            {t('Load Your')} <span className="text-gradient">{t('Dataset')}</span>
          </h2>
          <p style={{ color: 'var(--text-secondary)', maxWidth: '480px', margin: '0 auto', fontSize: '0.9375rem' }}>
            {t('Upload a CSV file or choose from our sample datasets to begin your bias audit.')}
          </p>
        </div>

        {/* Upload Zone */}
        <div
          className={`upload-zone ${dragActive ? 'drag-active' : ''}`}
          onDragOver={onDragOver}
          onDragLeave={onDragLeave}
          onDrop={onDrop}
          onClick={() => fileInputRef.current?.click()}
          id="upload-zone"
          style={{ maxWidth: '600px', margin: '0 auto 40px' }}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept=".csv"
            style={{ display: 'none' }}
            onChange={e => handleFile(e.target.files[0])}
          />
          {loading ? (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px' }}>
              <div className="bias-heartbeat" style={{ height: '40px' }}>
                <div className="bar" style={{ height: '100%' }} />
                <div className="bar" style={{ height: '100%' }} />
                <div className="bar" style={{ height: '100%' }} />
                <div className="bar" style={{ height: '100%' }} />
                <div className="bar" style={{ height: '100%' }} />
                <div className="bar" style={{ height: '100%' }} />
              </div>
              <p style={{ color: 'var(--text-secondary)', fontWeight: 500 }}>{t('Parsing dataset...')}</p>
            </div>
          ) : (
            <>
              <div style={{
                width: '64px',
                height: '64px',
                borderRadius: '50%',
                background: 'rgba(99,179,237,0.1)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 16px'
              }}>
                <Upload size={28} style={{ color: 'var(--accent-blue)' }} />
              </div>
              <p style={{ fontWeight: 600, fontSize: '1rem', marginBottom: '6px' }}>
                {t('Drop your CSV file here')}
              </p>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>
                {t('or click to browse • Max 50MB')}
              </p>
            </>
          )}
        </div>

        {/* Sample Datasets */}
        <div style={{ maxWidth: '800px', margin: '0 auto' }}>
          <p style={{
            fontSize: '0.75rem',
            fontWeight: 600,
            color: 'var(--text-muted)',
            textTransform: 'uppercase',
            letterSpacing: '0.08em',
            marginBottom: '12px'
          }}>
            {t('Or try a sample dataset')}
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '12px' }}>
            {SAMPLE_DATASETS.map(ds => (
              <button
                key={ds.name}
                id={`sample-${ds.name.replace('.csv','')}`}
                onClick={() => handleSampleLoad(ds)}
                style={{
                  textAlign: 'left',
                  padding: '16px 18px',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--border-subtle)',
                  background: 'var(--bg-card)',
                  cursor: 'pointer',
                  fontFamily: 'var(--font-sans)',
                  transition: 'all var(--transition-fast)',
                  display: 'flex',
                  gap: '14px',
                  alignItems: 'flex-start'
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.borderColor = 'var(--accent-blue)'
                  e.currentTarget.style.background = 'rgba(99,179,237,0.05)'
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.borderColor = 'var(--border-subtle)'
                  e.currentTarget.style.background = 'var(--bg-card)'
                }}
              >
                <span style={{ fontSize: '1.5rem' }}>{ds.icon}</span>
                <div>
                  <p style={{ fontWeight: 600, fontSize: '0.875rem', color: 'var(--text-primary)', marginBottom: '4px' }}>
                    {ds.name}
                  </p>
                  <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', lineHeight: 1.4, marginBottom: '6px' }}>
                    {t(ds.desc)}
                  </p>
                  <p style={{ fontSize: '0.6875rem', color: 'var(--accent-yellow)', fontStyle: 'italic', marginBottom: '6px' }}>
                    "{t(ds.story)}"
                  </p>
                  <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                    <span className="badge badge-teal">{ds.rows} rows</span>
                    {ds.sensitive.map(s => (
                      <span className="badge badge-purple" key={s}>{s}</span>
                    ))}
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>
    )
  }

  // ── Dataset loaded ──
  return (
    <div className="fade-in-up">
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
            <FileSpreadsheet size={20} style={{ color: 'var(--accent-blue)' }} />
            <h2 style={{ fontSize: '1.375rem', fontWeight: 700, letterSpacing: '-0.02em' }}>
              {t('Evidence Inspector')}
            </h2>
          </div>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.8125rem' }}>
            Loaded <strong style={{ color: 'var(--text-secondary)' }}>{datasetName}</strong>
          </p>
        </div>
        <button
          className="btn btn-secondary btn-sm"
          onClick={() => loadDataset('', { meta: { fields: [] }, data: [] })}
        >
          <Trash2 size={14} /> {t('Change Dataset')}
        </button>
      </div>

      {/* Stats Row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '12px', marginBottom: '24px' }}>
        {[
          { label: t('Rows'), value: rows.length.toLocaleString(), icon: Rows3, color: 'var(--accent-blue)' },
          { label: t('Columns'), value: columns.length, icon: Columns, color: 'var(--accent-teal)' },
          { label: t('Numeric'), value: numericCols.length, icon: Database, color: 'var(--accent-green)' },
          { label: t('Categorical'), value: categoricalCols.length, icon: FileSpreadsheet, color: 'var(--accent-purple)' },
          { label: t('Missing Cells'), value: missingCount.toLocaleString(), icon: AlertTriangle, color: missingCount > 0 ? 'var(--accent-orange)' : 'var(--accent-green)' },
          { label: t('Complete'), value: totalCells > 0 ? `${(((totalCells - missingCount) / totalCells) * 100).toFixed(1)}%` : '—', icon: CheckCircle, color: 'var(--accent-green)' },
        ].map((stat, i) => (
          <div key={stat.label} className={`metric-card fade-in-up stagger-${i+1}`}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
              <stat.icon size={16} style={{ color: stat.color }} />
              <span className="metric-label" style={{ marginTop: 0 }}>{stat.label}</span>
            </div>
            <div className="metric-value" style={{ fontSize: '1.5rem', color: stat.color }}>
              {stat.value}
            </div>
          </div>
        ))}
      </div>

      {/* ═══ NEW: Column X-Ray Heatmap ═══ */}
      <ColumnHeatmap
        columns={columns}
        rows={rows}
        sensitiveAttrs={sensitiveAttrs}
        targetColumn={targetColumn}
        onToggleSensitive={toggleSensitive}
        t={t}
      />

      {/* Column Configuration */}
      <div className="card" style={{ marginBottom: '24px' }}>
        <div className="card-header">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <Columns size={18} style={{ color: 'var(--accent-blue)' }} />
              <h3 style={{ fontSize: '1rem', fontWeight: 600 }}>{t('Configure Columns')}</h3>
            </div>
            <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
              <Info size={14} style={{ color: 'var(--text-muted)' }} />
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                {t('Select sensitive attributes & target column')}
              </span>
            </div>
          </div>
        </div>
        <div className="card-body">
          {/* Target Column */}
          <div style={{ marginBottom: '20px' }}>
            <label style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: '8px' }}>
              🎯 {t('Target Variable')}
            </label>
            <select
              className="input select"
              value={targetColumn}
              onChange={e => setTargetColumn(e.target.value)}
              style={{ maxWidth: '360px' }}
              id="target-column-select"
            >
              <option value="">{t('Select target column...')}</option>
              {columns.map(c => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>

          {/* Sensitive Attributes */}
          <div>
            <label style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: '8px' }}>
              🔒 {t('Sensitive Attribute')}
            </label>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
              {columns.map(col => {
                const isSelected = sensitiveAttrs.includes(col)
                return (
                  <button
                    key={col}
                    onClick={() => toggleSensitive(col)}
                    style={{
                      padding: '6px 14px',
                      borderRadius: '100px',
                      border: `1px solid ${isSelected ? 'var(--accent-purple)' : 'var(--border-default)'}`,
                      background: isSelected ? 'rgba(183,148,244,0.15)' : 'var(--bg-tertiary)',
                      color: isSelected ? 'var(--accent-purple)' : 'var(--text-secondary)',
                      cursor: 'pointer',
                      fontSize: '0.8125rem',
                      fontWeight: isSelected ? 600 : 400,
                      fontFamily: 'var(--font-mono)',
                      transition: 'all var(--transition-fast)'
                    }}
                  >
                    {isSelected && '✓ '}{col}
                  </button>
                )
              })}
            </div>
          </div>
        </div>
      </div>

      {/* ═══ NEW: Demographic Distribution Charts ═══ */}
      {sensitiveAttrs.length > 0 && (
        <DemographicCharts
          rows={rows}
          columns={columns}
          sensitiveAttrs={sensitiveAttrs}
          t={t}
        />
      )}

      {/* Data Preview */}
      <div className="card">
        <div className="card-header">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <Eye size={18} style={{ color: 'var(--accent-teal)' }} />
              <h3 style={{ fontSize: '1rem', fontWeight: 600 }}>{t('Data Preview')}</h3>
              <span className="badge badge-blue">{filteredRows.length.toLocaleString()} {t('rows')}</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div style={{ position: 'relative' }}>
                <Search size={14} style={{
                  position: 'absolute',
                  left: '10px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  color: 'var(--text-muted)'
                }} />
                <input
                  className="input"
                  placeholder="Search rows..."
                  value={searchTerm}
                  onChange={e => { setSearchTerm(e.target.value); setPreviewPage(0) }}
                  style={{ paddingLeft: '32px', width: '200px', fontSize: '0.8125rem' }}
                  id="search-rows"
                />
              </div>
            </div>
          </div>
        </div>
        <div style={{ overflowX: 'auto' }}>
          <table className="data-table">
            <thead>
              <tr>
                <th style={{ width: '48px', textAlign: 'center' }}>#</th>
                {columns.map(col => (
                  <th key={col} style={{
                    background: sensitiveAttrs.includes(col) ? 'rgba(183,148,244,0.08)' : undefined,
                    color: col === targetColumn ? 'var(--accent-blue)' :
                           sensitiveAttrs.includes(col) ? 'var(--accent-purple)' : undefined
                  }}>
                    {sensitiveAttrs.includes(col) && <span title="Sensitive">🔒 </span>}
                    {col === targetColumn && <span title="Target">🎯 </span>}
                    {col}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {pagedRows.map((row, idx) => (
                <tr key={idx}>
                  <td style={{ textAlign: 'center', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', fontSize: '0.75rem' }}>
                    {previewPage * ROWS_PER_PAGE + idx + 1}
                  </td>
                  {columns.map(col => (
                    <td key={col} style={{
                      background: sensitiveAttrs.includes(col) ? 'rgba(183,148,244,0.04)' : undefined,
                      color: (row[col] === null || row[col] === '' || row[col] === undefined) ? 'var(--accent-orange)' : undefined
                    }}>
                      {row[col] === null || row[col] === '' || row[col] === undefined ? (
                        <span style={{ fontStyle: 'italic', color: 'var(--text-muted)' }}>null</span>
                      ) : (
                        String(row[col])
                      )}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {/* Pagination */}
        {totalPages > 1 && (
          <div className="card-footer" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              Page {previewPage + 1} of {totalPages}
            </span>
            <div style={{ display: 'flex', gap: '8px' }}>
              <button
                className="btn btn-ghost btn-sm"
                onClick={() => setPreviewPage(p => Math.max(0, p - 1))}
                disabled={previewPage === 0}
              >{t('Previous')}</button>
              <button
                className="btn btn-ghost btn-sm"
                onClick={() => setPreviewPage(p => Math.min(totalPages - 1, p + 1))}
                disabled={previewPage >= totalPages - 1}
              >{t('Next')}</button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
