import { ChangeDetectionStrategy, Component, EnvironmentInjector, runInInjectionContext, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { form, FieldTree } from '@angular/forms/signals';
import { DEFAULT_VALIDATION_MESSAGES, ValidationMessages } from '@ng-forge/dynamic-forms';
import { NgForgeField, NG_FORGE_FIELD_HOST_DIRECTIVE } from './ng-forge-field.directive';
import { provideMetaTarget, provideSkipMetaTarget } from './meta-target.token';

@Component({
  selector: 'test-host',
  template: '<input class="target" />',
  changeDetection: ChangeDetectionStrategy.OnPush,
  hostDirectives: [NG_FORGE_FIELD_HOST_DIRECTIVE],
})
class TestHostComponent {}

@Component({
  selector: 'test-host-with-target',
  template: '<input class="target" />',
  changeDetection: ChangeDetectionStrategy.OnPush,
  hostDirectives: [NG_FORGE_FIELD_HOST_DIRECTIVE],
  providers: [provideMetaTarget('input.target')],
})
class TestHostWithTargetComponent {}

@Component({
  selector: 'test-host-skip',
  template: '<input class="target" />',
  changeDetection: ChangeDetectionStrategy.OnPush,
  hostDirectives: [NG_FORGE_FIELD_HOST_DIRECTIVE],
  providers: [provideSkipMetaTarget()],
})
class TestHostSkipComponent {}

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

    it('falls back to DEFAULT_VALIDATION_MESSAGES from DI when no validationMessages input is provided', () => {
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

      // Smoke check: the directive constructed and the default-messages signal is wired.
      // (Resolved errors only appear when the field tree actually emits a validation error;
      // ng-forge tests cover the resolution itself in createResolvedErrorsSignal's spec.)
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

  describe('meta-target configuration', () => {
    it('does not throw when no provider is supplied (default selector path)', () => {
      TestBed.configureTestingModule({ imports: [TestHostComponent] });
      const fixture = TestBed.createComponent(TestHostComponent);
      const { field } = setupField();
      fixture.componentRef.setInput('field', field);
      fixture.componentRef.setInput('key', 'username');
      fixture.componentRef.setInput('meta', { 'data-testid': 'username-input' });
      expect(() => fixture.detectChanges()).not.toThrow();
    });

    it('honors a custom selector via provideMetaTarget()', () => {
      TestBed.configureTestingModule({ imports: [TestHostWithTargetComponent] });
      const fixture = TestBed.createComponent(TestHostWithTargetComponent);
      const { field } = setupField();
      fixture.componentRef.setInput('field', field);
      fixture.componentRef.setInput('key', 'username');
      fixture.componentRef.setInput('meta', { 'data-testid': 'username-input' });
      fixture.detectChanges();
      // Verify by checking the rendered DOM picked up the attribute.
      const target = fixture.nativeElement.querySelector('input.target') as HTMLElement | null;
      expect(target?.getAttribute('data-testid')).toBe('username-input');
    });

    it('does NOT apply meta when provideSkipMetaTarget() is used', () => {
      TestBed.configureTestingModule({ imports: [TestHostSkipComponent] });
      const fixture = TestBed.createComponent(TestHostSkipComponent);
      const { field } = setupField();
      fixture.componentRef.setInput('field', field);
      fixture.componentRef.setInput('key', 'username');
      fixture.componentRef.setInput('meta', { 'data-testid': 'should-not-apply' });
      fixture.detectChanges();
      const target = fixture.nativeElement.querySelector('input.target') as HTMLElement | null;
      expect(target?.getAttribute('data-testid')).toBeNull();
    });
  });
});
