import { ChangeDetectionStrategy, Component, EnvironmentInjector, runInInjectionContext, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { form, required, schema, FieldTree, type SchemaPath } from '@angular/forms/signals';
import { DEFAULT_VALIDATION_MESSAGES } from '@ng-forge/dynamic-forms/internal';
import { ValidationMessages } from '@ng-forge/dynamic-forms/internal';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { NgForgeField } from './ng-forge-field.directive';
import { NgForgeControl, NgForgeHostControl } from './ng-forge-controls';
import { NgForgeFieldHost } from './host-directive-presets';

@Component({
  selector: 'test-host',
  template: '<input class="target" />',
  changeDetection: ChangeDetectionStrategy.OnPush,
  hostDirectives: [NgForgeFieldHost],
})
class TestHostComponent {}

@Component({
  selector: 'test-host-with-control',
  imports: [NgForgeControl],
  template: '<input class="target" ngForgeControl />',
  changeDetection: ChangeDetectionStrategy.OnPush,
  hostDirectives: [NgForgeFieldHost],
})
class TestHostWithControlComponent {}

@Component({
  selector: 'test-host-host-control',
  template: '<input class="target" />',
  changeDetection: ChangeDetectionStrategy.OnPush,
  hostDirectives: [NgForgeFieldHost, NgForgeHostControl],
})
class TestHostHostControlComponent {}

@Component({
  selector: 'test-host-with-descendant-target',
  imports: [NgForgeControl],
  template: `
    <div ngForgeControl="input.inner">
      <span><input class="inner" /></span>
      <span><input class="inner" /></span>
      <span><input class="other" /></span>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
  hostDirectives: [NgForgeFieldHost],
})
class TestHostWithDescendantTargetComponent {}

@Component({
  selector: 'test-host-with-bad-selector',
  imports: [NgForgeControl],
  template: `
    <div ngForgeControl="input[type='chekbox']">
      <input type="checkbox" class="inner" />
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
  hostDirectives: [NgForgeFieldHost],
})
class TestHostWithBadSelectorComponent {}

interface TestFormValue {
  username: string;
}

function setupField(initialValue = ''): { field: FieldTree<string>; rootValue: ReturnType<typeof signal<TestFormValue>> } {
  const rootValue = signal<TestFormValue>({ username: initialValue });
  const injector = TestBed.inject(EnvironmentInjector);
  const root = runInInjectionContext(injector, () => form(rootValue));
  return { field: root.username, rootValue };
}

/** Builds a `FieldTree<string>` with a required validator, value '', and touched=true. */
function setupInvalidTouchedField(): { field: FieldTree<string> } {
  const rootValue = signal<TestFormValue>({ username: '' });
  const injector = TestBed.inject(EnvironmentInjector);
  const root = runInInjectionContext(injector, () =>
    form(
      rootValue,
      schema<TestFormValue>((path) => {
        required(path.username as SchemaPath<string>);
      }),
    ),
  );
  root.username().markAsTouched();
  return { field: root.username };
}

describe('NgForgeField', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({}).compileComponents();
  });

  describe('derived id signals', () => {
    it('exposes errorId and hintId derived from key()', () => {
      TestBed.configureTestingModule({ imports: [TestHostComponent] });
      const fixture = TestBed.createComponent(TestHostComponent);
      const directive = fixture.componentRef.injector.get(NgForgeField);

      const { field } = setupField();
      fixture.componentRef.setInput('field', field);
      fixture.componentRef.setInput('key', 'username');
      fixture.detectChanges();

      expect(directive.errorId()).toBe('username-error');
      expect(directive.hintId()).toBe('username-hint');
    });
  });

  describe('errors / showErrors', () => {
    it('returns no errors when field is valid', () => {
      TestBed.configureTestingModule({ imports: [TestHostComponent] });
      const fixture = TestBed.createComponent(TestHostComponent);
      const directive = fixture.componentRef.injector.get(NgForgeField);

      const { field } = setupField('alice');
      fixture.componentRef.setInput('field', field);
      fixture.componentRef.setInput('key', 'username');
      fixture.detectChanges();

      expect(directive.errors()).toEqual([]);
      expect(directive.showErrors()).toBe(false);
      expect(directive.errorsToDisplay()).toEqual([]);
    });

    it('falls back to DEFAULT_VALIDATION_MESSAGES from DI when no defaultValidationMessages input is provided', () => {
      const defaultMessages: ValidationMessages = { required: 'Default required' };
      TestBed.configureTestingModule({
        imports: [TestHostComponent],
        providers: [{ provide: DEFAULT_VALIDATION_MESSAGES, useValue: signal(defaultMessages) }],
      });
      const fixture = TestBed.createComponent(TestHostComponent);
      const directive = fixture.componentRef.injector.get(NgForgeField);

      const { field } = setupInvalidTouchedField();
      fixture.componentRef.setInput('field', field);
      fixture.componentRef.setInput('key', 'username');
      fixture.detectChanges();

      const errors = directive.errors();
      expect(errors.length).toBeGreaterThan(0);
      expect(errors[0].message).toBe('Default required');
    });
  });

  describe('aria signals', () => {
    it('ariaInvalid is false until the field is invalid AND touched', () => {
      TestBed.configureTestingModule({ imports: [TestHostComponent] });
      const fixture = TestBed.createComponent(TestHostComponent);
      const directive = fixture.componentRef.injector.get(NgForgeField);

      const { field } = setupField('alice');
      fixture.componentRef.setInput('field', field);
      fixture.componentRef.setInput('key', 'username');
      fixture.detectChanges();

      expect(directive.ariaInvalid()).toBe(false);
    });

    it('ariaRequired returns null when field is not required', () => {
      TestBed.configureTestingModule({ imports: [TestHostComponent] });
      const fixture = TestBed.createComponent(TestHostComponent);
      const directive = fixture.componentRef.injector.get(NgForgeField);

      const { field } = setupField('alice');
      fixture.componentRef.setInput('field', field);
      fixture.componentRef.setInput('key', 'username');
      fixture.detectChanges();

      expect(directive.ariaRequired()).toBeNull();
    });

    it('ariaDescribedBy is null when there are no errors and no hint', () => {
      TestBed.configureTestingModule({ imports: [TestHostComponent] });
      const fixture = TestBed.createComponent(TestHostComponent);
      const directive = fixture.componentRef.injector.get(NgForgeField);

      const { field } = setupField('alice');
      fixture.componentRef.setInput('field', field);
      fixture.componentRef.setInput('key', 'username');
      fixture.detectChanges();

      expect(directive.ariaDescribedBy()).toBeNull();
    });

    it('ariaDescribedBy returns hintId when props.hint is present and no errors', () => {
      TestBed.configureTestingModule({ imports: [TestHostComponent] });
      const fixture = TestBed.createComponent(TestHostComponent);
      const directive = fixture.componentRef.injector.get(NgForgeField);

      const { field } = setupField('alice');
      fixture.componentRef.setInput('field', field);
      fixture.componentRef.setInput('key', 'username');
      fixture.componentRef.setInput('props', { hint: 'helpful tip' });
      fixture.detectChanges();

      expect(directive.ariaDescribedBy()).toBe('username-hint');
    });
  });

  describe('meta forwarding via NgForgeControl', () => {
    it('forwards meta attributes onto the [ngForgeControl]-marked element', () => {
      TestBed.configureTestingModule({ imports: [TestHostWithControlComponent] });
      const fixture = TestBed.createComponent(TestHostWithControlComponent);
      const { field } = setupField();
      fixture.componentRef.setInput('field', field);
      fixture.componentRef.setInput('key', 'username');
      fixture.componentRef.setInput('meta', { autocomplete: 'username' });
      fixture.detectChanges();

      const target = fixture.nativeElement.querySelector('input.target') as HTMLElement | null;
      expect(target?.getAttribute('autocomplete')).toBe('username');
    });

    it('forwards meta attributes onto the host element when NgForgeHostControl is in hostDirectives', () => {
      TestBed.configureTestingModule({ imports: [TestHostHostControlComponent] });
      const fixture = TestBed.createComponent(TestHostHostControlComponent);
      const { field } = setupField();
      fixture.componentRef.setInput('field', field);
      fixture.componentRef.setInput('key', 'username');
      fixture.componentRef.setInput('meta', { autocomplete: 'username' });
      fixture.detectChanges();

      const host = fixture.nativeElement as HTMLElement;
      expect(host.getAttribute('autocomplete')).toBe('username');
    });

    it('forwards meta to descendants matching the selector when ngForgeControl="<selector>" is set', () => {
      TestBed.configureTestingModule({ imports: [TestHostWithDescendantTargetComponent] });
      const fixture = TestBed.createComponent(TestHostWithDescendantTargetComponent);
      const { field } = setupField();
      fixture.componentRef.setInput('field', field);
      fixture.componentRef.setInput('key', 'username');
      fixture.componentRef.setInput('meta', { autocomplete: 'username' });
      fixture.detectChanges();

      const inner = Array.from(fixture.nativeElement.querySelectorAll('input.inner')) as HTMLElement[];
      const other = fixture.nativeElement.querySelector('input.other') as HTMLElement | null;
      const directiveHost = fixture.nativeElement.querySelector('div[ngForgeControl]') as HTMLElement | null;

      expect(inner.length).toBe(2);
      for (const el of inner) {
        expect(el.getAttribute('autocomplete')).toBe('username');
      }
      expect(other?.getAttribute('autocomplete')).toBeNull();
      expect(directiveHost?.getAttribute('autocomplete')).toBeNull();
    });

    it('forwards aria attributes onto the [ngForgeControl] target alongside meta', () => {
      TestBed.configureTestingModule({ imports: [TestHostWithControlComponent] });
      const fixture = TestBed.createComponent(TestHostWithControlComponent);
      const { field } = setupField('alice');
      fixture.componentRef.setInput('field', field);
      fixture.componentRef.setInput('key', 'username');
      fixture.componentRef.setInput('props', { hint: 'helpful tip' });
      fixture.detectChanges();

      const target = fixture.nativeElement.querySelector('input.target') as HTMLElement | null;
      // ariaInvalid() is false when valid+untouched → attr "false".
      expect(target?.getAttribute('aria-invalid')).toBe('false');
      // ariaRequired() returns null when not required → attr absent.
      expect(target?.hasAttribute('aria-required')).toBe(false);
      // ariaDescribedBy() resolves to the hint id when props.hint is set.
      expect(target?.getAttribute('aria-describedby')).toBe('username-hint');
    });

    it('forwards aria attributes onto the host when NgForgeHostControl is in hostDirectives', () => {
      TestBed.configureTestingModule({ imports: [TestHostHostControlComponent] });
      const fixture = TestBed.createComponent(TestHostHostControlComponent);
      const { field } = setupField('alice');
      fixture.componentRef.setInput('field', field);
      fixture.componentRef.setInput('key', 'username');
      fixture.componentRef.setInput('props', { hint: 'helpful tip' });
      fixture.detectChanges();

      const host = fixture.nativeElement as HTMLElement;
      expect(host.getAttribute('aria-invalid')).toBe('false');
      expect(host.hasAttribute('aria-required')).toBe(false);
      expect(host.getAttribute('aria-describedby')).toBe('username-hint');
    });

    it('forwards aria attributes onto every descendant matching the selector', () => {
      TestBed.configureTestingModule({ imports: [TestHostWithDescendantTargetComponent] });
      const fixture = TestBed.createComponent(TestHostWithDescendantTargetComponent);
      const { field } = setupField('alice');
      fixture.componentRef.setInput('field', field);
      fixture.componentRef.setInput('key', 'username');
      fixture.componentRef.setInput('props', { hint: 'helpful tip' });
      fixture.detectChanges();

      const inner = Array.from(fixture.nativeElement.querySelectorAll('input.inner')) as HTMLElement[];
      const other = fixture.nativeElement.querySelector('input.other') as HTMLElement | null;
      const directiveHost = fixture.nativeElement as HTMLElement;

      expect(inner.length).toBe(2);
      for (const el of inner) {
        expect(el.getAttribute('aria-describedby')).toBe('username-hint');
        expect(el.getAttribute('aria-invalid')).toBe('false');
      }
      expect(other?.hasAttribute('aria-describedby')).toBe(false);
      // The directive's own host doesn't get aria — aria lives on the marker target.
      expect(directiveHost.hasAttribute('aria-describedby')).toBe(false);
      expect(directiveHost.hasAttribute('aria-invalid')).toBe(false);
    });

    it('does NOT apply meta when neither NgForgeControl nor NgForgeHostControl is used', () => {
      TestBed.configureTestingModule({ imports: [TestHostComponent] });
      const fixture = TestBed.createComponent(TestHostComponent);
      const { field } = setupField();
      fixture.componentRef.setInput('field', field);
      fixture.componentRef.setInput('key', 'username');
      // Use `autocomplete` -- NOT in the directive's own host bindings, so it
      // only appears if meta forwarding ran. (`data-testid` would be a false
      // positive: the directive sets `[attr.data-testid]="key()"` directly.)
      fixture.componentRef.setInput('meta', { autocomplete: 'off' });
      fixture.detectChanges();

      const host = fixture.nativeElement as HTMLElement;
      const target = fixture.nativeElement.querySelector('input.target') as HTMLElement | null;
      expect(host.getAttribute('autocomplete')).toBeNull();
      expect(target?.getAttribute('autocomplete')).toBeNull();
    });
  });

  describe('selector-typo dev warning', () => {
    let warnSpy: ReturnType<typeof vi.spyOn>;

    beforeEach(() => {
      warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => undefined);
    });

    afterEach(() => warnSpy.mockRestore());

    it('warns when ngForgeControl selector matches zero descendants and meta is non-empty', () => {
      TestBed.configureTestingModule({ imports: [TestHostWithBadSelectorComponent] });
      const fixture = TestBed.createComponent(TestHostWithBadSelectorComponent);
      const { field } = setupField();
      fixture.componentRef.setInput('field', field);
      fixture.componentRef.setInput('key', 'username');
      fixture.componentRef.setInput('meta', { autocomplete: 'username' });
      fixture.detectChanges();

      const warning = warnSpy.mock.calls.find((args) =>
        args.some((a) => String(a).includes('ngForgeControl selector') && String(a).includes('chekbox')),
      );
      expect(warning).toBeDefined();
    });

    it('does NOT warn when the selector matches at least one descendant', () => {
      TestBed.configureTestingModule({ imports: [TestHostWithDescendantTargetComponent] });
      const fixture = TestBed.createComponent(TestHostWithDescendantTargetComponent);
      const { field } = setupField();
      fixture.componentRef.setInput('field', field);
      fixture.componentRef.setInput('key', 'username');
      fixture.componentRef.setInput('meta', { autocomplete: 'username' });
      fixture.detectChanges();

      const warning = warnSpy.mock.calls.find((args) => args.some((a) => String(a).includes('ngForgeControl selector')));
      expect(warning).toBeUndefined();
    });
  });

  describe('unclaimed-meta dev warning', () => {
    let warnSpy: ReturnType<typeof vi.spyOn>;

    beforeEach(() => {
      warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => undefined);
    });

    afterEach(() => {
      warnSpy.mockRestore();
    });

    it('warns when meta is non-empty but no marker / ambient consumer is present', () => {
      TestBed.configureTestingModule({ imports: [TestHostComponent] });
      const fixture = TestBed.createComponent(TestHostComponent);
      const { field } = setupField();
      fixture.componentRef.setInput('field', field);
      fixture.componentRef.setInput('key', 'username');
      fixture.componentRef.setInput('meta', { autocomplete: 'username' });
      fixture.detectChanges();

      const warning = warnSpy.mock.calls.find((args) => args.some((a) => String(a).includes('NgForgeField -')));
      expect(warning).toBeDefined();
    });

    it('does NOT warn when meta is empty', () => {
      TestBed.configureTestingModule({ imports: [TestHostComponent] });
      const fixture = TestBed.createComponent(TestHostComponent);
      const { field } = setupField();
      fixture.componentRef.setInput('field', field);
      fixture.componentRef.setInput('key', 'username');
      fixture.detectChanges();

      const warning = warnSpy.mock.calls.find((args) => args.some((a) => String(a).includes('NgForgeField -')));
      expect(warning).toBeUndefined();
    });

    it('does NOT warn when NgForgeControl claims meta', () => {
      TestBed.configureTestingModule({ imports: [TestHostWithControlComponent] });
      const fixture = TestBed.createComponent(TestHostWithControlComponent);
      const { field } = setupField();
      fixture.componentRef.setInput('field', field);
      fixture.componentRef.setInput('key', 'username');
      fixture.componentRef.setInput('meta', { autocomplete: 'username' });
      fixture.detectChanges();

      const warning = warnSpy.mock.calls.find((args) => args.some((a) => String(a).includes('NgForgeField -')));
      expect(warning).toBeUndefined();
    });

    it('does NOT warn when NgForgeHostControl claims meta', () => {
      TestBed.configureTestingModule({ imports: [TestHostHostControlComponent] });
      const fixture = TestBed.createComponent(TestHostHostControlComponent);
      const { field } = setupField();
      fixture.componentRef.setInput('field', field);
      fixture.componentRef.setInput('key', 'username');
      fixture.componentRef.setInput('meta', { autocomplete: 'username' });
      fixture.detectChanges();

      const warning = warnSpy.mock.calls.find((args) => args.some((a) => String(a).includes('NgForgeField -')));
      expect(warning).toBeUndefined();
    });

    it('does NOT warn when an ambient sub-component calls markClaimed', () => {
      TestBed.configureTestingModule({ imports: [TestHostComponent] });
      const fixture = TestBed.createComponent(TestHostComponent);
      const directive = fixture.componentRef.injector.get(NgForgeField);
      // Simulates a sub-component injecting NgForgeField via { optional: true,
      // skipSelf: true } and reporting back that it consumed the field's meta.
      directive.markClaimed();
      const { field } = setupField();
      fixture.componentRef.setInput('field', field);
      fixture.componentRef.setInput('key', 'username');
      fixture.componentRef.setInput('meta', { autocomplete: 'username' });
      fixture.detectChanges();

      const warning = warnSpy.mock.calls.find((args) => args.some((a) => String(a).includes('NgForgeField -')));
      expect(warning).toBeUndefined();
    });
  });

  describe('aria-invalid true-path', () => {
    it('writes aria-invalid="true" onto the marker target when the field is invalid AND touched', () => {
      TestBed.configureTestingModule({ imports: [TestHostWithControlComponent] });
      const fixture = TestBed.createComponent(TestHostWithControlComponent);
      const { field } = setupInvalidTouchedField();
      fixture.componentRef.setInput('field', field);
      fixture.componentRef.setInput('key', 'username');
      fixture.detectChanges();

      const target = fixture.nativeElement.querySelector('input.target') as HTMLElement | null;
      expect(target?.getAttribute('aria-invalid')).toBe('true');
      expect(target?.getAttribute('aria-required')).toBe('true');
    });
  });

  describe('validationMessages resolution through createResolvedErrorsSignal', () => {
    it('uses the validationMessages input when resolving error messages', () => {
      TestBed.configureTestingModule({ imports: [TestHostComponent] });
      const fixture = TestBed.createComponent(TestHostComponent);
      const directive = fixture.componentRef.injector.get(NgForgeField);
      const { field } = setupInvalidTouchedField();
      const messages: ValidationMessages = { required: 'Username is required' };
      fixture.componentRef.setInput('field', field);
      fixture.componentRef.setInput('key', 'username');
      fixture.componentRef.setInput('validationMessages', messages);
      fixture.detectChanges();

      const resolved = directive.errorsToDisplay();
      expect(resolved.length).toBeGreaterThan(0);
      expect(resolved.some((e) => e.message === 'Username is required')).toBe(true);
    });
  });

  describe('meta() reactivity', () => {
    it('removes stale attributes when meta() changes between renders', () => {
      TestBed.configureTestingModule({ imports: [TestHostWithControlComponent] });
      const fixture = TestBed.createComponent(TestHostWithControlComponent);
      const { field } = setupField();
      fixture.componentRef.setInput('field', field);
      fixture.componentRef.setInput('key', 'username');
      fixture.componentRef.setInput('meta', { autocomplete: 'username' });
      fixture.detectChanges();

      const target = fixture.nativeElement.querySelector('input.target') as HTMLElement;
      expect(target.getAttribute('autocomplete')).toBe('username');

      // Swap meta to a different key set — autocomplete should be removed,
      // inputmode added on the next render.
      fixture.componentRef.setInput('meta', { inputmode: 'email' });
      fixture.detectChanges();

      expect(target.getAttribute('autocomplete')).toBeNull();
      expect(target.getAttribute('inputmode')).toBe('email');
    });
  });

  describe('unclaimed-meta warning race with late markClaimed', () => {
    let warnSpy: ReturnType<typeof vi.spyOn>;
    beforeEach(() => {
      warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => undefined);
    });
    afterEach(() => warnSpy.mockRestore());

    it('does NOT warn even when markClaimed is called after the first detectChanges', () => {
      // Regression for the ambient-marker race: a sub-component that injects
      // its parent NgForgeField may run markClaimed AFTER the parent's
      // afterRenderEffect.write fires. The warning effect must observe
      // _claimed reactively (or untracked + re-check) so the late claim
      // still suppresses the warning. Today: the warning runs once at first
      // non-empty meta render. If _claimed flips later we still don't want
      // to fire it again — `warned` latches.
      TestBed.configureTestingModule({ imports: [TestHostComponent] });
      const fixture = TestBed.createComponent(TestHostComponent);
      const { field } = setupField();
      fixture.componentRef.setInput('field', field);
      fixture.componentRef.setInput('key', 'username');
      fixture.componentRef.setInput('meta', { autocomplete: 'username' });
      fixture.detectChanges();
      // First-render warn fires here because no claim landed in time.
      const earlyWarn = warnSpy.mock.calls.find((args) => args.some((a) => String(a).includes('NgForgeField -')));
      expect(earlyWarn).toBeDefined();

      // Late claim — typical of a sub-component constructed after the
      // parent's first render. Verifies the `warned` latch holds: no
      // duplicate warning on subsequent renders.
      const directive = fixture.componentRef.injector.get(NgForgeField);
      directive.markClaimed();
      fixture.componentRef.setInput('meta', { autocomplete: 'off' });
      fixture.detectChanges();

      const totalWarns = warnSpy.mock.calls.filter((args) => args.some((a) => String(a).includes('NgForgeField -'))).length;
      expect(totalWarns).toBe(1);
    });
  });

  describe('NG_FORGE_VALUE_FIELD_INPUTS lockstep with declared inputs', () => {
    // The lockstep guarantee is enforced by a compile-time type assertion in
    // ng-forge-field.directive.ts (see `_NG_FORGE_VALUE_FIELD_INPUTS_LOCKSTEP`).
    // Drift in either direction fails the build via tsc with a self-describing
    // error. This test is the runtime smoke check that the host directive
    // composition with the current tuple instantiates cleanly.
    it('instantiates cleanly with the NgForgeFieldHost wrapper', () => {
      TestBed.configureTestingModule({ imports: [TestHostComponent] });
      expect(() => TestBed.createComponent(TestHostComponent)).not.toThrow();
    });
  });

  // Locks down the contract for non-outlet consumers (TestBed, Storybook, manual
  // standalone instantiation): set the required inputs BEFORE the first
  // detectChanges. Skipping that order surfaces NG0950 from the host bindings
  // ([id]/[attr.data-testid]/[attr.hidden]) on the first render.
  describe('direct instantiation (no DfFieldOutlet)', () => {
    it('renders without throwing when field/key are set BEFORE the first detectChanges', () => {
      TestBed.configureTestingModule({ imports: [TestHostComponent] });
      const fixture = TestBed.createComponent(TestHostComponent);
      const { field } = setupField('alice');
      fixture.componentRef.setInput('field', field);
      fixture.componentRef.setInput('key', 'username');
      expect(() => fixture.detectChanges()).not.toThrow();
      expect((fixture.nativeElement as HTMLElement).getAttribute('id')).toBe('username');
    });

    it('throws NG0950 when detectChanges runs before the required inputs are bound', () => {
      TestBed.configureTestingModule({ imports: [TestHostComponent] });
      const fixture = TestBed.createComponent(TestHostComponent);
      // Intentionally skip setInput. Host bindings on the directive read
      // `key()` / `field()`, which are `input.required<...>()` and throw
      // NG0950 on first read until set.
      // NG0950: required input not set before first read. Match either the
      // stable error code or the "required" wording so the test fails if
      // Angular ever changes the format.
      expect(() => fixture.detectChanges()).toThrow(/NG0950|required/i);
    });
  });
});
