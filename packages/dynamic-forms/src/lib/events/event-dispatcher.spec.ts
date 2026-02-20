import { TestBed } from '@angular/core/testing';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { EventDispatcher } from './event-dispatcher';
import { EventBus } from './event.bus';
import { FormEvent } from './interfaces/form-event';

class TestEvent implements FormEvent {
  readonly type = 'test-event' as const;
}

class TestEventWithPayload implements FormEvent {
  readonly type = 'test-event-with-payload' as const;
  constructor(public readonly payload: string) {}
}

describe('EventDispatcher', () => {
  let dispatcher: EventDispatcher;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [EventDispatcher, EventBus],
    });
    dispatcher = TestBed.inject(EventDispatcher);
  });

  describe('dispatch() before connect()', () => {
    it('should be a no-op when no bus is connected', () => {
      // Should not throw
      expect(() => dispatcher.dispatch(new TestEvent())).not.toThrow();
    });
  });

  describe('connect() + dispatch()', () => {
    it('should forward dispatched events to the connected EventBus', () => {
      const bus = TestBed.inject(EventBus);
      const received: FormEvent[] = [];
      bus.events$.subscribe((e) => received.push(e));

      dispatcher.connect(bus);
      const event = new TestEvent();
      dispatcher.dispatch(event);

      expect(received).toHaveLength(1);
      expect(received[0].type).toBe('test-event');
    });

    it('should forward events with payloads correctly', () => {
      const bus = TestBed.inject(EventBus);
      const received: FormEvent[] = [];
      bus.events$.subscribe((e) => received.push(e));

      dispatcher.connect(bus);
      dispatcher.dispatch(new TestEventWithPayload('hello'));

      expect(received).toHaveLength(1);
      expect((received[0] as TestEventWithPayload).payload).toBe('hello');
    });

    it('should preserve the event instance prototype chain', () => {
      const bus = TestBed.inject(EventBus);
      const received: FormEvent[] = [];
      bus.events$.subscribe((e) => received.push(e));

      dispatcher.connect(bus);
      dispatcher.dispatch(new TestEvent());

      expect(received[0]).toBeInstanceOf(TestEvent);
    });

    it('should call emitInstance on the bus', () => {
      const bus = TestBed.inject(EventBus);
      const spy = vi.spyOn(bus, 'emitInstance');

      dispatcher.connect(bus);
      const event = new TestEvent();
      dispatcher.dispatch(event);

      expect(spy).toHaveBeenCalledWith(event);
    });
  });

  describe('disconnect()', () => {
    it('should stop forwarding events after disconnect', () => {
      const bus = TestBed.inject(EventBus);
      const received: FormEvent[] = [];
      bus.events$.subscribe((e) => received.push(e));

      dispatcher.connect(bus);
      dispatcher.dispatch(new TestEvent());
      expect(received).toHaveLength(1);

      dispatcher.disconnect();
      dispatcher.dispatch(new TestEvent());
      expect(received).toHaveLength(1); // no new events after disconnect
    });

    it('should be a no-op when called without a prior connect', () => {
      expect(() => dispatcher.disconnect()).not.toThrow();
    });
  });

  describe('reconnect', () => {
    it('should forward to the new bus after reconnecting', () => {
      const busA = TestBed.inject(EventBus);
      const busB = new EventBus(); // independent instance, no DI needed

      const receivedA: FormEvent[] = [];
      const receivedB: FormEvent[] = [];
      busA.events$.subscribe((e) => receivedA.push(e));
      busB.events$.subscribe((e) => receivedB.push(e));

      dispatcher.connect(busA);
      dispatcher.dispatch(new TestEvent());
      expect(receivedA).toHaveLength(1);

      dispatcher.disconnect();
      dispatcher.connect(busB);
      dispatcher.dispatch(new TestEvent());
      expect(receivedA).toHaveLength(1); // busA gets nothing new
      expect(receivedB).toHaveLength(1); // busB receives the event
    });
  });
});
