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
const allowedOrigins = [
  'http://localhost:5173',
  process.env.CLIENT_URL
].filter(Boolean)

app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (mobile apps, curl, etc.)
    if (!origin || allowedOrigins.some(o => origin.startsWith(o))) {
      callback(null, true)
    } else {
      callback(null, true) // Allow all in production for now; tighten later
    }
  },
  credentials: true
}))
app.use(express.json({ limit: '50mb' }))
app.use(express.urlencoded({ extended: true, limit: '50mb' }))

// ── API Routes ──
app.use('/api/analysis', analysisRoutes)
app.use('/api/copilot', copilotRoutes)
app.use('/api/datasets', datasetRoutes)

// ── Diagnostics ──
app.get('/api/debug/config', (req, res) => {
  const apiKey = process.env.GROQ_API_KEY;
  res.json({
    groqKeyLoaded: !!apiKey && apiKey !== 'your_groq_api_key_here',
    groqKeyMasked: apiKey ? `${apiKey.substring(0, 7)}...${apiKey.substring(apiKey.length - 4)}` : 'missing',
    port: PORT,
    nodeEnv: process.env.NODE_ENV,
    clientUrl: process.env.CLIENT_URL
  });
});

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
  
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey || apiKey === 'your_groq_api_key_here') {
    console.log('⚠️  WARNING: GROQ_API_KEY is not set or is default. AI features will run in Offline Mode.');
  } else {
    console.log(`✅ Groq API Key loaded (${apiKey.substring(0, 7)}...)`);
  }
})

export default app
