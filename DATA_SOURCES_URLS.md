# FullFill Data Sources: Complete URL Reference List

**Purpose:** Comprehensive list of all public data sources used in FullFill v1
**Last Updated:** March 1, 2026
**Use Case:** Website citations, API documentation, academic references

---

## Government Data Sources (Official .gov Sources)

### Centers for Medicare & Medicaid Services (CMS)

#### Medicare Part D Data
- **Medicare Plan Comparison Tool (Plan Finder)**
  - URL: https://www.medicare.gov/plan-compare
  - Description: Official Medicare prescription drug plan comparison tool with formulary data
  - Update Frequency: Annual (October open enrollment)

- **Medicare Part D Spending by Drug**
  - URL: https://data.cms.gov/summary-statistics-on-use-and-payments/medicare-medicaid-spending-by-drug/medicare-part-d-spending-by-drug
  - Description: Annual drug-level spending and utilization data for Medicare beneficiaries
  - Update Frequency: Annual

- **Medicare Part B Spending by Drug**
  - URL: https://data.cms.gov/summary-statistics-on-use-and-payments/medicare-medicaid-spending-by-drug/medicare-part-b-spending-by-drug
  - Description: Expenditure data for drugs administered in outpatient settings
  - Update Frequency: Annual

- **CMS Drug Spending Research Portal**
  - URL: https://www.cms.gov/research-statistics-data-and-systems/statistics-trends-and-reports/information-on-prescription-drugs
  - Description: Central hub for CMS prescription drug data and research
  - Update Frequency: Ongoing

#### Medicaid Data
- **Medicaid Drug Spending by Drug**
  - URL: https://data.cms.gov/summary-statistics-on-use-and-payments/medicare-medicaid-spending-by-drug/medicaid-spending-by-drug
  - Description: State and federal Medicaid spending on medications
  - Update Frequency: Annual

- **NADAC (National Average Drug Acquisition Cost) Database**
  - Main Portal: https://data.medicaid.gov/
  - Direct Dataset: https://data.medicaid.gov/Drug-Pricing-and-Payment/NADAC-National-Average-Drug-Acquisition-Cost-/a4y5-998d
  - Description: Weekly survey-based pharmacy acquisition costs for generic and brand drugs
  - Update Frequency: Weekly (every Wednesday)
  - Technical Contact: info@mslcrps.com

- **State Medicaid Preferred Drug Lists (PDLs)**
  - Portal: https://medicaid.gov/medicaid/prescription-drugs/
  - Description: Links to all 50+ state Medicaid formularies and prior authorization criteria
  - Update Frequency: Quarterly (varies by state)

- **Medicaid Drug Rebate Program (MDRP)**
  - URL: https://www.medicaid.gov/medicaid/prescription-drugs/medicaid-drug-rebate-program/index.html
  - Description: Manufacturer rebate data and covered outpatient drug lists
  - Update Frequency: Quarterly

- **Medicaid Pharmacy Pricing Portal**
  - URL: https://www.medicaid.gov/medicaid/prescription-drugs/pharmacy-pricing/index.html
  - Description: Overview of Medicaid pharmacy reimbursement and NADAC methodology
  - Update Frequency: Ongoing

### U.S. Food & Drug Administration (FDA)

#### Drug Databases
- **National Drug Code (NDC) Directory**
  - Search Interface: https://www.accessdata.fda.gov/scripts/cder/ndc/
  - Main Info Page: https://www.fda.gov/drugs/drug-approvals-and-databases/national-drug-code-directory
  - Description: Official FDA database of all marketed drugs with unique NDC identifiers
  - Update Frequency: Daily

- **NDC Directory Downloads**
  - Text Format (.zip): https://www.accessdata.fda.gov/cder/ndctext.zip
  - Excel Format (.zip): https://www.accessdata.fda.gov/cder/ndcxls.zip
  - Unfinished Drugs (.zip): https://www.accessdata.fda.gov/cder/ndc_unfinished.zip
  - Compounded Drugs (.zip): https://www.accessdata.fda.gov/cder/compounders_ndc_directory.zip
  - Excluded Drugs (.zip): https://www.accessdata.fda.gov/cder/ndc_excluded.zip

- **Orange Book (Approved Drug Products with Therapeutic Equivalence Evaluations)**
  - Search Interface: http://www.accessdata.fda.gov/scripts/cder/ob/default.cfm
  - Main Info Page: https://www.fda.gov/drugs/drug-approvals-and-databases/approved-drug-products-therapeutic-equivalence-evaluations-orange-book
  - Data Files Page: https://www.fda.gov/drugs/drug-approvals-and-databases/orange-book-data-files
  - Description: Therapeutic equivalence ratings, patent info, generic availability
  - Update Frequency: Monthly
  - Contact: orangebook@fda.hhs.gov

### National Library of Medicine (NLM)

- **RxNorm**
  - Main Page: https://www.nlm.nih.gov/research/umls/rxnorm/index.html
  - Overview: https://www.nlm.nih.gov/research/umls/rxnorm/overview.html
  - Description: Standardized medication nomenclature with unique identifiers (RxCUI)
  - Update Frequency: Monthly (first Monday) + weekly updates (Wednesdays)

- **RxNorm API**
  - URL: https://rxnav.nlm.nih.gov/RxNormAPIs.html
  - Description: REST-based API for medication name standardization and relationships

- **RxNav (Browser Interface)**
  - URL: https://rxnav.nlm.nih.gov/
  - Description: Web-based RxNorm browser and search tool

- **RxNorm Files (Downloads)**
  - URL: https://www.nlm.nih.gov/research/umls/rxnorm/docs/rxnormfiles.html
  - Description: Full monthly releases (requires free UMLS account)

### Health Resources & Services Administration (HRSA)

- **340B Drug Pricing Program**
  - URL: https://www.hrsa.gov/opa/index.html
  - Description: Federal program providing discounted drugs to safety-net healthcare facilities
  - Use: Understanding hospital-based outpatient prescription pricing

---

## Industry Data Sources

### Prescription Discount & Pricing Tools

- **GoodRx**
  - Main Site: https://www.goodrx.com
  - Description: Leading prescription discount platform with real-time pricing from 70,000+ pharmacies
  - Data Used: Cash-pay price ranges, pharmacy comparisons, discount coupon availability

- **RxSaver by RetailMeNot**
  - URL: https://www.rxsaver.com
  - Description: Free prescription savings tool with retail pharmacy partnerships
  - Data Used: Retail pharmacy price comparisons

- **SingleCare**
  - URL: https://www.singlecare.com
  - Description: Free prescription savings service (35,000+ pharmacies)
  - Data Used: Alternative pricing benchmarks

- **Blink Health**
  - URL: https://www.blinkhealth.com
  - Description: Digital pharmacy with pre-negotiated pricing
  - Data Used: Price transparency model reference

- **CostPlus Drugs (Mark Cuban Cost Plus Drug Company)**
  - URL: https://costplusdrugs.com
  - Description: Transparent pricing model (manufacturer cost + 15% + $5)
  - Data Used: Generic drug cost benchmarking

### Pharmacy Benefit Managers (PBMs) & Formularies

- **Express Scripts National Preferred Formulary**
  - URL: https://www.express-scripts.com/art/open-formularies/
  - Description: Publicly available formulary from major PBM
  - Update Frequency: Quarterly
  - Data Used: Tier placement, step therapy protocols, therapeutic alternatives

- **CoverMyMeds**
  - Main Site: https://www.covermymeds.com/main/
  - Description: Electronic prior authorization platform with extensive formulary database
  - Data Used: Prior authorization requirements, approval rates (via published reports)

### Standards Organizations

- **NCPDP (National Council for Prescription Drug Programs)**
  - URL: https://www.ncpdp.org
  - Description: Standards for pharmacy data interchange (SCRIPT standard, Formulary & Benefit Standard)
  - Data Used: Understanding real-time benefit check (RTBC) standards for v2 integration

- **Pharmaceutical Care Management Association (PCMA)**
  - URL: https://www.pcmanet.org
  - Description: PBM industry association with white papers on formulary management
  - Data Used: Industry perspective on prior authorization and utilization management

---

## Academic & Research Sources

### Peer-Reviewed Journals

- **Health Affairs - Drug Pricing Topic Collection**
  - URL: https://www.healthaffairs.org/topic/issue/25/drug-pricing
  - Description: Leading health policy journal with peer-reviewed prescription drug pricing research
  - Key Studies Used:
    - Prescription abandonment rates (25-30% due to cost)
    - Impact of price transparency on patient behavior
    - Formulary tier effects on medication adherence

- **JAMA Network - Medication Costs and Access Collection**
  - URL: https://jamanetwork.com/collections/44035/medication-costs-and-access
  - Description: Clinical research on medication costs, insurance gaps, and access barriers
  - Key Studies Used:
    - High-deductible plan impact on medication abandonment (40% increase)
    - Racial and socioeconomic disparities in drug access
    - Copay amount correlation with adherence rates

- **National Bureau of Economic Research (NBER) - Prescription Drug Papers**
  - URL: https://www.nber.org/topics/health-insurance-and-health-care-prescription-drugs
  - Description: Economics working papers on drug markets, insurance, and patient behavior
  - Key Research Used:
    - Economic analysis of price discrimination in pharmaceutical markets
    - Patient response to cost-sharing mechanisms

### Research Institutions

- **USC Schaeffer Center for Health Policy & Economics**
  - URL: https://healthpolicy.usc.edu/research/prescription-drug-pricing/
  - Description: Academic research on drug pricing, value assessment, and insurance design
  - Data Used: Economic models of price transparency interventions; PBM rebate analysis

### Industry Research

- **IQVIA Institute Reports**
  - URL: https://www.iqvia.com/insights/the-iqvia-institute
  - Description: Annual reports on medicine spending, patient assistance, and market trends
  - Data Used:
    - Generic vs. brand utilization trends
    - Patient assistance program usage statistics
    - Price inflation patterns
    - Prior authorization approval rates (industry benchmarks)

---

## Data Source Summary by Category

### Pricing Data (3 Primary Sources)
1. GoodRx — https://www.goodrx.com
2. NADAC — https://data.medicaid.gov/
3. CMS Medicare Part D Spending — https://data.cms.gov/

### Formulary Data (3 Primary Sources)
1. CMS Medicare Part D Plan Finder — https://www.medicare.gov/plan-compare
2. State Medicaid PDLs — https://medicaid.gov/medicaid/prescription-drugs/
3. Express Scripts Formularies — https://www.express-scripts.com/art/open-formularies/

### Drug Information (3 Primary Sources)
1. FDA NDC Directory — https://www.accessdata.fda.gov/scripts/cder/ndc/
2. FDA Orange Book — https://www.fda.gov/drugs/drug-approvals-and-databases/orange-book-data-files
3. NLM RxNorm — https://www.nlm.nih.gov/research/umls/rxnorm/

### Research Evidence (3 Primary Sources)
1. Health Affairs Journal — https://www.healthaffairs.org/topic/issue/25/drug-pricing
2. JAMA Network — https://jamanetwork.com/collections/44035/medication-costs-and-access
3. IQVIA Institute — https://www.iqvia.com/insights/the-iqvia-institute

---

## Quick Reference: Data Update Frequencies

| Data Source | Update Frequency | Last Update Check |
|------------|-----------------|-------------------|
| NADAC | Weekly (Wednesdays) | Ongoing |
| FDA NDC Directory | Daily | Ongoing |
| FDA Orange Book | Monthly | Ongoing |
| RxNorm | Monthly + weekly | Ongoing |
| Medicare Part D Formularies | Annual (October) | October 2025 |
| State Medicaid PDLs | Quarterly (varies) | Q4 2025 |
| Express Scripts Formularies | Quarterly | Q4 2025 |
| CMS Spending Data | Annual | 2024 data |
| GoodRx Pricing | Real-time | 2024-2025 snapshot |

---

## Citations for Website Footer

**Recommended Citation Text:**

"FullFill cost estimates are based on publicly available data from the Centers for Medicare & Medicaid Services (CMS), U.S. Food & Drug Administration (FDA), National Library of Medicine, GoodRx, and peer-reviewed academic research. See our complete [Data Sources & Methodology](/data-sources) for details."

**Abbreviated Version:**

"Data sources: CMS, FDA, NLM, GoodRx, peer-reviewed research. [Full methodology](/methodology)."

---

## For Academic Publications

If citing FullFill data in academic publications, please reference:

- **FullFill Methodology Document:** [Repository URL]/METHODOLOGY.md
- **Primary Data Sources:** CMS NADAC, Medicare Part D formularies, FDA Orange Book
- **Version:** FullFill v1.0 (Public Data Model)
- **Date Range:** 2024-2025 pricing data

---

## Contact & Updates

- **Data Quality Issues:** Report via in-app feedback
- **Methodology Questions:** See METHODOLOGY.md in repository
- **Source Verification:** All URLs verified as of March 1, 2026

---

**Document Prepared By:** FullFill Data Team
**Last Verified:** March 1, 2026
**Next Verification:** June 1, 2026 (Quarterly Review)
