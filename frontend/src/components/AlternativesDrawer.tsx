import type { AlternativeSummary, RiskLevel } from "../types";
import { ConfidenceDot } from "./ConfidencePill";
import { QuickSwitch } from "./QuickSwitch";

interface Props {
  alternatives: AlternativeSummary[];
  onSwitch: (id: string) => void;
}

const RISK_COLOR: Record<RiskLevel, string> = {
  LOW:    "text-green-700",
  MEDIUM: "text-amber-700",
  HIGH:   "text-red-700",
};

function formatUsd(n: number) {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(n);
}

export function AlternativesDrawer({ alternatives, onSwitch }: Props) {
  if (alternatives.length === 0) return null;

  return (
    <details className="group" open>
      <summary className="cursor-pointer select-none list-none flex items-center justify-between py-3 px-4 bg-green-50 border border-green-200 rounded-xl text-sm font-semibold text-green-700 hover:bg-green-100 transition-colors">
        <span className="flex items-center gap-2">
          <span className="text-base">💰</span>
          {alternatives.length} Lower-Cost Option{alternatives.length !== 1 ? "s" : ""} Available
        </span>
        <span className="text-xs text-green-600 group-open:rotate-180 transition-transform inline-block">▼</span>
      </summary>

      <div className="space-y-2 pt-3 pb-1">
        {alternatives.map((alt) => (
          <div
            key={alt.id}
            className="bg-slate-50 border border-slate-200 rounded-2xl p-3 flex items-center justify-between gap-3"
          >
            <div className="min-w-0">
              <p className="text-xs font-medium text-slate-900 truncate">{alt.name}</p>
              <p className="text-xs text-slate-500">{alt.generic_name}</p>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-xs text-slate-700">
                  {formatUsd(alt.cost_estimate.low_usd)}–{formatUsd(alt.cost_estimate.high_usd)}
                </span>
                <span className={`text-xs font-medium ${RISK_COLOR[alt.fill_risk_level]}`}>
                  {alt.fill_risk_level}
                </span>
                <ConfidenceDot score={alt.confidence_score} />
              </div>
              <p className="text-xs text-slate-400 mt-0.5 truncate">{alt.switch_note}</p>
            </div>
            <QuickSwitch
              alternativeId={alt.id}
              alternativeName={alt.name}
              onSwitch={onSwitch}
            />
          </div>
        ))}
      </div>
    </details>
  );
}
