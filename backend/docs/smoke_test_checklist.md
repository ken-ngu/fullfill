# FullFill Smoke Test Checklist
**Manual Testing Instructions**

This checklist provides step-by-step instructions for manually testing the FullFill application. Use this before deploying to production or after making significant changes.

---

## Prerequisites

- [ ] Docker containers are running (`docker ps` shows all 4 services as healthy)
- [ ] Backend is accessible at http://localhost:8000
- [ ] Frontend is accessible at http://localhost:5173
- [ ] Database has been migrated and seeded

---

## 1. Backend API Testing (Consumer Features)

### 1.1 Health Check
- [ ] **Test:** Open http://localhost:8000/health
- [ ] **Expected:** Returns `{"status":"healthy"}`
- [ ] **Status:** _______________

### 1.2 Medication Search
- [ ] **Test:** `curl "http://localhost:8000/api/v1/medications/search?q=amoxicillin"`
- [ ] **Expected:** Returns array of medication objects containing amoxicillin
- [ ] **Verify:** Response includes `id`, `name`, `generic_name`, `brand_names`, `specialty`, `formulary_tier`
- [ ] **Status:** _______________

- [ ] **Test:** `curl "http://localhost:8000/api/v1/medications/search?q=tretinoin"`
- [ ] **Expected:** Returns tretinoin and isotretinoin (searches across all specialties)
- [ ] **Status:** _______________

- [ ] **Test:** `curl "http://localhost:8000/api/v1/medications/search?q=nonexistentdrug12345"`
- [ ] **Expected:** Returns empty array `[]`
- [ ] **Status:** _______________

### 1.3 Top Medications
- [ ] **Test:** `curl "http://localhost:8000/api/v1/medications/top"`
- [ ] **Expected:** Returns array of 6+ medications from multiple specialties
- [ ] **Verify:** Includes diverse medications (antibiotics, topicals, inhalers, etc.)
- [ ] **Status:** _______________

### 1.4 Diagnosis Search
- [ ] **Test:** `curl "http://localhost:8000/api/v1/diagnoses/search?q=uti"`
- [ ] **Expected:** Returns array containing "Urinary Tract Infection (UTI)"
- [ ] **Verify:** Object has `id: "urinary-tract-infection"`, `icd10_codes: ["N39.0"]`
- [ ] **Status:** _______________

- [ ] **Test:** `curl "http://localhost:8000/api/v1/diagnoses/search?q=acne"`
- [ ] **Expected:** Returns acne-related diagnoses
- [ ] **Status:** _______________

### 1.5 Diagnosis Detail
- [ ] **Test:** `curl "http://localhost:8000/api/v1/diagnoses/urinary-tract-infection?insurance_type=commercial"`
- [ ] **Expected:** Returns diagnosis with `medications` array containing 3+ treatment options
- [ ] **Verify:** Medications are sorted by cost (lowest first)
- [ ] **Verify:** Each medication has `cost_estimate` object with `low_usd`, `high_usd`, `cost_basis`
- [ ] **Status:** _______________

- [ ] **Test:** `curl "http://localhost:8000/api/v1/diagnoses/acne-vulgaris?insurance_type=medicaid"`
- [ ] **Expected:** Returns acne medications with medicaid-adjusted pricing
- [ ] **Status:** _______________

### 1.6 Medication Detail
- [ ] **Test:** `curl "http://localhost:8000/api/v1/medications/tretinoin-0025-cream?insurance_type=commercial"`
- [ ] **Expected:** Returns full medication detail object
- [ ] **Verify:** Contains `diagnoses` array (e.g., `["acne-vulgaris"]`)
- [ ] **Verify:** `cost_estimate.goodrx_price` object exists with `cash_price_low_usd`, `coupon_price_usd`
- [ ] **Verify:** `fill_risk_level` is one of: LOW, MEDIUM, HIGH
- [ ] **Verify:** `pa_status.required` is boolean
- [ ] **Verify:** `alternatives` array contains alternative medications
- [ ] **Status:** _______________

- [ ] **Test:** `curl "http://localhost:8000/api/v1/medications/amoxicillin-500mg-capsule"`
- [ ] **Expected:** Returns amoxicillin details with GoodRx pricing
- [ ] **Verify:** GoodRx coupon price is lower than cash price
- [ ] **Status:** _______________

### 1.7 Event Logging
- [ ] **Test:** `curl -X POST http://localhost:8000/api/v1/events -H "Content-Type: application/json" -d '{"session_id":"test-123","event_type":"medication_searched","medication_id":"test"}'`
- [ ] **Expected:** Returns success response (200 or 201)
- [ ] **Status:** _______________

---

## 2. Backend API Testing (340B Features)

### 2.1 Replenishment Endpoints
- [ ] **Test:** `curl "http://localhost:8000/api/v1/replenishment/orders?organization_id=test"`
- [ ] **Expected:** Returns 404 or empty array (endpoints not yet implemented)
- [ ] **Note:** Expected to fail at current phase
- [ ] **Status:** _______________

### 2.2 Dashboard Endpoint
- [ ] **Test:** `curl "http://localhost:8000/api/v1/replenishment/dashboard?organization_id=test"`
- [ ] **Expected:** Returns 404 or empty structure
- [ ] **Note:** Expected to fail at current phase
- [ ] **Status:** _______________

---

## 3. Frontend Testing (Consumer Features)

### 3.1 Landing Page
- [ ] **Test:** Open http://localhost:5173
- [ ] **Expected:** Landing page displays with "FullFill" branding
- [ ] **Verify:** "Continue" button is visible
- [ ] **Verify:** Top navigation shows "About", "Data Sources", "Search", "Sign In"
- [ ] **Status:** _______________

### 3.2 Navigation
- [ ] **Test:** Click "About" in navigation
- [ ] **Expected:** Navigates to About page with company information
- [ ] **Status:** _______________

- [ ] **Test:** Click "Data Sources" in navigation
- [ ] **Expected:** Navigates to Data Sources page
- [ ] **Status:** _______________

- [ ] **Test:** Click "FullFill" logo in top-left corner
- [ ] **Expected:** Returns to landing page
- [ ] **Status:** _______________

### 3.3 Search Page Access
- [ ] **Test:** Click "Continue" on landing page OR click "Search" in nav
- [ ] **Expected:** Navigates to search page with search bar
- [ ] **Verify:** Patient context bar displays at top (Insurance: Commercial, Plan: PPO)
- [ ] **Status:** _______________

### 3.4 Medication Search Flow
- [ ] **Test:** Type "amoxicillin" in search bar
- [ ] **Expected:** Dropdown appears showing medication results as you type
- [ ] **Verify:** Results show medication names, strength, and dosage form
- [ ] **Status:** _______________

- [ ] **Test:** Click on "Amoxicillin 500mg Capsule" from dropdown
- [ ] **Expected:** Medication detail card loads below search bar
- [ ] **Verify:** Card shows:
  - Fill Risk Banner (green/yellow/red)
  - Cost estimate card with insurance copay
  - GoodRx cash price (below insurance estimate)
  - PA status ("Prior authorization not required" or similar)
  - "Treats these conditions" section with clickable diagnosis links
  - Alternatives table/list
- [ ] **Status:** _______________

### 3.5 Diagnosis Search Flow
- [ ] **Test:** Clear search bar and type "uti"
- [ ] **Expected:** Dropdown shows BOTH medications and diagnoses
- [ ] **Verify:** Diagnoses are visually distinct (different icon or label)
- [ ] **Verify:** "Urinary Tract Infection (UTI)" appears in results
- [ ] **Status:** _______________

- [ ] **Test:** Click on "Urinary Tract Infection (UTI)" diagnosis
- [ ] **Expected:** Inline diagnosis view appears (NOT a new page navigation)
- [ ] **Verify:** Diagnosis view shows:
  - Diagnosis name and description
  - ICD-10 code (N39.0)
  - Table of treatment medications
  - Medications sorted by cost (cheapest first)
  - Each medication shows: name, dosage, tier, cost range, PA status
- [ ] **Status:** _______________

- [ ] **Test:** Click on a medication from the diagnosis treatment table
- [ ] **Expected:** Navigates to medication detail view
- [ ] **Status:** _______________

### 3.6 Medication-to-Diagnosis Navigation
- [ ] **Test:** Search for "tretinoin" and select "Tretinoin 0.025% Cream"
- [ ] **Expected:** Medication detail loads
- [ ] **Verify:** "Treats these conditions" section shows "Acne Vulgaris" link
- [ ] **Status:** _______________

- [ ] **Test:** Click on "Acne Vulgaris" link
- [ ] **Expected:** Inline diagnosis view loads showing acne treatments
- [ ] **Status:** _______________

### 3.7 Cost Comparison
- [ ] **Test:** View medication detail for "Tretinoin 0.025% Cream"
- [ ] **Expected:** Cost card shows:
  - Insurance estimate: ~$15-60 (Tier 2)
  - GoodRx cash price: ~$12-45
  - Coupon price: ~$9 (with badge or icon)
- [ ] **Verify:** User can easily compare insurance vs cash pricing
- [ ] **Status:** _______________

### 3.8 Patient Context Changes
- [ ] **Test:** Click on insurance type dropdown in patient context bar
- [ ] **Expected:** Dropdown shows: Commercial, Medicare, Medicaid, Cash/Uninsured
- [ ] **Status:** _______________

- [ ] **Test:** Change insurance to "Medicare" and re-search a medication
- [ ] **Expected:** Cost estimates update to reflect Medicare pricing
- [ ] **Status:** _______________

### 3.9 Alternatives Drawer/Table
- [ ] **Test:** View medication detail with alternatives (e.g., Isotretinoin)
- [ ] **Expected:** Alternatives section displays below main medication info
- [ ] **Verify:** Each alternative shows:
  - Medication name
  - Cost comparison
  - Switch reasoning/note
- [ ] **Status:** _______________

### 3.10 Fill Risk Assessment
- [ ] **Test:** Search for medication requiring PA (e.g., "Isotretinoin")
- [ ] **Expected:** Fill Risk Banner shows MEDIUM or HIGH with explanation
- [ ] **Verify:** Banner color matches risk level (green=LOW, yellow=MEDIUM, red=HIGH)
- [ ] **Status:** _______________

---

## 4. Frontend Testing (340B Admin)

### 4.1 Access 340B Dashboard
- [ ] **Test:** From search page, click "340B Admin" in top navigation
- [ ] **Expected:** Navigates to 340B Admin page
- [ ] **Verify:** Construction badge (🚧) displays next to "340B Admin" in nav
- [ ] **Status:** _______________

### 4.2 Dashboard Content
- [ ] **Test:** Review 340B Admin page content
- [ ] **Expected:** Page shows:
  - "340B Replenishment Dashboard" header
  - "Under Construction" notice
  - "Coming Soon" feature list (4 features)
  - Development timeline
  - "Back to Medication Search" button
- [ ] **Status:** _______________

### 4.3 Navigation from 340B Page
- [ ] **Test:** Click "Back to Medication Search" button
- [ ] **Expected:** Returns to search page
- [ ] **Status:** _______________

---

## 5. Mobile Responsiveness Testing

### 5.1 Mobile Navigation
- [ ] **Test:** Resize browser to mobile width (< 768px) OR open on mobile device
- [ ] **Expected:** Hamburger menu icon appears in top-right
- [ ] **Status:** _______________

- [ ] **Test:** Click hamburger menu
- [ ] **Expected:** Mobile menu slides down with navigation links
- [ ] **Verify:** Links are touch-friendly and properly spaced
- [ ] **Status:** _______________

### 5.2 Mobile Search
- [ ] **Test:** Perform medication search on mobile
- [ ] **Expected:** Search bar is full-width and touch-friendly
- [ ] **Verify:** Dropdown results are readable and tappable
- [ ] **Status:** _______________

### 5.3 Mobile Diagnosis Table
- [ ] **Test:** View diagnosis detail on mobile (e.g., UTI treatments)
- [ ] **Expected:** Treatment table scrolls horizontally if needed
- [ ] **Verify:** Table is readable without breaking layout
- [ ] **Status:** _______________

### 5.4 Mobile Medication Cards
- [ ] **Test:** View medication detail on mobile
- [ ] **Expected:** All cards stack vertically with proper spacing
- [ ] **Verify:** Cost card, PA status, and alternatives are all readable
- [ ] **Status:** _______________

### 5.5 Mobile 340B Admin
- [ ] **Test:** View 340B Admin page on mobile
- [ ] **Expected:** Layout is responsive with proper text wrapping
- [ ] **Status:** _______________

---

## 6. Database Validation

### 6.1 Check Running Containers
- [ ] **Test:** Run `docker ps`
- [ ] **Expected:** See 4 containers: backend, frontend, db (fullfill_db), redis
- [ ] **Verify:** All show status as "Up" and "healthy"
- [ ] **Status:** _______________

### 6.2 Database Connection
- [ ] **Test:** `docker exec fullfill_db psql -U fullfill -d fullfill -c "SELECT 1;"`
- [ ] **Expected:** Returns `?column? \n ---------- \n 1 \n (1 row)`
- [ ] **Status:** _______________

### 6.3 Table Existence
- [ ] **Test:** Run:
```bash
docker exec fullfill_db psql -U fullfill -d fullfill -c \
  "SELECT table_name FROM information_schema.tables
   WHERE table_schema = 'public' ORDER BY table_name;"
```
- [ ] **Expected:** See tables: medications, diagnoses, medication_diagnoses, goodrx_prices, organizations, users, contracts_340b, dispensing_records, replenishment_orders
- [ ] **Status:** _______________

### 6.4 Record Counts
- [ ] **Test:** Run:
```bash
docker exec fullfill_db psql -U fullfill -d fullfill -c \
  "SELECT 'medications' as table_name, COUNT(*) FROM medications
   UNION ALL SELECT 'diagnoses', COUNT(*) FROM diagnoses;"
```
- [ ] **Expected:** medications: 75, diagnoses: 62
- [ ] **Status:** _______________

---

## 7. Performance & Load Testing (Optional)

### 7.1 Search Performance
- [ ] **Test:** Measure time for search query response
- [ ] **Expected:** < 200ms for typical search
- [ ] **Actual Time:** _______________

### 7.2 Medication Detail Load Time
- [ ] **Test:** Measure time from click to full medication detail display
- [ ] **Expected:** < 500ms
- [ ] **Actual Time:** _______________

### 7.3 Concurrent Users
- [ ] **Test:** Open 5+ browser tabs and perform searches simultaneously
- [ ] **Expected:** All requests complete without errors
- [ ] **Status:** _______________

---

## 8. Error Handling & Edge Cases

### 8.1 Invalid Medication ID
- [ ] **Test:** `curl "http://localhost:8000/api/v1/medications/invalid-id-12345"`
- [ ] **Expected:** Returns 404 or appropriate error message
- [ ] **Status:** _______________

### 8.2 Invalid Diagnosis ID
- [ ] **Test:** `curl "http://localhost:8000/api/v1/diagnoses/invalid-diagnosis"`
- [ ] **Expected:** Returns 404 or appropriate error message
- [ ] **Status:** _______________

### 8.3 Empty Search Query
- [ ] **Test:** `curl "http://localhost:8000/api/v1/medications/search?q="`
- [ ] **Expected:** Returns empty array or all medications (depending on design choice)
- [ ] **Status:** _______________

### 8.4 Special Characters in Search
- [ ] **Test:** Type special characters in frontend search (e.g., `<script>`, `'; DROP TABLE`)
- [ ] **Expected:** No errors, no SQL injection, sanitized input
- [ ] **Status:** _______________

### 8.5 Network Disconnection
- [ ] **Test:** Disable network and try to load medication detail
- [ ] **Expected:** Error message displays gracefully (not white screen)
- [ ] **Status:** _______________

---

## 9. Browser Compatibility (Optional)

### 9.1 Chrome/Chromium
- [ ] **Test:** Run all frontend tests in Chrome
- [ ] **Expected:** All features work correctly
- [ ] **Status:** _______________

### 9.2 Firefox
- [ ] **Test:** Run all frontend tests in Firefox
- [ ] **Expected:** All features work correctly
- [ ] **Status:** _______________

### 9.3 Safari
- [ ] **Test:** Run all frontend tests in Safari
- [ ] **Expected:** All features work correctly
- [ ] **Status:** _______________

---

## 10. Security Checks (Basic)

### 10.1 CORS Headers
- [ ] **Test:** Check browser console for CORS errors when frontend calls backend
- [ ] **Expected:** No CORS errors (CORS_ORIGINS=http://localhost:5173 in .env)
- [ ] **Status:** _______________

### 10.2 SQL Injection
- [ ] **Test:** Try SQL injection in search: `curl "http://localhost:8000/api/v1/medications/search?q='; DROP TABLE medications;--"`
- [ ] **Expected:** No error, query is safely escaped
- [ ] **Status:** _______________

### 10.3 Sensitive Data Exposure
- [ ] **Test:** Review API responses for sensitive information (passwords, internal IDs, secrets)
- [ ] **Expected:** No sensitive data exposed
- [ ] **Status:** _______________

---

## Test Summary

**Date Tested:** _______________
**Tested By:** _______________
**Environment:** Docker Compose (Local Development)
**Overall Result:** PASS / FAIL / PARTIAL

### Test Results Summary:
- Total Tests: 80+
- Passed: _______________
- Failed: _______________
- Skipped: _______________

### Critical Issues Found:
1. _______________________________________________
2. _______________________________________________
3. _______________________________________________

### Non-Critical Issues:
1. _______________________________________________
2. _______________________________________________
3. _______________________________________________

### Notes:
_______________________________________________
_______________________________________________
_______________________________________________

---

## Quick Smoke Test (5 minutes)

If you're short on time, run these essential tests:

1. [ ] Backend health check: `curl http://localhost:8000/health`
2. [ ] Frontend loads: Open http://localhost:5173
3. [ ] Medication search works: Search "amoxicillin", click result
4. [ ] Diagnosis search works: Search "uti", click result
5. [ ] GoodRx pricing displays: Check tretinoin medication detail
6. [ ] 340B Admin page loads: Click "340B Admin" in nav
7. [ ] Mobile nav works: Resize to mobile, test hamburger menu
8. [ ] Database has data: `docker exec fullfill_db psql -U fullfill -d fullfill -c "SELECT COUNT(*) FROM medications;"`

**Quick Test Result:** PASS / FAIL

---

**Document Version:** 1.0
**Last Updated:** March 1, 2026
**Maintained By:** FullFill Engineering Team
