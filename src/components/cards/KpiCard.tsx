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
  /** Optional secondary line shown below the main value (e.g., "Projected: $50,000") */
  subtitle?: string;
}

const statusStyles = {
  green: 'border-l-pacing-green-text bg-pacing-green-bg/30',
  yellow: 'border-l-pacing-yellow-text bg-pacing-yellow-bg/30',
  red: 'border-l-pacing-red-text bg-pacing-red-bg/30',
};

const statusDot = {
  green: 'bg-pacing-green-text',
  yellow: 'bg-pacing-yellow-text',
  red: 'bg-pacing-red-text',
};

const pacingTextColor = {
  green: '#22C55E',
  yellow: '#EAB308',
  red: '#EF4444',
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

export default function KpiCard({ label, value, target, pacing, status, format, warning, subtitle }: KpiCardProps) {
  const targetIsZero = target !== undefined && target === 0;

  return (
    <div className={`rounded-lg border-l-4 border border-zt-border p-4 bg-zt-card ${statusStyles[status]}`}>
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm font-medium text-gray-400">{label}</span>
        <span className={`w-2.5 h-2.5 rounded-full ${statusDot[status]}`} />
      </div>
      <div className="text-2xl font-bold text-white">
        {formatValue(value, format)}
      </div>
      {subtitle && (
        <div className="text-sm text-gray-500 mt-0.5">{subtitle}</div>
      )}
      {target !== undefined && (
        <div className="text-sm text-gray-500 mt-1">
          {targetIsZero ? (
            <span className="text-gray-600 italic">No target set</span>
          ) : (
            <>Target: {formatValue(target, format)}</>
          )}
        </div>
      )}
      {pacing !== undefined && !targetIsZero && (
        <div className="text-sm font-medium mt-1" style={{ color: pacingTextColor[status] }}>
          {(pacing * 100).toFixed(0)}% pacing
        </div>
      )}
      {targetIsZero && pacing !== undefined && (
        <div className="text-sm text-gray-600 mt-1">— pacing</div>
      )}
      {warning && (
        <div className="text-xs text-pacing-yellow-text mt-1 flex items-center gap-1">
          <span>⚠</span> {warning}
        </div>
      )}
    </div>
  );
}
