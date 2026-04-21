# FairLens — UI & Design Specification (Final Merged)
### Google Solution Challenge 2026 · Frontend Design Document
### v2.0 — Merged from FairLens Design System + Reviewer Suggestions

---

## Design Philosophy

**Concept: "The Ethical Operating Room meets Precision Analytics Terminal"**

FairLens occupies a unique visual space: it feels like **precision diagnostic equipment** — not a startup dashboard, not a generic analytics tool. The aesthetic combines clinical dark-mode professionalism with a Gemini-powered AI layer that glows with unmistakable Google identity.

When a compliance officer opens FairLens, they trust it instantly. When a developer uses it, they feel the weight of their model's decisions. When a judge sees the demo, they remember it.

**The three visual languages running in parallel:**
1. **Base UI** — Deep slate dark mode, surgical precision, generous negative space
2. **Data Layer** — Monospace numbers, color-coded semantic indicators, instrument-grade readouts
3. **Gemini AI Layer** — Google Blue→Purple gradient distinguishes every AI-generated element

**The 4 unforgettable demo moments:**
1. 🫀 **Bias Heartbeat** — 3 concentric red shockwave rings expand from the gauge when bias score < 50
2. 🃏 **Profile Flipper 3D** — Card rotates on the Y-axis (CSS 3D flip) when an attribute changes
3. 📡 **Heatmap X-Ray Scan** — Columns reveal left-to-right like an actual X-ray scanning (2 seconds)
4. 💬 **Gemini Gradient Bubble** — Every AI response has a blue-to-purple shimmer border, visually distinct from all other UI

---

## Color System (Final)

```css
:root {
  /* ─── Base Backgrounds (Deep Slate, not pure black) ─── */
  --bg-base:        #0F172A;   /* Main background — Deep Slate */
  --bg-surface:     #1E293B;   /* Card / panel surface */
  --bg-elevated:    #273548;   /* Hover state, active panels */
  --bg-overlay:     #334155;   /* Modals, drawers, tooltips */

  /* ─── Primary Accent — Indigo ─── */
  --indigo-400:     #818CF8;   /* Hover state */
  --indigo-500:     #4F46E5;   /* Primary buttons, active tabs, neutral charts */
  --indigo-600:     #3730A3;   /* Pressed state */
  --indigo-900:     #1E1B4B;   /* Indigo tint backgrounds */

  /* ─── Gemini AI Layer — Google Gradient ─── */
  --gemini-start:   #4285F4;   /* Google Blue */
  --gemini-end:     #A855F7;   /* Purple */
  --gemini-gradient: linear-gradient(135deg, #4285F4, #A855F7);
  /* Use on: Gemini bubbles, FAB button, explainer chip hover, AI borders */

  /* ─── Semantic: Fair ─── */
  --green-400:      #10B981;   /* Emerald — pass, high score, mitigated */
  --green-500:      #059669;
  --green-900:      #064E3B;

  /* ─── Semantic: Warning / Proxy ─── */
  --amber-400:      #F59E0B;   /* Amber — proxy flag, borderline */
  --amber-500:      #D97706;
  --amber-900:      #451A03;

  /* ─── Semantic: Biased / Danger ─── */
  --red-400:        #FF4D4D;   /* Vivid red — critical bias, failures */
  --red-500:        #E03333;
  --red-900:        #2B0A0A;

  /* ─── Text ─── */
  --text-primary:   #F8FAFC;   /* Off-white */
  --text-secondary: #94A3B8;   /* Slate — subtext, labels */
  --text-muted:     #475569;   /* Disabled, placeholder */

  /* ─── Data Ink ─── */
  --data-readout:   #10B981;   /* Live score numbers */
  --data-warning:   #F59E0B;   /* Borderline numbers */
  --data-critical:  #FF4D4D;   /* Critical numbers */

  /* ─── Borders ─── */
  --border:         #334155;   /* 1px dividers */
  --border-active:  #4F46E5;   /* Focused state */
}
```

### Color Usage Rules

| Element | Color |
|---|---|
| Primary CTA buttons | `--indigo-500` |
| Active sidebar tab | `--indigo-500` left border + `--indigo-900` bg |
| Gemini chat bubble border | `--gemini-gradient` |
| Gemini FAB button | `--gemini-gradient` background |
| Explainer chips (ⓘ) hover | `--gemini-gradient` background |
| Fairness score ≥ 71 | `--green-400` arc + number |
| Fairness score 41–70 | `--amber-400` arc + number |
| Fairness score ≤ 40 | `--red-400` arc + heartbeat |
| Column: high risk | `--red-400` border + `--red-900` bg |
| Column: proxy/medium | `--amber-400` border + `--amber-900` bg |
| Column: clean | `--green-400` border + `--green-900` bg |

---

## Typography (Final)

```css
@import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700&family=Space+Mono:wght@400;700&family=JetBrains+Mono:wght@400;500&display=swap');

--font-ui:      'Plus Jakarta Sans', sans-serif;
/* Headings, body, labels, buttons, navigation */
/* More distinctive than Inter; cleaner than Roboto */

--font-data:    'Space Mono', monospace;
/* Fairness scores, grade letters, percentages, metric values */
/* Creates "precision instrument" feel */

--font-code:    'JetBrains Mono', monospace;
/* CSV/JSON preview tables, LLM Prompt Scanner, API output */
/* Optimized for data/code legibility */

/* Scale */
--text-xs:    11px;   /* Badges, chips, timestamps */
--text-sm:    13px;   /* Table cells, tooltips */
--text-base:  15px;   /* Body copy */
--text-lg:    18px;   /* Card titles */
--text-xl:    22px;   /* Section headings */
--text-2xl:   28px;   /* Tab headings */
--text-3xl:   36px;   /* Gauge (mobile) */
--text-4xl:   48px;   /* Gauge (desktop) */
--text-grade: 72px;   /* Grade letter cards */

/* Rules */
/* Scores, percentages, grades  → Space Mono */
/* CSV/JSON cells, code output  → JetBrains Mono */
/* Everything else              → Plus Jakarta Sans */
/* Score readouts: letter-spacing: 0.04em */
/* Body: line-height: 1.6 */
/* Headings: letter-spacing: -0.02em */
```

---

## Layout Architecture

### App Shell

```
┌──────────────────────────────────────────────────────────────┐
│  TOPBAR (56px fixed)                                         │
│  FAIR◉LENS  │  loan_v2.csv ▾  │  64/100 ●  │  हिंदी  Export │
├─────────────┬────────────────────────────────────────────────┤
│             │                                                │
│  SIDEBAR    │   MAIN CANVAS                                  │
│  (220px     │   (scrollable, padding: 32px, CSS Grid)        │
│   fixed)    │                                                │
│             │                                                │
│  ● Inspect  │                                                │
│  ○ Measure  │                                                │
│  ○ Fix      │                                                │
│  ○ Report   │                                                │
│  ─────────  │                                                │
│  ○ Copilot  │                                                │
│             │                                                │
└─────────────┴────────────────────────────────────────────────┘
                                         ┌──────────────────┐
                                         │  GEMINI COPILOT  │
                                         │  380×520px FAB   │
                                         └──────────────────┘
```

### Sidebar
- Fixed, 220px, `bg: --bg-surface`, `border-right: 1px solid --border`
- Item height: 44px, `icon (18px Lucide) + label (Plus Jakarta Sans, 14px)`
- Active: `border-left: 3px solid --indigo-500` + `bg: --indigo-900`
- Alert badge: 8px red dot on icon when issues detected
- Hover: `bg: --bg-elevated`, 150ms transition
- Mobile (< 640px): collapses to fixed bottom tab bar, 64px tall

### Topbar
- Fixed, 56px, `bg: --bg-surface`, `border-bottom: 1px solid --border`
- Logo: `FAIR◉LENS` — Plus Jakarta Sans 700, `--indigo-400`, the `◉` CSS-drawn circle
- Center: dataset dropdown pill (filename + row count)
- Right: `[हिंदी 🌐]` → `[Score pill]` → `[Export PDF]` → `[Chat FAB]`

---

## Component Specifications

### 1. Upload Zone (Feature 1)

```
┌─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─┐
│                                           │
│       ⬆  Upload Dataset                  │
│                                           │
│   Drop your CSV or JSON here              │
│   or  [browse files]                      │
│                                           │
│   Supports .csv and .json · Max 50MB      │
│                                           │
└─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─┘
```

- Default: `border: 2px dashed --border`, `bg: --bg-surface`
- Drag-over: `border-color: --indigo-500`, `bg: --indigo-900`, indigo glow
- Success: flashes green → collapses (300ms spring) → compact file chip
- File chip: `filename.csv · 45,210 rows · 12 columns ✓`
- Preview table below: JetBrains Mono 12px, 20 rows/page
  - Header: `--indigo-900` bg, `--indigo-400` text
  - Alternating rows: `--bg-surface` / `--bg-elevated`

### 2. Column Heatmap (Feature 4) — X-Ray Scan

**Signature X-Ray Reveal:**
- On dataset load: cyan scan-line sweeps left→right across full width (2s, `opacity: 0.4`)
- Column chips appear with 40ms stagger, left-to-right
- After scan: all chips settle to final color state
- Effect: exactly like medical X-ray equipment analyzing the data

**Chip design:**
- Shape: rounded pill, `height: 36px`, `padding: 0 12px`
- Content: `● column_name` (left dot 8px + Plus Jakarta Sans 13px)
- Micro-badge top-right: `HISTORICAL` / `PROXY` / `SELECTION` (9px caps)

| State | Background | Border |
|---|---|---|
| High risk | `--red-900` | `1px solid --red-400` |
| Proxy/medium | `--amber-900` | `1px solid --amber-400` |
| Clean | `--green-900` | `1px solid --green-400` |

- Click → right panel slides in (360px):
  - Bias type badge + risk score (Space Mono 48px)
  - Gemini explanation (gradient left-border accent)
  - "Ignore column" toggle + correlation bar

### 3. Fairness Score Gauge (Feature 7) — Bias Heartbeat

```
         ╭───────────────────╮
        ╱   ·  ·  ·  ·  ·    ╲     ← 12 tick marks
       │        64             │
       │      ─────            │    ← Space Mono 48px
       │      / 100            │    ← Space Mono 18px muted
       │    NEEDS WORK         │
        ╲                    ╱
         ╰───────────────────╯
              ↑ heartbeat rings ↑   ← when score < 50
```

- SVG semi-circle, 270° sweep, 260px diameter
- Arc fill: animated 0 → score in 1500ms `cubic-bezier(0.25,0.1,0.25,1)`
- Fill color: Red (0–40) → Amber (41–70) → Green (71–100)
- Score counter: animates up from 0 alongside arc

**Bias Heartbeat (score < 50):**
```css
@keyframes heartbeat-ring {
  0%   { transform: scale(1);   opacity: 0.8; }
  100% { transform: scale(2.2); opacity: 0;   }
}
/* 3 rings · delays: 0ms, 300ms, 600ms */
/* color: --red-400 · border: 2px solid */
/* repeats every 8s while score stays < 50 */
```

### 4. Comparative Bar Charts (Feature 8)

- Library: Recharts `BarChart`, rounded bar tops `radius: [4,4,0,0]`
- Colors: indigo / green / amber / red / teal per group
- Worst group: always `--red-400` + `▼ LOWEST` label
- Best group: `--green-400` + `▲ BEST` label
- Hover tooltip: `bg: --bg-overlay`, group name + rate % + Four-Fifths ratio + Gemini one-liner
- Title: Space Mono 12px, `--text-secondary`, ALL CAPS

### 5. Profile Flipper (Feature 10) — 3D Card Flip

```
  BEFORE                      AFTER (Flipped)
  ┌─────────────────┐         ┌─────────────────┐
  │  Priya Sharma   │   ───▶  │  Arjun Sharma   │
  │  Age: 28        │         │  Age: 28        │
  │  Income: 45k    │         │  Income: 45k    │
  │  ╔═══════════╗  │         │  ╔═══════════╗  │
  │  ║ ❌ DENIED ║  │         │  ║ ✅ APPROVED║  │
  │  ╚═══════════╝  │         │  ╚═══════════╝  │
  └─────────────────┘         └─────────────────┘
```

**3D Flip CSS:**
```css
.flipper-card {
  transform-style: preserve-3d;
  transition: transform 500ms ease-in-out;
  perspective: 1000px;
}
.flipper-card.flipped { transform: rotateY(180deg); }
```

- Decision changes → red alert banner slides down
- Decision same → green banner "No flip bias detected"
- Gemini explanation accordion below banner (gradient left border)

### 6. Intersectional Bias Matrix (Feature 11)

- 2D heatmap: Gender rows × State columns
- Cell bg: gradient `--red-400 → --amber-400 → --green-400` by approval rate
- Cell content: approval % in Space Mono 11px (white text always)
- Hover: cell lifts (scale 1.05), tooltip with sample size + drill-down
- Export as PNG (top-right button)

### 7. AI Nutrition Label (Feature 19)

```
┌──────────────────────────────────────────────┐
│ ████████████████  AI Nutrition Label  ███████│
│                                              │
│  MODEL PURPOSE                               │
│  Loan approval scoring — HDFC demo           │
│  ────────────────────────────────────────    │
│  TRAINING DATA                               │
│  45,210 records · 2019–2023                  │
│  ────────────────────────────────────────    │
│  OVERALL FAIRNESS SCORE     64 / 100         │
│  ────────────────────────────────────────    │
│  KNOWN BIASES    Gender (HIGH) · State (MED) │
│  ────────────────────────────────────────    │
│  RISK LEVEL      ██████████░░  MEDIUM        │
│  ────────────────────────────────────────    │
│  RECOMMENDED USE  Internal audit only        │
└──────────────────────────────────────────────┘
```

- **White background** — intentional contrast moment against the dark UI
- Black text, thick `6px solid #000` top/bottom borders
- Labels: Plus Jakarta Sans 700, 10px, ALL CAPS
- Values: Plus Jakarta Sans 400, 14px
- Score: Space Mono 700, 20px
- "Download as PNG" button below card

### 8. Gemini Chat Panel (Features 17, 25)

**FAB Button:**
- 52px circle, `background: --gemini-gradient`
- Icon: `BrainCircuit` 22px, white
- Pulsing gradient ring every 4s

**Panel:**
- 380×520px, `bg: --bg-surface`, `border-radius: 16px`
- Header: `GEMINI ETHICS COPILOT` (Space Mono 12px) + context pill
- Context pill: "Analyzing: loan_v2.csv · Inspect tab" — live per active tab
- Language toggle: `[EN]` / `[हिंदी]`

**Bubbles:**
- User: right-aligned, `bg: --indigo-900`, `border: 1px solid --indigo-500`
- Gemini: left-aligned, **gradient border technique:**
  ```css
  background: linear-gradient(var(--bg-elevated), var(--bg-elevated)) padding-box,
              var(--gemini-gradient) border-box;
  border: 1px solid transparent;
  ```
- Typing indicator: 3 gradient-colored dots, stagger animation

### 9. Compliance Checker (Feature 20)

```
┌──────────────────────────────────────────────────────┐
│  🇮🇳  India DPDP Act 2023              [2 / 5 PASS]  │
├──────────────────────────────────────────────────────┤
│  ✅  Data minimization               COMPLIANT        │
│  ✅  Consent mechanism               COMPLIANT        │
│  ⚠️  Purpose limitation               PARTIAL         │
│  ❌  Right to correction             VIOLATION        │
│  ❌  Grievance mechanism             VIOLATION        │
└──────────────────────────────────────────────────────┘
```

- Three accordion sections: DPDP · RBI Guidelines · EU AI Act
- Status badges: green / amber / red backgrounds
- Click VIOLATION row → Gemini explanation (gradient left border)
- Row hover: `bg: --bg-elevated`

### 10. Fairness Grade Cards (Feature 23)

```
  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐
  │    A     │  │    C     │  │    F     │  │    B     │
  │   Male   │  │  Female  │  │  Rural   │  │  Urban   │
  │  2% gap  │  │ 14% gap  │  │ 38% gap  │  │  8% gap  │
  └──────────┘  └──────────┘  └──────────┘  └──────────┘
```

- Letter: Space Mono 700, 72px
- Group: Plus Jakarta Sans 500, 14px
- Gap stat: Space Mono 400, 12px, `--text-secondary`
- Card bg: green (A/B) / amber (C) / red (D/F)
- Stagger animate: scale 0.85→1.0, delays 0/100/200/300ms
- Hover: `translateY(-4px)`, deeper shadow

### 11. Metric Explainer Chips (Feature 26)

- Every metric has an `ⓘ` chip (16px circle, top-right corner)
- Default: `--text-muted`
- Hover: `background: --gemini-gradient`, white icon
- Click → 240px popover with gradient top border
- Visually signals: *"every number here is explainable by AI"*

---

## Motion & Animation Specifications (Final)

| Moment | Animation | Duration | Easing |
|---|---|---|---|
| App load | Staggered fade+slide panels | 600ms | ease-out, 80ms stagger |
| Heatmap X-Ray scan | Scan-line + chip reveal | 2000ms | linear scan / 40ms chip stagger |
| Gauge fill | Arc draw 0 → score | 1500ms | cubic-bezier(0.25,0.1,0.25,1) |
| Bias heartbeat (< 50) | 3 concentric ring pulses | 3× 800ms | ease-out, repeat every 8s |
| Profile flip | CSS 3D rotateY(180deg) | 500ms | ease-in-out |
| Alert banner | Slide down + fade | 250ms | ease-out |
| Chat panel | Slide up from bottom-right | 300ms | ease-out |
| Grade cards | Scale 0.85→1.0 stagger | 400ms each | spring |
| Tab switch | Crossfade + slight translateY | 200ms | ease |
| Gemini response | Text streams in | Variable | — |
| Compliance row | Height animate open | 250ms | ease-out |

---

## Responsive Breakpoints

| Breakpoint | Change |
|---|---|
| < 640px | Sidebar → bottom tab bar; charts stacked; gauge 200px; Gemini → full-screen |
| 640–1024px | Sidebar → icon-only 48px; side panels → bottom sheets |
| > 1024px | Full layout as specified |

---

## Iconography

Library: **Lucide React**, 18px, stroke-width 1.5px, always stroke (never fill)

| Section | Icon |
|---|---|
| Inspect | `ScanLine` |
| Measure | `Gauge` |
| Fix | `Wrench` |
| Report | `ShieldCheck` |
| Copilot | `BrainCircuit` |
| Alert | `AlertTriangle` |
| Proxy column | `EyeOff` |
| Pass | `CheckCircle2` |
| Fail | `XCircle` |
| Language | `Globe` |

---

## Empty & Loading States

**Loading:** Skeleton shimmer (`--bg-elevated → --bg-overlay`), `SCANNING DATASET...` Space Mono, animated ellipsis

**Empty:** Large `ScanLine` icon (64px, muted) + "Upload a dataset to begin your bias audit" + 3 preset pills (HR / Loan / Medical) in amber outline

**Error:** Red full-width banner + retry button + Gemini help chip

---

## Accessibility

- Focus ring: `outline: 2px solid --indigo-400; outline-offset: 2px`
- Color always paired with icon + text (never sole indicator)
- Gauge: `role="meter"` + `aria-valuenow` + `aria-valuetext`
- Min contrast: 4.5:1 WCAG AA
- `@media (prefers-reduced-motion)`: disables heartbeat, scan-line, 3D flip

---

## Page Grid Layouts

### Inspect Tab
```
[Upload Zone ──────────────────── full width, 220px]
[Column Heatmap ────────────────── full width flex-wrap]
[Demographic Charts 55%] │ [Proxy Detector 45%]
[Bias Type Classifier ──────────── full width list]
```

### Measure Tab
```
[Gauge 30%] │ [Four-Fifths Rule 35%] │ [Grade Cards 35%]
[Comparative Chart 60%] │ [Attribute Filter 40%]
[Intersectional Matrix ──────────── full width]
[Profile Flipper ────────────────── full width]
```

### Fix Tab
```
[Fairness-Accuracy Slider ────────── full width]
[Plain English Fixes 50%] │ [Before/After Gauges 50%]
[Auto-Mitigation Simulator ──────── full width]
[Human-in-the-Loop Queue ─────────── full width table]
```

### Report Tab
```
[AI Nutrition Label 38%] │ [Compliance Checker 62%]
[Bias Drift Monitor 68%] │ [Export + Grades 32%]
[LLM Prompt Scanner ────────────────── full width]
```

---

## Branding

| Element | Spec |
|---|---|
| Product name | FairLens |
| Logo | `FAIR◉LENS` — Plus Jakarta Sans 700, `--indigo-400`, CSS-drawn `◉` |
| Tagline | *See the bias. Measure it. Fix it. Prove it.* |
| Favicon | SVG half-circle arc (gauge) in indigo, transparent bg |
| Loading screen | Logo + tagline fade in 800ms, transitions to app |

---

## File / Folder Structure

```
fairlens/
├── src/
│   ├── components/
│   │   ├── layout/         Topbar · Sidebar · AppShell
│   │   ├── inspect/        UploadZone · ColumnHeatmap* · DemographicCharts · ProxyDetector
│   │   ├── measure/        FairnessGauge* · ComparativeCharts · FourFifths · GradeCards
│   │   │                   IntersectionalMatrix · ProfileFlipper* · AttributeFilter
│   │   ├── fix/            FairnessSlider · PlainFixes · BeforeAfter · AutoMitigation · TriageQueue
│   │   ├── report/         NutritionLabel · ComplianceChecker · BiasDriftMonitor · PromptScanner · Export
│   │   └── copilot/        GeminiFAB* · ChatPanel* · ExplainerChip*
│   ├── lib/
│   │   ├── gemini.js       All Gemini API calls
│   │   ├── bias-engine.js  Scoring · Four-Fifths · Intersectional math
│   │   ├── presets.js      Demo CSV datasets
│   │   └── pdf-export.js   jsPDF logic
│   ├── styles/
│   │   ├── globals.css     CSS variables
│   │   └── animations.css  heartbeat · scan-line · flip keyframes
│   ├── App.jsx
│   └── main.jsx
├── public/
│   ├── datasets/           hr_demo.csv · loan_demo.csv · medical_demo.csv
│   └── favicon.svg
└── index.html

* = contains signature animation — build these first
```

---

## The 4 Signature Demo Moments — Quick Reference

| # | Moment | Tab | Trigger | What the Judge Sees |
|---|---|---|---|---|
| 1 | 🫀 Bias Heartbeat | Measure | Score < 50 loads | 3 red rings pulse outward from gauge like a flatline |
| 2 | 📡 Heatmap X-Ray | Inspect | Dataset uploaded | Scan-line sweeps, columns reveal left-to-right |
| 3 | 🃏 Profile Flip | Measure | Attribute changed | Card rotates 180° in 3D, new decision revealed |
| 4 | 💬 Gemini Gradient | All tabs | Any AI response | Blue→purple glowing border streams in with text |

**Build order: Signature moments first → Core logic second → Polish third.**

---

*FairLens UI Spec v2.0 — Google Solution Challenge 2026*
*Design Language: Clinical Futurism × Google Material Dark × Precision Analytics Terminal*
