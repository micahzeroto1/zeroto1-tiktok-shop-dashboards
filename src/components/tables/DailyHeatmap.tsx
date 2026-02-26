'use client';

import type { ClientMtdSummary } from '@/types/dashboard';

interface DailyHeatmapProps {
  clients: ClientMtdSummary[];
}

/** Heatmap pacing colors for dark theme */
function getHeatColor(pacing: number): string {
  if (pacing >= 1.0) return 'bg-pacing-green-bg text-pacing-green-text';
  if (pacing >= 0.85) return 'bg-pacing-yellow-bg text-pacing-yellow-text';
  return 'bg-pacing-red-bg text-pacing-red-text';
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

/** Render a pacing badge */
function PacingBadge({ actual, target }: { actual: number; target: number }) {
  if (target === 0) {
    return <span className="inline-block px-2 py-1 rounded text-xs font-medium bg-zt-border text-gray-600 italic">No target</span>;
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
    <div className="bg-zt-card rounded-xl border border-zt-border p-6 overflow-x-auto">
      <h3 className="text-lg font-semibold text-white mb-4">Daily Performance Heatmap</h3>
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-zt-border">
            <th className="text-left py-3 px-2 font-semibold text-gray-400 bg-zt-table-header">Client</th>
            <th className="text-right py-3 px-2 font-semibold text-gray-400 bg-zt-table-header">MTD GMV</th>
            <th className="text-right py-3 px-2 font-semibold text-gray-400 bg-zt-table-header">Target</th>
            <th className="text-center py-3 px-2 font-semibold text-gray-400 bg-zt-table-header">GMV Pacing</th>
            <th className="text-center py-3 px-2 font-semibold text-gray-400 bg-zt-table-header">Video Pacing</th>
            <th className="text-center py-3 px-2 font-semibold text-gray-400 bg-zt-table-header">Sample Pacing</th>
            <th className="text-center py-3 px-2 font-semibold text-gray-400 bg-zt-table-header">Spend Pacing</th>
            <th className="text-right py-3 px-2 font-semibold text-gray-400 bg-zt-table-header">Yesterday</th>
            <th className="text-right py-3 px-2 font-semibold text-gray-400 bg-zt-table-header">Videos</th>
            <th className="text-right py-3 px-2 font-semibold text-gray-400 bg-zt-table-header">Samples</th>
            <th className="text-right py-3 px-2 font-semibold text-gray-400 bg-zt-table-header">Ad Spend</th>
            <th className="text-right py-3 px-2 font-semibold text-gray-400 bg-zt-table-header">ROI</th>
            <th className="text-right py-3 px-2 font-semibold text-gray-400 bg-zt-table-header text-xs">Content/Sample</th>
            <th className="text-right py-3 px-2 font-semibold text-gray-400 bg-zt-table-header text-xs">GMV/Video</th>
            <th className="text-right py-3 px-2 font-semibold text-gray-400 bg-zt-table-header text-xs">Samp Dec</th>
          </tr>
        </thead>
        <tbody>
          {clients.map((client, idx) => {
            const yesterday = getYesterdayData(client);
            const missingTargets = getMissingTargets(client);
            const hasMissing = missingTargets.length > 0;
            const rowBg = idx % 2 === 1 ? 'bg-zt-table-alt' : '';

            return (
              <tr
                key={client.clientSlug}
                className={`border-b hover:bg-zt-table-hover ${rowBg} ${
                  hasMissing ? 'border-dashed border-pacing-yellow-bg' : 'border-zt-border'
                }`}
              >
                <td className="py-3 px-2 font-medium text-white">
                  {client.clientName}
                  {hasMissing && (
                    <span className="ml-1 text-xs text-pacing-yellow-text" title={`Missing targets: ${missingTargets.join(', ')}`}>
                      ⚠
                    </span>
                  )}
                </td>
                <td className="py-3 px-2 text-right text-white">{fmtCurrency(client.cumulativeMtdGmv)}</td>
                <td className="py-3 px-2 text-right text-gray-500">
                  {client.gmvTargetMonth > 0 ? fmtCurrency(client.gmvTargetMonth) : (
                    <span className="text-pacing-yellow-text text-xs">No target</span>
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
                <td className="py-3 px-2 text-right">
                  {yesterday.hasData ? (
                    <span className="font-medium text-white">{fmtCurrency(yesterday.gmv)}</span>
                  ) : (
                    <span className="text-pacing-red-text font-semibold text-xs">No Data</span>
                  )}
                </td>
                <td className="py-3 px-2 text-right text-gray-300">{client.videosPosted.toLocaleString('en-US')}</td>
                <td className="py-3 px-2 text-right text-gray-300">{client.totalSamplesApproved.toLocaleString('en-US')}</td>
                <td className="py-3 px-2 text-right text-gray-300">{fmtCurrency(client.adSpend)}</td>
                <td className="py-3 px-2 text-right text-gray-300">{client.roi.toFixed(2)}</td>
                <td className="py-3 px-2 text-right text-gray-500">
                  {client.totalSamplesApproved > 0
                    ? (client.videosPosted / client.totalSamplesApproved).toFixed(2)
                    : 'N/A'}
                </td>
                <td className="py-3 px-2 text-right text-gray-500">
                  {client.videosPosted > 0
                    ? fmtCurrency(client.cumulativeMtdGmv / client.videosPosted)
                    : 'N/A'}
                </td>
                <td className="py-3 px-2 text-right text-gray-500">{client.samplesDecline.toLocaleString('en-US')}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
