import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import path from 'path'
import { fileURLToPath } from 'url'
import analysisRoutes from './routes/analysis.js'
import copilotRoutes from './routes/copilot.js'
import datasetRoutes from './routes/datasets.js'

dotenv.config({ path: path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../.env') })

const app = express()
const PORT = process.env.PORT || 5000
const __dirname = path.dirname(fileURLToPath(import.meta.url))

// ── Middleware ──
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:5173',
  credentials: true
}))
app.use(express.json({ limit: '50mb' }))
app.use(express.urlencoded({ extended: true, limit: '50mb' }))

// ── API Routes ──
app.use('/api/analysis', analysisRoutes)
app.use('/api/copilot', copilotRoutes)
app.use('/api/datasets', datasetRoutes)

// ── Health Check ──
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    platform: 'FairLens API',
    version: '1.0.0',
    timestamp: new Date().toISOString()
  })
})

// ── Server decoupled: Frontend is hosted on Vercel, Backend on Render ──
// ── API handling only ──

// ── Start Server ──
app.listen(PORT, () => {
  console.log(`
  ╔══════════════════════════════════════════╗
  ║        FairLens API Server v1.0          ║
  ║──────────────────────────────────────────║
  ║  Local:  http://localhost:${PORT}            ║
  ║  Mode:   ${process.env.NODE_ENV || 'development'}                  ║
  ╚══════════════════════════════════════════╝
  `)
})

export default app
