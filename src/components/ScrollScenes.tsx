'use client';

import { useEffect, useMemo } from 'react';

import { useSceneEngine } from '@/engine/useSceneEngine';
import type { SceneDef } from '@/engine/types';
import { story } from '@/content/story';
import End from '@/scenes/End';
import IntroGate from '@/scenes/IntroGate';
import ProductSystem from '@/scenes/ProductSystem';
import Story from '@/scenes/Story';
import Work from '@/scenes/Work';

const STORY_HOLD_T = 0.32;

export default function ScrollScenes() {
  const scenes: SceneDef[] = useMemo(
    () => [
      { id: 'intro', duration: 1, Component: IntroGate },
      { id: 'story', duration: 1, Component: Story },
      { id: 'system', duration: 1, Component: ProductSystem },
      { id: 'work', duration: 1, Component: Work },
      { id: 'end', duration: 1, Component: End },
    ],
    [],
  );

  const {
    containerRef,
    sceneIndex,
    sceneProgress,
    goToScene,
    setProgressCap,
    setGlobalProgress,
    seekTo,
    seekWithinScene,
  } = useSceneEngine(scenes);

  const active = scenes[sceneIndex] ?? scenes[0];
  const ActiveComponent = active.Component;

  const goNext = () => {
    const nextIndex = Math.min(sceneIndex + 1, scenes.length - 1);
    if (nextIndex !== sceneIndex) goToScene(nextIndex);
  };

  const goPrev = () => {
    const prevIndex = Math.max(sceneIndex - 1, 0);
    if (prevIndex !== sceneIndex) goToScene(prevIndex);
  };

  useEffect(() => {
    if (sceneIndex !== 1) return;
    const totalSteps = story.lines.length + 1;
    const stepIndex = Math.min(
      Math.floor(sceneProgress * totalSteps),
      totalSteps - 1,
    );
    // CTA step: hold button handles keys and goNext; do not advance on key here
    if (stepIndex >= totalSteps - 1) return;

    const onKey = (e: KeyboardEvent) => {
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
      const nextStepLocal = (stepIndex + 1 + STORY_HOLD_T) / totalSteps;
      seekWithinScene?.(1, nextStepLocal);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [sceneIndex, sceneProgress, seekWithinScene]);

  return (
    <main className="min-h-screen w-full bg-[#F5F5F7] text-neutral-900">
      <div ref={containerRef} className="relative h-screen w-full">
        <ActiveComponent
          progress={sceneProgress}
          goNext={goNext}
          goPrev={goPrev}
          setProgressCap={setProgressCap}
          setGlobalProgress={setGlobalProgress}
          seekTo={seekTo}
          seekWithinScene={seekWithinScene}
          totalScenes={scenes.length}
        />
      </div>
    </main>
  );
}
