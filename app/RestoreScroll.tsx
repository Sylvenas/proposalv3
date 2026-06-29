'use client';

import { useEffect } from 'react';

/**
 * The root layout forces `body { overflow: hidden }` to prevent a scrollbar
 * flash before a page's CoverCurtain mounts; the curtain restores it on
 * dismiss. Pages without a CoverCurtain (e.g. this index) never get it
 * restored, so they can't scroll. This component restores it on mount.
 */
export default function RestoreScroll() {
  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'auto';
    return () => {
      document.body.style.overflow = prev;
    };
  }, []);

  return null;
}
