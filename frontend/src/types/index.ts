export type RiskLevel = "LOW" | "MEDIUM" | "HIGH";
export type InsuranceType = "commercial" | "medicare" | "medicaid" | "cash";
export type PlanType = "PPO" | "HMO" | "HSA" | null;

export interface CostEstimate {
  low_usd: number;
  high_usd: number;
  cost_basis: string;
  label: string;
  disclaimer: string;
  data_source: string;
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
}

export interface PatientContext {
  insurance_type: InsuranceType;
  age: number | null;
  deductible_met: boolean;
  plan_type: PlanType;
  state: string | null;
}
