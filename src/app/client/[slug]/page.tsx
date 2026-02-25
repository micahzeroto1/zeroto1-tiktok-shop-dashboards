'use client';

import { useState } from 'react';
import { useParams } from 'next/navigation';
import TokenGate from '@/components/layout/TokenGate';
import DashboardShell from '@/components/layout/DashboardShell';
import ScoreCardGrid from '@/components/cards/ScoreCardGrid';
import TimeFilter from '@/components/filters/TimeFilter';
import WeeklyBarChart from '@/components/charts/WeeklyBarChart';
import WeeklyMetricsCharts from '@/components/charts/WeeklyMetricsCharts';
import WeeklyTable from '@/components/tables/WeeklyTable';
import MonthlyTrendChart from '@/components/charts/MonthlyTrendChart';
import SkuBreakdownChart from '@/components/charts/SkuBreakdownChart';
import { filterWeeklyByPeriod, type TimePeriod } from '@/lib/week-labels';
import type { ClientApiResponse } from '@/types/dashboard';

function ClientDashboardContent({ data }: { data: ClientApiResponse }) {
  const [period, setPeriod] = useState<TimePeriod>('current_month');
  const filteredWeekly = filterWeeklyByPeriod(data.weeklyData, period);

  return (
    <DashboardShell
      title={`${data.clientName} Dashboard`}
      subtitle="TikTok Shop Performance"
      lastUpdated={data.lastUpdated}
    >
      {/* MTD Scorecard — always current month */}
      <section className="mb-8">
        <h2 className="text-xl font-bold text-navy-900 mb-4">Month-to-Date Scorecard</h2>
        <ScoreCardGrid scorecard={data.mtdScorecard} />
      </section>

      {/* Time Filter */}
      <section className="mb-6">
        <TimeFilter value={period} onChange={setPeriod} />
      </section>

      {/* Weekly Performance */}
      <section className="mb-8 space-y-6">
        <WeeklyBarChart weeklyData={filteredWeekly} />
        <WeeklyMetricsCharts weeklyData={filteredWeekly} />
        <WeeklyTable weeklyData={filteredWeekly} />
      </section>

      {/* Monthly Trends */}
      <section className="mb-8">
        <MonthlyTrendChart monthlyData={data.monthlyData} />
      </section>

      {/* SKU Breakdown */}
      {data.skuBreakdown && data.skuBreakdown.length > 0 && (
        <section className="mb-8">
          <SkuBreakdownChart skuData={data.skuBreakdown} />
        </section>
      )}
    </DashboardShell>
  );
}

export default function ClientDashboardPage() {
  const { slug } = useParams<{ slug: string }>();

  return (
    <TokenGate apiPath={`/api/client/${slug}`}>
      {(data: ClientApiResponse) => <ClientDashboardContent data={data} />}
    </TokenGate>
  );
}
