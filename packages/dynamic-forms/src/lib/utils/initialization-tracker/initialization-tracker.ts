import { Observable } from 'rxjs';
import { filter, map, scan } from 'rxjs/operators';
import { EventBus } from '../../events/event.bus';
import { ComponentInitializedEvent } from '../../events/constants/component-initialized.event';

/**
 * Creates an observable that tracks component initialization progress.
 *
 * This function returns an observable that emits when all expected components
 * have been initialized. It uses the scan operator to accumulate initialization
 * events and emits true when the count reaches the expected total.
 *
 * @param eventBus - The event bus instance to subscribe to
 * @param expectedCount - Total number of components expected to initialize
 * @returns Observable<boolean> that emits true when all components are initialized
 *
 * @example
 * ```typescript
 * const eventBus = inject(EventBus);
 * const totalComponents = 5; // 1 dynamic-form + 2 pages + 1 row + 1 group
 *
 * const allInitialized$ = createInitializationTracker(eventBus, totalComponents);
 *
 * allInitialized$.subscribe(isComplete => {
 *   if (isComplete) {
 *     console.log('All components are initialized!');
 *   }
 * });
 * ```
 */
export function createInitializationTracker(eventBus: EventBus, expectedCount: number): Observable<boolean> {
  return eventBus.on<ComponentInitializedEvent>('component-initialized').pipe(
    scan((count, _event) => count + 1, 0),
    map((currentCount) => currentCount >= expectedCount),
    filter((isComplete) => isComplete),
  );
}

/**
 * Creates an observable that tracks component initialization progress with detailed status.
 *
 * This function returns an observable that emits the current count and completion status
 * for each initialization event, providing more granular tracking capabilities.
 *
 * @param eventBus - The event bus instance to subscribe to
 * @param expectedCount - Total number of components expected to initialize
 * @returns Observable with current count, expected count, and completion status
 *
 * @example
 * ```typescript
 * const eventBus = inject(EventBus);
 * const totalComponents = 5;
 *
 * const progress$ = createDetailedInitializationTracker(eventBus, totalComponents);
 *
 * progress$.subscribe(({ currentCount, expectedCount, isComplete }) => {
 *   console.log(`Progress: ${currentCount}/${expectedCount} (${isComplete ? 'Complete' : 'In Progress'})`);
 * });
 * ```
 */
export function createDetailedInitializationTracker(
  eventBus: EventBus,
  expectedCount: number,
): Observable<{ currentCount: number; expectedCount: number; isComplete: boolean }> {
  return eventBus.on<ComponentInitializedEvent>('component-initialized').pipe(
    scan((count, _event) => count + 1, 0),
    map((currentCount) => ({
      currentCount,
      expectedCount,
      isComplete: currentCount >= expectedCount,
    })),
  );
}
