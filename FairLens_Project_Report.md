<div align="center">

# FAIRLENS
## AI-POWERED BIAS DETECTION & REMEDIATION PLATFORM

**CREATIVE TECHNOLOGIES [2301183]**  
**FY B.Tech. (SEM II)**  
**TRACK- AI**  

**SUBMITTED BY**  
OM RAM VYAS (202501110101)  
MAHAJAN SARTHAK DILEEP (202501110093)  
KHUSHI YUVRAJ BODE (202501110037)  
SHIVANJALI SUNIL PATIL (202501110105)  

**GUIDED BY**  
Mrs. Aparna Kulkarni

</div>

\pagebreak

## CERTIFICATE
It is hereby certified that the work which is being presented in the FY B.Tech. Laboratory Project in the course Creative Technologies (2301183). The Report entitled “FairLens: AI-Powered Bias Detection & Remediation Platform”, in partial fulfillment of the requirements for the award of the Bachelor of Technology and submitted to the Department of Computer Science Engineering (AI-ML) of MIT Academy of Engineering, Alandi(D), Pune, Affiliated to Savitribai Phule Pune University (SPPU), Pune is an authentic record of work carried out during an Academic Year 2025-2026, under the supervision of Mrs. Aparna Kulkarni.

\pagebreak

## ACKNOWLEDGEMENT
We sincerely acknowledge the support and encouragement received throughout the development of this project.

We want to express our sincere gratitude towards our respected project guide Mrs. Aparna Kulkarni for her constant encouragement, insightful guidance, and valuable feedback throughout the completion of this project. We are also deeply grateful to the respected School Dean for providing continuous support and motivation. We would be failing in our duty if we did not thank all the other faculty members and staff of the Department of Computer Science Engineering (AI-ML) for their experienced advice and wholehearted co-operation. Finally, we thank our families and peers for their moral support during the course of this project.

\pagebreak

## 1. INTRODUCTION
### 1.1 Motivations
The primary motivation for this project stems from the growing relevance of ethical artificial intelligence. AI models make life-altering decisions daily—screening resumes, scoring credits, prioritizing medical care, and directing law enforcement. However, these models learn from historical datasets containing implicit human and systemic biases, often compounding and cementing inequalities. As students of B.Tech CSE (AI & ML), working on a project that bridges statistical machine learning theory with real-world fairness audits was a compelling choice.

### 1.2 Problem Statement
Existing bias detection systems are either highly technical command-line libraries or lack localized context. This project aims to build a comprehensive, lightweight web application (FairLens) to audit, explain, and mitigate algorithmic bias in ML datasets interactively from any browser.

### 1.3 Objectives and Scope
The key objectives of this project are:
(1) To design a client-side parser to ingest CSV datasets securely.
(2) To implement mathematical algorithms for Disparate Impact Ratio (DIR) and Statistical Parity Difference (SPD).
(3) To compute an Intersectional Bias Matrix locally.
(4) To build a server-side Random Forest ensemble model to simulate remediations dynamically while capping processing at 3000 rows to ensure zero-latency feedback.
(5) To deploy the frontend to Firebase and backend to Render.

\pagebreak

## 2. LITERATURE SURVEY
Algorithmic fairness is categorized primarily into group fairness and individual fairness. Disparate Impact Ratio (DIR), rooted in the EEOC Uniform Guidelines, is defined mathematically as the ratio of favorable outcomes for the unprivileged group over the privileged group. The ideal score is 1.0, but values above 0.80 are generally considered legally compliant under the "four-fifths rule". Statistical Parity Difference (SPD) calculates the raw gap between these rates. 

Machine learning mitigation strategies are conventionally split into three types: pre-processing (modifying the dataset before training), in-processing (altering the model learning objective), and post-processing (calibrating outputs). In this project, we implement pre-processing strategies—specifically Re-weighting (which dynamically balances class weights based on frequency) and Proxy Removal (which eliminates columns highly correlated to sensitive attributes).

\pagebreak

## 3. SYSTEM DESIGN
### 3.1 Block Diagram / Proposed System Setup
The proposed system follows a cloud-native client-server architecture:
Client (Browser) -> Firebase Hosting -> Node.js Express Server (Render) -> ML Engine (Bagging Trees)

### 3.2 Use Case Diagram
The primary actors are: (a) End User (Data Scientist/Compliance Officer), who loads a CSV and defines targets; (b) The Client-Side Engine, which parses the CSV and computes the intersectional matrix; and (c) The Server-Side ML Engine, which trains a Random Forest ensemble model for simulation.

### 3.3 Mathematical Modelling & Backend Calculations
**Statistical Parity Difference (SPD)**:
SPD = P(Y=1 | D=Unprivileged) - P(Y=1 | D=Privileged)
This calculates the difference in approval rates. A value of 0 implies perfect parity.

**Disparate Impact Ratio (DIR)**:
DIR = P(Y=1 | D=Unprivileged) / P(Y=1 | D=Privileged)
This measures the proportional impact. A value below 0.8 indicates adverse impact.

**Intersectional Matrix**:
For overlapping attributes (e.g. Race and Gender), the matrix is computed with an O(N) client-side aggregation algorithm. We hash rows by their attribute permutations key = v1_v2, tally the occurrences (count), and the positive outcomes (positiveCount), resolving the compound approval rate: ate = positiveCount / count.

**Server-Side Ensemble ML (Random Forest Bagging)**:
To predict mitigation impacts, a custom Decision Tree Bagging Ensemble is utilized. 
- **Downsampling**: For performance, maxRows = Math.min(cleanRows.length, 3000). Datasets are truncated to 3000 random rows to ensure real-time web responsiveness.
- **Reweighting Strategy**: Sample weights are applied by oversampling the minority class: weight = weightMap[group], and rows are repeated Math.round(weight) times.
- **Hyperparameters**: Adaptive depth where maxDepth = 12 for large sets and maxDepth = 8 for smaller sets. Number of estimators is fixed to 3 trees (
umTrees = 3).
- **Prediction**: Ensemble voting is done via ones > votes.length / 2 ? 1 : 0.

\pagebreak

## 4. IMPLEMENTATION AND RESULTS
### 4.1 Procedure and Setup
1. The frontend was developed in React.js and Vite, configured to use PapaParse for client-side data ingestion, ensuring privacy.
2. The backend was written in Node.js, utilizing ml-cart to build decision trees from scratch.
3. The intersectional matrix calculation was offloaded to the client for zero-latency UI updates.
4. The frontend was deployed on Firebase Hosting, and the backend was hosted on Render as a Web Service.

### 4.2 Results & Analysis
The platform correctly identifies severe biases in HR and Loan datasets. When applying the **Re-weighting** strategy via the Fix tab, the Disparate Impact Ratio successfully increases from failing levels (e.g., 0.65) to passing levels (e.g., 0.95), bringing the dataset into EEOC compliance without a drastic loss in model Accuracy or F1 score. The downsampling limitation (3000 rows) proved highly effective, keeping server response times under 200ms during ML training and eliminating 504 Gateway Timeouts.

\pagebreak

## 5. CONCLUSION AND FUTURE SCOPE
This project successfully developed and deployed FairLens, an AI-powered Bias Detection & Remediation Platform. The system correctly identifies demographic disparities, visualizes compounded disadvantage using a client-side Intersectional Matrix, and successfully applies mathematical mitigation strategies (such as Re-weighting and Proxy Removal) via a backend Random Forest engine. The deployment to Firebase and Render guarantees zero-cost public accessibility.

**Future Scope:**
(1) Implementing in-processing mitigation algorithms (e.g. Adversarial Debiasing).
(2) Supporting unstructured data formats (e.g., Image and Text bias auditing).
(3) Adding federated learning protocols for enhanced corporate privacy.

\pagebreak

## 6. REFERENCES
[1] EEOC Uniform Guidelines on Employee Selection Procedures (1978).
[2] "Equality of Opportunity in Supervised Learning", Hardt et al., NeurIPS 2016.
[3] "Fairness Definitions Explained", Verma and Rubin, 2018.
[4] India Digital Personal Data Protection (DPDP) Act, 2023.
