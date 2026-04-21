# FairLens — Step-by-Step Build Guide
### Google Solution Challenge 2026

---

## Before You Start — Install These Once

1. **Node.js** (v18+) → https://nodejs.org
2. **VS Code** → https://code.visualstudio.com
3. **Git** → https://git-scm.com
4. A **Google account** (for Gemini API key)

---

## PHASE 1 — Project Setup (Day 1–2)
### ~2 hours total

---

### Step 1: Create the React Project

Open your terminal and run:

```bash
npm create vite@latest fairlens -- --template react
cd fairlens
npm install
```

Then install all dependencies you'll need upfront:

```bash
npm install tailwindcss @tailwindcss/vite
npm install recharts
npm install lucide-react
npm install papaparse
npm install jspdf html2canvas
npm install @google/generative-ai
```

---

### Step 2: Configure Tailwind CSS

Open `vite.config.js` and replace with:

```js
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [react(), tailwindcss()],
})
```

Open `src/index.css` and replace everything with:

```css
@import "tailwindcss";

@import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700&family=Space+Mono:wght@400;700&family=JetBrains+Mono:wght@400;500&display=swap');

:root {
  --bg-base:        #0F172A;
  --bg-surface:     #1E293B;
  --bg-elevated:    #273548;
  --bg-overlay:     #334155;
  --indigo-400:     #818CF8;
  --indigo-500:     #4F46E5;
  --indigo-900:     #1E1B4B;
  --gemini-start:   #4285F4;
  --gemini-end:     #A855F7;
  --green-400:      #10B981;
  --green-900:      #064E3B;
  --amber-400:      #F59E0B;
  --amber-900:      #451A03;
  --red-400:        #FF4D4D;
  --red-900:        #2B0A0A;
  --text-primary:   #F8FAFC;
  --text-secondary: #94A3B8;
  --text-muted:     #475569;
  --border:         #334155;
}

* { box-sizing: border-box; margin: 0; padding: 0; }

body {
  background: var(--bg-base);
  color: var(--text-primary);
  font-family: 'Plus Jakarta Sans', sans-serif;
  font-size: 15px;
  line-height: 1.6;
}

.font-mono  { font-family: 'Space Mono', monospace; }
.font-code  { font-family: 'JetBrains Mono', monospace; }

.gemini-border {
  background:
    linear-gradient(var(--bg-surface), var(--bg-surface)) padding-box,
    linear-gradient(135deg, var(--gemini-start), var(--gemini-end)) border-box;
  border: 1px solid transparent;
}
```

---

### Step 3: Create the Folder Structure

Run these commands:

```bash
mkdir -p src/components/layout
mkdir -p src/components/inspect
mkdir -p src/components/measure
mkdir -p src/components/fix
mkdir -p src/components/report
mkdir -p src/components/copilot
mkdir -p src/lib
mkdir -p public/datasets
```

---

### Step 4: Add Your Datasets

Copy the 3 CSV files you downloaded into `public/datasets/`:

```
public/
  datasets/
    loan_dataset.csv       ← rename to loan.csv
    hr_dataset.csv         ← rename to hr.csv
    medical_dataset.csv    ← rename to medical.csv
```

---

### Step 5: Get Your Gemini API Key

1. Go to → https://aistudio.google.com/app/apikey
2. Click **"Create API Key"**
3. Copy the key

Create a `.env` file in your project root:

```
VITE_GEMINI_API_KEY=your_key_here
```

Create a `.gitignore` (if not already there) and make sure `.env` is in it:

```
node_modules
.env
dist
```

---

### Step 6: Create the Gemini Helper

Create `src/lib/gemini.js`:

```js
import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(import.meta.env.VITE_GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

export async function askGemini(prompt, language = "english") {
  const langNote = language === "hindi"
    ? "IMPORTANT: Respond entirely in Hindi language."
    : "";

  const result = await model.generateContent(`${langNote}\n\n${prompt}`);
  return result.response.text();
}

export async function explainBias(datasetSummary, biasType, language = "english") {
  const prompt = `
    You are an AI ethics expert. Given this dataset summary:
    ${datasetSummary}

    Explain in 3 simple sentences why ${biasType} is a problem here.
    Then give exactly 3 concrete action steps to fix it.
    Format as: EXPLANATION: ... | FIX1: ... | FIX2: ... | FIX3: ...
  `;
  return askGemini(prompt, language);
}

export async function explainMetric(metricName, value, context, language = "english") {
  const prompt = `
    You are an AI fairness expert. Explain what "${metricName}: ${value}" means
    in the context of: ${context}
    Keep it to 2-3 sentences. Use plain English, no jargon.
  `;
  return askGemini(prompt, language);
}

export async function remediationChat(userMessage, datasetContext, language = "english") {
  const prompt = `
    You are a helpful AI ethics assistant. The user is analyzing this dataset:
    ${datasetContext}

    User question: ${userMessage}

    Give a helpful, practical answer in 3-5 sentences.
  `;
  return askGemini(prompt, language);
}

export async function scanPromptForBias(systemPrompt, language = "english") {
  const prompt = `
    Analyze this AI system prompt for bias:
    "${systemPrompt}"

    Identify: 1) Risk level (Low/Medium/High), 2) Specific bias issues found,
    3) A rewritten safe version.
    Format: RISK: ... | ISSUES: ... | SAFE_VERSION: ...
  `;
  return askGemini(prompt, language);
}
```

---

### Step 7: Create the Dataset Presets Config

Create `src/lib/presets.js`:

```js
export const PRESETS = [
  {
    id: "loan",
    label: "Loan Dataset",
    emoji: "🏦",
    file: "/datasets/loan.csv",
    description: "Loan approvals — caste, gender & state bias (India)",
    outcomeColumn: "loan_approved",
    outcomePositive: "Approved",
    sensitiveColumns: ["Gender", "Caste_Category", "State", "Property_Area"],
    proxyColumns: ["Property_Area"],
    intersectionalRow: "Gender",
    intersectionalCol: "State",
    storyHint: "Discover bias against SC/ST applicants and women in Indian loan approvals",
    complianceContext: "This is a financial lending model in India — DPDP Act and RBI guidelines apply."
  },
  {
    id: "hr",
    label: "HR Dataset",
    emoji: "👔",
    file: "/datasets/hr.csv",
    description: "Job change prediction — gender & city bias",
    outcomeColumn: "looking_for_job_change",
    outcomePositive: "Yes",
    sensitiveColumns: ["gender", "education_level", "city_development_index"],
    proxyColumns: ["city_development_index", "city"],
    intersectionalRow: "gender",
    intersectionalCol: "education_level",
    storyHint: "Find out why female candidates are massively underrepresented in this HR pipeline",
    complianceContext: "This is an HR hiring/recruitment model — DPDP Act and equal opportunity laws apply."
  },
  {
    id: "medical",
    label: "Medical Dataset",
    emoji: "🏥",
    file: "/datasets/medical.csv",
    description: "Heart disease diagnosis — sex & age bias",
    outcomeColumn: "heart_disease",
    outcomePositive: "Yes",
    sensitiveColumns: ["sex", "age_group"],
    proxyColumns: ["thal", "cp"],
    intersectionalRow: "sex",
    intersectionalCol: "age_group",
    storyHint: "Explore whether heart disease is diagnosed equally across sexes and age groups",
    complianceContext: "This is a medical diagnostic model — patient safety and health equity regulations apply."
  }
];
```

---

### Step 8: Create the Bias Engine

Create `src/lib/biasEngine.js`:

```js
// ── Core bias calculation functions ──────────────────────────────────────────

// Calculate approval/positive outcome rate per group
export function groupOutcomeRates(df, groupCol, outcomeCol, outcomePositive) {
  const groups = {};
  df.forEach(row => {
    const g = row[groupCol] ?? "Unknown";
    if (!groups[g]) groups[g] = { total: 0, positive: 0 };
    groups[g].total++;
    if (row[outcomeCol] === outcomePositive) groups[g].positive++;
  });
  return Object.entries(groups).map(([group, { total, positive }]) => ({
    group,
    total,
    positive,
    rate: total > 0 ? (positive / total) : 0,
  }));
}

// Four-Fifths Rule (80% Rule)
export function fourFifthsRule(rates) {
  const best = Math.max(...rates.map(r => r.rate));
  return rates.map(r => ({
    ...r,
    ratio: best > 0 ? r.rate / best : 1,
    passes: best > 0 ? (r.rate / best) >= 0.8 : true,
  }));
}

// Overall fairness score (0–100)
export function fairnessScore(rates) {
  if (rates.length < 2) return 100;
  const rateVals = rates.map(r => r.rate);
  const maxRate = Math.max(...rateVals);
  const minRate = Math.min(...rateVals);
  const disparity = maxRate > 0 ? (maxRate - minRate) / maxRate : 0;
  // 0 disparity = 100, 100% disparity = 0
  return Math.round((1 - disparity) * 100);
}

// Intersectional matrix: row group × col group → outcome rate
export function intersectionalMatrix(df, rowCol, colCol, outcomeCol, outcomePositive) {
  const rows = [...new Set(df.map(r => r[rowCol]).filter(Boolean))];
  const cols = [...new Set(df.map(r => r[colCol]).filter(Boolean))];
  const matrix = {};
  rows.forEach(r => {
    matrix[r] = {};
    cols.forEach(c => {
      const subset = df.filter(row => row[rowCol] === r && row[colCol] === c);
      const positive = subset.filter(row => row[outcomeCol] === outcomePositive).length;
      matrix[r][c] = subset.length > 0 ? positive / subset.length : null;
    });
  });
  return { rows, cols, matrix };
}

// Profile flipper: change one attribute, return new predicted outcome
// (Uses simple majority outcome for that group as simulation)
export function simulateFlip(df, rowIndex, flipCol, flipValue, outcomeCol, outcomePositive) {
  const row = df[rowIndex];
  const originalOutcome = row[outcomeCol];
  // Find rows matching the flipped profile (same values except flipped col)
  const similar = df.filter(r =>
    r[flipCol] === flipValue &&
    Object.keys(row).every(k =>
      k === flipCol || k === outcomeCol || r[k] === row[k]
    )
  );
  // If no exact match, use all rows with that flip value
  const pool = similar.length > 5 ? similar
    : df.filter(r => r[flipCol] === flipValue);
  const positiveRate = pool.filter(r => r[outcomeCol] === outcomePositive).length / pool.length;
  const flippedOutcome = positiveRate >= 0.5 ? outcomePositive : "Not " + outcomePositive;
  return { originalOutcome, flippedOutcome, changed: originalOutcome !== flippedOutcome };
}

// Detect proxy columns (simple heuristics)
export function detectProxies(columns) {
  const proxyKeywords = [
    'zip', 'pin', 'postal', 'city', 'area', 'region', 'district',
    'college', 'school', 'university', 'neighborhood', 'property',
    'vehicle', 'income', 'development_index'
  ];
  return columns.filter(col =>
    proxyKeywords.some(kw => col.toLowerCase().includes(kw))
  );
}

// Bias drift: compare fairness scores across multiple dataset versions
export function biasDrift(scoreHistory) {
  return scoreHistory.map((s, i) => ({
    version: `v${i + 1}`,
    score: s,
    dropped: i > 0 && (scoreHistory[i - 1] - s) > 10
  }));
}

// Fairness grade (A–F) per group
export function fairnessGrade(rate, bestRate) {
  if (bestRate === 0) return 'A';
  const disparity = Math.abs(bestRate - rate) / bestRate * 100;
  if (disparity <= 5)  return 'A';
  if (disparity <= 10) return 'B';
  if (disparity <= 20) return 'C';
  if (disparity <= 30) return 'D';
  return 'F';
}
```

---

## PHASE 2 — Build the App Shell (Day 3–4)
### Build these files in order

---

### Step 9: App Shell Layout

Replace `src/App.jsx` with:

```jsx
import { useState } from "react";
import Topbar from "./components/layout/Topbar";
import Sidebar from "./components/layout/Sidebar";
import InspectTab from "./components/inspect/InspectTab";
import MeasureTab from "./components/measure/MeasureTab";
import FixTab from "./components/fix/FixTab";
import ReportTab from "./components/report/ReportTab";
import GeminiFAB from "./components/copilot/GeminiFAB";

export default function App() {
  const [activeTab, setActiveTab] = useState("inspect");
  const [dataset, setDataset]     = useState(null);   // parsed CSV rows []
  const [preset, setPreset]       = useState(null);   // active preset config
  const [language, setLanguage]   = useState("english");
  const [fairScore, setFairScore] = useState(null);

  const tabs = {
    inspect: <InspectTab dataset={dataset} setDataset={setDataset}
                          preset={preset} setPreset={setPreset}
                          language={language} />,
    measure: <MeasureTab dataset={dataset} preset={preset}
                          language={language} setFairScore={setFairScore} />,
    fix:     <FixTab dataset={dataset} preset={preset} language={language} />,
    report:  <ReportTab dataset={dataset} preset={preset}
                         language={language} fairScore={fairScore} />,
  };

  return (
    <div style={{ display:"flex", flexDirection:"column", minHeight:"100vh",
                  background:"var(--bg-base)" }}>
      <Topbar
        preset={preset}
        fairScore={fairScore}
        language={language}
        setLanguage={setLanguage}
      />
      <div style={{ display:"flex", flex:1, marginTop:56 }}>
        <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />
        <main style={{ flex:1, marginLeft:220, padding:32, overflowY:"auto" }}>
          {tabs[activeTab]}
        </main>
      </div>
      <GeminiFAB dataset={dataset} preset={preset}
                  activeTab={activeTab} language={language} />
    </div>
  );
}
```

---

### Step 10: Topbar Component

Create `src/components/layout/Topbar.jsx`:

```jsx
import { Globe, Download } from "lucide-react";

export default function Topbar({ preset, fairScore, language, setLanguage }) {
  const scoreColor = fairScore === null ? "var(--text-muted)"
    : fairScore >= 71 ? "var(--green-400)"
    : fairScore >= 41 ? "var(--amber-400)"
    : "var(--red-400)";

  return (
    <header style={{
      position:"fixed", top:0, left:0, right:0, height:56, zIndex:100,
      background:"var(--bg-surface)", borderBottom:"1px solid var(--border)",
      display:"flex", alignItems:"center", padding:"0 24px", gap:16
    }}>
      {/* Logo */}
      <span style={{ fontFamily:"Space Mono", fontWeight:700,
                     color:"var(--indigo-400)", fontSize:18, letterSpacing:"0.04em" }}>
        FAIR<span style={{
          display:"inline-block", width:14, height:14,
          border:"2px solid var(--indigo-400)", borderRadius:"50%",
          verticalAlign:"middle", margin:"0 1px"
        }}/>LENS
      </span>

      <div style={{ flex:1 }} />

      {/* Dataset name */}
      {preset && (
        <span style={{ fontSize:13, color:"var(--text-secondary)",
                       background:"var(--bg-elevated)", padding:"4px 12px",
                       borderRadius:20, border:"1px solid var(--border)" }}>
          {preset.emoji} {preset.label}
        </span>
      )}

      {/* Fairness score pill */}
      {fairScore !== null && (
        <span style={{ fontFamily:"Space Mono", fontSize:13,
                       color: scoreColor, background:"var(--bg-elevated)",
                       padding:"4px 12px", borderRadius:20,
                       border:`1px solid ${scoreColor}` }}>
          {fairScore}/100
        </span>
      )}

      {/* Language toggle */}
      <button
        onClick={() => setLanguage(l => l === "english" ? "hindi" : "english")}
        style={{ display:"flex", alignItems:"center", gap:6, fontSize:13,
                 color:"var(--text-secondary)", background:"var(--bg-elevated)",
                 border:"1px solid var(--border)", borderRadius:20,
                 padding:"4px 12px", cursor:"pointer" }}>
        <Globe size={14} />
        {language === "english" ? "हिंदी" : "English"}
      </button>
    </header>
  );
}
```

---

### Step 11: Sidebar Component

Create `src/components/layout/Sidebar.jsx`:

```jsx
import { ScanLine, Gauge, Wrench, ShieldCheck } from "lucide-react";

const TABS = [
  { id:"inspect", label:"Inspect",  icon: ScanLine,    desc:"Data X-Ray" },
  { id:"measure", label:"Measure",  icon: Gauge,       desc:"Quantify Bias" },
  { id:"fix",     label:"Fix",      icon: Wrench,      desc:"Remediation" },
  { id:"report",  label:"Report",   icon: ShieldCheck, desc:"Audit & Compliance" },
];

export default function Sidebar({ activeTab, setActiveTab }) {
  return (
    <aside style={{
      position:"fixed", left:0, top:56, bottom:0, width:220, zIndex:90,
      background:"var(--bg-surface)", borderRight:"1px solid var(--border)",
      padding:"16px 0"
    }}>
      {TABS.map(({ id, label, icon: Icon, desc }) => {
        const active = activeTab === id;
        return (
          <button key={id} onClick={() => setActiveTab(id)}
            style={{
              width:"100%", display:"flex", alignItems:"center", gap:12,
              padding:"12px 20px", border:"none", cursor:"pointer",
              background: active ? "var(--indigo-900)" : "transparent",
              borderLeft: active ? "3px solid var(--indigo-500)" : "3px solid transparent",
              transition:"all 150ms"
            }}>
            <Icon size={18} color={active ? "var(--indigo-400)" : "var(--text-secondary)"} />
            <div style={{ textAlign:"left" }}>
              <div style={{ fontSize:14, fontWeight:600,
                            color: active ? "var(--text-primary)" : "var(--text-secondary)" }}>
                {label}
              </div>
              <div style={{ fontSize:11, color:"var(--text-muted)" }}>{desc}</div>
            </div>
          </button>
        );
      })}
    </aside>
  );
}
```

---

## PHASE 3 — Build Tab by Tab (Day 5–20)
### Build in this exact order

---

### Step 12: Inspect Tab — Upload Zone

Create `src/components/inspect/InspectTab.jsx`:

```jsx
import { useState } from "react";
import Papa from "papaparse";
import { PRESETS } from "../../lib/presets";
import { detectProxies } from "../../lib/biasEngine";
import UploadZone from "./UploadZone";
import ColumnHeatmap from "./ColumnHeatmap";
import DemographicCharts from "./DemographicCharts";

export default function InspectTab({ dataset, setDataset, preset, setPreset, language }) {

  function loadPreset(p) {
    setPreset(p);
    Papa.parse(p.file, {
      download: true, header: true, skipEmptyLines: true,
      complete: ({ data }) => setDataset(data)
    });
  }

  function handleUpload(file) {
    Papa.parse(file, {
      header: true, skipEmptyLines: true,
      complete: ({ data, meta }) => {
        setDataset(data);
        // Auto-detect a basic preset for uploaded files
        const proxies = detectProxies(meta.fields);
        setPreset({
          id: "custom", label: file.name, emoji: "📁",
          outcomeColumn: meta.fields[meta.fields.length - 1],
          outcomePositive: null,
          sensitiveColumns: [],
          proxyColumns: proxies,
          intersectionalRow: null, intersectionalCol: null,
          storyHint: "Explore this dataset for potential bias.",
          complianceContext: "Custom dataset uploaded by user."
        });
      }
    });
  }

  return (
    <div style={{ display:"flex", flexDirection:"column", gap:24 }}>
      <h2 style={{ fontFamily:"Space Mono", fontSize:13, color:"var(--text-muted)",
                   letterSpacing:"0.1em", textTransform:"uppercase" }}>
        01 — Inspect / Data X-Ray
      </h2>

      {/* Upload zone or preset selector */}
      {!dataset ? (
        <>
          <UploadZone onUpload={handleUpload} />
          <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:16 }}>
            {PRESETS.map(p => (
              <button key={p.id} onClick={() => loadPreset(p)}
                style={{
                  padding:20, borderRadius:12, border:"1px solid var(--border)",
                  background:"var(--bg-surface)", cursor:"pointer", textAlign:"left",
                  transition:"all 200ms"
                }}
                onMouseEnter={e => e.currentTarget.style.borderColor = "var(--amber-400)"}
                onMouseLeave={e => e.currentTarget.style.borderColor = "var(--border)"}
              >
                <div style={{ fontSize:28, marginBottom:8 }}>{p.emoji}</div>
                <div style={{ fontWeight:600, marginBottom:4 }}>{p.label}</div>
                <div style={{ fontSize:13, color:"var(--text-secondary)" }}>{p.description}</div>
                <div style={{ marginTop:12, fontSize:12, color:"var(--amber-400)",
                               fontStyle:"italic" }}>"{p.storyHint}"</div>
              </button>
            ))}
          </div>
        </>
      ) : (
        <>
          {/* File chip */}
          <div style={{ display:"flex", alignItems:"center", gap:12,
                        padding:"10px 16px", background:"var(--bg-surface)",
                        borderRadius:8, border:"1px solid var(--green-400)",
                        width:"fit-content" }}>
            <span style={{ color:"var(--green-400)" }}>✓</span>
            <span style={{ fontFamily:"JetBrains Mono", fontSize:13 }}>
              {preset?.label}
            </span>
            <span style={{ fontSize:12, color:"var(--text-muted)" }}>
              · {dataset.length.toLocaleString()} rows
              · {Object.keys(dataset[0] || {}).length} columns
            </span>
            <button onClick={() => { setDataset(null); setPreset(null); }}
              style={{ marginLeft:8, fontSize:12, color:"var(--text-muted)",
                       background:"none", border:"none", cursor:"pointer" }}>
              ✕ change
            </button>
          </div>

          <ColumnHeatmap dataset={dataset} preset={preset} language={language} />
          <DemographicCharts dataset={dataset} preset={preset} />
        </>
      )}
    </div>
  );
}
```

---

### Step 13: Build Remaining Components — Order of Priority

Build components in this exact order (each one is a separate file):

```
WEEK 1 (Days 6–12): Inspect category
  src/components/inspect/UploadZone.jsx
  src/components/inspect/ColumnHeatmap.jsx       ← X-Ray scan animation here
  src/components/inspect/DemographicCharts.jsx

WEEK 2 (Days 13–16): Measure category
  src/components/measure/MeasureTab.jsx
  src/components/measure/FairnessGauge.jsx       ← Heartbeat animation here
  src/components/measure/ComparativeCharts.jsx
  src/components/measure/FourFifthsRule.jsx
  src/components/measure/GradeCards.jsx
  src/components/measure/IntersectionalMatrix.jsx
  src/components/measure/ProfileFlipper.jsx      ← 3D flip animation here

WEEK 2–3 (Days 17–20): Fix category
  src/components/fix/FixTab.jsx
  src/components/fix/FairnessSlider.jsx
  src/components/fix/PlainEnglishFixes.jsx
  src/components/fix/BeforeAfterView.jsx

WEEK 3 (Days 20–24): Report category
  src/components/report/ReportTab.jsx
  src/components/report/NutritionLabel.jsx
  src/components/report/ComplianceChecker.jsx
  src/components/report/BiasDriftMonitor.jsx

ALWAYS (build early, use everywhere):
  src/components/copilot/GeminiFAB.jsx           ← Gemini gradient bubble here
  src/components/copilot/ChatPanel.jsx
  src/components/copilot/ExplainerChip.jsx
```

---

## PHASE 4 — The 4 Signature Animations (Day 14–18)

These are the most important moments. Build each one carefully.

---

### Animation 1: Heatmap X-Ray Scan

In `ColumnHeatmap.jsx`, add this CSS animation:

```jsx
// Add to component state
const [revealed, setRevealed] = useState(false);
const [scanPos, setScanPos] = useState(0);

// Run on mount
useEffect(() => {
  let pos = 0;
  const interval = setInterval(() => {
    pos += 2;
    setScanPos(pos);
    if (pos >= 100) { clearInterval(interval); setRevealed(true); }
  }, 40); // 40ms × 50 steps = 2 seconds
  return () => clearInterval(interval);
}, []);

// In JSX: each chip gets animation-delay based on its index
// chipStyle: opacity 0 → 1 triggered by scan position
```

---

### Animation 2: Bias Heartbeat (Gauge)

In `FairnessGauge.jsx`:

```jsx
// Add to your CSS (in a <style> tag inside the component or globals.css)
const heartbeatCSS = `
@keyframes heartbeat {
  0%   { transform: scale(1);   opacity: 0.7; }
  100% { transform: scale(2.4); opacity: 0;   }
}
.ring-1 { animation: heartbeat 800ms ease-out 0ms infinite; }
.ring-2 { animation: heartbeat 800ms ease-out 300ms infinite; }
.ring-3 { animation: heartbeat 800ms ease-out 600ms infinite; }
`;

// In JSX: render 3 ring divs centered on the gauge when score < 50
{score < 50 && (
  <>
    <style>{heartbeatCSS}</style>
    {[1,2,3].map(i => (
      <div key={i} className={`ring-${i}`} style={{
        position:"absolute", inset:-20,
        border:"2px solid var(--red-400)",
        borderRadius:"50%", pointerEvents:"none"
      }} />
    ))}
  </>
)}
```

---

### Animation 3: Profile Flipper 3D

In `ProfileFlipper.jsx`:

```jsx
const flipCSS = `
.flip-container { perspective: 1000px; }
.flip-card {
  transform-style: preserve-3d;
  transition: transform 500ms ease-in-out;
  position: relative;
}
.flip-card.flipped { transform: rotateY(180deg); }
.flip-front, .flip-back {
  backface-visibility: hidden;
  position: absolute; inset: 0;
}
.flip-back { transform: rotateY(180deg); }
`;
```

---

### Animation 4: Gemini Gradient Border

In `ChatPanel.jsx` for AI message bubbles:

```jsx
// This CSS creates a gradient border without a visible background gap
const geminiMessageStyle = {
  background: `
    linear-gradient(var(--bg-elevated), var(--bg-elevated)) padding-box,
    linear-gradient(135deg, var(--gemini-start), var(--gemini-end)) border-box
  `,
  border: "1px solid transparent",
  borderRadius: 12,
  padding: "12px 16px",
  maxWidth: "80%",
  alignSelf: "flex-start"
};
```

---

## PHASE 5 — Polish & Demo Prep (Day 25–30)

---

### Step 14: Test With Each Dataset

For each dataset, verify:
- [ ] Upload loads correctly and chips appear
- [ ] Fairness gauge shows a score
- [ ] Comparative bar chart shows group differences
- [ ] Four-Fifths Rule shows at least 1 FAIL
- [ ] Profile Flipper flips a decision
- [ ] Gemini responds in English and Hindi
- [ ] Intersectional matrix renders

---

### Step 15: Deploy to Firebase Hosting

```bash
npm run build

npm install -g firebase-tools
firebase login
firebase init hosting
# → Select "dist" as public directory
# → Yes to single-page app

firebase deploy
```

You'll get a URL like: `https://fairlens-xxxxx.web.app`

---

### Step 16: Demo Script (2 minutes)

**Use this exact order for your demo:**

1. Open app → loan dataset loads by default
2. **Inspect tab** → point to the red columns (Caste_Category, Gender)
   - *"FairLens automatically flagged these as high-risk columns"*
3. **Measure tab** → gauge animates to ~65, heartbeat rings pulse
   - *"The bias heartbeat shows this model needs urgent attention"*
4. Comparative bar chart → show SC/ST approval rate vs General
5. Profile Flipper → flip Gender Female→Male, decision changes
   - *"The exact same applicant — only gender changed — gets a different decision"*
6. **Fix tab** → Gemini gives 3 plain English fixes
7. **Report tab** → show DPDP/RBI compliance violations
8. AI Nutrition Label → "This is the one-page report card for this model"
9. Toggle Hindi → Gemini responds in Hindi
   - *"Built for India — compliance in Hindi too"*

---

## Quick Reference — Key Commands

```bash
npm run dev          # Start dev server at localhost:5173
npm run build        # Build for production
firebase deploy      # Deploy to Firebase

# If you get errors:
npm install          # Re-install dependencies
rm -rf node_modules && npm install  # Nuclear option
```

---

## Common Mistakes to Avoid

| Mistake | Fix |
|---|---|
| API key exposed in code | Always use `import.meta.env.VITE_GEMINI_API_KEY` |
| CSV not loading | Check file is in `public/datasets/` not `src/` |
| Tailwind styles not applying | Make sure `@import "tailwindcss"` is in index.css |
| Gemini returns empty | Add error handling + show "Ask Gemini" retry button |
| Charts not rendering | Wrap Recharts in a div with explicit `width` and `height` |
| 3D flip not working | Ensure parent has `perspective: 1000px` set |

---

*FairLens Build Guide — Google Solution Challenge 2026*
*Total estimated build time: 25–28 active days*
