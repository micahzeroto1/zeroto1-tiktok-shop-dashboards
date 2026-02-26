'use client';

import TokenGate from '@/components/layout/TokenGate';
import DashboardShell from '@/components/layout/DashboardShell';
import KpiCard from '@/components/cards/KpiCard';
import PodComparisonChart from '@/components/charts/PodComparisonChart';
import ClientDrillTable from '@/components/tables/ClientDrillTable';
import { getPacingStatus } from '@/config/constants';
import type { CeoApiResponse } from '@/types/dashboard';

function fmtCurrency(val: number): string {
  if (val >= 1_000_000) return `$${(val / 1_000_000).toFixed(1)}M`;
  return `$${val.toLocaleString('en-US', { maximumFractionDigits: 0 })}`;
}

function fmtProjected(val: number): string {
  if (val >= 1_000_000) return `Projected: $${(val / 1_000_000).toFixed(1)}M`;
  if (val >= 1_000) return `Projected: $${val.toLocaleString('en-US', { maximumFractionDigits: 0 })}`;
  return `Projected: $${val.toLocaleString('en-US', { maximumFractionDigits: 0 })}`;
}

export default function CeoDashboardPage() {
  return (
    <TokenGate apiPath="/api/ceo">
      {(data: CeoApiResponse) => {
        const monthlyTarget = data.annualTarget / 12;

        const allClients = data.allClients;
        const total = allClients.length;
        const gmvReporting = allClients.filter((c) => c.gmvTargetMonth > 0).length;

        function companyWarning(reporting: number): string | undefined {
          return reporting < total ? `${reporting} of ${total} clients reporting` : undefined;
        }

        const pacingColor = (status: string) =>
          status === 'green' ? 'text-pacing-green-text' :
          status === 'yellow' ? 'text-pacing-yellow-text' : 'text-pacing-red-text';

        return (
          <DashboardShell
            title="Department Dashboard"
            subtitle="Company-Wide TikTok Shop Performance"
            lastUpdated={data.lastUpdated}
          >
            {/* Company Totals */}
            <section className="mb-8">
              <h2 className="text-xl font-bold text-white mb-4">Company Overview</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <KpiCard
                  label="MTD GMV (All Pods)"
                  value={data.companyMtdGmv}
                  target={data.companyMtdTarget}
                  pacing={data.companyGmvPacing}
                  status={data.companyGmvStatus}
                  format="currency"
                  subtitle={data.projectedMonthlyGmv > 0 ? fmtProjected(data.projectedMonthlyGmv) : undefined}
                  warning={companyWarning(gmvReporting)}
                />
                <KpiCard
                  label="Monthly Target"
                  value={monthlyTarget}
                  status="green"
                  format="currency"
                />
                <KpiCard
                  label="YTD GMV"
                  value={data.ytdGmv}
                  pacing={data.ytdTarget > 0 ? data.ytdGmv / data.ytdTarget : 0}
                  status={getPacingStatus(data.ytdTarget > 0 ? data.ytdGmv / data.ytdTarget : 0)}
                  format="currency"
                  subtitle={`Target: ${fmtCurrency(data.ytdTarget)} / ${fmtCurrency(data.annualTarget)}`}
                />
                <KpiCard
                  label="Active Pods"
                  value={data.pods.length}
                  status="green"
                  format="number"
                />
              </div>
            </section>

            {/* Pod Comparison */}
            <section className="mb-8">
              <PodComparisonChart pods={data.pods} />
            </section>

            {/* Pod Scorecards */}
            <section className="mb-8">
              <h2 className="text-xl font-bold text-white mb-4">Pod Breakdown</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {data.pods.map((pod) => {
                  const podTotal = pod.clients.length;
                  const podGmvR = pod.clients.filter((c) => c.gmvTargetMonth > 0).length;
                  const podVideoR = pod.clients.filter((c) => c.monthlyVideoTarget > 0).length;
                  const podSamplesR = pod.clients.filter((c) => c.targetSamplesGoals > 0).length;
                  const podSpendR = pod.clients.filter((c) => c.spendTarget > 0).length;

                  function podWarn(reporting: number): string {
                    return reporting < podTotal ? ` (${reporting}/${podTotal})` : '';
                  }

                  return (
                    <div
                      key={pod.podSlug}
                      className="bg-zt-card rounded-xl border border-zt-border p-5"
                    >
                      <h4 className="font-semibold text-white text-lg mb-3">{pod.podName}</h4>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-500">MTD GMV</span>
                          <span className="font-medium text-gray-300">
                            {fmtCurrency(pod.totalMtdGmv)} / {fmtCurrency(pod.totalMtdTarget)}
                            {podGmvR < podTotal && (
                              <span className="text-pacing-yellow-text text-xs ml-1" title={`${podGmvR} of ${podTotal} clients have GMV targets`}>⚠</span>
                            )}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-500">Pacing</span>
                          <span className={`font-bold ${pacingColor(pod.gmvStatus)}`}>
                            {(pod.gmvPacing * 100).toFixed(0)}%
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-500">Videos Posted</span>
                          <span className="text-gray-300">
                            {pod.totalVideosPosted.toLocaleString('en-US')} / {pod.totalVideoTarget.toLocaleString('en-US')}
                            {podVideoR < podTotal && (
                              <span className="text-pacing-yellow-text text-xs ml-1">⚠</span>
                            )}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-500">Samples Approved</span>
                          <span className="text-gray-300">
                            {pod.totalSamplesApproved.toLocaleString('en-US')} / {pod.totalSamplesTarget.toLocaleString('en-US')}
                            {podSamplesR < podTotal && (
                              <span className="text-pacing-yellow-text text-xs ml-1">⚠</span>
                            )}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-500">Ad Spend</span>
                          <span className="text-gray-300">
                            {fmtCurrency(pod.totalAdSpend)} / {fmtCurrency(pod.totalSpendTarget)}
                            {podSpendR < podTotal && (
                              <span className="text-pacing-yellow-text text-xs ml-1">⚠</span>
                            )}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-500">Avg ROI</span>
                          <span className="text-gray-300">{pod.avgRoi.toFixed(2)}</span>
                        </div>
                        {/* Pipeline metrics */}
                        <div className="border-t border-zt-border pt-2 mt-2">
                          <div className="flex justify-between">
                            <span className="text-gray-500">Samples Declined</span>
                            <span className="text-gray-300">{pod.totalSamplesDecline.toLocaleString('en-US')}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-500">Invites Sent</span>
                            <span className="text-gray-300">{pod.totalInvitesSent.toLocaleString('en-US')}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-500">Spark Codes</span>
                            <span className="text-gray-300">{pod.totalSparkCodes.toLocaleString('en-US')}</span>
                          </div>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-500">Clients</span>
                          <span className="text-gray-300">{pod.clients.length}</span>
                        </div>
                      </div>
                      {(podGmvR < podTotal || podVideoR < podTotal || podSamplesR < podTotal || podSpendR < podTotal) && (
                        <div className="mt-3 text-xs text-pacing-yellow-text border-t border-pacing-yellow-bg pt-2">
                          ⚠ {podWarn(podGmvR) && `GMV${podWarn(podGmvR)}`}
                          {podVideoR < podTotal && ` Video${podWarn(podVideoR)}`}
                          {podSamplesR < podTotal && ` Samples${podWarn(podSamplesR)}`}
                          {podSpendR < podTotal && ` Spend${podWarn(podSpendR)}`}
                          {' '}— incomplete targets
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </section>

            {/* Client Drill-Down Table */}
            <section className="mb-8">
              <ClientDrillTable clients={data.allClients} />
            </section>
          </DashboardShell>
        );
      }}
    </TokenGate>
  );
}
