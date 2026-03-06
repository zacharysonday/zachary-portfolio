'use client';

export function LoaderDots() {
  return (
    <div className="flex items-center justify-center gap-1.5" aria-hidden>
      <span
        className="h-1 w-1 rounded-full bg-neutral-400"
        style={{
          animation: 'loader-dot 900ms ease-in-out infinite both',
          animationDelay: '0ms',
        }}
      />
      <span
        className="h-1 w-1 rounded-full bg-neutral-400"
        style={{
          animation: 'loader-dot 900ms ease-in-out infinite both',
          animationDelay: '150ms',
        }}
      />
      <span
        className="h-1 w-1 rounded-full bg-neutral-400"
        style={{
          animation: 'loader-dot 900ms ease-in-out infinite both',
          animationDelay: '300ms',
        }}
      />
      <style>{`
        @keyframes loader-dot {
          0%, 100% { opacity: 0.35; transform: translateY(0); }
          50% { opacity: 0.9; transform: translateY(-3px); }
        }
      `}</style>
    </div>
  );
}
