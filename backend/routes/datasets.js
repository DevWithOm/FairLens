import express from 'express'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import Papa from 'papaparse'

const router = express.Router()
const __dirname = path.dirname(fileURLToPath(import.meta.url))

// Point directly to Datasets which is now inside the backend folder
const DATASETS_DIR = path.join(__dirname, '../')

const SAMPLE_DATASETS = [
  {
    id: 'hr_dataset',
    name: 'hr_dataset.csv',
    desc: 'HR hiring bias — gender, experience, education',
    icon: '👤',
    sensitive: ['gender', 'city'],
    target: 'looking_for_job_change'
  },
  {
    id: 'loan_dataset',
    name: 'loan_dataset.csv',
    desc: 'Loan approval bias — caste, gender, income',
    icon: '🏦',
    sensitive: ['Gender', 'Caste_Category'],
    target: 'loan_approved'
  },
  {
    id: 'medical_dataset',
    name: 'medical_dataset.csv',
    desc: 'Medical diagnosis bias — age, sex',
    icon: '🏥',
    sensitive: ['sex', 'age'],
    target: 'heart_disease'
  }
]

router.get('/', (req, res) => {
  const datasets = SAMPLE_DATASETS.map(ds => {
    const filePath = path.join(DATASETS_DIR, ds.name)
    const exists = fs.existsSync(filePath)
    const stats = exists ? fs.statSync(filePath) : null
    return {
      ...ds,
      available: exists,
      sizeBytes: stats?.size || 0
    }
  })
  res.json({ success: true, datasets })
})

router.get('/:id', (req, res) => {
  try {
    const dataset = SAMPLE_DATASETS.find(ds => ds.id === req.params.id)
    if (!dataset) return res.status(404).json({ error: 'Dataset not found' })

    const filePath = path.join(DATASETS_DIR, dataset.name)
    if (!fs.existsSync(filePath)) return res.status(404).json({ error: 'File not found' })

    const csvText = fs.readFileSync(filePath, 'utf-8')
    const parsed = Papa.parse(csvText, { header: true, skipEmptyLines: true, dynamicTyping: true })

    res.json({
      success: true,
      dataset: {
        ...dataset,
        columns: parsed.meta.fields,
        rows: parsed.data.filter(r => Object.values(r).some(v => v !== '')),
        totalRows: parsed.data.length
      }
    })
  } catch (err) {
    res.status(500).json({ error: 'Failed' })
  }
})

export default router
