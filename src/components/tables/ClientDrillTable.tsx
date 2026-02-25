'use client';

import { useState } from 'react';
import type { ClientMtdSummary } from '@/types/dashboard';

interface ClientDrillTableProps {
  clients: ClientMtdSummary[];
}

type SortKey = 'clientName' | 'cumulativeMtdGmv' | 'gmvPacing' | 'videosPosted' | 'totalSamplesApproved' | 'adSpend' | 'roi';

function getStatusBadge(status: string): string {
  if (status === 'green') return 'bg-emerald-100 text-emerald-800';
  if (status === 'yellow') return 'bg-amber-100 text-amber-800';
  return 'bg-rose-100 text-rose-800';
}

function fmtCurrency(val: number): string {
  return `$${val.toLocaleString('en-US', { maximumFractionDigits: 0 })}`;
}

/** Render value or "No target" indicator when target is zero */
function TargetCell({ value, format }: { value: number; format: 'currency' | 'number' }) {
  if (value === 0) {
    return <span className="text-amber-600 text-xs font-medium">No target</span>;
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
    sortKey === key ? (sortDesc ? ' \u2193' : ' \u2191') : '';

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-6 overflow-x-auto">
      <h3 className="text-lg font-semibold text-navy-900 mb-4">All Clients</h3>
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-slate-200">
            <th className="text-left py-3 px-2 font-semibold text-slate-600 cursor-pointer" onClick={() => handleSort('clientName')}>
              Client{sortIcon('clientName')}
            </th>
            <th className="text-right py-3 px-2 font-semibold text-slate-600 cursor-pointer" onClick={() => handleSort('cumulativeMtdGmv')}>
              MTD GMV{sortIcon('cumulativeMtdGmv')}
            </th>
            <th className="text-right py-3 px-2 font-semibold text-slate-500">GMV Target</th>
            <th className="text-center py-3 px-2 font-semibold text-slate-600 cursor-pointer" onClick={() => handleSort('gmvPacing')}>
              Pacing{sortIcon('gmvPacing')}
            </th>
            <th className="text-right py-3 px-2 font-semibold text-slate-600 cursor-pointer" onClick={() => handleSort('videosPosted')}>
              Videos{sortIcon('videosPosted')}
            </th>
            <th className="text-right py-3 px-2 font-semibold text-slate-500">Vid Target</th>
            <th className="text-right py-3 px-2 font-semibold text-slate-600 cursor-pointer" onClick={() => handleSort('totalSamplesApproved')}>
              Samples{sortIcon('totalSamplesApproved')}
            </th>
            <th className="text-right py-3 px-2 font-semibold text-slate-500">Samp Target</th>
            <th className="text-right py-3 px-2 font-semibold text-slate-600 cursor-pointer" onClick={() => handleSort('adSpend')}>
              Spend{sortIcon('adSpend')}
            </th>
            <th className="text-right py-3 px-2 font-semibold text-slate-500">Spend Target</th>
            <th className="text-right py-3 px-2 font-semibold text-slate-600 cursor-pointer" onClick={() => handleSort('roi')}>
              ROI{sortIcon('roi')}
            </th>
            <th className="text-right py-3 px-2 font-semibold text-slate-500 text-xs">Content/Sample</th>
            <th className="text-right py-3 px-2 font-semibold text-slate-500 text-xs">GMV/Video</th>
          </tr>
        </thead>
        <tbody>
          {sorted.map((c) => {
            const hasMissing = c.gmvTargetMonth === 0 || c.monthlyVideoTarget === 0 ||
              c.targetSamplesGoals === 0 || c.spendTarget === 0;

            return (
              <tr
                key={c.clientSlug}
                className={`border-b hover:bg-slate-50 ${
                  hasMissing ? 'border-dashed border-amber-300 bg-amber-50/30' : 'border-slate-100'
                }`}
              >
                <td className="py-3 px-2 font-medium">
                  {c.clientName}
                  {hasMissing && <span className="ml-1 text-xs text-amber-600">⚠</span>}
                </td>
                <td className="py-3 px-2 text-right">{fmtCurrency(c.cumulativeMtdGmv)}</td>
                <td className="py-3 px-2 text-right text-slate-500">
                  <TargetCell value={c.gmvTargetMonth} format="currency" />
                </td>
                <td className="py-3 px-2 text-center">
                  {c.gmvTargetMonth > 0 ? (
                    <span className={`inline-block px-2 py-1 rounded text-xs font-bold ${getStatusBadge(c.gmvStatus)}`}>
                      {(c.gmvPacing * 100).toFixed(0)}%
                    </span>
                  ) : (
                    <span className="inline-block px-2 py-1 rounded text-xs font-medium bg-slate-100 text-slate-500">—</span>
                  )}
                </td>
                <td className="py-3 px-2 text-right">{c.videosPosted.toLocaleString('en-US')}</td>
                <td className="py-3 px-2 text-right text-slate-500">
                  <TargetCell value={c.monthlyVideoTarget} format="number" />
                </td>
                <td className="py-3 px-2 text-right">{c.totalSamplesApproved.toLocaleString('en-US')}</td>
                <td className="py-3 px-2 text-right text-slate-500">
                  <TargetCell value={c.targetSamplesGoals} format="number" />
                </td>
                <td className="py-3 px-2 text-right">{fmtCurrency(c.adSpend)}</td>
                <td className="py-3 px-2 text-right text-slate-500">
                  <TargetCell value={c.spendTarget} format="currency" />
                </td>
                <td className="py-3 px-2 text-right">{c.roi.toFixed(2)}</td>
                <td className="py-3 px-2 text-right text-slate-500">
                  {c.totalSamplesApproved > 0
                    ? (c.videosPosted / c.totalSamplesApproved).toFixed(2)
                    : 'N/A'}
                </td>
                <td className="py-3 px-2 text-right text-slate-500">
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
