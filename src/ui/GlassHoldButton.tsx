'use client';

import type { HoldToAdvanceButtonProps } from './HoldToAdvanceButton';
import { HoldToAdvanceButton } from './HoldToAdvanceButton';

export function GlassHoldButton(props: Omit<HoldToAdvanceButtonProps, 'label'> & { label?: string }) {
  return <HoldToAdvanceButton label="Hold to begin" holdMs={2200} {...props} />;
}
