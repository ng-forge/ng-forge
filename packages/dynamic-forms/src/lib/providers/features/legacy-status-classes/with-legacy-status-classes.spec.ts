import { ChangeDetectionStrategy, Component, EnvironmentInjector, runInInjectionContext, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { FormField, form, required, schema, type SchemaPath } from '@angular/forms/signals';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { NG_STATUS_CLASSES } from '@angular/forms/signals/compat';
import { withLegacyStatusClasses } from './with-legacy-status-classes';
import { isDynamicFormFeature } from '../dynamic-form-feature';

interface TestFormValue {
  username: string;
}

@Component({
  selector: 'test-field-host',
  imports: [FormField],
  template: '<input class="target" [formField]="field()" />',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
class TestFieldHostComponent {
  readonly field = signal(null as unknown as ReturnType<typeof setupField>['field']);
}

function setupField() {
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
  return { field: root.username, root };
}

describe('withLegacyStatusClasses', () => {
  describe('feature shape', () => {
    it('returns a DynamicFormFeature with the legacy-status-classes kind', () => {
      const feature = withLegacyStatusClasses();

      expect(isDynamicFormFeature(feature)).toBe(true);
      expect(feature.ɵkind).toBe('legacy-status-classes');
    });

    it('wires Angular Signal Forms with NG_STATUS_CLASSES', () => {
      const feature = withLegacyStatusClasses();

      // Walk the contributed providers and assert at least one carries the
      // NG_STATUS_CLASSES reference. Catches refactors that swap the compat
      // strategy for the modern one. Brittle if Angular ever changes the
      // provider envelope shape — see the DOM-behavior tests below for the
      // canonical contract.
      const usesCompatClasses = feature.ɵproviders.some((p) => {
        const provider = p as { useValue?: { classes?: unknown } };
        return provider.useValue?.classes === NG_STATUS_CLASSES;
      });

      expect(usesCompatClasses).toBe(true);
    });
  });

  // Integration tests: mount a real Signal Form field via `[formField]` and
  // verify the compat-class strategy actually paints the DOM. These survive
  // any Angular refactor of the EnvironmentProviders envelope.
  describe('DOM behavior', () => {
    afterEach(() => {
      TestBed.resetTestingModule();
    });

    it('applies .ng-invalid and .ng-touched on an invalid touched field when feature is provided', async () => {
      await TestBed.configureTestingModule({
        imports: [TestFieldHostComponent],
        providers: [withLegacyStatusClasses().ɵproviders],
      }).compileComponents();

      const { field } = setupField();
      const fixture = TestBed.createComponent(TestFieldHostComponent);
      fixture.componentInstance.field.set(field);
      fixture.detectChanges();

      const input: HTMLInputElement = fixture.nativeElement.querySelector('input.target');
      expect(input.classList.contains('ng-invalid')).toBe(true);
      expect(input.classList.contains('ng-touched')).toBe(true);
    });

    it('does not apply legacy ng-* classes by default', async () => {
      await TestBed.configureTestingModule({
        imports: [TestFieldHostComponent],
        // No withLegacyStatusClasses() — Signal Forms uses its modern strategy.
      }).compileComponents();

      const { field } = setupField();
      const fixture = TestBed.createComponent(TestFieldHostComponent);
      fixture.componentInstance.field.set(field);
      fixture.detectChanges();

      const input: HTMLInputElement = fixture.nativeElement.querySelector('input.target');
      expect(input.classList.contains('ng-invalid')).toBe(false);
      expect(input.classList.contains('ng-touched')).toBe(false);
    });
  });
});
