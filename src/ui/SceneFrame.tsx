'use client';

import type { ReactNode } from 'react';

type SceneFrameProps = {
  children: ReactNode;
};

export function SceneFrame({ children }: SceneFrameProps) {
  return (
    <section className="flex min-h-screen w-full items-center justify-center px-6 py-16 text-center">
      <div className="mx-auto flex w-full max-w-3xl flex-col items-center justify-center gap-6">
        {children}
      </div>
    </section>
  );
}

