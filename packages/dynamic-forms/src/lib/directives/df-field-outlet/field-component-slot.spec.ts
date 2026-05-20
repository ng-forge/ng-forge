import { describe, it, expect, beforeEach } from 'vitest';
import {
  ChangeDetectionStrategy,
  Component,
  createEnvironmentInjector,
  EnvironmentInjector,
  inject,
  input,
  Injector,
  ViewContainerRef,
  viewChild,
} from '@angular/core';
import { TestBed, ComponentFixture } from '@angular/core/testing';
import { FieldComponentSlot } from './field-component-slot';

@Component({
  selector: 'leaf-a',
  template: `<input data-testid="leaf-a" [value]="label() ?? ''" />`,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
class LeafAComponent {
  readonly label = input<string | undefined>(undefined);
}

@Component({
  selector: 'leaf-b',
  template: `<input data-testid="leaf-b" [value]="label() ?? ''" />`,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
class LeafBComponent {
  readonly label = input<string | undefined>(undefined);
}

@Component({
  selector: 'slot-host',
  template: `<ng-container #vcr></ng-container>`,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
class SlotHostComponent {
  readonly vcr = viewChild.required('vcr', { read: ViewContainerRef });
  readonly fieldInjector = inject(Injector);
}

describe('FieldComponentSlot', () => {
  let fixture: ComponentFixture<SlotHostComponent>;
  let host: SlotHostComponent;
  let envInjector: EnvironmentInjector;

  beforeEach(() => {
    TestBed.configureTestingModule({ imports: [SlotHostComponent] });
    fixture = TestBed.createComponent(SlotHostComponent);
    fixture.detectChanges();
    host = fixture.componentInstance;
    envInjector = createEnvironmentInjector([], TestBed.inject(EnvironmentInjector));
  });

  it('starts in the empty phase', () => {
    const slot = new FieldComponentSlot();
    expect(slot.phase()).toBe('empty');
  });

  it('mountOrReuse on empty creates the component and transitions to mounted', () => {
    const slot = new FieldComponentSlot();
    slot.mountOrReuse(host.vcr(), LeafAComponent, host.fieldInjector, envInjector, { label: 'hello' });
    expect(slot.phase()).toBe('mounted');
    expect(fixture.nativeElement.querySelector('leaf-a')).toBeTruthy();
  });

  it('mountOrReuse with the same component class reuses the existing ref', () => {
    const slot = new FieldComponentSlot();
    slot.mountOrReuse(host.vcr(), LeafAComponent, host.fieldInjector, envInjector, { label: 'first' });
    fixture.detectChanges();
    const firstHostEl = fixture.nativeElement.querySelector('leaf-a');

    slot.detach();
    expect(slot.phase()).toBe('detached');

    slot.mountOrReuse(host.vcr(), LeafAComponent, host.fieldInjector, envInjector, { label: 'second' });
    fixture.detectChanges();
    const secondHostEl = fixture.nativeElement.querySelector('leaf-a');

    expect(slot.phase()).toBe('mounted');
    // Same DOM node — `ComponentRef.hostView` was re-inserted, not recreated.
    expect(secondHostEl).toBe(firstHostEl);
  });

  it('mountOrReuse with a different component class destroys the prior ref and creates fresh', () => {
    const slot = new FieldComponentSlot();
    slot.mountOrReuse(host.vcr(), LeafAComponent, host.fieldInjector, envInjector, { label: 'a' });
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('leaf-a')).toBeTruthy();

    slot.detach();
    slot.mountOrReuse(host.vcr(), LeafBComponent, host.fieldInjector, envInjector, { label: 'b' });
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelector('leaf-a')).toBeFalsy();
    expect(fixture.nativeElement.querySelector('leaf-b')).toBeTruthy();
  });

  it('pushInputs is a no-op when the slot is empty', () => {
    const slot = new FieldComponentSlot();
    // Must not throw — there's no ref to set inputs on.
    expect(() => slot.pushInputs({ label: 'noop' })).not.toThrow();
    expect(slot.phase()).toBe('empty');
  });

  it('pushInputs with the same reference is a no-op (cached lastInputs)', () => {
    const slot = new FieldComponentSlot();
    const inputsBag = { label: 'cached' };
    slot.mountOrReuse(host.vcr(), LeafAComponent, host.fieldInjector, envInjector, inputsBag);
    // Same reference — slot's per-bag dedupe means the inner loop short-circuits.
    expect(() => slot.pushInputs(inputsBag)).not.toThrow();
    expect(slot.phase()).toBe('mounted');
  });

  it('detach transitions mounted → detached and removes the host view from the slot', () => {
    const slot = new FieldComponentSlot();
    slot.mountOrReuse(host.vcr(), LeafAComponent, host.fieldInjector, envInjector, {});
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('leaf-a')).toBeTruthy();

    slot.detach();
    fixture.detectChanges();
    expect(slot.phase()).toBe('detached');
    expect(fixture.nativeElement.querySelector('leaf-a')).toBeFalsy();
  });

  it('detach from empty is a no-op', () => {
    const slot = new FieldComponentSlot();
    expect(() => slot.detach()).not.toThrow();
    expect(slot.phase()).toBe('empty');
  });

  it('destroyOnTeardown destroys a detached ref and returns to empty', () => {
    const slot = new FieldComponentSlot();
    slot.mountOrReuse(host.vcr(), LeafAComponent, host.fieldInjector, envInjector, {});
    slot.detach();
    expect(slot.phase()).toBe('detached');

    slot.destroyOnTeardown();
    expect(slot.phase()).toBe('empty');
  });

  it('destroyOnTeardown on a still-mounted slot does NOT call destroy (outer VCR cascade owns it)', () => {
    const slot = new FieldComponentSlot();
    slot.mountOrReuse(host.vcr(), LeafAComponent, host.fieldInjector, envInjector, {});
    expect(slot.phase()).toBe('mounted');

    slot.destroyOnTeardown();
    expect(slot.phase()).toBe('empty');
  });

  it('destroyOnTeardown on empty is a no-op', () => {
    const slot = new FieldComponentSlot();
    expect(() => slot.destroyOnTeardown()).not.toThrow();
    expect(slot.phase()).toBe('empty');
  });

  it('state snapshot is frozen', () => {
    const slot = new FieldComponentSlot();
    const emptySnap = slot.snapshot();
    expect(Object.isFrozen(emptySnap)).toBe(true);

    slot.mountOrReuse(host.vcr(), LeafAComponent, host.fieldInjector, envInjector, {});
    expect(Object.isFrozen(slot.snapshot())).toBe(true);

    slot.detach();
    expect(Object.isFrozen(slot.snapshot())).toBe(true);
  });

  it('state ref stays stable across pushInputs calls (lastInputs lives outside state)', () => {
    const slot = new FieldComponentSlot();
    slot.mountOrReuse(host.vcr(), LeafAComponent, host.fieldInjector, envInjector, { label: 'a' });
    const mountedSnap = slot.snapshot();
    expect(mountedSnap.phase).toBe('mounted');

    // Push several different input bags — `state` should NOT churn because
    // `lastInputs` is a side channel, not part of the discriminated union.
    slot.pushInputs({ label: 'b' });
    expect(slot.snapshot()).toBe(mountedSnap);

    slot.pushInputs({ label: 'c' });
    expect(slot.snapshot()).toBe(mountedSnap);

    // Pushing the same reference twice also doesn't churn.
    const bag = { label: 'd' };
    slot.pushInputs(bag);
    expect(slot.snapshot()).toBe(mountedSnap);
    slot.pushInputs(bag);
    expect(slot.snapshot()).toBe(mountedSnap);
  });
});
