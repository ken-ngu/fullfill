import { useState } from "react";

interface Props {
  onSelect: (specialty: string, setting: string) => void;
  currentSpecialty?: string;
  currentSetting?: string;
}

const SPECIALTIES = [
  { id: "dermatology", name: "Dermatology", icon: "🩺", setting: "outpatient" },
  { id: "emergency", name: "Emergency Medicine", icon: "🚨", setting: "emergency" },
  { id: "urgent_care", name: "Urgent Care", icon: "⚡", setting: "urgent_care" },
  { id: "primary_care", name: "Primary Care", icon: "👨‍⚕️", setting: "outpatient" },
  { id: "endocrinology", name: "Endocrinology", icon: "💉", setting: "outpatient" },
];

export function SpecialtySelector({ onSelect, currentSpecialty, currentSetting }: Props) {
  const [isOpen, setIsOpen] = useState(false);

  const current = SPECIALTIES.find(s => s.id === currentSpecialty) || SPECIALTIES[0];

  function handleSelect(specialty: typeof SPECIALTIES[0]) {
    onSelect(specialty.id, specialty.setting);
    setIsOpen(false);
  }

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors shadow-sm"
      >
        <span className="text-lg">{current.icon}</span>
        <span className="text-sm font-medium text-slate-700">{current.name}</span>
        <svg
          className={`w-4 h-4 text-slate-400 transition-transform ${
            isOpen ? "rotate-180" : ""
          }`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-10"
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute top-full left-0 mt-2 w-64 bg-white border border-slate-200 rounded-xl shadow-xl z-20 overflow-hidden">
            {SPECIALTIES.map((specialty) => (
              <button
                key={specialty.id}
                onClick={() => handleSelect(specialty)}
                className={`w-full flex items-center gap-3 px-4 py-3 hover:bg-slate-50 transition-colors ${
                  specialty.id === current.id ? "bg-blue-50" : ""
                }`}
              >
                <span className="text-xl">{specialty.icon}</span>
                <div className="flex-1 text-left">
                  <div className="text-sm font-medium text-slate-900">{specialty.name}</div>
                  <div className="text-xs text-slate-500 capitalize">{specialty.setting.replace('_', ' ')}</div>
                </div>
                {specialty.id === current.id && (
                  <svg className="w-5 h-5 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                    <path
                      fillRule="evenodd"
                      d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                )}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
