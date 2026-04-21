# FairLens — AI Bias Detection & Remediation Platform
### Google Solution Challenge 2026 · Prototype Specification Document

---

## Overview

**FairLens** is an end-to-end AI fairness auditing platform that lets anyone — from data scientists to policy officers — upload a dataset or ML model output, instantly detect bias, quantify it, fix it, and generate a compliance-ready audit report. It uses Google Gemini as its ethics intelligence layer.

**Tagline:** *"See the bias. Measure it. Fix it. Prove it."*

**Target Users:** ML engineers, compliance officers, government bodies, NGOs, hiring teams, healthcare institutions, financial regulators

**Tech Stack (Recommended):**
- Frontend: React + Vite + Tailwind CSS
- AI Layer: Google Gemini 2.0 Flash API (via Gemini SDK)
- Charts: Recharts (BarChart, LineChart, Cell for per-bar coloring)
- Icons: Lucide React (stroke-based, 18px, weight 1.5)
- Fonts: Plus Jakarta Sans (UI) + Space Mono (scores) + JetBrains Mono (data tables) — all via Google Fonts
- Animation: CSS keyframes + `cubic-bezier` transitions; no animation library needed
- PDF Export: jsPDF + html2canvas
- Hosting: Firebase Hosting or Vercel
- Storage: Firebase Storage (for dataset uploads)
- Auth: Firebase Auth (optional for demo)

---

## What Makes FairLens Unique

| Feature | FairLens | Generic Bias Tools |
|---|---|---|
| Gemini-powered plain English explanations | ✅ | ❌ |
| India-specific compliance (DPDP, RBI) | ✅ | ❌ |
| Profile Flipper (counterfactual simulation) | ✅ | ❌ |
| Intersectional bias matrix (gender × state) | ✅ | Rarely |
| Human-in-the-loop triage queue | ✅ | ❌ |
| AI Nutrition Label (one-page model report card) | ✅ | ❌ |
| Hindi language toggle via Gemini | ✅ | ❌ |
| LLM prompt scanner for chatbot bias | ✅ | ❌ |

---

## 5 Categories · 24 Features · 30 Days

---

### Category 1 — Inspect (Data X-Ray)
*Goal: Help the user understand what's in their dataset before any analysis.*

#### Feature 1: CSV / JSON Uploader
- Drag-and-drop file upload zone
- Supports `.csv` and `.json` formats (up to 50MB)
- Auto-generates a paginated preview table (first 100 rows)
- Column type inference: numeric, categorical, boolean, date
- Shows row count, column count, missing value % per column
- Error handling for malformed files with user-friendly messages

#### Feature 2: Demographic Imbalance Visualizer
- Auto-detects demographic columns (gender, age, caste, race, state, religion)
- Generates pie charts (distribution %) and bar graphs (count)
- Auto-triggers a red warning banner if any group represents < 10% of data
- Side-by-side comparison: representation in dataset vs. representation in decisions/outcomes
- Toggle between percentage and absolute count views

#### Feature 3: Hidden Proxy Detector
- Scans all columns for known proxy variables using a curated dictionary
- Flags: zip code, pin code, college name, neighborhood, school type, vehicle type
- Highlights flagged columns in the Column Heatmap with an orange "PROXY" badge
- Gemini explains *why* each flagged column is a potential proxy in 2–3 sentences

#### Feature 4: Column Heatmap
- Grid view of all column headers, color-coded:
  - 🔴 Red = high bias risk (demographic or proxy column)
  - 🟡 Amber = moderate risk (correlated with sensitive attributes)
  - 🟢 Green = low risk (purely technical/numeric)
- Hover tooltip shows: bias type, risk score (0–100), and Gemini's one-line explanation
- Click any column to open deep-dive panel

#### Feature 5: Bias Type Classifier
- For each flagged column/feature, labels the bias type:
  - **Historical bias** — reflects past societal inequities in training data
  - **Selection bias** — dataset doesn't represent the real population
  - **Proxy bias** — variable acts as a stand-in for a protected attribute
  - **Measurement bias** — errors in data collection that affect groups differently
- Shown as chips/badges alongside each column in the heatmap

#### Feature 6: Demo Preset Datasets
- One-click sample datasets:
  - **HR Dataset** — hiring decisions with gender, age, education
  - **Loan Dataset** — credit decisions with income, caste, zip code
  - **Medical Dataset** — diagnosis rates with gender, state, insurance type
- Each preset includes a narrative "story" of what bias to find and why it matters
- Instantly loads and runs through the full pipeline

---

### Category 2 — Measure (Quantify the Bias)
*Goal: Give a precise, auditable, explainable score for every type of bias detected.*

#### Feature 7: Fairness Score Gauge
- Single animated circular gauge showing overall fairness: **0–100**
- Color zones: 0–40 (Red / Unfair), 41–70 (Amber / Needs Work), 71–100 (Green / Fair)
- Score = weighted average of all sub-metrics (demographic parity, equalized odds, etc.)
- Animates from 0 to final score on load (1.5s easing)
- Click gauge → Gemini explains what the score means in 3 sentences

#### Feature 8: Comparative Bar Charts
- Side-by-side grouped bar chart: approval/positive outcome rate per demographic group
- Supports gender, state, age group, caste as the grouping dimension
- Toggle between: Approval Rate, Rejection Rate, Average Score
- Automatically highlights the group with the worst outcome in red

#### Feature 9: Four-Fifths Rule Calculator
- Implements the EEOC 80% Rule (most widely used legal fairness standard)
- Compares each group's selection rate to the highest-performing group
- Displays a clear **PASS ✅** or **FAIL ❌** stamp per group
- Shows the exact ratio and the legal threshold
- Tooltip: "This is used in US EEOC cases. India's DPDP Act recommends similar proportionality checks."

#### Feature 10: Profile Flipper (Counterfactual Simulator)
- Select any single row from the dataset
- Flip one attribute (e.g., Gender: Male → Female, keeping all else identical)
- Shows original decision vs. new decision side-by-side
- If decision changes → red alert "Decision flipped — possible bias"
- Gemini narrates what this means in plain English

#### Feature 11: Intersectional Bias Matrix
- 2D heatmap grid: Gender (rows) × State (columns), color by approval rate
- Detects compounded disadvantage (e.g., women in rural states worst off)
- Click any cell → drill-down panel showing individual records in that intersection
- Export as PNG

#### Feature 12: Attribute Filter Toggle
- Sidebar checkboxes to isolate analysis by one sensitive attribute at a time
- All charts and scores update in real-time when a filter is toggled
- "Compare mode": show two attribute filters side-by-side

---

### Category 3 — Fix (Remediation)
*Goal: Give the user clear, actionable paths to reduce bias.*

#### Feature 13: Plain English Fix Suggestions
- For each detected bias, Gemini generates exactly 3 concrete action steps
- Example: "Remove zip code column → Retrain model → Re-evaluate with Four-Fifths Rule"
- Steps are copyable as a checklist
- Each step links to a relevant Google resource or research paper

#### Feature 14: Fairness-Accuracy Trade-off Slider
- Horizontal slider: drag left (maximize fairness) ↔ drag right (maximize accuracy)
- As slider moves, shows simulated impact on: Fairness Score, Precision, Recall, F1
- Gemini explains the ethical implications of each position in real-time
- "Ethical Sweet Spot" marker appears at the recommended balance point

#### Feature 15: Before / After Comparison View
- Apply a fix (e.g., remove a proxy column, reweigh groups)
- Animated transition shows: old gauge → new gauge
- Side-by-side before/after bar charts
- Net improvement score displayed: "Fairness improved by +18 points"

#### Feature 16: Auto-Mitigation Simulator
- Simulates two standard debiasing techniques on the current dataset:
  - **Reweighing** — adjusts sample weights to balance group representation
  - **Threshold Adjustment** — per-group decision thresholds to equalize outcomes
- Shows predicted new fairness score for each technique
- Does NOT retrain model — simulates outcome-level adjustment only

#### Feature 17: Remediation Chat
- Persistent chat panel (Gemini-powered)
- Context-aware: knows the user's current dataset, bias type, and scores
- Example questions: "How do I fix age bias in my loan model?" / "What does demographic parity mean?"
- Maintains conversation history within session

#### Feature 18: Human-in-the-Loop Triage Queue
- Flags rows where the model confidence is low (< 60%) AND a sensitive attribute is present
- Sends these rows to a dedicated "Review Queue" tab
- Reviewer can: Approve, Reject, or Flag for Escalation
- Each action is logged with timestamp (exportable to CSV)

---

### Category 4 — Report (Audit & Compliance)
*Goal: Generate proof of due diligence for regulators, investors, and stakeholders.*

#### Feature 19: AI Nutrition Label
- One-page visual report card modeled after food nutrition labels
- Sections: Model Purpose, Training Data Source, Fairness Score, Known Biases, Recommended Use Cases, Risk Level (Low / Medium / High)
- Downloadable as PNG
- Inspired by the Model Cards standard (Google PAIR)

#### Feature 20: Compliance Checker
- Checklist against:
  - **India DPDP Act 2023** — data minimization, purpose limitation, consent
  - **RBI Guidelines on Algorithmic Fairness** — financial model requirements
  - **EU AI Act (High-Risk)** — transparency, human oversight, accuracy
- Shows: ✅ Compliant / ⚠️ Partial / ❌ Violation per clause
- Gemini explains each violation and how to fix it

#### Feature 21: PDF Export
- Browser-based PDF generation (no backend needed)
- Includes: Nutrition Label, Compliance Checklist, Fairness Score, All Charts, Fix Suggestions, Triage Log
- Branded header: "FairLens Audit Certificate — [Date]"
- Downloadable in one click

#### Feature 22: Bias Drift Monitor
- Line chart: fairness score across multiple uploaded datasets (simulate over time)
- Upload Dataset v1, v2, v3 → chart shows fairness trend
- Alert threshold: if score drops by > 10 points between versions → red alert

#### Feature 23: Fairness Grade (A–F)
- Letter grade per demographic group based on their outcome disparity
- A = ≤ 5% disparity, B = 6–10%, C = 11–20%, D = 21–30%, F = > 30%
- Displayed as large letter grade cards per group
- Shareable as an image

#### Feature 24: Hindi Language Toggle
- Button in header: "हिंदी में देखें"
- When activated: all Gemini responses, explanations, and fix suggestions are generated in Hindi
- UI labels remain in English (or optionally switch too)
- Uses Gemini's native multilingual capability

---

### Category 5 — Gemini Ethics Copilot (AI Layer)
*Cuts across all categories. Always visible. The intelligence backbone.*

#### Feature 25: Ethics Chat Q&A
- Floating chat bubble (bottom-right) accessible from any tab
- Knows the user's current dataset, scores, active filters
- Answers questions about: fairness concepts, Indian law, fix strategies, statistical definitions
- Conversation history persists across tabs within session

#### Feature 26: Metric Explainer Chips
- Every number on screen has a clickable ⓘ chip
- Click → Gemini explains in 2–3 sentences what this metric means for *this specific dataset*
- Example: Click "0.73 Equalized Odds" → "This means your model correctly identifies qualified candidates at a 73% rate across gender groups. A score below 0.80 is generally considered concerning..."

#### Feature 27: LLM Prompt Scanner
- Paste any chatbot system prompt into the scanner
- Gemini analyzes for: role stereotypes, exclusionary language, demographic assumptions, harmful defaults
- Returns: Risk Level, Specific Issues Found, Rewritten Safe Version of the prompt

---

## Roadmap Features (Pitch Only — Do Not Build)

These are positioned as "Coming in v2" in the demo:

1. **CI/CD Bias Blocker** — GitHub Action that blocks pull requests if fairness score drops below threshold
2. **Live API Guardrails** — Middleware that intercepts model API responses and flags biased decisions in production
3. **Real-time Drift Alerts** — Slack/email webhook alerts when live model fairness degrades

---

## 30-Day Build Order

| Days | Focus |
|---|---|
| 1–5 | Setup: Vite scaffold, Firebase config, Gemini API key working, fake datasets created |
| 6–12 | Features 1–6 (entire Inspect category) |
| 13–19 | Features 7–12 + 13–15 (Measure + start Fix) |
| 20–24 | Features 16–27 + Copilot layer |
| 25–28 | Polish only — zero new features, accessibility, mobile responsiveness |
| 29–30 | Demo video, slide deck, final submission |

---

## API Keys & Services Needed

| Service | Purpose | Free Tier? |
|---|---|---|
| Google Gemini API | AI explanations, chat, Hindi, prompt scanner | ✅ Yes |
| Firebase Hosting | Deploy the app | ✅ Yes |
| Firebase Storage | Store uploaded datasets | ✅ Yes (5GB) |
| jsPDF | PDF export (npm package) | ✅ Free OSS |

---

## Metrics to Show Judges

- Processes datasets in < 3 seconds (client-side)
- Works with real datasets (include 3 pre-loaded examples)
- India-relevant: DPDP compliance, RBI guidelines, Hindi support, caste/state data
- Covers full lifecycle: Detect → Measure → Fix → Report
- Offline-capable for core features (except Gemini calls)

---

*FairLens — Built for Google Solution Challenge 2026*
*Problem Domain: Responsible & Unbiased AI*
