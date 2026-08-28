import { ChangeDetectionStrategy, Component, ComponentRef, input, signal, viewChild, ViewContainerRef } from '@angular/core';
import { disabled, FieldTree, form, FormField, schema } from '@angular/forms/signals';
import { TestBed } from '@angular/core/testing';
import { beforeEach, describe, expect, it } from 'vitest';

/**
 * Go/no-go spike for field parking. Asserts the properties the design rests on,
 * against raw Signal Forms with no ng-forge in the way:
 *
 * 1. `ɵngControlUpdate` — the 16 field-state reads Angular runs per bound field
 *    — stops firing on a cross-field change once the view is detached
 * 2. a detached view still writes user input through to the model
 * 3. re-attaching resyncs the DOM
 *
 * Parking is applied through `ComponentRef.changeDetectorRef`, mirroring where
 * it would live for real: `FieldComponentSlot`, which owns the ref for every
 * field component including consumer-authored ones.
 *
 * Scope note: this covers the *update* path only. Whether detaching also skips
 * the producer poll for fields whose own state is unchanged is a timing
 * question the unit layer cannot see; that belongs to the browser benchmark.
 */

interface Model {
  a: string;
  b: string;
}

// `b`'s disabled state toggles on every keystroke in `a`, so `b`'s control
// update has a genuine reason to run when `a` changes.
const testSchema = schema<Model>((path) => {
  disabled(path.b, (ctx) => ctx.valueOf(path.a).length % 2 === 1);
});

@Component({
  selector: 'sp-leaf',
  template: `<input [formField]="field()" />`,
  imports: [FormField],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
class LeafComponent {
  readonly field = input.required<FieldTree<string>>();
  readonly formField = viewChild.required(FormField);
}

@Component({
  selector: 'sp-host',
  template: `<ng-container #slot />`,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
class HostComponent {
  readonly model = signal<Model>({ a: '', b: '' });
  readonly f = form(this.model, testSchema);
  readonly slot = viewChild.required('slot', { read: ViewContainerRef });

  readonly refs = {} as Record<'a' | 'b', ComponentRef<LeafComponent>>;

  mount(): void {
    for (const key of ['a', 'b'] as const) {
      const ref = this.slot().createComponent(LeafComponent);
      ref.setInput('field', this.f[key]);
      (ref.location.nativeElement as HTMLElement).classList.add(key);
      this.refs[key] = ref;
    }
  }
}

/** Wraps the directive's control-update hook so we can count invocations. */
function countControlUpdates(ref: ComponentRef<LeafComponent>): () => number {
  const ff = ref.instance.formField() as unknown as Record<string, (host: unknown) => void>;
  const original = ff['ɵngControlUpdate'].bind(ff);
  let calls = 0;
  ff['ɵngControlUpdate'] = (host: unknown) => {
    calls++;
    original(host);
  };
  return () => calls;
}

describe('parking mechanism (raw Signal Forms)', () => {
  let fixture: ReturnType<typeof TestBed.createComponent<HostComponent>>;
  let host: HostComponent;

  const inputFor = (which: 'a' | 'b'): HTMLInputElement => fixture.nativeElement.querySelector(`.${which} input`);

  const type = (which: 'a' | 'b', text: string) => {
    const el = inputFor(which);
    el.value = text;
    el.dispatchEvent(new Event('input'));
    fixture.detectChanges();
  };

  beforeEach(async () => {
    fixture = TestBed.createComponent(HostComponent);
    host = fixture.componentInstance;
    fixture.detectChanges();
    host.mount();
    fixture.detectChanges();
    await fixture.whenStable();
  });

  it('runs b control update when a cross-dependent field changes', () => {
    const bUpdates = countControlUpdates(host.refs.b);
    type('a', 'x');
    type('a', 'xy');
    expect(bUpdates()).toBeGreaterThan(0);
  });

  it('stops running b control update once b view is detached', () => {
    const bUpdates = countControlUpdates(host.refs.b);
    host.refs.b.changeDetectorRef.detach();
    fixture.detectChanges();

    const before = bUpdates();
    type('a', 'x');
    type('a', 'xy');
    expect(bUpdates()).toBe(before);
  });

  it('still writes user input through to the model while detached', () => {
    host.refs.b.changeDetectorRef.detach();
    fixture.detectChanges();

    type('b', 'typed while parked');
    expect(host.f.b().value()).toBe('typed while parked');
  });

  it('resyncs the DOM on reattach', async () => {
    host.refs.b.changeDetectorRef.detach();
    fixture.detectChanges();

    // Model moves while parked; the parked DOM must not show it yet.
    host.f.b().value.set('set while parked');
    fixture.detectChanges();
    expect(inputFor('b').value).toBe('');

    host.refs.b.changeDetectorRef.reattach();
    host.refs.b.changeDetectorRef.markForCheck();
    fixture.detectChanges();
    await fixture.whenStable();
    expect(inputFor('b').value).toBe('set while parked');
  });
});
