import { useState } from "react";

interface Props {
  medicationName: string;
  medicationId: string;
}

export function NoAlternatives({ medicationName, medicationId }: Props) {
  const [suggestion, setSuggestion] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!suggestion.trim()) return;

    // TODO: Send to backend or analytics
    console.log("Alternative suggestion:", {
      medicationId,
      medicationName,
      suggestion: suggestion.trim(),
      timestamp: new Date().toISOString(),
    });

    setSubmitted(true);
    setTimeout(() => {
      setSuggestion("");
      setSubmitted(false);
    }, 3000);
  };

  return (
    <div className="bg-white border border-slate-200 shadow-card rounded-2xl p-6 animate-fade-in">
      {/* Header */}
      <div className="text-center mb-6">
        <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-slate-100 mb-3">
          <svg
            className="w-6 h-6 text-slate-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
            />
          </svg>
        </div>
        <h3 className="text-base font-semibold text-slate-900 mb-2">
          No Alternatives Found
        </h3>
        <p className="text-sm text-slate-600 leading-relaxed max-w-md mx-auto">
          We couldn't find any lower-cost alternatives for <strong>{medicationName}</strong> in the same therapeutic class.
        </p>
      </div>

      {/* Possible reasons */}
      <div className="bg-slate-50 rounded-xl p-4 mb-6">
        <p className="text-xs font-medium text-slate-700 mb-2">This could be because:</p>
        <ul className="text-xs text-slate-600 space-y-1.5">
          <li className="flex items-start gap-2">
            <span className="text-slate-400 shrink-0">•</span>
            <span>This is already the most cost-effective option</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-slate-400 shrink-0">•</span>
            <span>No generic or biosimilar versions available</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-slate-400 shrink-0">•</span>
            <span>Limited alternatives in this therapeutic category</span>
          </li>
        </ul>
      </div>

      {/* User suggestion form */}
      <div className="border-t border-slate-200 pt-6">
        <p className="text-sm font-medium text-slate-900 mb-3">
          Know of an alternative?
        </p>
        <p className="text-xs text-slate-600 mb-4">
          Help us improve our database by suggesting a comparable medication.
        </p>

        {!submitted ? (
          <form onSubmit={handleSubmit} className="space-y-3">
            <div>
              <input
                type="text"
                value={suggestion}
                onChange={(e) => setSuggestion(e.target.value)}
                placeholder="e.g., Generic name or brand name"
                className="w-full text-sm border border-slate-300 rounded-xl px-3 py-2.5 bg-white text-slate-900 placeholder-slate-400 outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-100 transition-all"
              />
            </div>
            <button
              type="submit"
              disabled={!suggestion.trim()}
              className="w-full bg-sky-500 hover:bg-sky-600 disabled:bg-slate-300 disabled:cursor-not-allowed text-white text-sm font-medium py-2.5 rounded-xl transition-colors shadow-sm hover:shadow"
            >
              Submit Suggestion
            </button>
          </form>
        ) : (
          <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 text-center">
            <div className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-emerald-100 mb-2">
              <svg
                className="w-5 h-5 text-emerald-600"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </div>
            <p className="text-sm font-medium text-emerald-900">Thank you!</p>
            <p className="text-xs text-emerald-700 mt-1">
              We'll review your suggestion.
            </p>
          </div>
        )}
      </div>

      {/* Help text */}
      <div className="mt-6 pt-4 border-t border-slate-200">
        <p className="text-xs text-slate-500 text-center">
          Consider discussing with your patient about manufacturer assistance programs or checking pharmacy discount cards.
        </p>
      </div>
    </div>
  );
}
