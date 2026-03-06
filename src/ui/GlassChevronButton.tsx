'use client';

type GlassChevronButtonProps = {
  onClick: () => void;
  'aria-label'?: string;
};

export function GlassChevronButton({
  onClick,
  'aria-label': ariaLabel = 'Enter',
}: GlassChevronButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={ariaLabel}
      className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full border border-black/[0.08] bg-white/70 shadow-[0_1px_3px_rgba(0,0,0,0.06)] backdrop-blur-md transition hover:-translate-y-px hover:shadow-[0_2px_6px_rgba(0,0,0,0.08)] active:scale-[0.98]"
    >
      <svg
        width="22"
        height="22"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="text-[#0B0B0F]"
        aria-hidden
      >
        <path d="M9 18l6-6-6-6" />
      </svg>
    </button>
  );
}
