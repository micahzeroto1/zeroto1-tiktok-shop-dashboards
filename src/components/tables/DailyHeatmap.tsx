'use client';

import type { ClientMtdSummary } from '@/types/dashboard';

interface DailyHeatmapProps {
  clients: ClientMtdSummary[];
}

/** Heatmap pacing colors: green >= 100%, yellow 85-99%, red < 85% */
function getHeatColor(pacing: number): string {
  if (pacing >= 1.0) return 'bg-emerald-100 text-emerald-800';
  if (pacing >= 0.85) return 'bg-amber-100 text-amber-800';
  return 'bg-rose-100 text-rose-800';
}

function fmtCurrency(val: number): string {
  if (val >= 1000) return `$${(val / 1000).toFixed(1)}K`;
  return `$${val.toLocaleString('en-US', { maximumFractionDigits: 0 })}`;
}

/** Get yesterday's daily data from client dailyData */
function getYesterdayData(client: ClientMtdSummary): {
  gmv: number;
  hasData: boolean;
} {
  const daily = client.dailyData || [];
  const activeDays = daily.filter(
    (d) => d.dailyGmv > 0 || d.videosPosted > 0 || d.totalSamplesApproved > 0 || d.adSpend > 0
  );

  if (activeDays.length === 0) {
    return { gmv: 0, hasData: false };
  }

  const latest = activeDays[activeDays.length - 1];
  return { gmv: latest.dailyGmv, hasData: true };
}

/** Check if a client has any missing target fields */
function getMissingTargets(client: ClientMtdSummary): string[] {
  const missing: string[] = [];
  if (client.gmvTargetMonth === 0) missing.push('GMV');
  if (client.monthlyVideoTarget === 0) missing.push('Video');
  if (client.targetSamplesGoals === 0) missing.push('Samples');
  if (client.spendTarget === 0) missing.push('Spend');
  return missing;
}

/** Render a pacing badge, or "No target" if target is zero */
function PacingBadge({ actual, target }: { actual: number; target: number }) {
  if (target === 0) {
    return <span className="inline-block px-2 py-1 rounded text-xs font-medium bg-slate-100 text-slate-500">No target</span>;
  }
  const pacing = actual / target;
  return (
    <span className={`inline-block px-2 py-1 rounded text-xs font-bold ${getHeatColor(pacing)}`}>
      {(pacing * 100).toFixed(0)}%
    </span>
  );
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
            <th className="text-center py-3 px-2 font-semibold text-slate-600">Video Pacing</th>
            <th className="text-center py-3 px-2 font-semibold text-slate-600">Sample Pacing</th>
            <th className="text-center py-3 px-2 font-semibold text-slate-600">Spend Pacing</th>
            <th className="text-right py-3 px-2 font-semibold text-slate-600">Yesterday</th>
            <th className="text-right py-3 px-2 font-semibold text-slate-600">Videos</th>
            <th className="text-right py-3 px-2 font-semibold text-slate-600">Samples</th>
            <th className="text-right py-3 px-2 font-semibold text-slate-600">Ad Spend</th>
            <th className="text-right py-3 px-2 font-semibold text-slate-600">ROI</th>
            <th className="text-right py-3 px-2 font-semibold text-slate-600 text-xs">Samp Req</th>
            <th className="text-right py-3 px-2 font-semibold text-slate-600 text-xs">Samp Dec</th>
            <th className="text-right py-3 px-2 font-semibold text-slate-600 text-xs">Affiliates</th>
            <th className="text-right py-3 px-2 font-semibold text-slate-600 text-xs">Content Pend</th>
          </tr>
        </thead>
        <tbody>
          {clients.map((client) => {
            const yesterday = getYesterdayData(client);
            const missingTargets = getMissingTargets(client);
            const hasMissing = missingTargets.length > 0;

            return (
              <tr
                key={client.clientSlug}
                className={`border-b hover:bg-slate-50 ${
                  hasMissing ? 'border-dashed border-amber-300 bg-amber-50/30' : 'border-slate-100'
                }`}
              >
                <td className="py-3 px-2 font-medium">
                  {client.clientName}
                  {hasMissing && (
                    <span className="ml-1 text-xs text-amber-600" title={`Missing targets: ${missingTargets.join(', ')}`}>
                      ⚠
                    </span>
                  )}
                </td>
                <td className="py-3 px-2 text-right">{fmtCurrency(client.cumulativeMtdGmv)}</td>
                <td className="py-3 px-2 text-right text-slate-500">
                  {client.gmvTargetMonth > 0 ? fmtCurrency(client.gmvTargetMonth) : (
                    <span className="text-amber-600 text-xs">No target</span>
                  )}
                </td>
                <td className="py-3 px-2 text-center">
                  <PacingBadge actual={client.cumulativeMtdGmv} target={client.gmvTargetMonth} />
                </td>
                <td className="py-3 px-2 text-center">
                  <PacingBadge actual={client.videosPosted} target={client.monthlyVideoTarget} />
                </td>
                <td className="py-3 px-2 text-center">
                  <PacingBadge actual={client.totalSamplesApproved} target={client.targetSamplesGoals} />
                </td>
                <td className="py-3 px-2 text-center">
                  <PacingBadge actual={client.adSpend} target={client.spendTarget} />
                </td>
                <td className={`py-3 px-2 text-right ${!yesterday.hasData ? 'bg-amber-50' : ''}`}>
                  {yesterday.hasData ? (
                    <span className="font-medium text-slate-700">{fmtCurrency(yesterday.gmv)}</span>
                  ) : (
                    <span className="text-amber-600 font-semibold text-xs">No Data</span>
                  )}
                </td>
                <td className="py-3 px-2 text-right">{client.videosPosted.toLocaleString('en-US')}</td>
                <td className="py-3 px-2 text-right">{client.totalSamplesApproved.toLocaleString('en-US')}</td>
                <td className="py-3 px-2 text-right">{fmtCurrency(client.adSpend)}</td>
                <td className="py-3 px-2 text-right">{client.roi.toFixed(2)}</td>
                <td className="py-3 px-2 text-right text-slate-500">{client.dailySampleRequests.toLocaleString('en-US')}</td>
                <td className="py-3 px-2 text-right text-slate-500">{client.samplesDecline.toLocaleString('en-US')}</td>
                <td className="py-3 px-2 text-right text-slate-500">{client.affiliatesAdded.toLocaleString('en-US')}</td>
                <td className="py-3 px-2 text-right text-slate-500">{client.contentPending.toLocaleString('en-US')}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
