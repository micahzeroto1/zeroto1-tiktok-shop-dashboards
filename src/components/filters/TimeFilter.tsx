'use client';

import type { TimePeriod } from '@/lib/week-labels';

interface TimeFilterProps {
  value: TimePeriod;
  onChange: (period: TimePeriod) => void;
}

const OPTIONS: { value: TimePeriod; label: string }[] = [
  { value: 'current_month', label: 'Current Month' },
  { value: 'last_month', label: 'Last Month' },
  { value: 'last_90_days', label: 'Last 90 Days' },
  { value: 'ytd', label: 'Year to Date' },
];

export default function TimeFilter({ value, onChange }: TimeFilterProps) {
  return (
    <div className="flex items-center gap-3">
      <label htmlFor="time-filter" className="text-sm font-medium text-slate-600">
        Show:
      </label>
      <select
        id="time-filter"
        value={value}
        onChange={(e) => onChange(e.target.value as TimePeriod)}
        className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-navy-900 shadow-sm focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none"
      >
        {OPTIONS.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
    </div>
  );
}
