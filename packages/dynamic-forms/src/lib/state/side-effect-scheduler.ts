import { afterNextRender, DestroyRef, Injector } from '@angular/core';
import { Observable, Subscriber } from 'rxjs';

/**
 * Side effect timing categories for controlled execution.
 *
 * - **blocking**: Must complete before next action processes
 * - **frame-boundary**: Synchronizes with DOM via requestAnimationFrame
 * - **after-render**: Deferred until after Angular render cycle
 *
 * @internal
 */
export type SideEffectTiming = 'blocking' | 'frame-boundary' | 'after-render';

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
 * Result of a scheduled side effect.
 *
 * @internal
 */
export interface ScheduledEffect<T = void> {
  /** Observable that completes when effect finishes */
  readonly completed$: Observable<T>;
  /** Cancel the effect if not yet executed */
  readonly cancel: () => void;
}

/**
 * Scheduler for managing side effect timing in the state machine.
 *
 * Provides three timing categories:
 * 1. **Blocking** - Effect must complete before next action
 * 2. **Frame Boundary** - Waits for requestAnimationFrame (DOM sync)
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
 * // Wait for DOM destruction
 * scheduler.executeAtFrameBoundary(() => {
 *   this.state.set({ type: 'applying' });
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
  private readonly destroyRef: DestroyRef;
  private isDestroyed = false;

  constructor(options: SideEffectOptions) {
    this.injector = options.injector;
    this.destroyRef = options.destroyRef;

    // Track destruction to prevent effects from running after cleanup
    this.destroyRef.onDestroy(() => {
      this.isDestroyed = true;
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
      if (this.isDestroyed) {
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
   * Executes a side effect at the next frame boundary.
   *
   * Uses `requestAnimationFrame` to wait for the browser's next paint cycle.
   * This ensures DOM changes from previous state updates have been applied.
   *
   * Key use case: Waiting for Angular to destroy old components before
   * creating new form instances (prevents NG01902 orphan field errors).
   *
   * @param effect - Function to execute at frame boundary
   * @returns Observable that completes after frame boundary effect executes
   */
  executeAtFrameBoundary<T>(effect: () => T): Observable<T> {
    return new Observable((subscriber: Subscriber<T>) => {
      if (this.isDestroyed) {
        subscriber.complete();
        return;
      }

      const frameId = requestAnimationFrame(() => {
        if (this.isDestroyed) {
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
      if (this.isDestroyed) {
        subscriber.complete();
        return;
      }

      let cancelled = false;

      afterNextRender(
        () => {
          if (cancelled || this.isDestroyed) {
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
        cancelled = true;
      };
    });
  }

  /**
   * Executes effects in sequence with appropriate timing.
   *
   * Convenience method for chaining multiple effects with different
   * timing requirements.
   *
   * @param effects - Array of effect definitions with timing
   * @returns Observable that completes when all effects finish
   */
  executeSequence(effects: Array<{ timing: SideEffectTiming; effect: () => void }>): Observable<void> {
    if (effects.length === 0) {
      return this.executeBlocking(() => undefined);
    }

    return new Observable((subscriber: Subscriber<void>) => {
      let index = 0;

      const executeNext = (): void => {
        if (this.isDestroyed || index >= effects.length) {
          subscriber.next();
          subscriber.complete();
          return;
        }

        const { timing, effect } = effects[index];
        index++;

        const executor = this.getExecutor(timing);
        executor(() => {
          effect();
          executeNext();
        }).subscribe({
          error: (err) => subscriber.error(err),
        });
      };

      executeNext();
    });
  }

  /**
   * Gets the appropriate executor for a timing category.
   */
  private getExecutor(timing: SideEffectTiming): <T>(effect: () => T) => Observable<T> {
    switch (timing) {
      case 'blocking':
        return (effect) => this.executeBlocking(effect);
      case 'frame-boundary':
        return (effect) => this.executeAtFrameBoundary(effect);
      case 'after-render':
        return (effect) => this.executeAfterRender(effect);
    }
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
