import { signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { describe, it, expect, beforeEach } from 'vitest';
import { EventBus } from './event.bus';
import { FormEvent, hasFormValue } from './interfaces/form-event';
import { take, toArray, skip } from 'rxjs/operators';
import { firstValueFrom } from 'rxjs';
import { EMIT_FORM_VALUE_ON_EVENTS } from '../providers/features/event-form-value/emit-form-value.token';
import { RootFormRegistryService } from '../core/registry/root-form-registry.service';
import { FORM_OPTIONS } from '../models/field-signal-context.token';

// Test event classes
class TestEvent implements FormEvent {
  readonly type = 'test-event' as const;
}

class TestEventWithArgs implements FormEvent {
  readonly type = 'test-event-with-args' as const;
  constructor(
    public payload: string,
    public count: number,
  ) {}
}

class AnotherTestEvent implements FormEvent {
  readonly type = 'another-test-event' as const;
}

class ThirdTestEvent implements FormEvent {
  readonly type = 'third-test-event' as const;
}

class EventWithOptionalArgs implements FormEvent {
  readonly type = 'event-with-optional-args' as const;
  constructor(
    public required: string,
    public optional?: number,
  ) {}
}

describe('EventBus', () => {
  let eventBus: EventBus;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [EventBus],
    });
    eventBus = TestBed.inject(EventBus);
  });

  // Test Suite 3.1: EventBus Service Setup
  describe('Service Creation', () => {
    it('should be created successfully', () => {
      expect(eventBus).toBeDefined();
      expect(eventBus).toBeInstanceOf(EventBus);
    });

    it('should have events$ observable', () => {
      expect(eventBus.events$).toBeDefined();
      expect(typeof eventBus.events$.subscribe).toBe('function');
    });

    it('should have dispatch method', () => {
      expect(eventBus.dispatch).toBeDefined();
      expect(typeof eventBus.dispatch).toBe('function');
    });

    it('should have on method', () => {
      expect(eventBus.on).toBeDefined();
      expect(typeof eventBus.on).toBe('function');
    });
  });

  // Test Suite 3.2: dispatch()
  describe('dispatch()', () => {
    describe('Basic Event Dispatching', () => {
      it('should dispatch event with no arguments', async () => {
        const eventPromise = firstValueFrom(eventBus.events$.pipe(take(1)));
        eventBus.dispatch(TestEvent);

        const event = await eventPromise;
        expect(event).toBeInstanceOf(TestEvent);
        expect(event.type).toBe('test-event');
      });

      it('should dispatch event with single argument', async () => {
        const eventPromise = firstValueFrom(eventBus.events$.pipe(take(1)));
        eventBus.dispatch(TestEventWithArgs, 'test-payload', 0);

        const event = await eventPromise;
        expect(event).toBeInstanceOf(TestEventWithArgs);
        expect((event as TestEventWithArgs).payload).toBe('test-payload');
      });

      it('should dispatch event with multiple arguments', async () => {
        const eventPromise = firstValueFrom(eventBus.events$.pipe(take(1)));
        eventBus.dispatch(TestEventWithArgs, 'hello', 42);

        const event = await eventPromise;
        expect(event).toBeInstanceOf(TestEventWithArgs);
        const typedEvent = event as TestEventWithArgs;
        expect(typedEvent.payload).toBe('hello');
        expect(typedEvent.count).toBe(42);
      });

      it('should create new instance of event class', async () => {
        const eventsPromise = firstValueFrom(eventBus.events$.pipe(take(2), toArray()));

        eventBus.dispatch(TestEvent);
        eventBus.dispatch(TestEvent);

        const events = await eventsPromise;
        expect(events.length).toBe(2);
        expect(events[0]).not.toBe(events[1]);
        expect(events[0]).toBeInstanceOf(TestEvent);
        expect(events[1]).toBeInstanceOf(TestEvent);
      });

      it('should emit event to events$ observable', async () => {
        const eventPromise = firstValueFrom(eventBus.events$.pipe(take(1)));
        eventBus.dispatch(TestEvent);

        const event = await eventPromise;
        expect(event).toBeDefined();
      });
    });

    describe('Event Constructor Handling', () => {
      it('should handle parameterless constructors', async () => {
        const eventPromise = firstValueFrom(eventBus.events$.pipe(take(1)));
        eventBus.dispatch(TestEvent);

        const event = await eventPromise;
        expect(event.type).toBe('test-event');
      });

      it('should handle constructors with required parameters', async () => {
        const eventPromise = firstValueFrom(eventBus.events$.pipe(take(1)));
        eventBus.dispatch(TestEventWithArgs, 'required', 1);

        const event = await eventPromise;
        const typedEvent = event as TestEventWithArgs;
        expect(typedEvent.payload).toBe('required');
        expect(typedEvent.count).toBe(1);
      });

      it('should handle constructors with optional parameters', async () => {
        const eventPromise = firstValueFrom(eventBus.events$.pipe(take(1)));
        eventBus.dispatch(EventWithOptionalArgs, 'test');

        const event = await eventPromise;
        const typedEvent = event as EventWithOptionalArgs;
        expect(typedEvent.required).toBe('test');
        expect(typedEvent.optional).toBeUndefined();
      });

      it('should pass all args to constructor', async () => {
        const eventPromise = firstValueFrom(eventBus.events$.pipe(take(1)));
        eventBus.dispatch(EventWithOptionalArgs, 'test', 99);

        const event = await eventPromise;
        const typedEvent = event as EventWithOptionalArgs;
        expect(typedEvent.required).toBe('test');
        expect(typedEvent.optional).toBe(99);
      });
    });

    describe('Multiple Dispatches', () => {
      it('should dispatch multiple events in sequence', async () => {
        const eventsPromise = firstValueFrom(eventBus.events$.pipe(take(3), toArray()));

        eventBus.dispatch(TestEvent);
        eventBus.dispatch(AnotherTestEvent);
        eventBus.dispatch(ThirdTestEvent);

        const result = await eventsPromise;
        expect(result.length).toBe(3);
        expect(result[0].type).toBe('test-event');
        expect(result[1].type).toBe('another-test-event');
        expect(result[2].type).toBe('third-test-event');
      });

      it('should dispatch different event types', async () => {
        const eventsPromise = firstValueFrom(eventBus.events$.pipe(take(2), toArray()));

        eventBus.dispatch(TestEvent);
        eventBus.dispatch(AnotherTestEvent);

        const result = await eventsPromise;
        expect(result[0]).toBeInstanceOf(TestEvent);
        expect(result[1]).toBeInstanceOf(AnotherTestEvent);
      });

      it('should maintain event order in stream', async () => {
        const eventsPromise = firstValueFrom(eventBus.events$.pipe(take(4), toArray()));

        eventBus.dispatch(TestEvent);
        eventBus.dispatch(TestEventWithArgs, 'first', 1);
        eventBus.dispatch(AnotherTestEvent);
        eventBus.dispatch(TestEventWithArgs, 'second', 2);

        const result = await eventsPromise;
        expect(result[0].type).toBe('test-event');
        expect(result[1].type).toBe('test-event-with-args');
        expect((result[1] as TestEventWithArgs).payload).toBe('first');
        expect(result[2].type).toBe('another-test-event');
        expect(result[3].type).toBe('test-event-with-args');
        expect((result[3] as TestEventWithArgs).payload).toBe('second');
      });
    });

    describe('Error Handling', () => {
      it('should handle constructor that throws error', () => {
        class ErrorEvent implements FormEvent {
          readonly type = 'error-event' as const;
          constructor() {
            throw new Error('Constructor error');
          }
        }

        expect(() => {
          eventBus.dispatch(ErrorEvent);
        }).toThrow('Constructor error');
      });

      it('should not break pipeline on dispatch error', async () => {
        class ErrorEvent implements FormEvent {
          readonly type = 'error-event' as const;
          constructor() {
            throw new Error('Constructor error');
          }
        }

        // Subscribe before error
        const eventPromise = firstValueFrom(eventBus.events$.pipe(take(1)));

        // This will throw
        try {
          eventBus.dispatch(ErrorEvent);
        } catch {
          // Expected error
        }

        // This should still work
        eventBus.dispatch(TestEvent);

        const event = await eventPromise;
        expect(event.type).toBe('test-event');
      });
    });
  });

  // Test Suite 3.3: on() - Single Event Type
  describe('on() - Single Event Type', () => {
    describe('Basic Subscription', () => {
      it('should subscribe to single event type (string)', async () => {
        const eventPromise = firstValueFrom(eventBus.on<TestEvent>('test-event').pipe(take(1)));
        eventBus.dispatch(TestEvent);

        const event = await eventPromise;
        expect(event.type).toBe('test-event');
      });

      it('should receive events matching the type', async () => {
        const eventsPromise = firstValueFrom(eventBus.on<TestEvent>('test-event').pipe(take(2), toArray()));

        eventBus.dispatch(TestEvent);
        eventBus.dispatch(TestEvent);

        const events = await eventsPromise;
        expect(events.length).toBe(2);
      });

      it('should not receive events of different types', async () => {
        const eventsPromise = firstValueFrom(eventBus.on<TestEvent>('test-event').pipe(take(2), toArray()));

        eventBus.dispatch(TestEvent);
        eventBus.dispatch(AnotherTestEvent);
        eventBus.dispatch(ThirdTestEvent);
        eventBus.dispatch(TestEvent);

        const receivedEvents = await eventsPromise;
        expect(receivedEvents.length).toBe(2);
        expect(receivedEvents.every((e) => e.type === 'test-event')).toBe(true);
      });

      it('should filter events correctly', async () => {
        const eventsPromise = firstValueFrom(eventBus.on<TestEvent>('test-event').pipe(take(2), toArray()));

        eventBus.dispatch(AnotherTestEvent);
        eventBus.dispatch(TestEvent);
        eventBus.dispatch(ThirdTestEvent);
        eventBus.dispatch(TestEvent);
        eventBus.dispatch(AnotherTestEvent);

        const result = await eventsPromise;
        expect(result.length).toBe(2);
        expect(result.every((e) => e.type === 'test-event')).toBe(true);
      });
    });

    describe('Type Narrowing', () => {
      it('should type-narrow to specific event type', async () => {
        const eventPromise = firstValueFrom(eventBus.on<TestEvent>('test-event').pipe(take(1)));
        eventBus.dispatch(TestEvent);

        const event = await eventPromise;
        // TypeScript should recognize this as TestEvent
        expect(event.type).toBe('test-event');
      });

      it('should provide type-safe event access', async () => {
        const eventPromise = firstValueFrom(eventBus.on<TestEventWithArgs>('test-event-with-args').pipe(take(1)));
        eventBus.dispatch(TestEventWithArgs, 'typed', 123);

        const event = await eventPromise;
        // Should have type-safe access to payload and count
        expect(event.payload).toBe('typed');
        expect(event.count).toBe(123);
      });

      it('should work with custom event properties', async () => {
        const eventPromise = firstValueFrom(eventBus.on<EventWithOptionalArgs>('event-with-optional-args').pipe(take(1)));
        eventBus.dispatch(EventWithOptionalArgs, 'custom', 42);

        const event = await eventPromise;
        expect(event.required).toBe('custom');
        expect(event.optional).toBe(42);
      });
    });

    describe('Multiple Subscribers', () => {
      it('should support multiple subscribers to same event type', async () => {
        const subscriber1Promise = firstValueFrom(eventBus.on<TestEvent>('test-event').pipe(take(1)));
        const subscriber2Promise = firstValueFrom(eventBus.on<TestEvent>('test-event').pipe(take(1)));

        eventBus.dispatch(TestEvent);

        const [event1, event2] = await Promise.all([subscriber1Promise, subscriber2Promise]);
        expect(event1).toBeDefined();
        expect(event2).toBeDefined();
      });

      it('should deliver event to all subscribers', async () => {
        const events1Promise = firstValueFrom(eventBus.on<TestEvent>('test-event').pipe(take(2), toArray()));
        const events2Promise = firstValueFrom(eventBus.on<TestEvent>('test-event').pipe(take(2), toArray()));
        const events3Promise = firstValueFrom(eventBus.on<TestEvent>('test-event').pipe(take(2), toArray()));

        eventBus.dispatch(TestEvent);
        eventBus.dispatch(TestEvent);

        const [events1, events2, events3] = await Promise.all([events1Promise, events2Promise, events3Promise]);
        expect(events1.length).toBe(2);
        expect(events2.length).toBe(2);
        expect(events3.length).toBe(2);
      });

      it('should maintain independent subscriptions', async () => {
        let subscriber1Count = 0;
        let subscriber2Count = 0;

        const sub1 = eventBus.on<TestEvent>('test-event').subscribe(() => {
          subscriber1Count++;
        });

        const sub2 = eventBus.on<TestEvent>('test-event').subscribe(() => {
          subscriber2Count++;
        });

        eventBus.dispatch(TestEvent);
        sub1.unsubscribe();
        eventBus.dispatch(TestEvent);

        await new Promise((resolve) => setTimeout(resolve, 10));
        expect(subscriber1Count).toBe(1);
        expect(subscriber2Count).toBe(2);

        sub2.unsubscribe();
      });
    });

    describe('Subscription Lifecycle', () => {
      it('should continue receiving events until unsubscribed', async () => {
        let count = 0;
        const subscription = eventBus.on<TestEvent>('test-event').subscribe(() => {
          count++;
        });

        eventBus.dispatch(TestEvent);
        eventBus.dispatch(TestEvent);

        // Wait for events to be processed
        await new Promise((resolve) => setTimeout(resolve, 10));
        expect(count).toBe(2);

        subscription.unsubscribe();
        eventBus.dispatch(TestEvent);

        // Wait to ensure unsubscribed event isn't received
        await new Promise((resolve) => setTimeout(resolve, 10));
        expect(count).toBe(2); // Should still be 2
      });

      it('should stop receiving events after unsubscribe', async () => {
        let count = 0;
        const subscription = eventBus.on<TestEvent>('test-event').subscribe(() => {
          count++;
        });

        eventBus.dispatch(TestEvent);
        subscription.unsubscribe();
        eventBus.dispatch(TestEvent);
        eventBus.dispatch(TestEvent);

        // Wait to ensure unsubscribed events aren't received
        await new Promise((resolve) => setTimeout(resolve, 10));
        expect(count).toBe(1);
      });

      it('should handle subscription before any dispatch', async () => {
        const eventPromise = firstValueFrom(eventBus.on<TestEvent>('test-event').pipe(take(1)));
        eventBus.dispatch(TestEvent);

        const event = await eventPromise;
        expect(event.type).toBe('test-event');
      });

      it('should handle subscription after dispatches', async () => {
        // Dispatch events before subscription
        eventBus.dispatch(TestEvent);
        eventBus.dispatch(TestEvent);

        // New subscription should only receive future events
        const eventPromise = firstValueFrom(eventBus.on<TestEvent>('test-event').pipe(take(1)));
        eventBus.dispatch(TestEvent);

        const event = await eventPromise;
        expect(event.type).toBe('test-event');
      });
    });
  });

  // Test Suite 3.4: on() - Multiple Event Types
  describe('on() - Multiple Event Types', () => {
    describe('Array-Based Subscription', () => {
      it('should subscribe to multiple event types with array', async () => {
        const eventsPromise = firstValueFrom(
          eventBus.on<TestEvent | AnotherTestEvent>(['test-event', 'another-test-event']).pipe(take(2), toArray()),
        );

        eventBus.dispatch(TestEvent);
        eventBus.dispatch(AnotherTestEvent);

        const result = await eventsPromise;
        expect(result.length).toBe(2);
        expect(result[0].type).toBe('test-event');
        expect(result[1].type).toBe('another-test-event');
      });

      it('should receive events matching any type in array', async () => {
        const eventsPromise = firstValueFrom(
          eventBus
            .on<TestEvent | AnotherTestEvent | ThirdTestEvent>(['test-event', 'another-test-event', 'third-test-event'])
            .pipe(take(3), toArray()),
        );

        eventBus.dispatch(ThirdTestEvent);
        eventBus.dispatch(TestEvent);
        eventBus.dispatch(AnotherTestEvent);

        const result = await eventsPromise;
        expect(result.length).toBe(3);
      });

      it('should not receive events not in array', async () => {
        const eventsPromise = firstValueFrom(
          eventBus.on<TestEvent | AnotherTestEvent>(['test-event', 'another-test-event']).pipe(take(2), toArray()),
        );

        eventBus.dispatch(TestEvent);
        eventBus.dispatch(ThirdTestEvent);
        eventBus.dispatch(AnotherTestEvent);
        eventBus.dispatch(ThirdTestEvent);

        const receivedEvents = await eventsPromise;
        expect(receivedEvents.length).toBe(2);
        expect(receivedEvents[0].type).toBe('test-event');
        expect(receivedEvents[1].type).toBe('another-test-event');
      });

      it('should filter events correctly', async () => {
        const eventsPromise = firstValueFrom(
          eventBus.on<TestEvent | AnotherTestEvent>(['test-event', 'another-test-event']).pipe(take(4), toArray()),
        );

        eventBus.dispatch(TestEvent);
        eventBus.dispatch(ThirdTestEvent);
        eventBus.dispatch(AnotherTestEvent);
        eventBus.dispatch(ThirdTestEvent);
        eventBus.dispatch(TestEvent);
        eventBus.dispatch(AnotherTestEvent);

        const result = await eventsPromise;
        expect(result.length).toBe(4);
        expect(result.every((e) => e.type === 'test-event' || e.type === 'another-test-event')).toBe(true);
      });
    });

    describe('Type Handling', () => {
      it('should handle empty array', async () => {
        let receivedAny = false;
        const subscription = eventBus.on<never>([]).subscribe(() => {
          receivedAny = true;
        });

        eventBus.dispatch(TestEvent);
        eventBus.dispatch(AnotherTestEvent);

        // Wait to ensure no events are received
        await new Promise((resolve) => setTimeout(resolve, 10));
        expect(receivedAny).toBe(false);

        subscription.unsubscribe();
      });

      it('should handle single-item array', async () => {
        const eventPromise = firstValueFrom(eventBus.on<TestEvent>(['test-event']).pipe(take(1)));

        eventBus.dispatch(AnotherTestEvent);
        eventBus.dispatch(TestEvent);

        const event = await eventPromise;
        expect(event.type).toBe('test-event');
      });

      it('should handle large arrays of event types', async () => {
        const eventsPromise = firstValueFrom(
          eventBus
            .on<TestEvent | AnotherTestEvent | ThirdTestEvent>(['test-event', 'another-test-event', 'third-test-event'])
            .pipe(take(6), toArray()),
        );

        eventBus.dispatch(TestEvent);
        eventBus.dispatch(AnotherTestEvent);
        eventBus.dispatch(ThirdTestEvent);
        eventBus.dispatch(TestEvent);
        eventBus.dispatch(AnotherTestEvent);
        eventBus.dispatch(ThirdTestEvent);

        const result = await eventsPromise;
        expect(result.length).toBe(6);
      });
    });

    describe('Event Differentiation', () => {
      it('should allow distinguishing between different event types', async () => {
        const eventsPromise = firstValueFrom(
          eventBus.on<TestEvent | AnotherTestEvent>(['test-event', 'another-test-event']).pipe(take(3), toArray()),
        );

        eventBus.dispatch(TestEvent);
        eventBus.dispatch(AnotherTestEvent);
        eventBus.dispatch(TestEvent);

        const events = await eventsPromise;
        const eventTypes = events.map((e) => e.type);
        expect(eventTypes).toEqual(['test-event', 'another-test-event', 'test-event']);
      });

      it('should preserve event.type property', async () => {
        const eventPromise = firstValueFrom(eventBus.on<TestEvent | AnotherTestEvent>(['test-event', 'another-test-event']).pipe(take(1)));

        eventBus.dispatch(TestEvent);

        const event = await eventPromise;
        expect(event.type).toBeDefined();
        expect(['test-event', 'another-test-event']).toContain(event.type);
      });

      it('should maintain type information', async () => {
        const eventPromise = firstValueFrom(
          eventBus.on<TestEvent | TestEventWithArgs>(['test-event', 'test-event-with-args']).pipe(
            skip(1), // Skip the first TestEvent
            take(1),
          ),
        );

        eventBus.dispatch(TestEvent);
        eventBus.dispatch(TestEventWithArgs, 'test', 1);

        const event = await eventPromise;
        if (event.type === 'test-event-with-args') {
          const typedEvent = event as TestEventWithArgs;
          expect(typedEvent.payload).toBe('test');
          expect(typedEvent.count).toBe(1);
        }
      });
    });
  });

  // Test Suite 3.5: Integration Scenarios
  describe('Integration Scenarios', () => {
    describe('Full Event Flow', () => {
      it('should support dispatch → subscribe → receive flow', async () => {
        // First dispatch happens before subscription, so it won't be received
        eventBus.dispatch(TestEvent);

        // Subscribe after first dispatch
        const eventPromise = firstValueFrom(eventBus.on<TestEvent>('test-event').pipe(take(1)));

        // Second dispatch should be received
        eventBus.dispatch(TestEvent);

        const event = await eventPromise;
        expect(event.type).toBe('test-event');
      });

      it('should support subscribe → dispatch → receive flow', async () => {
        const eventPromise = firstValueFrom(eventBus.on<TestEvent>('test-event').pipe(take(1)));
        eventBus.dispatch(TestEvent);

        const event = await eventPromise;
        expect(event.type).toBe('test-event');
      });

      it('should handle interleaved dispatch and subscribe', async () => {
        const events1: FormEvent[] = [];
        const events2: FormEvent[] = [];

        // First dispatch - no subscribers yet
        eventBus.dispatch(TestEvent);

        // events1 subscribes - will receive future events
        const sub1 = eventBus.on<TestEvent>('test-event').subscribe((event) => events1.push(event));

        // Second dispatch - events1 receives this
        eventBus.dispatch(TestEvent);

        // events2 subscribes - will receive future events
        const sub2 = eventBus.on<TestEvent>('test-event').subscribe((event) => events2.push(event));

        // Third dispatch - both events1 and events2 receive this
        eventBus.dispatch(TestEvent);

        // Wait for events to be processed
        await new Promise((resolve) => setTimeout(resolve, 10));

        expect(events1.length).toBe(2); // Received 2nd and 3rd dispatch
        expect(events2.length).toBe(1); // Received only 3rd dispatch

        sub1.unsubscribe();
        sub2.unsubscribe();
      });
    });

    describe('Event Bus Isolation', () => {
      it('should maintain separate event streams per EventBus instance', async () => {
        const eventBus2 = new EventBus();

        const events1Promise = firstValueFrom(eventBus.on<TestEvent>('test-event').pipe(take(1)));
        const events2Promise = firstValueFrom(eventBus2.on<TestEvent>('test-event').pipe(take(1)));

        eventBus.dispatch(TestEvent);
        eventBus2.dispatch(TestEvent);

        const [event1, event2] = await Promise.all([events1Promise, events2Promise]);
        expect(event1).toBeDefined();
        expect(event2).toBeDefined();
      });

      it('should not leak events between instances', async () => {
        const eventBus2 = new EventBus();

        let eventBus1Count = 0;
        let eventBus2Count = 0;

        const sub1 = eventBus.on<TestEvent>('test-event').subscribe(() => eventBus1Count++);
        const sub2 = eventBus2.on<TestEvent>('test-event').subscribe(() => eventBus2Count++);

        eventBus.dispatch(TestEvent);
        eventBus.dispatch(TestEvent);
        eventBus2.dispatch(TestEvent);

        // Wait for events to be processed
        await new Promise((resolve) => setTimeout(resolve, 10));

        expect(eventBus1Count).toBe(2);
        expect(eventBus2Count).toBe(1);

        sub1.unsubscribe();
        sub2.unsubscribe();
      });
    });

    describe('Real-World Event Types', () => {
      it('should work with real event types if imported', async () => {
        // This test demonstrates that the EventBus works with any FormEvent implementation
        class CustomFormEvent implements FormEvent {
          readonly type = 'custom-form-event' as const;
          constructor(public data: { name: string; value: number }) {}
        }

        const eventPromise = firstValueFrom(eventBus.on<CustomFormEvent>('custom-form-event').pipe(take(1)));
        eventBus.dispatch(CustomFormEvent, { name: 'test', value: 100 });

        const event = await eventPromise;
        expect(event.data.name).toBe('test');
        expect(event.data.value).toBe(100);
      });
    });

    describe('Observable Behavior', () => {
      it('should handle RxJS operators (map, filter, etc.)', async () => {
        const eventsPromise = firstValueFrom(eventBus.on<TestEventWithArgs>('test-event-with-args').pipe(take(2), toArray()));

        eventBus.dispatch(TestEventWithArgs, 'first', 1);
        eventBus.dispatch(TestEventWithArgs, 'second', 2);

        const result = await eventsPromise;
        expect(result.length).toBe(2);
        expect(result[0].payload).toBe('first');
        expect(result[1].payload).toBe('second');
      });

      it('should support async pipe usage pattern', async () => {
        // Simulate async pipe behavior
        const observable = eventBus.on<TestEvent>('test-event');
        const eventPromise = firstValueFrom(observable.pipe(take(1)));

        eventBus.dispatch(TestEvent);

        const event = await eventPromise;
        expect(event.type).toBe('test-event');
      });
    });
  });
});

// Test Suite for Form Value Emission
describe('EventBus Form Value Emission', () => {
  describe('hasFormValue type guard', () => {
    it('should return true when formValue is defined', () => {
      const event = { type: 'test', formValue: { name: 'John' } } as FormEvent;
      expect(hasFormValue(event)).toBe(true);
    });

    it('should return false when formValue is undefined', () => {
      const event = { type: 'test' } as FormEvent;
      expect(hasFormValue(event)).toBe(false);
    });

    it('should return false when formValue is explicitly undefined', () => {
      const event = { type: 'test', formValue: undefined } as FormEvent;
      expect(hasFormValue(event)).toBe(false);
    });

    it('should narrow the type correctly', () => {
      const event = { type: 'test', formValue: { name: 'John' } } as FormEvent;
      if (hasFormValue(event)) {
        // TypeScript should know formValue exists
        expect(event.formValue).toEqual({ name: 'John' });
      }
    });
  });

  describe('Global form value emission (withEventFormValue)', () => {
    let eventBus: EventBus;
    const mockEntity = signal<Record<string, unknown>>({ name: 'John', email: 'john@example.com' });
    const mockFormSignal = signal<unknown>(undefined);

    beforeEach(() => {
      mockEntity.set({ name: 'John', email: 'john@example.com' });
      mockFormSignal.set(undefined);

      TestBed.configureTestingModule({
        providers: [
          EventBus,
          { provide: RootFormRegistryService, useValue: { formValue: mockEntity, rootForm: mockFormSignal } },
          { provide: EMIT_FORM_VALUE_ON_EVENTS, useValue: true },
        ],
      });
      eventBus = TestBed.inject(EventBus);
    });

    it('should attach formValue when global emission is enabled', async () => {
      const eventPromise = firstValueFrom(eventBus.events$.pipe(take(1)));
      eventBus.dispatch(TestEvent);

      const event = await eventPromise;
      expect(hasFormValue(event)).toBe(true);
      expect(event.formValue).toEqual({ name: 'John', email: 'john@example.com' });
    });

    it('should preserve original event properties', async () => {
      const eventPromise = firstValueFrom(eventBus.events$.pipe(take(1)));
      eventBus.dispatch(TestEventWithArgs, 'payload', 42);

      const event = await eventPromise;
      expect(event.type).toBe('test-event-with-args');
      expect((event as TestEventWithArgs).payload).toBe('payload');
      expect((event as TestEventWithArgs).count).toBe(42);
      expect(hasFormValue(event)).toBe(true);
    });

    it('should not attach formValue when form value is empty', async () => {
      // Clear the form value
      mockEntity.set({});

      const eventPromise = firstValueFrom(eventBus.events$.pipe(take(1)));
      eventBus.dispatch(TestEvent);

      const event = await eventPromise;
      expect(hasFormValue(event)).toBe(false);
    });
  });

  describe('Per-form override via options.emitFormValueOnEvents', () => {
    const mockEntity = signal<Record<string, unknown>>({ name: 'John' });
    const mockFormSignal = signal<unknown>(undefined);

    beforeEach(() => {
      mockEntity.set({ name: 'John' });
      mockFormSignal.set(undefined);
    });

    it('should enable form value emission when per-form option is true (global disabled)', async () => {
      TestBed.configureTestingModule({
        providers: [
          EventBus,
          { provide: RootFormRegistryService, useValue: { formValue: mockEntity, rootForm: mockFormSignal } },
          { provide: EMIT_FORM_VALUE_ON_EVENTS, useValue: false },
          { provide: FORM_OPTIONS, useValue: signal({ emitFormValueOnEvents: true }) },
        ],
      });
      const eventBus = TestBed.inject(EventBus);

      const eventPromise = firstValueFrom(eventBus.events$.pipe(take(1)));
      eventBus.dispatch(TestEvent);

      const event = await eventPromise;
      expect(hasFormValue(event)).toBe(true);
    });

    it('should disable form value emission when per-form option is false (global enabled)', async () => {
      TestBed.configureTestingModule({
        providers: [
          EventBus,
          { provide: RootFormRegistryService, useValue: { formValue: mockEntity, rootForm: mockFormSignal } },
          { provide: EMIT_FORM_VALUE_ON_EVENTS, useValue: true },
          { provide: FORM_OPTIONS, useValue: signal({ emitFormValueOnEvents: false }) },
        ],
      });
      const eventBus = TestBed.inject(EventBus);

      const eventPromise = firstValueFrom(eventBus.events$.pipe(take(1)));
      eventBus.dispatch(TestEvent);

      const event = await eventPromise;
      expect(hasFormValue(event)).toBe(false);
    });

    it('should use global setting when per-form option is undefined', async () => {
      TestBed.configureTestingModule({
        providers: [
          EventBus,
          { provide: RootFormRegistryService, useValue: { formValue: mockEntity, rootForm: mockFormSignal } },
          { provide: EMIT_FORM_VALUE_ON_EVENTS, useValue: true },
          { provide: FORM_OPTIONS, useValue: signal({}) },
        ],
      });
      const eventBus = TestBed.inject(EventBus);

      const eventPromise = firstValueFrom(eventBus.events$.pipe(take(1)));
      eventBus.dispatch(TestEvent);

      const event = await eventPromise;
      expect(hasFormValue(event)).toBe(true);
    });
  });

  describe('No form value emission (default)', () => {
    let eventBus: EventBus;

    beforeEach(() => {
      TestBed.configureTestingModule({
        providers: [EventBus],
      });
      eventBus = TestBed.inject(EventBus);
    });

    it('should not attach formValue when global emission is disabled (default)', async () => {
      const eventPromise = firstValueFrom(eventBus.events$.pipe(take(1)));
      eventBus.dispatch(TestEvent);

      const event = await eventPromise;
      expect(hasFormValue(event)).toBe(false);
    });
  });

  describe('Edge cases', () => {
    it('should handle missing RootFormRegistryService gracefully', async () => {
      TestBed.configureTestingModule({
        providers: [EventBus, { provide: EMIT_FORM_VALUE_ON_EVENTS, useValue: true }],
      });
      const eventBus = TestBed.inject(EventBus);

      const eventPromise = firstValueFrom(eventBus.events$.pipe(take(1)));
      eventBus.dispatch(TestEvent);

      const event = await eventPromise;
      // Should not throw, just not attach formValue
      expect(hasFormValue(event)).toBe(false);
    });

    it('should handle missing FORM_OPTIONS gracefully', async () => {
      const mockEntity = signal<Record<string, unknown>>({ name: 'John' });
      const mockFormSignal = signal<unknown>(undefined);

      TestBed.configureTestingModule({
        providers: [
          EventBus,
          { provide: RootFormRegistryService, useValue: { formValue: mockEntity, rootForm: mockFormSignal } },
          { provide: EMIT_FORM_VALUE_ON_EVENTS, useValue: true },
        ],
      });
      const eventBus = TestBed.inject(EventBus);

      const eventPromise = firstValueFrom(eventBus.events$.pipe(take(1)));
      eventBus.dispatch(TestEvent);

      const event = await eventPromise;
      // Should use global setting
      expect(hasFormValue(event)).toBe(true);
    });
  });
});
