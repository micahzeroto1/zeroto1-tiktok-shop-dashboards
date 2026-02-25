'use client';

interface KpiCardProps {
  label: string;
  value: number;
  target?: number;
  pacing?: number;
  status: 'green' | 'yellow' | 'red';
  format?: 'currency' | 'percent' | 'number' | 'roi';
  /** Optional warning text shown below pacing (e.g., "2 of 4 clients reporting") */
  warning?: string;
}

const statusStyles = {
  green: 'border-l-emerald-500 bg-emerald-50/50',
  yellow: 'border-l-amber-500 bg-amber-50/50',
  red: 'border-l-rose-500 bg-rose-50/50',
};

const statusDot = {
  green: 'bg-emerald-500',
  yellow: 'bg-amber-500',
  red: 'bg-rose-500',
};

function formatValue(value: number, format?: 'currency' | 'percent' | 'number' | 'roi'): string {
  if (format === 'currency') {
    if (value >= 1_000_000) return `$${(value / 1_000_000).toFixed(1)}M`;
    if (value >= 1_000) return `$${value.toLocaleString('en-US', { maximumFractionDigits: 0 })}`;
    return `$${value.toLocaleString('en-US', { maximumFractionDigits: 0 })}`;
  }
  if (format === 'percent') {
    return `${(value * 100).toFixed(1)}%`;
  }
  if (format === 'roi') {
    return value.toFixed(2);
  }
  if (value >= 1_000) return value.toLocaleString('en-US', { maximumFractionDigits: 0 });
  return value.toLocaleString('en-US', { maximumFractionDigits: 0 });
}

export default function KpiCard({ label, value, target, pacing, status, format, warning }: KpiCardProps) {
  const targetIsZero = target !== undefined && target === 0;

  return (
    <div className={`rounded-lg border-l-4 border border-slate-200 p-4 ${statusStyles[status]}`}>
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm font-medium text-slate-600">{label}</span>
        <span className={`w-2.5 h-2.5 rounded-full ${statusDot[status]}`} />
      </div>
      <div className="text-2xl font-bold text-navy-900">
        {formatValue(value, format)}
      </div>
      {target !== undefined && (
        <div className="text-sm text-slate-500 mt-1">
          {targetIsZero ? (
            <span className="text-amber-600 font-medium">No target set</span>
          ) : (
            <>Target: {formatValue(target, format)}</>
          )}
        </div>
      )}
      {pacing !== undefined && !targetIsZero && (
        <div className="text-sm font-medium mt-1" style={{
          color: status === 'green' ? '#10b981' : status === 'yellow' ? '#f59e0b' : '#ef4444'
        }}>
          {(pacing * 100).toFixed(0)}% pacing
        </div>
      )}
      {targetIsZero && pacing !== undefined && (
        <div className="text-sm text-slate-400 mt-1">— pacing</div>
      )}
      {warning && (
        <div className="text-xs text-amber-600 mt-1 flex items-center gap-1">
          <span>⚠</span> {warning}
        </div>
      )}
    </div>
  );
}
