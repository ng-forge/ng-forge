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
 * Provides blocking, frame-boundary (rAF), and after-render timing.
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

    options.destroyRef.onDestroy(() => {
      this.abortController.abort();
    });
  }

  /** Executes a synchronous blocking effect. */
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
   * Defers effect to next rAF (~16ms), giving CD and the async field resolution
   * pipeline time to settle before the state machine continues.
   *
   * When `options.skipIf` returns `true`, the effect executes synchronously
   * (like `executeBlocking`), eliminating ~16ms of unnecessary delay when
   * the field pipeline has already settled (e.g. all components cached).
   */
  executeAtFrameBoundary<T>(effect: () => T, options?: { skipIf?: () => boolean }): Observable<T> {
    if (options?.skipIf?.()) {
      return this.executeBlocking(effect);
    }

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

  /** Executes effect after Angular's next render cycle via `afterNextRender`. */
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

      // afterNextRender can't be deregistered — AbortSignal makes the callback no-op
      return () => {
        local.abort();
      };
    });
  }
}

/** @internal */
export function createSideEffectScheduler(injector: Injector): SideEffectScheduler {
  const destroyRef = injector.get(DestroyRef);
  return new SideEffectScheduler({ injector, destroyRef });
}
