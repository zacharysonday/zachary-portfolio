'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import type { SceneProps } from '@/engine/types';
import { story } from '@/content/story';
import { SceneFrame } from '@/ui/SceneFrame';
import { TypeLine } from '@/ui/TypeLine';
import { AuroraRevealText } from '@/ui/AuroraRevealText';
import { HoldToAdvanceButton } from '@/ui/HoldToAdvanceButton';

const ENTER = 0.22;
const HOLD = 0.65;
const EXIT = 0.13;
const CTA_CAP = 0.9999;

function clamp(value: number, min: number, max: number): number {
  if (value < min) return min;
  if (value > max) return max;
  return value;
}

export default function Story({
  progress,
  goNext,
  setProgressCap,
}: SceneProps) {
  const steps = useMemo(() => [...story.lines, story.cta], []);
  const totalSteps = steps.length;

  const stepFloat = progress * totalSteps;
  const stepIndex = clamp(Math.floor(stepFloat), 0, totalSteps - 1);
  const stepT = clamp(stepFloat - stepIndex, 0, 1);

  const enterT = clamp(stepT / ENTER, 0, 1);
  const exitT = clamp((stepT - ENTER - HOLD) / EXIT, 0, 1);

  const isCtaStep = stepIndex === totalSteps - 1;
  const isFirstStep = stepIndex === 0;

  const [ctaHoldProgress, setCtaHoldProgress] = useState(0);
  const hasAdvancedRef = useRef(false);

  useEffect(() => {
    if (isCtaStep) setProgressCap?.(CTA_CAP);
    else setProgressCap?.(null);
    return () => setProgressCap?.(null);
  }, [isCtaStep, setProgressCap]);

  // Prevent Space from scrolling while CTA step is active
  useEffect(() => {
    if (!isCtaStep) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.code !== 'Space' && e.key !== ' ') return;
      e.preventDefault();
    };
    const onKeyUp = (e: KeyboardEvent) => {
      if (e.code !== 'Space' && e.key !== ' ') return;
      e.preventDefault();
    };
    window.addEventListener('keydown', onKeyDown, { passive: false });
    window.addEventListener('keyup', onKeyUp, { passive: false });
    return () => {
      window.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('keyup', onKeyUp);
    };
  }, [isCtaStep]);

  const handleCtaComplete = useCallback(() => {
    if (hasAdvancedRef.current) return;
    hasAdvancedRef.current = true;
    setProgressCap?.(null);
    goNext?.();
  }, [goNext, setProgressCap]);

  if (isCtaStep) {
    return (
      <SceneFrame>
        <AuroraRevealText text={story.cta} progress={ctaHoldProgress} />
        <div className="mt-8 flex flex-col items-center">
          <HoldToAdvanceButton
            label="Hold to see my work"
            holdMs={2400}
            onComplete={handleCtaComplete}
            onProgress={setCtaHoldProgress}
            enabled
          />
        </div>
      </SceneFrame>
    );
  }

  if (isFirstStep) {
    return (
      <section className="relative flex min-h-screen w-full items-center justify-center py-16">
        <div className="story-hero-float">
          <TypeLine text={steps[0]} />
        </div>
        <style>{`
          .story-hero-float { animation: floatSlow 6s ease-in-out infinite; }
          @keyframes floatSlow {
            0%, 100% { transform: translateY(0); }
            50% { transform: translateY(-6px); }
          }
        `}</style>
      </section>
    );
  }

  const opacity = enterT < 1 ? enterT : 1 - exitT;
  const translateY = enterT < 1 ? (1 - enterT) * 12 : exitT * -12;

  return (
    <SceneFrame>
      <TypeLine
        text={steps[stepIndex]}
        style={{
          opacity,
          transform: `translateY(${translateY}px)`,
        }}
      />
    </SceneFrame>
  );
}
