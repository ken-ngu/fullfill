import type { MedicationSummary, MedicationDetail, PatientContext } from "../types";

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
