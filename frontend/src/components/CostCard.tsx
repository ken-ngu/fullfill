import type { CostEstimate } from "../types";
import { ConfidencePill } from "./ConfidencePill";

interface Props {
  estimate: CostEstimate;
  confidenceScore: number;
}

const BASIS_LABELS: Record<string, string> = {
  per_30_day:  "/ month",
  per_tube:    "/ tube",
  per_vial:    "/ vial",
  per_dose:    "/ dose",
  per_unit:    "/ unit",
};

function formatUsd(amount: number): string {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(amount);
}

export function CostCard({ estimate, confidenceScore }: Props) {
  const basisLabel = BASIS_LABELS[estimate.cost_basis] ?? "";
  const hasGoodRx = estimate.goodrx_price !== undefined && estimate.goodrx_price !== null;

  return (
    <div className="bg-slate-50 border border-slate-200 shadow-card hover:shadow-card-hover rounded-2xl p-4 transition-all duration-200 hover:bg-white animate-fade-in">
      <p className="text-xs font-medium text-slate-500 mb-1">{estimate.label}</p>
      <p className="text-base font-semibold text-slate-900">
        {formatUsd(estimate.low_usd)}–{formatUsd(estimate.high_usd)}
        <span className="text-sm font-normal text-slate-500 ml-1">{basisLabel}</span>
      </p>

      {/* GoodRx cash price comparison */}
      {hasGoodRx && estimate.goodrx_price && (
        <div className="mt-3 pt-3 border-t border-slate-200">
          <p className="text-xs font-medium text-slate-500 mb-1">💰 GoodRx Cash Price</p>
          <p className="text-sm font-semibold text-green-700">
            {estimate.goodrx_price.coupon_price_usd
              ? formatUsd(estimate.goodrx_price.coupon_price_usd)
              : `${formatUsd(estimate.goodrx_price.cash_price_low_usd)}–${formatUsd(estimate.goodrx_price.cash_price_high_usd)}`}
            <span className="text-xs font-normal text-slate-500 ml-1">{basisLabel}</span>
          </p>
          <p className="text-xs text-slate-500 mt-1">
            {estimate.goodrx_price.coupon_price_usd && estimate.goodrx_price.coupon_price_usd < estimate.low_usd
              ? "May be cheaper than insurance"
              : "Compare with insurance cost"}
          </p>
        </div>
      )}

      <div className="mt-2">
        <ConfidencePill score={confidenceScore} showNote />
      </div>
    </div>
  );
}
