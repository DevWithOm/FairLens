# FairLens — Vibe Coding Prompt Directory
### One prompt per file. Copy → paste into Cursor / Bolt / Windsurf → done.
### Build in the numbered order. Each prompt is self-contained.

---

## HOW TO USE THIS

1. Open your AI code editor (Cursor, Bolt.new, Windsurf, v0)
2. Find the file you're building
3. Copy the entire prompt block
4. Paste it and say **"build this"**
5. Move to the next file

---

## SETUP FIRST (run in terminal, not AI)

```bash
npm create vite@latest fairlens -- --template react
cd fairlens
npm install
npm install tailwindcss @tailwindcss/vite recharts lucide-react papaparse jspdf html2canvas @google/generative-ai
```

Then add `.env` file:
```
VITE_GEMINI_API_KEY=your_key_here
```

---

# FILE 01 — vite.config.js

```
Build vite.config.js for a React + Vite project.
Import { defineConfig } from 'vite', react from '@vitejs/plugin-react', 
and tailwindcss from '@tailwindcss/vite'.
Export a config with both plugins: [react(), tailwindcss()].
```

---

# FILE 02 — src/index.css

```
Build a global CSS file for a dark-mode React app called FairLens.

Import tailwindcss. Import these Google Fonts:
Plus Jakarta Sans (weights 300,400,500,600,700), Space Mono (400,700), JetBrains Mono (400,500).

Define these CSS variables on :root:
--bg-base: #0F172A
--bg-surface: #1E293B
--bg-elevated: #273548
--bg-overlay: #334155
--indigo-400: #818CF8
--indigo-500: #4F46E5
--indigo-600: #3730A3
--indigo-900: #1E1B4B
--gemini-start: #4285F4
--gemini-end: #A855F7
--green-400: #10B981
--green-500: #059669
--green-900: #064E3B
--amber-400: #F59E0B
--amber-500: #D97706
--amber-900: #451A03
--red-400: #FF4D4D
--red-500: #E03333
--red-900: #2B0A0A
--text-primary: #F8FAFC
--text-secondary: #94A3B8
--text-muted: #475569
--border: #334155
--border-active: #4F46E5

Reset margin/padding/box-sizing on *.
Set body: background var(--bg-base), color var(--text-primary), 
font-family Plus Jakarta Sans, font-size 15px, line-height 1.6.

Add utility classes:
.font-mono { font-family: Space Mono, monospace }
.font-code { font-family: JetBrains Mono, monospace }

Add a .gemini-border class that creates a gradient border using the technique:
background: linear-gradient(var(--bg-surface), var(--bg-surface)) padding-box,
            linear-gradient(135deg, var(--gemini-start), var(--gemini-end)) border-box;
border: 1px solid transparent;

Add a @keyframes heartbeat animation:
0% { transform: scale(1); opacity: 0.7; }
100% { transform: scale(2.4); opacity: 0; }

Add a @keyframes scanline animation that moves from left 0% to left 100% over 2s.

Add a @keyframes fadeSlideIn:
0% { opacity: 0; transform: translateY(8px); }
100% { opacity: 1; transform: translateY(0); }
```

---

# FILE 03 — src/lib/presets.js

```
Build a presets.js config file for a React app called FairLens (AI bias detection tool).

Export a const PRESETS array with 3 objects:

1. Loan Dataset (id: "loan", emoji: "🏦"):
   file: "/datasets/loan.csv"
   description: "Loan approvals — caste, gender & state bias (India)"
   outcomeColumn: "loan_approved"
   outcomePositive: "Approved"
   sensitiveColumns: ["Gender", "Caste_Category", "State", "Property_Area"]
   proxyColumns: ["Property_Area"]
   intersectionalRow: "Gender"
   intersectionalCol: "State"
   storyHint: "Discover bias against SC/ST applicants and women in Indian loan approvals"
   complianceContext: "Financial lending model in India — DPDP Act and RBI guidelines apply."

2. HR Dataset (id: "hr", emoji: "👔"):
   file: "/datasets/hr.csv"
   description: "Job change prediction — gender & city bias"
   outcomeColumn: "looking_for_job_change"
   outcomePositive: "Yes"
   sensitiveColumns: ["gender", "education_level", "city_development_index"]
   proxyColumns: ["city_development_index", "city"]
   intersectionalRow: "gender"
   intersectionalCol: "education_level"
   storyHint: "Find out why female candidates are massively underrepresented"
   complianceContext: "HR hiring model — DPDP Act and equal opportunity laws apply."

3. Medical Dataset (id: "medical", emoji: "🏥"):
   file: "/datasets/medical.csv"
   description: "Heart disease diagnosis — sex & age bias"
   outcomeColumn: "heart_disease"
   outcomePositive: "Yes"
   sensitiveColumns: ["sex", "age_group"]
   proxyColumns: ["thal", "cp"]
   intersectionalRow: "sex"
   intersectionalCol: "age_group"
   storyHint: "Explore whether heart disease is diagnosed equally across sexes"
   complianceContext: "Medical diagnostic model — health equity regulations apply."
```

---

# FILE 04 — src/lib/gemini.js

```
Build gemini.js for a React app using @google/generative-ai.

Import GoogleGenerativeAI. Initialize with import.meta.env.VITE_GEMINI_API_KEY.
Use model "gemini-2.0-flash".

Export these async functions:

1. askGemini(prompt, language="english")
   If language is "hindi", prepend "IMPORTANT: Respond entirely in Hindi language.\n\n" to prompt.
   Call model.generateContent and return result.response.text().
   Wrap in try/catch, return "Unable to get AI response." on error.

2. explainBias(columnName, biasType, datasetName, language="english")
   Prompt: "You are an AI ethics expert analyzing the {datasetName} dataset.
   The column '{columnName}' shows {biasType} bias. 
   Explain in 2 simple sentences why this is a problem.
   Then give exactly 3 concrete action steps to fix it.
   Format response as JSON: { explanation: string, fixes: [string, string, string] }"
   Parse and return JSON, fallback to raw text on parse error.

3. explainMetric(metricName, value, context, language="english")
   Prompt: "Explain what '{metricName}: {value}' means in context of: {context}
   Keep it to 2 sentences. Plain English, no jargon."
   Return text.

4. remediationChat(userMessage, datasetContext, chatHistory=[], language="english")
   Build messages array from chatHistory (role/content pairs).
   Prompt: "You are a helpful AI ethics assistant. Dataset context: {datasetContext}
   Answer this question helpfully in 3-5 sentences: {userMessage}"
   Return text.

5. scanPromptForBias(systemPrompt, language="english")
   Prompt: "Analyze this AI system prompt for bias: '{systemPrompt}'
   Return JSON: { riskLevel: 'Low'|'Medium'|'High', issues: string[], safeVersion: string }"
   Parse and return JSON.

6. generateComplianceReport(datasetSummary, language="english")
   Prompt: "Given this AI model summary: {datasetSummary}
   Check compliance against India DPDP Act 2023, RBI Algorithmic Fairness Guidelines, EU AI Act.
   Return JSON array of { law: string, clause: string, status: 'Compliant'|'Partial'|'Violation', explanation: string }"
   Parse and return JSON array.
```

---

# FILE 05 — src/lib/biasEngine.js

```
Build biasEngine.js — pure JavaScript functions for calculating AI bias metrics. No imports needed.

Export these functions:

1. groupOutcomeRates(data, groupCol, outcomeCol, outcomePositive)
   Groups rows by groupCol value. For each group calculates:
   { group, total, positive (count matching outcomePositive), rate (positive/total) }
   Returns sorted array, highest rate first.

2. fourFifthsRule(rates)
   Takes output of groupOutcomeRates.
   Finds best rate. For each group adds: ratio (rate/bestRate), passes (ratio >= 0.8).
   Returns updated array.

3. fairnessScore(rates)
   If less than 2 groups return 100.
   Calculate disparity = (maxRate - minRate) / maxRate.
   Return Math.round((1 - disparity) * 100). Clamp 0-100.

4. fairnessGrade(rate, bestRate)
   disparity = abs(bestRate - rate) / bestRate * 100
   <=5 → 'A', <=10 → 'B', <=20 → 'C', <=30 → 'D', else → 'F'

5. intersectionalMatrix(data, rowCol, colCol, outcomeCol, outcomePositive)
   Get unique rows values and cols values.
   For each row×col combination calculate approval rate.
   Return { rows: [], cols: [], matrix: { rowVal: { colVal: rate|null } } }

6. simulateProfileFlip(data, row, flipCol, newValue, outcomeCol, outcomePositive)
   Find all rows in data where flipCol === newValue.
   Calculate their positive outcome rate.
   Return { originalOutcome: row[outcomeCol], simulatedOutcome: (rate>=0.5 ? outcomePositive : 'Rejected'), changed: boolean, confidence: rate }

7. detectProxyColumns(columns)
   Check each column name against keywords: zip, pin, postal, city, area, region, 
   district, college, school, university, neighborhood, property, vehicle, development_index.
   Return array of matched column names.

8. columnRiskLevel(colName, sensitiveColumns, proxyColumns)
   If colName in sensitiveColumns return 'high'.
   If colName in proxyColumns return 'proxy'.
   Return 'low'.

9. demographicImbalance(data, groupCol)
   Count each group. Find max count. 
   Flag groups where count/total < 0.10 as underrepresented.
   Return { groups: [{name, count, percentage, underrepresented}], hasImbalance: boolean }
```

---

# FILE 06 — src/App.jsx

```
Build App.jsx for FairLens — an AI bias detection React app.

State: activeTab (default "inspect"), dataset (null), preset (null), 
language ("english"), fairScore (null).

Import and render:
- Topbar (fixed top, passes preset, fairScore, language, setLanguage)
- Sidebar (fixed left 220px below topbar, passes activeTab, setActiveTab)
- Main content area (margin-left 220px, margin-top 56px, padding 32px)
  - Render the active tab component based on activeTab state
  - Tabs: "inspect" → InspectTab, "measure" → MeasureTab, 
          "fix" → FixTab, "report" → ReportTab
  - Pass dataset, setDataset, preset, setPreset, language, setFairScore as props to all tabs
- GeminiFAB (fixed bottom-right, always visible)

All layout uses inline styles with CSS variables from index.css.
Background: var(--bg-base). No Tailwind classes needed.
```

---

# FILE 07 — src/components/layout/Topbar.jsx

```
Build Topbar.jsx for FairLens.

Fixed header, height 56px, top 0, full width, z-index 100.
Background var(--bg-surface), border-bottom 1px solid var(--border).
Display flex, align-items center, padding 0 24px, gap 16px.

Left side: Logo text "FAIR◉LENS" 
  - Font: Space Mono 700, color var(--indigo-400), font-size 18px
  - The ◉ symbol is a real inline div: width 14px, height 14px, 
    border 2px solid var(--indigo-400), border-radius 50%, 
    display inline-block, vertical-align middle, margin 0 2px

Center: flex:1 spacer

Right side (flex row, gap 12px):
1. If preset exists: show a pill with preset.emoji + preset.label
   Style: font-size 13px, color var(--text-secondary), bg var(--bg-elevated),
   padding 4px 12px, border-radius 20px, border 1px solid var(--border)

2. If fairScore not null: show "[score]/100" pill
   Color based on score: ≥71 var(--green-400), 41-70 var(--amber-400), <41 var(--red-400)
   Font: Space Mono, same pill style but border matches color

3. Language toggle button: shows "हिंदी" if current is english, "English" if hindi
   Uses Globe icon from lucide-react (14px)
   On click: toggle language between "english" and "hindi"
   Style: same pill style as above

Props: preset, fairScore, language, setLanguage
```

---

# FILE 08 — src/components/layout/Sidebar.jsx

```
Build Sidebar.jsx for FairLens.

Fixed left sidebar, width 220px, top 56px, bottom 0, z-index 90.
Background var(--bg-surface), border-right 1px solid var(--border), padding 16px 0.

Four navigation items using these Lucide icons:
- "inspect"  → ScanLine icon  → label "Inspect"  → sublabel "Data X-Ray"
- "measure"  → Gauge icon     → label "Measure"  → sublabel "Quantify Bias"  
- "fix"      → Wrench icon    → label "Fix"       → sublabel "Remediation"
- "report"   → ShieldCheck icon → label "Report" → sublabel "Audit & Compliance"

Each item:
- Full width button, height 44px, padding 12px 20px
- Display flex, align-items center, gap 12px
- No button border/background by default
- Active state: border-left 3px solid var(--indigo-500), bg var(--indigo-900)
- Inactive state: border-left 3px solid transparent, bg transparent
- Hover: bg var(--bg-elevated), transition 150ms
- Icon: 18px, color var(--indigo-400) if active else var(--text-secondary)
- Label: 14px font-weight 600, primary color if active else secondary
- Sublabel: 11px, color var(--text-muted)
- Cursor pointer

Props: activeTab (string), setActiveTab (function)
```

---

# FILE 09 — src/components/inspect/UploadZone.jsx

```
Build UploadZone.jsx for FairLens.

A drag-and-drop file upload zone component.

Visual design:
- Dashed border 2px, border-color var(--border), border-radius 12px
- Background var(--bg-surface), padding 48px, text-align center
- Min-height 200px, display flex flex-col align-items center justify-center gap 12px
- On drag-over: border-color var(--indigo-500), bg var(--indigo-900), 
  box-shadow 0 0 24px rgba(79,70,229,0.3), transition all 200ms

Content:
- UploadCloud icon from lucide-react, 40px, color var(--indigo-400)
- H3: "Upload Dataset" - Plus Jakarta Sans 600, 18px
- P: "Drop your CSV or JSON here" - color var(--text-secondary), 14px
- P: "or" - muted
- A styled "browse files" button (looks like a link, indigo color)
- P: "Supports .csv and .json · Max 50MB" - 12px, muted

Functionality:
- Handle onDragOver, onDragLeave, onDrop events
- Track isDragging state for visual feedback
- Hidden file input (accept .csv,.json)
- On file drop or select: call props.onUpload(file)
- Show error if file is wrong type

Props: onUpload (function called with File object)
```

---

# FILE 10 — src/components/inspect/ColumnHeatmap.jsx

```
Build ColumnHeatmap.jsx for FairLens — the signature X-Ray scan component.

Props: dataset (array of row objects), preset (config object), language (string)

Functionality:
- Get column names from Object.keys(dataset[0])
- For each column determine risk level using these rules:
  - If column is in preset.sensitiveColumns → "high" (red)
  - If column is in preset.proxyColumns → "proxy" (amber)  
  - Else → "low" (green)
- Track selectedColumn state (null by default)
- Track scanProgress state (0 to 100, animates on mount)
- Track revealedCount state (how many chips are visible)

X-Ray scan animation on mount:
- Use useEffect. Over 2000ms, increment scanProgress from 0 to 100 using setInterval every 40ms.
- As scanProgress increases, reveal chips: revealedCount = Math.floor((scanProgress/100) * totalColumns)
- Show a horizontal scan-line div that moves left to right based on scanProgress.
  Style: position absolute, height 2px, background linear-gradient(90deg, transparent, #06B6D4, transparent),
  width 60px, transition left 40ms, opacity 0.6, pointer-events none

Section header: "Column Risk Heatmap" with a small "SCANNING..." badge that disappears after scan

Chip grid (flex-wrap, gap 8px):
Each chip (only render up to revealedCount):
- Height 36px, padding 0 12px, border-radius 20px, cursor pointer
- Display flex, align-items center, gap 8px
- HIGH risk: bg var(--red-900), border 1px solid var(--red-400)
- PROXY risk: bg var(--amber-900), border 1px solid var(--amber-400)  
- LOW risk: bg var(--green-900), border 1px solid var(--green-400)
- Left dot: 8px circle, color matches risk level
- Column name: font-size 13px
- Small badge top-right showing bias type: "SENSITIVE" / "PROXY" / "CLEAN"
- On click: set selectedColumn to this column (or null to deselect)
- Selected state: box-shadow 0 0 0 2px white

Detail panel (shows when selectedColumn is set):
- Slides in from right (or shows below on mobile)
- Background var(--bg-surface), border var(--border), border-radius 12px, padding 24px
- Shows: column name (large), risk badge, sample values from dataset
- A GeminiExplainer component (simple: button that says "Explain this column" 
  which calls askGemini and shows the result)
- "Ignore this column" toggle button

Import { askGemini } from '../../lib/gemini'
```

---

# FILE 11 — src/components/inspect/DemographicCharts.jsx

```
Build DemographicCharts.jsx for FairLens.

Props: dataset (array), preset (config object)

For each column in preset.sensitiveColumns:
- Count occurrences of each unique value in that column
- If any group is < 10% of total: show a red warning banner
  "⚠ Demographic Imbalance Detected in [column]"
  Style: bg var(--red-900), border var(--red-400), border-radius 8px, padding 12px 16px

Render a section with:
- Title "Demographic Distribution" in Space Mono style
- Grid of cards (2 columns), one card per sensitive column

Each card:
- Background var(--bg-surface), border 1px solid var(--border), border-radius 12px, padding 20px
- Title: column name, 13px Space Mono uppercase
- A Recharts PieChart (200px) showing the distribution
  - Use COLORS array: ["#4F46E5","#10B981","#F59E0B","#FF4D4D","#06B6D4","#8B5CF6"]
  - Custom tooltip showing group name + count + percentage
- Below the chart: list of groups with their counts and a small colored bar

Import PieChart, Pie, Cell, Tooltip, ResponsiveContainer from recharts
```

---

# FILE 12 — src/components/measure/MeasureTab.jsx

```
Build MeasureTab.jsx for FairLens.

Props: dataset, preset, language, setFairScore

On mount or when dataset/preset changes:
- Calculate groupOutcomeRates for the first sensitiveColumn
- Calculate fairnessScore from those rates
- Call setFairScore with the result

State: activeGroupCol (default: preset.sensitiveColumns[0] if exists)
A dropdown/selector to switch which sensitive column to analyze.

Layout (CSS grid):
Row 1: 3 columns
  - FairnessGauge (passes score)
  - FourFifthsRule (passes rates with fourFifthsRule applied)
  - GradeCards (passes rates)

Row 2: 2 columns (60% / 40%)  
  - ComparativeCharts (passes rates)
  - AttributeFilter (column selector, passes activeGroupCol and setter)

Row 3: full width
  - IntersectionalMatrix

Row 4: full width
  - ProfileFlipper

Import all these components from their respective files.
Import { groupOutcomeRates, fourFifthsRule, fairnessScore, intersectionalMatrix } from biasEngine.
```

---

# FILE 13 — src/components/measure/FairnessGauge.jsx

```
Build FairnessGauge.jsx — the signature heartbeat gauge for FairLens.

Props: score (number 0-100, can be null)

Visual: SVG semi-circle gauge, 260px × 160px
- Background arc: stroke var(--bg-elevated), strokeWidth 14, strokeLinecap round
- Arc is 270 degrees, starting at 7 o'clock (225° offset)
- Colored arc: animated from 0 to score over 1500ms on mount/score change
  Use a useState animatedScore starting at 0, useEffect with requestAnimationFrame
  easing: cubic-bezier style — ease out
- Arc color: score >= 71 → var(--green-400), 41-70 → var(--amber-400), <41 → var(--red-400)
- 12 tick marks around the arc, small dots, color var(--border)

Center content (absolute positioned inside container):
- Score number: Space Mono 700 48px, color matches arc
- "/ 100" below: Space Mono 18px, var(--text-muted)
- Status label below: "EXCELLENT" / "FAIR" / "NEEDS WORK" / "CRITICAL"
  Plus Jakarta Sans 12px, var(--text-secondary)

Bias Heartbeat (when score < 50):
- 3 absolutely positioned divs, centered on gauge
- Each: border 2px solid var(--red-400), border-radius 50%, position absolute
- Animation: heartbeat keyframe (defined in index.css)
  ring 1: animation-delay 0ms
  ring 2: animation-delay 300ms  
  ring 3: animation-delay 600ms
- animation: heartbeat 800ms ease-out infinite

Card wrapper: bg var(--bg-surface), border 1px solid var(--border), 
border-radius 12px, padding 24px, display flex, flex-direction column, align-items center, gap 16px
Title: "Fairness Score" in Space Mono 12px uppercase muted
```

---

# FILE 14 — src/components/measure/ComparativeCharts.jsx

```
Build ComparativeCharts.jsx for FairLens.

Props: rates (array of {group, total, positive, rate}), outcomeLabel (string)

Render a Recharts BarChart:
- ResponsiveContainer width 100% height 280px
- BarChart data is rates array, margin {top:20, right:20, bottom:40, left:20}
- XAxis: dataKey "group", tick color var(--text-secondary) fontSize 12, angle -30 textAnchor end
- YAxis: tickFormatter (v => (v*100).toFixed(0)+'%'), tick color var(--text-secondary) fontSize 12
- CartesianGrid: strokeDasharray "3 3", stroke var(--border), opacity 0.5, horizontal only
- Bar dataKey "rate" radius={[4,4,0,0]}
  Each bar gets a custom fill color:
  - The group with the LOWEST rate → var(--red-400)
  - The group with the HIGHEST rate → var(--green-400)
  - Others → var(--indigo-500)
  Use Cell from recharts for per-bar colors
- Custom Tooltip: dark bg var(--bg-overlay), shows group name, rate as %, 
  and "Four-Fifths ratio: X.XX" compared to best

Above the chart:
- Title "Outcome Rate by Group" Space Mono 12px uppercase
- A small legend: lowest group label in red, highest in green

Labels above lowest bar: "▼ LOWEST" in red
Labels above highest bar: "▲ BEST" in green
Use LabelList from recharts or custom label

Card wrapper: bg var(--bg-surface), border var(--border), border-radius 12px, padding 24px
```

---

# FILE 15 — src/components/measure/FourFifthsRule.jsx

```
Build FourFifthsRule.jsx for FairLens.

Props: rates (array with ratio and passes fields from fourFifthsRule function)

Title section: "Four-Fifths Rule (80% Rule)" Space Mono 12px uppercase
Subtitle: "Legal fairness threshold — EEOC standard" 13px muted

For each rate, render a row:
- Group name (left, 14px, font-weight 500)
- Ratio as percentage: (rate.ratio * 100).toFixed(1) + "%" (Space Mono, color coded)
- Progress bar: width = rate.ratio * 100%, 
  color: passes → var(--green-400), fails → var(--red-400)
  Height 6px, border-radius 3px, bg var(--bg-elevated) as track
- PASS/FAIL stamp on the right:
  PASS: bg var(--green-900), color var(--green-400), border var(--green-400)
  FAIL: bg var(--red-900), color var(--red-400), border var(--red-400)
  Font: Space Mono 11px bold, padding 2px 8px, border-radius 4px

Bottom info box:
"Groups below 80% of the best-performing group's rate fail this check."
bg var(--bg-elevated), border-radius 8px, padding 10px, font-size 12px, color var(--text-muted)

Card wrapper: bg var(--bg-surface), border var(--border), border-radius 12px, padding 24px, gap 16px
```

---

# FILE 16 — src/components/measure/GradeCards.jsx

```
Build GradeCards.jsx for FairLens.

Props: rates (array of {group, rate}), fairnessGrade function (import from biasEngine)

Find the best (highest) rate to calculate grades.

Render a row of cards, one per group, with staggered animation:
Each card animates in: opacity 0→1, transform scale(0.85)→scale(1)
animation-delay: index * 100ms

Each card:
- Width approx 100px, padding 16px 12px, border-radius 12px, text-align center
- Border 1px solid (color by grade), background (tint by grade):
  A/B: border var(--green-400), bg var(--green-900)
  C:   border var(--amber-400), bg var(--amber-900)
  D/F: border var(--red-400),   bg var(--red-900)
- Grade letter: Space Mono 700 64px, color by grade
- Group name: Plus Jakarta Sans 500 13px, var(--text-primary), margin-top 4px
- Disparity stat: "±X%" in Space Mono 12px, var(--text-muted)
  disparity = abs(bestRate - rate) / bestRate * 100

Hover effect: translateY(-4px), box-shadow, transition 200ms

Section title above cards: "Fairness Grades by Group" Space Mono 12px uppercase
Brief legend: A=≤5% gap, B=≤10%, C=≤20%, D=≤30%, F=>30% — 11px muted

Card wrapper: bg var(--bg-surface), border var(--border), border-radius 12px, padding 24px
```

---

# FILE 17 — src/components/measure/IntersectionalMatrix.jsx

```
Build IntersectionalMatrix.jsx for FairLens.

Props: data (array), preset (config), outcomePositive (string)

Calculate intersectionalMatrix using preset.intersectionalRow and preset.intersectionalCol.
Import intersectionalMatrix from biasEngine.

Render a 2D grid table:
- First row: header cells for each column group value
- Each subsequent row: row group value label + cells for each intersection

Each cell:
- Width/height approx 60px × 44px
- Background color: interpolate between var(--red-400) and var(--green-400) based on rate
  rate 0 → red, rate 0.5 → amber, rate 1 → green
  Use a helper: rateToColor(rate) that returns an rgba color
- Text: (rate * 100).toFixed(0) + "%" in white, Space Mono 11px, text-align center
- If rate is null: show "—" in muted color, bg var(--bg-elevated)
- Hover: scale(1.05), show tooltip with exact count and rate

Row/col headers: Plus Jakarta Sans 12px, var(--text-secondary), font-weight 600, padding 8px

Title: "Intersectional Bias Matrix" with subtitle showing the two dimensions
Export button (top right): small button with Download icon that saves the table as PNG using html2canvas

Card wrapper: bg var(--bg-surface), border var(--border), border-radius 12px, padding 24px, overflow-x auto
```

---

# FILE 18 — src/components/measure/ProfileFlipper.jsx

```
Build ProfileFlipper.jsx — the 3D card flip signature component for FairLens.

Props: data (array), preset (config)

State: 
- selectedRowIndex (default 0)
- flipCol (default preset.sensitiveColumns[0])
- flipValue (string, default "")
- flipResult (null or {originalOutcome, simulatedOutcome, changed, confidence})
- isFlipped (boolean for animation)

Add this CSS via a <style> tag in the component:
.flip-container { perspective: 1200px; }
.flip-card-inner {
  transform-style: preserve-3d;
  transition: transform 500ms ease-in-out;
  position: relative; width: 100%; height: 100%;
}
.flip-card-inner.flipped { transform: rotateY(180deg); }
.flip-front, .flip-back {
  backface-visibility: hidden; position: absolute; inset: 0;
  border-radius: 12px; padding: 20px;
}
.flip-back { transform: rotateY(180deg); }

Layout:
Top controls row:
- Row selector: "Select row #" with a number input (0 to data.length-1)
- Column to flip: dropdown of preset.sensitiveColumns
- New value: dropdown of unique values for the selected column in data

Two side-by-side cards (each 45% width, the flipper in the middle):
Left card "ORIGINAL PROFILE":
- Shows selected row's data: Gender, key attributes, and outcome
- Outcome badge: if Approved/Yes → green "✓ APPROVED", else red "✗ REJECTED"

Right card "FLIPPED PROFILE" (this card has the 3D flip):
- Same data but with flipCol changed to flipValue
- flip-container wrapper div, inside: flip-card-inner div with .flipped class when isFlipped
- Front face: shows "Click FLIP to simulate" placeholder
- Back face: shows the simulated outcome with same badge style

Center: animated arrow (→) between cards, pulsing when result shows change

"FLIP IT" button:
- On click: call simulateProfileFlip from biasEngine, set flipResult, set isFlipped true
- Style: bg var(--indigo-500), color white, padding 12px 24px, border-radius 8px, font-weight 600

If flipResult.changed === true:
- Show alert banner below: bg var(--red-900), border var(--red-400), border-radius 8px, padding 12px
- Text: "⚠ Decision changed — possible [flipCol] bias detected"
- A "Get Gemini Explanation" button that calls explainBias and shows result in accordion

If flipResult.changed === false:
- Green banner: "✓ Decision unchanged for this profile"
```

---

# FILE 19 — src/components/fix/FixTab.jsx

```
Build FixTab.jsx for FairLens.

Props: dataset, preset, language

State: fixSuggestions (null), isLoading (false), beforeScore (null), afterScore (null)

On mount: if dataset and preset exist, calculate beforeScore using fairnessScore from biasEngine.
Set beforeScore. Set afterScore to beforeScore + 15 (simulated improvement) as a demo.

Layout (flex column, gap 32px):

Section header: "03 — Fix / Remediation" Space Mono uppercase muted

1. FairnessSlider component (full width)

2. Two column row (50/50):
   - PlainEnglishFixes (left) — passes preset, language
   - BeforeAfterView (right) — passes beforeScore, afterScore

3. AutoMitigation component (full width)

4. Section title "Human Review Queue" + TriageQueue component (full width)
```

---

# FILE 20 — src/components/fix/PlainEnglishFixes.jsx

```
Build PlainEnglishFixes.jsx for FairLens.

Props: preset (config), language (string)

State: fixes (array of {column, biasType, explanation, fixes:[3 strings]}), isLoading, error

On mount: for each of preset.sensitiveColumns (max 3):
- Call explainBias(column, "selection/demographic", preset.label, language) from gemini.js
- Parse response and add to fixes array
- Show loading skeleton while fetching

Render:
Title: "Plain English Fix Suggestions" Space Mono 12px uppercase
Subtitle: "3 action steps per detected bias" muted 13px

For each fix item:
Card: bg var(--bg-surface), border var(--border), border-radius 10px, padding 20px, gap 12px

  Header row: 
  - Column name badge (colored by risk: red for sensitive, amber for proxy)
  - Bias type label

  Explanation text: 14px, var(--text-secondary), line-height 1.6
  Has a Gemini gradient left border (3px, gradient from gemini-start to gemini-end)

  3 numbered action steps:
  Each step: flex row, number badge (bg var(--indigo-900), color var(--indigo-400), 
  20px circle, Space Mono 11px) + step text (14px)
  
  "Copy checklist" button at bottom: copies all 3 steps to clipboard, shows "Copied!" feedback

Loading state: 3 skeleton cards with shimmer animation
Error state: "Could not generate fixes. Check API key." in red
```

---

# FILE 21 — src/components/fix/BeforeAfterView.jsx

```
Build BeforeAfterView.jsx for FairLens.

Props: beforeScore (number), afterScore (number)

Render two gauges side by side with an arrow between them.
Title: "Before / After Fix Simulation" Space Mono 12px uppercase

Left gauge: "BEFORE" label, shows beforeScore
Right gauge: "AFTER" label, shows afterScore
Center: large → arrow, color var(--green-400)

Each gauge is a simplified mini version (150px):
- Just the arc + number, no heartbeat animation
- Same color coding as FairnessGauge

Below gauges: improvement stat
"+[afterScore - beforeScore] points improvement (simulated)"
Color var(--green-400), Space Mono, 18px, text-align center

Disclaimer: "* Scores are simulated based on removing high-risk columns"
12px, var(--text-muted), italic

Card wrapper: bg var(--bg-surface), border var(--border), border-radius 12px, padding 24px
```

---

# FILE 22 — src/components/fix/FairnessSlider.jsx

```
Build FairnessSlider.jsx for FairLens.

Props: language (string)

State: sliderValue (50), geminiExplanation (""), isLoading (false)

A horizontal slider from 0 to 100:
- Left label: "⚖ Max Fairness" color var(--green-400) 13px
- Right label: "🎯 Max Accuracy" color var(--indigo-400) 13px  
- Slider input type range: full width, styled with CSS
  - Track: var(--bg-elevated), height 8px, border-radius 4px
  - Thumb: 20px circle, var(--indigo-500), cursor grab
  - Filled portion (left of thumb): var(--indigo-500) using background gradient trick

Below slider: 3 metric pills showing simulated values based on sliderValue:
- "Fairness: [100 - sliderValue/2]%" pill in green
- "Precision: [50 + sliderValue/4]%" pill in indigo  
- "F1 Score: [60 + sliderValue/5]%" pill in amber
(these are simplified simulations, not real calculations)

At sliderValue near 50: show a "⭐ Ethical Sweet Spot" marker below the slider

A "Ethical Sweet Spot" marker: small label that appears when sliderValue is between 45-55
bg var(--amber-900), color var(--amber-400), border var(--amber-400), 
padding 4px 10px, border-radius 20px, font-size 12px

When slider changes (debounced 800ms): 
Call askGemini with prompt about the ethical implications of this fairness/accuracy position.
Show the response below with Gemini gradient border.

Card wrapper title: "Fairness-Accuracy Trade-off" Space Mono 12px uppercase
```

---

# FILE 23 — src/components/report/ReportTab.jsx

```
Build ReportTab.jsx for FairLens.

Props: dataset, preset, language, fairScore

Layout:
Section header: "04 — Report / Audit & Compliance" Space Mono uppercase muted

Row 1 (CSS grid, 38% / 62%):
  - NutritionLabel component (left)
  - ComplianceChecker component (right)

Row 2 (CSS grid, 68% / 32%):
  - BiasDriftMonitor component (left, shows simulated drift over 5 versions)
  - ExportPanel component (right)

Row 3 (full width):
  - PromptScanner component

Pass relevant props to each child.
```

---

# FILE 24 — src/components/report/NutritionLabel.jsx

```
Build NutritionLabel.jsx for FairLens — styled like a real food nutrition label.

Props: preset, fairScore, dataset

This component intentionally uses WHITE background and BLACK text (contrast moment in dark UI).

Outer container: bg white, color #000, border-radius 12px, padding 0, overflow hidden, 
max-width 360px, font-family Plus Jakarta Sans

Structure:
1. Top thick bar: bg #000, color white, text "AI Nutrition Label" 
   font-weight 800, font-size 18px, text-align center, padding 10px

2. Content area: padding 16px, display flex flex-col gap 0

Each row: display flex, justify-content space-between, align-items center
border-bottom 1px solid #ddd, padding 8px 0

Rows to show:
- "MODEL PURPOSE" (bold 10px uppercase) | preset.description
- "DATASET" | preset.label  
- "TOTAL RECORDS" | dataset?.length.toLocaleString() rows
- "SENSITIVE COLUMNS" | preset.sensitiveColumns.join(", ")
- "KNOWN BIASES" | preset.sensitiveColumns.slice(0,2).join(" (HIGH), ") + " (HIGH)"
- "FAIRNESS SCORE" | [fairScore]/100 (bold, color based on score)
- "RISK LEVEL" row: label + a filled progress bar (width: riskPercent%, bg #000, h 8px)
  riskLevel: fairScore>=71 → "LOW", >=41 → "MEDIUM", else → "HIGH"
  riskPercent: HIGH=80, MEDIUM=50, LOW=20
- "RECOMMENDED FOR" | fairScore>=71 ? "Production use" : "Internal audit only"
- "COMPLIANCE" | "DPDP 2023 · RBI · EU AI Act"

Bottom thick bar: bg #000, 4px height

Below the white card:
"Download as PNG" button: bg var(--indigo-500), color white, border-radius 8px, padding 8px 16px
Uses html2canvas to screenshot the white card and download it
```

---

# FILE 25 — src/components/report/ComplianceChecker.jsx

```
Build ComplianceChecker.jsx for FairLens.

Props: preset, fairScore, language

State: complianceData (null), isLoading, expandedItem (null)

On mount: call generateComplianceReport from gemini.js with a summary of preset + fairScore.
If API fails, use this hardcoded fallback data:
[
  {law:"India DPDP Act 2023", clause:"Data Minimization", status:"Compliant", explanation:"Dataset fields are relevant to the lending decision."},
  {law:"India DPDP Act 2023", clause:"Purpose Limitation", status:"Partial", explanation:"Model purpose not clearly documented in metadata."},
  {law:"India DPDP Act 2023", clause:"Right to Explanation", status:"Violation", explanation:"No mechanism exists for applicants to understand why they were rejected."},
  {law:"RBI Guidelines", clause:"Algorithmic Fairness", status:"Violation", explanation:"Gender and caste show statistically significant outcome disparities."},
  {law:"RBI Guidelines", clause:"Model Transparency", status:"Partial", explanation:"Model documentation exists but doesn't cover fairness metrics."},
  {law:"EU AI Act", clause:"High-Risk AI System", status:"Compliant", explanation:"System is classified as high-risk and human oversight is planned."},
  {law:"EU AI Act", clause:"Accuracy & Robustness", status:"Partial", explanation:"Fairness testing performed but not across all demographic intersections."}
]

Group by law into 3 accordion sections (India DPDP, RBI, EU AI Act).

Each section header:
- Country/org emoji + law name (font-weight 600)
- "[X/Y PASS]" summary pill: green if all pass, amber if mixed, red if any violation
- Expand/collapse arrow
- Border-bottom var(--border)

Each clause row (when section expanded):
- Status icon: ✅ Compliant (green), ⚠️ Partial (amber), ❌ Violation (red)
- Clause name (14px, font-weight 500)
- Status badge (small, colored bg)
- Hover: bg var(--bg-elevated), cursor pointer
- On click: expand explanation with Gemini gradient left border
  Show explanation text + "Ask Gemini how to fix this" button

Loading state: skeleton rows
```

---

# FILE 26 — src/components/report/BiasDriftMonitor.jsx

```
Build BiasDriftMonitor.jsx for FairLens.

Props: currentScore (fairScore)

Generate simulated historical data (5 versions):
const driftData = [
  { version: "v1 (Jan)", score: 78 },
  { version: "v2 (Feb)", score: 74 },
  { version: "v3 (Mar)", score: 68 },
  { version: "v4 (Apr)", score: 61 },
  { version: "v5 (Current)", score: currentScore || 64 },
]

Render a Recharts LineChart:
- ResponsiveContainer width 100% height 220px
- Line dataKey "score", stroke var(--indigo-400), strokeWidth 2, dot with custom render:
  - Dot color: score>=71 → green, 41-70 → amber, <41 → red
  - Dot size: 6px radius
- XAxis: dataKey "version", tick 12px var(--text-secondary)
- YAxis: domain [0,100], tick 12px var(--text-secondary)
- CartesianGrid: var(--border) horizontal lines only
- ReferenceLine at y=70: stroke var(--amber-400), strokeDasharray "4 4", 
  label "Fair threshold" at right, 11px amber color
- Custom tooltip: dark bg, shows version + score + status label

If any consecutive drop > 10 points: show a red alert banner above chart
"⚠ Significant fairness drop detected between [v3] and [v4]"

Title: "Bias Drift Monitor" Space Mono 12px uppercase
Subtitle: "Fairness score trend across model versions" 13px muted

Card wrapper: bg var(--bg-surface), border var(--border), border-radius 12px, padding 24px
```

---

# FILE 27 — src/components/report/PromptScanner.jsx

```
Build PromptScanner.jsx for FairLens — LLM Prompt Scanner.

Props: language (string)

State: inputPrompt (""), scanResult (null), isLoading (false)

Default example prompt already in the textarea:
"You are a loan officer assistant. Help evaluate applications from working men 
who are the primary breadwinners. Focus on stable employment history."

Layout:
Title: "LLM Prompt Scanner" Space Mono 12px uppercase
Subtitle: "Paste any AI system prompt to scan for hidden bias" 13px muted

Textarea:
- Width 100%, min-height 120px
- Font: JetBrains Mono 13px
- Background var(--bg-elevated), color var(--text-primary)
- Border 1px solid var(--border), border-radius 8px, padding 12px
- Focus: border-color var(--indigo-500), outline none

"Scan for Bias" button:
- bg var(--indigo-500), color white, padding 10px 20px, border-radius 8px
- On click: call scanPromptForBias from gemini.js, set scanResult
- Loading state: "Scanning..." with spinner

Results section (when scanResult exists):
Row 1: Risk level badge (large)
  LOW: bg var(--green-900) border var(--green-400) color var(--green-400)
  MEDIUM: bg var(--amber-900) border var(--amber-400)
  HIGH: bg var(--red-900) border var(--red-400)
  Text: Space Mono 700, "HIGH RISK" etc.

Row 2: Issues found (list)
  Each issue: small red dot + text, 13px

Row 3: Safe rewritten version
  Title: "✓ Suggested Safe Version" color var(--green-400)
  The safe prompt in a read-only textarea (JetBrains Mono)
  "Copy safe version" button

Card wrapper: bg var(--bg-surface), border var(--border), border-radius 12px, padding 24px, gap 16px
```

---

# FILE 28 — src/components/copilot/GeminiFAB.jsx

```
Build GeminiFAB.jsx — the Gemini Ethics Copilot floating action button and chat panel.

Props: dataset, preset, activeTab, language

State: isOpen (false), messages ([]), inputText (""), isLoading (false)

FAB Button (always visible, fixed bottom-right):
- Position fixed, bottom 24px, right 24px, z-index 200
- Width 52px, height 52px, border-radius 50%
- Background: linear-gradient(135deg, var(--gemini-start), var(--gemini-end))
- BrainCircuit icon from lucide-react, 22px, white
- box-shadow: 0 4px 20px rgba(66,133,244,0.4)
- Hover: scale(1.05), transition 200ms
- Pulsing ring: pseudo-element or extra div that slowly pulses the gradient border
- On click: toggle isOpen

Chat Panel (visible when isOpen):
- Fixed, bottom 88px, right 24px, width 380px, height 520px, z-index 199
- Background var(--bg-surface), border 1px solid var(--border), border-radius 16px
- Display flex, flex-direction column, overflow hidden
- Slide up animation when opening: translateY(20px)→translateY(0), opacity 0→1, 200ms

Panel Header:
- Background var(--bg-elevated), padding 16px, border-bottom var(--border)
- Left: "GEMINI ETHICS COPILOT" Space Mono 11px muted + BrainCircuit icon 14px
- Below: context pill showing "Analyzing: [preset?.label ?? 'no dataset'] · [activeTab] tab"
  bg var(--bg-base), font-size 11px, padding 2px 8px, border-radius 10px
- Right: language indicator + close button (X icon)

Messages area (flex: 1, overflow-y auto, padding 16px, gap 12px):
Initial message from Gemini: "Hi! I'm your Ethics Copilot. I can see you're working with 
[preset?.label]. Ask me anything about bias, fairness metrics, or how to fix what I see."

User messages: 
- Align-self flex-end, bg var(--indigo-900), border 1px solid var(--indigo-500)
- border-radius 12px 12px 2px 12px, padding 10px 14px, max-width 80%
- Font-size 14px

Gemini messages (use the gradient border technique):
- background: linear-gradient(var(--bg-elevated), var(--bg-elevated)) padding-box,
              linear-gradient(135deg, var(--gemini-start), var(--gemini-end)) border-box;
- border: 1px solid transparent
- border-radius 2px 12px 12px 12px, padding 10px 14px, max-width 85%
- Font-size 14px, render markdown bold with <strong> parsing

Typing indicator (3 dots) when isLoading: gradient colored dots, stagger fade animation

Input area:
- Border-top var(--border), padding 12px
- Flex row: textarea (flex:1) + send button
- Textarea: JetBrains Mono 13px, bg var(--bg-elevated), border var(--border), border-radius 8px, 
  padding 8px, resize none, rows 1, focus border var(--indigo-500)
- Send button: bg var(--indigo-500), color white, padding 8px 12px, border-radius 6px
- On submit: add user message, call remediationChat from gemini.js with full chat history,
  add Gemini response

Suggested quick prompts (show when messages.length <= 1):
3 small clickable chips:
- "What's the biggest bias in my data?"
- "How do I fix gender bias?"  
- "What does this fairness score mean?"
On click: auto-fill and submit
```

---

# FILE 29 — src/components/copilot/ExplainerChip.jsx

```
Build ExplainerChip.jsx — the ⓘ explainer chip for FairLens.
This small component goes next to any metric number.

Props: metricName (string), value (string|number), context (string), language (string)

State: isOpen (false), explanation (""), isLoading (false)

Render:
A small inline button: 
- 18px circle, border-radius 50%
- Default: color var(--text-muted), border 1px solid var(--text-muted), bg transparent
- Hover: background gradient(135deg, var(--gemini-start), var(--gemini-end)), 
  color white, border-color transparent
- Content: "ⓘ" symbol, font-size 11px, cursor pointer
- Transition: all 200ms

When clicked: 
- toggle isOpen
- If first open: call explainMetric(metricName, value, context, language) from gemini.js
- Set explanation from result

Popover (when isOpen):
- Position absolute (or relative with z-index), min-width 240px, max-width 300px
- Background var(--bg-overlay), border-radius 10px, padding 14px
- Border-top: 3px solid, using gradient (use box-shadow trick or just var(--indigo-500))
- Box-shadow: 0 8px 32px rgba(0,0,0,0.4)
- Explanation text: 13px, var(--text-secondary), line-height 1.6
- Loading: "Asking Gemini..." with ellipsis animation
- Small close button top-right

Usage example:
<ExplainerChip metricName="Four-Fifths Ratio" value="0.67" 
  context="loan approval rates between Male and Female applicants" 
  language={language} />
```

---

# FILE 30 — src/components/report/ExportPanel.jsx

```
Build ExportPanel.jsx for FairLens — PDF export.

Props: preset, fairScore, dataset

A simple card with export options.

Title: "Export & Share" Space Mono 12px uppercase

Description: "Download a compliance-ready audit certificate" 13px muted

"Download Audit PDF" button:
- Large, full width, bg var(--indigo-500), color white
- ShieldCheck icon + "Download Audit Certificate" text
- On click: call generatePDF function

generatePDF function using jspdf and html2canvas:
1. Create a new jsPDF instance (a4, portrait)
2. Add header: "FairLens Audit Certificate" in large bold text
3. Add date: new Date().toLocaleDateString()
4. Add dataset name: preset.label
5. Add fairness score (large, colored text)
6. Add list of sensitive columns found
7. Add compliance summary (DPDP/RBI/EU)
8. Add footer: "Generated by FairLens · Google Solution Challenge 2026"
9. Save as "fairlens-audit-[preset.id]-[date].pdf"

Also show:
"Share Score" button: copies a text summary to clipboard
Text: "FairLens Audit: [preset.label] scored [fairScore]/100 on fairness. 
[X] bias issues detected. Generated [date]."

"Copy Report Link" button (shows copied! feedback)

Card wrapper: bg var(--bg-surface), border var(--border), border-radius 12px, padding 24px, gap 16px
```

---

# FINAL FILE — src/components/fix/AutoMitigation.jsx

```
Build AutoMitigation.jsx for FairLens — Auto Mitigation Simulator.

Props: dataset, preset, fairScore

Two technique cards side by side:

Card 1: "Reweighing"
- Description: "Adjusts sample weights to balance group representation in training data"
- Simulated new score: fairScore + 12 (capped at 100)
- Progress: show old score → new score with animated bar
- Status badge: "SIMULATED" in amber

Card 2: "Threshold Adjustment"  
- Description: "Applies different decision thresholds per demographic group"
- Simulated new score: fairScore + 18 (capped at 100)
- Progress: show old score → new score with animated bar  
- Status badge: "SIMULATED" in amber

Each card:
- bg var(--bg-elevated), border var(--border), border-radius 10px, padding 20px
- Technique name: font-weight 600, 15px
- Improvement stat: "+[n] points" in green, Space Mono
- A mini before/after arc (just a simple CSS arc visual, not full SVG)

Below both cards:
Disclaimer box: bg var(--bg-elevated), border-left 3px solid var(--amber-400), padding 12px
"⚠ These are outcome-level simulations only. Actual improvement requires model retraining."
Font-size 12px, var(--text-muted)

Section title: "Auto-Mitigation Simulator" Space Mono 12px uppercase
```

---

## AFTER ALL FILES ARE BUILT

Run this in terminal:
```bash
npm run dev
```

Open http://localhost:5173 — your app should be running.

---

## DEPLOY

```bash
npm run build
npm install -g firebase-tools
firebase login
firebase init hosting   # choose dist/, yes to SPA
firebase deploy
```

---

*FairLens Vibe Coding Prompts — Google Solution Challenge 2026*
*30 files · Build in order · Each prompt is self-contained*
