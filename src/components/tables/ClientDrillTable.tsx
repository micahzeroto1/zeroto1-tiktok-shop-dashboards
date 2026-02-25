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
            <th className="text-center py-3 px-2 font-semibold text-slate-600 cursor-pointer" onClick={() => handleSort('gmvPacing')}>
              Pacing{sortIcon('gmvPacing')}
            </th>
            <th className="text-right py-3 px-2 font-semibold text-slate-600 cursor-pointer" onClick={() => handleSort('videosPosted')}>
              Videos{sortIcon('videosPosted')}
            </th>
            <th className="text-right py-3 px-2 font-semibold text-slate-600 cursor-pointer" onClick={() => handleSort('totalSamplesApproved')}>
              Samples{sortIcon('totalSamplesApproved')}
            </th>
            <th className="text-right py-3 px-2 font-semibold text-slate-600 cursor-pointer" onClick={() => handleSort('adSpend')}>
              Spend{sortIcon('adSpend')}
            </th>
            <th className="text-right py-3 px-2 font-semibold text-slate-600 cursor-pointer" onClick={() => handleSort('roi')}>
              ROI{sortIcon('roi')}
            </th>
          </tr>
        </thead>
        <tbody>
          {sorted.map((c) => (
            <tr key={c.clientSlug} className="border-b border-slate-100 hover:bg-slate-50">
              <td className="py-3 px-2 font-medium">{c.clientName}</td>
              <td className="py-3 px-2 text-right">${c.cumulativeMtdGmv.toLocaleString('en-US', { maximumFractionDigits: 0 })}</td>
              <td className="py-3 px-2 text-center">
                <span className={`inline-block px-2 py-1 rounded text-xs font-bold ${getStatusBadge(c.gmvStatus)}`}>
                  {(c.gmvPacing * 100).toFixed(0)}%
                </span>
              </td>
              <td className="py-3 px-2 text-right">{c.videosPosted}</td>
              <td className="py-3 px-2 text-right">{c.totalSamplesApproved}</td>
              <td className="py-3 px-2 text-right">${c.adSpend.toLocaleString('en-US', { maximumFractionDigits: 0 })}</td>
              <td className="py-3 px-2 text-right">{c.roi.toFixed(1)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
