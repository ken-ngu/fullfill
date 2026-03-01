import { useState } from "react";
import { useAuth } from "../hooks/useAuth";

export function Login() {
  const { login, error, loading } = useAuth();
  const [code, setCode] = useState("");
  const [pin, setPin] = useState("");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    login(code, pin);
  }

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-semibold text-slate-900">FirstFill</h1>
          <p className="text-sm text-slate-500 mt-1">Prescribing decision support</p>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl shadow-card p-6">
          <p className="text-xs text-slate-500 mb-4 p-3 bg-slate-50 rounded-xl">
            ⚠️ This tool provides estimated cost ranges based on public data.
            Estimates are not a guarantee of actual patient cost.
            Not a substitute for clinical judgment.
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Clinic code</label>
              <input
                type="text"
                value={code}
                onChange={(e) => setCode(e.target.value.toUpperCase())}
                placeholder="e.g. DEMO"
                className="w-full border border-slate-300 rounded-xl px-3 py-3 text-sm outline-none focus:border-blue-400 min-h-[44px]"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">PIN</label>
              <input
                type="password"
                value={pin}
                onChange={(e) => setPin(e.target.value)}
                placeholder="Enter PIN"
                className="w-full border border-slate-300 rounded-xl px-3 py-3 text-sm outline-none focus:border-blue-400 min-h-[44px]"
                required
              />
            </div>

            {error && (
              <p className="text-xs text-red-600 bg-red-50 p-2 rounded-xl">{error}</p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 text-white font-medium text-sm py-3 rounded-xl active:bg-blue-700 disabled:opacity-60 transition-colors min-h-[44px]"
            >
              {loading ? "Signing in…" : "Sign in"}
            </button>
          </form>

          <p className="text-xs text-slate-400 mt-4 text-center">
            Demo: code <strong>DEMO</strong> / pin <strong>demo123</strong>
          </p>
        </div>
      </div>
    </div>
  );
}
