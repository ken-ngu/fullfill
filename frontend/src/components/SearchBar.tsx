import { useState, useEffect, useRef, useCallback } from "react";
import { createPortal } from "react-dom";
import type { MedicationSummary } from "../types";
import { searchMedications, getTopMedications } from "../api/client";

interface Props {
  onSelect: (med: MedicationSummary) => void;
  specialty?: string;
  setting?: string;
}

export function SearchBar({ onSelect, specialty, setting }: Props) {
  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState<MedicationSummary[]>([]);
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

  // Debounced search — 150ms
  useEffect(() => {
    if (query.length < 2) {
      setSuggestions([]);
      return;
    }
    setLoading(true);
    const timer = setTimeout(async () => {
      try {
        const results = await searchMedications(query, specialty, setting);
        setSuggestions(results);
      } catch {
        setSuggestions([]);
      } finally {
        setLoading(false);
      }
    }, 150);
    return () => clearTimeout(timer);
  }, [query, specialty]);

  const visibleItems = query.length >= 2 ? suggestions : topMeds;
  const showingTop = query.length < 2;
  // Dropdown is open whenever the input is focused AND there's something to show
  const open = focused && visibleItems.length > 0;

  function handleSelect(med: MedicationSummary) {
    setQuery(med.name);
    setFocused(false);
    setSuggestions([]);
    onSelect(med);
  }

  function handleClear() {
    setQuery("");
    setSuggestions([]);
    inputRef.current?.focus();
  }

  return (
    <div className="relative">
      <div className="flex items-center bg-white border border-slate-300 rounded-2xl shadow-card overflow-hidden">
        <span className="pl-4 text-slate-400 shrink-0">🔍</span>
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => { setFocused(true); updateDropdownPos(); }}
          onBlur={() => setTimeout(() => setFocused(false), 150)}
          placeholder="Search medication…"
          className="flex-1 px-3 py-3.5 text-sm text-slate-900 placeholder-slate-400 outline-none bg-transparent"
          autoComplete="off"
          autoCorrect="off"
          spellCheck={false}
        />
        {loading && <span className="pr-4 text-slate-300 text-xs">…</span>}
        {query && !loading && (
          <button
            onClick={handleClear}
            className="pr-4 text-slate-400 min-h-[44px] min-w-[44px] flex items-center justify-center"
            aria-label="Clear search"
          >
            ✕
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
          className="bg-white border border-slate-200 rounded-2xl shadow-lg overflow-hidden"
        >
          {showingTop && (
            <p className="px-4 pt-3 pb-1 text-xs font-medium text-slate-400 uppercase tracking-wide">
              Common medications
            </p>
          )}
          {visibleItems.map((med) => (
            <button
              key={med.id}
              onMouseDown={() => handleSelect(med)}
              className="w-full text-left px-4 py-3 hover:bg-slate-50 active:bg-slate-100 border-b border-slate-100 last:border-0 transition-colors min-h-[44px]"
            >
              <p className="text-sm font-medium text-slate-900">{med.name}</p>
              <p className="text-xs text-slate-500">
                {med.generic_name} · {med.dosage_form}
                {med.is_otc && " · OTC"}
                {med.requires_pa && " · PA required"}
              </p>
            </button>
          ))}
        </div>,
        document.body
      )}
    </div>
  );
}
