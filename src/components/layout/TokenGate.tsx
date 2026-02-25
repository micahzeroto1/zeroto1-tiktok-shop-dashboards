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
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!token) {
      setError(true);
      setLoading(false);
      return;
    }

    fetch(`${apiPath}?token=${encodeURIComponent(token)}`)
      .then((res) => {
        if (!res.ok) throw new Error('Unauthorized');
        return res.json();
      })
      .then(setData)
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  }, [apiPath, token]);

  if (loading) return <LoadingState />;
  if (error || !data) return <ErrorState />;

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
