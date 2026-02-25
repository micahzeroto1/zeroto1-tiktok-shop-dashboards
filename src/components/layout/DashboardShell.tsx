'use client';

import { ReactNode } from 'react';

interface DashboardShellProps {
  title: string;
  subtitle?: string;
  lastUpdated?: string;
  children: ReactNode;
}

function formatTimestamp(iso: string): string {
  try {
    const date = new Date(iso);
    return date.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });
  } catch {
    return iso;
  }
}

export default function DashboardShell({ title, subtitle, lastUpdated, children }: DashboardShellProps) {
  return (
    <div className="min-h-screen bg-slate-50">
      <header className="bg-navy-900 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold">{title}</h1>
              {subtitle && (
                <p className="text-slate-300 mt-1">{subtitle}</p>
              )}
            </div>
            {lastUpdated && (
              <div className="text-right">
                <p className="text-xs text-slate-400">Last updated</p>
                <p className="text-sm text-slate-300">{formatTimestamp(lastUpdated)}</p>
              </div>
            )}
          </div>
        </div>
      </header>
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>
    </div>
  );
}
