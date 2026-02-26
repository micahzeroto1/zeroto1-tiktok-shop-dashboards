'use client';

export default function LoadingState() {
  return (
    <div className="min-h-screen bg-zt-bg flex items-center justify-center">
      <div className="text-center">
        <div className="w-12 h-12 border-4 border-zt-yellow border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p className="text-gray-500 text-lg">Loading dashboard...</p>
      </div>
    </div>
  );
}
