import type { DiagnosisDetail } from "../types";

interface Props {
  diagnosis: DiagnosisDetail;
  onSelectMedication: (medicationId: string) => void;
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

  const tooltips = {
    1: "Tier 1: Lowest cost - Generic medications",
    2: "Tier 2: Low cost - Preferred brands",
    3: "Tier 3: Higher cost - Non-preferred brands",
    4: "Tier 4: Highest cost - Specialty medications",
  };

  return (
    <span
      className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium whitespace-nowrap cursor-help ${colors[tier as keyof typeof colors] || "bg-gray-100 text-gray-800"}`}
      title={tooltips[tier as keyof typeof tooltips] || `Tier ${tier}`}
    >
      T{tier}
    </span>
  );
}

export function DiagnosisDetailView({ diagnosis, onSelectMedication }: Props) {
  return (
    <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-[1fr_1.2fr] gap-6">
      {/* Left column: Diagnosis information */}
      <div className="bg-white border border-slate-200 shadow-sm rounded-3xl p-6">
        <div className="space-y-3">
          {/* Diagnosis name */}
          <div>
            <h2 className="text-xl font-semibold text-slate-900">{diagnosis.name}</h2>
            <div className="flex flex-wrap gap-2 mt-2 text-xs text-slate-600">
              <span className="bg-slate-100 px-2 py-1 rounded">
                ICD-10: {diagnosis.icd10_codes.join(", ")}
              </span>
              <span className="bg-slate-100 px-2 py-1 rounded capitalize">
                {diagnosis.category.replace(/_/g, " ")}
              </span>
            </div>
          </div>

          {/* Description */}
          {diagnosis.description && (
            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4">
              <p className="text-sm text-slate-700 leading-relaxed">{diagnosis.description}</p>
            </div>
          )}

          {/* Synonyms */}
          {diagnosis.synonyms && diagnosis.synonyms.length > 0 && (
            <div className="border-t border-slate-200 pt-3">
              <p className="text-xs font-medium text-slate-500 mb-2">Also known as:</p>
              <p className="text-xs text-slate-600">{diagnosis.synonyms.join(", ")}</p>
            </div>
          )}

          {/* Info note */}
          <div className="bg-blue-50 border border-blue-200 rounded-2xl p-4">
            <p className="text-xs text-blue-700">
              <span className="font-medium">Treatment Options:</span> {diagnosis.medications.length} medication{diagnosis.medications.length !== 1 ? "s" : ""} available for this condition
            </p>
          </div>

          {/* Disclaimer */}
          <p className="text-xs text-slate-400 px-1">
            Treatment options are sorted by estimated cost. Click any medication to view full details.
          </p>
        </div>
      </div>

      {/* Right column: Medications table */}
      <div className="bg-white border border-slate-200 shadow-sm rounded-3xl overflow-hidden">
        <div className="p-6 border-b border-slate-200">
          <h3 className="text-lg font-semibold text-slate-900">Treatment Options</h3>
          <p className="text-sm text-slate-600 mt-1">
            Medications that treat {diagnosis.name}
          </p>
        </div>

        {diagnosis.medications.length === 0 ? (
          <div className="p-8 text-center text-slate-500">
            <p className="text-sm">No medications found for this diagnosis.</p>
          </div>
        ) : (
          <>
            {/* Mobile: Card-based layout */}
            <div className="block lg:hidden divide-y divide-slate-200">
              {diagnosis.medications.map((med) => (
                <div
                  key={med.id}
                  onClick={() => onSelectMedication(med.id)}
                  className="p-4 hover:bg-slate-50 cursor-pointer transition-colors"
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-slate-900 truncate">{med.name}</p>
                      <p className="text-xs text-slate-500 mt-0.5">
                        {med.generic_name}
                        {med.brand_names.length > 0 && ` (${med.brand_names[0]})`}
                      </p>
                    </div>
                    <FormularyTierBadge tier={med.formulary_tier} />
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <div>
                      <span className="font-semibold text-slate-900">
                        {formatCostRange(med.cost_estimate)}
                      </span>
                      <span className="text-xs text-slate-500 ml-2">{med.cost_estimate.cost_basis}</span>
                    </div>
                    {med.requires_pa && (
                      <span className="text-xs text-orange-700 font-medium">PA Required</span>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Desktop: Table layout */}
            <div className="hidden lg:block overflow-x-auto">
              <table className="w-full">
                <thead className="bg-slate-50 border-b border-slate-200">
                  <tr>
                    <th className="text-left px-4 py-3 text-xs font-medium text-slate-700 uppercase tracking-wider">
                      Medication
                    </th>
                    <th className="text-left px-4 py-3 text-xs font-medium text-slate-700 uppercase tracking-wider whitespace-nowrap">
                      Cost
                    </th>
                    <th className="text-left px-4 py-3 text-xs font-medium text-slate-700 uppercase tracking-wider">
                      Tier
                    </th>
                    <th className="text-left px-4 py-3 text-xs font-medium text-slate-700 uppercase tracking-wider">
                      PA
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {diagnosis.medications.map((med) => (
                    <tr
                      key={med.id}
                      onClick={() => onSelectMedication(med.id)}
                      className="hover:bg-slate-50 cursor-pointer transition-colors"
                    >
                      <td className="px-4 py-4">
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
                      <td className="px-4 py-4 whitespace-nowrap">
                        <p className="text-sm font-semibold text-slate-900">
                          {formatCostRange(med.cost_estimate)}
                        </p>
                        <p className="text-xs text-slate-500">{med.cost_estimate.cost_basis}</p>
                      </td>
                      <td className="px-4 py-4">
                        <FormularyTierBadge tier={med.formulary_tier} />
                      </td>
                      <td className="px-4 py-4">
                        <span className={`text-sm ${med.requires_pa ? "text-orange-700 font-medium" : "text-slate-600"}`}>
                          {med.requires_pa ? "Yes" : "No"}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
