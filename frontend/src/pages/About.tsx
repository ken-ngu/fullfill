import { Navbar } from "../components/Navbar";

interface Props {
  onNavigate: (page: string) => void;
}

export function About({ onNavigate }: Props) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50">
      <Navbar variant="landing" onNavigate={onNavigate} />
      <div className="pt-28 sm:pt-24 pb-16 px-4">
        <div className="max-w-3xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold mb-4">
              About <span className="text-sky-600">FullFill</span>
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

          {/* Meet the Founder */}
          <div className="bg-white rounded-2xl shadow-card border border-slate-200 p-8 mb-8">
            <h2 className="text-2xl font-semibold text-slate-900 mb-4">Meet the Founder</h2>
            <p className="text-slate-700 leading-relaxed mb-4">
              FullFill was created by <strong>Kenny Nguyen</strong>, a developer who witnessed the
              medication cost problem through his family. With the majority of his family working in
              healthcare, Kenny heard countless stories of patients abandoning prescriptions at the
              pharmacy counter due to unexpected costs—wasting both the patient's time and the clinician's effort.
            </p>
            <p className="text-slate-700 leading-relaxed mb-4">
              The frustration was clear: patients shouldn't have to choose between their health and
              their budget, and clinicians shouldn't waste time prescribing medications their patients
              can't afford. Kenny built FullFill with a simple goal: save time for everyone by providing
              cost transparency upfront, before the prescription is even written.
            </p>
            <p className="text-slate-700 leading-relaxed mb-6">
              FullFill is a passion project aimed at making a small difference in healthcare efficiency.
              Every feature focuses on one thing: helping clinicians make informed decisions quickly, so
              patients can actually follow through on their treatment plans without surprises.
            </p>

            {/* Social Links */}
            <div className="flex items-center gap-4 pt-4 border-t border-slate-200">
              <span className="text-sm text-slate-600 font-medium">Connect:</span>
              <a
                href="https://www.linkedin.com/in/kenny-n-40a423135/"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-sm text-blue-600 hover:text-blue-700 font-medium transition-colors group"
              >
                <svg className="w-5 h-5 group-hover:scale-110 transition-transform" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/>
                </svg>
                LinkedIn
              </a>
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
