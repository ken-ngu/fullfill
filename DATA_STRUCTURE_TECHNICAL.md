# FullFill Technical Data Structure Documentation

**Audience:** Developers, Data Engineers, API Integrators
**Purpose:** Technical reference for data model, algorithms, and implementation details
**Last Updated:** March 1, 2026

---

## Table of Contents
1. [Database Schema](#database-schema)
2. [Seed Data Format](#seed-data-format)
3. [Algorithm Implementations](#algorithm-implementations)
4. [API Response Schemas](#api-response-schemas)
5. [Data Source Mappings](#data-source-mappings)
6. [Version 2 Preparation](#version-2-preparation)

---

## Database Schema

### Medication Model (`backend/src/models/medication.py`)

**Table:** `medications`

#### Identity & Classification
```python
id: String (PK)                    # Format: "{generic-name}-{strength}-{form}"
name: String (NOT NULL)            # Display name (e.g., "Tretinoin 0.025% Cream")
generic_name: String (NOT NULL)    # Generic name (e.g., "tretinoin")
brand_names: JSON (default=[])     # Array of brand names (e.g., ["Retin-A"])
```

#### Multi-Specialty Classification
```python
specialty: String (default="dermatology")  # dermatology | endocrinology | primary_care | urgent_care | emergency
category: String (NOT NULL)                # Indication category (e.g., "acne", "diabetes")
subcategory: String (nullable)             # Sub-classification (e.g., "topical")
therapeutic_class: String (NOT NULL)       # Therapeutic class (e.g., "topical_retinoid")
clinical_equivalence_group: String (nullable)  # For finding alternatives
```

#### Care Setting
```python
setting: String (default="outpatient")     # outpatient | urgent_care | emergency | inpatient
discharge_only: Boolean (default=false)    # True = dispensed only at discharge (ED/UC), not during encounter
```

#### Formulation
```python
dosage_form: String (NOT NULL)    # cream | tablet | injection | etc.
strength: String (NOT NULL)       # "0.025%" | "10mg" | "1mg/mL"
```

#### Cost Data
```python
cost_low_usd: Float (NOT NULL)           # Minimum price (typically cash-pay discount)
cost_high_usd: Float (NOT NULL)          # Maximum typical price (retail without discount)
cost_basis: String (default="per_30_day") # per_30_day | per_treatment_course | per_unit
```

#### Insurance Friction (Formulary & PA)
```python
requires_pa: Boolean (default=false)               # Prior authorization required
pa_approval_rate: Float (nullable)                 # 0.0-1.0 (e.g., 0.65 = 65%)
pa_turnaround_days_min: Integer (nullable)         # Min business days
pa_turnaround_days_max: Integer (nullable)         # Max business days
brand_only: Boolean (default=false)                # No generic available
formulary_tier: Integer (default=2)                # 1-5 (Medicare standard)
step_therapy_required: Boolean (default=false)     # Must try other meds first
step_therapy_agents: JSON (default=[])             # Array of drug names
```

#### OTC Flag
```python
is_otc: Boolean (default=false)   # Over-the-counter (no prescription needed)
```

#### RTPB Identifiers (v2 Preparation)
```python
ndc_codes: JSON (default=[])      # Array of NDC codes (11-digit)
rxnorm_cui: String (nullable)     # RxNorm Concept Unique Identifier
gpi_code: String (nullable)       # Generic Product Identifier
```

#### Alternative Pointers
```python
alternative_ids: JSON (default=[])  # Array of medication IDs (curated alternatives)
```

#### Metadata
```python
data_source: String (default="public-data")  # public-data | rtpb | manual
last_updated: Date (nullable)                # Data freshness tracking
```

---

## Seed Data Format

### File Location
`backend/src/data/seed.py`

### Data Structure
```python
MEDICATIONS: list[dict] = [
    {
        # Identity
        "id": "tretinoin-0025-cream",
        "name": "Tretinoin 0.025% Cream",
        "generic_name": "tretinoin",
        "brand_names": ["Retin-A"],

        # Classification
        "specialty": "dermatology",
        "category": "acne",
        "subcategory": "topical",
        "therapeutic_class": "topical_retinoid",
        "clinical_equivalence_group": "topical_retinoid",

        # Formulation
        "dosage_form": "cream",
        "strength": "0.025%",

        # Cost
        "cost_low_usd": 15.0,
        "cost_high_usd": 60.0,
        "cost_basis": "per_30_day",

        # Insurance friction
        "requires_pa": False,
        "pa_approval_rate": None,
        "pa_turnaround_days_min": None,
        "pa_turnaround_days_max": None,
        "brand_only": False,
        "formulary_tier": 2,
        "step_therapy_required": False,
        "step_therapy_agents": [],

        # Other
        "is_otc": False,
        "alternative_ids": ["adapalene-01-gel"],
        "ndc_codes": [],
        "rxnorm_cui": None,
        "gpi_code": None,
        "data_source": "public-data",
        "last_updated": None,
    },
    # ... more medications
]
```

### Data Sources Mapping

**Pricing (`cost_low_usd`, `cost_high_usd`):**
- Source: GoodRx public pricing data (2024-2025)
- Validation: NADAC database cross-reference
- Notes: Cash-pay prices; insurance prices vary

**Formulary Tier (`formulary_tier`):**
- Source: Medicare Part D formulary files (median across 50+ plans)
- Validation: Express Scripts National Preferred Formulary
- Scale: 1 (preferred generic) to 5 (specialty)

**Prior Authorization (`requires_pa`, `pa_approval_rate`, `pa_turnaround_days_*`):**
- Source: Medicare Part D formulary PA flags + State Medicaid PDLs
- Approval rates: Industry reports (CoverMyMeds, IQVIA)
- Turnaround: CMS data + payer-specific benchmarks

**Brand-Only Status (`brand_only`):**
- Source: FDA Orange Book therapeutic equivalence ratings
- Logic: True if no AB-rated generic exists

**Step Therapy (`step_therapy_required`, `step_therapy_agents`):**
- Source: State Medicaid PDLs + Express Scripts step therapy protocols
- Agents: Most common required alternatives from formularies

**Therapeutic Classification (`therapeutic_class`, `clinical_equivalence_group`):**
- Source: RxNorm + clinical pharmacist review
- Purpose: Finding alternatives and therapeutic substitutions

---

## Algorithm Implementations

### 1. Fill Risk Scoring (`backend/src/services/fill_risk.py`)

#### Algorithm Type
Additive point system with specialty-specific weights

#### Weights Configuration
```python
FILL_RISK_WEIGHTS: dict[str, dict[str, float]] = {
    "default": {
        "requires_pa": 2.0,
        "brand_only": 1.0,
        "high_tier": 1.0,      # tier >= 3
        "step_therapy": 1.0,
    },
    "dermatology": { ... },
    "endocrinology": { ... },
    "primary_care": { ... },
    "urgent_care": { ... },
    "emergency": { ... },
}
```

#### Scoring Logic
```python
def calculate_fill_risk(medication: dict, specialty: str, rtpb_data: dict | None) -> FillRiskResult:
    weights = FILL_RISK_WEIGHTS.get(specialty, FILL_RISK_WEIGHTS["default"])
    max_score = sum(weights.values())
    score = 0.0
    reasons = []

    # Add points for each barrier
    if medication.get("requires_pa"):
        score += weights["requires_pa"]
        reasons.append(f"Prior authorization required — typical approval rate {pa_rate}%, {min_days}–{max_days} business days")

    if medication.get("brand_only"):
        score += weights["brand_only"]
        reasons.append("No generic available")

    tier = medication.get("formulary_tier", 2)
    if tier >= 3:
        score += weights["high_tier"]
        reasons.append(f"Formulary tier {tier} (higher cost-share)")

    if medication.get("step_therapy_required"):
        score += weights["step_therapy"]
        agents = medication.get("step_therapy_agents", [])
        reasons.append(f"Step therapy required — must document failure of {', '.join(agents[:2])} first")

    # Categorize
    if score < 1.0:
        level = "LOW"
    elif score < 3.0:
        level = "MEDIUM"
    else:
        level = "HIGH"

    return FillRiskResult(level, score, max_score, reasons, plain_language)
```

#### Output Schema
```python
@dataclass
class FillRiskResult:
    level: str                  # "LOW" | "MEDIUM" | "HIGH"
    score: float                # Raw score (0-8 range)
    max_score: float            # Max possible score for specialty
    reasons: list[str]          # Human-readable barrier explanations
    plain_language: str         # Summary sentence
    is_rtpb_enhanced: bool      # v2 flag
```

### 2. Confidence Scoring (`backend/src/services/confidence.py`)

#### Algorithm Type
Additive scoring with base + adjustments, clamped to [0, 100]

#### Base Scores
```python
_BASE_SCORES = {
    "rtpb": 60,           # v2: real-time benefit check
    "public-data": 30,    # v1: GoodRx, NADAC, Medicare
    "manual": 20,         # Manual estimates
}
```

#### Adjustments
```python
_GENERIC_BONUS = 15          # Generic available
_BRAND_ONLY_PENALTY = -10    # Brand-only
_LOW_TIER_BONUS = 10         # Tier <= 2
_HIGH_TIER_PENALTY = -15     # Tier >= 4
_NDC_BONUS = 10              # NDC codes populated
_NARROW_RANGE_BONUS = 10     # Variability < 0.20
_WIDE_RANGE_PENALTY = -10    # Variability >= 0.50
_PA_PENALTY = -5             # Requires PA
_OTC_BONUS = 15              # Over-the-counter
_RTPB_BONUS = 25             # v2: live data
```

#### Scoring Logic
```python
def calculate_confidence(medication: dict, rtpb_data: dict | None = None) -> int:
    data_source = medication.get("data_source", "public-data")
    base = _BASE_SCORES.get("rtpb" if rtpb_data else data_source, 20)
    score = base

    # Apply adjustments
    if medication.get("brand_only"):
        score += _BRAND_ONLY_PENALTY
    else:
        score += _GENERIC_BONUS

    tier = medication.get("formulary_tier", 3)
    if tier <= 2:
        score += _LOW_TIER_BONUS
    elif tier >= 4:
        score += _HIGH_TIER_PENALTY

    if medication.get("ndc_codes"):
        score += _NDC_BONUS

    # Price range variability
    high = medication.get("cost_high_usd", 0.0)
    low = medication.get("cost_low_usd", 0.0)
    variability = (high - low) / high if high > 0 else 0.0
    if variability < 0.20:
        score += _NARROW_RANGE_BONUS
    elif variability >= 0.50:
        score += _WIDE_RANGE_PENALTY

    if medication.get("requires_pa"):
        score += _PA_PENALTY

    if medication.get("is_otc"):
        score += _OTC_BONUS

    if rtpb_data is not None:
        score += _RTPB_BONUS

    return max(0, min(100, score))  # Clamp to [0, 100]
```

#### Labels
```python
def confidence_label(score: int) -> str:
    if score >= 75:
        return "Good estimate"
    if score >= 50:
        return "Estimate may vary"
    return "Limited data"
```

### 3. Alternative Medication Lookup (`backend/src/services/alternatives.py`)

#### Priority Order
1. Explicit `alternative_ids` (curated clinically)
2. Dynamic: Same `clinical_equivalence_group`, lower `cost_high_usd`
3. Fallback: Same `therapeutic_class`, lower `cost_high_usd`

#### Logic
```python
def find_alternatives(medication: dict, all_medications: list[dict]) -> list[dict]:
    explicit_ids = medication.get("alternative_ids") or []

    if explicit_ids:
        candidates = [m for m in all_medications if m["id"] in explicit_ids]
    else:
        group = medication.get("clinical_equivalence_group")
        if group:
            candidates = [
                m for m in all_medications
                if m.get("clinical_equivalence_group") == group
                and m["id"] != medication["id"]
                and m.get("cost_high_usd", 0) < medication.get("cost_high_usd", 0)
            ]
        else:
            candidates = [
                m for m in all_medications
                if m.get("therapeutic_class") == medication.get("therapeutic_class")
                and m["id"] != medication["id"]
                and m.get("cost_high_usd", 0) < medication.get("cost_high_usd", 0)
            ]

    candidates.sort(key=lambda m: m.get("cost_low_usd", 0))
    return candidates[:3]  # Max 3 alternatives
```

---

## API Response Schemas

### Medication Summary (`MedicationSummary`)
```python
class MedicationSummary(BaseModel):
    id: str
    name: str
    generic_name: str
    specialty: str
    category: str
    dosage_form: str
    strength: str
    formulary_tier: int
    requires_pa: bool
    is_otc: bool
    setting: str = "outpatient"
    discharge_only: bool = False
```

### Cost Estimate (`CostEstimate`)
```python
class CostEstimate(BaseModel):
    low_usd: float
    high_usd: float
    cost_basis: str
    label: str = "Estimated range"
    disclaimer: str = (
        "Actual cost depends on your patient's specific plan and deductible status. "
        "Manufacturer copay assistance may apply for commercially insured patients."
    )
    data_source: str
```

### Prior Authorization Status (`PAStatus`)
```python
class PAStatus(BaseModel):
    required: bool
    approval_rate: Optional[float] = None          # 0.0-1.0
    turnaround_days: Optional[str] = None          # "3-5" | "5-14"
    step_therapy_required: bool = False
    step_therapy_agents: list[str] = []
```

### Medication Detail (Full Response)
```python
class MedicationDetail(MedicationSummary):
    brand_names: list[str]
    therapeutic_class: str
    brand_only: bool
    step_therapy_required: bool
    ndc_codes: list[str]

    confidence_score: int                          # 0-100
    cost_estimate: CostEstimate
    fill_risk_level: str                           # "LOW" | "MEDIUM" | "HIGH"
    fill_risk_score: int                           # Raw score
    fill_risk_reasons: list[str]
    fill_risk_plain_language: str
    pa_status: PAStatus
    alternatives: list[AlternativeSummary]
```

---

## Data Source Mappings

### Field → Data Source Reference

| Database Field | Primary Source | Validation Source | Update Frequency |
|---------------|---------------|-------------------|------------------|
| `name`, `generic_name`, `brand_names` | FDA NDC Directory | FDA Orange Book | Monthly |
| `cost_low_usd`, `cost_high_usd` | GoodRx | NADAC | Quarterly |
| `formulary_tier` | Medicare Part D Formulary Finder | Express Scripts | Annual |
| `requires_pa` | Medicare Part D + State Medicaid PDLs | CoverMyMeds data | Quarterly |
| `pa_approval_rate` | IQVIA Reports + CoverMyMeds | Academic literature | Annual |
| `pa_turnaround_days_*` | CMS benchmarks | Payer-specific data | Annual |
| `brand_only` | FDA Orange Book | — | Monthly |
| `step_therapy_required` | State Medicaid PDLs | Express Scripts | Quarterly |
| `step_therapy_agents` | State PDLs + Clinical guidelines | Express Scripts | Quarterly |
| `therapeutic_class` | RxNorm | Pharmacist review | Static |
| `clinical_equivalence_group` | Clinical pharmacist assignment | — | Static |
| `ndc_codes` | FDA NDC Directory | — | Monthly |
| `rxnorm_cui` | RxNorm API | — | Monthly |
| `is_otc` | FDA NDC Directory | — | Monthly |

---

## Version 2 Preparation

### RTPB (Real-Time Pharmacy Benefit) Integration

**Planned Fields:**
- Patient-specific copay/coinsurance amounts
- Deductible status (remaining amount)
- Plan-specific formulary tier
- PA status for this patient's plan
- Alternative suggestions with patient-specific costs

**Technical Standards:**
- NCPDP SCRIPT Standard for RTBC transactions
- Integration with major PBMs (Express Scripts, CVS Caremark, OptumRx)

**Database Changes:**
- `is_rtpb_enhanced` flag on responses
- `rtpb_data` optional parameter in scoring functions
- Patient context model (insurance type, age, deductible status)

**Algorithm Adjustments:**
- Fill risk becomes patient-specific (not population-average)
- Confidence scores increase to 80-100 for RTPB-enhanced data
- Cost ranges narrow to specific dollar amounts

### Placeholder Implementation

Already implemented in v1 code:
```python
def calculate_fill_risk(
    medication: dict,
    specialty: str = "dermatology",
    rtpb_data: dict | None = None,  # v2 parameter
) -> FillRiskResult:
    ...
    if rtpb_data is not None:
        score = _apply_rtpb_adjustments(score, rtpb_data, weights)
    ...

def _apply_rtpb_adjustments(score: float, rtpb_data: dict, weights: dict) -> float:
    """Placeholder for v2 RTPB score adjustment logic."""
    # In v2: use rtpb_data["pa_required"], rtpb_data["formulary_tier"], etc.
    return score
```

---

## Development Notes

### Data Quality Checks
- Price validation: `cost_low_usd < cost_high_usd`
- Tier validation: `formulary_tier` in [1, 2, 3, 4, 5]
- PA rate validation: `0.0 <= pa_approval_rate <= 1.0`
- Turnaround validation: `pa_turnaround_days_min <= pa_turnaround_days_max`

### Adding New Medications
1. Add entry to `MEDICATIONS` list in `seed.py`
2. Validate pricing against GoodRx + NADAC
3. Check formulary tier in Medicare Part D Formulary Finder
4. Verify PA requirements in state Medicaid PDLs
5. Assign therapeutic class using RxNorm
6. Have clinical pharmacist review entry
7. Run database migration: `python -m src.data.seed`

### Testing Algorithms
- Unit tests for scoring functions with edge cases
- Validate score ranges (fill risk 0-8, confidence 0-100)
- Test specialty-specific weight variations
- Verify alternative lookup logic (explicit vs. dynamic)

---

## Contact

**Technical Questions:** See repository issues or contribute via pull request
**Data Quality Issues:** Report via in-app feedback
**Algorithm Documentation:** See inline code comments in `/backend/src/services/`

---

**Document Prepared By:** FullFill Development Team
**Last Updated:** March 1, 2026
**Code Version:** v1.0 (Public Data Model)
