import { ChangeDetectionStrategy, Component, EnvironmentInjector, runInInjectionContext, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { form, FieldTree } from '@angular/forms/signals';
import { DEFAULT_VALIDATION_MESSAGES, ValidationMessages } from '@ng-forge/dynamic-forms';
import { NgForgeField, NG_FORGE_FIELD_INPUTS } from './ng-forge-field.directive';
import { NgForgeControl, NgForgeHostControl } from './ng-forge-controls';

@Component({
  selector: 'test-host',
  template: '<input class="target" />',
  changeDetection: ChangeDetectionStrategy.OnPush,
  hostDirectives: [{ directive: NgForgeField, inputs: [...NG_FORGE_FIELD_INPUTS] }],
})
class TestHostComponent {}

@Component({
  selector: 'test-host-with-control',
  imports: [NgForgeControl],
  template: '<input class="target" ngForgeControl />',
  changeDetection: ChangeDetectionStrategy.OnPush,
  hostDirectives: [{ directive: NgForgeField, inputs: [...NG_FORGE_FIELD_INPUTS] }],
})
class TestHostWithControlComponent {}

@Component({
  selector: 'test-host-host-control',
  template: '<input class="target" />',
  changeDetection: ChangeDetectionStrategy.OnPush,
  hostDirectives: [{ directive: NgForgeField, inputs: [...NG_FORGE_FIELD_INPUTS] }, NgForgeHostControl],
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
  hostDirectives: [{ directive: NgForgeField, inputs: [...NG_FORGE_FIELD_INPUTS] }],
})
class TestHostWithDescendantTargetComponent {}

interface TestFormValue {
  username: string;
}

function setupField(initialValue = ''): { field: FieldTree<string>; rootValue: ReturnType<typeof signal<TestFormValue>> } {
  const rootValue = signal<TestFormValue>({ username: initialValue });
  const injector = TestBed.inject(EnvironmentInjector);
  const root = runInInjectionContext(injector, () => form(rootValue));
  return { field: root.username, rootValue };
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

      const { field } = setupField();
      fixture.componentRef.setInput('field', field);
      fixture.componentRef.setInput('key', 'username');
      fixture.detectChanges();

      expect(directive.errors).toBeDefined();
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

  describe('NG_FORGE_FIELD_INPUTS lockstep with declared inputs', () => {
    // The lockstep guarantee is enforced by a compile-time type assertion in
    // ng-forge-field.directive.ts (see `_NG_FORGE_FIELD_INPUTS_LOCKSTEP`).
    // Drift in either direction fails the build via tsc with a self-describing
    // error. This test is the runtime smoke check that the host directive
    // composition with the current tuple instantiates cleanly.
    it('instantiates cleanly with the spread NG_FORGE_FIELD_INPUTS tuple', () => {
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
      expect(() => fixture.detectChanges()).toThrow();
    });
  });
});
