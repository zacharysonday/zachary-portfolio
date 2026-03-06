import type React from 'react';

export type SeekOpts = { duration?: number; ease?: string };

export type SceneProps = {
  progress: number;
  goNext: () => void;
  goPrev: () => void;
  setProgressCap?: (cap: number | null) => void;
  setGlobalProgress?: (p: number) => void;
  seekTo?: (progress01: number, opts?: SeekOpts) => void;
  seekWithinScene?: (sceneIndex: number, local01: number, opts?: SeekOpts) => void;
  totalScenes?: number;
};

export type SceneDef = {
  id: string;
  duration: number;
  Component: React.FC<SceneProps>;
};

