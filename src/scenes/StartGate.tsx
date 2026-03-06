'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

import type { SceneProps } from '@/engine/types';
import { story } from '@/content/story';
import { AuroraBackdrop } from '@/ui/AuroraBackdrop';
import { TypeLine } from '@/ui/TypeLine';
import { HoldToBegin } from '@/ui/HoldToBegin';
import { LoaderDots } from '@/ui/LoaderDots';

const START_GATE_CAP = 0.1999;
const LOADER_DURATION_MS = 700;
const FADEOUT_MS = 350;
const STORY_STEP0_HOLD_T = 0.32;
const TARGET_EPSILON = 1e-4;

const OPENER = 'Most products fail long before users ever see them.';

export default function StartGate({
  setProgressCap,
  setGlobalProgress,
  totalScenes = 5,
}: SceneProps) {
  const [showLoader, setShowLoader] = useState(true);
  const [isExiting, setIsExiting] = useState(false);
  const exitTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const loaderTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleEnter = useCallback(() => {
    if (isExiting) return;
    setIsExiting(true);
    setProgressCap?.(null);
    exitTimeoutRef.current = setTimeout(() => {
      const N = totalScenes;
      const sceneStart = 1 / N;
      const sceneLen = 1 / N;
      const totalSteps = story.lines.length + 1;
      const storyLocal = STORY_STEP0_HOLD_T / totalSteps;
      const target = sceneStart + storyLocal * sceneLen + TARGET_EPSILON;
      setGlobalProgress?.(target);
    }, FADEOUT_MS);
  }, [isExiting, setProgressCap, setGlobalProgress, totalScenes]);

  useEffect(() => {
    setProgressCap?.(START_GATE_CAP);
    return () => {
      setProgressCap?.(null);
      if (exitTimeoutRef.current) clearTimeout(exitTimeoutRef.current);
      if (loaderTimeoutRef.current) clearTimeout(loaderTimeoutRef.current);
    };
  }, [setProgressCap]);

  useEffect(() => {
    loaderTimeoutRef.current = setTimeout(() => setShowLoader(false), LOADER_DURATION_MS);
    return () => {
      if (loaderTimeoutRef.current) clearTimeout(loaderTimeoutRef.current);
    };
  }, []);

  return (
    <div className="relative flex min-h-screen w-full flex-col items-center justify-center bg-[#F5F5F7]">
      <AuroraBackdrop />
      <div
        className="relative z-10 flex w-full flex-col items-center justify-center py-16 transition-opacity duration-[350ms]"
        style={{ opacity: isExiting ? 0 : 1 }}
      >
        <div className="startgate-float">
          <TypeLine text={OPENER} />
        </div>
        <div className="mt-7 flex flex-col items-center gap-2.5">
          <HoldToBegin onComplete={handleEnter} durationMs={700} />
          <p className="text-xs" style={{ color: 'rgba(0,0,0,0.55)' }}>
            Hold, or press Enter
          </p>
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
        .startgate-float { animation: startgateFloat 7s ease-in-out infinite; }
        @keyframes startgateFloat {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-6px); }
        }
      `}</style>
    </div>
  );
}
