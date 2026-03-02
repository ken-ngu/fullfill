interface Props {
  diagnoses: string[];
  onNavigate: (diagnosisId: string) => void;
}

function formatDiagnosisName(id: string): string {
  // Convert kebab-case to Title Case
  // e.g., "urinary-tract-infection" -> "Urinary Tract Infection"
  return id
    .split("-")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

export function DiagnosisLinks({ diagnoses, onNavigate }: Props) {
  if (!diagnoses || diagnoses.length === 0) {
    return null;
  }

  return (
    <div className="bg-blue-50 border border-blue-200 rounded-2xl p-5 animate-fade-in">
      <p className="text-sm font-medium text-blue-900 mb-3">
        🩺 Treats these conditions:
      </p>
      <div className="flex flex-wrap gap-2">
        {diagnoses.map((diagnosisId) => (
          <button
            key={diagnosisId}
            onClick={() => onNavigate(diagnosisId)}
            className="inline-flex items-center gap-1.5 px-3 py-2 bg-white border border-blue-300 rounded-lg text-sm text-blue-900 hover:bg-blue-100 hover:border-blue-400 transition-all duration-200 shadow-sm hover:shadow"
          >
            <span>{formatDiagnosisName(diagnosisId)}</span>
            <svg
              className="w-4 h-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 5l7 7-7 7"
              />
            </svg>
          </button>
        ))}
      </div>
      <p className="text-xs text-blue-700 mt-3">
        Click a condition to compare all treatment options and pricing
      </p>
    </div>
  );
}
