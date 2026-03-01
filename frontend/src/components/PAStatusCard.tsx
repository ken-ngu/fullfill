import type { PAStatus } from "../types";

interface Props {
  pa: PAStatus;
}

export function PAStatusCard({ pa }: Props) {
  if (!pa.required) {
    return (
      <div className="bg-slate-50 border border-slate-200 shadow-card hover:shadow-card-hover rounded-2xl p-4 flex items-start gap-3 transition-all duration-200 hover:bg-white animate-fade-in">
        <span className="text-green-500 text-lg shrink-0">✓</span>
        <div>
          <p className="text-xs font-medium text-slate-700">No PA Required</p>
          <p className="text-xs text-slate-500 mt-0.5">Ready to prescribe</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-amber-50 border border-amber-200 shadow-card hover:shadow-card-hover rounded-2xl p-4 transition-all duration-200 animate-fade-in">
      <div className="flex items-center gap-2 mb-2">
        <span className="text-amber-500 shrink-0">🔒</span>
        <p className="text-xs font-semibold text-amber-800">PA Required</p>
      </div>

      {pa.approval_rate !== null && pa.approval_rate !== undefined && (
        <p className="text-xs text-amber-700">
          ~{Math.round(pa.approval_rate * 100)}% approval rate
        </p>
      )}
      {pa.turnaround_days && (
        <p className="text-xs text-amber-700">{pa.turnaround_days}</p>
      )}
      {pa.step_therapy_required && (
        <p className="text-xs text-amber-700 mt-1">
          Step therapy: try {pa.step_therapy_agents.slice(0, 2).join(", ")} first
        </p>
      )}
    </div>
  );
}
