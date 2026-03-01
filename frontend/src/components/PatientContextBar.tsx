import type { PatientContext, InsuranceType } from "../types";

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

export function PatientContextBar({ ctx, onChange }: Props) {
  return (
    <div className="bg-white border border-slate-200 rounded-2xl shadow-card px-4 py-3 flex flex-wrap gap-4 items-end">
      <div>
        <label className="block text-xs font-medium text-slate-500 mb-1">Insurance</label>
        <select
          value={ctx.insurance_type}
          onChange={(e) => onChange({ ...ctx, insurance_type: e.target.value as InsuranceType })}
          className="text-sm border border-slate-300 rounded-xl px-3 py-2 bg-white text-slate-900 outline-none min-h-[44px]"
        >
          {INSURANCE_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>{o.label}</option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-xs font-medium text-slate-500 mb-1">Patient age</label>
        <input
          type="number"
          min={0}
          max={120}
          placeholder="e.g. 34"
          value={ctx.age ?? ""}
          onChange={(e) => onChange({ ...ctx, age: e.target.value ? Number(e.target.value) : null })}
          className="text-sm border border-slate-300 rounded-xl px-3 py-2 bg-white text-slate-900 outline-none min-h-[44px] w-24"
        />
      </div>

      <div className="flex items-center gap-2 min-h-[44px]">
        <input
          type="checkbox"
          id="deductible"
          checked={ctx.deductible_met}
          onChange={(e) => onChange({ ...ctx, deductible_met: e.target.checked })}
          className="w-4 h-4 rounded accent-blue-600"
        />
        <label htmlFor="deductible" className="text-xs text-slate-700 cursor-pointer">
          Deductible met
        </label>
      </div>
    </div>
  );
}
