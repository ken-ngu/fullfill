# FullFill API Quick Reference

Quick reference for testing and using the FullFill API endpoints.

**Base URL:** `http://localhost:8000` (development)

---

## Health Check

### Check API Status
```bash
curl http://localhost:8000/health
```
**Returns:** `{"status":"ok"}`

---

## Medications

### Search Medications
```bash
# Basic search
curl "http://localhost:8000/api/v1/medications/search?q=amoxicillin"

# Search with multiple results
curl "http://localhost:8000/api/v1/medications/search?q=albuterol"
```

**Returns:** Array of medication summaries
```json
[
  {
    "id": "amoxicillin-500mg-capsule",
    "name": "Amoxicillin 500mg Capsule",
    "generic_name": "amoxicillin",
    "brand_names": ["Amoxil"],
    "specialty": "urgent_care",
    "category": "respiratory_infection",
    "dosage_form": "capsule",
    "strength": "500mg",
    "formulary_tier": 1,
    "requires_pa": false,
    "is_otc": false,
    "setting": "urgent_care",
    "discharge_only": false
  }
]
```

### Get Top Medications
```bash
curl "http://localhost:8000/api/v1/medications/top"
```

**Returns:** Array of 6+ popular medications across specialties

### Get Medication Detail
```bash
# With commercial insurance
curl "http://localhost:8000/api/v1/medications/tretinoin-0025-cream?insurance_type=commercial"

# With medicare
curl "http://localhost:8000/api/v1/medications/amoxicillin-500mg-capsule?insurance_type=medicare"

# With medicaid
curl "http://localhost:8000/api/v1/medications/cephalexin-500mg-capsule?insurance_type=medicaid"
```

**Returns:** Full medication detail with:
- Basic info (name, strength, dosage form)
- Cost estimate with GoodRx pricing
- Fill risk assessment
- PA status
- Alternatives
- Diagnoses it treats

**Example Response:**
```json
{
  "id": "tretinoin-0025-cream",
  "name": "Tretinoin 0.025% Cream",
  "generic_name": "tretinoin",
  "cost_estimate": {
    "low_usd": 15.0,
    "high_usd": 60.0,
    "cost_basis": "per_30_day",
    "label": "Full cost (deductible not met)",
    "goodrx_price": {
      "cash_price_low_usd": 12.0,
      "cash_price_high_usd": 45.0,
      "coupon_price_usd": 9.0,
      "last_updated": "2026-03-02T00:43:59"
    }
  },
  "fill_risk_level": "LOW",
  "fill_risk_score": 0,
  "pa_status": {
    "required": false
  },
  "alternatives": [...],
  "diagnoses": ["acne-vulgaris"]
}
```

---

## Diagnoses

### Search Diagnoses
```bash
# Search for UTI
curl "http://localhost:8000/api/v1/diagnoses/search?q=uti"

# Search for acne
curl "http://localhost:8000/api/v1/diagnoses/search?q=acne"
```

**Returns:** Array of diagnosis summaries
```json
[
  {
    "id": "urinary-tract-infection",
    "name": "Urinary Tract Infection (UTI)",
    "icd10_codes": ["N39.0"],
    "category": "infectious_disease"
  }
]
```

### Get Diagnosis Detail with Treatment Options
```bash
# UTI treatments with commercial insurance
curl "http://localhost:8000/api/v1/diagnoses/urinary-tract-infection?insurance_type=commercial"

# Acne treatments with medicare
curl "http://localhost:8000/api/v1/diagnoses/acne-vulgaris?insurance_type=medicare"
```

**Returns:** Diagnosis with treatment medications sorted by cost
```json
{
  "id": "urinary-tract-infection",
  "name": "Urinary Tract Infection (UTI)",
  "icd10_codes": ["N39.0"],
  "description": "Bacterial infection of the urinary system...",
  "category": "infectious_disease",
  "synonyms": ["UTI", "bladder infection", "cystitis"],
  "medications": [
    {
      "id": "trimethoprim-sulfamethoxazole-ds",
      "name": "Trimethoprim-Sulfamethoxazole DS",
      "generic_name": "trimethoprim-sulfamethoxazole",
      "brand_names": ["Bactrim DS", "Septra DS"],
      "dosage_form": "tablet",
      "strength": "800mg/160mg",
      "formulary_tier": 1,
      "requires_pa": false,
      "cost_estimate": {
        "low_usd": 10.0,
        "high_usd": 15.0,
        "cost_basis": "per_30_day",
        "label": "Estimated copay",
        "disclaimer": "..."
      }
    }
  ]
}
```

---

## Events (Analytics)

### Log User Event
```bash
curl -X POST http://localhost:8000/api/v1/events \
  -H "Content-Type: application/json" \
  -d '{
    "session_id": "test-session-123",
    "event_type": "medication_searched",
    "medication_id": "amoxicillin-500mg-capsule",
    "insurance_type": "commercial",
    "patient_age_group": "adult"
  }'
```

**Event Types:**
- `medication_searched`
- `medication_selected`
- `diagnosis_selected`
- `alternative_selected`
- `page_view`

---

## Authentication (Token)

### Get JWT Token
```bash
curl -X POST http://localhost:8000/api/v1/auth/token \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "username=testuser&password=testpassword"
```

**Note:** Authentication is not yet enforced on endpoints.

---

## Common Test Scenarios

### Test Medication with GoodRx Pricing
```bash
# Tretinoin (has GoodRx pricing)
curl "http://localhost:8000/api/v1/medications/tretinoin-0025-cream?insurance_type=commercial" | jq '.cost_estimate.goodrx_price'

# Amoxicillin (has GoodRx pricing)
curl "http://localhost:8000/api/v1/medications/amoxicillin-500mg-capsule" | jq '.cost_estimate.goodrx_price'
```

### Test Cost Comparison
```bash
# Get diagnosis with treatments sorted by cost
curl "http://localhost:8000/api/v1/diagnoses/urinary-tract-infection?insurance_type=commercial" | jq '[.medications[] | {name: .name, cost: .cost_estimate.low_usd}]'
```

### Test Cross-Specialty Search
```bash
# Albuterol appears in both emergency and urgent_care
curl "http://localhost:8000/api/v1/medications/search?q=albuterol" | jq '[.[] | {name: .name, specialty: .specialty}]'
```

### Test Fill Risk Assessment
```bash
# Isotretinoin (requires PA - higher risk)
curl "http://localhost:8000/api/v1/medications/isotretinoin-20mg-capsule" | jq '{name: .name, fill_risk: .fill_risk_level, pa_required: .pa_status.required}'
```

### Test Diagnosis Links from Medication
```bash
# Tretinoin should link to acne-vulgaris
curl "http://localhost:8000/api/v1/medications/tretinoin-0025-cream" | jq '.diagnoses'
```

---

## Query Parameters

### Medication Search
- `q` (required): Search query string

### Medication Detail
- `insurance_type` (optional): `commercial`, `medicare`, `medicaid`, `cash`
- Default: `commercial`

### Diagnosis Detail
- `insurance_type` (optional): `commercial`, `medicare`, `medicaid`, `cash`
- Default: `commercial`

---

## Response Codes

| Code | Meaning |
|------|---------|
| 200 | Success |
| 404 | Not Found (invalid ID) |
| 422 | Validation Error (invalid parameters) |
| 500 | Internal Server Error |

---

## Data Insights

### Database Record Counts
```bash
# Get medication count
docker exec fullfill_db psql -U fullfill -d fullfill -c "SELECT COUNT(*) FROM medications;"

# Get diagnosis count
docker exec fullfill_db psql -U fullfill -d fullfill -c "SELECT COUNT(*) FROM diagnoses;"

# Get GoodRx price count
docker exec fullfill_db psql -U fullfill -d fullfill -c "SELECT COUNT(*) FROM goodrx_prices;"
```

**Current Counts:**
- Medications: 75
- Diagnoses: 62
- GoodRx Prices: 27
- Medication-Diagnosis Links: 132

---

## Popular Test Medications

| ID | Name | Has GoodRx? | Specialty |
|----|------|-------------|-----------|
| `amoxicillin-500mg-capsule` | Amoxicillin 500mg Capsule | Yes | Urgent Care |
| `tretinoin-0025-cream` | Tretinoin 0.025% Cream | Yes | Dermatology |
| `adapalene-01-gel` | Adapalene 0.1% Gel | Yes | Dermatology |
| `albuterol-hfa-inhaler` | Albuterol HFA Inhaler | Yes | Urgent Care |
| `isotretinoin-20mg-capsule` | Isotretinoin 20mg Capsule | Yes | Dermatology |
| `cephalexin-500mg-capsule` | Cephalexin 500mg Capsule | Yes | Urgent Care |

## Popular Test Diagnoses

| ID | Name | ICD-10 | Treatment Count |
|----|------|--------|-----------------|
| `urinary-tract-infection` | Urinary Tract Infection (UTI) | N39.0 | 3 |
| `acne-vulgaris` | Acne Vulgaris | L70.0 | 5 |
| `strep-throat` | Strep Throat | J02.0 | 2 |
| `acute-bronchitis` | Acute Bronchitis | J20.9 | 3 |

---

## Pretty Print with jq

### Get medication names only
```bash
curl "http://localhost:8000/api/v1/medications/search?q=albuterol" | jq '[.[] | .name]'
```

### Get diagnosis with medication count
```bash
curl "http://localhost:8000/api/v1/diagnoses/urinary-tract-infection?insurance_type=commercial" | jq '{name: .name, medication_count: (.medications | length)}'
```

### Get GoodRx coupon price
```bash
curl "http://localhost:8000/api/v1/medications/tretinoin-0025-cream" | jq '.cost_estimate.goodrx_price.coupon_price_usd'
```

### Get all medications with GoodRx pricing
```bash
# List medications by searching for common prefixes
for letter in a b c d; do
  curl -s "http://localhost:8000/api/v1/medications/search?q=$letter" | jq '[.[] | .id]'
done
```

---

## Tips & Tricks

### Use HTTPie for Pretty Output
```bash
# Install: pip install httpie
http GET "http://localhost:8000/api/v1/medications/search?q=amoxicillin"
```

### Test with Different Insurance Types in Loop
```bash
for ins in commercial medicare medicaid; do
  echo "=== $ins ==="
  curl -s "http://localhost:8000/api/v1/medications/tretinoin-0025-cream?insurance_type=$ins" | jq '.cost_estimate.label'
done
```

### Save Response to File for Inspection
```bash
curl "http://localhost:8000/api/v1/diagnoses/urinary-tract-infection?insurance_type=commercial" > uti_response.json
```

### Measure Response Time
```bash
time curl "http://localhost:8000/api/v1/medications/search?q=amoxicillin"
```

---

## Troubleshooting

### API Returns 404
- Check that Docker containers are running: `docker ps`
- Verify backend is healthy: `curl http://localhost:8000/health`

### Empty Results
- Confirm database is seeded: `docker exec fullfill_db psql -U fullfill -d fullfill -c "SELECT COUNT(*) FROM medications;"`
- Check search query spelling

### CORS Error in Browser
- Verify `CORS_ORIGINS=http://localhost:5173` in `.env`
- Restart backend if `.env` was changed

### GoodRx Price Missing
- Only 27/75 medications have GoodRx prices cached
- Check if medication has pricing: `curl "..." | jq '.cost_estimate.goodrx_price'`

---

**Document Version:** 1.0
**Last Updated:** March 1, 2026
**API Version:** v1
