# FairLens — AI Bias Detection & Remediation Platform

> Clinical-grade AI fairness auditor for detecting, measuring, and remediating algorithmic bias.

![FairLens](https://img.shields.io/badge/FairLens-v1.0-blue) ![Google Solution Challenge](https://img.shields.io/badge/Google-Solution%20Challenge%202026-4285F4)

## 🏗️ Project Structure

```
FairLens/
├── client/                 # React Frontend (Vite)
│   ├── src/
│   │   ├── components/
│   │   │   ├── layout/     # Sidebar, Topbar
│   │   │   ├── tabs/       # Inspect, Measure, Fix, Report
│   │   │   └── copilot/    # AI Copilot Panel
│   │   ├── lib/            # API client helpers
│   │   ├── App.jsx         # Root component
│   │   └── index.css       # Design system
│   ├── public/             # Static assets + sample datasets
│   └── package.json
│
├── server/                 # Express Backend
│   ├── routes/
│   │   ├── analysis.js     # Bias analysis & remediation APIs
│   │   ├── copilot.js      # Gemini AI chat (secure)
│   │   └── datasets.js     # Dataset loading APIs
│   ├── index.js            # Server entry point
│   └── package.json
│
├── Datasets/               # Sample CSV datasets
│   ├── hr_dataset.csv
│   ├── loan_dataset.csv
│   └── medical_dataset.csv
│
├── .env                    # Environment variables (API keys)
├── package.json            # Root monorepo scripts
└── README.md
```

## 🚀 Quick Start

### 1. Install Dependencies

```bash
# Install both client and server dependencies
cd client && npm install
cd ../server && npm install
```

### 2. Configure Environment

Create a `.env` file in the root:

```env
GEMINI_API_KEY=your_gemini_api_key_here
PORT=5000
NODE_ENV=development
CLIENT_URL=http://localhost:5173
```

### 3. Run Development Servers

```bash
# Terminal 1: Start backend
cd server
npm run dev

# Terminal 2: Start frontend
cd client
npm run dev
```

- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:5000

## 📦 Deployment

### Option A: Render / Railway (Recommended)

1. **Build the client**:
   ```bash
   cd client && npm run build
   ```

2. **Deploy the server** (it serves the client build in production):
   ```bash
   cd server
   NODE_ENV=production npm start
   ```

   The server automatically serves `client/dist/` when `NODE_ENV=production`.

3. Set environment variables on your hosting platform:
   - `GEMINI_API_KEY`
   - `PORT` (usually auto-set)
   - `NODE_ENV=production`

### Option B: Vercel (Frontend) + Render (Backend)

1. Deploy `client/` to Vercel
2. Deploy `server/` to Render
3. Update `client/.env` with the production API URL:
   ```
   VITE_API_URL=https://your-backend.onrender.com/api
   ```

### Option C: Docker

```bash
docker build -t fairlens .
docker run -p 5000:5000 --env-file .env fairlens
```

## 🔑 API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/health` | Health check |
| GET | `/api/datasets` | List sample datasets |
| GET | `/api/datasets/:id` | Load a specific dataset |
| POST | `/api/analysis/bias` | Run bias analysis |
| POST | `/api/analysis/remediate` | Apply remediation strategy |
| POST | `/api/analysis/report` | Generate audit report |
| POST | `/api/copilot/chat` | AI copilot chat |

## 🛡️ Features

- **Inspect**: Upload CSV or load sample datasets, configure sensitive attributes
- **Measure**: Disparate Impact, Statistical Parity, animated gauges & charts
- **Fix**: Re-weighting, Re-sampling, Threshold Adjustment, Feature Suppression
- **Report**: Markdown/JSON audit reports with compliance summary
- **Copilot**: AI assistant powered by Google Gemini

## 📄 License

MIT
