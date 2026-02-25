'use client';

import { useParams } from 'next/navigation';
import TokenGate from '@/components/layout/TokenGate';
import DashboardShell from '@/components/layout/DashboardShell';
import ScoreCardGrid from '@/components/cards/ScoreCardGrid';
import WeeklyBarChart from '@/components/charts/WeeklyBarChart';
import WeeklyTable from '@/components/tables/WeeklyTable';
import MonthlyTrendChart from '@/components/charts/MonthlyTrendChart';
import SkuBreakdownChart from '@/components/charts/SkuBreakdownChart';
import type { ClientApiResponse } from '@/types/dashboard';

export default function ClientDashboardPage() {
  const { slug } = useParams<{ slug: string }>();

  return (
    <TokenGate apiPath={`/api/client/${slug}`}>
      {(data: ClientApiResponse) => (
        <DashboardShell
          title={`${data.clientName} Dashboard`}
          subtitle="TikTok Shop Performance"
        >
          {/* MTD Scorecard */}
          <section className="mb-8">
            <h2 className="text-xl font-bold text-navy-900 mb-4">Month-to-Date Scorecard</h2>
            <ScoreCardGrid scorecard={data.mtdScorecard} />
          </section>

          {/* Weekly Performance */}
          <section className="mb-8 space-y-6">
            <WeeklyBarChart weeklyData={data.weeklyData} />
            <WeeklyTable weeklyData={data.weeklyData} />
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
      )}
    </TokenGate>
  );
}
