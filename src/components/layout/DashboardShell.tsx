'use client';

import { ReactNode } from 'react';

interface DashboardShellProps {
  title: string;
  subtitle?: string;
  children: ReactNode;
}

export default function DashboardShell({ title, subtitle, children }: DashboardShellProps) {
  return (
    <div className="min-h-screen bg-slate-50">
      <header className="bg-navy-900 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <h1 className="text-2xl font-bold">{title}</h1>
          {subtitle && (
            <p className="text-slate-300 mt-1">{subtitle}</p>
          )}
        </div>
      </header>
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>
    </div>
  );
}
