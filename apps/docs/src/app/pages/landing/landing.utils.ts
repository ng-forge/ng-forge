import { Observable, fromEvent } from 'rxjs';
import { distinctUntilChanged, map, startWith } from 'rxjs/operators';

// ============================================
// SCROLL
// ============================================

/**
 * Emits whether the nav should appear "scrolled" (past a small threshold).
 */
export function navScrolled$(): Observable<boolean> {
  const navScrollThreshold = 50;
  return fromEvent(window, 'scroll', { passive: true }).pipe(
    startWith(null),
    map(() => window.scrollY > navScrollThreshold),
    distinctUntilChanged(),
  );
}

// ============================================
// HASH NAVIGATION
// ============================================

/**
 * Scrolls to a section based on the URL hash.
 */
export function scrollToHash(sectionIds: readonly string[], delayMs = 300): void {
  const hash = window.location.hash.slice(1);
  if (hash && sectionIds.includes(hash)) {
    setTimeout(() => {
      const element = document.getElementById(hash);
      element?.scrollIntoView({ behavior: 'smooth' });
    }, delayMs);
  }
}

// ============================================
// CLIPBOARD
// ============================================

/**
 * Copies text to the clipboard.
 */
export function copyToClipboard(text: string): Promise<void> {
  return navigator.clipboard.writeText(text);
}
