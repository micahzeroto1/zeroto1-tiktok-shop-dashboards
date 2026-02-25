import { NextRequest, NextResponse } from 'next/server';
import { validateClientToken } from '@/lib/auth';
import { fetchSheetRanges } from '@/lib/google-sheets';
import { parseRawTab, parseRollupTab, parseSkuData, aggregateByMonth } from '@/lib/data-parser';
import { buildMtdScorecardFromRollup, buildMtdScorecard } from '@/lib/pacing';
import { CACHE_REVALIDATE_SECONDS } from '@/config/constants';
import type { ClientApiResponse } from '@/types/dashboard';

export const revalidate = CACHE_REVALIDATE_SECONDS;

export async function GET(
  request: NextRequest,
  { params }: { params: { clientSlug: string } }
) {
  const token = request.nextUrl.searchParams.get('token');
  const auth = validateClientToken(params.clientSlug, token);

  if (!auth.valid) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  if (auth.level !== 'client') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { pod, client } = auth;

  try {
    const ranges = [
      `'${client.rawTabName}'!A1:AZ1000`,
      `'${client.rollupTabName}'!A1:AZ1000`,
    ];

    const [rawRows, rollupRows] = await fetchSheetRanges(pod.spreadsheetId, ranges);

    const dailyData = parseRawTab(rawRows);
    const { weeklyRows, monthlyRows } = parseRollupTab(rollupRows);
    const monthlyData = aggregateByMonth(dailyData);

    // Scorecard: prefer rollup monthly row, fall back to raw daily data
    const mtdScorecard =
      buildMtdScorecardFromRollup(monthlyRows) ?? buildMtdScorecard(dailyData);

    // Weekly data: only pre-aggregated weekly rollup rows with actual data
    const weeklyData = weeklyRows.filter(
      (w) => w.dailyGmv > 0 || w.videosPosted > 0 || w.totalSamplesApproved > 0 || w.adSpend > 0
    );

    const skuBreakdown = client.skus
      ? parseSkuData(rawRows, client.skus)
      : undefined;

    const filteredSkuBreakdown = skuBreakdown?.some(
      (s) => s.sampleRequests > 0 || s.samplesApproved > 0
    )
      ? skuBreakdown
      : undefined;

    const response: ClientApiResponse = {
      clientName: client.displayName,
      mtdScorecard,
      weeklyData,
      monthlyData,
      skuBreakdown: filteredSkuBreakdown,
      lastUpdated: new Date().toISOString(),
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('Client API error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch data' },
      { status: 500 }
    );
  }
}
