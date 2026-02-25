export const PACING_THRESHOLDS = {
  green: 0.95,
  yellow: 0.80,
} as const;

export const CACHE_REVALIDATE_SECONDS = 600; // 10 minutes

export const ANNUAL_GMV_TARGET = 10_000_000;

export function getPacingStatus(pacing: number): 'green' | 'yellow' | 'red' {
  if (pacing >= PACING_THRESHOLDS.green) return 'green';
  if (pacing >= PACING_THRESHOLDS.yellow) return 'yellow';
  return 'red';
}
