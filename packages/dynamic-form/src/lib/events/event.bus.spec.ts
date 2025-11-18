import { TestBed } from '@angular/core/testing';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { EventBus } from './event.bus';
import { FormEvent, FormEventConstructor } from './interfaces/form-event';
import { take, toArray } from 'rxjs/operators';
import { firstValueFrom } from 'rxjs';

// Test event classes
class TestEvent implements FormEvent {
  readonly type = 'test-event' as const;
}

class TestEventWithArgs implements FormEvent {
  readonly type = 'test-event-with-args' as const;
  constructor(public payload: string, public count: number) {}
}

class AnotherTestEvent implements FormEvent {
  readonly type = 'another-test-event' as const;
}

class ThirdTestEvent implements FormEvent {
  readonly type = 'third-test-event' as const;
}

class EventWithOptionalArgs implements FormEvent {
  readonly type = 'event-with-optional-args' as const;
  constructor(public required: string, public optional?: number) {}
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
      it('should dispatch event with no arguments', (done) => {
        eventBus.events$.pipe(take(1)).subscribe((event) => {
          expect(event).toBeInstanceOf(TestEvent);
          expect(event.type).toBe('test-event');
          done();
        });

        eventBus.dispatch(TestEvent);
      });

      it('should dispatch event with single argument', (done) => {
        eventBus.events$.pipe(take(1)).subscribe((event) => {
          expect(event).toBeInstanceOf(TestEventWithArgs);
          expect((event as TestEventWithArgs).payload).toBe('test-payload');
          done();
        });

        eventBus.dispatch(TestEventWithArgs, 'test-payload', 0);
      });

      it('should dispatch event with multiple arguments', (done) => {
        eventBus.events$.pipe(take(1)).subscribe((event) => {
          expect(event).toBeInstanceOf(TestEventWithArgs);
          const typedEvent = event as TestEventWithArgs;
          expect(typedEvent.payload).toBe('hello');
          expect(typedEvent.count).toBe(42);
          done();
        });

        eventBus.dispatch(TestEventWithArgs, 'hello', 42);
      });

      it('should create new instance of event class', () => {
        const events: FormEvent[] = [];
        eventBus.events$.pipe(take(2)).subscribe((event) => events.push(event));

        eventBus.dispatch(TestEvent);
        eventBus.dispatch(TestEvent);

        expect(events.length).toBe(2);
        expect(events[0]).not.toBe(events[1]);
        expect(events[0]).toBeInstanceOf(TestEvent);
        expect(events[1]).toBeInstanceOf(TestEvent);
      });

      it('should emit event to events$ observable', (done) => {
        let emitted = false;
        eventBus.events$.pipe(take(1)).subscribe(() => {
          emitted = true;
          expect(emitted).toBe(true);
          done();
        });

        eventBus.dispatch(TestEvent);
      });
    });

    describe('Event Constructor Handling', () => {
      it('should handle parameterless constructors', (done) => {
        eventBus.events$.pipe(take(1)).subscribe((event) => {
          expect(event.type).toBe('test-event');
          done();
        });

        eventBus.dispatch(TestEvent);
      });

      it('should handle constructors with required parameters', (done) => {
        eventBus.events$.pipe(take(1)).subscribe((event) => {
          const typedEvent = event as TestEventWithArgs;
          expect(typedEvent.payload).toBe('required');
          expect(typedEvent.count).toBe(1);
          done();
        });

        eventBus.dispatch(TestEventWithArgs, 'required', 1);
      });

      it('should handle constructors with optional parameters', (done) => {
        eventBus.events$.pipe(take(1)).subscribe((event) => {
          const typedEvent = event as EventWithOptionalArgs;
          expect(typedEvent.required).toBe('test');
          expect(typedEvent.optional).toBeUndefined();
          done();
        });

        eventBus.dispatch(EventWithOptionalArgs, 'test');
      });

      it('should pass all args to constructor', (done) => {
        eventBus.events$.pipe(take(1)).subscribe((event) => {
          const typedEvent = event as EventWithOptionalArgs;
          expect(typedEvent.required).toBe('test');
          expect(typedEvent.optional).toBe(99);
          done();
        });

        eventBus.dispatch(EventWithOptionalArgs, 'test', 99);
      });
    });

    describe('Multiple Dispatches', () => {
      it('should dispatch multiple events in sequence', async () => {
        const events = firstValueFrom(eventBus.events$.pipe(take(3), toArray()));

        eventBus.dispatch(TestEvent);
        eventBus.dispatch(AnotherTestEvent);
        eventBus.dispatch(ThirdTestEvent);

        const result = await events;
        expect(result.length).toBe(3);
        expect(result[0].type).toBe('test-event');
        expect(result[1].type).toBe('another-test-event');
        expect(result[2].type).toBe('third-test-event');
      });

      it('should dispatch different event types', async () => {
        const events = firstValueFrom(eventBus.events$.pipe(take(2), toArray()));

        eventBus.dispatch(TestEvent);
        eventBus.dispatch(AnotherTestEvent);

        const result = await events;
        expect(result[0]).toBeInstanceOf(TestEvent);
        expect(result[1]).toBeInstanceOf(AnotherTestEvent);
      });

      it('should maintain event order in stream', async () => {
        const events = firstValueFrom(eventBus.events$.pipe(take(4), toArray()));

        eventBus.dispatch(TestEvent);
        eventBus.dispatch(TestEventWithArgs, 'first', 1);
        eventBus.dispatch(AnotherTestEvent);
        eventBus.dispatch(TestEventWithArgs, 'second', 2);

        const result = await events;
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

      it('should not break pipeline on dispatch error', (done) => {
        class ErrorEvent implements FormEvent {
          readonly type = 'error-event' as const;
          constructor() {
            throw new Error('Constructor error');
          }
        }

        // Subscribe before error
        eventBus.events$.pipe(take(1)).subscribe((event) => {
          expect(event.type).toBe('test-event');
          done();
        });

        // This will throw
        try {
          eventBus.dispatch(ErrorEvent);
        } catch {
          // Expected error
        }

        // This should still work
        eventBus.dispatch(TestEvent);
      });
    });
  });

  // Test Suite 3.3: on() - Single Event Type
  describe('on() - Single Event Type', () => {
    describe('Basic Subscription', () => {
      it('should subscribe to single event type (string)', (done) => {
        eventBus.on<TestEvent>('test-event').subscribe((event) => {
          expect(event.type).toBe('test-event');
          done();
        });

        eventBus.dispatch(TestEvent);
      });

      it('should receive events matching the type', (done) => {
        let receivedCount = 0;

        eventBus.on<TestEvent>('test-event').subscribe(() => {
          receivedCount++;
          if (receivedCount === 2) {
            expect(receivedCount).toBe(2);
            done();
          }
        });

        eventBus.dispatch(TestEvent);
        eventBus.dispatch(TestEvent);
      });

      it('should not receive events of different types', (done) => {
        const receivedEvents: FormEvent[] = [];

        eventBus.on<TestEvent>('test-event').subscribe((event) => {
          receivedEvents.push(event);
        });

        eventBus.dispatch(TestEvent);
        eventBus.dispatch(AnotherTestEvent);
        eventBus.dispatch(ThirdTestEvent);
        eventBus.dispatch(TestEvent);

        setTimeout(() => {
          expect(receivedEvents.length).toBe(2);
          expect(receivedEvents.every((e) => e.type === 'test-event')).toBe(true);
          done();
        }, 50);
      });

      it('should filter events correctly', async () => {
        const events = firstValueFrom(eventBus.on<TestEvent>('test-event').pipe(take(2), toArray()));

        eventBus.dispatch(AnotherTestEvent);
        eventBus.dispatch(TestEvent);
        eventBus.dispatch(ThirdTestEvent);
        eventBus.dispatch(TestEvent);
        eventBus.dispatch(AnotherTestEvent);

        const result = await events;
        expect(result.length).toBe(2);
        expect(result.every((e) => e.type === 'test-event')).toBe(true);
      });
    });

    describe('Type Narrowing', () => {
      it('should type-narrow to specific event type', (done) => {
        eventBus.on<TestEvent>('test-event').subscribe((event) => {
          // TypeScript should recognize this as TestEvent
          expect(event.type).toBe('test-event');
          done();
        });

        eventBus.dispatch(TestEvent);
      });

      it('should provide type-safe event access', (done) => {
        eventBus.on<TestEventWithArgs>('test-event-with-args').subscribe((event) => {
          // Should have type-safe access to payload and count
          expect(event.payload).toBe('typed');
          expect(event.count).toBe(123);
          done();
        });

        eventBus.dispatch(TestEventWithArgs, 'typed', 123);
      });

      it('should work with custom event properties', (done) => {
        eventBus.on<EventWithOptionalArgs>('event-with-optional-args').subscribe((event) => {
          expect(event.required).toBe('custom');
          expect(event.optional).toBe(42);
          done();
        });

        eventBus.dispatch(EventWithOptionalArgs, 'custom', 42);
      });
    });

    describe('Multiple Subscribers', () => {
      it('should support multiple subscribers to same event type', (done) => {
        let subscriber1Called = false;
        let subscriber2Called = false;

        eventBus.on<TestEvent>('test-event').subscribe(() => {
          subscriber1Called = true;
          checkDone();
        });

        eventBus.on<TestEvent>('test-event').subscribe(() => {
          subscriber2Called = true;
          checkDone();
        });

        function checkDone() {
          if (subscriber1Called && subscriber2Called) {
            done();
          }
        }

        eventBus.dispatch(TestEvent);
      });

      it('should deliver event to all subscribers', async () => {
        const events1: FormEvent[] = [];
        const events2: FormEvent[] = [];
        const events3: FormEvent[] = [];

        eventBus.on<TestEvent>('test-event').subscribe((event) => events1.push(event));
        eventBus.on<TestEvent>('test-event').subscribe((event) => events2.push(event));
        eventBus.on<TestEvent>('test-event').subscribe((event) => events3.push(event));

        eventBus.dispatch(TestEvent);
        eventBus.dispatch(TestEvent);

        await new Promise((resolve) => setTimeout(resolve, 50));

        expect(events1.length).toBe(2);
        expect(events2.length).toBe(2);
        expect(events3.length).toBe(2);
      });

      it('should maintain independent subscriptions', (done) => {
        let subscriber1Count = 0;
        let subscriber2Count = 0;

        const sub1 = eventBus.on<TestEvent>('test-event').subscribe(() => {
          subscriber1Count++;
        });

        eventBus.on<TestEvent>('test-event').subscribe(() => {
          subscriber2Count++;
        });

        eventBus.dispatch(TestEvent);
        sub1.unsubscribe();
        eventBus.dispatch(TestEvent);

        setTimeout(() => {
          expect(subscriber1Count).toBe(1);
          expect(subscriber2Count).toBe(2);
          done();
        }, 50);
      });
    });

    describe('Subscription Lifecycle', () => {
      it('should continue receiving events until unsubscribed', (done) => {
        let count = 0;

        const subscription = eventBus.on<TestEvent>('test-event').subscribe(() => {
          count++;
        });

        eventBus.dispatch(TestEvent);
        eventBus.dispatch(TestEvent);

        setTimeout(() => {
          expect(count).toBe(2);
          subscription.unsubscribe();
          eventBus.dispatch(TestEvent);

          setTimeout(() => {
            expect(count).toBe(2); // Should still be 2
            done();
          }, 50);
        }, 50);
      });

      it('should stop receiving events after unsubscribe', (done) => {
        let count = 0;

        const subscription = eventBus.on<TestEvent>('test-event').subscribe(() => {
          count++;
        });

        eventBus.dispatch(TestEvent);
        subscription.unsubscribe();
        eventBus.dispatch(TestEvent);
        eventBus.dispatch(TestEvent);

        setTimeout(() => {
          expect(count).toBe(1);
          done();
        }, 50);
      });

      it('should handle subscription before any dispatch', (done) => {
        eventBus.on<TestEvent>('test-event').subscribe((event) => {
          expect(event.type).toBe('test-event');
          done();
        });

        eventBus.dispatch(TestEvent);
      });

      it('should handle subscription after dispatches', (done) => {
        eventBus.dispatch(TestEvent);
        eventBus.dispatch(TestEvent);

        eventBus.on<TestEvent>('test-event').subscribe((event) => {
          expect(event.type).toBe('test-event');
          done();
        });

        eventBus.dispatch(TestEvent);
      });
    });
  });

  // Test Suite 3.4: on() - Multiple Event Types
  describe('on() - Multiple Event Types', () => {
    describe('Array-Based Subscription', () => {
      it('should subscribe to multiple event types with array', async () => {
        const events = firstValueFrom(
          eventBus.on<TestEvent | AnotherTestEvent>(['test-event', 'another-test-event']).pipe(take(2), toArray()),
        );

        eventBus.dispatch(TestEvent);
        eventBus.dispatch(AnotherTestEvent);

        const result = await events;
        expect(result.length).toBe(2);
        expect(result[0].type).toBe('test-event');
        expect(result[1].type).toBe('another-test-event');
      });

      it('should receive events matching any type in array', async () => {
        const events = firstValueFrom(
          eventBus.on<TestEvent | AnotherTestEvent | ThirdTestEvent>(['test-event', 'another-test-event', 'third-test-event']).pipe(take(3), toArray()),
        );

        eventBus.dispatch(ThirdTestEvent);
        eventBus.dispatch(TestEvent);
        eventBus.dispatch(AnotherTestEvent);

        const result = await events;
        expect(result.length).toBe(3);
      });

      it('should not receive events not in array', (done) => {
        const receivedEvents: FormEvent[] = [];

        eventBus.on<TestEvent | AnotherTestEvent>(['test-event', 'another-test-event']).subscribe((event) => {
          receivedEvents.push(event);
        });

        eventBus.dispatch(TestEvent);
        eventBus.dispatch(ThirdTestEvent);
        eventBus.dispatch(AnotherTestEvent);
        eventBus.dispatch(ThirdTestEvent);

        setTimeout(() => {
          expect(receivedEvents.length).toBe(2);
          expect(receivedEvents[0].type).toBe('test-event');
          expect(receivedEvents[1].type).toBe('another-test-event');
          done();
        }, 50);
      });

      it('should filter events correctly', async () => {
        const events = firstValueFrom(eventBus.on<TestEvent | AnotherTestEvent>(['test-event', 'another-test-event']).pipe(take(4), toArray()));

        eventBus.dispatch(TestEvent);
        eventBus.dispatch(ThirdTestEvent);
        eventBus.dispatch(AnotherTestEvent);
        eventBus.dispatch(ThirdTestEvent);
        eventBus.dispatch(TestEvent);
        eventBus.dispatch(AnotherTestEvent);

        const result = await events;
        expect(result.length).toBe(4);
        expect(result.every((e) => e.type === 'test-event' || e.type === 'another-test-event')).toBe(true);
      });
    });

    describe('Type Handling', () => {
      it('should handle empty array', (done) => {
        const receivedEvents: FormEvent[] = [];

        eventBus.on<never>([]).subscribe((event) => {
          receivedEvents.push(event);
        });

        eventBus.dispatch(TestEvent);
        eventBus.dispatch(AnotherTestEvent);

        setTimeout(() => {
          expect(receivedEvents.length).toBe(0);
          done();
        }, 50);
      });

      it('should handle single-item array', (done) => {
        eventBus.on<TestEvent>(['test-event']).subscribe((event) => {
          expect(event.type).toBe('test-event');
          done();
        });

        eventBus.dispatch(AnotherTestEvent);
        eventBus.dispatch(TestEvent);
      });

      it('should handle large arrays of event types', async () => {
        const events = firstValueFrom(
          eventBus.on<TestEvent | AnotherTestEvent | ThirdTestEvent>(['test-event', 'another-test-event', 'third-test-event']).pipe(take(6), toArray()),
        );

        eventBus.dispatch(TestEvent);
        eventBus.dispatch(AnotherTestEvent);
        eventBus.dispatch(ThirdTestEvent);
        eventBus.dispatch(TestEvent);
        eventBus.dispatch(AnotherTestEvent);
        eventBus.dispatch(ThirdTestEvent);

        const result = await events;
        expect(result.length).toBe(6);
      });
    });

    describe('Event Differentiation', () => {
      it('should allow distinguishing between different event types', (done) => {
        const eventTypes: string[] = [];

        eventBus.on<TestEvent | AnotherTestEvent>(['test-event', 'another-test-event']).subscribe((event) => {
          eventTypes.push(event.type);
        });

        eventBus.dispatch(TestEvent);
        eventBus.dispatch(AnotherTestEvent);
        eventBus.dispatch(TestEvent);

        setTimeout(() => {
          expect(eventTypes).toEqual(['test-event', 'another-test-event', 'test-event']);
          done();
        }, 50);
      });

      it('should preserve event.type property', (done) => {
        eventBus.on<TestEvent | AnotherTestEvent>(['test-event', 'another-test-event']).subscribe((event) => {
          expect(event.type).toBeDefined();
          expect(['test-event', 'another-test-event']).toContain(event.type);
          done();
        });

        eventBus.dispatch(TestEvent);
      });

      it('should maintain type information', (done) => {
        eventBus.on<TestEvent | TestEventWithArgs>(['test-event', 'test-event-with-args']).subscribe((event) => {
          if (event.type === 'test-event-with-args') {
            const typedEvent = event as TestEventWithArgs;
            expect(typedEvent.payload).toBe('test');
            expect(typedEvent.count).toBe(1);
            done();
          }
        });

        eventBus.dispatch(TestEvent);
        eventBus.dispatch(TestEventWithArgs, 'test', 1);
      });
    });
  });

  // Test Suite 3.5: Integration Scenarios
  describe('Integration Scenarios', () => {
    describe('Full Event Flow', () => {
      it('should support dispatch → subscribe → receive flow', (done) => {
        eventBus.dispatch(TestEvent);

        eventBus.on<TestEvent>('test-event').subscribe((event) => {
          expect(event.type).toBe('test-event');
          done();
        });

        eventBus.dispatch(TestEvent);
      });

      it('should support subscribe → dispatch → receive flow', (done) => {
        eventBus.on<TestEvent>('test-event').subscribe((event) => {
          expect(event.type).toBe('test-event');
          done();
        });

        eventBus.dispatch(TestEvent);
      });

      it('should handle interleaved dispatch and subscribe', async () => {
        const events1: FormEvent[] = [];
        const events2: FormEvent[] = [];

        eventBus.dispatch(TestEvent);

        eventBus.on<TestEvent>('test-event').subscribe((event) => events1.push(event));

        eventBus.dispatch(TestEvent);

        eventBus.on<TestEvent>('test-event').subscribe((event) => events2.push(event));

        eventBus.dispatch(TestEvent);

        await new Promise((resolve) => setTimeout(resolve, 50));

        expect(events1.length).toBe(2); // Received 2nd and 3rd dispatch
        expect(events2.length).toBe(1); // Received only 3rd dispatch
      });
    });

    describe('Event Bus Isolation', () => {
      it('should maintain separate event streams per EventBus instance', (done) => {
        const eventBus2 = new EventBus();

        const events1: FormEvent[] = [];
        const events2: FormEvent[] = [];

        eventBus.on<TestEvent>('test-event').subscribe((event) => events1.push(event));
        eventBus2.on<TestEvent>('test-event').subscribe((event) => events2.push(event));

        eventBus.dispatch(TestEvent);
        eventBus2.dispatch(TestEvent);

        setTimeout(() => {
          expect(events1.length).toBe(1);
          expect(events2.length).toBe(1);
          done();
        }, 50);
      });

      it('should not leak events between instances', (done) => {
        const eventBus2 = new EventBus();

        let eventBus1Count = 0;
        let eventBus2Count = 0;

        eventBus.on<TestEvent>('test-event').subscribe(() => eventBus1Count++);
        eventBus2.on<TestEvent>('test-event').subscribe(() => eventBus2Count++);

        eventBus.dispatch(TestEvent);
        eventBus.dispatch(TestEvent);
        eventBus2.dispatch(TestEvent);

        setTimeout(() => {
          expect(eventBus1Count).toBe(2);
          expect(eventBus2Count).toBe(1);
          done();
        }, 50);
      });
    });

    describe('Real-World Event Types', () => {
      it('should work with real event types if imported', (done) => {
        // This test demonstrates that the EventBus works with any FormEvent implementation
        class CustomFormEvent implements FormEvent {
          readonly type = 'custom-form-event' as const;
          constructor(public data: { name: string; value: number }) {}
        }

        eventBus.on<CustomFormEvent>('custom-form-event').subscribe((event) => {
          expect(event.data.name).toBe('test');
          expect(event.data.value).toBe(100);
          done();
        });

        eventBus.dispatch(CustomFormEvent, { name: 'test', value: 100 });
      });
    });

    describe('Observable Behavior', () => {
      it('should handle RxJS operators (map, filter, etc.)', async () => {
        const events = firstValueFrom(
          eventBus
            .on<TestEventWithArgs>('test-event-with-args')
            .pipe(
              take(2),
              toArray(),
            ),
        );

        eventBus.dispatch(TestEventWithArgs, 'first', 1);
        eventBus.dispatch(TestEventWithArgs, 'second', 2);

        const result = await events;
        expect(result.length).toBe(2);
        expect(result[0].payload).toBe('first');
        expect(result[1].payload).toBe('second');
      });

      it('should support async pipe usage pattern', (done) => {
        // Simulate async pipe behavior
        const observable = eventBus.on<TestEvent>('test-event');

        observable.subscribe((event) => {
          expect(event.type).toBe('test-event');
          done();
        });

        eventBus.dispatch(TestEvent);
      });
    });
  });
});
