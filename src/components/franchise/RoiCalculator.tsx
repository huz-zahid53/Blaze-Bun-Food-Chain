"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { TrendingUp } from "lucide-react";
import { formatPKR } from "@/lib/utils";

/** Indicative franchise ROI model — illustrative only. */
export function RoiCalculator() {
  const [dailyOrders, setDailyOrders] = useState(160);
  const [avgTicket, setAvgTicket] = useState(1450);

  const monthlyRevenue = dailyOrders * avgTicket * 30;
  const foodCost = monthlyRevenue * 0.36;
  const labour = monthlyRevenue * 0.16;
  const rent = monthlyRevenue * 0.09;
  const utilities = monthlyRevenue * 0.05;
  const royalty = monthlyRevenue * 0.06;
  const marketing = monthlyRevenue * 0.03;
  const other = monthlyRevenue * 0.03;

  const totalCosts =
    foodCost + labour + rent + utilities + royalty + marketing + other;
  const ebitda = monthlyRevenue - totalCosts;
  const margin = (ebitda / monthlyRevenue) * 100;
  const yearlyEbitda = ebitda * 12;
  const breakEvenMonths = ebitda > 0 ? Math.ceil(28_000_000 / ebitda) : 0;

  const lines = [
    { label: "Food & packaging", value: foodCost, pct: 36 },
    { label: "Labour", value: labour, pct: 16 },
    { label: "Rent", value: rent, pct: 9 },
    { label: "Utilities", value: utilities, pct: 5 },
    { label: "Royalty (6%)", value: royalty, pct: 6 },
    { label: "Marketing", value: marketing, pct: 3 },
    { label: "Other", value: other, pct: 3 },
  ];

  return (
    <div className="overflow-hidden rounded-[28px] border border-charcoal/8 bg-white">
      <div className="border-b border-charcoal/8 bg-charcoal p-6 text-cream sm:p-7">
        <h3 className="t-section-sm flex items-center gap-2.5 uppercase tracking-wide">
          <TrendingUp className="h-5 w-5 text-ember" />
          Investment calculator
        </h3>
        <p className="mt-2 text-[13px] text-cream/55">
          Illustrative model based on our operating branches. Drag the sliders to
          model your own scenario.
        </p>
      </div>

      <div className="grid gap-7 p-6 sm:p-7 lg:grid-cols-2">
        {/* Inputs */}
        <div className="space-y-7">
          <Slider
            label="Orders per day"
            value={dailyOrders}
            min={60}
            max={420}
            step={10}
            onChange={setDailyOrders}
            display={`${dailyOrders}`}
          />
          <Slider
            label="Average ticket"
            value={avgTicket}
            min={700}
            max={3000}
            step={50}
            onChange={setAvgTicket}
            display={formatPKR(avgTicket)}
          />

          <div className="rounded-2xl bg-bone p-5">
            <div className="space-y-3 text-[13px]">
              {lines.map((l) => (
                <div key={l.label} className="flex items-center justify-between gap-3">
                  <span className="text-slate-brand">
                    {l.label}{" "}
                    <span className="text-[11px] text-slate-brand/60">({l.pct}%)</span>
                  </span>
                  <span className="font-bold text-charcoal">
                    {formatPKR(l.value)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Outputs */}
        <div className="space-y-4">
          <Stat
            label="Monthly revenue"
            value={formatPKR(monthlyRevenue)}
            accent="text-charcoal"
            big
          />
          <div className="grid grid-cols-2 gap-4">
            <Stat
              label="Monthly EBITDA"
              value={formatPKR(ebitda)}
              accent="text-ember"
            />
            <Stat label="Margin" value={`${margin.toFixed(1)}%`} accent="text-fresh" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Stat
              label="Year 1 EBITDA"
              value={formatPKR(yearlyEbitda)}
              accent="text-charcoal"
            />
            <Stat
              label="Est. payback"
              value={breakEvenMonths ? `${breakEvenMonths} months` : "—"}
              accent="text-charcoal"
            />
          </div>

          <div className="rounded-2xl border border-dashed border-charcoal/15 p-5">
            <p className="text-[12px] leading-[1.6] text-slate-brand">
              Based on a typical Rs 2.8 crore turnkey investment. Figures are
              indicative projections based on trading history at existing
              branches and are not a guarantee of performance. We'll walk you
              through the assumptions line by line before you sign anything.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

function Slider({
  label,
  value,
  min,
  max,
  step,
  onChange,
  display,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  onChange: (v: number) => void;
  display: string;
}) {
  const pct = ((value - min) / (max - min)) * 100;

  return (
    <div>
      <div className="mb-2.5 flex items-baseline justify-between">
        <label className="text-[11px] font-black uppercase tracking-[0.18em] text-slate-brand">
          {label}
        </label>
        <span className="font-display text-xl text-charcoal">{display}</span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        aria-label={label}
        className="h-2 w-full cursor-pointer appearance-none rounded-full outline-none [&::-webkit-slider-thumb]:h-6 [&::-webkit-slider-thumb]:w-6 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:border-4 [&::-webkit-slider-thumb]:border-white [&::-webkit-slider-thumb]:bg-ember [&::-webkit-slider-thumb]:shadow-lg"
        style={{
          background: `linear-gradient(90deg, #FF4D14 0%, #FF8A00 ${pct}%, #E7DDD0 ${pct}%, #E7DDD0 100%)`,
        }}
      />
    </div>
  );
}

function Stat({
  label,
  value,
  accent,
  big,
}: {
  label: string;
  value: string;
  accent: string;
  big?: boolean;
}) {
  return (
    <motion.div
      key={value}
      initial={{ scale: 0.97, opacity: 0.7 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ duration: 0.25 }}
      className="rounded-2xl border border-charcoal/8 bg-cream/50 p-5"
    >
      <p className="text-[10.5px] font-black uppercase tracking-[0.16em] text-slate-brand">
        {label}
      </p>
      <p
        className={`mt-1.5 font-display leading-none ${accent} ${
          big ? "text-[34px]" : "text-2xl"
        }`}
      >
        {value}
      </p>
    </motion.div>
  );
}
