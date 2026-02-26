'use client';

interface ErrorStateProps {
  message?: string;
}

export default function ErrorState({ message }: ErrorStateProps) {
  return (
    <div className="min-h-screen bg-zt-bg flex items-center justify-center">
      <div className="text-center bg-zt-card rounded-xl border border-zt-border p-8 max-w-md">
        <div className="w-16 h-16 bg-pacing-red-bg rounded-full flex items-center justify-center mx-auto mb-4">
          <svg className="w-8 h-8 text-pacing-red-text" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
          </svg>
        </div>
        <h2 className="text-xl font-bold text-white mb-2">Access Denied</h2>
        <p className="text-gray-500">{message || 'Invalid or missing access token.'}</p>
      </div>
    </div>
  );
}
