import { InjectionToken, Injector, Signal } from '@angular/core';
import { toObservable } from '@angular/core/rxjs-interop';
import { Observable, TimeoutError } from 'rxjs';
import { catchError, filter, map, scan, shareReplay, switchMap, take, timeout } from 'rxjs/operators';
import { EventBus } from '../../events/event.bus';
import { ComponentInitializedEvent } from '../../events/constants/component-initialized.event';
import { DynamicFormLogger } from '../../providers/features/logger/logger.token';
import type { Logger } from '../../providers/features/logger/logger.interface';
import { NoopLogger } from '../../providers/features/logger/noop-logger';

/**
 * Injection token for configuring the initialization timeout in milliseconds.
 * Defaults to 10 seconds. When the timeout is reached, a warning is logged
 * and (initialized) emits true as a best-effort fallback.
 */
export const INITIALIZATION_TIMEOUT_MS = new InjectionToken<number>('INITIALIZATION_TIMEOUT_MS', {
  providedIn: 'root',
  factory: () => 10_000,
});

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
    scan((count) => count + 1, 0),
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
    scan((count) => count + 1, 0),
    map((currentCount) => ({
      currentCount,
      expectedCount,
      isComplete: currentCount >= expectedCount,
    })),
  );
}

/**
 * Options for setting up initialization tracking.
 */
export interface InitializationTrackingOptions {
  eventBus: EventBus;
  totalComponentsCount: Signal<number>;
  injector: Injector;
  componentId: string;
}

/**
 * Creates an observable that tracks when all form components are initialized.
 * Uses shareReplay({ bufferSize: 1, refCount: false }) to ensure exactly one emission
 * that can be received by late subscribers and keeps the subscription alive.
 *
 * Includes a configurable timeout (default 10s via INITIALIZATION_TIMEOUT_MS)
 * so that (initialized) does not hang forever if a container component throws
 * before emitting its initialization event. On timeout, a warning is logged
 * and true is emitted as a best-effort fallback.
 *
 * @param options - Configuration options for initialization tracking
 * @returns Observable<boolean> that emits true when all components are initialized
 *
 * @example
 * ```typescript
 * const eventBus = inject(EventBus);
 * const totalComponents = computed(() => countContainerComponents(fields));
 *
 * readonly initialized$ = setupInitializationTracking({
 *   eventBus,
 *   totalComponentsCount: totalComponents,
 *   injector: this.injector,
 *   componentId: 'dynamic-form'
 * });
 * ```
 */
export function setupInitializationTracking(options: InitializationTrackingOptions): Observable<boolean> {
  const { eventBus, totalComponentsCount, injector, componentId } = options;

  let timeoutMs: number;
  try {
    timeoutMs = injector.get(INITIALIZATION_TIMEOUT_MS);
  } catch {
    timeoutMs = 10_000;
  }

  let logger: Logger;
  try {
    logger = injector.get(DynamicFormLogger);
  } catch {
    logger = new NoopLogger();
  }

  return toObservable(totalComponentsCount, { injector }).pipe(
    take(1),
    switchMap((count) => {
      let tracking$: Observable<boolean>;

      if (count === 1) {
        // Only dynamic-form component, emit immediately when it initializes
        tracking$ = eventBus.on<ComponentInitializedEvent>('component-initialized').pipe(
          filter((event) => event.componentType === 'dynamic-form' && event.componentId === componentId),
          map(() => true),
          take(1),
        );
      } else {
        tracking$ = createInitializationTracker(eventBus, count);
      }

      // Timeout guard: emit best-effort true if a container throws before initializing
      return tracking$.pipe(
        timeout(timeoutMs),
        catchError((error: unknown) => {
          if (error instanceof TimeoutError) {
            logger.warn(
              `[Dynamic Forms] Initialization timed out after ${timeoutMs}ms. ` +
                `Expected ${count} component(s) to initialize but not all reported in time. ` +
                'This may indicate a container component threw during initialization. ' +
                'Emitting (initialized) as best-effort.',
            );
            // Emit true as best-effort so consumers are not stuck waiting forever
            return [true] as Iterable<boolean>;
          }
          throw error;
        }),
      );
    }),
    shareReplay({ bufferSize: 1, refCount: false }),
  );
}
