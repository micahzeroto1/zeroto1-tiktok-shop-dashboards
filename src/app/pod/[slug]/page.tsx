'use client';

import { useState } from 'react';
import { useParams } from 'next/navigation';
import TokenGate from '@/components/layout/TokenGate';
import DashboardShell from '@/components/layout/DashboardShell';
import KpiCard from '@/components/cards/KpiCard';
import TimeFilter from '@/components/filters/TimeFilter';
import WeeklyBarChart from '@/components/charts/WeeklyBarChart';
import WeeklyMetricsCharts from '@/components/charts/WeeklyMetricsCharts';
import WeeklyTable from '@/components/tables/WeeklyTable';
import DailyHeatmap from '@/components/tables/DailyHeatmap';
import PacingLeaderboard from '@/components/tables/PacingLeaderboard';
import PipelineHealthChart from '@/components/charts/PipelineHealthChart';
import { getPacingStatus } from '@/config/constants';
import { filterWeeklyByPeriod, type TimePeriod } from '@/lib/week-labels';
import type { PodApiResponse } from '@/types/dashboard';

function fmtCurrency(val: number): string {
  return `$${val.toLocaleString('en-US', { maximumFractionDigits: 0 })}`;
}

function PodDashboardContent({ data }: { data: PodApiResponse }) {
  const [period, setPeriod] = useState<TimePeriod>('current_month');
  const filteredWeekly = filterWeeklyByPeriod(data.weeklyData, period);

  const totalMtdGmv = data.clients.reduce((s, c) => s + c.cumulativeMtdGmv, 0);
  const totalTarget = data.clients.reduce((s, c) => s + c.gmvTargetMonth, 0);
  const gmvPacing = totalTarget > 0 ? totalMtdGmv / totalTarget : 0;
  const totalVideos = data.clients.reduce((s, c) => s + c.videosPosted, 0);
  const totalVideoTarget = data.clients.reduce((s, c) => s + c.monthlyVideoTarget, 0);
  const videoPacing = totalVideoTarget > 0 ? totalVideos / totalVideoTarget : 0;
  const totalSamples = data.clients.reduce((s, c) => s + c.totalSamplesApproved, 0);
  const totalSamplesTarget = data.clients.reduce((s, c) => s + c.targetSamplesGoals, 0);
  const samplesPacing = totalSamplesTarget > 0 ? totalSamples / totalSamplesTarget : 0;
  const totalSpend = data.clients.reduce((s, c) => s + c.adSpend, 0);
  const totalSpendTarget = data.clients.reduce((s, c) => s + c.spendTarget, 0);
  const spendPacing = totalSpendTarget > 0 ? totalSpend / totalSpendTarget : 0;
  const roiClients = data.clients.filter((c) => c.roi > 0);
  const avgRoi = roiClients.length > 0
    ? roiClients.reduce((s, c) => s + c.roi, 0) / roiClients.length
    : 0;

  // Data health: count clients with targets set per metric
  const total = data.clients.length;
  const gmvReporting = data.clients.filter((c) => c.gmvTargetMonth > 0).length;
  const videoReporting = data.clients.filter((c) => c.monthlyVideoTarget > 0).length;
  const samplesReporting = data.clients.filter((c) => c.targetSamplesGoals > 0).length;
  const spendReporting = data.clients.filter((c) => c.spendTarget > 0).length;

  function dataWarning(reporting: number): string | undefined {
    return reporting < total ? `${reporting} of ${total} clients reporting` : undefined;
  }

  return (
    <DashboardShell
      title={`${data.podName} Dashboard`}
      subtitle="Pod Performance Overview"
      lastUpdated={data.lastUpdated}
    >
      {/* Pod Summary KPIs */}
      <section className="mb-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <KpiCard
            label="Pod MTD GMV"
            value={totalMtdGmv}
            target={totalTarget}
            pacing={gmvPacing}
            status={getPacingStatus(gmvPacing)}
            format="currency"
            warning={dataWarning(gmvReporting)}
          />
          <KpiCard
            label="Pod Videos Posted"
            value={totalVideos}
            target={totalVideoTarget}
            pacing={videoPacing}
            status={getPacingStatus(videoPacing)}
            format="number"
            warning={dataWarning(videoReporting)}
          />
          <KpiCard
            label="Pod Samples Approved"
            value={totalSamples}
            target={totalSamplesTarget}
            pacing={samplesPacing}
            status={getPacingStatus(samplesPacing)}
            format="number"
            warning={dataWarning(samplesReporting)}
          />
          <KpiCard
            label="Pod Ad Spend"
            value={totalSpend}
            target={totalSpendTarget}
            pacing={spendPacing}
            status={getPacingStatus(spendPacing)}
            format="currency"
            warning={dataWarning(spendReporting)}
          />
          <KpiCard
            label="Avg ROI"
            value={avgRoi}
            status="green"
            format="roi"
          />
          <KpiCard
            label="Active Clients"
            value={data.clients.length}
            status="green"
            format="number"
          />
        </div>
      </section>

      {/* Daily Table/Heatmap */}
      <section className="mb-8">
        <DailyHeatmap clients={data.clients} />
      </section>

      {/* Time Filter */}
      <section className="mb-6">
        <TimeFilter value={period} onChange={setPeriod} />
      </section>

      {/* Weekly Performance Charts */}
      {filteredWeekly.length > 0 && (
        <section className="mb-8 space-y-6">
          <WeeklyBarChart weeklyData={filteredWeekly} />
          <WeeklyMetricsCharts weeklyData={filteredWeekly} />
          <WeeklyTable weeklyData={filteredWeekly} />
        </section>
      )}

      {/* MTD Pacing Leaderboard */}
      {data.clients.length > 0 && (
        <section className="mb-8">
          <PacingLeaderboard clients={data.clients} />
        </section>
      )}

      {/* Pipeline Health */}
      {data.clients.length > 0 && (
        <section className="mb-8">
          <PipelineHealthChart clients={data.clients} />
        </section>
      )}

      {/* Per-Client Scorecard Grid */}
      <section className="mb-8">
        <h2 className="text-xl font-bold text-navy-900 mb-4">Client Scorecards</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {data.clients.map((client) => (
            <div
              key={client.clientSlug}
              className="bg-white rounded-xl border border-slate-200 p-4"
            >
              <h4 className="font-semibold text-navy-900 mb-3">{client.clientName}</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-slate-500">MTD GMV</span>
                  <span className="font-medium">{fmtCurrency(client.cumulativeMtdGmv)} / {fmtCurrency(client.gmvTargetMonth)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Pacing</span>
                  <span className={`font-bold ${
                    client.gmvStatus === 'green' ? 'text-emerald-600' :
                    client.gmvStatus === 'yellow' ? 'text-amber-600' : 'text-rose-600'
                  }`}>
                    {(client.gmvPacing * 100).toFixed(0)}%
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Videos</span>
                  <span>{client.videosPosted.toLocaleString('en-US')} / {client.monthlyVideoTarget.toLocaleString('en-US')}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Samples</span>
                  <span>{client.totalSamplesApproved.toLocaleString('en-US')} / {client.targetSamplesGoals.toLocaleString('en-US')}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Ad Spend</span>
                  <span>{fmtCurrency(client.adSpend)} / {fmtCurrency(client.spendTarget)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">ROI</span>
                  <span>{client.roi.toFixed(2)}{client.roiTarget > 0 ? ` / ${client.roiTarget.toFixed(2)}` : ''}</span>
                </div>
                <div className="border-t border-slate-100 pt-2 mt-2">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Invites Sent</span>
                    <span>{client.targetInvitesSent.toLocaleString('en-US')}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Spark Codes</span>
                    <span>{client.sparkCodesAcquired.toLocaleString('en-US')}</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>
    </DashboardShell>
  );
}

export default function PodDashboardPage() {
  const { slug } = useParams<{ slug: string }>();

  return (
    <TokenGate apiPath={`/api/pod/${slug}`}>
      {(data: PodApiResponse) => <PodDashboardContent data={data} />}
    </TokenGate>
  );
}
