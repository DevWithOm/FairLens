// ═══════════════════════════════════════════════════════
// FairLens — Synthetic Dataset Generator (10K+ rows)
// Generates realistic datasets with deliberate bias patterns
// ═══════════════════════════════════════════════════════
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const DATASETS_DIR = path.resolve(__dirname, '../../Datasets')

// ── Seeded PRNG for reproducibility ──
function createRNG(seed = 42) {
  let s = seed
  return {
    next() { s = (s * 16807 + 12345) % 2147483647; return s / 2147483647 },
    int(min, max) { return Math.floor(this.next() * (max - min + 1)) + min },
    pick(arr) { return arr[this.int(0, arr.length - 1)] },
    normal(mean = 0, std = 1) {
      const u1 = this.next(), u2 = this.next()
      return mean + std * Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2)
    },
    chance(p) { return this.next() < p }
  }
}

// ═══════════════════════════════════════════════
// 1. Large Loan Dataset (10,000 rows)
// ═══════════════════════════════════════════════
function generateLoanDataset(n = 10000) {
  const rng = createRNG(2024)
  const header = 'Gender,Age,Married,Dependents,Education,Self_Employed,ApplicantIncome,CoapplicantIncome,LoanAmount,Loan_Amount_Term,Credit_History,Property_Area,Religion,Caste_Category,loan_approved'

  const genders = ['Male', 'Female', 'Other']
  const genderWeights = [0.65, 0.30, 0.05]
  const education = ['Graduate', 'Not_Graduate']
  const propertyAreas = ['Urban', 'Semiurban', 'Rural']
  const religions = ['Hindu', 'Muslim', 'Christian', 'Sikh', 'Other']
  const castes = ['General', 'OBC', 'SC', 'ST']
  const casteWeights = [0.30, 0.35, 0.20, 0.15]

  function weightedPick(arr, weights) {
    const r = rng.next()
    let cumulative = 0
    for (let i = 0; i < arr.length; i++) {
      cumulative += weights[i]
      if (r < cumulative) return arr[i]
    }
    return arr[arr.length - 1]
  }

  const rows = []
  for (let i = 0; i < n; i++) {
    const gender = weightedPick(genders, genderWeights)
    const age = rng.int(21, 65)
    const married = rng.chance(0.6) ? 'Yes' : 'No'
    const deps = rng.pick(['0', '1', '2', '3+'])
    const edu = rng.chance(0.7) ? 'Graduate' : 'Not_Graduate'
    const selfEmp = rng.chance(0.15) ? 'Yes' : 'No'

    // Income with gender bias (intentional)
    let baseIncome = rng.normal(5000, 3000)
    if (gender === 'Female') baseIncome *= 0.78 // gender pay gap
    if (gender === 'Other') baseIncome *= 0.72
    if (edu === 'Graduate') baseIncome *= 1.4
    baseIncome = Math.max(1000, Math.round(baseIncome))

    const coIncome = married === 'Yes' ? Math.round(Math.max(0, rng.normal(2000, 1500))) : 0
    const loanAmt = Math.round(Math.max(20, rng.normal(150, 80)))
    const term = rng.pick([60, 120, 180, 240, 300, 360])
    const creditHist = rng.chance(0.7) ? 'Clear' : rng.chance(0.5) ? 'Defaulted' : 'Unknown'
    const area = rng.pick(propertyAreas)
    const religion = weightedPick(religions, [0.45, 0.25, 0.15, 0.08, 0.07])
    const caste = weightedPick(castes, casteWeights)

    // Approval logic with systematic bias
    let approveProb = 0.5
    // Legitimate factors
    if (creditHist === 'Clear') approveProb += 0.25
    if (creditHist === 'Defaulted') approveProb -= 0.30
    if (edu === 'Graduate') approveProb += 0.10
    if (baseIncome > 6000) approveProb += 0.10
    if (loanAmt > 200) approveProb -= 0.10
    if (coIncome > 2000) approveProb += 0.05
    
    // Biased factors (what FairLens should detect)
    if (gender === 'Female') approveProb -= 0.12
    if (gender === 'Other') approveProb -= 0.18
    if (caste === 'SC') approveProb -= 0.10
    if (caste === 'ST') approveProb -= 0.15
    if (religion === 'Muslim') approveProb -= 0.08

    approveProb = Math.max(0.05, Math.min(0.95, approveProb))
    const approved = rng.chance(approveProb) ? 'Approved' : 'Rejected'

    rows.push(`${gender},${age},${married},${deps},${edu},${selfEmp},${baseIncome},${coIncome},${loanAmt},${term},${creditHist},${area},${religion},${caste},${approved}`)
  }

  return header + '\n' + rows.join('\n') + '\n'
}

// ═══════════════════════════════════════════════
// 2. Large HR Hiring Dataset (15,000 rows)
// ═══════════════════════════════════════════════
function generateHRDataset(n = 15000) {
  const rng = createRNG(1337)
  const header = 'candidate_id,age,gender,race,education_level,years_experience,skills_score,interview_score,referral,department,location,disability_status,veteran_status,hired'

  const genders = ['Male', 'Female', 'Non-binary']
  const races = ['White', 'Black', 'Hispanic', 'Asian', 'Other']
  const raceWeights = [0.50, 0.15, 0.18, 0.12, 0.05]
  const eduLevels = ['High School', 'Bachelors', 'Masters', 'PhD']
  const departments = ['Engineering', 'Marketing', 'Sales', 'Finance', 'HR', 'Operations']
  const locations = ['New York', 'San Francisco', 'Chicago', 'Austin', 'Remote']
  const disabilityStatuses = ['None', 'Physical', 'Cognitive', 'Sensory']

  function weightedPick(arr, weights) {
    const r = rng.next()
    let cumulative = 0
    for (let i = 0; i < arr.length; i++) {
      cumulative += weights[i]
      if (r < cumulative) return arr[i]
    }
    return arr[arr.length - 1]
  }

  const rows = []
  for (let i = 0; i < n; i++) {
    const cid = 100000 + i
    const age = rng.int(22, 62)
    const gender = weightedPick(genders, [0.55, 0.40, 0.05])
    const race = weightedPick(races, raceWeights)
    const edu = weightedPick(eduLevels, [0.20, 0.40, 0.30, 0.10])
    const yrsExp = rng.int(0, 30)
    const skillsScore = Math.min(100, Math.max(10, Math.round(rng.normal(65, 18))))
    const interviewScore = Math.min(10, Math.max(1, Math.round(rng.normal(6.5, 2))))
    const referral = rng.chance(0.25) ? 'Yes' : 'No'
    const dept = rng.pick(departments)
    const loc = rng.pick(locations)
    const disability = rng.chance(0.08) ? rng.pick(['Physical', 'Cognitive', 'Sensory']) : 'None'
    const veteran = rng.chance(0.07) ? 'Yes' : 'No'

    // Hiring decision with bias
    let hireProb = 0.35
    // Legitimate
    if (skillsScore > 75) hireProb += 0.15
    if (interviewScore >= 7) hireProb += 0.15
    if (interviewScore >= 9) hireProb += 0.10
    if (edu === 'Masters') hireProb += 0.08
    if (edu === 'PhD') hireProb += 0.12
    if (yrsExp > 5) hireProb += 0.08
    if (yrsExp > 15) hireProb += 0.05
    if (referral === 'Yes') hireProb += 0.10

    // Bias (what FairLens should find)
    if (gender === 'Female') hireProb -= 0.08
    if (gender === 'Non-binary') hireProb -= 0.14
    if (race === 'Black') hireProb -= 0.10
    if (race === 'Hispanic') hireProb -= 0.07
    if (age > 50) hireProb -= 0.12
    if (disability !== 'None') hireProb -= 0.15

    hireProb = Math.max(0.05, Math.min(0.95, hireProb))
    const hired = rng.chance(hireProb) ? 'Yes' : 'No'

    rows.push(`${cid},${age},${gender},${race},${edu},${yrsExp},${skillsScore},${interviewScore},${referral},${dept},${loc},${disability},${veteran},${hired}`)
  }

  return header + '\n' + rows.join('\n') + '\n'
}

// ═══════════════════════════════════════════════
// 3. Large Medical Treatment Dataset (12,000 rows)
// ═══════════════════════════════════════════════
function generateMedicalDataset(n = 12000) {
  const rng = createRNG(7777)
  const header = 'patient_id,age,sex,race,insurance_type,bmi,blood_pressure_systolic,cholesterol,smoker,diabetes,prior_conditions,pain_score,er_visits_past_year,income_bracket,zip_risk_level,treatment_approved'

  const sexes = ['Male', 'Female']
  const races = ['White', 'Black', 'Hispanic', 'Asian', 'Native American', 'Other']
  const raceWeights = [0.52, 0.14, 0.19, 0.07, 0.03, 0.05]
  const insuranceTypes = ['Private', 'Medicare', 'Medicaid', 'Uninsured']
  const incomeBrackets = ['Low', 'Middle', 'High']

  function weightedPick(arr, weights) {
    const r = rng.next()
    let cumulative = 0
    for (let i = 0; i < arr.length; i++) {
      cumulative += weights[i]
      if (r < cumulative) return arr[i]
    }
    return arr[arr.length - 1]
  }

  const rows = []
  for (let i = 0; i < n; i++) {
    const pid = 200000 + i
    const age = rng.int(18, 90)
    const sex = rng.chance(0.48) ? 'Male' : 'Female'
    const race = weightedPick(races, raceWeights)
    const insurance = weightedPick(insuranceTypes, [0.45, 0.20, 0.20, 0.15])
    const bmi = Math.round(rng.normal(27, 6) * 10) / 10
    const bp = rng.int(100, 180)
    const chol = rng.int(150, 350)
    const smoker = rng.chance(0.20) ? 'Yes' : 'No'
    const diabetes = rng.chance(0.12) ? 'Yes' : 'No'
    const priorConds = rng.int(0, 5)
    const painScore = rng.int(1, 10)
    const erVisits = rng.int(0, 8)
    const income = weightedPick(incomeBrackets, [0.35, 0.40, 0.25])
    const zipRisk = rng.pick(['Low', 'Medium', 'High'])

    // Treatment approval with bias
    let approveProb = 0.55
    // Legitimate clinical factors
    if (painScore >= 7) approveProb += 0.15
    if (bp > 150) approveProb += 0.10
    if (priorConds >= 3) approveProb += 0.08
    if (diabetes === 'Yes') approveProb += 0.05
    if (erVisits >= 3) approveProb += 0.10
    if (bmi > 35) approveProb += 0.05

    // Insurance-based bias
    if (insurance === 'Private') approveProb += 0.12
    if (insurance === 'Uninsured') approveProb -= 0.20
    if (insurance === 'Medicaid') approveProb -= 0.10

    // Demographic bias (what FairLens should detect)
    if (race === 'Black') approveProb -= 0.12
    if (race === 'Hispanic') approveProb -= 0.08
    if (race === 'Native American') approveProb -= 0.15
    if (sex === 'Female' && painScore < 8) approveProb -= 0.06 // pain dismissed
    if (age > 75) approveProb -= 0.10
    if (income === 'Low') approveProb -= 0.08

    approveProb = Math.max(0.05, Math.min(0.95, approveProb))
    const approved = rng.chance(approveProb) ? 'Yes' : 'No'

    rows.push(`${pid},${age},${sex},${race},${insurance},${bmi},${bp},${chol},${smoker},${diabetes},${priorConds},${painScore},${erVisits},${income},${zipRisk},${approved}`)
  }

  return header + '\n' + rows.join('\n') + '\n'
}

// ═══════════════════════════════════════════════
// 4. Criminal Justice Risk Assessment (10,000 rows)
// ═══════════════════════════════════════════════
function generateCriminalJusticeDataset(n = 10000) {
  const rng = createRNG(5555)
  const header = 'defendant_id,age,sex,race,prior_offenses,offense_severity,employment_status,education,marital_status,substance_abuse,mental_health,neighborhood_crime_rate,bail_amount,time_served_months,recidivism_risk,low_risk_approved'

  const races = ['White', 'Black', 'Hispanic', 'Asian', 'Other']
  const raceWeights = [0.45, 0.28, 0.18, 0.05, 0.04]
  const severities = ['Misdemeanor', 'Felony_Low', 'Felony_Mid', 'Felony_High']
  const employment = ['Employed', 'Unemployed', 'Part-time', 'Self-employed']
  const edus = ['No_HS', 'High_School', 'Some_College', 'Bachelors', 'Graduate']

  function weightedPick(arr, weights) {
    const r = rng.next()
    let cumulative = 0
    for (let i = 0; i < arr.length; i++) {
      cumulative += weights[i]
      if (r < cumulative) return arr[i]
    }
    return arr[arr.length - 1]
  }

  const rows = []
  for (let i = 0; i < n; i++) {
    const did = 300000 + i
    const age = rng.int(18, 70)
    const sex = rng.chance(0.75) ? 'Male' : 'Female'
    const race = weightedPick(races, raceWeights)
    const priors = rng.int(0, 12)
    const severity = weightedPick(severities, [0.40, 0.25, 0.20, 0.15])
    const emp = weightedPick(employment, [0.45, 0.30, 0.15, 0.10])
    const edu = weightedPick(edus, [0.15, 0.30, 0.25, 0.20, 0.10])
    const marital = rng.pick(['Single', 'Married', 'Divorced', 'Widowed'])
    const substance = rng.chance(0.30) ? 'Yes' : 'No'
    const mentalHealth = rng.chance(0.20) ? 'Yes' : 'No'
    const crimeRate = Math.round(rng.normal(50, 25) * 10) / 10
    const bail = Math.round(Math.max(500, rng.normal(5000, 4000)))
    const timeServed = rng.int(0, 60)

    // Risk score with demographic bias
    let riskScore = rng.normal(50, 20)
    if (priors > 3) riskScore += 15
    if (substance === 'Yes') riskScore += 10
    if (emp === 'Unemployed') riskScore += 8
    if (severity === 'Felony_High') riskScore += 12

    // Bias baked into the risk score
    if (race === 'Black') riskScore += 12
    if (race === 'Hispanic') riskScore += 7
    if (sex === 'Male') riskScore += 5
    if (age < 25) riskScore += 6

    const riskLabel = riskScore > 60 ? 'High' : riskScore > 40 ? 'Medium' : 'Low'

    // Low-risk approved (e.g. alternative sentencing)
    let approveProb = riskLabel === 'Low' ? 0.75 : riskLabel === 'Medium' ? 0.40 : 0.15
    if (race === 'Black') approveProb -= 0.10
    if (race === 'Hispanic') approveProb -= 0.06
    if (sex === 'Male') approveProb -= 0.05

    approveProb = Math.max(0.03, Math.min(0.95, approveProb))
    const approved = rng.chance(approveProb) ? 'Yes' : 'No'

    rows.push(`${did},${age},${sex},${race},${priors},${severity},${emp},${edu},${marital},${substance},${mentalHealth},${Math.max(0, crimeRate)},${bail},${timeServed},${riskLabel},${approved}`)
  }

  return header + '\n' + rows.join('\n') + '\n'
}

// ═══════════════════════════════════════════════
// Generate all datasets
// ═══════════════════════════════════════════════
console.log('🔧 Generating large synthetic datasets...\n')

const datasets = [
  { name: 'loan_bias_10k.csv', fn: generateLoanDataset, count: 10000 },
  { name: 'hiring_bias_15k.csv', fn: generateHRDataset, count: 15000 },
  { name: 'medical_bias_12k.csv', fn: generateMedicalDataset, count: 12000 },
  { name: 'justice_bias_10k.csv', fn: generateCriminalJusticeDataset, count: 10000 },
]

for (const ds of datasets) {
  const start = Date.now()
  const csv = ds.fn(ds.count)
  const filePath = path.join(DATASETS_DIR, ds.name)
  fs.writeFileSync(filePath, csv)
  const sizeKB = Math.round(fs.statSync(filePath).size / 1024)
  console.log(`✅ ${ds.name}: ${ds.count.toLocaleString()} rows • ${sizeKB} KB • ${Date.now() - start}ms`)
}

console.log('\n🎉 All datasets generated!')
