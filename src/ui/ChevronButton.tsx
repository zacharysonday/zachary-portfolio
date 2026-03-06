'use client';

type ChevronButtonProps = {
  onClick: () => void;
  'aria-label'?: string;
};

export function ChevronButton({ onClick, 'aria-label': ariaLabel = 'Next' }: ChevronButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={ariaLabel}
      className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-full border border-black/[0.18] bg-white/75 shadow-sm backdrop-blur transition hover:-translate-y-0.5 active:scale-95"
    >
      <svg
        width="20"
        height="20"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="text-[#0b0b0f]"
        aria-hidden
      >
        <path d="M9 18l6-6-6-6" />
      </svg>
    </button>
  );
}
