import type { AlternativeSummary, RiskLevel } from "../types";
import { ConfidenceDot } from "./ConfidencePill";

interface Props {
  alternatives: AlternativeSummary[];
  primaryCostLow: number;
  primaryCostHigh: number;
  onSwitch: (id: string) => void;
}

const RISK_COLOR: Record<RiskLevel, string> = {
  LOW:    "text-green-700 bg-green-50",
  MEDIUM: "text-amber-700 bg-amber-50",
  HIGH:   "text-red-700 bg-red-50",
};

const RISK_DOT: Record<RiskLevel, string> = {
  LOW:    "bg-green-500",
  MEDIUM: "bg-amber-400",
  HIGH:   "bg-red-500",
};

function formatUsd(n: number) {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(n);
}

function calculateSavings(primaryLow: number, primaryHigh: number, altLow: number, altHigh: number) {
  const savingsLow = Math.max(0, primaryLow - altHigh);
  const savingsHigh = Math.max(0, primaryHigh - altLow);

  if (savingsLow <= 0 && savingsHigh <= 0) return null;

  if (savingsLow === savingsHigh) {
    return formatUsd(savingsLow);
  }

  return `${formatUsd(savingsLow)}-${formatUsd(savingsHigh)}`;
}

export function AlternativesTable({ alternatives, primaryCostLow, primaryCostHigh, onSwitch }: Props) {
  if (alternatives.length === 0) return null;

  // Show top 5 alternatives
  const topAlternatives = alternatives.slice(0, 5);

  return (
    <div className="bg-white border border-slate-200 shadow-card rounded-2xl p-4 animate-fade-in">
      <div className="mb-3">
        <h3 className="text-sm font-semibold text-slate-900">Lower-Cost Alternatives</h3>
        <p className="text-xs text-slate-500 mt-0.5">
          {alternatives.length} option{alternatives.length !== 1 ? "s" : ""} available
        </p>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-xs">
          <thead>
            <tr className="border-b border-slate-200">
              <th className="text-left py-2 pr-2 font-medium text-slate-600">Medication</th>
              <th className="text-left py-2 px-2 font-medium text-slate-600">Cost</th>
              <th className="text-left py-2 px-2 font-medium text-slate-600">Savings</th>
              <th className="text-left py-2 px-2 font-medium text-slate-600">Risk</th>
              <th className="text-right py-2 pl-2 font-medium text-slate-600">Action</th>
            </tr>
          </thead>
          <tbody>
            {topAlternatives.map((alt) => {
              const savings = calculateSavings(primaryCostLow, primaryCostHigh, alt.cost_estimate.low_usd, alt.cost_estimate.high_usd);

              return (
                <tr key={alt.id} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                  <td className="py-3 pr-2">
                    <div className="min-w-0">
                      {alt.brand_names && alt.brand_names.length > 0 ? (
                        <>
                          <p className="font-medium text-slate-900 truncate text-xs">
                            {alt.brand_names[0]}{" "}
                            <span className="text-slate-500 font-normal">({alt.generic_name})</span>
                          </p>
                          {alt.brand_names.length > 1 && (
                            <p className="text-slate-400 truncate text-xs mt-0.5">
                              +{alt.brand_names.length - 1} more
                            </p>
                          )}
                        </>
                      ) : (
                        <>
                          <p className="font-medium text-slate-900 truncate text-xs">{alt.generic_name}</p>
                          <p className="text-slate-500 truncate text-xs mt-0.5">{alt.name}</p>
                        </>
                      )}
                    </div>
                  </td>
                  <td className="py-3 px-2 whitespace-nowrap">
                    <div className="flex items-center gap-1">
                      <span className="font-medium text-slate-900">
                        {formatUsd(alt.cost_estimate.low_usd)}–{formatUsd(alt.cost_estimate.high_usd)}
                      </span>
                      <ConfidenceDot score={alt.confidence_score} />
                    </div>
                  </td>
                  <td className="py-3 px-2 whitespace-nowrap">
                    {savings ? (
                      <span className="inline-flex items-center gap-1 text-green-700 font-medium">
                        <span className="text-green-500">↓</span>
                        Save {savings}
                      </span>
                    ) : (
                      <span className="text-slate-400">-</span>
                    )}
                  </td>
                  <td className="py-3 px-2">
                    <div className="flex items-center gap-1.5">
                      <span className={`w-2 h-2 rounded-full shrink-0 ${RISK_DOT[alt.fill_risk_level]}`} />
                      <span className={`text-xs font-medium px-1.5 py-0.5 rounded ${RISK_COLOR[alt.fill_risk_level]}`}>
                        {alt.fill_risk_level}
                      </span>
                    </div>
                  </td>
                  <td className="py-3 pl-2 text-right">
                    <button
                      onClick={() => onSwitch(alt.id)}
                      className="px-3 py-1.5 bg-sky-500 hover:bg-sky-600 text-white text-xs font-medium rounded-lg transition-colors shadow-sm hover:shadow"
                    >
                      Switch
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {alternatives.length > 5 && (
        <p className="text-xs text-slate-400 mt-2 text-center">
          Showing top 5 of {alternatives.length} alternatives
        </p>
      )}

      <p className="text-xs text-slate-400 mt-3 px-1">
        Alternatives are therapeutically equivalent with lower estimated costs based on current insurance.
      </p>
    </div>
  );
}
