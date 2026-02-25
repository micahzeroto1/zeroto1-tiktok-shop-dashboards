'use client';

import type { ClientMtdSummary } from '@/types/dashboard';

interface DailyHeatmapProps {
  clients: ClientMtdSummary[];
}

function getHeatColor(pacing: number): string {
  if (pacing >= 0.95) return 'bg-emerald-100 text-emerald-800';
  if (pacing >= 0.80) return 'bg-amber-100 text-amber-800';
  return 'bg-rose-100 text-rose-800';
}

function fmt(val: number, type: 'currency' | 'number'): string {
  if (type === 'currency') {
    if (val >= 1000) return `$${(val / 1000).toFixed(1)}K`;
    return `$${val.toFixed(0)}`;
  }
  return val.toFixed(0);
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
            <th className="text-right py-3 px-2 font-semibold text-slate-600">Videos</th>
            <th className="text-right py-3 px-2 font-semibold text-slate-600">Samples</th>
            <th className="text-right py-3 px-2 font-semibold text-slate-600">Ad Spend</th>
            <th className="text-right py-3 px-2 font-semibold text-slate-600">ROI</th>
          </tr>
        </thead>
        <tbody>
          {clients.map((client) => {
            return (
              <tr key={client.clientSlug} className="border-b border-slate-100 hover:bg-slate-50">
                <td className="py-3 px-2 font-medium">{client.clientName}</td>
                <td className="py-3 px-2 text-right">{fmt(client.cumulativeMtdGmv, 'currency')}</td>
                <td className="py-3 px-2 text-right text-slate-500">{fmt(client.gmvTargetMonth, 'currency')}</td>
                <td className="py-3 px-2 text-center">
                  <span className={`inline-block px-2 py-1 rounded text-xs font-bold ${getHeatColor(client.gmvPacing)}`}>
                    {(client.gmvPacing * 100).toFixed(0)}%
                  </span>
                </td>
                <td className="py-3 px-2 text-right">{client.videosPosted}</td>
                <td className="py-3 px-2 text-right">{client.totalSamplesApproved}</td>
                <td className="py-3 px-2 text-right">{fmt(client.adSpend, 'currency')}</td>
                <td className="py-3 px-2 text-right">{client.roi.toFixed(1)}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
