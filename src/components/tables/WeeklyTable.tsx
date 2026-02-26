'use client';

import { buildWeekLabels, isCurrentWeek } from '@/lib/week-labels';
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
    <div className="bg-zt-card rounded-xl border border-zt-border p-6 overflow-x-auto">
      <h3 className="text-lg font-semibold text-white mb-4">Weekly Summary</h3>
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-zt-border">
            <th className="text-left py-3 px-2 font-semibold text-gray-400 bg-zt-table-header">Week</th>
            <th className="text-right py-3 px-2 font-semibold text-gray-400 bg-zt-table-header">GMV</th>
            <th className="text-right py-3 px-2 font-semibold text-gray-400 bg-zt-table-header">Target</th>
            <th className="text-right py-3 px-2 font-semibold text-gray-400 bg-zt-table-header">Videos</th>
            <th className="text-right py-3 px-2 font-semibold text-gray-400 bg-zt-table-header">Samples</th>
            <th className="text-right py-3 px-2 font-semibold text-gray-400 bg-zt-table-header">Ad Spend</th>
            <th className="text-right py-3 px-2 font-semibold text-gray-400 bg-zt-table-header">ROI</th>
          </tr>
        </thead>
        <tbody>
          {weeklyData.map((week, i) => {
            const isCurrent = i === weeklyData.length - 1 && isCurrentWeek(week.date);
            const rowBg = i % 2 === 1 ? 'bg-zt-table-alt' : '';

            return (
              <tr key={i} className={`border-b border-zt-border hover:bg-zt-table-hover ${rowBg}`}>
                <td className="py-3 px-2 font-medium text-white">
                  {labels[i]}
                  {isCurrent && (
                    <span className="ml-2 text-xs font-medium text-zt-yellow">(in progress)</span>
                  )}
                </td>
                <td className="py-3 px-2 text-right text-white">{fmtCurrency(week.dailyGmv)}</td>
                <td className="py-3 px-2 text-right text-gray-500">{fmtCurrency(week.gmvTarget)}</td>
                <td className="py-3 px-2 text-right text-gray-300">{fmtNumber(week.videosPosted)}</td>
                <td className="py-3 px-2 text-right text-gray-300">{fmtNumber(week.totalSamplesApproved)}</td>
                <td className="py-3 px-2 text-right text-gray-300">{fmtCurrency(week.adSpend)}</td>
                <td className="py-3 px-2 text-right text-gray-300">{week.roi.toFixed(2)}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
