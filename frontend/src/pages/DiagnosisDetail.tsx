import { useState, useEffect } from "react";
import type { DiagnosisDetail, PatientContext } from "../types";
import { getDiagnosis } from "../api/client";
import { LoadingSkeleton } from "../components/LoadingSkeleton";

interface Props {
  diagnosisId: string;
  patientContext: PatientContext;
  onNavigateToMedication: (medicationId: string) => void;
}

function formatCostRange(estimate: { low_usd: number; high_usd: number }): string {
  if (estimate.low_usd === estimate.high_usd) {
    return `$${estimate.low_usd.toFixed(0)}`;
  }
  return `$${estimate.low_usd.toFixed(0)}–$${estimate.high_usd.toFixed(0)}`;
}

function FormularyTierBadge({ tier }: { tier: number }) {
  const colors = {
    1: "bg-green-100 text-green-800",
    2: "bg-blue-100 text-blue-800",
    3: "bg-yellow-100 text-yellow-800",
    4: "bg-orange-100 text-orange-800",
  };
  return (
    <span className={`px-2 py-1 rounded text-xs font-medium ${colors[tier as keyof typeof colors] || "bg-gray-100 text-gray-800"}`}>
      Tier {tier}
    </span>
  );
}

export function DiagnosisDetail({ diagnosisId, patientContext, onNavigateToMedication }: Props) {
  const [diagnosis, setDiagnosis] = useState<DiagnosisDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    setError(null);
    getDiagnosis(diagnosisId, patientContext)
      .then((data) => {
        setDiagnosis(data);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  }, [diagnosisId, patientContext]);

  if (loading) {
    return <LoadingSkeleton />;
  }

  if (error) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-800">Failed to load diagnosis: {error}</p>
        </div>
      </div>
    );
  }

  if (!diagnosis) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <p className="text-yellow-800">Diagnosis not found</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
        <h1 className="text-3xl font-semibold text-slate-900 mb-2">{diagnosis.name}</h1>
        <div className="flex gap-4 text-sm text-slate-600">
          <span>ICD-10: {diagnosis.icd10_codes.join(", ")}</span>
          <span>•</span>
          <span className="capitalize">{diagnosis.category.replace(/_/g, " ")}</span>
        </div>
        {diagnosis.description && (
          <p className="mt-4 text-slate-700 leading-relaxed">{diagnosis.description}</p>
        )}
      </div>

      {/* Treatment Options */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-200">
          <h2 className="text-xl font-semibold text-slate-900">
            Treatment Options
          </h2>
          <p className="text-sm text-slate-600 mt-1">
            Compare pricing for {diagnosis.medications.length} medication{diagnosis.medications.length !== 1 ? "s" : ""} that treat {diagnosis.name}
          </p>
        </div>

        {diagnosis.medications.length === 0 ? (
          <div className="p-8 text-center text-slate-500">
            No medications found for this diagnosis.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="text-left px-6 py-3 text-xs font-medium text-slate-700 uppercase tracking-wider">
                    Medication
                  </th>
                  <th className="text-left px-6 py-3 text-xs font-medium text-slate-700 uppercase tracking-wider">
                    Estimated Cost
                  </th>
                  <th className="text-left px-6 py-3 text-xs font-medium text-slate-700 uppercase tracking-wider">
                    Tier
                  </th>
                  <th className="text-left px-6 py-3 text-xs font-medium text-slate-700 uppercase tracking-wider">
                    PA Required
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {diagnosis.medications.map((med) => (
                  <tr
                    key={med.id}
                    onClick={() => onNavigateToMedication(med.id)}
                    className="hover:bg-slate-50 cursor-pointer transition-colors"
                  >
                    <td className="px-6 py-4">
                      <div>
                        <p className="text-sm font-medium text-slate-900">{med.name}</p>
                        <p className="text-xs text-slate-500 mt-1">
                          {med.generic_name}
                          {med.brand_names.length > 0 && ` (${med.brand_names[0]})`}
                        </p>
                        <p className="text-xs text-slate-500">
                          {med.strength} {med.dosage_form}
                        </p>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-sm font-semibold text-slate-900">
                        {formatCostRange(med.cost_estimate)}
                      </p>
                      <p className="text-xs text-slate-500">{med.cost_estimate.cost_basis}</p>
                    </td>
                    <td className="px-6 py-4">
                      <FormularyTierBadge tier={med.formulary_tier} />
                    </td>
                    <td className="px-6 py-4">
                      <span className={`text-sm ${med.requires_pa ? "text-orange-700 font-medium" : "text-slate-600"}`}>
                        {med.requires_pa ? "Yes" : "No"}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Footer note */}
      <div className="text-xs text-slate-500 text-center">
        Medications are sorted by estimated cost (lowest first). Click a medication to view full details.
      </div>
    </div>
  );
}
