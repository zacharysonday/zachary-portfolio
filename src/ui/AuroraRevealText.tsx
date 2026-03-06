'use client';

import { useMemo } from 'react';

const AURORA_GRADIENT =
  'linear-gradient(90deg, #ff4fd8 0%, #c85cff 18%, #7a6bff 36%, #3f86ff 52%, #2ed3ff 70%, #ffe08a 100%)';

type AuroraRevealTextProps = {
  text: string;
  /** 0..1, drive per-character aurora reveal (e.g. from hold progress) */
  progress: number;
  className?: string;
};

function clamp(value: number, min: number, max: number): number {
  if (value < min) return min;
  if (value > max) return max;
  return value;
}

function smoothstep(t: number): number {
  const x = clamp(t, 0, 1);
  return x * x * (3 - 2 * x);
}

export function AuroraRevealText({ text, progress, className = '' }: AuroraRevealTextProps) {
  const p = clamp(progress, 0, 1);
  const chars = useMemo(() => Array.from(text), [text]);
  const n = Math.max(1, chars.length);

  // Slightly wider window = smoother “wash” with less segmentation
  const windowSize = 0.16;
  const bgPositionX = 12 + p * 68;

  return (
    <h1
      className={`mx-auto max-w-[1100px] w-full px-6 text-center font-sans font-semibold tracking-tight text-[#0b0b0f] ${className}`}
      style={{
        letterSpacing: '-0.02em',
        lineHeight: 1.08,
        fontSize: 'clamp(40px, 5vw, 76px)',
        WebkitFontSmoothing: 'antialiased',
        MozOsxFontSmoothing: 'grayscale',
        fontKerning: 'normal',
        fontFeatureSettings: '"kern" 1, "liga" 1',
        whiteSpace: 'pre-wrap',
        WebkitTextSizeAdjust: '100%',
      }}
    >
      {chars.map((char, i) => {
        const x = n <= 1 ? 0.5 : i / (n - 1);

        const start = x - windowSize / 2;
        const end = x + windowSize / 2;
        const span = Math.max(1e-6, end - start);

        const raw = p === 0 ? 0 : clamp((p - start) / span, 0, 1);
        const reveal = smoothstep(raw);

        // Preserve spaces explicitly (prevents “Myjobis…” in some layouts)
        const safeChar = char === ' ' ? '\u00A0' : char;

        return (
          <span
            key={`${i}-${char}`}
            style={{
              display: 'inline-block',
              position: 'relative',
              // Prevent tiny spacing jitter between inline-block chars
              verticalAlign: 'baseline',
            }}
          >
            {/* Base layer: black, fades as gradient reveals */}
            <span style={{ color: '#0b0b0f', opacity: 1 - reveal }}>{safeChar}</span>

            {/* Overlay layer: always present (no conditional mount = smoother) */}
            <span
              aria-hidden
              style={{
                position: 'absolute',
                left: 0,
                top: 0,

                // Ensure overlay covers the glyph box
                width: '100%',
                height: '100%',

                color: 'transparent',
                backgroundImage: AURORA_GRADIENT,
                backgroundSize: '340% 100%',
                backgroundPosition: `${bgPositionX}% 50%`,

                backgroundClip: 'text',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',

                opacity: reveal,
                filter: 'saturate(1.08) contrast(1.03)',

                // Prevent selection weirdness + keep it clean
                pointerEvents: 'none',
                userSelect: 'none',
              }}
            >
              {safeChar}
            </span>
          </span>
        );
      })}
    </h1>
  );
}