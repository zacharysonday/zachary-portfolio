'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

import { easeInOutCubic, easeOutCubic } from '@/lib/ease';

const RING_SIZE = 18;
const RING_STROKE = 2;
const R = (RING_SIZE - RING_STROKE) / 2;
const CIRCUMFERENCE = 2 * Math.PI * R;

const DEFAULT_HOLD_MS = 2200;
const DRAIN_MS = 600;
const AURORA_GRADIENT =
  'linear-gradient(90deg,#ff5ea8 0%,#b46cff 20%,#4d7dff 45%,#29d3ff 65%,#45f29a 85%,#ffd36e 100%)';

const SUCCESS_DURATION_MS = 650;
const SUCCESS_SNAP_MS = 180;
const SUCCESS_SWEEP_START_MS = 120;
const SUCCESS_SWEEP_DURATION_MS = 450;
const CHECK_PATH_LENGTH = 22;

type Phase = 'idle' | 'holding' | 'draining' | 'success' | 'done';

export type HoldToAdvanceButtonProps = {
  label: string;
  hint?: string;
  holdMs?: number;
  onComplete: () => void;
  onProgress?: (p: number) => void;
  enabled?: boolean;
};

function clamp01(x: number): number {
  return Math.max(0, Math.min(1, x));
}

function easeOutBack(t: number): number {
  const c1 = 1.70158;
  const c3 = c1 + 1;
  return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2);
}

export function HoldToAdvanceButton({
  label,
  hint,
  holdMs = DEFAULT_HOLD_MS,
  onComplete,
  onProgress,
  enabled = true,
}: HoldToAdvanceButtonProps) {
  const [phase, setPhase] = useState<Phase>('idle');
  const [displayProgress, setDisplayProgress] = useState(0);
  const [successElapsed, setSuccessElapsed] = useState(0);
  const holdStartRef = useRef(0);
  const drainStartRef = useRef(0);
  const drainFromRef = useRef(0);
  const successStartRef = useRef(0);
  const rafRef = useRef(0);
  const holdingRef = useRef(false);
  const hasAdvancedRef = useRef(false);

  const startHold = useCallback(() => {
    if (!enabled) return;
    if (hasAdvancedRef.current) return;
    if (holdingRef.current) return;
    holdingRef.current = true;
    holdStartRef.current = performance.now();
    setPhase('holding');
  }, [enabled]);

  const stopHold = useCallback(() => {
    holdingRef.current = false;
    if (phase !== 'holding') return;
    const raw = clamp01((performance.now() - holdStartRef.current) / holdMs);
    const current = easeInOutCubic(raw);
    if (current >= 1) return;
    drainFromRef.current = current;
    drainStartRef.current = performance.now();
    setPhase('draining');
  }, [phase, holdMs]);

  const stopHoldPointer = useCallback(() => {
    holdingRef.current = false;
    if (phase !== 'holding') return;
    const raw = clamp01((performance.now() - holdStartRef.current) / holdMs);
    const current = easeInOutCubic(raw);
    if (current >= 1) return;
    drainFromRef.current = current;
    drainStartRef.current = performance.now();
    setPhase('draining');
  }, [phase, holdMs]);

  useEffect(() => {
    if (!enabled) return;
    const tick = (now: number) => {
      if (phase === 'holding') {
        const heldMs = now - holdStartRef.current;
        const raw = clamp01(heldMs / holdMs);
        const p = easeInOutCubic(raw);
        setDisplayProgress(p);
        onProgress?.(clamp01(p));
        if (raw >= 1) {
          holdingRef.current = false;
          setPhase('success');
          successStartRef.current = now;
        }
        rafRef.current = requestAnimationFrame(tick);
        return;
      }
      if (phase === 'draining') {
        const elapsed = now - drainStartRef.current;
        const t = clamp01(elapsed / DRAIN_MS);
        const eased = easeOutCubic(t);
        const p = drainFromRef.current * (1 - eased);
        setDisplayProgress(p);
        onProgress?.(clamp01(p));
        if (t >= 1) setPhase('idle');
        rafRef.current = requestAnimationFrame(tick);
        return;
      }
      if (phase === 'success') {
        const elapsed = now - successStartRef.current;
        setSuccessElapsed(elapsed);
        if (elapsed >= SUCCESS_DURATION_MS) {
          if (!hasAdvancedRef.current) {
            hasAdvancedRef.current = true;
            onComplete();
          }
          setPhase('done');
          return;
        }
        rafRef.current = requestAnimationFrame(tick);
        return;
      }
    };

    rafRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafRef.current);
  }, [phase, holdMs, onComplete, onProgress, enabled]);

  useEffect(() => {
    if (!enabled) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key !== 'Enter' && e.key !== ' ') return;
      if (e.repeat) return;
      const target = e.target as Node;
      if (
        target &&
        typeof (target as HTMLElement).closest === 'function' &&
        (target as HTMLElement).closest('input, textarea, [contenteditable="true"]')
      )
        return;
      e.preventDefault();
      startHold();
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
  }, [enabled, startHold, stopHold]);

  const strokeDashoffset = CIRCUMFERENCE * (1 - clamp01(displayProgress));
  const isSuccess = phase === 'success' || phase === 'done';

  const snapT = clamp01(successElapsed / SUCCESS_SNAP_MS);
  const successScale = isSuccess ? 0.98 + 0.02 * easeOutBack(snapT) : 1;

  const sweepT = clamp01((successElapsed - SUCCESS_SWEEP_START_MS) / SUCCESS_SWEEP_DURATION_MS);
  const sweepX = isSuccess ? -120 + 240 * easeInOutCubic(sweepT) : 0;

  const glowT = clamp01(successElapsed / SUCCESS_SNAP_MS);
  const glowOpacity = isSuccess ? 0.15 + 0.25 * glowT : 0;
  const successShadow = isSuccess
    ? `0 0 0 1px rgba(0,0,0,0.06), 0 4px 20px rgba(180,108,255,${glowOpacity * 0.6})`
    : undefined;

  const labelHideT = clamp01(successElapsed / 150);
  const labelOpacity = isSuccess ? 1 - labelHideT : 1;
  const labelTranslateY = isSuccess ? 6 * labelHideT : 0;

  const checkDrawT = clamp01((successElapsed - SUCCESS_SWEEP_START_MS) / 400);
  const checkOffset = isSuccess ? CHECK_PATH_LENGTH * (1 - easeOutCubic(checkDrawT)) : CHECK_PATH_LENGTH;
  const showCheck = isSuccess && successElapsed > SUCCESS_SWEEP_START_MS;

  const ringPulseT = clamp01(successElapsed / 120);
  const ringStroke = isSuccess ? (ringPulseT < 0.5 ? 2 + 1.2 * (ringPulseT * 2) : 3.2 - 1.2 * ((ringPulseT - 0.5) * 2)) : RING_STROKE;

  const isSuccessBlocking = isSuccess && successElapsed < 400;

  return (
    <div className="flex flex-col items-center gap-2">
      <button
        type="button"
        role="button"
        tabIndex={0}
        aria-label={label}
        data-state={isSuccess ? 'success' : undefined}
        onPointerDown={(e) => {
          e.preventDefault();
          if (!enabled || hasAdvancedRef.current || isSuccessBlocking) return;
          holdStartRef.current = performance.now();
          holdingRef.current = true;
          setPhase('holding');
        }}
        onPointerUp={stopHoldPointer}
        onPointerLeave={stopHoldPointer}
        onPointerCancel={stopHoldPointer}
        className="group relative flex h-11 min-h-[44px] min-w-[220px] items-center justify-center gap-3 overflow-hidden rounded-full border border-black/[0.12] bg-white/75 px-5 py-2.5 backdrop-blur-md transition focus:outline-none focus:ring-2 focus:ring-[#0b0b0f]/20 focus:ring-offset-2"
        style={{
          transform: `scale(${successScale})`,
          boxShadow: successShadow,
          pointerEvents: isSuccessBlocking ? 'none' : undefined,
        }}
      >
        {/* Aurora sweep layer (success only) */}
        {isSuccess && (
          <div
            className="pointer-events-none absolute inset-0 rounded-full mix-blend-soft-light"
            style={{
              background: AURORA_GRADIENT,
              opacity: 0.9,
              transform: `translateX(${sweepX}%)`,
              transition: 'none',
            }}
            aria-hidden
          />
        )}

        {/* Static glass overlay */}
        <div
          className="pointer-events-none absolute inset-0 rounded-full border border-black/[0.12] bg-white/75 shadow-sm backdrop-blur-md"
          aria-hidden
        />

        <span
          className="relative z-10 flex items-center gap-3"
          style={{
            opacity: labelOpacity,
            transform: `translateY(${labelTranslateY}px)`,
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
              <path
                d="M5 12l5 5L20 7"
                strokeDasharray={CHECK_PATH_LENGTH}
                strokeDashoffset={checkOffset}
                style={{ transition: 'none' }}
              />
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
                strokeWidth={isSuccess ? ringStroke : RING_STROKE}
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
      {hint && (
        <p className="text-xs" style={{ color: 'rgba(0,0,0,0.55)' }}>
          {hint}
        </p>
      )}
    </div>
  );
}
