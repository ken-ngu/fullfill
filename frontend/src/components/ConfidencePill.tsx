interface Props {
  score: number;
  showNote?: boolean;  // Show inline note when score < 50
}

function getTier(score: number) {
  if (score >= 75) return { label: "Good estimate",     dot: "bg-emerald-500", text: "text-emerald-700", bg: "bg-emerald-50" };
  if (score >= 50) return { label: "Estimate may vary", dot: "bg-amber-400",   text: "text-amber-700",  bg: "bg-amber-50"  };
  return              { label: "Limited data",       dot: "bg-red-400",     text: "text-red-700",    bg: "bg-red-50"    };
}

export function ConfidencePill({ score, showNote = false }: Props) {
  const tier = getTier(score);
  return (
    <div>
      <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-medium ${tier.bg} ${tier.text}`}>
        <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${tier.dot}`} />
        {tier.label}
      </span>
      {showNote && score < 50 && (
        <p className="text-xs text-slate-500 mt-1">
          Actual cost depends on your patient's specific plan. Verify before prescribing.
        </p>
      )}
    </div>
  );
}

/** Dot-only variant for alternatives drawer */
export function ConfidenceDot({ score }: { score: number }) {
  const tier = getTier(score);
  return (
    <span title={tier.label} className="cursor-help">
      <span className={`inline-block w-2 h-2 rounded-full ${tier.dot}`} />
    </span>
  );
}
