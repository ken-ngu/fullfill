import type { RiskLevel } from "../types";

interface Props {
  level: RiskLevel;
  plainLanguage: string;
  reasons: string[];
}

const RISK_STYLES: Record<RiskLevel, { bg: string; border: string; text: string; label: string }> = {
  LOW:    { bg: "bg-green-50",  border: "border-green-200",  text: "text-green-800",  label: "Low Fill Risk"    },
  MEDIUM: { bg: "bg-amber-50",  border: "border-amber-200",  text: "text-amber-800",  label: "Medium Fill Risk" },
  HIGH:   { bg: "bg-red-50",    border: "border-red-200",    text: "text-red-800",    label: "High Fill Risk"   },
};

const RISK_DOT: Record<RiskLevel, string> = {
  LOW:    "bg-green-500",
  MEDIUM: "bg-amber-400",
  HIGH:   "bg-red-500",
};

export function FillRiskBanner({ level, plainLanguage, reasons }: Props) {
  const s = RISK_STYLES[level];
  return (
    <div className={`w-full rounded-2xl p-4 border ${s.bg} ${s.border}`}>
      <div className="flex items-center gap-2 mb-1">
        <span className={`w-2.5 h-2.5 rounded-full shrink-0 ${RISK_DOT[level]}`} />
        <p className={`text-sm font-semibold ${s.text}`}>{s.label}</p>
      </div>
      <p className={`text-xs ${s.text} mb-2`}>{plainLanguage}</p>
      {reasons.length > 0 && (
        <ul className={`text-xs ${s.text} space-y-0.5 list-none`}>
          {reasons.map((r) => (
            <li key={r} className="opacity-80">· {r}</li>
          ))}
        </ul>
      )}
    </div>
  );
}
