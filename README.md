<div align="center">

# ⚖️ FairLens

### Clinical-Grade AI Fairness Auditor

**Detect · Measure · Remediate · Report — Algorithmic Bias**

[![License: MIT](https://img.shields.io/badge/License-MIT-A3E635.svg?style=flat-square)](LICENSE)
[![Node.js](https://img.shields.io/badge/Node.js-20+-339933?style=flat-square&logo=node.js&logoColor=white)](https://nodejs.org)
[![React](https://img.shields.io/badge/React-19-61DAFB?style=flat-square&logo=react&logoColor=black)](https://react.dev)
[![Vite](https://img.shields.io/badge/Vite-6-646CFF?style=flat-square&logo=vite&logoColor=white)](https://vitejs.dev)
[![Google Gemini](https://img.shields.io/badge/Google_Gemini-AI_Powered-4285F4?style=flat-square&logo=google&logoColor=white)](https://ai.google.dev)
[![Google Solution Challenge](https://img.shields.io/badge/Google-Solution_Challenge_2026-EA4335?style=flat-square&logo=google&logoColor=white)](#)

<br />

FairLens is a next-generation web platform that empowers data scientists, ML engineers, and compliance officers to **audit, understand, and fix** algorithmic bias in machine learning datasets and models — before they ever reach production.

[Getting Started](#-getting-started) · [Features](#-features) · [Architecture](#-architecture) · [API Reference](#-api-reference) · [Deployment](#-deployment) · [Contributing](#-contributing)

</div>

---

## 🧬 Why FairLens?

AI models increasingly make life-altering decisions — approving loans, screening job candidates, diagnosing medical conditions. These models learn from historical data that **inherently contains human biases**, leading to unfair outcomes for underrepresented groups.

| Problem | How FairLens Solves It |
|---|---|
| **Hidden Disparities** — Demographic imbalances in datasets are invisible without specialized tooling | Visual data profiling with automated sensitive-attribute detection |
| **Complex Remediation** — Fixing bias requires deep statistical knowledge (re-weighting, suppression, calibration) | One-click remediation strategies with AI-guided recommendations |
| **Black-Box Auditing** — Generating compliance-ready reports is a manual, error-prone process | Automated audit report generation with exportable PDF/Markdown output |
| **No Model-Level Insight** — Most tools stop at the data layer; model predictions can amplify bias | Built-in ML engine with per-group fairness metrics on model predictions |

---

## ✨ Features

### 📊 Inspect
Upload CSV datasets or load curated sample scenarios (HR hiring, loan approval, medical diagnosis, criminal justice). The platform auto-parses columns and identifies likely sensitive attributes.

### ⚖️ Measure
Computes industry-standard fairness metrics in real-time:
- **Disparate Impact Ratio** (80% rule / four-fifths rule)
- **Statistical Parity Difference**
- **Equalized Odds**
- **Per-group TPR, FPR, Precision & Accuracy**

Results are rendered through animated gauges, demographic distribution charts, and decision tree visualizations.

### 🔧 Fix (Remediate)
The core differentiator — FairLens doesn't just flag problems, it **fixes them**:
- **Re-weighting** — Adjusts sample weights to equalize group outcome rates
- **Proxy Removal** — Identifies and suppresses proxy features correlated with protected attributes
- **Calibrated Resampling** — Combines oversampling with model regularization
- **AI-Powered Recommendations** — Google Gemini analyzes bias context and suggests optimal strategies

### 📄 Report
One-click generation of compliance-ready audit reports:
- Full bias analysis breakdown with before/after metrics
- Remediation strategies applied and their impact
- Exportable as **PDF** or **Markdown**

### 🤖 AI Copilot
Built-in generative AI assistant powered by Google Gemini:
- Explain complex statistical concepts in plain language
- Debug fairness issues in your pipeline
- Scan LLM prompts for non-inclusive language

### 🧠 ML Model Engine
Server-side ensemble decision tree classifier (Bagging):
- Automatic label encoding, missing-value imputation, train/test splitting
- Adaptive hyperparameter tuning based on dataset size
- Per-group fairness metrics computed on model predictions
- Feature importance analysis via point-biserial correlation

---

## 🏗 Architecture

```
┌──────────────────────────────────────────────────────────────────┐
│                        CLIENT (React 19 + Vite)                  │
│                                                                  │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐            │
│  │ Inspect  │ │ Measure  │ │   Fix    │ │  Report  │            │
│  └────┬─────┘ └────┬─────┘ └────┬─────┘ └────┬─────┘            │
│       │             │            │             │                  │
│  ┌────▼─────────────▼────────────▼─────────────▼──────────────┐  │
│  │              API Client (lib/api.js)                        │  │
│  └────────────────────────┬───────────────────────────────────┘  │
└───────────────────────────┼──────────────────────────────────────┘
                            │  REST API
┌───────────────────────────▼──────────────────────────────────────┐
│                     SERVER (Node.js + Express)                    │
│                                                                  │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐           │
│  │  /analysis   │  │  /copilot    │  │  /datasets   │           │
│  │  Bias engine │  │  Gemini AI   │  │  CSV loader  │           │
│  └──────┬───────┘  └──────┬───────┘  └──────────────┘           │
│         │                 │                                      │
│  ┌──────▼───────┐  ┌──────▼───────┐                             │
│  │  ML Engine   │  │ Google       │                             │
│  │  (Ensemble   │  │ Gemini API   │                             │
│  │  Bagging)    │  │              │                             │
│  └──────────────┘  └──────────────┘                             │
└──────────────────────────────────────────────────────────────────┘
```

### Tech Stack

| Layer | Technology |
|---|---|
| **Frontend** | React 19, Vite 6, Recharts, Lucide Icons, PapaParse |
| **Styling** | Custom design system ("Obsidian & Dune") with CSS Variables + Tailwind CSS 4 |
| **Backend** | Node.js 20+, Express 4 |
| **ML Engine** | ml-cart (Decision Trees), ml-confusion-matrix, Ensemble Bagging |
| **AI** | Google Gemini (`@google/generative-ai`) |
| **Export** | jsPDF, html2canvas |
| **Deployment** | Docker, Render, Firebase Hosting |

---

## 🚀 Getting Started

### Prerequisites

- **Node.js** ≥ 20.x
- **npm** ≥ 10.x
- A **Google Gemini API key** ([Get one here](https://ai.google.dev))

### 1. Clone the repository

```bash
git clone https://github.com/DevWithOm/FairLens.git
cd FairLens
```

### 2. Install dependencies

```bash
# Install all dependencies (client + server)
npm run install:all

# Or install individually
cd client && npm install
cd ../server && npm install
```

### 3. Configure environment

Create a `.env` file in the project root:

```env
# ──── AI Configuration ────
GEMINI_API_KEY=your_gemini_api_key_here

# ──── Server Configuration ────
PORT=5000
NODE_ENV=development
CLIENT_URL=http://localhost:5173
```

### 4. Start development servers

```bash
# Terminal 1 — Backend API
cd server
npm run dev

# Terminal 2 — Frontend
cd client
npm run dev
```

| Service | URL |
|---|---|
| Frontend | `http://localhost:5173` |
| Backend API | `http://localhost:5000` |
| Health Check | `http://localhost:5000/api/health` |

---

## 📡 API Reference

### Core Endpoints

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/health` | Health check + version info |
| `GET` | `/api/datasets` | List all available sample datasets |
| `GET` | `/api/datasets/:id` | Load a specific dataset by ID |
| `POST` | `/api/analysis/bias` | Run bias analysis on a dataset |
| `POST` | `/api/analysis/remediate` | Apply a remediation strategy |
| `POST` | `/api/analysis/report` | Generate an audit report |
| `POST` | `/api/copilot/chat` | Send a message to the AI Copilot |

### Diagnostics

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/debug/config` | View loaded configuration (masked keys) |

### Example Request

```bash
# Check API health
curl http://localhost:5000/api/health

# Run bias analysis
curl -X POST http://localhost:5000/api/analysis/bias \
  -H "Content-Type: application/json" \
  -d '{
    "data": [...],
    "targetColumn": "Hired",
    "sensitiveAttributes": ["Gender", "Race"]
  }'
```

---

## 📦 Deployment

### Option A: Render (Recommended)

FairLens includes a pre-configured [`render.yaml`](render.yaml) for one-click deployment:

1. Push your repo to GitHub
2. Connect the repo on [Render Dashboard](https://dashboard.render.com)
3. Render will auto-detect the `render.yaml` blueprint
4. Set the following environment variables:
   - `GEMINI_API_KEY`
   - `CLIENT_URL` (your frontend URL)

### Option B: Docker

```bash
# Build the image
docker build -t fairlens .

# Run the container
docker run -p 8080:8080 \
  -e GEMINI_API_KEY=your_key \
  -e NODE_ENV=production \
  fairlens
```

### Option C: Manual Deploy (Vercel + Render)

| Component | Platform | Directory |
|---|---|---|
| Frontend | Vercel | `client/` |
| Backend | Render | `server/` |

1. Deploy `client/` to **Vercel** — set `VITE_API_URL` to your backend URL
2. Deploy `server/` to **Render** — set `GEMINI_API_KEY` and `CLIENT_URL`

---

## 📂 Project Structure

```
FairLens/
├── client/                          # React Frontend (Vite 6)
│   ├── src/
│   │   ├── components/
│   │   │   ├── common/              # Shared UI components
│   │   │   ├── copilot/             # AI Copilot panel
│   │   │   ├── inspect/             # Data upload & profiling
│   │   │   ├── layout/              # Sidebar, Topbar, shell
│   │   │   ├── measure/             # Fairness metrics & charts
│   │   │   ├── report/              # Audit report generation
│   │   │   └── tabs/                # Tab navigation system
│   │   ├── lib/                     # API client & utilities
│   │   ├── App.jsx                  # Root component & routing
│   │   └── index.css                # Design system tokens
│   └── public/                      # Static assets & sample data
│
├── server/                          # Express.js Backend
│   ├── routes/
│   │   ├── analysis.js              # Bias computation & remediation
│   │   ├── copilot.js               # Gemini AI integration
│   │   └── datasets.js              # Dataset management
│   ├── ml/
│   │   └── modelEngine.js           # Ensemble ML engine (Bagging)
│   └── index.js                     # Server entry point
│
├── Datasets/                        # Curated sample datasets
│   ├── hiring_bias_15k.csv          # HR hiring decisions (15K rows)
│   ├── loan_bias_10k.csv            # Loan approvals (10K rows)
│   ├── medical_bias_12k.csv         # Medical diagnosis (12K rows)
│   ├── justice_bias_10k.csv         # Criminal justice (10K rows)
│   └── ...                          # Additional datasets
│
├── Dockerfile                       # Production container config
├── render.yaml                      # Render deployment blueprint
├── firebase.json                    # Firebase hosting config
└── package.json                     # Monorepo scripts
```

---

## 🔄 Data Flow

```
┌─────────────────┐     CSV Upload      ┌─────────────────┐
│                 │ ──────────────────▶  │                 │
│   User          │                      │   React Client  │
│   (Data         │  ◀────────────────── │   (PapaParse    │
│   Scientist)    │   Visual Charts      │    parsing)     │
│                 │   & Gauges           │                 │
└─────────────────┘                      └────────┬────────┘
                                                  │
                                         Schema + │ Attributes
                                                  ▼
                                         ┌─────────────────┐
                                         │                 │
                                         │  Express API    │
                                         │  (Statistical   │
                                         │   Engine)       │
                                         │                 │
                                         └───────┬─────────┘
                                                 │
                                    ┌────────────┼────────────┐
                                    ▼                         ▼
                           ┌──────────────┐         ┌──────────────┐
                           │  ML Engine   │         │ Google       │
                           │  (Ensemble   │         │ Gemini API   │
                           │   Bagging)   │         │              │
                           └──────────────┘         └──────────────┘
```

1. **Ingestion** — CSV parsed client-side via PapaParse (zero server load)
2. **Analysis** — Backend computes Disparate Impact, Statistical Parity, Equalized Odds
3. **ML Training** — Ensemble bagging classifier with per-group fairness metrics
4. **AI Remediation** — Gemini receives bias context and returns optimization strategies
5. **Reporting** — Results compiled into exportable PDF/Markdown audit reports

---

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. **Fork** the repository
2. **Create** a feature branch (`git checkout -b feature/amazing-feature`)
3. **Commit** your changes (`git commit -m 'feat: add amazing feature'`)
4. **Push** to the branch (`git push origin feature/amazing-feature`)
5. **Open** a Pull Request

### Commit Convention

This project follows [Conventional Commits](https://www.conventionalcommits.org/):

| Prefix | Description |
|---|---|
| `feat:` | New feature |
| `fix:` | Bug fix |
| `docs:` | Documentation change |
| `style:` | Code style (formatting, no logic change) |
| `refactor:` | Code restructuring |
| `test:` | Adding or updating tests |
| `chore:` | Tooling, dependencies, configs |

---

## 📜 License

This project is licensed under the **MIT License** — see the [LICENSE](LICENSE) file for details.

---

<div align="center">

**Built with ❤️ for the Google Solution Challenge 2026**

[⬆ Back to Top](#️-fairlens)

</div>
