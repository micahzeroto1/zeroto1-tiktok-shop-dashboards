'use client';

import { useState } from 'react';
import type { ClientMtdSummary } from '@/types/dashboard';

interface ClientDrillTableProps {
  clients: ClientMtdSummary[];
}

type SortKey = 'clientName' | 'cumulativeMtdGmv' | 'gmvPacing' | 'videosPosted' | 'totalSamplesApproved' | 'adSpend' | 'roi';

function getStatusBadge(status: string): string {
  if (status === 'green') return 'bg-pacing-green-bg text-pacing-green-text';
  if (status === 'yellow') return 'bg-pacing-yellow-bg text-pacing-yellow-text';
  return 'bg-pacing-red-bg text-pacing-red-text';
}

function fmtCurrency(val: number): string {
  return `$${val.toLocaleString('en-US', { maximumFractionDigits: 0 })}`;
}

/** Render value or "No target" indicator when target is zero */
function TargetCell({ value, format }: { value: number; format: 'currency' | 'number' }) {
  if (value === 0) {
    return <span className="text-gray-600 text-xs font-medium italic">No target</span>;
  }
  return <>{format === 'currency' ? fmtCurrency(value) : value.toLocaleString('en-US')}</>;
}

export default function ClientDrillTable({ clients }: ClientDrillTableProps) {
  const [sortKey, setSortKey] = useState<SortKey>('gmvPacing');
  const [sortDesc, setSortDesc] = useState(true);

  const sorted = [...clients].sort((a, b) => {
    const aVal = a[sortKey];
    const bVal = b[sortKey];
    if (typeof aVal === 'string' && typeof bVal === 'string') {
      return sortDesc ? bVal.localeCompare(aVal) : aVal.localeCompare(bVal);
    }
    return sortDesc ? (bVal as number) - (aVal as number) : (aVal as number) - (bVal as number);
  });

  function handleSort(key: SortKey) {
    if (sortKey === key) {
      setSortDesc(!sortDesc);
    } else {
      setSortKey(key);
      setSortDesc(true);
    }
  }

  const sortIcon = (key: SortKey) =>
    sortKey === key ? (sortDesc ? ' ↓' : ' ↑') : '';

  return (
    <div className="bg-zt-card rounded-xl border border-zt-border p-6 overflow-x-auto">
      <h3 className="text-lg font-semibold text-white mb-4">All Clients</h3>
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-zt-border">
            <th className="text-left py-3 px-2 font-semibold text-gray-400 bg-zt-table-header cursor-pointer" onClick={() => handleSort('clientName')}>
              Client{sortIcon('clientName')}
            </th>
            <th className="text-right py-3 px-2 font-semibold text-gray-400 bg-zt-table-header cursor-pointer" onClick={() => handleSort('cumulativeMtdGmv')}>
              MTD GMV{sortIcon('cumulativeMtdGmv')}
            </th>
            <th className="text-right py-3 px-2 font-semibold text-gray-500 bg-zt-table-header">GMV Target</th>
            <th className="text-center py-3 px-2 font-semibold text-gray-400 bg-zt-table-header cursor-pointer" onClick={() => handleSort('gmvPacing')}>
              Pacing{sortIcon('gmvPacing')}
            </th>
            <th className="text-right py-3 px-2 font-semibold text-gray-400 bg-zt-table-header cursor-pointer" onClick={() => handleSort('videosPosted')}>
              Videos{sortIcon('videosPosted')}
            </th>
            <th className="text-right py-3 px-2 font-semibold text-gray-500 bg-zt-table-header">Vid Target</th>
            <th className="text-right py-3 px-2 font-semibold text-gray-400 bg-zt-table-header cursor-pointer" onClick={() => handleSort('totalSamplesApproved')}>
              Samples{sortIcon('totalSamplesApproved')}
            </th>
            <th className="text-right py-3 px-2 font-semibold text-gray-500 bg-zt-table-header">Samp Target</th>
            <th className="text-right py-3 px-2 font-semibold text-gray-400 bg-zt-table-header cursor-pointer" onClick={() => handleSort('adSpend')}>
              Spend{sortIcon('adSpend')}
            </th>
            <th className="text-right py-3 px-2 font-semibold text-gray-500 bg-zt-table-header">Spend Target</th>
            <th className="text-right py-3 px-2 font-semibold text-gray-400 bg-zt-table-header cursor-pointer" onClick={() => handleSort('roi')}>
              ROI{sortIcon('roi')}
            </th>
            <th className="text-right py-3 px-2 font-semibold text-gray-500 bg-zt-table-header text-xs">Content/Sample</th>
            <th className="text-right py-3 px-2 font-semibold text-gray-500 bg-zt-table-header text-xs">GMV/Video</th>
          </tr>
        </thead>
        <tbody>
          {sorted.map((c, idx) => {
            const hasMissing = c.gmvTargetMonth === 0 || c.monthlyVideoTarget === 0 ||
              c.targetSamplesGoals === 0 || c.spendTarget === 0;
            const rowBg = idx % 2 === 1 ? 'bg-zt-table-alt' : '';

            return (
              <tr
                key={c.clientSlug}
                className={`border-b hover:bg-zt-table-hover ${rowBg} ${
                  hasMissing ? 'border-dashed border-pacing-yellow-bg' : 'border-zt-border'
                }`}
              >
                <td className="py-3 px-2 font-medium text-white">
                  {c.clientName}
                  {hasMissing && <span className="ml-1 text-xs text-pacing-yellow-text">⚠</span>}
                </td>
                <td className="py-3 px-2 text-right text-white">{fmtCurrency(c.cumulativeMtdGmv)}</td>
                <td className="py-3 px-2 text-right text-gray-500">
                  <TargetCell value={c.gmvTargetMonth} format="currency" />
                </td>
                <td className="py-3 px-2 text-center">
                  {c.gmvTargetMonth > 0 ? (
                    <span className={`inline-block px-2 py-1 rounded text-xs font-bold ${getStatusBadge(c.gmvStatus)}`}>
                      {(c.gmvPacing * 100).toFixed(0)}%
                    </span>
                  ) : (
                    <span className="inline-block px-2 py-1 rounded text-xs font-medium bg-zt-border text-gray-600">—</span>
                  )}
                </td>
                <td className="py-3 px-2 text-right text-gray-300">{c.videosPosted.toLocaleString('en-US')}</td>
                <td className="py-3 px-2 text-right text-gray-500">
                  <TargetCell value={c.monthlyVideoTarget} format="number" />
                </td>
                <td className="py-3 px-2 text-right text-gray-300">{c.totalSamplesApproved.toLocaleString('en-US')}</td>
                <td className="py-3 px-2 text-right text-gray-500">
                  <TargetCell value={c.targetSamplesGoals} format="number" />
                </td>
                <td className="py-3 px-2 text-right text-gray-300">{fmtCurrency(c.adSpend)}</td>
                <td className="py-3 px-2 text-right text-gray-500">
                  <TargetCell value={c.spendTarget} format="currency" />
                </td>
                <td className="py-3 px-2 text-right text-gray-300">{c.roi.toFixed(2)}</td>
                <td className="py-3 px-2 text-right text-gray-500">
                  {c.totalSamplesApproved > 0
                    ? (c.videosPosted / c.totalSamplesApproved).toFixed(2)
                    : 'N/A'}
                </td>
                <td className="py-3 px-2 text-right text-gray-500">
                  {c.videosPosted > 0
                    ? fmtCurrency(c.cumulativeMtdGmv / c.videosPosted)
                    : 'N/A'}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
