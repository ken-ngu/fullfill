import { Navbar } from "../components/Navbar";

interface Props {
  onNavigate: (page: string) => void;
}

export function DataSources({ onNavigate }: Props) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50">
      <Navbar variant="landing" onNavigate={onNavigate} />
      <div className="pt-28 sm:pt-24 pb-16 px-4">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold mb-4">
              Our Data & <span className="text-sky-600">Methodology</span>
            </h1>
            <p className="text-lg text-slate-600">
              Transparency in prescription cost estimates and clinical decision support
            </p>
          </div>

          {/* Overview */}
          <div className="bg-white rounded-2xl shadow-card border border-slate-200 p-8 mb-8">
            <h2 className="text-2xl font-semibold text-slate-900 mb-4">Our Commitment to Transparency</h2>
            <p className="text-slate-700 leading-relaxed mb-4">
              FullFill aggregates data from authoritative public sources to provide clinicians with
              accurate, real-time cost and formulary information. We believe transparency isn't just
              about showing prices—it's about explaining where those numbers come from and how we
              ensure their accuracy.
            </p>
            <p className="text-slate-700 leading-relaxed">
              Our methodology is designed to be understandable for both clinicians and patients,
              combining government databases, academic research, and public formulary data to create
              predictable cost estimates.
            </p>
          </div>

          {/* Data Sources Section */}
          <div className="bg-white rounded-2xl shadow-card border border-slate-200 p-8 mb-8">
            <h2 className="text-2xl font-semibold text-slate-900 mb-6">Primary Data Sources</h2>

            <div className="space-y-6">
              {/* Government Sources */}
              <div>
                <h3 className="text-lg font-semibold text-slate-900 mb-3 flex items-center gap-2">
                  <span className="text-sky-600">🏛️</span>
                  Government Databases
                </h3>
                <div className="space-y-3 ml-8">
                  <div className="border-l-4 border-sky-200 pl-4">
                    <a
                      href="https://data.medicaid.gov/Drug-Pricing-and-Payment/NADAC-National-Average-Drug-Acquisition-Cost-/a4y5-998d"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="font-medium text-sky-600 hover:text-sky-700"
                    >
                      NADAC (National Average Drug Acquisition Cost)
                    </a>
                    <p className="text-sm text-slate-600 mt-1">
                      Weekly updated pharmacy acquisition costs from CMS. Represents the baseline cost
                      of medications before insurance or markup. Updated every Wednesday.
                    </p>
                  </div>

                  <div className="border-l-4 border-sky-200 pl-4">
                    <a
                      href="https://www.medicare.gov/plan-compare"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="font-medium text-sky-600 hover:text-sky-700"
                    >
                      CMS Medicare Part D Plan Finder
                    </a>
                    <p className="text-sm text-slate-600 mt-1">
                      Official Medicare formulary and coverage data. Shows tier placement, prior
                      authorization requirements, and quantity limits. Updated annually during open enrollment.
                    </p>
                  </div>

                  <div className="border-l-4 border-sky-200 pl-4">
                    <a
                      href="https://medicaid.gov/medicaid/prescription-drugs/"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="font-medium text-sky-600 hover:text-sky-700"
                    >
                      State Medicaid Preferred Drug Lists (PDLs)
                    </a>
                    <p className="text-sm text-slate-600 mt-1">
                      State-specific formulary information showing covered medications, prior authorization
                      requirements, and quantity limits. Updated quarterly by each state.
                    </p>
                  </div>

                  <div className="border-l-4 border-sky-200 pl-4">
                    <a
                      href="https://www.fda.gov/drugs/drug-approvals-and-databases/orange-book-data-files"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="font-medium text-sky-600 hover:text-sky-700"
                    >
                      FDA Orange Book
                    </a>
                    <p className="text-sm text-slate-600 mt-1">
                      Therapeutic equivalence ratings and generic alternatives. Used to identify
                      AB-rated generics and cost-saving substitutions.
                    </p>
                  </div>

                  <div className="border-l-4 border-sky-200 pl-4">
                    <a
                      href="https://www.cms.gov/Research-Statistics-Data-and-Systems/Statistics-Trends-and-Reports/Information-on-Prescription-Drugs"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="font-medium text-sky-600 hover:text-sky-700"
                    >
                      CMS Drug Spending Dashboard
                    </a>
                    <p className="text-sm text-slate-600 mt-1">
                      Annual Medicare Part D spending and utilization trends. Provides historical
                      pricing patterns and geographic variations.
                    </p>
                  </div>
                </div>
              </div>

              {/* Pricing Tools */}
              <div>
                <h3 className="text-lg font-semibold text-slate-900 mb-3 flex items-center gap-2">
                  <span className="text-sky-600">💰</span>
                  Public Pricing Data
                </h3>
                <div className="space-y-3 ml-8">
                  <div className="border-l-4 border-green-200 pl-4">
                    <a
                      href="https://www.goodrx.com"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="font-medium text-green-600 hover:text-green-700"
                    >
                      GoodRx
                    </a>
                    <p className="text-sm text-slate-600 mt-1">
                      Real-time cash pay prices from 70,000+ pharmacies nationwide. Provides baseline
                      cost benchmarks and pharmacy-specific pricing variations.
                    </p>
                  </div>

                  <div className="border-l-4 border-green-200 pl-4">
                    <p className="font-medium text-slate-700">Public Formulary Publications</p>
                    <p className="text-sm text-slate-600 mt-1">
                      Published formularies from Express Scripts and major PBMs showing tier structures,
                      therapeutic alternatives, and coverage policies. Updated quarterly.
                    </p>
                  </div>
                </div>
              </div>

              {/* Clinical Research */}
              <div>
                <h3 className="text-lg font-semibold text-slate-900 mb-3 flex items-center gap-2">
                  <span className="text-sky-600">📚</span>
                  Academic & Clinical Research
                </h3>
                <div className="space-y-3 ml-8">
                  <div className="border-l-4 border-indigo-200 pl-4">
                    <a
                      href="https://www.healthaffairs.org/topic/issue/25/drug-pricing"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="font-medium text-indigo-600 hover:text-indigo-700"
                    >
                      Health Affairs Drug Pricing Research
                    </a>
                    <p className="text-sm text-slate-600 mt-1">
                      Peer-reviewed research on prescription abandonment rates, cost-sharing impacts,
                      and formulary design effects on patient adherence.
                    </p>
                  </div>

                  <div className="border-l-4 border-indigo-200 pl-4">
                    <a
                      href="https://jamanetwork.com/collections/44035/medication-costs-and-access"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="font-medium text-indigo-600 hover:text-indigo-700"
                    >
                      JAMA Network Medication Cost Studies
                    </a>
                    <p className="text-sm text-slate-600 mt-1">
                      Clinical evidence on how insurance design affects medication adherence and
                      health outcomes. Informs our fill risk scoring methodology.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Methodology Section */}
          <div className="bg-white rounded-2xl shadow-card border border-slate-200 p-8 mb-8">
            <h2 className="text-2xl font-semibold text-slate-900 mb-6">How We Calculate Estimates</h2>

            <div className="space-y-6">
              {/* Cost Ranges */}
              <div>
                <h3 className="text-lg font-semibold text-slate-900 mb-3">
                  Cost Range Methodology
                </h3>
                <p className="text-slate-700 leading-relaxed mb-3">
                  Our cost estimates represent the typical out-of-pocket range patients may experience
                  based on insurance type, formulary tier, and pharmacy location:
                </p>
                <ul className="space-y-2 ml-6">
                  <li className="text-slate-700 flex items-start gap-2">
                    <span className="text-sky-600 font-bold mt-1">•</span>
                    <span>
                      <strong>Low estimate:</strong> Best-case scenario using generic availability,
                      preferred formulary status, and competitive cash pay pricing
                    </span>
                  </li>
                  <li className="text-slate-700 flex items-start gap-2">
                    <span className="text-sky-600 font-bold mt-1">•</span>
                    <span>
                      <strong>High estimate:</strong> Brand-only pricing, specialty tier placement,
                      or pre-deductible cost-sharing
                    </span>
                  </li>
                  <li className="text-slate-700 flex items-start gap-2">
                    <span className="text-sky-600 font-bold mt-1">•</span>
                    <span>
                      <strong>Cost basis:</strong> Standardized to 30-day supply unless otherwise noted
                    </span>
                  </li>
                </ul>
              </div>

              {/* Fill Risk Score */}
              <div>
                <h3 className="text-lg font-semibold text-slate-900 mb-3">
                  Fill Risk Score Calculation
                </h3>
                <p className="text-slate-700 leading-relaxed mb-3">
                  Our specialty-aware scoring system predicts the likelihood a patient will encounter
                  barriers when filling their prescription. We use an additive point system weighted
                  by clinical context:
                </p>
                <div className="bg-slate-50 rounded-lg p-4 space-y-3">
                  <div>
                    <p className="font-medium text-slate-900">Risk Factors (weighted by specialty):</p>
                    <ul className="space-y-2 mt-2 ml-4">
                      <li className="text-slate-700 flex items-start gap-2">
                        <span className="text-amber-500 font-bold">•</span>
                        <span>
                          <strong>Prior Authorization Required:</strong> 1.5-3.0 points depending
                          on specialty urgency (highest weight in endocrinology)
                        </span>
                      </li>
                      <li className="text-slate-700 flex items-start gap-2">
                        <span className="text-amber-500 font-bold">•</span>
                        <span>
                          <strong>Brand-Only (No Generic):</strong> 0.5-2.5 points (highest weight
                          in emergency settings)
                        </span>
                      </li>
                      <li className="text-slate-700 flex items-start gap-2">
                        <span className="text-amber-500 font-bold">•</span>
                        <span>
                          <strong>High Formulary Tier:</strong> 1.0-2.0 points for specialty or tier 3+ placement
                        </span>
                      </li>
                      <li className="text-slate-700 flex items-start gap-2">
                        <span className="text-amber-500 font-bold">•</span>
                        <span>
                          <strong>Step Therapy Required:</strong> 1.0-2.5 points (requires documented
                          failure of alternatives)
                        </span>
                      </li>
                    </ul>
                  </div>
                  <div className="pt-3 border-t border-slate-200">
                    <p className="font-medium text-slate-900 mb-2">Score Interpretation:</p>
                    <div className="space-y-1">
                      <p className="text-sm text-slate-700">
                        <span className="inline-block w-24 font-medium text-green-700">LOW (&lt;1):</span>
                        Likely to fill without barriers
                      </p>
                      <p className="text-sm text-slate-700">
                        <span className="inline-block w-24 font-medium text-amber-600">MEDIUM (1-3):</span>
                        Some patients may face cost or coverage barriers
                      </p>
                      <p className="text-sm text-slate-700">
                        <span className="inline-block w-24 font-medium text-red-600">HIGH (3+):</span>
                        Most patients will encounter significant barriers
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Therapeutic Alternatives */}
              <div>
                <h3 className="text-lg font-semibold text-slate-900 mb-3">
                  Identifying Clinical Alternatives
                </h3>
                <p className="text-slate-700 leading-relaxed mb-3">
                  We identify cost-effective alternatives using a multi-step process:
                </p>
                <ol className="space-y-2 ml-6 list-decimal">
                  <li className="text-slate-700">
                    <strong>Therapeutic Class Matching:</strong> Group medications by clinical
                    equivalence (e.g., all topical retinoids, all GLP-1 agonists)
                  </li>
                  <li className="text-slate-700">
                    <strong>FDA Orange Book Review:</strong> Identify AB-rated generic alternatives
                    with proven bioequivalence
                  </li>
                  <li className="text-slate-700">
                    <strong>Formulary Analysis:</strong> Cross-reference with preferred drug lists
                    to find lower-tier alternatives
                  </li>
                  <li className="text-slate-700">
                    <strong>Clinical Pharmacy Review:</strong> Validate alternatives maintain
                    therapeutic appropriateness for the indication
                  </li>
                </ol>
              </div>
            </div>
          </div>

          {/* Data Freshness */}
          <div className="bg-white rounded-2xl shadow-card border border-slate-200 p-8 mb-8">
            <h2 className="text-2xl font-semibold text-slate-900 mb-4">Data Freshness & Updates</h2>
            <p className="text-slate-700 leading-relaxed mb-4">
              Prescription drug pricing and formulary information changes frequently. We maintain
              data quality through regular updates:
            </p>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="bg-gradient-to-br from-blue-50 to-sky-50 rounded-xl p-6">
                <div className="text-2xl mb-2">⚡</div>
                <h3 className="font-semibold text-slate-900 mb-2">Weekly Updates</h3>
                <p className="text-sm text-slate-600">
                  NADAC pricing data, cash pay benchmarks, and pharmacy acquisition costs
                </p>
              </div>
              <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-6">
                <div className="text-2xl mb-2">📅</div>
                <h3 className="font-semibold text-slate-900 mb-2">Quarterly Updates</h3>
                <p className="text-sm text-slate-600">
                  State Medicaid PDLs, PBM formulary publications, and coverage policy changes
                </p>
              </div>
              <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-xl p-6">
                <div className="text-2xl mb-2">🗓️</div>
                <h3 className="font-semibold text-slate-900 mb-2">Annual Updates</h3>
                <p className="text-sm text-slate-600">
                  Medicare Part D formularies, FDA Orange Book therapeutic equivalence ratings
                </p>
              </div>
              <div className="bg-gradient-to-br from-purple-50 to-indigo-50 rounded-xl p-6">
                <div className="text-2xl mb-2">🔄</div>
                <h3 className="font-semibold text-slate-900 mb-2">Ongoing Monitoring</h3>
                <p className="text-sm text-slate-600">
                  Academic research, clinical guidelines, and health policy changes
                </p>
              </div>
            </div>
          </div>

          {/* Limitations & Disclaimers */}
          <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-2xl border border-amber-200 p-8 mb-8">
            <h2 className="text-2xl font-semibold text-slate-900 mb-4 flex items-center gap-2">
              <span className="text-amber-600">⚠️</span>
              Important Limitations
            </h2>
            <p className="text-slate-700 leading-relaxed mb-4">
              While we strive for accuracy, actual patient costs can vary significantly due to
              factors we cannot predict:
            </p>
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <span className="text-amber-600 text-xl shrink-0">•</span>
                <div>
                  <strong className="text-slate-900">Plan-Specific Variation:</strong>
                  <p className="text-slate-700 text-sm mt-1">
                    Individual insurance plans have unique formularies, deductibles, and cost-sharing
                    structures. Our estimates represent typical ranges but may not match your patient's
                    specific plan.
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <span className="text-amber-600 text-xl shrink-0">•</span>
                <div>
                  <strong className="text-slate-900">Deductible Status:</strong>
                  <p className="text-slate-700 text-sm mt-1">
                    Patients who haven't met their annual deductible may pay the full negotiated
                    drug price rather than a copay. We cannot predict deductible status.
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <span className="text-amber-600 text-xl shrink-0">•</span>
                <div>
                  <strong className="text-slate-900">Geographic Variation:</strong>
                  <p className="text-slate-700 text-sm mt-1">
                    Pharmacy pricing varies by location, chain, and local market factors. Patients
                    should compare prices at their preferred pharmacy.
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <span className="text-amber-600 text-xl shrink-0">•</span>
                <div>
                  <strong className="text-slate-900">Patient Assistance Programs:</strong>
                  <p className="text-slate-700 text-sm mt-1">
                    Manufacturer copay cards, patient assistance programs, and charitable foundations
                    may significantly reduce costs for eligible patients. These are not reflected
                    in our baseline estimates.
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <span className="text-amber-600 text-xl shrink-0">•</span>
                <div>
                  <strong className="text-slate-900">Prior Authorization Outcomes:</strong>
                  <p className="text-slate-700 text-sm mt-1">
                    PA approval rates and turnaround times are estimates based on historical data.
                    Individual cases may differ based on clinical documentation and medical necessity.
                  </p>
                </div>
              </div>
            </div>
            <div className="mt-6 p-4 bg-white rounded-lg border border-amber-300">
              <p className="text-slate-900 font-medium mb-2">Always Verify at the Pharmacy</p>
              <p className="text-slate-700 text-sm">
                Encourage patients to call their pharmacy for exact pricing before filling. Pharmacists
                can check their specific insurance coverage and may suggest additional savings options
                like manufacturer coupons or generic alternatives.
              </p>
            </div>
          </div>

          {/* Research Foundation */}
          <div className="bg-white rounded-2xl shadow-card border border-slate-200 p-8 mb-8">
            <h2 className="text-2xl font-semibold text-slate-900 mb-4">Research Foundation</h2>
            <p className="text-slate-700 leading-relaxed mb-4">
              FullFill's methodology is informed by peer-reviewed research showing:
            </p>
            <div className="space-y-3">
              <div className="flex items-start gap-3 bg-slate-50 rounded-lg p-4">
                <span className="text-sky-600 text-2xl shrink-0">📊</span>
                <div>
                  <strong className="text-slate-900">25-30% Prescription Abandonment Rate</strong>
                  <p className="text-slate-700 text-sm mt-1">
                    Academic studies show that 1 in 4 prescriptions go unfilled due to cost concerns,
                    with higher rates for specialty medications and brand-only drugs.
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3 bg-slate-50 rounded-lg p-4">
                <span className="text-sky-600 text-2xl shrink-0">💊</span>
                <div>
                  <strong className="text-slate-900">Formulary Tier Drives Patient Costs</strong>
                  <p className="text-slate-700 text-sm mt-1">
                    Research demonstrates that specialty tier (tier 4+) medications cost patients
                    3-10x more than generic tier drugs, significantly impacting adherence.
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3 bg-slate-50 rounded-lg p-4">
                <span className="text-sky-600 text-2xl shrink-0">⏱️</span>
                <div>
                  <strong className="text-slate-900">Prior Authorization Delays Care</strong>
                  <p className="text-slate-700 text-sm mt-1">
                    Clinical evidence shows PA requirements delay medication starts by 2-7 days on
                    average, with 30% initial denial rates for specialty medications.
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3 bg-slate-50 rounded-lg p-4">
                <span className="text-sky-600 text-2xl shrink-0">💡</span>
                <div>
                  <strong className="text-slate-900">Price Transparency Reduces Costs</strong>
                  <p className="text-slate-700 text-sm mt-1">
                    Studies show that providing cost information at the point of prescribing reduces
                    overall medication spending by 10-15% through generic substitution and therapeutic alternatives.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Future Enhancements */}
          <div className="bg-white rounded-2xl shadow-card border border-slate-200 p-8 mb-8">
            <h2 className="text-2xl font-semibold text-slate-900 mb-4">Roadmap: Enhanced Data Integration</h2>
            <p className="text-slate-700 leading-relaxed mb-4">
              We're actively working to expand our data sources and improve prediction accuracy:
            </p>
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <span className="text-sky-600 text-lg shrink-0">🔜</span>
                <div>
                  <strong className="text-slate-900">Real-Time Benefit Check (RTBC) Integration</strong>
                  <p className="text-slate-700 text-sm mt-1">
                    Direct integration with pharmacy benefit managers to provide patient-specific
                    copay amounts and formulary status at the point of prescribing.
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <span className="text-sky-600 text-lg shrink-0">🔜</span>
                <div>
                  <strong className="text-slate-900">Patient Assistance Program Database</strong>
                  <p className="text-slate-700 text-sm mt-1">
                    Comprehensive database of manufacturer copay cards, foundation assistance, and
                    income-based discount programs with eligibility criteria.
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <span className="text-sky-600 text-lg shrink-0">🔜</span>
                <div>
                  <strong className="text-slate-900">Pharmacy-Specific Pricing</strong>
                  <p className="text-slate-700 text-sm mt-1">
                    Integration with major pharmacy chains (CVS, Walgreens, Walmart) to show
                    location-specific cash pay and insurance pricing.
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <span className="text-sky-600 text-lg shrink-0">🔜</span>
                <div>
                  <strong className="text-slate-900">Machine Learning Price Prediction</strong>
                  <p className="text-slate-700 text-sm mt-1">
                    Advanced models trained on historical claims data to improve accuracy of
                    patient-specific cost estimates based on demographic and clinical factors.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Call to Action */}
          <div className="text-center">
            <p className="text-slate-600 mb-6">
              Questions about our data sources or methodology?
            </p>
            <button
              onClick={() => onNavigate("search")}
              className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold px-8 py-4 rounded-full shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300"
            >
              <span>Try Our Search Tool</span>
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
