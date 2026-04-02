'use client';

import { useState } from 'react';
import { useParams } from 'next/navigation';
import TokenGate from '@/components/layout/TokenGate';
import DashboardShell from '@/components/layout/DashboardShell';
import ScoreCardGrid from '@/components/cards/ScoreCardGrid';
import MonthFilter from '@/components/filters/MonthFilter';
import WeeklyBarChart from '@/components/charts/WeeklyBarChart';
import WeeklyMetricsCharts from '@/components/charts/WeeklyMetricsCharts';
import WeeklyTable from '@/components/tables/WeeklyTable';
import MonthlyBarChart from '@/components/charts/MonthlyBarChart';
import MonthlyTrendChart from '@/components/charts/MonthlyTrendChart';
import SkuBreakdownChart from '@/components/charts/SkuBreakdownChart';
import CreatorPipeline from '@/components/charts/CreatorPipeline';
import { filterWeeklyByMonth, getCurrentMonthKey } from '@/lib/week-labels';
import type { ClientApiResponse } from '@/types/dashboard';

function ClientDashboardContent({ data }: { data: ClientApiResponse }) {
  const [monthKey, setMonthKey] = useState(getCurrentMonthKey);
  const filteredWeekly = filterWeeklyByMonth(data.weeklyData, monthKey);

  return (
    <DashboardShell
      title={`${data.clientName} Dashboard`}
      subtitle="TikTok Shop Performance"
      lastUpdated={data.lastUpdated}
    >
      {/* MTD Scorecard — always current month */}
      <section className="mb-8">
        <h2 className="text-xl font-bold text-white mb-4">Month-to-Date Scorecard</h2>
        <ScoreCardGrid scorecard={data.mtdScorecard} />
      </section>

      {/* Month Filter */}
      <section className="mb-6">
        <MonthFilter weeklyData={data.weeklyData} value={monthKey} onChange={setMonthKey} />
      </section>

      {/* Weekly Performance */}
      <section className="mb-8 space-y-6">
        <WeeklyBarChart weeklyData={filteredWeekly} />
        <WeeklyMetricsCharts weeklyData={filteredWeekly} />
        <WeeklyTable weeklyData={filteredWeekly} />
      </section>

      {/* Creator Pipeline */}
      <section className="mb-8">
        <CreatorPipeline scorecard={data.mtdScorecard} />
      </section>

      {/* Monthly Performance */}
      <section className="mb-8 space-y-6">
        <MonthlyBarChart monthlyData={data.monthlyData} />
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
