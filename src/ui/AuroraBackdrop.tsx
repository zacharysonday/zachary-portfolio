'use client';

export function AuroraBackdrop() {
  return (
    <div
      className="absolute inset-0 overflow-hidden"
      aria-hidden
    >
      {/* Base off-white */}
      <div
        className="absolute inset-0"
        style={{ backgroundColor: '#F5F5F7' }}
      />
      {/* Animated radial blobs – living light field */}
      <div className="absolute inset-0 opacity-[0.35]" style={{ filter: 'blur(70px)' }}>
        <div
          className="aurora-blob absolute h-[80vh] w-[80vh] rounded-full opacity-80"
          style={{
            left: '10%',
            top: '20%',
            background: 'radial-gradient(circle, rgba(255, 94, 168, 0.28) 0%, transparent 65%)',
            animation: 'aurora-drift-1 20s ease-in-out infinite alternate',
          }}
        />
        <div
          className="aurora-blob absolute h-[70vh] w-[70vh] rounded-full opacity-80"
          style={{
            right: '5%',
            top: '30%',
            background: 'radial-gradient(circle, rgba(180, 108, 255, 0.22) 0%, transparent 60%)',
            animation: 'aurora-drift-2 22s ease-in-out infinite alternate',
          }}
        />
        <div
          className="aurora-blob absolute h-[60vh] w-[60vh] rounded-full opacity-80"
          style={{
            left: '35%',
            bottom: '10%',
            background: 'radial-gradient(circle, rgba(77, 125, 255, 0.2) 0%, transparent 60%)',
            animation: 'aurora-drift-3 16s ease-in-out infinite alternate',
          }}
        />
      </div>
      {/* Subtle grain overlay */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.03] mix-blend-overlay"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
        }}
      />
      <style>{`
        @keyframes aurora-drift-1 {
          0% { transform: translate(0, 0) scale(1); }
          100% { transform: translate(8%, -5%) scale(1.12); }
        }
        @keyframes aurora-drift-2 {
          0% { transform: translate(0, 0) scale(1.05); }
          100% { transform: translate(-6%, 4%) scale(0.95); }
        }
        @keyframes aurora-drift-3 {
          0% { transform: translate(0, 0) scale(1); }
          100% { transform: translate(4%, 6%) scale(1.08); }
        }
      `}</style>
    </div>
  );
}
