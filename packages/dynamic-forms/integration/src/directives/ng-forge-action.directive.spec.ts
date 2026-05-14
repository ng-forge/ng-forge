import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { ARRAY_CONTEXT, EventBus, FormEvent } from '@ng-forge/dynamic-forms';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { NgForgeAction } from './ng-forge-action.directive';
import { NgForgeActionHost } from './host-directive-presets';

class TestSubmitEvent implements FormEvent {
  readonly type = 'test/submit';
  constructor(public readonly payload?: unknown) {}
}

class TestRemoveEvent implements FormEvent {
  readonly type = 'test/remove';
  constructor(
    public readonly arrayKey: string,
    public readonly index: number,
  ) {}
}

@Component({
  selector: 'test-action-host',
  template: '',
  changeDetection: ChangeDetectionStrategy.OnPush,
  hostDirectives: [NgForgeActionHost],
})
class TestActionHostComponent {}

describe('NgForgeAction', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({ providers: [EventBus] }).compileComponents();
  });

  describe('host bindings', () => {
    it('binds [attr.aria-disabled] when disabled() is true', () => {
      TestBed.configureTestingModule({ imports: [TestActionHostComponent], providers: [EventBus] });
      const fixture = TestBed.createComponent(TestActionHostComponent);
      fixture.componentRef.setInput('key', 'submit');
      fixture.componentRef.setInput('label', 'Submit');
      fixture.componentRef.setInput('disabled', true);
      fixture.detectChanges();

      expect((fixture.nativeElement as HTMLElement).getAttribute('aria-disabled')).toBe('true');
    });

    it('omits [attr.aria-disabled] when disabled() is false', () => {
      TestBed.configureTestingModule({ imports: [TestActionHostComponent], providers: [EventBus] });
      const fixture = TestBed.createComponent(TestActionHostComponent);
      fixture.componentRef.setInput('key', 'submit');
      fixture.componentRef.setInput('label', 'Submit');
      fixture.detectChanges();

      expect((fixture.nativeElement as HTMLElement).hasAttribute('aria-disabled')).toBe(false);
    });

    it('binds [attr.hidden] when hidden() is true', () => {
      TestBed.configureTestingModule({ imports: [TestActionHostComponent], providers: [EventBus] });
      const fixture = TestBed.createComponent(TestActionHostComponent);
      fixture.componentRef.setInput('key', 'submit');
      fixture.componentRef.setInput('label', 'Submit');
      fixture.componentRef.setInput('hidden', true);
      fixture.detectChanges();

      expect((fixture.nativeElement as HTMLElement).hasAttribute('hidden')).toBe(true);
    });

    it('inherits [id] and [data-testid] from the Shell directive', () => {
      TestBed.configureTestingModule({ imports: [TestActionHostComponent], providers: [EventBus] });
      const fixture = TestBed.createComponent(TestActionHostComponent);
      fixture.componentRef.setInput('key', 'submit-btn');
      fixture.componentRef.setInput('label', 'Submit');
      fixture.detectChanges();

      const host = fixture.nativeElement as HTMLElement;
      expect(host.getAttribute('id')).toBe('submit-btn');
      expect(host.getAttribute('data-testid')).toBe('submit-btn');
    });
  });

  describe('dispatch()', () => {
    it('does nothing when no event input is provided', () => {
      TestBed.configureTestingModule({ imports: [TestActionHostComponent] });
      const eventBus = TestBed.inject(EventBus);
      const dispatchSpy = vi.spyOn(eventBus, 'dispatch');
      const fixture = TestBed.createComponent(TestActionHostComponent);
      fixture.componentRef.setInput('key', 'submit');
      fixture.componentRef.setInput('label', 'Submit');
      fixture.detectChanges();

      const action = fixture.componentRef.injector.get(NgForgeAction);
      action.dispatch();

      expect(dispatchSpy).not.toHaveBeenCalled();
    });

    it('dispatches the event with no args when eventArgs is unset', () => {
      TestBed.configureTestingModule({ imports: [TestActionHostComponent] });
      const eventBus = TestBed.inject(EventBus);
      const dispatchSpy = vi.spyOn(eventBus, 'dispatch');
      const fixture = TestBed.createComponent(TestActionHostComponent);
      fixture.componentRef.setInput('key', 'submit');
      fixture.componentRef.setInput('label', 'Submit');
      fixture.componentRef.setInput('event', TestSubmitEvent);
      fixture.detectChanges();

      const action = fixture.componentRef.injector.get(NgForgeAction);
      action.dispatch();

      expect(dispatchSpy).toHaveBeenCalledWith(TestSubmitEvent);
    });

    it('resolves $key / $index / $arrayKey tokens via ARRAY_CONTEXT', () => {
      TestBed.configureTestingModule({
        imports: [TestActionHostComponent],
        providers: [
          EventBus,
          {
            provide: ARRAY_CONTEXT,
            useValue: {
              arrayKey: 'contacts',
              index: signal(2),
              formValue: { contacts: [] },
              field: undefined,
            },
          },
        ],
      });
      const eventBus = TestBed.inject(EventBus);
      const dispatchSpy = vi.spyOn(eventBus, 'dispatch');
      const fixture = TestBed.createComponent(TestActionHostComponent);
      fixture.componentRef.setInput('key', 'remove');
      fixture.componentRef.setInput('label', 'Remove');
      fixture.componentRef.setInput('event', TestRemoveEvent);
      fixture.componentRef.setInput('eventArgs', ['$arrayKey', '$index']);
      fixture.detectChanges();

      const action = fixture.componentRef.injector.get(NgForgeAction);
      action.dispatch();

      expect(dispatchSpy).toHaveBeenCalledWith(TestRemoveEvent, 'contacts', 2);
    });

    it('falls back to the explicit eventContext input when no ARRAY_CONTEXT is provided', () => {
      TestBed.configureTestingModule({ imports: [TestActionHostComponent] });
      const eventBus = TestBed.inject(EventBus);
      const dispatchSpy = vi.spyOn(eventBus, 'dispatch');
      const fixture = TestBed.createComponent(TestActionHostComponent);
      fixture.componentRef.setInput('key', 'remove');
      fixture.componentRef.setInput('label', 'Remove');
      fixture.componentRef.setInput('event', TestRemoveEvent);
      fixture.componentRef.setInput('eventArgs', ['$arrayKey', '$index']);
      fixture.componentRef.setInput('eventContext', { key: 'remove', arrayKey: 'items', index: 5, formValue: {} });
      fixture.detectChanges();

      const action = fixture.componentRef.injector.get(NgForgeAction);
      action.dispatch();

      expect(dispatchSpy).toHaveBeenCalledWith(TestRemoveEvent, 'items', 5);
    });
  });

  describe('NG_FORGE_ACTION_INPUTS lockstep with declared inputs', () => {
    // The lockstep guarantee is enforced by a compile-time type assertion in
    // ng-forge-action.directive.ts (see `_NG_FORGE_ACTION_INPUTS_LOCKSTEP`).
    // This test is the runtime smoke check that the preset composition
    // instantiates cleanly.
    it('instantiates cleanly with the NgForgeActionHost wrapper', () => {
      TestBed.configureTestingModule({ imports: [TestActionHostComponent] });
      expect(() => TestBed.createComponent(TestActionHostComponent)).not.toThrow();
    });
  });
});
