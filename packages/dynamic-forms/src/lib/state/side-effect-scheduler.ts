import { afterNextRender, DestroyRef, Injector } from '@angular/core';
import { Observable, Subscriber } from 'rxjs';

/**
 * Options for side effect execution.
 *
 * @internal
 */
export interface SideEffectOptions {
  /** Injector for accessing Angular services */
  readonly injector: Injector;
  /** DestroyRef for cleanup on component destruction */
  readonly destroyRef: DestroyRef;
}

/**
 * Scheduler for managing side effect timing in the state machine.
 *
 * Provides three timing categories:
 * 1. **Blocking** - Effect must complete before next action
 * 2. **Frame Boundary** - Deferred to the next animation frame (`requestAnimationFrame`)
 * 3. **After Render** - Deferred until after Angular's render cycle
 *
 * This replaces scattered `afterNextRender` calls with controlled timing.
 *
 * @example
 * ```typescript
 * const scheduler = new SideEffectScheduler({ injector, destroyRef });
 *
 * // Synchronous blocking effect
 * scheduler.executeBlocking(() => {
 *   this.state.set({ type: 'teardown' });
 * }).subscribe();
 *
 * // Defer to after render
 * scheduler.executeAfterRender(() => {
 *   this.orchestrator.initialize();
 * }).subscribe();
 * ```
 *
 * @internal
 */
export class SideEffectScheduler {
  private readonly injector: Injector;
  private readonly abortController = new AbortController();

  /** Aborted when the owning component is destroyed. */
  private get destroyed(): boolean {
    return this.abortController.signal.aborted;
  }

  constructor(options: SideEffectOptions) {
    this.injector = options.injector;

    // Abort all pending effects when the component is destroyed
    options.destroyRef.onDestroy(() => {
      this.abortController.abort();
    });
  }

  /**
   * Executes a blocking side effect that must complete before proceeding.
   *
   * Returns an Observable that:
   * - Executes the effect synchronously
   * - Emits the effect's return value
   * - Completes immediately after
   *
   * Use for state changes that must be atomic.
   *
   * @param effect - Function to execute
   * @returns Observable that completes after effect executes
   */
  executeBlocking<T>(effect: () => T): Observable<T> {
    return new Observable((subscriber: Subscriber<T>) => {
      if (this.destroyed) {
        subscriber.complete();
        return;
      }

      try {
        const result = effect();
        subscriber.next(result);
        subscriber.complete();
      } catch (error) {
        subscriber.error(error);
      }
    });
  }

  /**
   * Executes a side effect at the next animation frame boundary.
   *
   * Uses `requestAnimationFrame` to defer the effect to the next browser paint frame (~16ms).
   * This provides enough time for Angular's change detection and the async field resolution
   * pipeline (`derivedFromDeferred`) to process pending changes before the state machine continues.
   *
   * Use for teardown timing where both DOM updates and async pipelines need to settle.
   *
   * @param effect - Function to execute at the next frame boundary
   * @returns Observable that completes after the effect executes
   */
  executeAtFrameBoundary<T>(effect: () => T): Observable<T> {
    return new Observable((subscriber: Subscriber<T>) => {
      if (this.destroyed) {
        subscriber.complete();
        return;
      }

      const frameId = requestAnimationFrame(() => {
        if (this.destroyed) {
          subscriber.complete();
          return;
        }

        try {
          const result = effect();
          subscriber.next(result);
          subscriber.complete();
        } catch (error) {
          subscriber.error(error);
        }
      });

      // Cleanup on unsubscribe
      return () => {
        cancelAnimationFrame(frameId);
      };
    });
  }

  /**
   * Executes a side effect after Angular's next render cycle.
   *
   * Wraps `afterNextRender` in an Observable for integration with RxJS streams.
   * The effect only runs after Angular has completed its change detection and
   * DOM updates for the current rendering cycle.
   *
   * Use for effects that depend on rendered DOM or component state.
   *
   * @param effect - Function to execute after render
   * @returns Observable that completes after render effect executes
   */
  executeAfterRender<T>(effect: () => T): Observable<T> {
    return new Observable((subscriber: Subscriber<T>) => {
      if (this.destroyed) {
        subscriber.complete();
        return;
      }

      const local = new AbortController();

      afterNextRender(
        () => {
          if (local.signal.aborted || this.destroyed) {
            subscriber.complete();
            return;
          }

          try {
            const result = effect();
            subscriber.next(result);
            subscriber.complete();
          } catch (error) {
            subscriber.error(error);
          }
        },
        { injector: this.injector },
      );

      // Cleanup on unsubscribe
      return () => {
        local.abort();
      };
    });
  }
}

/**
 * Creates a side effect scheduler for use in the state manager.
 *
 * @param injector - Injector for Angular service access
 * @returns Configured SideEffectScheduler instance
 *
 * @internal
 */
export function createSideEffectScheduler(injector: Injector): SideEffectScheduler {
  const destroyRef = injector.get(DestroyRef);
  return new SideEffectScheduler({ injector, destroyRef });
}
