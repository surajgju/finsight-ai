import { useState } from 'react';
import { ArrowDownRight, ArrowUpRight, Info } from 'lucide-react';
import { Area, AreaChart, ResponsiveContainer, YAxis } from 'recharts';
import { KpiMetric } from '../../types';

interface KpiCardProps {
  metric: KpiMetric;
}

export function KpiCard({ metric }: KpiCardProps) {
  const [showTooltip, setShowTooltip] = useState(false);

  const isPositiveChange =
    (metric.deltaPercent >= 0 && metric.positiveIsGood) ||
    (metric.deltaPercent < 0 && !metric.positiveIsGood) ||
    (metric.id === 'suspicious-transactions' && metric.deltaPercent < 0) ||
    (metric.id === 'risk-score' && metric.deltaPercent < 0);

  const sparkData = metric.sparkline.map((v, idx) => ({ idx, val: v }));
  const strokeColor = isPositiveChange ? '#0284c7' : '#d97706';

  return (
    <div className="relative rounded-xl border border-slate-200 bg-white p-4 transition-colors hover:border-slate-300 dark:border-slate-800 dark:bg-slate-900 dark:hover:border-slate-700">
      <div className="flex items-start justify-between gap-2">
        <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
          {metric.label}
        </span>
        <button
          type="button"
          onMouseEnter={() => setShowTooltip(true)}
          onMouseLeave={() => setShowTooltip(false)}
          onFocus={() => setShowTooltip(true)}
          onBlur={() => setShowTooltip(false)}
          onClick={() => setShowTooltip((prev) => !prev)}
          aria-label={`Metric details for ${metric.label}`}
          className="rounded p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600 focus-visible:outline-2 focus-visible:outline-sky-600 dark:hover:bg-slate-800 dark:hover:text-slate-300"
        >
          <Info className="h-3.5 w-3.5" aria-hidden="true" />
        </button>
      </div>

      {showTooltip && (
        <div
          role="tooltip"
          className="absolute top-10 right-3 z-30 w-60 rounded-lg border border-slate-200 bg-slate-900 p-2.5 text-xs leading-relaxed text-slate-100 shadow-lg dark:border-slate-700 dark:bg-slate-800"
        >
          {metric.tooltip}
        </div>
      )}

      <div className="mt-2 flex items-end justify-between gap-2">
        <div className="min-w-0">
          <div className="font-display text-2xl font-bold tracking-tight text-slate-900 tabular-nums whitespace-nowrap dark:text-slate-50">
            {metric.formattedValue}
          </div>
          <div className="mt-1.5 flex items-center gap-1.5 text-xs whitespace-nowrap">
            <span
              className={`inline-flex items-center gap-0.5 font-medium tabular-nums ${
                isPositiveChange
                  ? 'text-emerald-700 dark:text-emerald-400'
                  : 'text-amber-700 dark:text-amber-400'
              }`}
            >
              {metric.trendDirection === 'up' ? (
                <ArrowUpRight className="h-3.5 w-3.5" aria-hidden="true" />
              ) : (
                <ArrowDownRight className="h-3.5 w-3.5" aria-hidden="true" />
              )}
              {metric.deltaPercent > 0 ? `+${metric.deltaPercent}%` : `${metric.deltaPercent}%`}
            </span>
            <span className="text-slate-400 dark:text-slate-500">vs prior</span>
          </div>
        </div>

        <div className="h-10 w-16 shrink-0" aria-hidden="true">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={sparkData} margin={{ top: 2, right: 2, left: 2, bottom: 2 }}>
              <YAxis hide domain={['dataMin', 'dataMax']} />
              <Area
                type="monotone"
                dataKey="val"
                stroke={strokeColor}
                strokeWidth={1.75}
                fill={strokeColor}
                fillOpacity={0.14}
                isAnimationActive={false}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
