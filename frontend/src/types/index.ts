export type RiskLevel = "LOW" | "MEDIUM" | "HIGH";
export type InsuranceType = "commercial" | "medicare" | "medicaid" | "cash";
export type PlanType = "PPO" | "HMO" | "HSA" | null;

export interface GoodRxPrice {
  cash_price_low_usd: number;
  cash_price_high_usd: number;
  coupon_price_usd?: number;
  last_updated?: string;
}

export interface CostEstimate {
  low_usd: number;
  high_usd: number;
  cost_basis: string;
  label: string;
  disclaimer: string;
  data_source: string;
  goodrx_price?: GoodRxPrice;
}

export interface PAStatus {
  required: boolean;
  approval_rate: number | null;
  turnaround_days: string | null;
  step_therapy_required: boolean;
  step_therapy_agents: string[];
}

export interface AlternativeSummary {
  id: string;
  name: string;
  generic_name: string;
  brand_names?: string[];
  cost_estimate: CostEstimate;
  fill_risk_level: RiskLevel;
  confidence_score: number;
  switch_note: string;
}

export interface MedicationSummary {
  id: string;
  name: string;
  generic_name: string;
  brand_names?: string[];
  specialty: string;
  category: string;
  dosage_form: string;
  strength: string;
  formulary_tier: number;
  requires_pa: boolean;
  is_otc: boolean;
}

export interface MedicationDetail extends MedicationSummary {
  brand_names: string[];
  therapeutic_class: string;
  brand_only: boolean;
  step_therapy_required: boolean;
  ndc_codes: string[];
  confidence_score: number;
  cost_estimate: CostEstimate;
  fill_risk_level: RiskLevel;
  fill_risk_score: number;
  fill_risk_reasons: string[];
  fill_risk_plain_language: string;
  pa_status: PAStatus;
  alternatives: AlternativeSummary[];
  diagnoses: string[];
}

export interface PatientContext {
  insurance_type: InsuranceType;
  age: number | null;
  deductible_met: boolean;
  plan_type: PlanType;
  state: string | null;
}

// Diagnosis types
export interface DiagnosisSummary {
  id: string;
  name: string;
  icd10_codes: string[];
  category: string;
}

export interface DiagnosisMedicationSummary {
  id: string;
  name: string;
  generic_name: string;
  brand_names: string[];
  dosage_form: string;
  strength: string;
  formulary_tier: number;
  requires_pa: boolean;
  cost_estimate: CostEstimate;
}

export interface DiagnosisDetail {
  id: string;
  name: string;
  icd10_codes: string[];
  description?: string;
  category: string;
  synonyms: string[];
  medications: DiagnosisMedicationSummary[];
}

// Union type for search results (medications + diagnoses)
export type SearchResult = MedicationSummary | DiagnosisSummary;

// Type guards for search results
export function isMedication(result: SearchResult): result is MedicationSummary {
  return 'generic_name' in result;
}

export function isDiagnosis(result: SearchResult): result is DiagnosisSummary {
  return 'icd10_codes' in result;
}

// 340B Admin Dashboard types
export type UserRole = "clinician" | "hospital_admin" | "pharmacy_staff";

export interface Organization {
  id: string;
  name: string;
  type: string;
  is_340b_eligible: boolean;
  settings: {
    cutoff_time: string;
    default_vendor: string;
  };
}

export interface Contract340B {
  id: string;
  contract_number: string;
  vendor_name: string;
  vendor_portal_url?: string;
  is_active: boolean;
}

export interface ReplenishmentOrderLineItem {
  medication_id: string;
  medication_name: string;
  ndc_code: string;
  quantity: number;
  contract_340b_id: string;
  contract_number: string;
  estimated_cost_usd: number;
}

export interface ReplenishmentOrder {
  id: string;
  order_date: string;
  status: "draft" | "pending_review" | "approved" | "submitted" | "cancelled";
  cutoff_time: string;
  line_items: ReplenishmentOrderLineItem[];
  total_items: number;
  estimated_cost_usd: number;
  estimated_340b_savings_usd: number;
  admin_notes?: string;
}

export interface DashboardSummary {
  organization: Organization;
  today_order: ReplenishmentOrder | null;
  recent_orders: ReplenishmentOrder[];
}
