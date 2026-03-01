import { Navbar } from "../components/Navbar";

interface Props {
  onNavigate: (page: string) => void;
}

export function About({ onNavigate }: Props) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50">
      <Navbar variant="landing" onNavigate={onNavigate} />
      <div className="pt-24 pb-16 px-4">
        <div className="max-w-3xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-slate-900 mb-4">
              About FullFill
            </h1>
            <p className="text-lg text-slate-600">
              Empowering clinicians with transparent prescription cost information
            </p>
          </div>

          {/* Mission */}
          <div className="bg-white rounded-2xl shadow-card border border-slate-200 p-8 mb-8">
            <h2 className="text-2xl font-semibold text-slate-900 mb-4">Our Mission</h2>
            <p className="text-slate-700 leading-relaxed mb-4">
              Healthcare providers shouldn't have to guess whether their patients can afford
              the medications they prescribe. FullFill provides real-time cost transparency,
              insurance barriers, and formulary information—all before you write the script.
            </p>
            <p className="text-slate-700 leading-relaxed">
              We believe that informed prescribing decisions lead to better patient outcomes
              and fewer abandoned prescriptions at the pharmacy counter.
            </p>
          </div>

          {/* The Problem */}
          <div className="bg-white rounded-2xl shadow-card border border-slate-200 p-8 mb-8">
            <h2 className="text-2xl font-semibold text-slate-900 mb-4">The Problem</h2>
            <div className="space-y-4 text-slate-700">
              <div className="flex items-start gap-3">
                <span className="text-red-500 text-xl shrink-0">•</span>
                <p className="leading-relaxed">
                  <strong>30% of prescriptions</strong> are never filled due to cost barriers
                </p>
              </div>
              <div className="flex items-start gap-3">
                <span className="text-red-500 text-xl shrink-0">•</span>
                <p className="leading-relaxed">
                  Clinicians learn about cost issues <strong>after the patient leaves</strong>
                </p>
              </div>
              <div className="flex items-start gap-3">
                <span className="text-red-500 text-xl shrink-0">•</span>
                <p className="leading-relaxed">
                  Prior authorizations delay care and waste <strong>billions of hours</strong> annually
                </p>
              </div>
            </div>
          </div>

          {/* Our Solution */}
          <div className="bg-white rounded-2xl shadow-card border border-slate-200 p-8 mb-8">
            <h2 className="text-2xl font-semibold text-slate-900 mb-4">Our Solution</h2>
            <p className="text-slate-700 leading-relaxed mb-6">
              FullFill integrates transparent pricing data, formulary information, and
              clinical alternatives into a simple search interface. We help you:
            </p>
            <div className="grid md:grid-cols-3 gap-4">
              <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-6">
                <div className="text-2xl mb-2">💰</div>
                <h3 className="font-semibold text-slate-900 mb-2">See Real Costs</h3>
                <p className="text-sm text-slate-600">
                  Patient out-of-pocket ranges based on insurance type and formulary data
                </p>
              </div>
              <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-xl p-6">
                <div className="text-2xl mb-2">🔒</div>
                <h3 className="font-semibold text-slate-900 mb-2">Avoid PA Delays</h3>
                <p className="text-sm text-slate-600">
                  Know which drugs require prior authorization before prescribing
                </p>
              </div>
              <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-6">
                <div className="text-2xl mb-2">🔄</div>
                <h3 className="font-semibold text-slate-900 mb-2">Find Alternatives</h3>
                <p className="text-sm text-slate-600">
                  Discover cost-effective options in the same therapeutic class
                </p>
              </div>
            </div>
          </div>

          {/* Call to Action */}
          <div className="text-center">
            <button
              onClick={() => onNavigate("search")}
              className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold px-8 py-4 rounded-full shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300"
            >
              <span>Start Searching</span>
              <svg
                className="w-5 h-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M17 8l4 4m0 0l-4 4m4-4H3"
                />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
