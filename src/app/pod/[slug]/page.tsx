'use client';

import { useParams } from 'next/navigation';
import TokenGate from '@/components/layout/TokenGate';
import DashboardShell from '@/components/layout/DashboardShell';
import KpiCard from '@/components/cards/KpiCard';
import DailyHeatmap from '@/components/tables/DailyHeatmap';
import PacingLeaderboard from '@/components/tables/PacingLeaderboard';
import { getPacingStatus } from '@/config/constants';
import type { PodApiResponse } from '@/types/dashboard';

export default function PodDashboardPage() {
  const { slug } = useParams<{ slug: string }>();

  return (
    <TokenGate apiPath={`/api/pod/${slug}`}>
      {(data: PodApiResponse) => {
        const totalMtdGmv = data.clients.reduce((s, c) => s + c.cumulativeMtdGmv, 0);
        const totalTarget = data.clients.reduce((s, c) => s + c.gmvTargetMonth, 0);
        const gmvPacing = totalTarget > 0 ? totalMtdGmv / totalTarget : 0;
        const totalVideos = data.clients.reduce((s, c) => s + c.videosPosted, 0);
        const totalVideoTarget = data.clients.reduce((s, c) => s + c.monthlyVideoTarget, 0);
        const videoPacing = totalVideoTarget > 0 ? totalVideos / totalVideoTarget : 0;

        return (
          <DashboardShell
            title={`${data.podName} Dashboard`}
            subtitle="Pod Performance Overview"
          >
            {/* Pod Summary KPIs */}
            <section className="mb-8">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <KpiCard
                  label="Pod MTD GMV"
                  value={totalMtdGmv}
                  target={totalTarget}
                  pacing={gmvPacing}
                  status={getPacingStatus(gmvPacing)}
                  format="currency"
                />
                <KpiCard
                  label="Pod Videos Posted"
                  value={totalVideos}
                  target={totalVideoTarget}
                  pacing={videoPacing}
                  status={getPacingStatus(videoPacing)}
                  format="number"
                />
                <KpiCard
                  label="Active Clients"
                  value={data.clients.length}
                  status="green"
                  format="number"
                />
                <KpiCard
                  label="Avg ROI"
                  value={
                    data.clients.length > 0
                      ? data.clients.reduce((s, c) => s + c.roi, 0) / data.clients.length
                      : 0
                  }
                  status="green"
                  format="number"
                />
              </div>
            </section>

            {/* Daily Table/Heatmap */}
            <section className="mb-8">
              <DailyHeatmap clients={data.clients} />
            </section>

            {/* MTD Pacing Leaderboard */}
            {data.clients.length > 0 && (
              <section className="mb-8">
                <PacingLeaderboard clients={data.clients} />
              </section>
            )}

            {/* Per-Client Weekly Scorecard Grid */}
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
                        <span className="font-medium">${client.cumulativeMtdGmv.toLocaleString('en-US', { maximumFractionDigits: 0 })}</span>
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
                        <span>{client.videosPosted} / {client.monthlyVideoTarget}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-500">ROI</span>
                        <span>{client.roi.toFixed(1)}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          </DashboardShell>
        );
      }}
    </TokenGate>
  );
}
