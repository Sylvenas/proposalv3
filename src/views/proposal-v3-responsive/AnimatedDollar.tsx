'use client';

// ── AnimatedDollar ────────────────────────────────────────────────────────────
// Tiny shared helper for tween-animating numeric values into formatted dollar
// strings (e.g. "$3,856.32"). Used by Summary, Project Hub, and the Make A
// Payment dialog so amounts ease between values instead of snap-changing.

import { useEffect, useRef, useState } from 'react';

const DURATION_MS = 500;

function fmtDollars(n: number, decimals = 0): string {
  return (
    '$' +
    n.toLocaleString('en-US', {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
    })
  );
}

export function useAnimatedNumber(target: number): number {
  const [displayed, setDisplayed] = useState(target);
  const displayedRef = useRef(target);
  const rafRef = useRef<number | null>(null);
  const isFirst = useRef(true);

  useEffect(() => {
    if (isFirst.current) {
      isFirst.current = false;
      displayedRef.current = target;
      setDisplayed(target);
      return;
    }

    const from = displayedRef.current;
    const to = target;
    if (Math.abs(from - to) < 0.005) return;

    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    const startTime = performance.now();

    const animate = (now: number) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / DURATION_MS, 1);
      const eased = 1 - Math.pow(1 - progress, 3); // ease-out cubic
      const current = from + (to - from) * eased;
      displayedRef.current = current;
      setDisplayed(current);
      if (progress < 1) {
        rafRef.current = requestAnimationFrame(animate);
      } else {
        displayedRef.current = to;
        setDisplayed(to);
      }
    };

    rafRef.current = requestAnimationFrame(animate);
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [target]);

  return displayed;
}

export function AnimatedDollar({
  value,
  decimals = 0,
  suffix = '',
  className,
  style,
}: {
  value: number;
  decimals?: number;
  suffix?: string;
  className?: string;
  style?: React.CSSProperties;
}) {
  const displayed = useAnimatedNumber(value);
  return (
    <span className={className} style={style}>
      {fmtDollars(displayed, decimals) + suffix}
    </span>
  );
}
