'use client';

import Image from 'next/image';
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
    <div className="min-h-screen bg-zt-bg">
      <header className="bg-zt-bg border-b border-zt-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Image src="/logo.svg" alt="ZeroTo1" width={120} height={20} priority />
              <div className="border-l border-zt-border pl-4">
                <h1 className="text-xl font-bold text-white">{title}</h1>
                {subtitle && (
                  <p className="text-sm text-gray-500 mt-0.5">{subtitle}</p>
                )}
              </div>
            </div>
            {lastUpdated && (
              <div className="text-right">
                <p className="text-xs text-gray-600">Last updated</p>
                <p className="text-sm text-gray-400">{formatTimestamp(lastUpdated)}</p>
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
