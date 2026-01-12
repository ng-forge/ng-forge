import { Observable, animationFrameScheduler, fromEvent, interval } from 'rxjs';
import { debounceTime, distinctUntilChanged, filter, map, scan, share, startWith, tap, withLatestFrom } from 'rxjs/operators';
import { FIREFLY_CONFIG, SCROLL_SNAP_CONFIG, type FireflyPosition, type Spark } from './landing.constants';

// ============================================
// INTERSECTION OBSERVER OBSERVABLE
// ============================================

export interface IntersectionEntry {
  target: Element;
  isIntersecting: boolean;
  intersectionRatio: number;
}

/**
 * Creates an Observable that emits when elements intersect with the viewport.
 */
export function fromIntersectionObserver(
  elements: Element[],
  options: IntersectionObserverInit = { threshold: 0.1 },
): Observable<IntersectionEntry[]> {
  return new Observable<IntersectionEntry[]>((subscriber) => {
    const observer = new IntersectionObserver((entries) => {
      const mapped = entries.map((entry) => ({
        target: entry.target,
        isIntersecting: entry.isIntersecting,
        intersectionRatio: entry.intersectionRatio,
      }));
      subscriber.next(mapped);
    }, options);

    elements.forEach((el) => observer.observe(el));

    return () => observer.disconnect();
  });
}

// ============================================
// SCROLL OBSERVABLES
// ============================================

/**
 * Creates an Observable for window scroll events with passive option.
 */
export function windowScroll$(): Observable<Event> {
  return fromEvent(window, 'scroll', { passive: true });
}

/**
 * Creates an Observable that emits whether the nav should appear scrolled.
 */
export function navScrolled$(): Observable<boolean> {
  return windowScroll$().pipe(
    startWith(null),
    map(() => window.scrollY > SCROLL_SNAP_CONFIG.navScrollThreshold),
    distinctUntilChanged(),
  );
}

/**
 * Creates an Observable that emits scroll progress as a percentage (0-100).
 */
export function scrollProgress$(): Observable<number> {
  return windowScroll$().pipe(
    startWith(null),
    map(() => {
      const scrollTop = window.scrollY;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      return docHeight > 0 ? Math.min(100, (scrollTop / docHeight) * 100) : 0;
    }),
  );
}

// ============================================
// SCROLL SNAP UTILITIES
// ============================================

export interface SnapTarget {
  element: HTMLElement;
  rect: DOMRect;
  isHero: boolean;
  fitsInViewport: boolean;
}

/**
 * Gets all snap target elements.
 */
export function getSnapTargets(): HTMLElement[] {
  const hero = document.querySelector('.hero') as HTMLElement;
  const sections = Array.from(document.querySelectorAll('section[id]')) as HTMLElement[];
  const footer = document.querySelector('footer') as HTMLElement;
  return [hero, ...sections, footer].filter(Boolean);
}

/**
 * Finds the closest snap target based on current scroll position.
 */
export function findClosestSnapTarget(): HTMLElement | null {
  const targets = getSnapTargets();
  const viewportHeight = window.innerHeight;
  const snapThreshold = viewportHeight * SCROLL_SNAP_CONFIG.viewportThresholdRatio;

  let closest: HTMLElement | null = null;
  let closestDistance = Infinity;

  for (const target of targets) {
    const rect = target.getBoundingClientRect();
    const targetTop = rect.top;
    const isHero = target.classList.contains('hero');
    const sectionFitsInViewport = rect.height <= viewportHeight * SCROLL_SNAP_CONFIG.tallSectionRatio;

    // For tall sections: only snap when approaching (targetTop between 0 and threshold)
    // Don't snap if we've scrolled into it (targetTop < 0)
    if (!sectionFitsInViewport && targetTop < 0 && !isHero) {
      continue;
    }

    // Hero only snaps when very close to top (scrolling back up)
    const threshold = isHero ? SCROLL_SNAP_CONFIG.heroThreshold : snapThreshold;

    // Check if the top of the section is close to the viewport top
    if (targetTop >= 0 && targetTop < threshold && targetTop < closestDistance) {
      closestDistance = targetTop;
      closest = target;
    }
  }

  return closest;
}

/**
 * Performs the snap scroll to a target element.
 */
export function snapToTarget(target: HTMLElement): void {
  const targetRect = target.getBoundingClientRect();
  const targetTop = window.scrollY + targetRect.top - SCROLL_SNAP_CONFIG.navOffset;
  const isHero = target.classList.contains('hero');
  const scrollTo = isHero ? 0 : Math.max(0, targetTop);

  window.scrollTo({ top: scrollTo, behavior: 'smooth' });
}

/**
 * Creates a scroll snap Observable that handles debounced snap behavior.
 * Consumer should handle cleanup with takeUntilDestroyed.
 */
export function scrollSnap$(): Observable<HTMLElement> {
  let isSnapping = false;

  return windowScroll$().pipe(
    filter(() => !isSnapping),
    debounceTime(SCROLL_SNAP_CONFIG.debounceMs),
    map(() => findClosestSnapTarget()),
    filter((target): target is HTMLElement => target !== null),
    tap((target) => {
      isSnapping = true;
      snapToTarget(target);
      setTimeout(() => {
        isSnapping = false;
      }, SCROLL_SNAP_CONFIG.snapDuration);
    }),
  );
}

// ============================================
// MOUSE TRACKING
// ============================================

export interface MousePosition {
  x: number;
  y: number;
}

/**
 * Creates an Observable for mouse position.
 */
export function mousePosition$(): Observable<MousePosition> {
  return fromEvent<MouseEvent>(window, 'mousemove', { passive: true }).pipe(
    map((e) => ({ x: e.clientX, y: e.clientY })),
    startWith({ x: -1000, y: -1000 }),
    share(),
  );
}

// ============================================
// ANIMATION FRAME OBSERVABLE
// ============================================

/**
 * Creates an Observable that emits on every animation frame.
 */
export function animationFrames$(): Observable<number> {
  return interval(0, animationFrameScheduler);
}

// ============================================
// FIREFLY ANIMATION
// ============================================

export interface FireflyState {
  positions: FireflyPosition[];
  sparks: Spark[];
}

/**
 * Initializes firefly positions in a grid pattern to avoid clustering.
 */
export function initializeFireflyPositions(): FireflyPosition[] {
  const { count, gridCols } = FIREFLY_CONFIG;
  const rows = Math.ceil(count / gridCols);
  const cellWidth = window.innerWidth / gridCols;
  const cellHeight = window.innerHeight / rows;

  return Array.from({ length: count }, (_, i) => {
    const col = i % gridCols;
    const row = Math.floor(i / gridCols);
    const x = cellWidth * col + cellWidth * 0.2 + Math.random() * cellWidth * 0.6;
    const y = cellHeight * row + cellHeight * 0.2 + Math.random() * cellHeight * 0.6;
    return { x, y, vx: 0, vy: 0, baseX: x, baseY: y };
  });
}

/**
 * Calculates the next state for a single firefly.
 */
function updateFirefly(firefly: FireflyPosition, mousePos: MousePosition, allPositions: FireflyPosition[], index: number): FireflyPosition {
  const { mouseRadius, returnForce, friction, scatterForce, repulsionRadius, repulsionForce, randomDrift } = FIREFLY_CONFIG;

  let { x, y, vx, vy } = firefly;
  const { baseX, baseY } = firefly;

  // Calculate distance from mouse
  const dx = x - mousePos.x;
  const dy = y - mousePos.y;
  const dist = Math.sqrt(dx * dx + dy * dy);

  // Scatter away from mouse (soft push)
  if (dist < mouseRadius && dist > 0) {
    const force = (mouseRadius - dist) / mouseRadius;
    vx += (dx / dist) * force * scatterForce;
    vy += (dy / dist) * force * scatterForce;
  }

  // Repulsion from other fireflies to prevent clustering
  for (let j = 0; j < allPositions.length; j++) {
    if (index === j) continue;
    const other = allPositions[j];
    const repDx = x - other.x;
    const repDy = y - other.y;
    const repDist = Math.sqrt(repDx * repDx + repDy * repDy);

    if (repDist < repulsionRadius && repDist > 0) {
      const repForce = (repulsionRadius - repDist) / repulsionRadius;
      vx += (repDx / repDist) * repForce * repulsionForce;
      vy += (repDy / repDist) * repForce * repulsionForce;
    }
  }

  // Gentle drift back to base position
  vx += (baseX - x) * returnForce;
  vy += (baseY - y) * returnForce;

  // Subtle random drift
  vx += (Math.random() - 0.5) * randomDrift;
  vy += (Math.random() - 0.5) * randomDrift;

  // Apply friction
  vx *= friction;
  vy *= friction;

  // Update position
  x += vx;
  y += vy;

  return { x, y, vx, vy, baseX, baseY };
}

/**
 * Generates sparks when fireflies are close to each other.
 */
function generateSparks(positions: FireflyPosition[]): Spark[] {
  const { sparkDistance, sparkProbability } = FIREFLY_CONFIG;
  const newSparks: Spark[] = [];

  for (let i = 0; i < positions.length; i++) {
    for (let j = i + 1; j < positions.length; j++) {
      const p1 = positions[i];
      const p2 = positions[j];
      const dx = p1.x - p2.x;
      const dy = p1.y - p2.y;
      const dist = Math.sqrt(dx * dx + dy * dy);

      if (dist < sparkDistance && Math.random() < sparkProbability) {
        newSparks.push({
          x: (p1.x + p2.x) / 2,
          y: (p1.y + p2.y) / 2,
          opacity: 1,
        });
      }
    }
  }

  return newSparks;
}

/**
 * Updates sparks by fading them out.
 */
function updateSparks(sparks: Spark[], newSparks: Spark[]): Spark[] {
  const { sparkFadeRate, maxSparks } = FIREFLY_CONFIG;
  return [...sparks, ...newSparks]
    .map((spark) => ({ ...spark, opacity: spark.opacity - sparkFadeRate }))
    .filter((spark) => spark.opacity > 0)
    .slice(-maxSparks);
}

/**
 * Creates an Observable for window resize events.
 */
function windowResize$(): Observable<{ width: number; height: number }> {
  return fromEvent(window, 'resize', { passive: true }).pipe(
    debounceTime(100),
    map(() => ({ width: window.innerWidth, height: window.innerHeight })),
    startWith({ width: window.innerWidth, height: window.innerHeight }),
  );
}

/**
 * Recalculates base positions for fireflies when viewport changes.
 * Scales positions proportionally to maintain relative placement.
 */
function recalculateBasePositions(
  positions: FireflyPosition[],
  newWidth: number,
  newHeight: number,
  oldWidth: number,
  oldHeight: number,
): FireflyPosition[] {
  const scaleX = newWidth / oldWidth;
  const scaleY = newHeight / oldHeight;

  return positions.map((firefly) => {
    const baseX = firefly.baseX * scaleX;
    const baseY = firefly.baseY * scaleY;

    return {
      ...firefly,
      baseX,
      baseY,
      // Scale current position proportionally
      x: firefly.x * scaleX,
      y: firefly.y * scaleY,
    };
  });
}

/**
 * Internal state for the firefly animation scan operator.
 */
interface FireflyAnimationState {
  positions: FireflyPosition[];
  sparks: Spark[];
  lastWidth: number;
  lastHeight: number;
}

/**
 * Creates a stateful firefly animation Observable using scan for pure state management.
 * Consumer should handle cleanup with takeUntilDestroyed.
 */
export function createFireflyAnimation(mouse$: Observable<MousePosition>): Observable<FireflyState> {
  const resize$ = windowResize$();

  const initialState: FireflyAnimationState = {
    positions: initializeFireflyPositions(),
    sparks: [],
    lastWidth: window.innerWidth,
    lastHeight: window.innerHeight,
  };

  return animationFrames$().pipe(
    withLatestFrom(mouse$, resize$),
    scan((state: FireflyAnimationState, [, mousePos, viewport]) => {
      let { positions, sparks, lastWidth, lastHeight } = state;

      // Check if viewport changed
      if (viewport.width !== lastWidth || viewport.height !== lastHeight) {
        positions = recalculateBasePositions(positions, viewport.width, viewport.height, lastWidth, lastHeight);
        lastWidth = viewport.width;
        lastHeight = viewport.height;
      }

      // Update firefly positions
      positions = positions.map((firefly, i) => updateFirefly(firefly, mousePos, positions, i));

      // Generate and update sparks
      const newSparks = generateSparks(positions);
      sparks = updateSparks(sparks, newSparks);

      return { positions, sparks, lastWidth, lastHeight };
    }, initialState),
    map((state) => ({ positions: state.positions, sparks: state.sparks })),
  );
}

// ============================================
// HASH NAVIGATION
// ============================================

/**
 * Scrolls to a section based on URL hash.
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
 * Copies text to clipboard and returns a promise.
 */
export function copyToClipboard(text: string): Promise<void> {
  return navigator.clipboard.writeText(text);
}
