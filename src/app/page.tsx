import Image from 'next/image';

export default function Home() {
  return (
    <div className="min-h-screen bg-zt-bg flex items-center justify-center">
      <div className="text-center">
        <Image src="/logo.svg" alt="ZeroTo1" width={200} height={32} className="mx-auto mb-6" priority />
        <h1 className="text-3xl font-bold text-white mb-2">TikTok Shop Dashboards</h1>
        <p className="text-gray-500">Access requires a valid dashboard link with token.</p>
      </div>
    </div>
  );
}
