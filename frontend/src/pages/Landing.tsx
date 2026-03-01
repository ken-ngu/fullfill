import { useEffect, useState } from "react";

interface Props {
  onContinue: () => void;
}

export function Landing({ onContinue }: Props) {
  const [animate, setAnimate] = useState(false);

  useEffect(() => {
    // Check if user has visited before
    const hasVisited = localStorage.getItem("fullfill_visited");
    if (hasVisited === "true") {
      // Skip landing page for returning users
      onContinue();
    } else {
      // Trigger animation
      setTimeout(() => setAnimate(true), 100);
    }
  }, [onContinue]);

  function handleContinue() {
    localStorage.setItem("fullfill_visited", "true");
    onContinue();
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 flex items-center justify-center px-4">
      <div
        className={`max-w-2xl text-center transition-all duration-1000 ${
          animate ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
        }`}
      >
        {/* Logo/Brand */}
        <div className="mb-8">
          <h1 className="text-6xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent mb-4">
            FullFill
          </h1>
          <p className="text-xl text-slate-600 font-medium">
            Transparent prescription decision support
          </p>
        </div>

        {/* Mission Statement */}
        <div className="mb-12 space-y-4">
          <p className="text-lg text-slate-700 leading-relaxed">
            Make informed prescribing decisions with real-time cost transparency,
            insurance barriers, and formulary information—all before you write the script.
          </p>
          <p className="text-base text-slate-600">
            Helping clinicians choose medications that patients can actually afford to fill.
          </p>
        </div>

        {/* Features highlight */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-12 text-left">
          <div className="bg-white/60 backdrop-blur border border-slate-200 rounded-2xl p-6">
            <div className="text-2xl mb-2">💰</div>
            <h3 className="font-semibold text-slate-900 mb-1">Real Costs</h3>
            <p className="text-sm text-slate-600">
              See actual patient out-of-pocket ranges based on public formulary data
            </p>
          </div>
          <div className="bg-white/60 backdrop-blur border border-slate-200 rounded-2xl p-6">
            <div className="text-2xl mb-2">🔒</div>
            <h3 className="font-semibold text-slate-900 mb-1">PA Alerts</h3>
            <p className="text-sm text-slate-600">
              Know which drugs require prior authorization before prescribing
            </p>
          </div>
          <div className="bg-white/60 backdrop-blur border border-slate-200 rounded-2xl p-6">
            <div className="text-2xl mb-2">🔄</div>
            <h3 className="font-semibold text-slate-900 mb-1">Alternatives</h3>
            <p className="text-sm text-slate-600">
              Discover cost-effective alternatives in the same therapeutic class
            </p>
          </div>
        </div>

        {/* Continue Button */}
        <button
          onClick={handleContinue}
          className="group inline-flex items-center justify-center gap-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold text-lg px-8 py-4 rounded-full shadow-lg hover:shadow-xl hover:scale-105 active:scale-100 transition-all duration-300"
        >
          <span>Continue</span>
          <svg
            className="w-6 h-6 group-hover:translate-x-1 transition-transform duration-300"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <circle cx="12" cy="12" r="10" strokeWidth="2" />
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M13 7l5 5m0 0l-5 5m5-5H6"
            />
          </svg>
        </button>

        {/* Disclaimer */}
        <p className="text-xs text-slate-400 mt-8 max-w-lg mx-auto">
          This tool provides estimated cost ranges based on public data.
          Estimates are not a guarantee of actual patient cost.
          Not a substitute for clinical judgment.
        </p>
      </div>
    </div>
  );
}
