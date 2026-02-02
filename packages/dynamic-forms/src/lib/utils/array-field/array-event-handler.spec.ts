import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Subject } from 'rxjs';
import { observeArrayActions, ArrayAction, ArrayEvent } from './array-event-handler';
import { EventBus } from '../../events/event.bus';

describe('array-event-handler', () => {
  describe('observeArrayActions', () => {
    let eventBus: EventBus;
    let eventSubject: Subject<ArrayEvent>;

    beforeEach(() => {
      eventSubject = new Subject<ArrayEvent>();
      eventBus = {
        on: vi.fn().mockReturnValue(eventSubject.asObservable()),
      } as unknown as EventBus;
    });

    it('should subscribe to all array event types', () => {
      observeArrayActions(eventBus, () => 'testArray').subscribe();

      expect(eventBus.on).toHaveBeenCalledWith([
        'append-array-item',
        'prepend-array-item',
        'insert-array-item',
        'pop-array-item',
        'shift-array-item',
        'remove-at-index',
      ]);
    });

    it('should filter events by arrayKey', () => {
      const actions: ArrayAction[] = [];
      observeArrayActions(eventBus, () => 'myArray').subscribe((a) => actions.push(a));

      eventSubject.next({ type: 'append-array-item', arrayKey: 'myArray' });
      eventSubject.next({ type: 'append-array-item', arrayKey: 'otherArray' });

      expect(actions).toHaveLength(1);
    });

    describe('add actions', () => {
      it('should convert append-array-item to add action without index', () => {
        const actions: ArrayAction[] = [];
        observeArrayActions(eventBus, () => 'arr').subscribe((a) => actions.push(a));

        eventSubject.next({ type: 'append-array-item', arrayKey: 'arr', template: undefined });

        expect(actions[0]).toEqual({ action: 'add', template: undefined });
      });

      it('should convert append-array-item with template', () => {
        const actions: ArrayAction[] = [];
        const template = [{ key: 'field', type: 'input' }];
        observeArrayActions(eventBus, () => 'arr').subscribe((a) => actions.push(a));

        eventSubject.next({ type: 'append-array-item', arrayKey: 'arr', template } as ArrayEvent);

        expect(actions[0]).toEqual({ action: 'add', template });
      });

      it('should convert prepend-array-item to add action with index 0', () => {
        const actions: ArrayAction[] = [];
        observeArrayActions(eventBus, () => 'arr').subscribe((a) => actions.push(a));

        eventSubject.next({ type: 'prepend-array-item', arrayKey: 'arr', template: undefined });

        expect(actions[0]).toEqual({ action: 'add', template: undefined, index: 0 });
      });

      it('should convert insert-array-item to add action with specific index', () => {
        const actions: ArrayAction[] = [];
        observeArrayActions(eventBus, () => 'arr').subscribe((a) => actions.push(a));

        eventSubject.next({ type: 'insert-array-item', arrayKey: 'arr', index: 5, template: undefined });

        expect(actions[0]).toEqual({ action: 'add', template: undefined, index: 5 });
      });
    });

    describe('remove actions', () => {
      it('should convert pop-array-item to remove action without index', () => {
        const actions: ArrayAction[] = [];
        observeArrayActions(eventBus, () => 'arr').subscribe((a) => actions.push(a));

        eventSubject.next({ type: 'pop-array-item', arrayKey: 'arr' });

        expect(actions[0]).toEqual({ action: 'remove' });
      });

      it('should convert shift-array-item to remove action with index 0', () => {
        const actions: ArrayAction[] = [];
        observeArrayActions(eventBus, () => 'arr').subscribe((a) => actions.push(a));

        eventSubject.next({ type: 'shift-array-item', arrayKey: 'arr' });

        expect(actions[0]).toEqual({ action: 'remove', index: 0 });
      });

      it('should convert remove-at-index to remove action with specific index', () => {
        const actions: ArrayAction[] = [];
        observeArrayActions(eventBus, () => 'arr').subscribe((a) => actions.push(a));

        eventSubject.next({ type: 'remove-at-index', arrayKey: 'arr', index: 3 });

        expect(actions[0]).toEqual({ action: 'remove', index: 3 });
      });
    });

    it('should handle dynamic arrayKey changes', () => {
      let currentKey = 'first';
      const actions: ArrayAction[] = [];
      observeArrayActions(eventBus, () => currentKey).subscribe((a) => actions.push(a));

      eventSubject.next({ type: 'append-array-item', arrayKey: 'first' });
      currentKey = 'second';
      eventSubject.next({ type: 'append-array-item', arrayKey: 'first' });
      eventSubject.next({ type: 'append-array-item', arrayKey: 'second' });

      expect(actions).toHaveLength(2);
    });
  });
});
