<div align="center">

# ?? FairLens

### Clinical-Grade AI Fairness Auditor & Compliance Dossier Generator

**Detect · Measure · Remediate · Report — Algorithmic Bias**

[![License: MIT](https://img.shields.io/badge/License-MIT-A3E635.svg?style=flat-square)](LICENSE)
[![Node.js](https://img.shields.io/badge/Node.js-20+-339933?style=flat-square&logo=node.js&logoColor=white)](https://nodejs.org)
[![React](https://img.shields.io/badge/React-19-61DAFB?style=flat-square&logo=react&logoColor=black)](https://react.dev)
[![Vite](https://img.shields.io/badge/Vite-6-646CFF?style=flat-square&logo=vite&logoColor=white)](https://vitejs.dev)
[![Google Solution Challenge](https://img.shields.io/badge/Google-Solution_Challenge_2026-EA4335?style=flat-square&logo=google&logoColor=white)](#)

<br />

**FairLens** is an AI-native web platform that empowers data scientists, machine learning engineers, and compliance officers to **audit, explain, and mitigate** algorithmic bias in ML datasets and predictive models — before they reach production.

[Getting Started](#-getting-started) · [Features](#-features) · [Architecture](#-architecture) · [API Reference](#-api-reference) · [Deployment](#-deployment)

</div>

---

## ?? Why FairLens?

AI models make life-altering decisions daily — screening resumes, scoring credits, prioritizing medical care, and directing law enforcement. However, these models learn from historical datasets containing **implicit human and systemic biases**, often compounding and cementing inequalities.

| Key Problem | How FairLens Solves It |
|---|---|
| **Invisible Disparities** | Visual profiling with auto-detected sensitive demographic attributes. |
| **Compounded Disadvantage** | **Intersectional Bias Matrix** maps the combined impact of multiple attributes. |
| **Black-Box Decisioning** | **Profile Flipper** simulates counterfactual changes at the individual level to inspect model consistency. |
| **Complex Remediation** | One-click mitigation simulations (Re-weighting, Proxy Removal, Calibrated Resampling) with trade-off charts. |
| **Compliance Audits** | Automated compliance checkers validating against standards like the **EEOC 4/5ths Rule** and the **India DPDP Act 2023**. |
| **Regional Accessibility** | Full **Bilingual Interface** supporting English and Hindi locales for localized auditing. |

---

## ? Features

### ?? 1. Inspect & Parse
*   **Privacy-First Parsing**: Upload CSV datasets locally. Processing is executed client-side via **PapaParse** — your raw data never leaves the browser.
*   **Curated Scenarios**: Load sandbox datasets reflecting real-world bias challenges:
    *   *HR Hiring Bias* (15k rows) — Gender and educational disparities.
    *   *Loan Approval Bias* (10k rows) — Caste and income-based disparities in lending.
    *   *Medical Diagnosis Bias* (12k rows) — Age-group and sex biases in cardiovascular disease detection.

### ?? 2. Measure & Predict
*   **Forensic Bias Engine**: Real-time computation of statistical metrics including **Disparate Impact Ratio**, **Statistical Parity Gap**, and **Equalized Odds**.
*   **Intersectional Bias Matrix**: Visualizes compounded disadvantage across overlapping protected attributes locally in your browser.
*   **Ensemble ML Model**: Train a server-side bagged decision-tree classifier to observe model prediction metrics (TPR, FPR, Accuracy, F1) across demographic groups, optimized to evaluate up to 3000 rows for real-time responsiveness.

### ?? 3. Fix (Mitigation)
*   **Remediation Simulator**: Apply mitigation strategies via the backend Engine and view side-by-side performance comparison:
    *   *Re-weighting*: Adjusts mathematical weights of samples to equalize group rates.
    *   *Proxy Removal*: Suppresses features highly correlated with sensitive attributes.
    *   *Calibrated Resampling*: Balances representation in subset partitions.

### ?? 4. Report & Document
*   **Executive Dashboard**: Renders an executive compliance overview with overall fairness scores, risk ratings, and validation flags.
*   **Multi-Format Export**: One-click download of official reports as **PDF** (via jsPDF/html2canvas).

---

## ??? Architecture

\\\mermaid
graph TB
    subgraph CLIENT["??? Frontend — React 19 + Vite 6"]
        direction TB
        UI["App Shell<br/>(Obsidian & Dune Theme)"]
        TABS["Tab Navigator"]
        UI --> TABS
        TABS --> INSPECT["?? Inspect<br/>Upload CSV / Load Samples"]
        TABS --> MEASURE["?? Measure<br/>Fairness Metrics & Charts"]
        TABS --> FIX["?? Fix<br/>Remediation Strategies"]
        TABS --> REPORT["?? Report<br/>PDF Export"]
        PP["PapaParse<br/>(Client-side CSV)"]
        RC["Recharts<br/>(Visualizations)"]
        INSPECT --> PP
        MEASURE --> RC
    end

    subgraph SERVER["?? Backend — Node.js 20 + Express 4"]
        direction TB
        API["REST API Gateway"]
        API --> TRAIN["/api/analysis/train<br/>ML Training"]
        API --> REMED["/api/analysis/remediate<br/>Bias Mitigation"]

        subgraph ML["?? ML Engine"]
            DT["Ensemble Bagging<br/>(3 Decision Trees)"]
            CM["Confusion Matrix<br/>& Fairness Metrics"]
            DT --> CM
        end
        TRAIN --> ML
        REMED --> ML
    end

    subgraph CLOUD["?? Deployment"]
        FIREBASE["Firebase<br/>Hosting"]
        RENDER["Render<br/>(Web Service)"]
    end

    CLIENT -->|"REST API"| SERVER
    CLIENT -.->|"Hosted on"| FIREBASE
    SERVER -.->|"Deployed on"| RENDER

    style CLIENT fill:#1a1a2e,stroke:#a3e635,stroke-width:2px,color:#fff
    style SERVER fill:#16213e,stroke:#60a5fa,stroke-width:2px,color:#fff
    style CLOUD fill:#0f3460,stroke:#f59e0b,stroke-width:2px,color:#fff
    style ML fill:#1e293b,stroke:#a78bfa,stroke-width:2px,color:#fff
    style FIREBASE fill:#FFCA28,stroke:#fff,stroke-width:2px,color:#000
    style RENDER fill:#46E3B7,stroke:#fff,stroke-width:2px,color:#000
\\\

### Tech Stack

| Layer | Technologies |
|---|---|
| **Frontend** | React 19, Vite 6, Recharts, Lucide Icons, PapaParse |
| **Styling** | Custom variables + Tailwind CSS 4 ("Obsidian & Dune" design system) |
| **Backend** | Node.js 20+, Express 4 |
| **ML Engine** | ml-cart (Ensemble Bagging), ml-confusion-matrix |
| **Compliance Frameworks** | EEOC Uniform Guidelines (Demographic Parity), India DPDP Act 2023 |
| **Deployment** | Firebase Hosting (Client), Render (Server) |

---

## ?? Getting Started

### Prerequisites
*   **Node.js** &ge; 20.x
*   **npm** &ge; 10.x

### 1. Clone the Repository
\\\ash
git clone https://github.com/DevWithOm/FairLens.git
cd FairLens
\\\

### 2. Install Dependencies
\\\ash
# Install root, client, and server dependencies
npm run install:all
\\\

### 3. Configure the Environment
Create a \.env\ file in the project root:
\\\env
# Server Settings
PORT=5000
NODE_ENV=development
CLIENT_URL=http://localhost:5173
\\\

### 4. Start Development Servers
\\\ash
# Start backend API (Terminal 1)
cd server && npm run dev

# Start React client (Terminal 2)
cd client && npm run dev
\\\

---

## ?? API Reference

### Core Endpoints

| Method | Endpoint | Description |
|---|---|---|
| \GET\ | \/api/health\ | Health check & system diagnostic metadata. |
| \GET\ | \/api/datasets\ | List curated sandbox scenarios. |
| \POST\ | \/api/analysis/train\ | Train ensemble model & return per-group prediction metrics. |
| \POST\ | \/api/analysis/predict\ | Simulate counterfactual outcomes for Profile Flipper. |
| \POST\ | \/api/analysis/remediate\ | Simulate data debiasing strategies. |

---

## ?? Deployment

FairLens is configured for cloud deployment using Firebase and Render:
*   Deploy the built production client in \client/dist\ to **Firebase Hosting**. Use \deploy.sh\.
*   Deploy the \server/\ subdirectory directly to **Render** as a Web Service. The provided \ender.yaml\ automates this process.

---

## ?? Contributing

Contributions are welcome! Please follow these guidelines:
*   **Branch Naming**: use prefixes like \eat/\, \ix/\, or \docs/\.
*   **Commit Format**: adhere to [Conventional Commits](https://www.conventionalcommits.org/).

---

## ?? License

This project is licensed under the **MIT License** — see the [LICENSE](LICENSE) file for details.

<div align="center">

**Built with ?? for the Google Solution Challenge 2026**

</div>
