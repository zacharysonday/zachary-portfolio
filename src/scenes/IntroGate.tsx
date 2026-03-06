'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

import type { SceneProps } from '@/engine/types';
import { AuroraBackdrop } from '@/ui/AuroraBackdrop';
import { TypeLine } from '@/ui/TypeLine';
import { HoldToAdvanceButton } from '@/ui/HoldToAdvanceButton';
import { LoaderDots } from '@/ui/LoaderDots';

const INTRO_HEADLINE = 'Most products fail long before users ever see them.';
const LOADER_MS = 700;
const FADEOUT_MS = 350;
const CAP_EPSILON = 0.0001;

export default function IntroGate({
  setProgressCap,
  goNext,
  totalScenes = 5,
}: SceneProps) {
  const [showLoader, setShowLoader] = useState(true);
  const [isExiting, setIsExiting] = useState(false);
  const exitRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const loaderRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const didAdvanceRef = useRef(false);

  const handleHoldComplete = useCallback(() => {
    if (isExiting || didAdvanceRef.current) return;
    didAdvanceRef.current = true;
    setIsExiting(true);
    setProgressCap?.(null);
    exitRef.current = setTimeout(() => {
      goNext?.();
    }, FADEOUT_MS);
  }, [isExiting, setProgressCap, goNext]);

  // Hard gate: Scene 0 cannot be left by scroll
  useEffect(() => {
    const cap = 1 / totalScenes - CAP_EPSILON;
    setProgressCap?.(cap);
    return () => {
      setProgressCap?.(null);
      if (exitRef.current) clearTimeout(exitRef.current);
      if (loaderRef.current) clearTimeout(loaderRef.current);
    };
  }, [setProgressCap, totalScenes]);

  // Prevent Space from scrolling the page while Scene 0 (IntroGate) is active
  useEffect(() => {
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
  }, []);

  useEffect(() => {
    loaderRef.current = setTimeout(() => setShowLoader(false), LOADER_MS);
    return () => {
      if (loaderRef.current) clearTimeout(loaderRef.current);
    };
  }, []);

  return (
    <div className="relative flex min-h-screen w-full flex-col items-center justify-center bg-[#F5F5F7]">
      <AuroraBackdrop />
      <div
        className="relative z-10 flex w-full flex-col items-center justify-center py-16 transition-opacity duration-[350ms]"
        style={{ opacity: isExiting ? 0 : 1 }}
      >
        <div className="intro-hero-float">
          <TypeLine text={INTRO_HEADLINE} />
        </div>
        <div className="mt-7 flex flex-col items-center gap-2.5">
          <HoldToAdvanceButton
            label="Hold to begin"
            holdMs={2200}
            onComplete={handleHoldComplete}
          />
        </div>
        <div
          className="mt-8 transition-opacity duration-300"
          style={{ opacity: showLoader ? 1 : 0 }}
          aria-hidden
        >
          <LoaderDots />
        </div>
      </div>
      <style>{`
        .intro-hero-float { animation: introFloat 7s ease-in-out infinite; }
        @keyframes introFloat {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-6px); }
        }
      `}</style>
    </div>
  );
}
