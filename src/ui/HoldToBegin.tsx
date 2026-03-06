'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

import { easeInOutCubic, easeOutCubic } from '@/lib/ease';

const RING_SIZE = 18;
const RING_STROKE = 2;
const R = (RING_SIZE - RING_STROKE) / 2;
const CIRCUMFERENCE = 2 * Math.PI * R;

const TARGET_HOLD_MS = 2400;
const TARGET_DRAIN_MS = 700;

const AURORA_GRADIENT =
  'linear-gradient(90deg,#ff5ea8 0%,#b46cff 20%,#4d7dff 45%,#29d3ff 65%,#45f29a 85%,#ffd36e 100%)';

// Success sequence: stage1 (text fade) → stage2 (aurora fill) → stage3 (pulse)
const SUCCESS_STAGE1_MS = 140;
const SUCCESS_STAGE2_MS = 320;
const SUCCESS_STAGE3_MS = 260;
const SUCCESS_TOTAL_MS = SUCCESS_STAGE1_MS + SUCCESS_STAGE2_MS + SUCCESS_STAGE3_MS;

type Phase = 'idle' | 'holding' | 'draining' | 'success' | 'done';

type HoldToBeginProps = {
  onComplete: () => void;
  label?: string;
  durationMs?: number;
};

function clamp01(x: number): number {
  return Math.max(0, Math.min(1, x));
}

export function HoldToBegin({
  onComplete,
  label = 'Hold to begin',
  durationMs = TARGET_HOLD_MS,
}: HoldToBeginProps) {
  const [phase, setPhase] = useState<Phase>('idle');
  const [displayProgress, setDisplayProgress] = useState(0);
  const [successElapsed, setSuccessElapsed] = useState(0);
  const [successScale, setSuccessScale] = useState(1);
  const completedRef = useRef(false);
  const holdStartRef = useRef(0);
  const drainStartRef = useRef(0);
  const drainFromRef = useRef(0);
  const successStartRef = useRef(0);
  const rafRef = useRef(0);
  const holdingByRef = useRef<'pointer' | 'key' | null>(null);
  const isHoldingRef = useRef(false);

  const startHold = useCallback(() => {
    if (completedRef.current) return;
    if (isHoldingRef.current) return; // ignore repeat keydown / duplicate start
    isHoldingRef.current = true;
    holdStartRef.current = performance.now();
    setPhase('holding');
    holdingByRef.current = holdingByRef.current || 'key';
  }, []);

  const stopHold = useCallback(() => {
    isHoldingRef.current = false;
    holdingByRef.current = null;
    if (phase !== 'holding') return;
    const raw = clamp01((performance.now() - holdStartRef.current) / durationMs);
    const current = easeInOutCubic(raw);
    if (current >= 1) {
      return;
    }
    drainFromRef.current = current;
    drainStartRef.current = performance.now();
    setPhase('draining');
  }, [phase, durationMs]);

  const stopHoldPointer = useCallback(() => {
    isHoldingRef.current = false;
    holdingByRef.current = null;
    if (phase !== 'holding') return;
    const raw = clamp01((performance.now() - holdStartRef.current) / durationMs);
    const current = easeInOutCubic(raw);
    if (current >= 1) return;
    drainFromRef.current = current;
    drainStartRef.current = performance.now();
    setPhase('draining');
  }, [phase, durationMs]);

  // Animation loop: holding, draining, success
  useEffect(() => {
    const tick = (now: number) => {
      if (phase === 'holding') {
        const heldMs = now - holdStartRef.current;
        const raw = clamp01(heldMs / durationMs);
        const p = easeInOutCubic(raw);
        setDisplayProgress(p);
        if (raw >= 1) {
          isHoldingRef.current = false;
          setPhase('success');
          successStartRef.current = now;
        }
        rafRef.current = requestAnimationFrame(tick);
        return;
      }
      if (phase === 'draining') {
        const elapsed = now - drainStartRef.current;
        const t = clamp01(elapsed / TARGET_DRAIN_MS);
        const eased = easeOutCubic(t);
        const p = drainFromRef.current * (1 - eased);
        setDisplayProgress(p);
        if (t >= 1) setPhase('idle');
        rafRef.current = requestAnimationFrame(tick);
        return;
      }
      if (phase === 'success') {
        const elapsed = now - successStartRef.current;
        setSuccessElapsed(elapsed);
        if (elapsed >= SUCCESS_STAGE1_MS + SUCCESS_STAGE2_MS) {
          const stage3 = elapsed - SUCCESS_STAGE1_MS - SUCCESS_STAGE2_MS;
          const t = clamp01(stage3 / SUCCESS_STAGE3_MS);
          const scale = t < 0.5 ? 1 + 0.03 * (t * 2) : 1 + 0.03 * (2 - t * 2);
          setSuccessScale(scale);
        }
        if (elapsed >= SUCCESS_TOTAL_MS) {
          completedRef.current = true;
          setPhase('done');
          onComplete();
          return;
        }
        rafRef.current = requestAnimationFrame(tick);
        return;
      }
      // idle or done: stop loop
    };

    rafRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafRef.current);
  }, [phase, durationMs, onComplete]);

  // Keyboard: Space + Enter
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key !== 'Enter' && e.key !== ' ') return;
      if (e.repeat) return; // ignore auto-repeat
      const target = e.target as Node;
      if (
        target &&
        typeof (target as HTMLElement).closest === 'function' &&
        (target as HTMLElement).closest('input, textarea, [contenteditable="true"]')
      )
        return;
      e.preventDefault();
      startHold();
      holdingByRef.current = 'key';
    };
    const onKeyUp = (e: KeyboardEvent) => {
      if (e.key !== 'Enter' && e.key !== ' ') return;
      e.preventDefault();
      stopHold();
    };
    window.addEventListener('keydown', onKeyDown);
    window.addEventListener('keyup', onKeyUp);
    return () => {
      window.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('keyup', onKeyUp);
    };
  }, [startHold, stopHold]);

  const strokeDashoffset = CIRCUMFERENCE * (1 - clamp01(displayProgress));

  const isSuccess = phase === 'success' || phase === 'done';
  const textOpacity = isSuccess ? Math.max(0, 1 - successElapsed / SUCCESS_STAGE1_MS) : 1;
  const textBlur = isSuccess ? Math.min(3, (successElapsed / SUCCESS_STAGE1_MS) * 3) : 0;
  const auroraFill = isSuccess
    ? clamp01((successElapsed - SUCCESS_STAGE1_MS) / SUCCESS_STAGE2_MS)
    : 0;
  const showCheck = isSuccess && successElapsed > SUCCESS_STAGE1_MS + SUCCESS_STAGE2_MS * 0.5;

  return (
    <button
      type="button"
      role="button"
      tabIndex={0}
      aria-label="Hold to begin"
      onPointerDown={(e) => {
        e.preventDefault();
        if (completedRef.current) return;
        holdStartRef.current = performance.now();
        setPhase('holding');
        holdingByRef.current = 'pointer';
      }}
      onPointerUp={stopHoldPointer}
      onPointerLeave={stopHoldPointer}
      onPointerCancel={stopHoldPointer}
      className="group relative flex h-11 min-h-[44px] items-center justify-center gap-3 overflow-hidden rounded-full px-5 py-2.5 transition focus:outline-none focus:ring-2 focus:ring-[#0b0b0f]/20 focus:ring-offset-2"
      style={{
        transform: `scale(${successScale})`,
        transition: phase === 'success' ? 'transform 0.08s ease-out' : undefined,
      }}
    >
      {/* Aurora fill layer (reveal left→right, under glass) */}
      <div
        className={`absolute left-0 top-0 bottom-0 ${auroraFill >= 0.999 ? 'rounded-full' : 'rounded-l-full'}`}
        style={{
          background: AURORA_GRADIENT,
          width: `${auroraFill * 100}%`,
        }}
        aria-hidden
      />
      {/* Glass overlay so aurora sits under glass */}
      <div
        className="pointer-events-none absolute inset-0 rounded-full border border-black/[0.12] bg-white/65 shadow-sm backdrop-blur-md transition-colors group-hover:bg-white/75"
        aria-hidden
      />

      <span
        className="relative z-10 flex items-center gap-3 transition-none"
        style={{
          opacity: textOpacity,
          filter: textBlur > 0 ? `blur(${textBlur}px)` : undefined,
        }}
      >
        {showCheck ? (
          <svg
            width={RING_SIZE}
            height={RING_SIZE}
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={2.5}
            strokeLinecap="round"
            strokeLinejoin="round"
            className="flex-shrink-0 text-[#0b0b0f]"
            aria-hidden
          >
            <path d="M5 12l5 5L20 7" />
          </svg>
        ) : (
          <svg
            width={RING_SIZE}
            height={RING_SIZE}
            viewBox={`0 0 ${RING_SIZE} ${RING_SIZE}`}
            className="flex-shrink-0 text-[#0b0b0f]"
            aria-hidden
          >
            <circle
              cx={RING_SIZE / 2}
              cy={RING_SIZE / 2}
              r={R}
              fill="none"
              stroke="currentColor"
              strokeWidth={RING_STROKE}
              style={{ opacity: 0.25 }}
            />
            <circle
              cx={RING_SIZE / 2}
              cy={RING_SIZE / 2}
              r={R}
              fill="none"
              stroke="currentColor"
              strokeWidth={RING_STROKE}
              strokeDasharray={CIRCUMFERENCE}
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
              style={{
                opacity: 0.95,
                transform: 'rotate(-90deg)',
                transformOrigin: 'center',
              }}
            />
          </svg>
        )}
        <span className="text-sm font-medium tracking-tight text-[#0b0b0f]">
          {label}
        </span>
      </span>
    </button>
  );
}
