import { describe, it, expect } from 'vitest';
import { EventBus } from '../../events/event.bus';
import { ComponentInitializedEvent } from '../../events/constants/component-initialized.event';
import { createInitializationTracker, createDetailedInitializationTracker } from './initialization-tracker';
import { firstValueFrom } from 'rxjs';
import { take, toArray } from 'rxjs/operators';

describe('initialization-tracker', () => {
  describe('createInitializationTracker', () => {
    it('should emit true when all components are initialized', async () => {
      const eventBus = new EventBus();
      const tracker$ = createInitializationTracker(eventBus, 3);

      const promise = firstValueFrom(tracker$);

      // Dispatch 3 initialization events
      eventBus.dispatch(ComponentInitializedEvent, 'dynamic-form', 'form1');
      eventBus.dispatch(ComponentInitializedEvent, 'page', 'page1');
      eventBus.dispatch(ComponentInitializedEvent, 'row', 'row1');

      const isComplete = await promise;
      expect(isComplete).toBe(true);
    });

    it('should not emit until expected count is reached', async () => {
      const eventBus = new EventBus();
      const tracker$ = createInitializationTracker(eventBus, 3);

      let emitted = false;
      const subscription = tracker$.subscribe(() => {
        emitted = true;
      });

      // Dispatch only 2 events
      eventBus.dispatch(ComponentInitializedEvent, 'dynamic-form', 'form1');
      eventBus.dispatch(ComponentInitializedEvent, 'page', 'page1');

      // Give it a moment to potentially emit (it shouldn't)
      await new Promise((resolve) => setTimeout(resolve, 50));
      expect(emitted).toBe(false);
      subscription.unsubscribe();
    });

    it('should emit true for expected count of 1', async () => {
      const eventBus = new EventBus();
      const tracker$ = createInitializationTracker(eventBus, 1);

      const promise = firstValueFrom(tracker$);
      eventBus.dispatch(ComponentInitializedEvent, 'dynamic-form', 'form1');

      const result = await promise;
      expect(result).toBe(true);
    });

    it('should emit when count exceeds expected', async () => {
      const eventBus = new EventBus();
      const tracker$ = createInitializationTracker(eventBus, 2);

      const promise = firstValueFrom(tracker$);

      // Dispatch more than expected
      eventBus.dispatch(ComponentInitializedEvent, 'dynamic-form', 'form1');
      eventBus.dispatch(ComponentInitializedEvent, 'page', 'page1');
      eventBus.dispatch(ComponentInitializedEvent, 'row', 'row1'); // Extra event

      const isComplete = await promise;
      expect(isComplete).toBe(true);
    });

    it('should handle zero expected count', async () => {
      const eventBus = new EventBus();
      const tracker$ = createInitializationTracker(eventBus, 0);

      // First dispatch should immediately satisfy >= 0 condition
      const promise = firstValueFrom(tracker$);
      eventBus.dispatch(ComponentInitializedEvent, 'dynamic-form', 'form1');

      const result = await promise;
      expect(result).toBe(true);
    });

    it('should handle multiple subscriptions', async () => {
      const eventBus = new EventBus();
      const tracker$ = createInitializationTracker(eventBus, 2);

      const promise1 = firstValueFrom(tracker$);
      const promise2 = firstValueFrom(tracker$);

      eventBus.dispatch(ComponentInitializedEvent, 'dynamic-form', 'form1');
      eventBus.dispatch(ComponentInitializedEvent, 'page', 'page1');

      const [result1, result2] = await Promise.all([promise1, promise2]);
      expect(result1).toBe(true);
      expect(result2).toBe(true);
    });
  });

  describe('createDetailedInitializationTracker', () => {
    it('should emit detailed progress for each initialization', async () => {
      const eventBus = new EventBus();
      const tracker$ = createDetailedInitializationTracker(eventBus, 3);

      const emissionsPromise = firstValueFrom(tracker$.pipe(take(3), toArray()));

      eventBus.dispatch(ComponentInitializedEvent, 'dynamic-form', 'form1');
      eventBus.dispatch(ComponentInitializedEvent, 'page', 'page1');
      eventBus.dispatch(ComponentInitializedEvent, 'row', 'row1');

      const emissions = await emissionsPromise;
      expect(emissions).toEqual([
        { currentCount: 1, expectedCount: 3, isComplete: false },
        { currentCount: 2, expectedCount: 3, isComplete: false },
        { currentCount: 3, expectedCount: 3, isComplete: true },
      ]);
    });

    it('should mark as complete when count reaches expected', async () => {
      const eventBus = new EventBus();
      const tracker$ = createDetailedInitializationTracker(eventBus, 2);

      const emissionsPromise = firstValueFrom(tracker$.pipe(take(2), toArray()));

      eventBus.dispatch(ComponentInitializedEvent, 'dynamic-form', 'form1');
      eventBus.dispatch(ComponentInitializedEvent, 'page', 'page1');

      const emissions = await emissionsPromise;
      expect(emissions[0].isComplete).toBe(false);
      expect(emissions[1].isComplete).toBe(true);
    });

    it('should track progress for single component', async () => {
      const eventBus = new EventBus();
      const tracker$ = createDetailedInitializationTracker(eventBus, 1);

      const promise = firstValueFrom(tracker$);
      eventBus.dispatch(ComponentInitializedEvent, 'dynamic-form', 'form1');

      const result = await promise;
      expect(result).toEqual({
        currentCount: 1,
        expectedCount: 1,
        isComplete: true,
      });
    });

    it('should continue emitting beyond expected count', async () => {
      const eventBus = new EventBus();
      const tracker$ = createDetailedInitializationTracker(eventBus, 2);

      const emissionsPromise = firstValueFrom(tracker$.pipe(take(3), toArray()));

      eventBus.dispatch(ComponentInitializedEvent, 'dynamic-form', 'form1');
      eventBus.dispatch(ComponentInitializedEvent, 'page', 'page1');
      eventBus.dispatch(ComponentInitializedEvent, 'row', 'row1');

      const emissions = await emissionsPromise;
      expect(emissions[2]).toEqual({
        currentCount: 3,
        expectedCount: 2,
        isComplete: true,
      });
    });

    it('should emit for every initialization event', async () => {
      const eventBus = new EventBus();
      const tracker$ = createDetailedInitializationTracker(eventBus, 5);

      const emissionsPromise = firstValueFrom(tracker$.pipe(take(5), toArray()));

      // Dispatch 5 events
      for (let i = 1; i <= 5; i++) {
        eventBus.dispatch(ComponentInitializedEvent, 'component', `comp${i}`);
      }

      const emissions = await emissionsPromise;

      // Verify each emission has correct count and expectedCount
      emissions.forEach((status, index) => {
        expect(status.currentCount).toBe(index + 1);
        expect(status.expectedCount).toBe(5);
      });

      // Fourth emission should not be complete
      expect(emissions[3].isComplete).toBe(false);
      // Fifth emission should be complete
      expect(emissions[4].isComplete).toBe(true);
    });

    it('should handle zero expected count', async () => {
      const eventBus = new EventBus();
      const tracker$ = createDetailedInitializationTracker(eventBus, 0);

      const promise = firstValueFrom(tracker$);
      eventBus.dispatch(ComponentInitializedEvent, 'dynamic-form', 'form1');

      const result = await promise;
      expect(result).toEqual({
        currentCount: 1,
        expectedCount: 0,
        isComplete: true,
      });
    });
  });

  describe('integration scenarios', () => {
    it('should work with typical form initialization (dynamic-form + 2 pages + row + group)', async () => {
      const eventBus = new EventBus();
      const expectedComponents = 5; // 1 dynamic-form + 2 pages + 1 row + 1 group
      const tracker$ = createInitializationTracker(eventBus, expectedComponents);

      const promise = firstValueFrom(tracker$);

      eventBus.dispatch(ComponentInitializedEvent, 'dynamic-form', 'form1');
      eventBus.dispatch(ComponentInitializedEvent, 'page', 'page1');
      eventBus.dispatch(ComponentInitializedEvent, 'page', 'page2');
      eventBus.dispatch(ComponentInitializedEvent, 'row', 'row1');
      eventBus.dispatch(ComponentInitializedEvent, 'group', 'group1');

      const isComplete = await promise;
      expect(isComplete).toBe(true);
    });

    it('should handle detailed tracking for complex form', async () => {
      const eventBus = new EventBus();
      const tracker$ = createDetailedInitializationTracker(eventBus, 3);

      const statusesPromise = firstValueFrom(tracker$.pipe(take(3), toArray()));

      eventBus.dispatch(ComponentInitializedEvent, 'dynamic-form', 'mainForm');
      eventBus.dispatch(ComponentInitializedEvent, 'page', 'personalInfo');
      eventBus.dispatch(ComponentInitializedEvent, 'page', 'contactInfo');

      const statuses = await statusesPromise;
      expect(statuses.length).toBe(3);
      expect(statuses[2].currentCount).toBe(3);
    });
  });
});
