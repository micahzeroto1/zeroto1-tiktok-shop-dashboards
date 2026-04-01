'use client';

import { useSearchParams } from 'next/navigation';
import { useState, useEffect, ReactNode, Suspense } from 'react';
import LoadingState from './LoadingState';
import ErrorState from './ErrorState';

interface TokenGateProps<T> {
  apiPath: string;
  children: (data: T) => ReactNode;
}

function TokenGateInner<T>({ apiPath, children }: TokenGateProps<T>) {
  const searchParams = useSearchParams();
  const token = searchParams.get('token');
  const [data, setData] = useState<T | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!token) {
      setErrorMsg('Invalid or missing access token.');
      setLoading(false);
      return;
    }

    fetch(`${apiPath}?token=${encodeURIComponent(token)}`)
      .then(async (res) => {
        if (!res.ok) {
          const body = await res.json().catch(() => ({}));
          throw new Error(
            res.status === 401
              ? 'Invalid or missing access token.'
              : body.error || 'Unable to load dashboard data. Please try again later.'
          );
        }
        return res.json();
      })
      .then(setData)
      .catch((err) => setErrorMsg(err.message || 'An unexpected error occurred.'))
      .finally(() => setLoading(false));
  }, [apiPath, token]);

  if (loading) return <LoadingState />;
  if (errorMsg || !data) return <ErrorState message={errorMsg ?? undefined} />;

  return <>{children(data)}</>;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export default function TokenGate<T = any>(props: TokenGateProps<T>) {
  return (
    <Suspense fallback={<LoadingState />}>
      <TokenGateInner {...props} />
    </Suspense>
  );
}
