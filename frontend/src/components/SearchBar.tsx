import { useState, useEffect, useRef, useCallback } from "react";
import { createPortal } from "react-dom";
import type { MedicationSummary, DiagnosisSummary } from "../types";
import { unifiedSearch, getTopMedications } from "../api/client";

interface Props {
  onSelect: (med: MedicationSummary) => void;
  onSelectDiagnosis: (diagnosis: DiagnosisSummary) => void;
  specialty?: string;
  setting?: string;
}

export function SearchBar({ onSelect, onSelectDiagnosis, specialty, setting }: Props) {
  const [query, setQuery] = useState("");
  const [medicationResults, setMedicationResults] = useState<MedicationSummary[]>([]);
  const [diagnosisResults, setDiagnosisResults] = useState<DiagnosisSummary[]>([]);
  const [topMeds, setTopMeds] = useState<MedicationSummary[]>([]);
  const [loading, setLoading] = useState(false);
  const [focused, setFocused] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const [dropdownPos, setDropdownPos] = useState({ top: 0, left: 0, width: 0 });

  const updateDropdownPos = useCallback(() => {
    if (!inputRef.current) return;
    const rect = inputRef.current.getBoundingClientRect();
    setDropdownPos({
      top: rect.bottom + window.scrollY + 4,
      left: rect.left + window.scrollX,
      width: rect.width,
    });
  }, []);

  // Fetch top meds on mount and when specialty/setting changes
  useEffect(() => {
    getTopMedications(specialty, setting).then(setTopMeds).catch(() => {});
  }, [specialty, setting]);

  // Debounced unified search (medications + diagnoses) — 100ms for snappier response
  useEffect(() => {
    if (query.length < 1) {
      setMedicationResults([]);
      setDiagnosisResults([]);
      return;
    }
    setLoading(true);
    const timer = setTimeout(async () => {
      try {
        const results = await unifiedSearch(query, specialty);
        setMedicationResults(results.medications);
        setDiagnosisResults(results.diagnoses);
      } catch {
        setMedicationResults([]);
        setDiagnosisResults([]);
      } finally {
        setLoading(false);
      }
    }, 100);
    return () => clearTimeout(timer);
  }, [query, specialty]);

  const showingSearch = query.length >= 1;
  const showingTop = query.length < 1;
  const hasResults = showingSearch
    ? medicationResults.length > 0 || diagnosisResults.length > 0
    : topMeds.length > 0;
  // Dropdown is open whenever the input is focused AND there's something to show
  const open = focused && hasResults;

  function handleSelectMedication(med: MedicationSummary) {
    setQuery(med.name);
    setFocused(false);
    setMedicationResults([]);
    setDiagnosisResults([]);
    onSelect(med);
  }

  function handleSelectDiagnosis(diagnosis: DiagnosisSummary) {
    setQuery(diagnosis.name);
    setFocused(false);
    setMedicationResults([]);
    setDiagnosisResults([]);
    onSelectDiagnosis(diagnosis);
  }

  function handleClear() {
    setQuery("");
    setMedicationResults([]);
    setDiagnosisResults([]);
    inputRef.current?.focus();
  }

  return (
    <div className="relative">
      <div className="flex items-center bg-white/80 backdrop-blur-xl border border-slate-200/60 rounded-xl shadow-sm hover:shadow-md hover:border-slate-300/60 focus-within:border-blue-400/60 focus-within:shadow-md transition-all duration-200 overflow-hidden">
        <span className="pl-5 text-slate-400 shrink-0 text-lg">🔍</span>
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => { setFocused(true); updateDropdownPos(); }}
          onBlur={() => setTimeout(() => setFocused(false), 150)}
          placeholder="Search medications or conditions"
          className="flex-1 px-4 py-4 text-base text-slate-900 placeholder-slate-400 outline-none bg-transparent font-light"
          autoComplete="off"
          autoCorrect="off"
          spellCheck={false}
        />
        {loading && (
          <div className="pr-5 flex items-center">
            <svg className="animate-spin h-5 w-5 text-blue-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
          </div>
        )}
        {query && !loading && (
          <button
            onClick={handleClear}
            className="pr-5 text-slate-400 hover:text-slate-600 min-h-[44px] min-w-[44px] flex items-center justify-center transition-colors"
            aria-label="Clear search"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}
      </div>

      {open && createPortal(
        <div
          style={{
            position: "absolute",
            top: dropdownPos.top,
            left: dropdownPos.left,
            width: dropdownPos.width,
            zIndex: 9999,
          }}
          className="bg-white/95 backdrop-blur-xl border border-slate-200/60 rounded-xl shadow-xl overflow-hidden max-h-[500px] overflow-y-auto"
        >
          {showingTop && (
            <>
              <p className="px-5 pt-4 pb-2 text-xs font-medium text-slate-500 tracking-wide">
                Common medications
              </p>
              {topMeds.map((med) => (
                <button
                  key={med.id}
                  onMouseDown={() => handleSelectMedication(med)}
                  className="w-full text-left px-5 py-3.5 hover:bg-slate-50/80 active:bg-slate-100/80 border-b border-slate-100/50 last:border-0 transition-all min-h-[56px]"
                >
                  {med.brand_names && med.brand_names.length > 0 ? (
                    <>
                      <p className="text-sm font-medium text-slate-900">
                        {med.brand_names[0]}{" "}
                        <span className="text-slate-500 font-normal">({med.generic_name})</span>
                      </p>
                      <p className="text-xs text-slate-500 mt-0.5 font-light">
                        {med.dosage_form}
                        {med.is_otc && " · OTC"}
                        {med.requires_pa && " · PA required"}
                      </p>
                    </>
                  ) : (
                    <>
                      <p className="text-sm font-medium text-slate-900">{med.name}</p>
                      <p className="text-xs text-slate-500 mt-0.5 font-light">
                        {med.generic_name} · {med.dosage_form}
                        {med.is_otc && " · OTC"}
                        {med.requires_pa && " · PA required"}
                      </p>
                    </>
                  )}
                </button>
              ))}
            </>
          )}

          {showingSearch && (
            <>
              {/* Diagnoses section */}
              {diagnosisResults.length > 0 && (
                <>
                  <p className="px-5 pt-4 pb-2 text-xs font-medium text-slate-500 tracking-wide">
                    CONDITIONS
                  </p>
                  {diagnosisResults.map((diagnosis) => (
                    <button
                      key={diagnosis.id}
                      onMouseDown={() => handleSelectDiagnosis(diagnosis)}
                      className="w-full text-left px-5 py-3.5 hover:bg-blue-50/80 active:bg-blue-100/80 border-b border-slate-100/50 transition-all min-h-[56px]"
                    >
                      <p className="text-sm font-medium text-slate-900">{diagnosis.name}</p>
                      <p className="text-xs text-slate-500 mt-0.5 font-light">
                        ICD-10: {diagnosis.icd10_codes.join(", ")}
                      </p>
                    </button>
                  ))}
                </>
              )}

              {/* Medications section */}
              {medicationResults.length > 0 && (
                <>
                  <p className="px-5 pt-4 pb-2 text-xs font-medium text-slate-500 tracking-wide">
                    MEDICATIONS
                  </p>
                  {medicationResults.map((med) => (
                    <button
                      key={med.id}
                      onMouseDown={() => handleSelectMedication(med)}
                      className="w-full text-left px-5 py-3.5 hover:bg-slate-50/80 active:bg-slate-100/80 border-b border-slate-100/50 last:border-0 transition-all min-h-[56px]"
                    >
                      {med.brand_names && med.brand_names.length > 0 ? (
                        <>
                          <p className="text-sm font-medium text-slate-900">
                            {med.brand_names[0]}{" "}
                            <span className="text-slate-500 font-normal">({med.generic_name})</span>
                          </p>
                          <p className="text-xs text-slate-500 mt-0.5 font-light">
                            {med.dosage_form}
                            {med.is_otc && " · OTC"}
                            {med.requires_pa && " · PA required"}
                          </p>
                        </>
                      ) : (
                        <>
                          <p className="text-sm font-medium text-slate-900">{med.name}</p>
                          <p className="text-xs text-slate-500 mt-0.5 font-light">
                            {med.generic_name} · {med.dosage_form}
                            {med.is_otc && " · OTC"}
                            {med.requires_pa && " · PA required"}
                          </p>
                        </>
                      )}
                    </button>
                  ))}
                </>
              )}
            </>
          )}
        </div>,
        document.body
      )}
    </div>
  );
}
