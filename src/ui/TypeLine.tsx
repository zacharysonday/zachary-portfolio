'use client';

import type { CSSProperties } from 'react';

const APPLE_DEFAULT_CLASS =
  'mx-auto max-w-[1200px] w-full px-6 text-center font-sans font-semibold text-[#0b0b0f] leading-[1.08] [text-wrap:balance]';

const APPLE_DEFAULT_STYLE: CSSProperties = {
  letterSpacing: '-0.03em',
  fontSize: 'clamp(40px,5.5vw,84px)',
  WebkitFontSmoothing: 'antialiased',
  MozOsxFontSmoothing: 'grayscale',
};

type TypeLineProps = {
  text: string;
  className?: string;
  style?: CSSProperties;
  as?: 'h1' | 'p';
};

export function TypeLine({
  text,
  className = '',
  style,
  as: Tag = 'h1',
}: TypeLineProps) {
  return (
    <Tag
      className={`${APPLE_DEFAULT_CLASS} ${className}`.trim()}
      style={{
        ...APPLE_DEFAULT_STYLE,
        ...style,
      }}
    >
      {text}
    </Tag>
  );
}
