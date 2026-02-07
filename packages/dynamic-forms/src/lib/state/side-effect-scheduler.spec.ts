import { describe, it, expect, beforeEach, vi } from 'vitest';
import { Component, DestroyRef, Injector } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { firstValueFrom } from 'rxjs';
import { SideEffectScheduler, createSideEffectScheduler } from './side-effect-scheduler';

/**
 * Helper: creates a scheduler using Angular's DI so that DestroyRef and Injector
 * are real Angular-managed instances. Returns the scheduler and the injector's
 * DestroyRef (so the test can trigger destruction).
 */
function createSchedulerWithDI(): { scheduler: SideEffectScheduler; destroyRef: DestroyRef; injector: Injector } {
  const injector = TestBed.inject(Injector);
  const destroyRef = injector.get(DestroyRef);
  const scheduler = new SideEffectScheduler({ injector, destroyRef });
  return { scheduler, destroyRef, injector };
}

/**
 * Helper: creates a controllable DestroyRef mock so tests can trigger
 * destruction explicitly without resetting TestBed.
 */
function createMockDestroyRef(): { destroyRef: DestroyRef; triggerDestroy: () => void } {
  const callbacks: Array<() => void> = [];
  const destroyRef = {
    onDestroy: (cb: () => void) => {
      callbacks.push(cb);
      // noop unregister
      return () => undefined;
    },
  } as unknown as DestroyRef;

  return {
    destroyRef,
    triggerDestroy: () => callbacks.forEach((cb) => cb()),
  };
}

/** Helper: waits for the next animation frame to complete. */
function waitForAnimationFrame(): Promise<void> {
  return new Promise((resolve) => requestAnimationFrame(() => resolve()));
}

describe('SideEffectScheduler', () => {
  describe('createSideEffectScheduler factory', () => {
    it('should create a SideEffectScheduler from an injector', () => {
      const injector = TestBed.inject(Injector);
      const scheduler = createSideEffectScheduler(injector);
      expect(scheduler).toBeInstanceOf(SideEffectScheduler);
    });

    it('should produce a functional scheduler that can execute effects', async () => {
      const injector = TestBed.inject(Injector);
      const scheduler = createSideEffectScheduler(injector);
      const result = await firstValueFrom(scheduler.executeBlocking(() => 42));
      expect(result).toBe(42);
    });
  });

  describe('executeBlocking', () => {
    let scheduler: SideEffectScheduler;

    beforeEach(() => {
      ({ scheduler } = createSchedulerWithDI());
    });

    it('should emit the effect result synchronously and complete', () => {
      const next = vi.fn();
      const complete = vi.fn();

      scheduler.executeBlocking(() => 'hello').subscribe({ next, complete });

      expect(next).toHaveBeenCalledOnce();
      expect(next).toHaveBeenCalledWith('hello');
      expect(complete).toHaveBeenCalledOnce();
    });

    it('should handle different return types', () => {
      const objectResult = { key: 'value' };
      const next = vi.fn();

      scheduler.executeBlocking(() => objectResult).subscribe({ next });

      expect(next).toHaveBeenCalledWith(objectResult);
    });

    it('should propagate errors thrown by the effect', () => {
      const error = vi.fn();
      const testError = new Error('effect failed');

      scheduler
        .executeBlocking(() => {
          throw testError;
        })
        .subscribe({ error });

      expect(error).toHaveBeenCalledOnce();
      expect(error).toHaveBeenCalledWith(testError);
    });

    it('should complete without emitting when destroyed', () => {
      const { destroyRef, triggerDestroy } = createMockDestroyRef();
      const injector = TestBed.inject(Injector);
      const destroyedScheduler = new SideEffectScheduler({ injector, destroyRef });

      triggerDestroy();

      const next = vi.fn();
      const complete = vi.fn();

      destroyedScheduler.executeBlocking(() => 'should not emit').subscribe({ next, complete });

      expect(next).not.toHaveBeenCalled();
      expect(complete).toHaveBeenCalledOnce();
    });

    it('should not call the effect function when destroyed', () => {
      const { destroyRef, triggerDestroy } = createMockDestroyRef();
      const injector = TestBed.inject(Injector);
      const destroyedScheduler = new SideEffectScheduler({ injector, destroyRef });

      triggerDestroy();

      const effectFn = vi.fn(() => 'result');
      destroyedScheduler.executeBlocking(effectFn).subscribe();

      expect(effectFn).not.toHaveBeenCalled();
    });
  });

  describe('executeAtFrameBoundary', () => {
    let scheduler: SideEffectScheduler;

    beforeEach(() => {
      ({ scheduler } = createSchedulerWithDI());
    });

    it('should defer execution to requestAnimationFrame and emit result', async () => {
      const next = vi.fn();
      const complete = vi.fn();

      scheduler.executeAtFrameBoundary(() => 'deferred').subscribe({ next, complete });

      // Effect should not have executed synchronously
      expect(next).not.toHaveBeenCalled();

      await waitForAnimationFrame();

      expect(next).toHaveBeenCalledOnce();
      expect(next).toHaveBeenCalledWith('deferred');
      expect(complete).toHaveBeenCalledOnce();
    });

    it('should propagate errors from the effect inside rAF', async () => {
      const error = vi.fn();
      const testError = new Error('rAF effect failed');

      scheduler
        .executeAtFrameBoundary(() => {
          throw testError;
        })
        .subscribe({ error });

      await waitForAnimationFrame();

      expect(error).toHaveBeenCalledOnce();
      expect(error).toHaveBeenCalledWith(testError);
    });

    describe('skipIf option', () => {
      it('should execute synchronously (like blocking) when skipIf returns true', () => {
        const next = vi.fn();
        const complete = vi.fn();

        scheduler.executeAtFrameBoundary(() => 'immediate', { skipIf: () => true }).subscribe({ next, complete });

        // Should have executed synchronously
        expect(next).toHaveBeenCalledOnce();
        expect(next).toHaveBeenCalledWith('immediate');
        expect(complete).toHaveBeenCalledOnce();
      });

      it('should defer to rAF when skipIf returns false', async () => {
        const next = vi.fn();

        scheduler.executeAtFrameBoundary(() => 'deferred', { skipIf: () => false }).subscribe({ next });

        expect(next).not.toHaveBeenCalled();

        await waitForAnimationFrame();

        expect(next).toHaveBeenCalledOnce();
        expect(next).toHaveBeenCalledWith('deferred');
      });

      it('should defer to rAF when skipIf is not provided', async () => {
        const next = vi.fn();

        scheduler.executeAtFrameBoundary(() => 'deferred').subscribe({ next });

        expect(next).not.toHaveBeenCalled();

        await waitForAnimationFrame();

        expect(next).toHaveBeenCalledOnce();
      });
    });

    describe('destroyed state', () => {
      it('should complete without emitting when destroyed before rAF fires', () => {
        const { destroyRef, triggerDestroy } = createMockDestroyRef();
        const injector = TestBed.inject(Injector);
        const destroyedScheduler = new SideEffectScheduler({ injector, destroyRef });

        triggerDestroy();

        const next = vi.fn();
        const complete = vi.fn();

        destroyedScheduler.executeAtFrameBoundary(() => 'nope').subscribe({ next, complete });

        expect(next).not.toHaveBeenCalled();
        expect(complete).toHaveBeenCalledOnce();
      });

      it('should complete without emitting when destroyed during rAF callback', async () => {
        const { destroyRef, triggerDestroy } = createMockDestroyRef();
        const injector = TestBed.inject(Injector);
        const lateDestroyScheduler = new SideEffectScheduler({ injector, destroyRef });

        const next = vi.fn();
        const complete = vi.fn();

        lateDestroyScheduler.executeAtFrameBoundary(() => 'nope').subscribe({ next, complete });

        // Destroy after subscription but before rAF fires
        triggerDestroy();

        await waitForAnimationFrame();

        expect(next).not.toHaveBeenCalled();
        expect(complete).toHaveBeenCalledOnce();
      });

      it('should not call the effect function when destroyed during rAF callback', async () => {
        const { destroyRef, triggerDestroy } = createMockDestroyRef();
        const injector = TestBed.inject(Injector);
        const lateDestroyScheduler = new SideEffectScheduler({ injector, destroyRef });

        const effectFn = vi.fn(() => 'result');

        lateDestroyScheduler.executeAtFrameBoundary(effectFn).subscribe();

        triggerDestroy();

        await waitForAnimationFrame();

        expect(effectFn).not.toHaveBeenCalled();
      });
    });

    describe('unsubscribe cleanup', () => {
      it('should cancel the rAF when unsubscribed before it fires', async () => {
        const effectFn = vi.fn(() => 'result');

        const subscription = scheduler.executeAtFrameBoundary(effectFn).subscribe();

        // Unsubscribe immediately (before rAF fires)
        subscription.unsubscribe();

        await waitForAnimationFrame();

        // Effect should not have run because the rAF was cancelled
        expect(effectFn).not.toHaveBeenCalled();
      });
    });
  });

  describe('executeAfterRender', () => {
    /**
     * afterNextRender requires Angular's rendering pipeline to fire.
     * We create a minimal component and trigger change detection.
     */

    @Component({ template: '' })
    class TestHostComponent {}

    it('should emit the effect result after Angular render', async () => {
      const fixture = TestBed.createComponent(TestHostComponent);
      const injector = fixture.componentRef.injector;
      const destroyRef = injector.get(DestroyRef);
      const scheduler = new SideEffectScheduler({ injector, destroyRef });

      const resultPromise = firstValueFrom(scheduler.executeAfterRender(() => 'rendered'));

      // Trigger Angular render cycle
      fixture.detectChanges();

      const result = await resultPromise;
      expect(result).toBe('rendered');
    });

    it('should propagate errors from the effect', async () => {
      const fixture = TestBed.createComponent(TestHostComponent);
      const injector = fixture.componentRef.injector;
      const destroyRef = injector.get(DestroyRef);
      const scheduler = new SideEffectScheduler({ injector, destroyRef });

      const testError = new Error('render effect failed');

      const errorPromise = new Promise<Error>((resolve) => {
        scheduler
          .executeAfterRender(() => {
            throw testError;
          })
          .subscribe({ error: (e: Error) => resolve(e) });
      });

      fixture.detectChanges();

      const error = await errorPromise;
      expect(error).toBe(testError);
    });

    it('should complete without emitting when destroyed before render', () => {
      const { destroyRef, triggerDestroy } = createMockDestroyRef();
      const injector = TestBed.inject(Injector);
      const destroyedScheduler = new SideEffectScheduler({ injector, destroyRef });

      triggerDestroy();

      const next = vi.fn();
      const complete = vi.fn();

      destroyedScheduler.executeAfterRender(() => 'nope').subscribe({ next, complete });

      expect(next).not.toHaveBeenCalled();
      expect(complete).toHaveBeenCalledOnce();
    });

    it('should abort local controller on unsubscribe and not call effect', async () => {
      const fixture = TestBed.createComponent(TestHostComponent);
      const injector = fixture.componentRef.injector;
      const destroyRef = injector.get(DestroyRef);
      const scheduler = new SideEffectScheduler({ injector, destroyRef });

      const effectFn = vi.fn(() => 'result');
      const next = vi.fn();
      const complete = vi.fn();

      const subscription = scheduler.executeAfterRender(effectFn).subscribe({ next, complete });

      // Unsubscribe before render triggers
      subscription.unsubscribe();

      // Now trigger render - the callback should be a no-op due to local abort
      fixture.detectChanges();

      // Give Angular time to process the afterNextRender callback
      await waitForAnimationFrame();

      // The effect should not have run or emitted because local abort was triggered
      expect(effectFn).not.toHaveBeenCalled();
      expect(next).not.toHaveBeenCalled();
    });

    it('should complete without emitting when destroyed after subscribe but before render', async () => {
      const { destroyRef, triggerDestroy } = createMockDestroyRef();

      // We need a real component injector for afterNextRender but a controllable destroyRef
      const fixture = TestBed.createComponent(TestHostComponent);
      const componentInjector = fixture.componentRef.injector;

      // Create scheduler with the component injector (for afterNextRender) but mock destroyRef
      const scheduler = new SideEffectScheduler({ injector: componentInjector, destroyRef });

      const next = vi.fn();
      const complete = vi.fn();

      scheduler.executeAfterRender(() => 'nope').subscribe({ next, complete });

      // Destroy after subscribe but before render
      triggerDestroy();

      fixture.detectChanges();

      await waitForAnimationFrame();

      // The callback should have seen destroyed = true and completed without emitting
      expect(next).not.toHaveBeenCalled();
      expect(complete).toHaveBeenCalledOnce();
    });
  });
});
