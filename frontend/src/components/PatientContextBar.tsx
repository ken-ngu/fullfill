import type { PatientContext, InsuranceType, PlanType } from "../types";
import { Tooltip } from "./Tooltip";

interface Props {
  ctx: PatientContext;
  onChange: (ctx: PatientContext) => void;
}

const INSURANCE_OPTIONS: { value: InsuranceType; label: string }[] = [
  { value: "commercial", label: "Commercial" },
  { value: "medicare",   label: "Medicare"   },
  { value: "medicaid",   label: "Medicaid"   },
  { value: "cash",       label: "Cash pay"   },
];

const PLAN_TYPE_OPTIONS: { value: PlanType; label: string }[] = [
  { value: "PPO", label: "PPO" },
  { value: "HMO", label: "HMO" },
  { value: "HSA", label: "HSA" },
];

const US_STATES = [
  { value: "AL", label: "Alabama" },
  { value: "AK", label: "Alaska" },
  { value: "AZ", label: "Arizona" },
  { value: "AR", label: "Arkansas" },
  { value: "CA", label: "California" },
  { value: "CO", label: "Colorado" },
  { value: "CT", label: "Connecticut" },
  { value: "DE", label: "Delaware" },
  { value: "FL", label: "Florida" },
  { value: "GA", label: "Georgia" },
  { value: "HI", label: "Hawaii" },
  { value: "ID", label: "Idaho" },
  { value: "IL", label: "Illinois" },
  { value: "IN", label: "Indiana" },
  { value: "IA", label: "Iowa" },
  { value: "KS", label: "Kansas" },
  { value: "KY", label: "Kentucky" },
  { value: "LA", label: "Louisiana" },
  { value: "ME", label: "Maine" },
  { value: "MD", label: "Maryland" },
  { value: "MA", label: "Massachusetts" },
  { value: "MI", label: "Michigan" },
  { value: "MN", label: "Minnesota" },
  { value: "MS", label: "Mississippi" },
  { value: "MO", label: "Missouri" },
  { value: "MT", label: "Montana" },
  { value: "NE", label: "Nebraska" },
  { value: "NV", label: "Nevada" },
  { value: "NH", label: "New Hampshire" },
  { value: "NJ", label: "New Jersey" },
  { value: "NM", label: "New Mexico" },
  { value: "NY", label: "New York" },
  { value: "NC", label: "North Carolina" },
  { value: "ND", label: "North Dakota" },
  { value: "OH", label: "Ohio" },
  { value: "OK", label: "Oklahoma" },
  { value: "OR", label: "Oregon" },
  { value: "PA", label: "Pennsylvania" },
  { value: "RI", label: "Rhode Island" },
  { value: "SC", label: "South Carolina" },
  { value: "SD", label: "South Dakota" },
  { value: "TN", label: "Tennessee" },
  { value: "TX", label: "Texas" },
  { value: "UT", label: "Utah" },
  { value: "VT", label: "Vermont" },
  { value: "VA", label: "Virginia" },
  { value: "WA", label: "Washington" },
  { value: "WV", label: "West Virginia" },
  { value: "WI", label: "Wisconsin" },
  { value: "WY", label: "Wyoming" },
  { value: "DC", label: "Washington, D.C." },
];

// Tooltip content for pricing impact explanations
const INSURANCE_TYPE_TOOLTIP = (
  <div className="space-y-2">
    <p className="font-semibold text-sky-300">Insurance Type Impact</p>
    <p className="text-xs leading-relaxed">
      <strong>Up to $3,995 cost difference (100% variation)</strong>
    </p>
    <div className="space-y-1 text-xs">
      <p><strong>Specialty drug example ($4,000 base cost):</strong></p>
      <ul className="list-disc pl-4 space-y-0.5">
        <li>Cash: $4,000/month</li>
        <li>Commercial (deductible met): $1,092/month</li>
        <li>Medicare (deductible met): $1,000/month</li>
        <li>Medicaid: $5/month</li>
      </ul>
      <p className="text-emerald-300 font-medium mt-2">✓ System captures this automatically</p>
    </div>
  </div>
);

const PLAN_TYPE_TOOLTIP = (
  <div className="space-y-2">
    <p className="font-semibold text-sky-300">Plan Type Impact</p>
    <p className="text-xs leading-relaxed">
      <strong>Could improve accuracy by 40-50%</strong>
    </p>
    <div className="space-y-1 text-xs">
      <ul className="list-disc pl-4 space-y-0.5">
        <li><strong>HSA plans:</strong> $3,000-7,000 deductibles (pay full cost until met)</li>
        <li><strong>PPO plans:</strong> $500-2,000 deductibles (most common)</li>
        <li><strong>HMO plans:</strong> Lower copays but stricter formularies</li>
      </ul>
      <p className="text-amber-300 font-medium mt-2">⚡ High-impact input for accurate pricing</p>
    </div>
  </div>
);

const STATE_TOOLTIP = (
  <div className="space-y-2">
    <p className="font-semibold text-sky-300">Geographic State Impact</p>
    <p className="text-xs leading-relaxed">
      <strong>30-40% improvement for Medicaid patients</strong>
    </p>
    <div className="space-y-1 text-xs">
      <p>Medicaid copays vary significantly by state:</p>
      <ul className="list-disc pl-4 space-y-0.5">
        <li><strong>California:</strong> $0 copays (no cost-share)</li>
        <li><strong>New York:</strong> $0-3 copays</li>
        <li><strong>Texas:</strong> $0.50-$10 copays</li>
        <li><strong>Florida:</strong> $2-8 copays</li>
      </ul>
      <p className="text-amber-300 font-medium mt-2">⚡ High-impact input for Medicaid accuracy</p>
    </div>
  </div>
);

const DEDUCTIBLE_TOOLTIP = (
  <div className="space-y-2">
    <p className="font-semibold text-sky-300">Deductible Met Status</p>
    <p className="text-xs leading-relaxed">
      <strong>Up to $2,908 savings (73% reduction)</strong>
    </p>
    <div className="space-y-1 text-xs">
      <p><strong>Example: $4,000 specialty drug</strong></p>
      <ul className="list-disc pl-4 space-y-0.5">
        <li>Before deductible met: $4,000 (full cost)</li>
        <li>After deductible met: $1,092 (coinsurance)</li>
        <li><strong className="text-emerald-300">Savings: $2,908</strong></li>
      </ul>
      <p className="text-xs mt-2">Tier 1 generics often covered before deductible ($10-15 copay).</p>
      <p className="text-emerald-300 font-medium mt-2">✓ System captures this automatically</p>
    </div>
  </div>
);

const AGE_TOOLTIP = (
  <div className="space-y-2">
    <p className="font-semibold text-sky-300">Age Impact (Medicare at 65+)</p>
    <p className="text-xs leading-relaxed">
      <strong>Variable impact - can increase OR decrease costs</strong>
    </p>
    <div className="space-y-1 text-xs">
      <p>Auto-switches commercial → Medicare at age 65:</p>
      <ul className="list-disc pl-4 space-y-0.5">
        <li><strong>Tier 1-2 generics:</strong> Often cheaper on Medicare ($0-10 vs $25-40)</li>
        <li><strong>Tier 3+ brands:</strong> May be more expensive (25% coinsurance vs flat copay)</li>
        <li><strong>Medicare deductible:</strong> $505 in 2026 (must meet before coverage)</li>
      </ul>
      <p className="text-emerald-300 font-medium mt-2">✓ System captures this automatically</p>
    </div>
  </div>
);

const TIER_INFO_TOOLTIP = (
  <div className="space-y-2">
    <p className="font-semibold text-sky-300">Formulary Tier Impact</p>
    <p className="text-xs leading-relaxed">
      <strong>Up to $1,072 difference between tiers</strong>
    </p>
    <div className="space-y-1 text-xs">
      <p>Commercial insurance (deductible met):</p>
      <ul className="list-disc pl-4 space-y-0.5">
        <li><strong>Tier 1:</strong> $10-15 copay (preferred generics)</li>
        <li><strong>Tier 2:</strong> $25-40 copay (generics)</li>
        <li><strong>Tier 3:</strong> $50-80 copay (preferred brands)</li>
        <li><strong>Tier 4:</strong> $100-200 copay (non-preferred brands)</li>
        <li><strong>Tier 5:</strong> 20-33% coinsurance ($700-$1,485 for $4,000 drug)</li>
      </ul>
      <p className="text-emerald-300 font-medium mt-2">✓ Automatically determined by medication</p>
    </div>
  </div>
);

export function PatientContextBar({ ctx, onChange }: Props) {
  const handleInsuranceChange = (newInsuranceType: InsuranceType) => {
    // Reset conditional fields when insurance type changes
    const updates: Partial<PatientContext> = {
      insurance_type: newInsuranceType,
    };

    // Reset plan_type if switching away from commercial
    if (newInsuranceType !== "commercial") {
      updates.plan_type = null;
    } else if (ctx.plan_type === null) {
      updates.plan_type = "PPO"; // Default to PPO for commercial
    }

    // Reset state if switching away from medicaid
    if (newInsuranceType !== "medicaid") {
      updates.state = null;
    }

    onChange({ ...ctx, ...updates });
  };

  return (
    <div className="bg-white border border-slate-200 rounded-2xl shadow-card px-4 py-3 flex flex-wrap gap-4 items-end">
      {/* Insurance Type */}
      <div>
        <label className="block text-xs font-medium mb-1 flex items-center gap-1.5">
          <Tooltip content={INSURANCE_TYPE_TOOLTIP} variant="label">
            <span className="text-slate-500">Insurance</span>
          </Tooltip>
        </label>
        <select
          value={ctx.insurance_type}
          onChange={(e) => handleInsuranceChange(e.target.value as InsuranceType)}
          className="text-sm border border-slate-300 rounded-xl px-3 py-2 bg-white text-slate-900 outline-none min-h-[44px]"
        >
          {INSURANCE_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>{o.label}</option>
          ))}
        </select>
        <p className="text-[10px] text-slate-500 mt-1">Up to $3,995 cost difference</p>
      </div>

      {/* Plan Type - Only for Commercial Insurance */}
      {ctx.insurance_type === "commercial" && (
        <div>
          <label className="block text-xs font-medium mb-1 flex items-center gap-1.5">
            <Tooltip content={PLAN_TYPE_TOOLTIP} variant="label">
              <span className="text-slate-500">Plan Type</span>
            </Tooltip>
          </label>
          <select
            value={ctx.plan_type || "PPO"}
            onChange={(e) => onChange({ ...ctx, plan_type: e.target.value as PlanType })}
            className="text-sm border border-slate-300 rounded-xl px-3 py-2 bg-white text-slate-900 outline-none min-h-[44px]"
          >
            {PLAN_TYPE_OPTIONS.map((o) => (
              <option key={o.value} value={o.value || ""}>{o.label}</option>
            ))}
          </select>
          <p className="text-[10px] text-slate-500 mt-1">40-50% more accurate pricing</p>
        </div>
      )}

      {/* State - Only for Medicaid */}
      {ctx.insurance_type === "medicaid" && (
        <div>
          <label className="block text-xs font-medium mb-1 flex items-center gap-1.5">
            <Tooltip content={STATE_TOOLTIP} variant="label">
              <span className="text-slate-500">State</span>
            </Tooltip>
          </label>
          <select
            value={ctx.state || ""}
            onChange={(e) => onChange({ ...ctx, state: e.target.value || null })}
            className="text-sm border border-slate-300 rounded-xl px-3 py-2 bg-white text-slate-900 outline-none min-h-[44px]"
          >
            <option value="">Select state...</option>
            {US_STATES.map((s) => (
              <option key={s.value} value={s.value}>{s.label}</option>
            ))}
          </select>
          <p className="text-[10px] text-slate-500 mt-1">Copays vary by state ($0-$10)</p>
        </div>
      )}

      {/* Patient Age */}
      <div>
        <label className="block text-xs font-medium mb-1 flex items-center gap-1.5">
          <Tooltip content={AGE_TOOLTIP} variant="label">
            <span className="text-slate-500">Patient age</span>
          </Tooltip>
        </label>
        <input
          type="number"
          min={0}
          max={120}
          placeholder="e.g. 34"
          value={ctx.age ?? ""}
          onChange={(e) => onChange({ ...ctx, age: e.target.value ? Number(e.target.value) : null })}
          className="text-sm border border-slate-300 rounded-xl px-3 py-2 bg-white text-slate-900 outline-none min-h-[44px] w-24"
        />
        <p className="text-[10px] text-slate-500 mt-1">Auto-switches at 65+</p>
      </div>

      {/* Deductible Met */}
      <div className="flex items-center gap-2 min-h-[44px]">
        <input
          type="checkbox"
          id="deductible"
          checked={ctx.deductible_met}
          onChange={(e) => onChange({ ...ctx, deductible_met: e.target.checked })}
          className="w-4 h-4 rounded accent-blue-600"
        />
        <label htmlFor="deductible" className="text-xs cursor-pointer flex items-center gap-1.5">
          <Tooltip content={DEDUCTIBLE_TOOLTIP} variant="label">
            <span className="text-slate-700">Deductible met</span>
          </Tooltip>
        </label>
      </div>
      {ctx.deductible_met && (
        <p className="text-[10px] text-emerald-600 font-medium -ml-2 min-h-[44px] flex items-center">
          Can save up to $2,900
        </p>
      )}
    </div>
  );
}
