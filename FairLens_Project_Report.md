
## TABLE OF CONTENTS

1. [Introduction](#1-introduction)
   - 1.1 Motivations
   - 1.2 Problem Statement
   - 1.3 Objectives
   - 1.4 Scope of the Project
2. [Literature Survey](#2-literature-survey)
   - 2.1 What is Algorithmic Bias?
   - 2.2 Types of Fairness
   - 2.3 Existing Bias Detection Tools
   - 2.4 Mitigation Strategies in Literature
3. [System Design](#3-system-design)
   - 3.1 System Architecture (Block Diagram)
   - 3.2 Data Flow Diagram
   - 3.3 Use Case Diagram
   - 3.4 Technology Stack
4. [Mathematical Modelling & Backend Calculations](#4-mathematical-modelling--backend-calculations)
   - 4.1 Disparate Impact Ratio (DIR)
   - 4.2 Statistical Parity Difference (SPD)
   - 4.3 Equalized Odds
   - 4.4 Fairness Score (0–100)
   - 4.5 Fairness Grades (A–F)
   - 4.6 Intersectional Bias Matrix
   - 4.7 Profile Flipper (Counterfactual Simulation)
   - 4.8 Column Risk Classification
5. [Feature-by-Feature Explanation](#5-feature-by-feature-explanation)
   - 5.1 Inspect Tab — Data Upload & Parsing
   - 5.2 Measure Tab — Bias Measurement & ML Model Training
   - 5.3 Fix Tab — Remediation Strategies
   - 5.4 Report Tab — Compliance Reports & PDF Export
   - 5.5 Bilingual Interface (English & Hindi)
6. [Server-Side ML Engine (Backend)](#6-server-side-ml-engine-backend)
   - 6.1 Overview of the ML Pipeline
   - 6.2 Data Cleaning — Missing Value Imputation
   - 6.3 Label Encoding of Categorical Features
   - 6.4 Train/Test Split — Adaptive Ratio
   - 6.5 Downsampling for Performance (3000-Row Cap)
   - 6.6 Ensemble Bagging — Decision Tree Forest
   - 6.7 Bootstrap Sampling
   - 6.8 Adaptive Hyperparameters
   - 6.9 Majority-Vote Prediction
   - 6.10 Confusion Matrix & Performance Metrics
   - 6.11 Per-Group Fairness Metrics
   - 6.12 Feature Importance (Correlation-Based)
7. [Remediation Algorithms (Backend)](#7-remediation-algorithms-backend)
   - 7.1 Re-weighting Strategy
   - 7.2 Proxy Removal Strategy
   - 7.3 Calibrated Equalized Odds Strategy
8. [Deployment](#8-deployment)
   - 8.1 Frontend — Firebase Hosting
   - 8.2 Backend — Render Web Service
   - 8.3 Environment Configuration
9. [Implementation and Results](#9-implementation-and-results)
   - 9.1 Development Procedure
   - 9.2 Screenshots & Observations
   - 9.3 Performance Analysis
10. [Conclusion and Future Scope](#10-conclusion-and-future-scope)
11. [References](#11-references)

---

<div style="page-break-after: always;"></div>

## 1. INTRODUCTION

### 1.1 Motivations

Artificial Intelligence (AI) and Machine Learning (ML) systems have become deeply embedded in our daily lives. They are used in hiring processes where algorithms screen thousands of resumes, in banking where models approve or deny loan applications, in healthcare where systems prioritize patients for treatment, and in criminal justice where risk scores influence sentencing decisions.

However, there is a fundamental problem: **these AI models learn from historical data, and historical data contains the biases of the humans who generated it**. For example, if a company historically hired more men than women, then an AI model trained on that data will also learn to prefer male candidates — not because men are inherently more qualified, but because the historical data says so.

This kind of bias is often invisible. Nobody deliberately programs the model to discriminate. Instead, the bias is hidden inside the statistical patterns of the training data. This makes it extremely dangerous because the people using the system may believe it is objective and fair, when in reality it is systematically discriminating against certain groups of people.

As students of B.Tech Computer Science Engineering (AI & ML), we found this problem both technically challenging and socially important. We wanted to build a tool that could:
- **Detect** these hidden biases automatically
- **Explain** them in simple, visual terms that anyone can understand
- **Fix** them using mathematical strategies
- **Report** on the findings for regulatory compliance

This became the foundation for **FairLens**.

### 1.2 Problem Statement

Existing bias detection tools fall into two categories, and both have significant limitations:

1. **Technical Libraries (e.g., IBM AI Fairness 360, Google What-If Tool):** These tools are powerful but require advanced Python programming knowledge, command-line expertise, and familiarity with machine learning concepts. A compliance officer or HR manager cannot use them without engineering support.

2. **Simplified Dashboards:** Some commercial tools provide basic bias reports, but they lack mathematical depth, do not offer remediation capabilities, and do not support region-specific compliance standards such as the India DPDP Act 2023.

**The problem we aimed to solve:** Build a comprehensive, interactive, web-based application that any user — regardless of programming skill — can use to upload a dataset, detect bias, understand it visually, apply mathematical corrections, and generate a compliance-ready audit report, all from a standard web browser.

### 1.3 Objectives

The specific objectives of this project are:

1. **Client-Side CSV Parsing:** Design a privacy-first data ingestion system where the user's raw data is parsed entirely in the browser using PapaParse, so that sensitive personal data never leaves the user's machine.

2. **Statistical Bias Detection:** Implement mathematically rigorous fairness metrics — Disparate Impact Ratio (DIR), Statistical Parity Difference (SPD), Equalized Odds, and a composite Fairness Score (0–100) — that can be computed on any CSV dataset with demographic columns.

3. **Intersectional Bias Matrix:** Build a client-side algorithm that computes the compounded disadvantage when two protected attributes overlap (e.g., how does the outcome differ for "Female + SC/ST" vs "Male + General"?).

4. **Server-Side ML Model:** Build a Random Forest (Bagged Decision Tree Ensemble) classifier on the backend server that can train on the user's data, report performance metrics (Accuracy, Precision, Recall, F1), and compute per-group fairness breakdowns — all while staying responsive by capping dataset processing at 3,000 rows.

5. **Remediation Engine:** Implement three pre-processing mitigation strategies (Re-weighting, Proxy Removal, Calibrated Equalized Odds) that the user can apply with one click to see before-vs-after improvements.

6. **Compliance Reporting:** Generate audit reports that check compliance against EEOC 4/5ths Rule (USA), India DPDP Act 2023, and EU AI Act, with one-click PDF export.

7. **Deployment:** Deploy the frontend on Firebase Hosting and the backend on Render, making the application publicly accessible at zero cost.

### 1.4 Scope of the Project

- The application works with **tabular CSV datasets** (structured data with rows and columns).
- The target outcome column must be **binary** (e.g., Hired/Not Hired, Approved/Rejected, Yes/No, 1/0).
- The system supports datasets up to **15,000 rows** for client-side analysis, and the ML engine processes a maximum of **3,000 sampled rows** for real-time server-side training.
- The platform includes **7 curated sample datasets** covering hiring, lending, medical, and criminal justice bias scenarios.
- The user interface supports **English and Hindi** languages.

---

<div style="page-break-after: always;"></div>

## 2. LITERATURE SURVEY

### 2.1 What is Algorithmic Bias?

Algorithmic bias refers to systematic and repeatable errors in a computer system that create unfair outcomes for certain groups of people. In the context of machine learning, bias can enter the system at multiple stages:

- **Historical Bias:** The training data reflects past human decisions that were themselves biased. For example, if historically women were denied loans at higher rates, an ML model trained on that data will continue denying women at higher rates.
- **Representation Bias:** Certain demographic groups are underrepresented in the training data. If only 5% of the data comes from a particular ethnic group, the model will have poor accuracy for that group.
- **Measurement Bias:** The features used to make predictions are themselves biased proxies. For example, using "ZIP code" as a feature in a loan model indirectly encodes racial information because neighborhoods in many countries are segregated by race or caste.
- **Selection Bias:** The data collection process itself introduces bias. For example, if a hospital collects data only from patients who can afford to visit, the data will underrepresent low-income populations.

### 2.2 Types of Fairness

The academic literature identifies two broad categories of algorithmic fairness:

**Group Fairness** measures whether different demographic groups receive similar outcomes on average. This is what FairLens primarily measures. The two most important group fairness metrics are:

1. **Disparate Impact Ratio (DIR):** Defined by the US Equal Employment Opportunity Commission (EEOC) in their 1978 Uniform Guidelines on Employee Selection Procedures. The rule states that the selection rate for any group must be at least 80% (four-fifths) of the rate for the group with the highest selection rate. If the ratio falls below 0.80, it is considered evidence of adverse impact (discrimination).

2. **Statistical Parity Difference (SPD):** This simply calculates the raw numerical difference in positive outcome rates between the most advantaged and least advantaged groups. An SPD of 0 means perfect parity.

**Individual Fairness** requires that similar individuals receive similar outcomes. FairLens implements this through the **Profile Flipper**, which changes one demographic attribute of a specific individual (e.g., changing "Male" to "Female") and checks whether the predicted outcome changes. If flipping the gender changes the outcome from "Approved" to "Rejected," that is evidence of individual-level unfairness.

### 2.3 Existing Bias Detection Tools

| Tool | Provider | Limitations |
|------|----------|-------------|
| AI Fairness 360 | IBM | Requires Python, command-line only, steep learning curve |
| What-If Tool | Google | Limited to TensorFlow models, no remediation |
| Fairlearn | Microsoft | Python library, no GUI, no compliance reporting |
| Aequitas | University of Chicago | Command-line tool, no interactive visualizations |

FairLens differentiates itself by providing a **zero-installation web interface** with **interactive visualizations**, **one-click remediation**, and **localized compliance checking** (including India DPDP Act 2023).

### 2.4 Mitigation Strategies in Literature

Machine learning bias mitigation strategies are conventionally divided into three categories:

1. **Pre-processing strategies** modify the training data before the model is trained. This includes re-weighting samples so that underrepresented groups have more influence, or removing proxy variables that indirectly encode protected attributes. FairLens implements this approach.

2. **In-processing strategies** modify the model's learning objective to include a fairness constraint alongside the accuracy objective. This approach requires custom model architectures and is not implemented in FairLens v1.

3. **Post-processing strategies** modify the model's output after training. For example, adjusting decision thresholds differently for each group to equalize outcomes. FairLens implements a simplified version of this (Threshold Adjustment).

---

<div style="page-break-after: always;"></div>

## 3. SYSTEM DESIGN

### 3.1 System Architecture (Block Diagram)

FairLens follows a **client-server architecture** with a clear separation of concerns:

```
┌─────────────────────────────────────────────────────────┐
│                   USER'S BROWSER                         │
│                                                          │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐   │
│  │  Inspect Tab  │  │  Measure Tab │  │   Fix Tab    │   │
│  │  (PapaParse)  │  │  (Bias Calc) │  │  (Simulate)  │   │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘   │
│         │                 │                  │           │
│  ┌──────┴─────────────────┴──────────────────┴───────┐   │
│  │              React 19 + Vite 6 Frontend           │   │
│  │         (Recharts, Lucide Icons, jsPDF)           │   │
│  └───────────────────────┬───────────────────────────┘   │
│                          │ REST API (JSON)               │
└──────────────────────────┼───────────────────────────────┘
                           │
                           ▼
┌──────────────────────────────────────────────────────────┐
│               NODE.JS EXPRESS SERVER                      │
│                                                          │
│  ┌─────────────┐  ┌──────────────┐  ┌────────────────┐  │
│  │ /api/train   │  │/api/remediate│  │ /api/predict   │  │
│  └──────┬──────┘  └──────┬───────┘  └───────┬────────┘  │
│         │                │                   │           │
│  ┌──────┴────────────────┴───────────────────┴────────┐  │
│  │            ML ENGINE (modelEngine.js)               │  │
│  │  • Data Cleaning (Imputation)                       │  │
│  │  • Label Encoding                                   │  │
│  │  • Train/Test Split                                 │  │
│  │  • Ensemble Bagging (3 Decision Trees)              │  │
│  │  • Confusion Matrix                                 │  │
│  │  • Per-Group Fairness Metrics                       │  │
│  └─────────────────────────────────────────────────────┘  │
└──────────────────────────────────────────────────────────┘
```

**Key design decision:** CSV parsing and basic bias calculations (DIR, SPD, Intersectional Matrix) happen entirely on the **client side** (in the user's browser). Only operations that require significant computation — ML model training and remediation simulation — are sent to the **server**. This design ensures that the user's raw data stays private and the UI remains responsive.

### 3.2 Data Flow Diagram

The complete data flow through FairLens is as follows:

1. **User uploads a CSV file** → PapaParse (a JavaScript library running in the browser) parses the CSV into an array of row objects.
2. **User selects sensitive attributes and target column** → These are stored in React Context (a shared state container).
3. **User clicks "Execute Forensic Audit"** → The client-side `calculateBiasMetrics()` function computes DIR, SPD, and group outcome rates locally.
4. **Simultaneously, ML model training request is sent** → The frontend sends the parsed data (minimized to only necessary columns) to the backend's `/api/analysis/train` endpoint as a POST request.
5. **Backend receives data** → The ML Engine cleans the data (imputes missing values), encodes categorical variables, downsamples to 3000 rows, trains 3 decision trees using bootstrap sampling, evaluates performance on a test set, and computes per-group fairness metrics.
6. **Results returned to frontend** → The frontend renders bar charts, pie charts, radar charts, gauge visualizations, fairness grades (A–F), and the confusion matrix breakdown.
7. **User selects a remediation strategy** → The frontend sends the data with the selected strategy to `/api/analysis/remediate`, which re-trains the model with the applied correction and returns before-vs-after comparisons.
8. **User exports report** → The Report tab uses jsPDF and html2canvas to capture the rendered report as an image and convert it to a downloadable PDF.

### 3.3 Use Case Diagram

The primary actors and their interactions are:

**Actor 1 — End User (Data Scientist / Compliance Officer / HR Manager):**
- Upload a CSV dataset or load a curated sample
- Select which columns are "sensitive" (protected attributes like gender, race, caste)
- Select the "target" column (the outcome being predicted, like hired/not hired)
- Run the forensic bias audit
- View bias metrics, charts, and fairness grades
- Apply remediation strategies (Re-weighting, Proxy Removal, Calibrated EO)
- Generate and download a compliance report as PDF

**Actor 2 — Client-Side Bias Engine (biasEngine.js):**
- Parse CSV using PapaParse
- Compute Disparate Impact Ratio, Statistical Parity Difference
- Compute Intersectional Bias Matrix
- Simulate Profile Flipper counterfactuals
- Detect proxy columns and sensitive attributes automatically

**Actor 3 — Server-Side ML Engine (modelEngine.js):**
- Clean and impute missing values
- Encode categorical variables
- Train a 3-tree bagged ensemble classifier
- Evaluate predictions using a confusion matrix
- Compute per-group fairness metrics (TPR, FPR, Prediction Rate)
- Re-train with remediation strategies applied

### 3.4 Technology Stack

| Layer | Technology | Purpose |
|-------|-----------|---------|
| Frontend Framework | React 19 | Component-based UI rendering |
| Build Tool | Vite 6 | Fast development server and production bundler |
| CSV Parsing | PapaParse | Client-side CSV to JSON conversion |
| Charts & Visualizations | Recharts | Bar charts, pie charts, radar charts |
| Icons | Lucide React | Consistent icon set throughout the UI |
| PDF Export | jsPDF + html2canvas | Convert HTML report to downloadable PDF |
| Styling | Tailwind CSS 4 + Custom Variables | "Obsidian & Dune" dark theme design system |
| Backend Framework | Node.js 20 + Express 4 | REST API server |
| ML Library | ml-cart | Decision Tree Classifier (CART algorithm) |
| Evaluation | ml-confusion-matrix | Confusion matrix computation |
| Frontend Hosting | Firebase Hosting | Static file CDN (Google infrastructure) |
| Backend Hosting | Render | Node.js web service deployment |

---

<div style="page-break-after: always;"></div>

## 4. MATHEMATICAL MODELLING & BACKEND CALCULATIONS

This section explains every formula and algorithm used in FairLens. Each formula is explained in simple words so that even someone without a statistics background can understand what it measures and why it matters.

### 4.1 Disparate Impact Ratio (DIR)

**What it measures:** DIR checks whether one group is getting approved (or hired, or treated) at a rate that is proportionally similar to the best-performing group.

**Formula:**

```
DIR = (Positive Rate of Least Favored Group) / (Positive Rate of Most Favored Group)
```

**In simple words:** Suppose you have two groups: Male and Female. If 80% of males are hired but only 50% of females are hired, then:

```
DIR = 50% / 80% = 0.625 (or 62.5%)
```

**Interpretation:**
- DIR >= 0.80 (80%) → **FAIR** — Passes the EEOC 4/5ths Rule
- DIR between 0.60 and 0.79 → **MODERATE BIAS** — Needs attention
- DIR between 0.40 and 0.59 → **HIGH BIAS** — Significant discrimination
- DIR < 0.40 → **CRITICAL BIAS** — Severe discrimination

**Where it comes from:** This metric is defined in the US Equal Employment Opportunity Commission (EEOC) Uniform Guidelines on Employee Selection Procedures, 1978. It is the legal standard used in US employment discrimination cases.

**How FairLens computes it (from biasEngine.js):**
```javascript
const maxRate = Math.max(...groupStats.map(g => g.rate))
const minRate = Math.min(...groupStats.map(g => g.rate))
const disparateImpact = maxRate > 0 ? minRate / maxRate : 1
```
The code finds the group with the highest positive outcome rate (`maxRate`) and the group with the lowest positive outcome rate (`minRate`), and divides the minimum by the maximum.

### 4.2 Statistical Parity Difference (SPD)

**What it measures:** SPD measures the absolute gap in positive outcome rates between the most and least favored groups.

**Formula:**

```
SPD = P(Y=1 | Most Favored Group) - P(Y=1 | Least Favored Group)
```

**In simple words:** Using the same example above (80% male hire rate, 50% female hire rate):

```
SPD = 80% - 50% = 30%
```

This means there is a **30 percentage point gap** between the best and worst groups.

**Interpretation:**
- SPD <= 10% → **FAIR** — Within acceptable range
- SPD between 10% and 20% → **MARGINAL** — Needs monitoring
- SPD > 20% → **SIGNIFICANT DISPARITY** — Requires remediation

**How FairLens computes it:**
```javascript
const statisticalParity = maxRate - minRate
```
It is simply the subtraction of the lowest rate from the highest rate.

### 4.3 Equalized Odds

**What it measures:** Equalized Odds checks whether the model makes the same types of mistakes equally across all groups. Specifically, it looks at two error rates:

- **True Positive Rate (TPR):** Of all the people who should have been approved, how many did the model correctly approve? (`TPR = TP / (TP + FN)`)
- **False Positive Rate (FPR):** Of all the people who should have been rejected, how many did the model incorrectly approve? (`FPR = FP / (FP + TN)`)

**Formula:**

```
Equalized Odds = 1 - max(TPR_diff, FPR_diff)
```

Where `TPR_diff` is the difference in TPR between the best and worst groups, and `FPR_diff` is the difference in FPR between the best and worst groups.

**In simple words:** If the model correctly approves 90% of qualified males but only 70% of qualified females (TPR_diff = 20%), and incorrectly approves 10% of unqualified males but 15% of unqualified females (FPR_diff = 5%), then:

```
Equalized Odds = 1 - max(0.20, 0.05) = 1 - 0.20 = 0.80 (80%)
```

A score of 100% means the model makes mistakes equally across all groups (which is fair). A low score means the model is systematically more accurate for some groups than others.

### 4.4 Fairness Score (0–100)

**What it measures:** FairLens computes a single overall "fairness score" from 0 to 100 that summarizes how fair the dataset is. This makes it easy for non-technical users to quickly understand the overall situation.

**Formula:**

```
Fairness Score = (1 - Disparity) × 100
```

Where Disparity is:

```
Disparity = (maxRate - minRate) / maxRate
```

**In simple words:** If the best group has an 80% approval rate and the worst group has a 60% approval rate:

```
Disparity = (0.80 - 0.60) / 0.80 = 0.25
Fairness Score = (1 - 0.25) × 100 = 75
```

**Interpretation:**
- Score >= 71 → **FAIR** (displayed in green)
- Score 41–70 → **NEEDS WORK** (displayed in yellow)
- Score < 41 → **UNFAIR** (displayed in red with a pulsing heartbeat animation on screen to draw attention)

### 4.5 Fairness Grades (A–F)

**What it measures:** Each demographic group gets a letter grade (like a school report card) based on how much its outcome rate deviates from the best group's rate.

**Formula:**

```
Disparity % = |bestRate - groupRate| / bestRate × 100
```

**Grading scale:**
- Disparity <= 5% → Grade **A** (essentially equal)
- Disparity 6–10% → Grade **B** (slight difference)
- Disparity 11–20% → Grade **C** (noticeable difference)
- Disparity 21–30% → Grade **D** (significant difference)
- Disparity > 30% → Grade **F** (severe discrimination)

**In simple words:** If males have a 75% hire rate and females have a 60% hire rate:

```
Disparity = |75 - 60| / 75 × 100 = 20%
```

The female group would get a Grade **C** (noticeable difference, needs attention).

### 4.6 Intersectional Bias Matrix

**What it measures:** Sometimes bias gets much worse when you look at the combination of two attributes instead of each one separately. For example, a company might hire roughly equal numbers of men and women overall, and roughly equal numbers of people from different castes overall. But when you look at "Female + SC/ST" specifically, you might find that this intersectional group has a dramatically lower hire rate than any other combination.

This is called **intersectional bias** or **compounded disadvantage**.

**How FairLens computes it (from IntersectionalMatrix.jsx):**

The algorithm works in a single pass through the data (O(N) time complexity):

1. For every row in the dataset, extract the values of the two selected sensitive attributes (e.g., attribute1 = "Gender", attribute2 = "Caste").
2. Create a combined key by joining the two values: `key = "Female_SC/ST"`.
3. Maintain a hash map (JavaScript object) where each key maps to a counter object: `{ count: 0, positiveCount: 0 }`.
4. For each row, increment the `count` and, if the outcome is positive, increment `positiveCount`.
5. After processing all rows, compute the approval rate for each combination: `rate = positiveCount / count`.
6. Identify the best group (highest rate) and compute the disparity of every other combination relative to it.

**In code:**
```javascript
const key = `${v1}_${v2}`;
if (!matrix[key]) {
  matrix[key] = { label: `${v1} + ${v2}`, positiveCount: 0, count: 0 };
}
matrix[key].count++;
if (isPositive(outcome)) {
  matrix[key].positiveCount++;
}
// After loop:
cell.rate = cell.count > 0 ? cell.positiveCount / cell.count : 0;
```

The result is displayed as a color-coded grid where each cell represents one attribute combination, colored from green (fair) to red (severely biased).

### 4.7 Profile Flipper (Counterfactual Simulation)

**What it measures:** The Profile Flipper tests individual fairness by asking: "If I change this person's gender from Male to Female (but keep everything else the same), does the outcome change?"

**How it works (from biasEngine.js):**

1. Take the selected row from the dataset.
2. The user chooses which attribute to "flip" and what the new value should be (e.g., flip Gender from "Male" to "Female").
3. Find all other rows in the dataset that have the flipped value AND match the original row on all other columns (exact match).
4. If enough exact matches exist (more than 3), use only those. Otherwise, fall back to all rows with the flipped value.
5. Among this pool of similar individuals, compute the percentage who had a positive outcome.
6. If that percentage is >= 50%, the flipped outcome is "Positive"; otherwise "Negative."
7. Compare with the original outcome. If it changed, that is evidence of unfairness.

**In code:**
```javascript
const candidates = rows.filter(r => String(r[flipCol]) === String(flipValue));
const similar = candidates.filter(r =>
  otherCols.every(k => r[k] === row[k])
);
const pool = similar.length > 3 ? similar : candidates;
const positiveRate = pool.filter(r => isPositive(r[outcomeCol])).length / pool.length;
const flippedOutcome = positiveRate >= 0.5;
```

### 4.8 Column Risk Classification

**What it measures:** FairLens automatically classifies every column in the dataset by its risk level for bias:

- **High Risk (Score 90):** Columns whose names contain keywords like "gender," "race," "caste," "religion," "age," "disability" — these are direct sensitive attributes.
- **Medium Risk (Score 60):** Columns whose names contain proxy keywords like "zip," "college," "neighborhood," "income_bracket" — these may indirectly encode sensitive information.
- **Medium Risk (Score 40):** Columns with very low cardinality (2–5 unique values) — these could be hidden demographic categories.
- **Low Risk (Score 15):** All other columns (numeric/technical features).

---

<div style="page-break-after: always;"></div>

## 5. FEATURE-BY-FEATURE EXPLANATION

### 5.1 Inspect Tab — Data Upload & Parsing

The Inspect Tab is the first screen the user sees after the landing page. Its purpose is to get data into the system.

**Privacy-First CSV Parsing:**
When the user uploads a CSV file (by drag-and-drop or file picker), the file is parsed entirely in the browser using the PapaParse library. The key settings used are:
- `header: true` — The first row of the CSV is treated as column headers.
- `skipEmptyLines: true` — Blank rows are ignored.
- `dynamicTyping: true` — Numbers are automatically converted from strings to JavaScript numbers.

The raw CSV data **never leaves the user's browser**. It is stored in React Context (an in-memory state container) and only sent to the server when the user explicitly triggers ML model training — and even then, the data is minimized to include only necessary columns.

**Curated Sample Datasets:**
For users who want to explore the platform without uploading their own data, FairLens provides 7 pre-built datasets:

| Dataset | Rows | Sensitive Attributes | Target Column | Bias Scenario |
|---------|------|---------------------|---------------|---------------|
| HR Hiring Bias (15K) | 15,000 | gender, race | hired | Hiring discrimination against minorities and women |
| Loan Approval Bias (10K) | 10,000 | Gender, Caste_Category | loan_approved | Caste and gender bias in lending |
| Medical Diagnosis Bias (12K) | 12,000 | sex, race | treatment_approved | Race and insurance bias in medical treatment |
| Criminal Justice (10K) | 10,000 | sex, race | low_risk_approved | Racial disparities in risk scoring |
| HR Pipeline (5K) | 5,000 | gender | looking_for_job_change | Gender underrepresentation |
| Loan Dataset (Small) | 615 | Gender, Caste_Category | loan_approved | Classic Indian loan bias |
| Medical Dataset | 1,000 | sex, age_group | heart_disease | Heart disease diagnosis bias |

When a sample dataset is loaded, the sensitive attributes and target column are automatically pre-selected, so the user can immediately proceed to analysis.

**Column Configuration:**
After loading data, the user sees a summary showing the total number of rows and columns, and can:
- Select which columns are **sensitive attributes** (protected demographic variables)
- Select which column is the **target** (the binary outcome variable)
- Preview the first 20 rows of data in a scrollable table
- Search columns by name

### 5.2 Measure Tab — Bias Measurement & ML Model Training

The Measure Tab is the analytical core of FairLens. When the user clicks **"Execute Forensic Audit"**, two things happen simultaneously:

**Step 1 — Client-Side Statistical Analysis (Instant):**
The frontend's `calculateBiasMetrics()` function iterates through all rows and computes:
- The positive outcome rate for each group within each sensitive attribute
- Disparate Impact Ratio
- Statistical Parity Difference
- Equal Opportunity score
- Overall Fairness Score (0–100)
- Fairness Grades (A–F) for each group

These results are displayed immediately (within milliseconds) using:
- **Circular gauge visualizations** (animated SVG circles) for DIR, SPD, and Fairness Score
- **Bar charts** (Recharts) showing outcome rates by group
- **Pie charts** showing group population distribution
- **Fairness grade cards** (A through F, color-coded)
- **A data table** with exact numbers for each group

**Step 2 — Server-Side ML Model Training (1–3 seconds):**
Simultaneously, the frontend sends the data to the backend's `/api/analysis/train` endpoint. The server trains a 3-tree bagged ensemble classifier (explained in detail in Section 6) and returns:
- Model performance metrics: Accuracy, Precision, Recall, F1 Score
- Confusion matrix breakdown: TP, FP, FN, TN
- Per-group model fairness: Model DIR, Equalized Odds, Statistical Parity
- Per-group detailed metrics: Prediction Rate, TPR, FPR, Precision, Accuracy for each demographic group
- Feature importance rankings

The **Intersectional Bias Matrix** is also rendered on this tab. It requires at least 2 sensitive attributes and computes the cross-tabulation matrix client-side.

The **Profile Flipper** is also available on this tab, allowing the user to select a specific row and simulate what would happen if one attribute were changed.

### 5.3 Fix Tab — Remediation Strategies

The Fix Tab allows the user to apply mathematical corrections to reduce bias. Four strategies are available:

1. **Re-weighting (⚖️):** Adjusts sample weights so that underrepresented groups have more influence during model training. The backend computes new weights based on group approval rates and retrains the model. (Details in Section 7.1)

2. **Threshold Adjustment (📊):** Adjusts per-group decision thresholds to equalize outcomes. This is a simulated post-processing approach.

3. **Calibrated Equalized Odds (🎯):** Equalizes true positive rates across groups by aggressively re-weighting and reducing model complexity. (Details in Section 7.3)

4. **Proxy Removal (🧹):** Automatically identifies and removes features that are proxies for sensitive attributes (e.g., ZIP code, college name, neighborhood). (Details in Section 7.2)

When the user clicks "Run" on a strategy, the frontend sends the data and the selected strategy to the backend's `/api/analysis/remediate` endpoint. The server retrains the model with the correction applied and returns both the "before" and "after" metrics. The UI displays:
- A **before-vs-after comparison** showing how DIR, accuracy, and other metrics changed
- A **bar chart** comparing group outcome rates before and after remediation
- The specific improvements achieved (e.g., "DIR improved from 62.5% to 91.3%")

### 5.4 Report Tab — Compliance Reports & PDF Export

The Report Tab generates formal audit documentation. It has three sub-sections:

**AI Nutrition Label:**
Inspired by food nutrition labels, this component provides a concise visual summary of the dataset's "fairness nutrition." It shows at a glance: Disparate Impact score, Statistical Parity, Equalized Odds, total rows analyzed, and an overall risk rating.

**Compliance Checker:**
This component checks the analysis results against three regulatory standards:
- **EEOC 4/5ths Rule (USA):** Requires DIR >= 0.80
- **India DPDP Act 2023:** Requires SPD <= 0.20
- **EU AI Act (High-Risk):** Requires DIR >= 0.70

Each standard is shown as COMPLIANT, PARTIALLY COMPLIANT, or NON-COMPLIANT.

**Full Report & PDF Export:**
A complete text report is generated containing the executive summary, key findings, group analysis, ML pipeline audit results, remediation results (if applied), and compliance assessment. The user can click **"Export Official Dossier"** to download this report as a PDF file. The PDF is generated using jsPDF and html2canvas, which captures the rendered HTML as a high-resolution image and converts it into a multi-page PDF.

### 5.5 Bilingual Interface (English & Hindi)

FairLens supports full bilingual operation in English and Hindi. The language can be toggled from the Settings tab. All UI labels, button text, metric names, compliance results, and explanatory tooltips are translated. The translation system uses a `t()` function that looks up the Hindi equivalent of any English string from a translation dictionary.

### 5.6 Graph & Visualization Architecture

The project relies heavily on data visualization to make complex statistical bias metrics understandable. All graphs and charts in FairLens are built using **Recharts**, a composable charting library built on React components. Here is how the key visualizations are constructed:

**1. Group Outcome Bar Charts (Measure Tab):**
- **Purpose:** To visually compare the positive outcome rates (e.g., % hired) across different demographic groups.
- **Implementation:** Uses Recharts `<BarChart>` and `<Bar>` components. The `dataKey` is set to the calculated `rate` for each group. We apply a custom color palette (`CHART_COLORS`) so that each group has a distinct, consistent color. A `<Tooltip>` component provides exact percentages on hover.

**2. Demographic Distribution Pie Charts (Measure Tab):**
- **Purpose:** To show the sample size representation of each group in the dataset.
- **Implementation:** Uses Recharts `<PieChart>` and `<Pie>` components. The `dataKey` is the `total` count of rows for that group. We configure an `innerRadius` to create a modern "donut" chart style, and set a `paddingAngle` to create visual separation between the slices.

**3. Fairness-Accuracy Trade-off Line Chart (Fix Tab):**
- **Purpose:** To visualize how increasing the "fairness weight" during remediation impacts model accuracy, precision, and recall.
- **Implementation:** Uses Recharts `<LineChart>`. This chart plots four `<Line>` components simultaneously: Fairness (Green), Accuracy (Blue), Precision (Purple, dashed), and Recall (Teal, dashed). The X-axis represents the Fairness Weight (0% to 100%), and the Y-axis is bound between 50 and 100 to clearly show the drop-off in accuracy as fairness increases.

**4. Before/After Remediation Bar Charts (Fix Tab):**
- **Purpose:** To directly compare a group's outcome rate before remediation against its rate after remediation.
- **Implementation:** Uses a grouped `<BarChart>` where each demographic group on the X-axis has two bars side-by-side: "Before" (colored translucent red) and "After" (colored translucent green). The data object maps `original` and `adjusted` rates for easy visual comparison.

**5. Animated Circular Gauges (Custom SVGs):**
- **Purpose:** To display the high-level DIR, SPD, and Fairness scores in the Nutrition Label and Hero sections.
- **Implementation:** Instead of a charting library, these are custom React components rendering SVG `<circle>` elements. The `strokeDasharray` and `strokeDashoffset` properties are calculated mathematically based on the percentage score to create a smooth, animated radial progress bar that fills up on load.

---

<div style="page-break-after: always;"></div>

## 6. SERVER-SIDE ML ENGINE (BACKEND)

This section explains every step of the ML pipeline implemented in `server/ml/modelEngine.js` in full detail. The entire pipeline runs when the user clicks "Execute Forensic Audit" on the Measure Tab.

### 6.1 Overview of the ML Pipeline

The pipeline follows these steps in order:
1. Clean data (impute missing values)
2. Prepare binary labels (convert target column to 0/1)
3. Remove sensitive attributes from features
4. Encode categorical features as numbers
5. Downsample to maximum 3000 rows
6. Split into training and testing sets
7. (Optional) Apply sample weights for re-weighting
8. Determine adaptive hyperparameters
9. Train 3 decision trees using bootstrap sampling
10. Predict on test set using majority voting
11. Compute confusion matrix and overall metrics
12. Compute per-group fairness metrics
13. Compute feature importance rankings

### 6.2 Data Cleaning — Missing Value Imputation

Real-world datasets often have missing values. Before training, FairLens fills in missing values using two strategies:

- **For numeric columns:** Missing values are replaced with the **median** (the middle value when all values are sorted). Median is preferred over mean because it is not affected by extreme outliers.
- **For categorical columns:** Missing values are replaced with the **mode** (the most frequently occurring value).

```javascript
// Median imputation for numeric columns:
const sorted = values.map(Number).sort((a, b) => a - b);
const median = sorted[Math.floor(sorted.length / 2)];

// Mode imputation for categorical columns:
const freq = {};
values.forEach(v => { freq[String(v)] = (freq[String(v)] || 0) + 1 });
const mode = Object.entries(freq).sort((a, b) => b[1] - a[1])[0]?.[0];
```

### 6.3 Label Encoding of Categorical Features

Machine learning algorithms require numeric input. Categorical features (like "Male"/"Female" or "General"/"SC"/"ST"/"OBC") are converted to numbers using label encoding:

1. The encoder scans the first 500 rows to determine if a column is numeric or categorical.
2. For categorical columns, it creates a mapping: each unique value gets a sequential number (0, 1, 2, ...).
3. During training and prediction, each categorical value is replaced with its assigned number.

```javascript
// Example: Gender column
// "Male" → 0, "Female" → 1
const uniqueVals = [...new Set(rows.map(r => String(r[col])))];
uniqueVals.forEach((val, i) => { mapping[val] = i });
```

### 6.4 Train/Test Split — Adaptive Ratio

The dataset is split into a training set (used to train the model) and a test set (used to evaluate accuracy). The split ratio adapts based on dataset size:

| Dataset Size | Train % | Test % | Reason |
|-------------|---------|--------|--------|
| > 5,000 rows | 85% | 15% | Large datasets have enough test data at 15% |
| 2,000–5,000 rows | 80% | 20% | Standard split |
| < 2,000 rows | 75% | 25% | Small datasets need more test data for reliable evaluation |

```javascript
const splitRatio = rows.length > 5000 ? 0.85 : rows.length > 2000 ? 0.80 : 0.75;
```

### 6.5 Downsampling for Performance (3000-Row Cap)

This is a critical performance optimization. Web applications need to respond quickly — users expect results within 1–3 seconds. Training a decision tree on 15,000 rows of data with many features can take 10–30 seconds, which causes server timeouts (HTTP 504 errors) on free hosting platforms like Render.

FairLens solves this by randomly sampling a maximum of 3,000 rows from the dataset:

```javascript
const maxRows = Math.min(cleanRows.length, 3000);
const indices = shuffle(Array.from({ length: cleanRows.length }, (_, i) => i)).slice(0, maxRows);
```

The `shuffle()` function uses the **Fisher-Yates algorithm** with a deterministic seed (42) to ensure reproducible results:

```javascript
function shuffle(arr, seed = 42) {
  const a = [...arr];
  let s = seed;
  for (let i = a.length - 1; i > 0; i--) {
    s = (s * 16807) % 2147483647;
    const j = s % (i + 1);
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}
```

### 6.6 Ensemble Bagging — Decision Tree Forest

Instead of training a single decision tree (which can be unstable and prone to overfitting), FairLens trains an **ensemble of 3 decision trees** using the **bagging (Bootstrap Aggregating)** technique.

**What is Bagging?** Bagging is a technique where you train multiple models on different random subsets of the training data, and then combine their predictions by voting. This reduces the variance (instability) of the model and typically improves accuracy.

**How it works in FairLens:**
1. For each of the 3 trees, create a bootstrap sample (random sample with replacement) from the training data.
2. Train a Decision Tree Classifier (CART algorithm, using Gini impurity as the split criterion) on each bootstrap sample.
3. Store all 3 trained trees.

### 6.7 Bootstrap Sampling

Each tree gets its own random subset of the training data. For large datasets, a subsample ratio is used to further reduce the data each tree sees:

| Dataset Size | Subsample Ratio | Data Per Tree |
|-------------|----------------|---------------|
| > 8,000 rows | 40% | Each tree trains on 40% of the data |
| 5,000–8,000 rows | 50% | Each tree trains on 50% of the data |
| < 5,000 rows | 100% | Each tree trains on all the data |

The bootstrap indices are generated using a deterministic pseudo-random number generator:

```javascript
let s = seed + t * 1337;
for (let i = 0; i < subsampleSize; i++) {
  s = (s * 16807 + i) % 2147483647;
  bootstrapIndices.push(s % n);
}
```

### 6.8 Adaptive Hyperparameters

The decision tree's complexity is controlled by two key hyperparameters that adapt based on dataset size:

**Maximum Depth (maxDepth):** How deep the tree can grow. Deeper trees capture more complex patterns but are slower and more prone to overfitting.

**Minimum Samples per Leaf (minNumSamples):** The minimum number of samples required in a leaf node. Higher values create simpler, faster trees.

| Dataset Size | maxDepth | minNumSamples |
|-------------|----------|--------------|
| > 8,000 rows | 8 | 25 |
| 5,000–8,000 rows | 10 | 15 |
| 2,000–5,000 rows | 12 | 5 |
| < 2,000 rows | 10 | 3 |

### 6.9 Majority-Vote Prediction

When making predictions on the test set, all 3 trees vote on each row independently. The final prediction is determined by majority vote:

```javascript
function predictEnsemble(trees, X) {
  return X.map(row => {
    const votes = trees.map(t => t.predict([row])[0]);
    const ones = votes.filter(v => v === 1).length;
    return ones > votes.length / 2 ? 1 : 0;
  });
}
```

If 2 or more trees predict "1" (positive outcome), the ensemble prediction is 1. Otherwise, it is 0.

### 6.10 Confusion Matrix & Performance Metrics

After predictions are made on the test set, a confusion matrix is computed:

|  | **Predicted Positive** | **Predicted Negative** |
|--|----------------------|----------------------|
| **Actually Positive** | True Positive (TP) | False Negative (FN) |
| **Actually Negative** | False Positive (FP) | True Negative (TN) |

From this matrix, four performance metrics are calculated:

- **Accuracy** = (TP + TN) / Total — What percentage of all predictions were correct?
- **Precision** = TP / (TP + FP) — Of all the rows the model predicted as positive, how many were actually positive?
- **Recall** = TP / (TP + FN) — Of all the rows that were actually positive, how many did the model correctly identify?
- **F1 Score** = 2 × (Precision × Recall) / (Precision + Recall) — The harmonic mean of Precision and Recall, providing a balanced single number.

### 6.11 Per-Group Fairness Metrics

After computing overall metrics, FairLens computes the same metrics **separately for each demographic group**. For example, if the sensitive attribute is "Gender" with values "Male" and "Female":

- Male group: Prediction Rate, TPR, FPR, Precision, Accuracy
- Female group: Prediction Rate, TPR, FPR, Precision, Accuracy

The system then computes:
- **Model Disparate Impact:** The ratio of the lowest group's prediction rate to the highest group's prediction rate
- **Model Equalized Odds:** 1 minus the maximum of (TPR difference, FPR difference)
- **Model Statistical Parity:** The gap between the highest and lowest prediction rates

### 6.12 Feature Importance (Correlation-Based)

FairLens computes a feature importance ranking using **point-biserial correlation** between each feature and the target label:

```javascript
const correlation = Math.abs(cov / Math.sqrt(varF * varL));
```

Where `cov` is the covariance between the feature values and the labels, `varF` is the variance of the feature, and `varL` is the variance of the labels. Features with higher correlation have more influence on the outcome and are displayed in descending order.

---

<div style="page-break-after: always;"></div>

## 7. REMEDIATION ALGORITHMS (BACKEND)

When the user selects a remediation strategy on the Fix tab, the backend re-trains the model with a specific correction applied. Here is how each strategy works:

### 7.1 Re-weighting Strategy

**Goal:** Make the model pay equal attention to all groups, regardless of their size or historical outcome rate in the data.

**How it works:**
1. Compute the average positive outcome rate across all groups.
2. For each group, compute a weight: `weight = averageRate / groupRate × 1.5`.
3. During training, each row belonging to that group is repeated `Math.round(weight)` times. This means underrepresented groups (with low approval rates) get duplicated more, giving them more influence during training.

```javascript
const avgRate = Object.values(groups).reduce((s, g) => s + g.positive / g.total, 0) / numGroups;
weights[name] = groupRate > 0 ? Math.max(1, Math.round(avgRate / groupRate * 1.5)) : 2;
```

**Example:** If Group A has a 60% approval rate and Group B has a 30% approval rate, and the average is 45%:
- Weight for Group A = round(45/60 × 1.5) = round(1.125) = 1 (each row appears once)
- Weight for Group B = round(45/30 × 1.5) = round(2.25) = 2 (each row appears twice)

This doubles the representation of Group B in the training data, forcing the model to learn patterns that work better for Group B.

### 7.2 Proxy Removal Strategy

**Goal:** Remove features that are proxies for sensitive attributes. Even if you remove the "Gender" column from the model, other columns like "College Name" or "ZIP Code" can indirectly reveal gender or caste, allowing the model to discriminate through these proxies.

**How it works:**
1. Scan all column names against a predefined list of proxy keywords:
   - Geographic: zip, pin, postal, city, area, region, district, state, country, address, location
   - Institutional: college, school, university
   - Socioeconomic: property, vehicle, insurance, income_bracket
   - Personal: marital, name, neighborhood

2. Any column whose name contains one of these keywords is excluded from the model's feature set.
3. The model is retrained without these proxy columns.

```javascript
const PROXY_KEYWORDS = [
  'zip', 'pin', 'postal', 'city', 'area', 'region', 'district',
  'college', 'school', 'university', 'neighborhood', 'property',
  'vehicle', 'address', 'location', 'state', 'country', 'marital', 'name',
  'insurance', 'income_bracket', 'zip_risk'
];
const proxyCols = featureCols.filter(col =>
  PROXY_KEYWORDS.some(kw => col.toLowerCase().includes(kw))
);
```

### 7.3 Calibrated Equalized Odds Strategy

**Goal:** Aggressively equalize outcomes across groups by combining heavy re-weighting with a shallower, simpler model.

**How it works:**
1. Same as re-weighting, but with a higher multiplier (2.0 instead of 1.5), and a higher default weight for zero-rate groups (3 instead of 2).
2. The model's maximum depth is capped at 6 (shallower than default), making it simpler and less able to learn complex discriminatory patterns.

```javascript
weights[name] = groupRate > 0 ? Math.max(1, Math.round(avgRate / groupRate * 2)) : 3;
options.maxDepth = 6;
```

---

<div style="page-break-after: always;"></div>

## 8. DEPLOYMENT

### 8.1 Frontend — Firebase Hosting

The React + Vite frontend is compiled into a static production bundle using `npm run build`, which generates optimized HTML, CSS, and JavaScript files in the `client/dist/` directory. This directory is then deployed to **Firebase Hosting** using the Firebase CLI.

Firebase Hosting serves the files from Google's global CDN (Content Delivery Network), ensuring fast load times from anywhere in the world. The deployed URL is: `https://fairlens-f1922.web.app/`

### 8.2 Backend — Render Web Service

The Node.js Express server is deployed on **Render** as a Web Service. Render automatically detects the `package.json` in the `server/` directory, installs dependencies, and starts the server using the `npm start` command.

The deployment is configured through `render.yaml`:
- **Build Command:** `cd server && npm install`
- **Start Command:** `cd server && npm start`
- **Environment Variables:** `PORT`, `NODE_ENV`, `CLIENT_URL`

The deployed backend URL is: `https://fairlens-xo18.onrender.com/`

### 8.3 Environment Configuration

The frontend connects to the backend using the `VITE_API_URL` environment variable, set in `client/.env.production`:
```
VITE_API_URL=https://fairlens-xo18.onrender.com/api
```

The backend uses CORS (Cross-Origin Resource Sharing) to allow requests from the Firebase-hosted frontend:
```
CLIENT_URL=https://fairlens-f1922.web.app
```

---

<div style="page-break-after: always;"></div>

## 9. IMPLEMENTATION AND RESULTS

### 9.1 Development Procedure

1. **Frontend Development:** The React application was scaffolded using Vite 6 and developed component by component. The "Obsidian & Dune" dark theme design system was created using CSS custom properties for consistent styling.

2. **Backend Development:** The Node.js Express server was built with a modular structure. The ML engine (`modelEngine.js`) was developed and tested independently before being integrated with the API routes.

3. **Testing with Sample Datasets:** All 7 sample datasets were used to test the bias detection pipeline end-to-end, verifying that DIR, SPD, and intersectional calculations produced mathematically correct results.

4. **Performance Optimization:** The 3000-row cap and adaptive hyperparameters were introduced after observing that the Render free tier would time out (504 Gateway Timeout) on datasets larger than 8,000 rows. After this optimization, all datasets process in under 3 seconds.

### 9.2 Observations

**Hiring Bias Dataset (15K rows):**
- DIR for Gender: approximately 65% (FAILS 4/5ths Rule)
- After Re-weighting: DIR improved to approximately 92% (PASSES)
- Model Accuracy maintained above 70% after remediation

**Loan Approval Dataset (10K rows):**
- DIR for Caste_Category: approximately 55% (CRITICAL bias)
- Intersectional analysis revealed that "Female + SC/ST" had the lowest approval rate
- After Proxy Removal (removing ZIP code and college columns): DIR improved to approximately 78%

**Medical Dataset (12K rows):**
- DIR for Race: approximately 72% (MODERATE bias)
- After Calibrated EO: DIR improved to approximately 88% (PASSES)

### 9.3 Performance Analysis

| Metric | Before Optimization | After Optimization |
|--------|--------------------|--------------------|
| Server response time (15K rows) | 15–25 seconds (504 timeout) | 1.5–2.5 seconds |
| Intersectional Matrix computation | 3–5 seconds (server-side) | < 100ms (client-side) |
| ML model training (15K rows) | 20+ seconds | 1–3 seconds (3K sample) |

---

<div style="page-break-after: always;"></div>

## 10. CONCLUSION AND FUTURE SCOPE

### Conclusion

This project successfully developed and deployed **FairLens**, a fully functional AI-powered Bias Detection & Remediation Platform. The system achieves all of its stated objectives:

1. **Privacy-first data ingestion** using client-side PapaParse parsing — the user's raw data never leaves their browser.
2. **Rigorous statistical bias detection** using mathematically sound metrics (DIR, SPD, Equalized Odds) that match industry and legal standards.
3. **Intersectional bias analysis** that reveals compounded disadvantage across multiple protected attributes.
4. **A server-side ML model** (3-tree bagged ensemble) that trains in real-time and provides per-group fairness breakdowns.
5. **Three remediation strategies** (Re-weighting, Proxy Removal, Calibrated EO) that demonstrably improve fairness metrics.
6. **Compliance-ready reporting** with EEOC, DPDP Act, and EU AI Act checks, exportable as PDF.
7. **Zero-cost cloud deployment** on Firebase Hosting and Render.

The project demonstrates that meaningful AI fairness auditing does not require expensive enterprise tools or deep technical expertise. A well-designed web application, running on free cloud infrastructure, can make bias detection accessible to anyone with a browser.

### Future Scope

1. **In-Processing Mitigation:** Implement adversarial debiasing, where a secondary model is trained to prevent the primary model from learning demographic patterns.
2. **Unstructured Data Support:** Extend bias detection to image datasets (e.g., facial recognition bias) and text datasets (e.g., resume screening bias in NLP models).
3. **Bias Drift Monitoring:** Add a continuous monitoring feature that alerts users when a deployed model's fairness metrics degrade over time.
4. **Federated Learning:** Allow organizations to audit their models without sharing raw data, using federated computation.
5. **Additional Languages:** Expand beyond English and Hindi to support Marathi, Tamil, and other Indian languages.
6. **Integration with ML Pipelines:** Provide an API that can be integrated into existing MLOps pipelines (e.g., integration with MLflow or Kubeflow).

---

<div style="page-break-after: always;"></div>

## 11. REFERENCES

[1] Equal Employment Opportunity Commission (EEOC), "Uniform Guidelines on Employee Selection Procedures," 29 C.F.R. Part 1607, 1978.

[2] M. Hardt, E. Price, and N. Srebro, "Equality of Opportunity in Supervised Learning," *Advances in Neural Information Processing Systems (NeurIPS)*, 2016.

[3] S. Verma and J. Rubin, "Fairness Definitions Explained," in *Proceedings of the International Workshop on Software Fairness (FairWare)*, pp. 1–7, 2018.

[4] Government of India, "The Digital Personal Data Protection Act, 2023," Ministry of Electronics and Information Technology, 2023.

[5] European Parliament, "Regulation of the European Parliament and of the Council Laying Down Harmonised Rules on Artificial Intelligence (AI Act)," 2024.

[6] R. K. E. Bellamy et al., "AI Fairness 360: An Extensible Toolkit for Detecting, Understanding, and Mitigating Unwanted Algorithmic Bias," IBM Journal of Research and Development, 2019.

[7] L. Breiman, "Bagging Predictors," *Machine Learning*, vol. 24, no. 2, pp. 123–140, 1996.

[8] L. Breiman, J. Friedman, R. Olshen, and C. Stone, "Classification and Regression Trees," Wadsworth Publishing, 1984.

[9] K. Crenshaw, "Demarginalizing the Intersection of Race and Sex: A Black Feminist Critique of Antidiscrimination Doctrine," *University of Chicago Legal Forum*, 1989.

[10] PapaParse — Fast and Powerful CSV Parser for JavaScript, https://www.papaparse.com/

[11] ml-cart — Decision Tree Classifier for Node.js, https://github.com/mljs/decision-tree-cart

[12] React.js — A JavaScript Library for Building User Interfaces, https://react.dev/

[13] Vite — Next Generation Frontend Tooling, https://vitejs.dev/

[14] Firebase Hosting — Google Cloud Infrastructure, https://firebase.google.com/products/hosting

[15] Render — Cloud Application Hosting, https://render.com/
