'use client';

type GlassContinueButtonProps = {
  onClick: () => void;
  label?: string;
  'aria-label'?: string;
};

export function GlassContinueButton({
  onClick,
  label = 'Continue',
  'aria-label': ariaLabel = 'Continue to next',
}: GlassContinueButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={ariaLabel}
      className="group relative flex h-11 min-h-[44px] items-center justify-center gap-2 overflow-hidden rounded-full border border-black/[0.12] bg-white/75 px-6 py-2.5 text-sm font-medium tracking-tight text-[#0b0b0f] shadow-sm backdrop-blur-md transition hover:bg-white/85 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-[#0b0b0f]/20 focus:ring-offset-2 active:scale-[0.98]"
    >
      <span className="relative z-10">{label}</span>
      <span
        className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
        style={{
          background:
            'linear-gradient(105deg, transparent 0%, rgba(255,255,255,0.4) 45%, transparent 55%)',
          backgroundSize: '200% 100%',
        }}
        aria-hidden
      />
    </button>
  );
}
