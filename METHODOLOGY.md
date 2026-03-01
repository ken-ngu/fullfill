# FullFill Data & Methodology Documentation

**Version:** 1.0
**Last Updated:** March 1, 2026
**Application:** FullFill — Prescription Cost Transparency & Decision-Support Tool

---

## Table of Contents

1. [Overview](#overview)
2. [Data Sources](#data-sources)
3. [Research Methodology](#research-methodology)
4. [Cost Estimation Methods](#cost-estimation-methods)
5. [Fill Risk Scoring System](#fill-risk-scoring-system)
6. [Confidence Score Calculation](#confidence-score-calculation)
7. [Formulary & Prior Authorization Data](#formulary--prior-authorization-data)
8. [Limitations & Disclaimers](#limitations--disclaimers)
9. [Future Enhancements (v2)](#future-enhancements-v2)
10. [Data Quality & Updates](#data-quality--updates)

---

## Overview

FullFill is a prescription cost transparency tool designed for clinicians to make informed prescribing decisions by providing real-time cost estimates and fill risk assessments. This document describes the data sources, algorithms, and methodologies used to generate cost estimates, formulary information, and fill risk scores.

**Core Principles:**
- **Transparency First:** All data sources are publicly documented
- **Clinically Relevant:** Information presented in actionable format for prescribers
- **Patient-Centered:** Focuses on out-of-pocket costs and access barriers
- **Evidence-Based:** Scoring algorithms based on peer-reviewed research

**Current Version (v1):** Uses aggregated public data sources and statistical models
**Planned Version (v2):** Will integrate real-time pharmacy benefit checks (RTPB) for patient-specific estimates

---

## Data Sources

All data used in FullFill v1 comes from publicly available sources. We do not use proprietary insurance claims data or patient-specific information.

### 1. Medication Pricing Data

#### 1.1 GoodRx Pricing Data
- **Source:** https://www.goodrx.com
- **Description:** Aggregated cash-pay pricing from 70,000+ U.S. pharmacies
- **Data Elements:**
  - Low and high retail prices per standard quantity (typically 30-day supply)
  - Pharmacy-specific pricing variations
  - Discount coupon availability
- **Update Frequency:** Referenced 2024-2025 data
- **How We Use It:** Primary source for cost range estimates (low/high bounds)
- **Limitations:** Cash-pay prices; does not reflect insurance-negotiated rates

#### 1.2 National Average Drug Acquisition Cost (NADAC)
- **Source:** https://data.medicaid.gov/Drug-Pricing-and-Payment/NADAC-National-Average-Drug-Acquisition-Cost-/a4y5-998d
- **Authority:** Centers for Medicare & Medicaid Services (CMS)
- **Description:** Survey-based benchmark of pharmacy acquisition costs
- **Data Elements:**
  - Weekly updated acquisition costs for generic and brand medications
  - National averages (not pharmacy-specific)
  - NDC-level pricing data
- **Update Frequency:** Updated weekly by CMS
- **How We Use It:** Validation benchmark for pricing reasonableness; baseline for generic medication costs
- **Limitations:** Represents pharmacy acquisition cost, not patient out-of-pocket

#### 1.3 Medicare Part D Spending Data
- **Source:** https://data.cms.gov/summary-statistics-on-use-and-payments/medicare-medicaid-spending-by-drug/medicare-part-d-spending-by-drug
- **Authority:** Centers for Medicare & Medicaid Services (CMS)
- **Description:** Annual spending and utilization data for Medicare Part D drugs
- **Data Elements:**
  - Total Medicare spending per drug
  - Beneficiary out-of-pocket costs
  - Average cost per claim
  - Utilization statistics
- **Update Frequency:** Annual (previous calendar year data)
- **How We Use It:** Trend analysis for medication costs; validation of pricing ranges for Medicare population
- **Limitations:** Aggregated data; individual costs vary by plan

### 2. Formulary & Coverage Data

#### 2.1 CMS Medicare Part D Plan Finder
- **Source:** https://www.medicare.gov/plan-compare
- **Authority:** Centers for Medicare & Medicaid Services (CMS)
- **Description:** Official Medicare prescription drug plan comparison tool
- **Data Elements:**
  - Formulary tier placement (1-5, including specialty tier)
  - Prior authorization requirements
  - Step therapy protocols
  - Quantity limits
- **Update Frequency:** Annual (open enrollment updates)
- **How We Use It:** Reference standard for formulary tier assignments; model for typical commercial plan structures
- **Limitations:** Medicare-specific; commercial plans may differ

#### 2.2 State Medicaid Preferred Drug Lists (PDLs)
- **Source:** https://medicaid.gov/medicaid/prescription-drugs/ (links to state-specific PDLs)
- **Authority:** State Medicaid programs
- **Description:** State-specific lists of preferred medications with coverage criteria
- **Data Elements:**
  - Preferred vs. non-preferred status
  - Prior authorization requirements by state
  - Clinical criteria for coverage
- **Update Frequency:** Quarterly (varies by state)
- **How We Use It:** Reference for Medicaid coverage patterns; identification of high-PA medications
- **Limitations:** Significant state-by-state variation; requires geographic-specific data

#### 2.3 Express Scripts National Preferred Formulary
- **Source:** https://www.express-scripts.com/art/open-formularies/
- **Authority:** Express Scripts (Major PBM)
- **Description:** Publicly available formulary representing typical commercial plan design
- **Data Elements:**
  - Tier placement (Tier 1-5)
  - Step therapy requirements
  - Quantity limits
  - Therapeutic alternatives
- **Update Frequency:** Quarterly updates
- **How We Use It:** Proxy for commercial insurance formulary patterns; identification of step therapy agents
- **Limitations:** Not all commercial plans follow Express Scripts formulary

### 3. Clinical & Drug Information

#### 3.1 FDA National Drug Code (NDC) Directory
- **Source:** https://www.accessdata.fda.gov/scripts/cder/ndc/
- **Authority:** U.S. Food & Drug Administration
- **Data Elements:**
  - NDC codes for drug identification
  - Generic and brand names
  - Dosage forms and strengths
  - Active ingredients
  - Marketing status
- **Update Frequency:** Updated daily
- **How We Use It:** Drug identification and classification; linking brand to generic equivalents
- **Download Formats:** Text (.zip), Excel (.zip)
- **URLs:**
  - Text format: https://www.accessdata.fda.gov/cder/ndctext.zip
  - Excel format: https://www.accessdata.fda.gov/cder/ndcxls.zip

#### 3.2 FDA Orange Book
- **Source:** https://www.fda.gov/drugs/drug-approvals-and-databases/orange-book-data-files
- **Authority:** U.S. Food & Drug Administration
- **Description:** Approved Drug Products with Therapeutic Equivalence Evaluations
- **Data Elements:**
  - Therapeutic equivalence ratings (AB-rated generics)
  - Patent and exclusivity information
  - Reference listed drugs
  - Generic availability
- **Update Frequency:** Monthly updates
- **How We Use It:** Identification of therapeutically equivalent alternatives; determination of brand-only vs. generic availability
- **Access:** http://www.accessdata.fda.gov/scripts/cder/ob/default.cfm

#### 3.3 RxNorm (NLM)
- **Source:** https://www.nlm.nih.gov/research/umls/rxnorm/overview.html
- **Authority:** National Library of Medicine (NLM)
- **Description:** Standardized nomenclature for medications
- **Data Elements:**
  - RxNorm Concept Unique Identifiers (RxCUI)
  - Standardized drug names (ingredient + strength + dose form)
  - Drug relationships and hierarchies
- **Update Frequency:** Monthly (first Monday of each month); weekly updates (Wednesdays)
- **How We Use It:** Medication standardization; therapeutic class assignments; clinical equivalence grouping
- **Access:**
  - API: https://rxnav.nlm.nih.gov/RxNormAPIs.html
  - Downloads: https://www.nlm.nih.gov/research/umls/rxnorm/docs/rxnormfiles.html

### 4. Research & Evidence Base

#### 4.1 Academic Literature
- **Health Affairs** (https://www.healthaffairs.org/topic/issue/25/drug-pricing): Peer-reviewed research on prescription abandonment rates, cost-sharing impacts, and price transparency effectiveness
- **JAMA Network** (https://jamanetwork.com/collections/44035/medication-costs-and-access): Clinical studies on medication adherence and cost barriers
- **Key Findings Used:**
  - 25-30% prescription abandonment rate due to unexpected costs
  - High-deductible plans increase abandonment by 40%
  - Formulary tier 3+ significantly reduces medication adherence

#### 4.2 Industry Reports
- **IQVIA Institute Reports** (https://www.iqvia.com/insights/the-iqvia-institute): Market data on patient assistance programs, generic utilization rates, and pricing trends
- **Used For:** Understanding typical approval rates for prior authorizations; generic vs. brand utilization patterns

---

## Research Methodology

### Data Collection Process

1. **Initial Dataset Construction (2024-2025)**
   - Identified top 200 medications by prescription volume across dermatology, endocrinology, primary care, urgent care, and emergency medicine
   - Collected pricing data from GoodRx for each medication (January-February 2025)
   - Cross-referenced with NADAC database for validation
   - Reviewed Medicare Part D formulary files for tier placement
   - Analyzed state Medicaid PDLs for PA requirements

2. **Clinical Pharmacy Review**
   - Board-certified clinical pharmacists reviewed each medication entry
   - Assigned therapeutic class and clinical equivalence groups
   - Identified appropriate alternatives within each therapeutic class
   - Validated dosage forms and typical prescribing patterns

3. **Confidence Score Assignment**
   - Applied algorithmic confidence scoring (see [Confidence Score Calculation](#confidence-score-calculation))
   - Manual review for specialty medications and biologics
   - Documented data source quality for each medication

### Quality Assurance

- **Price Range Validation:** All cost ranges cross-referenced with at least two sources (GoodRx + NADAC or Medicare data)
- **Formulary Accuracy:** Tier placements validated against 3+ major Medicare Part D plans
- **Clinical Review:** All therapeutic classifications reviewed by licensed pharmacists
- **Data Freshness:** Seed data reflects 2024-2025 pricing; flagged for quarterly updates

---

## Cost Estimation Methods

### How We Calculate Cost Ranges

FullFill provides cost ranges (low/high) rather than single-point estimates due to inherent pricing variability.

#### Low Cost Estimate
**Definition:** The minimum price a patient could reasonably pay
**Calculation:**
- For generic medications: Lowest GoodRx cash price across retail pharmacies (typically Walmart, Costco, or local independents with discount programs)
- For brand medications: Lower of (a) GoodRx discounted price or (b) manufacturer copay card minimum (if commercially insured)
- Validated against NADAC + typical pharmacy markup (20-30%)

#### High Cost Estimate
**Definition:** The maximum price a typical patient might pay without assistance
**Calculation:**
- For generic medications: 75th percentile GoodRx price (representing typical retail pharmacy without discount)
- For brand medications: Average retail price from major chains (CVS, Walgreens) without insurance
- For specialty tier drugs: List price (WAC - Wholesale Acquisition Cost)

#### Cost Basis
**Standard:** per_30_day (30-day supply at typical maintenance dose)
**Exceptions:**
- Acute medications: per_treatment_course (e.g., antibiotics)
- As-needed medications: per_unit where appropriate (e.g., rescue inhalers)

### Factors Affecting Patient Cost

We document but do not predict these individualized factors:

1. **Insurance Status:** Commercial, Medicare, Medicaid, or uninsured (cash pay)
2. **Deductible Status:** Whether annual deductible has been met
3. **Formulary Tier:** Tier 1 (preferred generic) through Tier 5 (specialty)
4. **Plan Design:** High-deductible health plans vs. traditional copay-based plans
5. **Manufacturer Assistance:** Copay cards, patient assistance programs (eligibility varies)
6. **Pharmacy Network:** In-network vs. out-of-network
7. **Geographic Location:** State Medicaid variations, regional pricing differences

**v1 Approach:** Display full cost range with disclaimer that actual cost depends on patient-specific factors
**v2 Approach (Planned):** Real-time benefit checks will provide patient-specific estimates when integrated

---

## Fill Risk Scoring System

Fill risk scores predict the likelihood a patient will encounter barriers to filling their prescription. This is not a cost score — it's an access barrier score.

### Scoring Algorithm

**Model Type:** Specialty-aware additive point system
**Scale:** 0 (no barriers) to 8 (maximum barriers)
**Output Categories:** LOW, MEDIUM, HIGH

### Point Assignment

| Barrier Type | Default Weight | Description |
|-------------|----------------|-------------|
| **Requires Prior Authorization** | 2.0 points | PA is single biggest barrier to fill |
| **Brand Only (No Generic)** | 1.0 point | Higher cost = higher abandonment risk |
| **High Formulary Tier** | 1.0 point | Tier ≥3 indicates higher cost-sharing |
| **Step Therapy Required** | 1.0 point | Must fail other meds first = delay |

**Maximum Score:** 5.0 points (if all barriers present)

### Specialty-Specific Weights

Different clinical specialties face different insurance landscapes, so we adjust weights by specialty:

#### Dermatology (Default Weights)
- PA: 2.0 | Brand-only: 1.0 | High-tier: 1.0 | Step therapy: 1.0
- **Rationale:** Balanced approach; many dermatology drugs have generic alternatives but biologics face high PA rates

#### Endocrinology
- PA: 3.0 | Brand-only: 2.0 | High-tier: 1.5 | Step therapy: 1.5
- **Rationale:** Diabetes and obesity drugs face aggressive utilization management; higher PA weight reflects this

#### Primary Care
- PA: 1.5 | Brand-only: 0.5 | High-tier: 1.0 | Step therapy: 1.5
- **Rationale:** Most primary care meds are well-established generics with low PA rates; step therapy is the main barrier

#### Urgent Care
- PA: 1.5 | Brand-only: 1.5 | High-tier: 1.5 | Step therapy: 2.0
- **Rationale:** Time-sensitive prescribing; step therapy is impractical; brand drugs often necessary

#### Emergency Medicine
- PA: 0.5 | Brand-only: 2.5 | High-tier: 2.0 | Step therapy: 2.5
- **Rationale:** PA rarely affects ED prescriptions (discharge meds); focus is on immediate access; utilization management is greatest barrier

### Risk Categorization

**LOW Risk:** Score < 1.0
- "This prescription is likely to be filled without barriers"
- Typical: generic Tier 1-2 drugs without PA
- Example: Generic tretinoin cream, lisinopril

**MEDIUM Risk:** Score 1.0 - 2.9
- "Some patients may face cost or coverage barriers with this drug"
- Typical: Tier 3 preferred brands, or generics requiring PA
- Example: Branded acne treatments, newer oral diabetes meds

**HIGH Risk:** Score ≥ 3.0
- "Most patients will encounter significant barriers to filling this prescription"
- Typical: Specialty tier biologics, brand-only drugs requiring PA and step therapy
- Example: Dupixent (dupilumab), Ozempic (semaglutide)

### Supporting Information: Fill Risk Reasons

Each risk score includes human-readable reasons explaining the barriers:

- **Prior Authorization Required:** "Prior authorization required — typical approval rate 65%, 3-5 business days"
- **No Generic Available:** "No generic available"
- **High Tier:** "Formulary tier 4 (higher cost-share)" or "Specialty formulary tier (higher cost-share)"
- **Step Therapy:** "Step therapy required — must document failure of metformin, glipizide first"

### Data Sources for Fill Risk Components

1. **Requires PA:** Medicare Part D plan files + State Medicaid PDLs + CoverMyMeds formulary data (industry standard)
2. **PA Approval Rates:** Industry reports (IQVIA, CoverMyMeds white papers) + academic literature
3. **PA Turnaround Times:** Typical ranges from CMS data (3-14 business days) + payer-specific data when available
4. **Brand-Only Status:** FDA Orange Book therapeutic equivalence ratings
5. **Formulary Tier:** Medicare Part D formulary files (median tier across 50+ national plans)
6. **Step Therapy Requirements:** State Medicaid PDLs + Express Scripts formulary + clinical guidelines
7. **Step Therapy Agents:** Clinical practice guidelines + PBM formulary publications

### Validation & Accuracy

- **Retrospective Validation:** Compared fill risk scores against prescription abandonment rates from published literature
- **Clinical Validation:** Pharmacist review confirmed alignment with real-world fill barriers
- **Sensitivity Analysis:** High-risk medications (score ≥3) correlate with 40%+ abandonment rates in academic studies
- **Planned Validation (v2):** Compare predicted vs. actual fill rates using pharmacy claims data

---

## Confidence Score Calculation

Confidence scores (0-100) reflect the reliability of our cost estimates, not the likelihood of coverage.

### Scoring Formula

**Base Score by Data Source:**
- Public data (v1): 30 points (GoodRx, NADAC, Medicare data)
- Manual estimates: 20 points
- Real-time benefit check (v2): 60 points

**Adjustments:**

| Factor | Adjustment | Logic |
|--------|-----------|-------|
| Generic available | +15 | Generics have predictable pricing |
| Brand-only | -10 | Brand prices more variable |
| Low tier (1-2) | +10 | Tier 1-2 = lower cost variance |
| High tier (4+) | -15 | Specialty drugs = unpredictable |
| NDC codes populated | +10 | Precise drug identification |
| Narrow price range (<20% variability) | +10 | Low variance = more predictable |
| Wide price range (>50% variability) | -10 | High variance = less confidence |
| Requires PA | -5 | PA adds uncertainty |
| OTC (over-the-counter) | +15 | Fixed shelf price |
| RTPB data available (v2) | +25 | Patient-specific data |

**Clamping:** Final score clamped to [0, 100]

### Interpretation Labels

- **75-100:** "Good estimate" (green) — High confidence in cost range
- **50-74:** "Estimate may vary" (yellow) — Moderate confidence; actual costs may differ
- **0-49:** "Limited data" (red) — Low confidence; significant uncertainty

### Examples

**Example 1: Generic Lisinopril 10mg**
- Base: 30 (public data)
- Generic: +15
- Low tier: +10
- Narrow range: +10
- **Total: 65** → "Estimate may vary"

**Example 2: Brand-name Ozempic (Semaglutide)**
- Base: 30 (public data)
- Brand-only: -10
- High tier: -15
- Requires PA: -5
- Wide range: -10
- **Total: -10 → 0** → "Limited data"

**Example 3: OTC Hydrocortisone Cream**
- Base: 30 (public data)
- Generic: +15
- Low tier: +10
- OTC: +15
- Narrow range: +10
- **Total: 80** → "Good estimate"

### Design Philosophy

By design, v1 public-data confidence scores max out around 55-65 even for the best generic drugs. This reflects the inherent limitation of non-patient-specific data. Real-time benefit checks (v2) will push confidence scores for clean generics to 80-100, while specialty biologics will remain low-confidence even with RTPB due to deductible complexity and manufacturer assistance eligibility.

---

## Formulary & Prior Authorization Data

### Formulary Tier Assignment

Tiers represent typical placement across major insurance plans. Individual plans may vary.

**Tier Definitions (Medicare Part D Standard):**

| Tier | Description | Typical Cost-Share | Examples |
|------|-------------|-------------------|----------|
| 1 | Preferred Generic | $0-$10 copay | Metformin, lisinopril |
| 2 | Generic | $10-$20 copay | Newer generics |
| 3 | Preferred Brand | $35-$50 copay or 25% coinsurance | Preferred brand with rebates |
| 4 | Non-Preferred Brand | $70-$100 copay or 40% coinsurance | Brand drugs without rebates |
| 5 | Specialty Tier | 25-33% coinsurance ($200-$500+) | Biologics, specialty injectables |

**Commercial plans may use different structures (e.g., 3-tier or 4-tier formularies)**

### Tier Assignment Methodology

1. **Primary Source:** Medicare Part D Formulary Finder (50+ national plans)
2. **Calculation:** Median tier placement across plans
3. **Validation:** Cross-reference with Express Scripts National Preferred Formulary
4. **Special Cases:**
   - If brand-only: minimum Tier 3
   - If biologic/specialty injectable: typically Tier 5 unless oral alternative exists
   - If PA required: typically Tier 3+

### Prior Authorization (PA) Data

#### PA Requirement Determination

**Sourced From:**
1. Medicare Part D formulary files (PA flags)
2. State Medicaid preferred drug lists (PDL restrictions)
3. Express Scripts formulary policies
4. Clinical pharmacy expert review

**Criteria for "Requires PA = True":**
- Medication requires PA in >30% of Medicare Part D plans, OR
- Medication requires PA in majority of reviewed state Medicaid programs, OR
- Industry standard (e.g., all biologics, controlled substances for certain indications)

#### PA Approval Rates

**Data Sources:**
- Industry reports from CoverMyMeds and other electronic PA vendors
- Academic literature (Health Affairs, JAMA studies on PA burden)
- CMS reports on Medicare Part D PA statistics

**Typical Rates by Category:**
- Generic drugs (when PA required): 75-85% approval
- Preferred brand drugs: 65-75% approval
- Non-preferred brands: 50-65% approval
- Specialty tier biologics: 60-70% approval (after appeals)

**Limitations:** Approval rates vary significantly by:
- Indication (on-label vs. off-label)
- Clinical documentation quality
- Prescriber specialty (dermatologists may have higher approval rates for derm drugs)
- Step therapy compliance

#### PA Turnaround Time Estimates

**Source:** CMS data + industry benchmarks

**Typical Ranges:**
- Standard PA: 3-5 business days
- Expedited PA (urgent): 24-72 hours
- Specialty drug PA: 5-14 business days (more complex review)

**Displayed as ranges in UI** (e.g., "3-5 business days") to reflect real-world variability

### Step Therapy Requirements

**Definition:** Insurance requires patient to try and fail lower-cost alternatives before approving the prescribed drug

**Data Sources:**
- State Medicaid PDL step therapy protocols
- Express Scripts formulary step therapy policies
- Medicare Part D formulary step edits

**Step Therapy Agents Listed:**
- Show 1-2 most common alternatives patient must try first
- Based on clinical guidelines + formulary policies
- Example: "Must document failure of metformin, glipizide first" before GLP-1 agonist approval

---

## Limitations & Disclaimers

### What We CAN Predict

- Typical cost ranges based on national pricing data
- Common insurance barriers (PA, step therapy, tier placement)
- Relative cost comparisons between medications
- Likelihood of fill barriers by medication characteristics

### What We CANNOT Predict

1. **Patient-Specific Costs**
   - Exact copay or coinsurance amounts (depends on specific plan)
   - Whether deductible has been met
   - Eligibility for manufacturer copay assistance
   - Pharmacy network restrictions

2. **Plan-Specific Variations**
   - Individual plan formularies (10,000+ plans in U.S.)
   - Regional payer differences
   - Employer group plan customizations
   - Medicare Advantage plan variations from standard Part D

3. **Pharmacy-Specific Factors**
   - Exact pharmacy acquisition costs
   - Preferred pharmacy network discounts
   - Mail-order vs. retail pricing
   - Pharmacy-specific discount programs

4. **Time-Sensitive Changes**
   - Formulary changes mid-year (allowed for new generics, safety issues)
   - Drug shortages affecting availability
   - New manufacturer coupons or assistance programs
   - Recent price changes (data lag)

5. **Clinical Complexity**
   - Off-label use PA approval (varies by indication)
   - Prior authorization appeals success rates (depends on clinical documentation)
   - Compound medications (custom formulations)
   - Medications requiring specialty pharmacy enrollment

### Data Freshness Caveats

- **Pricing data:** Based on 2024-2025 data collection; quarterly updates planned
- **Formulary data:** Annual Medicare updates (open enrollment); commercial plans may change quarterly
- **Generic availability:** New generic approvals can rapidly change cost landscape
- **Pricing trend:** Drug prices increase 3-10% annually on average; estimates may understate future costs

### Estimate Variability

**Why Costs May Differ:**
- **Geographic variation:** Drug prices vary by region and pharmacy
- **Pharmacy choice:** 80%+ price variation between pharmacies for same drug
- **Discount programs:** GoodRx, RxSaver, SingleCare coupons not factored into insurance estimates
- **Manufacturer assistance:** Copay cards can reduce brand drug costs to $0-25 for commercially insured patients
- **Quantity prescribed:** Prices quoted for standard quantities (typically 30-day supply)

**Best Practice:** Encourage patients to:
1. Call pharmacy with prescription for exact price quote
2. Compare prices across pharmacies using GoodRx or similar tools
3. Ask about manufacturer copay assistance for brand drugs
4. Check eligibility for patient assistance programs if uninsured/underinsured

---

## Future Enhancements (v2)

### Real-Time Pharmacy Benefit (RTPB) Integration

**What is RTPB?**
Real-Time Pharmacy Benefit (also called RTBC - Real-Time Benefit Check) queries patient's insurance in real-time to return actual copay/coinsurance amounts.

**Planned Data Elements:**
- Patient-specific copay/coinsurance amounts
- Deductible status (met vs. remaining amount)
- Plan-specific formulary tier
- Alternative medication suggestions with costs
- Pharmacy network restrictions
- PA status (required vs. not required for this patient)

**Technical Standards:**
- NCPDP SCRIPT Standard for RTBC transactions
- Integration with pharmacy benefit managers (PBMs)
- Requires patient consent and insurance information

**Expected Impact:**
- Confidence scores increase to 80-100 for covered generic medications
- Cost ranges narrow from broad estimates to specific dollar amounts
- Fill risk becomes patient-specific (not population-average)
- Real-time PA status checking

### Enhanced Data Sources (Planned)

1. **Patient Assistance Program Database**
   - Manufacturer copay card programs
   - Foundation assistance programs
   - Eligibility criteria and application processes

2. **Drug Shortage Database**
   - FDA drug shortage list integration
   - ASHP drug shortage updates
   - Alternative availability suggestions

3. **Outcomes Data**
   - Prescription abandonment tracking (with pharmacy partners)
   - Patient adherence data
   - Cost-effectiveness outcomes

4. **Expanded Formulary Coverage**
   - State-by-state Medicaid formulary integration
   - Top 50 commercial plans (representing 80% covered lives)
   - Medicare Advantage plan variations

---

## Data Quality & Updates

### Quality Assurance Process

1. **Initial Data Validation**
   - Multi-source price validation (minimum 2 sources)
   - Clinical pharmacy review of all entries
   - Formulary tier validation across multiple plans
   - Therapeutic classification review

2. **Ongoing Monitoring**
   - Quarterly pricing updates from GoodRx and NADAC
   - Annual formulary updates (Medicare open enrollment)
   - Monthly generic availability checks (FDA approvals)
   - Continuous PA policy monitoring

3. **User Feedback Loop**
   - Clinician reporting of pricing discrepancies
   - Pharmacy partner feedback on fill barriers
   - Patient-reported actual costs (when available)
   - Continuous algorithm refinement

### Data Update Schedule

| Data Type | Update Frequency | Source Refresh |
|-----------|-----------------|----------------|
| Medication Pricing | Quarterly | GoodRx, NADAC |
| Medicare Formularies | Annual | CMS (October/November) |
| Medicaid Formularies | Quarterly | State Medicaid sites |
| NDC Directory | Monthly | FDA |
| Orange Book | Monthly | FDA |
| RxNorm | Monthly | NLM |
| Generic Availability | Monthly | FDA new approvals |

### Version Control

- **Current Version:** 1.0 (Public Data Model)
- **Database Schema Version:** Tracked in migrations (Alembic)
- **Seed Data Version:** Timestamped with `last_updated` field per medication
- **Algorithm Version:** Documented in code comments with change log

### Contact for Data Issues

For clinicians or patients who encounter pricing discrepancies or coverage issues:
- Report via in-app feedback mechanism (planned)
- Email: data@fullfill.health (if implemented)
- Issues tracked for quarterly data refresh cycles

---

## References & Further Reading

### Government Resources
1. CMS Medicare Part D Plan Finder: https://www.medicare.gov/plan-compare
2. CMS Drug Spending Data: https://data.cms.gov
3. Medicaid NADAC Database: https://data.medicaid.gov
4. FDA NDC Directory: https://www.accessdata.fda.gov/scripts/cder/ndc/
5. FDA Orange Book: https://www.fda.gov/drugs/drug-approvals-and-databases/orange-book-data-files
6. NLM RxNorm: https://www.nlm.nih.gov/research/umls/rxnorm/

### Academic Literature
1. Health Affairs - Drug Pricing Topic: https://www.healthaffairs.org/topic/issue/25/drug-pricing
2. JAMA Network - Medication Costs: https://jamanetwork.com/collections/44035/medication-costs-and-access
3. IQVIA Institute Reports: https://www.iqvia.com/insights/the-iqvia-institute

### Industry Standards
1. NCPDP Standards: https://www.ncpdp.org
2. Express Scripts Formularies: https://www.express-scripts.com/art/open-formularies/

---

**Document Prepared By:** FullFill Data Team
**Clinical Review:** Board-Certified Clinical Pharmacists
**Last Reviewed:** March 1, 2026

**For Questions or Corrections:** Please submit feedback through the application or contact the development team.
