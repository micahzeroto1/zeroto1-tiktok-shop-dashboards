'use client';

import type { ClientMtdSummary } from '@/types/dashboard';

interface DailyHeatmapProps {
  clients: ClientMtdSummary[];
}

/** Heatmap uses stricter pacing thresholds: green >= 100%, yellow 85-99%, red < 85% */
function getHeatColor(pacing: number): string {
  if (pacing >= 1.0) return 'bg-emerald-100 text-emerald-800';
  if (pacing >= 0.85) return 'bg-amber-100 text-amber-800';
  return 'bg-rose-100 text-rose-800';
}

function fmtCurrency(val: number): string {
  if (val >= 1000) return `$${(val / 1000).toFixed(1)}K`;
  return `$${val.toLocaleString('en-US', { maximumFractionDigits: 0 })}`;
}

/** Get today's and yesterday's GMV from client dailyData */
function getRecentDayGmv(client: ClientMtdSummary): { todayGmv: number; yesterdayGmv: number } {
  const daily = client.dailyData || [];
  // Filter to only rows with actual activity, then take the last two
  const activeDays = daily.filter(
    (d) => d.dailyGmv > 0 || d.videosPosted > 0 || d.totalSamplesApproved > 0
  );
  const todayGmv = activeDays.length > 0 ? activeDays[activeDays.length - 1].dailyGmv : 0;
  const yesterdayGmv = activeDays.length > 1 ? activeDays[activeDays.length - 2].dailyGmv : 0;
  return { todayGmv, yesterdayGmv };
}

export default function DailyHeatmap({ clients }: DailyHeatmapProps) {
  return (
    <div className="bg-white rounded-xl border border-slate-200 p-6 overflow-x-auto">
      <h3 className="text-lg font-semibold text-navy-900 mb-4">Daily Performance Heatmap</h3>
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-slate-200">
            <th className="text-left py-3 px-2 font-semibold text-slate-600">Client</th>
            <th className="text-right py-3 px-2 font-semibold text-slate-600">MTD GMV</th>
            <th className="text-right py-3 px-2 font-semibold text-slate-600">Target</th>
            <th className="text-center py-3 px-2 font-semibold text-slate-600">GMV Pacing</th>
            <th className="text-right py-3 px-2 font-semibold text-slate-600">Today</th>
            <th className="text-right py-3 px-2 font-semibold text-slate-600">Yesterday</th>
            <th className="text-right py-3 px-2 font-semibold text-slate-600">Videos</th>
            <th className="text-right py-3 px-2 font-semibold text-slate-600">Samples</th>
            <th className="text-right py-3 px-2 font-semibold text-slate-600">Ad Spend</th>
            <th className="text-right py-3 px-2 font-semibold text-slate-600">ROI</th>
          </tr>
        </thead>
        <tbody>
          {clients.map((client) => {
            const { todayGmv, yesterdayGmv } = getRecentDayGmv(client);
            return (
              <tr key={client.clientSlug} className="border-b border-slate-100 hover:bg-slate-50">
                <td className="py-3 px-2 font-medium">{client.clientName}</td>
                <td className="py-3 px-2 text-right">{fmtCurrency(client.cumulativeMtdGmv)}</td>
                <td className="py-3 px-2 text-right text-slate-500">{fmtCurrency(client.gmvTargetMonth)}</td>
                <td className="py-3 px-2 text-center">
                  <span className={`inline-block px-2 py-1 rounded text-xs font-bold ${getHeatColor(client.gmvPacing)}`}>
                    {(client.gmvPacing * 100).toFixed(0)}%
                  </span>
                </td>
                <td className="py-3 px-2 text-right font-medium text-emerald-700">
                  {fmtCurrency(todayGmv)}
                </td>
                <td className="py-3 px-2 text-right text-slate-600">
                  {fmtCurrency(yesterdayGmv)}
                </td>
                <td className="py-3 px-2 text-right">{client.videosPosted.toLocaleString('en-US')}</td>
                <td className="py-3 px-2 text-right">{client.totalSamplesApproved.toLocaleString('en-US')}</td>
                <td className="py-3 px-2 text-right">{fmtCurrency(client.adSpend)}</td>
                <td className="py-3 px-2 text-right">{client.roi.toFixed(2)}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
