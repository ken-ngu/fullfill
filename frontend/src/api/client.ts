import type {
  MedicationSummary,
  MedicationDetail,
  PatientContext,
  DiagnosisSummary,
  DiagnosisDetail,
  DashboardSummary,
  ReplenishmentOrder,
  ReplenishmentOrderLineItem,
} from "../types";

const BASE_URL = import.meta.env.VITE_API_BASE_URL ?? "http://localhost:8000";

async function apiFetch<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE_URL}${path}`, {
    ...options,
    headers: { "Content-Type": "application/json", ...options?.headers },
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: res.statusText }));
    throw new Error(err.detail ?? "Request failed");
  }
  return res.json();
}

export async function getTopMedications(specialty?: string, setting?: string): Promise<MedicationSummary[]> {
  const params = new URLSearchParams({ limit: "6" });
  if (specialty) params.set("specialty", specialty);
  if (setting) params.set("setting", setting);
  return apiFetch<MedicationSummary[]>(`/api/v1/medications/top?${params}`);
}

export async function searchMedications(
  q: string,
  specialty?: string,
  setting?: string,
  limit = 10
): Promise<MedicationSummary[]> {
  const params = new URLSearchParams({ q, limit: String(limit) });
  if (specialty) params.set("specialty", specialty);
  if (setting) params.set("setting", setting);
  return apiFetch<MedicationSummary[]>(`/api/v1/medications/search?${params}`);
}

export async function getMedication(
  id: string,
  ctx: PatientContext,
  specialty = "dermatology"
): Promise<MedicationDetail> {
  const params = new URLSearchParams({
    insurance_type: ctx.insurance_type,
    deductible_met: String(ctx.deductible_met),
    specialty,
  });
  if (ctx.age !== null && ctx.age !== undefined) params.set("age", String(ctx.age));
  if (ctx.plan_type !== null && ctx.plan_type !== undefined) params.set("plan_type", ctx.plan_type);
  if (ctx.state !== null && ctx.state !== undefined) params.set("state", ctx.state);
  return apiFetch<MedicationDetail>(`/api/v1/medications/${encodeURIComponent(id)}?${params}`);
}

export async function logEvent(payload: {
  session_id: string;
  event_type: string;
  medication_id?: string;
  alternative_id?: string;
  specialty?: string;
  insurance_type?: string;
  patient_age_group?: string;
}): Promise<void> {
  await apiFetch("/api/v1/events", { method: "POST", body: JSON.stringify(payload) });
}

// Diagnosis API endpoints
export async function searchDiagnoses(q: string, limit = 10): Promise<DiagnosisSummary[]> {
  const params = new URLSearchParams({ q, limit: String(limit) });
  return apiFetch<DiagnosisSummary[]>(`/api/v1/diagnoses/search?${params}`);
}

export async function getDiagnosis(
  id: string,
  ctx: PatientContext
): Promise<DiagnosisDetail> {
  const params = new URLSearchParams({
    insurance_type: ctx.insurance_type,
    deductible_met: String(ctx.deductible_met),
  });
  if (ctx.age !== null && ctx.age !== undefined) params.set("age", String(ctx.age));
  if (ctx.plan_type !== null && ctx.plan_type !== undefined) params.set("plan_type", ctx.plan_type);
  if (ctx.state !== null && ctx.state !== undefined) params.set("state", ctx.state);
  return apiFetch<DiagnosisDetail>(`/api/v1/diagnoses/${encodeURIComponent(id)}?${params}`);
}

// Unified search (medications + diagnoses in parallel)
export async function unifiedSearch(
  q: string,
  specialty?: string,
  limit = 10
): Promise<{
  medications: MedicationSummary[];
  diagnoses: DiagnosisSummary[];
}> {
  const [medications, diagnoses] = await Promise.all([
    searchMedications(q, specialty, undefined, limit),
    searchDiagnoses(q, limit),
  ]);
  return { medications, diagnoses };
}

// 340B Admin Dashboard API endpoints
export async function get340BDashboard(organizationId: string): Promise<DashboardSummary> {
  // Mock data for now - will be replaced with real API call
  return {
    organization: {
      id: organizationId,
      name: "St. Mary's Community Hospital",
      type: "340B Covered Entity",
      is_340b_eligible: true,
      settings: {
        cutoff_time: "14:00",
        default_vendor: "Cardinal Health",
      },
    },
    today_order: {
      id: "order-001",
      order_date: new Date().toISOString().split('T')[0],
      status: "pending_review",
      cutoff_time: "14:00",
      line_items: [
        {
          medication_id: "med-001",
          medication_name: "Dupixent 300mg/2mL Syringe",
          ndc_code: "00024-5910-07",
          quantity: 12,
          contract_340b_id: "contract-001",
          contract_number: "340B-2024-001",
          estimated_cost_usd: 1850.00,
        },
        {
          medication_id: "med-002",
          medication_name: "Stelara 45mg/0.5mL Syringe",
          ndc_code: "57894-0060-01",
          quantity: 8,
          contract_340b_id: "contract-002",
          contract_number: "340B-2024-002",
          estimated_cost_usd: 2100.00,
        },
        {
          medication_id: "med-003",
          medication_name: "Humira 40mg/0.8mL Pen",
          ndc_code: "00024-5910-02",
          quantity: 15,
          contract_340b_id: "contract-001",
          contract_number: "340B-2024-001",
          estimated_cost_usd: 1650.00,
        },
      ],
      total_items: 3,
      estimated_cost_usd: 5600.00,
      estimated_340b_savings_usd: 18400.00,
    },
    recent_orders: [
      {
        id: "order-002",
        order_date: "2026-02-28",
        status: "submitted",
        cutoff_time: "14:00",
        line_items: [],
        total_items: 5,
        estimated_cost_usd: 4200.00,
        estimated_340b_savings_usd: 12300.00,
      },
      {
        id: "order-003",
        order_date: "2026-02-27",
        status: "approved",
        cutoff_time: "14:00",
        line_items: [],
        total_items: 8,
        estimated_cost_usd: 6800.00,
        estimated_340b_savings_usd: 21500.00,
      },
    ],
  };
}

export async function listReplenishmentOrders(organizationId: string): Promise<ReplenishmentOrder[]> {
  // Mock data - will be replaced with real API call
  return apiFetch<ReplenishmentOrder[]>(`/api/v1/organizations/${organizationId}/orders`);
}

export async function getReplenishmentOrder(orderId: string): Promise<ReplenishmentOrder> {
  // Mock data - will be replaced with real API call
  return apiFetch<ReplenishmentOrder>(`/api/v1/orders/${orderId}`);
}

export async function updateOrderLineItems(
  orderId: string,
  lineItems: ReplenishmentOrderLineItem[]
): Promise<ReplenishmentOrder> {
  // Mock implementation - will be replaced with real API call
  return apiFetch<ReplenishmentOrder>(`/api/v1/orders/${orderId}/line-items`, {
    method: "PUT",
    body: JSON.stringify({ line_items: lineItems }),
  });
}

export async function approveOrder(orderId: string): Promise<void> {
  // Mock implementation - will be replaced with real API call
  await apiFetch(`/api/v1/orders/${orderId}/approve`, {
    method: "POST",
  });
}

export async function cancelOrder(orderId: string, reason: string): Promise<void> {
  // Mock implementation - will be replaced with real API call
  await apiFetch(`/api/v1/orders/${orderId}/cancel`, {
    method: "POST",
    body: JSON.stringify({ reason }),
  });
}
