'use client';

import type { WeeklyRollup } from '@/types/dashboard';

interface WeeklyTableProps {
  weeklyData: WeeklyRollup[];
}

function fmtCurrency(val: number): string {
  return `$${val.toLocaleString('en-US', { maximumFractionDigits: 0 })}`;
}

function fmtNumber(val: number): string {
  return val.toLocaleString('en-US', { maximumFractionDigits: 0 });
}

/** Shorten week labels (e.g., "Week 1" → "W1") */
function shortenLabel(label: string): string {
  const weekMatch = label.match(/week\s*(\d+)/i);
  if (weekMatch) return `W${weekMatch[1]}`;
  if (label.length <= 8) return label;
  return label.substring(0, 8);
}

export default function WeeklyTable({ weeklyData }: WeeklyTableProps) {
  // Data comes from pre-aggregated weekly rollup rows
  if (weeklyData.length === 0) return null;

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-6 overflow-x-auto">
      <h3 className="text-lg font-semibold text-navy-900 mb-4">Weekly Summary</h3>
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-slate-200">
            <th className="text-left py-3 px-2 font-semibold text-slate-600">Week</th>
            <th className="text-right py-3 px-2 font-semibold text-slate-600">GMV</th>
            <th className="text-right py-3 px-2 font-semibold text-slate-600">Target</th>
            <th className="text-right py-3 px-2 font-semibold text-slate-600">Videos</th>
            <th className="text-right py-3 px-2 font-semibold text-slate-600">Samples</th>
            <th className="text-right py-3 px-2 font-semibold text-slate-600">Ad Spend</th>
            <th className="text-right py-3 px-2 font-semibold text-slate-600">ROI</th>
          </tr>
        </thead>
        <tbody>
          {weeklyData.map((week, i) => (
            <tr key={i} className="border-b border-slate-100 hover:bg-slate-50">
              <td className="py-3 px-2 font-medium">{shortenLabel(week.weekLabel || week.date)}</td>
              <td className="py-3 px-2 text-right">{fmtCurrency(week.dailyGmv)}</td>
              <td className="py-3 px-2 text-right text-slate-500">{fmtCurrency(week.gmvTarget)}</td>
              <td className="py-3 px-2 text-right">{fmtNumber(week.videosPosted)}</td>
              <td className="py-3 px-2 text-right">{fmtNumber(week.totalSamplesApproved)}</td>
              <td className="py-3 px-2 text-right">{fmtCurrency(week.adSpend)}</td>
              <td className="py-3 px-2 text-right">{week.roi.toFixed(2)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
