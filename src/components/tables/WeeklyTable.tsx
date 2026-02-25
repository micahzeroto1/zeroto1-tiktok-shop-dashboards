'use client';

import type { WeeklyRollup } from '@/types/dashboard';

interface WeeklyTableProps {
  weeklyData: WeeklyRollup[];
}

function fmt(val: number, type: 'currency' | 'number' | 'percent'): string {
  if (type === 'currency') return `$${val.toLocaleString('en-US', { maximumFractionDigits: 0 })}`;
  if (type === 'percent') return `${(val * 100).toFixed(1)}%`;
  return val.toLocaleString('en-US', { maximumFractionDigits: 0 });
}

export default function WeeklyTable({ weeklyData }: WeeklyTableProps) {
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
            <th className="text-right py-3 px-2 font-semibold text-slate-600">ROI</th>
          </tr>
        </thead>
        <tbody>
          {weeklyData.map((week, i) => (
            <tr key={i} className="border-b border-slate-100 hover:bg-slate-50">
              <td className="py-3 px-2 font-medium">{week.weekLabel || week.date}</td>
              <td className="py-3 px-2 text-right">{fmt(week.dailyGmv, 'currency')}</td>
              <td className="py-3 px-2 text-right text-slate-500">{fmt(week.gmvTarget, 'currency')}</td>
              <td className="py-3 px-2 text-right">{fmt(week.videosPosted, 'number')}</td>
              <td className="py-3 px-2 text-right">{fmt(week.totalSamplesApproved, 'number')}</td>
              <td className="py-3 px-2 text-right">{fmt(week.roi, 'number')}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
