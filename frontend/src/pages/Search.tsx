import { useState, useCallback, useRef } from "react";
import { v4 as uuidv4 } from "uuid";
import type { MedicationSummary, MedicationDetail, PatientContext } from "../types";
import { getMedication, logEvent } from "../api/client";
import { SearchBar } from "../components/SearchBar";
import { FillRiskBanner } from "../components/FillRiskBanner";
import { CostCard } from "../components/CostCard";
import { PAStatusCard } from "../components/PAStatusCard";
import { AlternativesDrawer } from "../components/AlternativesDrawer";
import { AlternativesTable } from "../components/AlternativesTable";
import { NoAlternatives } from "../components/NoAlternatives";
import { LoadingSkeleton } from "../components/LoadingSkeleton";
import { PatientContextBar } from "../components/PatientContextBar";
import { SpecialtySelector } from "../components/SpecialtySelector";
import { Navbar } from "../components/Navbar";

const SESSION_ID = uuidv4();

function ageGroup(age: number | null): string | undefined {
  if (age === null) return undefined;
  if (age < 18) return "child";
  if (age < 65) return "adult";
  return "senior";
}

interface SearchProps {
  specialty: string;
  setting: string;
  onSpecialtyChange: (specialty: string, setting: string) => void;
  onNavigate: (page: string) => void;
  user: { email: string; name: string } | null;
}

export function Search({ specialty, setting, onSpecialtyChange, onNavigate, user }: SearchProps) {
  const [detail, setDetail] = useState<MedicationDetail | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [ctx, setCtx] = useState<PatientContext>({
    insurance_type: "commercial",
    age: null,
    deductible_met: false,
    plan_type: "PPO",
    state: null,
  });
  const ctxRef = useRef(ctx);
  ctxRef.current = ctx;

  const loadMedication = useCallback(async (id: string, currentCtx: PatientContext) => {
    setLoading(true);
    setError(null);
    try {
      const data = await getMedication(id, currentCtx);
      setDetail(data);
      logEvent({
        session_id: SESSION_ID,
        event_type: "medication_selected",
        medication_id: id,
        insurance_type: currentCtx.insurance_type,
        patient_age_group: ageGroup(currentCtx.age),
      }).catch(() => {});
    } catch (e) {
      setError((e as Error).message);
      setDetail(null);
    } finally {
      setLoading(false);
    }
  }, []);

  function handleSearchSelect(med: MedicationSummary) {
    logEvent({
      session_id: SESSION_ID,
      event_type: "medication_searched",
      medication_id: med.id,
      insurance_type: ctx.insurance_type,
    }).catch(() => {});
    loadMedication(med.id, ctx);
  }

  function handleSwitch(alternativeId: string) {
    logEvent({
      session_id: SESSION_ID,
      event_type: "quick_switch_used",
      medication_id: detail?.id,
      alternative_id: alternativeId,
      insurance_type: ctx.insurance_type,
    }).catch(() => {});
    loadMedication(alternativeId, ctx);
  }

  function handleCtxChange(newCtx: PatientContext) {
    setCtx(newCtx);
    // Re-fetch if a medication is already selected
    if (detail) {
      loadMedication(detail.id, newCtx);
    }
  }

  return (
    <div className="min-h-screen bg-white">
      <Navbar variant="app" onNavigate={onNavigate} />
      <div className="max-w-7xl mx-auto px-4 pt-24 pb-24">
        {/* Search and controls - Apple-inspired minimal layout */}
        <div className="max-w-2xl mx-auto">
          {/* Specialty selector - subtle, right-aligned */}
          <div className="flex justify-end mb-6">
            <SpecialtySelector
              onSelect={onSpecialtyChange}
              currentSpecialty={specialty}
              currentSetting={setting}
            />
          </div>

          {/* Search bar - hero element */}
          <div className="mb-6">
            <SearchBar onSelect={handleSearchSelect} specialty={specialty} setting={setting} />
          </div>

          {/* Patient context - below search */}
          <div className="mb-8">
            <PatientContextBar ctx={ctx} onChange={handleCtxChange} />
          </div>
        </div>

        {/* Results */}
        {loading && (
          <div className="max-w-2xl mx-auto">
            <LoadingSkeleton />
          </div>
        )}

        {error && (
          <div className="max-w-2xl mx-auto">
            <div className="bg-red-50 border border-red-200 rounded-2xl p-4">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          </div>
        )}

        {!loading && detail && (
          <>
            {/* Two-column layout on larger screens */}
            <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-[1fr_1.2fr] gap-6">
              {/* Left column: Main medication details */}
              <div className="bg-white border border-slate-200 shadow-sm rounded-3xl p-6">
                <div className="space-y-3 transition-opacity duration-150">
                  {/* Medication name */}
                  <div>
                    <p className="text-base font-semibold text-slate-900">{detail.name}</p>
                    <p className="text-xs text-slate-500">{detail.generic_name} · {detail.dosage_form} · {detail.strength}</p>
                  </div>

                  {/* 1. Fill risk (dominant) */}
                  <FillRiskBanner
                    level={detail.fill_risk_level}
                    plainLanguage={detail.fill_risk_plain_language}
                    reasons={detail.fill_risk_reasons}
                  />

                  {/* 2. Cost + PA side by side */}
                  <div className="grid grid-cols-2 gap-3">
                    <CostCard estimate={detail.cost_estimate} confidenceScore={detail.confidence_score} />
                    <PAStatusCard pa={detail.pa_status} />
                  </div>

                  {/* Mobile-only: Alternatives drawer for small screens */}
                  <div className="lg:hidden">
                    {detail.alternatives.length > 0 ? (
                      <AlternativesDrawer
                        alternatives={detail.alternatives}
                        onSwitch={handleSwitch}
                      />
                    ) : (
                      <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 text-center">
                        <p className="text-sm font-medium text-slate-700 mb-1">
                          No Alternatives Found
                        </p>
                        <p className="text-xs text-slate-500">
                          This may already be the most cost-effective option.
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Disclaimer */}
                  <p className="text-xs text-slate-400 px-1">
                    Estimates based on public formulary data. Not a guarantee of patient cost.
                  </p>
                </div>
              </div>

              {/* Right column: Alternatives table or no alternatives message (desktop only) */}
              <div className="hidden lg:block">
                {detail.alternatives.length > 0 ? (
                  <AlternativesTable
                    alternatives={detail.alternatives}
                    primaryCostLow={detail.cost_estimate.low_usd}
                    primaryCostHigh={detail.cost_estimate.high_usd}
                    onSwitch={handleSwitch}
                  />
                ) : (
                  <NoAlternatives
                    medicationName={detail.name}
                    medicationId={detail.id}
                  />
                )}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
