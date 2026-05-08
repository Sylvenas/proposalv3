'use client';

import { useEffect } from 'react';

// Module-scoped reference counter so nested dialogs compose correctly. Without
// this, a stacked second dialog would capture `prev = 'hidden'` (set by the
// outer dialog) and on close restore the body to 'hidden', leaving the page
// permanently un-scrollable.
let lockCount = 0;
let savedOverflow = '';

/** Lock `<body>` scroll while `active` is true. Stacks safely — overflow only
 *  restores to its pre-lock value once every active locker has released. */
export function useBodyScrollLock(active: boolean): void {
  useEffect(() => {
    if (!active) return;
    if (lockCount === 0) {
      savedOverflow = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
    }
    lockCount++;
    return () => {
      lockCount--;
      if (lockCount === 0) {
        document.body.style.overflow = savedOverflow;
      }
    };
  }, [active]);
}
