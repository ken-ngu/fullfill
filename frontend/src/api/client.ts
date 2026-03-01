import type { MedicationSummary, MedicationDetail, PatientContext } from "../types";

const BASE_URL = import.meta.env.VITE_API_BASE_URL ?? "http://localhost:8000";

function authHeaders(): Record<string, string> {
  const token = localStorage.getItem("fullfill_token");
  return token ? { Authorization: `Bearer ${token}` } : {};
}

async function apiFetch<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE_URL}${path}`, {
    ...options,
    headers: { "Content-Type": "application/json", ...authHeaders(), ...options?.headers },
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: res.statusText }));
    throw new Error(err.detail ?? "Request failed");
  }
  return res.json();
}

export async function login(clinicCode: string, pin: string): Promise<string> {
  const data = await apiFetch<{ access_token: string }>("/api/v1/auth/token", {
    method: "POST",
    body: JSON.stringify({ clinic_code: clinicCode, pin }),
  });
  return data.access_token;
}

export async function searchMedications(
  q: string,
  specialty?: string,
  limit = 10
): Promise<MedicationSummary[]> {
  const params = new URLSearchParams({ q, limit: String(limit) });
  if (specialty) params.set("specialty", specialty);
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
