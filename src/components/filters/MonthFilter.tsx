'use client';

import { getAvailableMonths } from '@/lib/week-labels';
import type { WeeklyRollup } from '@/types/dashboard';

interface MonthFilterProps {
  weeklyData: WeeklyRollup[];
  value: string;
  onChange: (monthKey: string) => void;
}

export default function MonthFilter({ weeklyData, value, onChange }: MonthFilterProps) {
  const months = getAvailableMonths(weeklyData);

  return (
    <div className="flex items-center gap-3">
      <label htmlFor="month-filter" className="text-sm font-medium text-gray-400">
        Month:
      </label>
      <select
        id="month-filter"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="rounded-lg border border-zt-border bg-zt-card px-3 py-2 text-sm text-white shadow-sm focus:border-zt-yellow focus:ring-1 focus:ring-zt-yellow outline-none"
      >
        {months.map((m) => (
          <option key={m.key} value={m.key}>
            {m.label}
          </option>
        ))}
        <option value="ytd">Year to Date</option>
      </select>
    </div>
  );
}
