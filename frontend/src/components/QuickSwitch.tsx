import { useState } from "react";

interface Props {
  alternativeId: string;
  alternativeName: string;
  onSwitch: (id: string) => void;
}

export function QuickSwitch({ alternativeId, alternativeName, onSwitch }: Props) {
  const [confirming, setConfirming] = useState(false);

  function handleFirstTap() {
    setConfirming(true);
    // Auto-cancel after 3s if not confirmed
    setTimeout(() => setConfirming(false), 3000);
  }

  function handleConfirm() {
    setConfirming(false);
    onSwitch(alternativeId);
  }

  if (confirming) {
    return (
      <button
        onClick={handleConfirm}
        className="min-h-[44px] px-3 py-1.5 text-xs font-medium rounded-xl bg-blue-600 text-white active:bg-blue-700 transition-colors"
      >
        Confirm switch
      </button>
    );
  }

  return (
    <button
      onClick={handleFirstTap}
      className="min-h-[44px] px-3 py-1.5 text-xs font-medium rounded-xl border border-slate-300 text-slate-700 bg-white active:bg-slate-100 transition-colors"
      aria-label={`Switch to ${alternativeName}`}
    >
      Switch →
    </button>
  );
}
