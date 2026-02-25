'use client';

import { buildWeekLabels } from '@/lib/week-labels';
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

export default function WeeklyTable({ weeklyData }: WeeklyTableProps) {
  if (weeklyData.length === 0) return null;

  const labels = buildWeekLabels(weeklyData);

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
            <th className="text-right py-3 px-2 font-semibold text-slate-600">Converted</th>
            <th className="text-right py-3 px-2 font-semibold text-slate-600">Samples</th>
            <th className="text-right py-3 px-2 font-semibold text-slate-600">Ad Spend</th>
            <th className="text-right py-3 px-2 font-semibold text-slate-600">ROI</th>
          </tr>
        </thead>
        <tbody>
          {weeklyData.map((week, i) => (
            <tr key={i} className="border-b border-slate-100 hover:bg-slate-50">
              <td className="py-3 px-2 font-medium">{labels[i]}</td>
              <td className="py-3 px-2 text-right">{fmtCurrency(week.dailyGmv)}</td>
              <td className="py-3 px-2 text-right text-slate-500">{fmtCurrency(week.gmvTarget)}</td>
              <td className="py-3 px-2 text-right">{fmtNumber(week.videosPosted)}</td>
              <td className="py-3 px-2 text-right text-slate-500">{fmtNumber(week.videosConverted)}</td>
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
