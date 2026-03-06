'use client';

import type { SceneProps } from '@/engine/types';
import { SceneFrame } from '@/ui/SceneFrame';

export default function End({ progress, goNext, goPrev }: SceneProps) {
  return (
    <SceneFrame>
      <h1 className="text-4xl font-semibold tracking-tight text-neutral-900 sm:text-5xl">
        End Scene
      </h1>
      <p className="max-w-xl text-sm text-neutral-500">
        A closing call-to-action that invites the viewer to get in touch.
      </p>
      <p className="text-xs text-neutral-400">Progress: {progress.toFixed(2)}</p>
      <div className="mt-4 flex gap-3">
        <button
          type="button"
          onClick={goPrev}
          className="rounded-full border border-neutral-300 px-4 py-1 text-xs text-neutral-700 hover:bg-neutral-50"
        >
          Previous
        </button>
        <button
          type="button"
          onClick={goNext}
          className="rounded-full bg-neutral-900 px-4 py-1 text-xs text-white hover:bg-neutral-800"
        >
          Next
        </button>
      </div>
      <p className="mt-4 text-xs text-neutral-400">Progress across story: {progress.toFixed(2)}</p>
    </SceneFrame>
  );
}

