import { InjectionToken, Injector, Signal } from '@angular/core';
import { toObservable } from '@angular/core/rxjs-interop';
import { Observable, of, throwError, TimeoutError } from 'rxjs';
import { catchError, filter, map, scan, shareReplay, switchMap, take, timeout } from 'rxjs/operators';
import { EventBus } from '../../events/event.bus';
import { ComponentInitializedEvent } from '../../events/constants/component-initialized.event';
import { DynamicFormLogger } from '../../providers/features/logger/logger.token';

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
 * Emits once with `true` when `expectedCount` component-initialized events have
 * been seen on the bus. Used internally by {@link setupInitializationTracking}
 * and kept as a named export for focused unit testing.
 */
export function createInitializationTracker(eventBus: EventBus, expectedCount: number): Observable<boolean> {
  return eventBus.on<ComponentInitializedEvent>('component-initialized').pipe(
    scan((count) => count + 1, 0),
    map((currentCount) => currentCount >= expectedCount),
    filter((isComplete) => isComplete),
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

  const timeoutMs = injector.get(INITIALIZATION_TIMEOUT_MS);
  const logger = injector.get(DynamicFormLogger);

  return toObservable(totalComponentsCount, { injector }).pipe(
    take(1),
    switchMap((count) => {
      const tracking$: Observable<boolean> =
        count === 1
          ? // Only dynamic-form component, emit immediately when it initializes
            eventBus.on<ComponentInitializedEvent>('component-initialized').pipe(
              filter((event) => event.componentType === 'dynamic-form' && event.componentId === componentId),
              map(() => true),
              take(1),
            )
          : createInitializationTracker(eventBus, count);

      // Timeout guard: emit best-effort true if a container throws before initializing
      return tracking$.pipe(
        timeout(timeoutMs),
        catchError((error: unknown) => {
          if (error instanceof TimeoutError) {
            logger.warn(
              `Initialization timed out after ${timeoutMs}ms. ` +
                `Expected ${count} component(s) to initialize but not all reported in time. ` +
                'This may indicate a container component threw during initialization. ' +
                'Emitting (initialized) as best-effort.',
            );
            // Emit true as best-effort so consumers are not stuck waiting forever
            return of(true);
          }
          return throwError(() => error);
        }),
      );
    }),
    shareReplay({ bufferSize: 1, refCount: false }),
  );
}
