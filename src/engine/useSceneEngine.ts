import type { RefObject } from 'react';
import { useCallback, useEffect, useRef, useState } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import type { ScrollTrigger as ScrollTriggerType } from 'gsap/ScrollTrigger';

import type { SceneDef, SeekOpts } from './types';

const clamp01 = (value: number) => {
  if (Number.isNaN(value)) return 0;
  if (value < 0) return 0;
  if (value > 1) return 1;
  return value;
};

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
}

export type SceneEngineReturn = {
  containerRef: RefObject<HTMLDivElement | null>;
  sceneIndex: number;
  sceneProgress: number;
  goToScene: (index: number) => void;
  setProgressCap: (cap: number | null) => void;
  setGlobalProgress: (p: number) => void;
  seekTo: (progress01: number, opts?: SeekOpts) => void;
  seekWithinScene: (sceneIndex: number, local01: number, opts?: SeekOpts) => void;
};

export function useSceneEngine(scenes: SceneDef[]): SceneEngineReturn {
  const containerRef = useRef<HTMLDivElement>(null);
  const scrollTriggerRef = useRef<ScrollTriggerType | null>(null);
  const progressCapRef = useRef<number | null>(null);

  const [sceneIndex, setSceneIndex] = useState(0);
  const [sceneProgress, setSceneProgress] = useState(0);

  const setProgressCap = useCallback((cap: number | null) => {
    progressCapRef.current = cap;
  }, []);

  const setGlobalProgress = useCallback(
    (p: number) => {
      if (typeof window === 'undefined') return;
      const st = scrollTriggerRef.current;
      if (!st) return;
      const pClamped = clamp01(p);
      const start = st.start ?? 0;
      const end = st.end ?? 1;
      const distance = end - start || 1;
      const scrollTop = start + distance * pClamped;
      window.scrollTo({ top: scrollTop, behavior: 'auto' });
    },
    [],
  );

  const seekTo = useCallback(
    (progress01: number, opts?: SeekOpts) => {
      if (typeof window === 'undefined') return;
      const st = scrollTriggerRef.current;
      if (!st) return;
      const p = clamp01(progress01);
      const start = st.start ?? 0;
      const end = st.end ?? 1;
      const distance = end - start || 1;
      const targetY = start + distance * p;
      const durationMs = opts?.duration ?? 0;
      if (durationMs <= 0) {
        window.scrollTo({ top: targetY, behavior: 'auto' });
        return;
      }
      const startY = window.scrollY ?? 0;
      const startT = performance.now();
      const ease = (t: number) => t;
      const tick = () => {
        const elapsed = performance.now() - startT;
        const t = Math.min(1, elapsed / durationMs);
        const eased = ease(t);
        const y = startY + (targetY - startY) * eased;
        window.scrollTo({ top: y, behavior: 'auto' });
        if (t < 1) requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
    },
    [],
  );

  const seekWithinScene = useCallback(
    (sceneIndex: number, local01: number, opts?: SeekOpts) => {
      if (scenes.length === 0) return;
      const totalDurationRaw = scenes.reduce(
        (sum, s) => sum + Math.max(s.duration, 0),
        0,
      );
      const totalDuration = totalDurationRaw <= 0 ? 1 : totalDurationRaw;
      let cumulative = 0;
      for (let i = 0; i < sceneIndex; i += 1) {
        cumulative += Math.max(scenes[i].duration, 0);
      }
      const sceneDuration = Math.max(scenes[sceneIndex]?.duration ?? 0, 0);
      const local = clamp01(local01);
      const position = cumulative + local * sceneDuration;
      const progress01 = position / totalDuration;
      seekTo(progress01, opts);
    },
    [scenes, seekTo],
  );

  useEffect(() => {
    if (!containerRef.current || scenes.length === 0 || typeof window === 'undefined') {
      return;
    }

    const totalDurationRaw = scenes.reduce((sum, scene) => sum + Math.max(scene.duration, 0), 0);
    const totalDuration = totalDurationRaw <= 0 ? 1 : totalDurationRaw;

    const updateFromProgress = (globalProgressRaw: number) => {
      const cap = progressCapRef.current;
      const rawClamped = clamp01(globalProgressRaw);
      const globalProgress = cap !== null ? Math.min(rawClamped, cap) : rawClamped;

      const position = globalProgress * totalDuration;

      let cumulative = 0;
      let activeIndex = scenes.length - 1;
      let localProgress = 1;

      for (let i = 0; i < scenes.length; i += 1) {
        const duration = Math.max(scenes[i].duration, 0);
        const nextCumulative = cumulative + duration;

        if (position <= nextCumulative || i === scenes.length - 1) {
          activeIndex = i;
          const span = duration <= 0 ? 1 : duration;
          const start = cumulative;
          localProgress = clamp01((position - start) / span);
          break;
        }

        cumulative = nextCumulative;
      }

      setSceneIndex(activeIndex);
      setSceneProgress(localProgress);
    };

    const trigger = ScrollTrigger.create({
      trigger: containerRef.current,
      start: 'top top',
      end: () => `+=${window.innerHeight * totalDuration}`,
      scrub: true,
      pin: true,
      anticipatePin: 1,
      onUpdate: (self) => {
        const cap = progressCapRef.current;
        const raw = self.progress ?? 0;
        const effective = cap !== null ? Math.min(raw, cap) : raw;
        if (effective < raw && typeof window !== 'undefined') {
          const start = trigger.start ?? 0;
          const end = trigger.end ?? 1;
          const distance = end - start || 1;
          window.scrollTo({ top: start + distance * effective, behavior: 'auto' });
        }
        updateFromProgress(effective);
      },
    });

    scrollTriggerRef.current = trigger;

    // Initialize once in case ScrollTrigger fires after a frame
    updateFromProgress(trigger.progress ?? 0);

    return () => {
      trigger.kill();
      scrollTriggerRef.current = null;
    };
  }, [scenes]);

  const goToScene = useCallback(
    (index: number) => {
      if (!scrollTriggerRef.current || scenes.length === 0 || typeof window === 'undefined') {
        return;
      }

      const clampedIndex = Math.min(Math.max(index, 0), scenes.length - 1);

      const totalDurationRaw = scenes.reduce((sum, scene) => sum + Math.max(scene.duration, 0), 0);
      const totalDuration = totalDurationRaw <= 0 ? 1 : totalDurationRaw;

      let offsetBefore = 0;
      for (let i = 0; i < clampedIndex; i += 1) {
        offsetBefore += Math.max(scenes[i].duration, 0);
      }

      const sceneDuration = Math.max(scenes[clampedIndex].duration, 0);
      const position = offsetBefore + sceneDuration * 0; // start of scene

      const targetProgress = clamp01(position / totalDuration);

      const trigger = scrollTriggerRef.current;
      const start = trigger.start ?? 0;
      const end = trigger.end ?? 1;
      const distance = end - start || 1;

      const targetScroll = start + distance * targetProgress;

      window.scrollTo({
        top: targetScroll,
        behavior: 'smooth',
      });
    },
    [scenes],
  );

  return {
    containerRef,
    sceneIndex,
    sceneProgress,
    goToScene,
    setProgressCap,
    setGlobalProgress,
    seekTo,
    seekWithinScene,
  };
}

