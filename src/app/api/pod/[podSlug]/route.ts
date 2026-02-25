import { NextRequest, NextResponse } from 'next/server';
import { validatePodToken } from '@/lib/auth';
import { fetchSheetRanges } from '@/lib/google-sheets';
import { parseRawTab } from '@/lib/data-parser';
import { buildMtdScorecard } from '@/lib/pacing';
import { CACHE_REVALIDATE_SECONDS } from '@/config/constants';
import type { ClientMtdSummary, PodApiResponse } from '@/types/dashboard';

export const revalidate = CACHE_REVALIDATE_SECONDS;

export async function GET(
  request: NextRequest,
  { params }: { params: { podSlug: string } }
) {
  const token = request.nextUrl.searchParams.get('token');
  const auth = validatePodToken(params.podSlug, token);

  if (!auth.valid || auth.level !== 'pod') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { pod } = auth;

  if (pod.clients.length === 0) {
    return NextResponse.json({
      podName: pod.displayName,
      podSlug: pod.slug,
      clients: [],
      lastUpdated: new Date().toISOString(),
    } satisfies PodApiResponse);
  }

  try {
    // Fetch all client raw tabs in one batchGet
    const ranges = pod.clients.map(
      (c) => `'${c.rawTabName}'!A1:AZ1000`
    );

    const allData = await fetchSheetRanges(pod.spreadsheetId, ranges);

    const clients: ClientMtdSummary[] = pod.clients.map((clientConfig, i) => {
      const daily = parseRawTab(allData[i]);
      const scorecard = buildMtdScorecard(daily);

      return {
        clientSlug: clientConfig.slug,
        clientName: clientConfig.displayName,
        cumulativeMtdGmv: scorecard.cumulativeMtdGmv,
        gmvTargetMonth: scorecard.gmvTargetMonth,
        gmvPacing: scorecard.gmvPacing,
        gmvStatus: scorecard.gmvStatus,
        projectedMonthlyGmv: scorecard.projectedMonthlyGmv,
        videosPosted: scorecard.videosPosted,
        monthlyVideoTarget: scorecard.monthlyVideoTarget,
        totalSamplesApproved: scorecard.totalSamplesApproved,
        targetSamplesGoals: scorecard.targetSamplesGoals,
        adSpend: scorecard.adSpend,
        spendTarget: scorecard.spendTarget,
        roi: scorecard.roi,
        roiTarget: scorecard.roiTarget,
        dailyData: daily,
      };
    });

    const response: PodApiResponse = {
      podName: pod.displayName,
      podSlug: pod.slug,
      clients,
      lastUpdated: new Date().toISOString(),
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('Pod API error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch data' },
      { status: 500 }
    );
  }
}
