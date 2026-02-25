'use client';

import TokenGate from '@/components/layout/TokenGate';
import DashboardShell from '@/components/layout/DashboardShell';
import KpiCard from '@/components/cards/KpiCard';
import PodComparisonChart from '@/components/charts/PodComparisonChart';
import ClientDrillTable from '@/components/tables/ClientDrillTable';
import { getPacingStatus } from '@/config/constants';
import type { CeoApiResponse } from '@/types/dashboard';

function fmtCurrency(val: number): string {
  return `$${val.toLocaleString('en-US', { maximumFractionDigits: 0 })}`;
}

export default function CeoDashboardPage() {
  return (
    <TokenGate apiPath="/api/ceo">
      {(data: CeoApiResponse) => {
        const monthlyTarget = data.annualTarget / 12;

        return (
          <DashboardShell
            title="CEO Dashboard"
            subtitle="Company-Wide TikTok Shop Performance"
            lastUpdated={data.lastUpdated}
          >
            {/* Company Totals */}
            <section className="mb-8">
              <h2 className="text-xl font-bold text-navy-900 mb-4">Company Overview</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <KpiCard
                  label="MTD GMV (All Pods)"
                  value={data.companyMtdGmv}
                  target={data.companyMtdTarget}
                  pacing={data.companyGmvPacing}
                  status={data.companyGmvStatus}
                  format="currency"
                />
                <KpiCard
                  label="Monthly Target"
                  value={monthlyTarget}
                  status="green"
                  format="currency"
                />
                <KpiCard
                  label="Projected Annual GMV"
                  value={data.projectedAnnualGmv}
                  target={data.annualTarget}
                  pacing={data.projectedAnnualGmv / data.annualTarget}
                  status={getPacingStatus(data.projectedAnnualGmv / data.annualTarget)}
                  format="currency"
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
              <h2 className="text-xl font-bold text-navy-900 mb-4">Pod Breakdown</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {data.pods.map((pod) => (
                  <div
                    key={pod.podSlug}
                    className="bg-white rounded-xl border border-slate-200 p-5"
                  >
                    <h4 className="font-semibold text-navy-900 text-lg mb-3">{pod.podName}</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-slate-500">MTD GMV</span>
                        <span className="font-medium">{fmtCurrency(pod.totalMtdGmv)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-500">Target</span>
                        <span>{fmtCurrency(pod.totalMtdTarget)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-500">Pacing</span>
                        <span className={`font-bold ${
                          pod.gmvStatus === 'green' ? 'text-emerald-600' :
                          pod.gmvStatus === 'yellow' ? 'text-amber-600' : 'text-rose-600'
                        }`}>
                          {(pod.gmvPacing * 100).toFixed(0)}%
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-500">Videos Posted</span>
                        <span>{pod.totalVideosPosted.toLocaleString('en-US')} / {pod.totalVideoTarget.toLocaleString('en-US')}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-500">Avg ROI</span>
                        <span>{pod.avgRoi.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-500">Clients</span>
                        <span>{pod.clients.length}</span>
                      </div>
                    </div>
                  </div>
                ))}
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
