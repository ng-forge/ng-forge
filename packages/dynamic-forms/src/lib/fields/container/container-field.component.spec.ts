import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  Injector,
  input,
  runInInjectionContext,
  signal,
  viewChild,
  ViewContainerRef,
} from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { form, schema, type SchemaPath } from '@angular/forms/signals';
import { ContainerFieldComponent } from './container-field.component';
import { ContainerField } from '../../definitions/default/container-field';
import { FieldDef } from '../../definitions/base/field-def';
import { createSimpleTestField, TestFieldComponent } from '../../../../testing/src/simple-test-utils';
import { baseFieldMapper, FieldSignalContext } from '../../mappers';
import { provideDynamicForm } from '../../providers';
import { FieldTypeDefinition } from '../../models/field-type';
import { FIELD_SIGNAL_CONTEXT } from '../../models/field-signal-context.token';
import { EventBus } from '../../events';
import { FieldWrapperContract, WrapperTypeDefinition } from '../../models/wrapper-type';
import { applyValidator } from '../../core/validation/validator-factory';
import { FunctionRegistryService } from '../../core/registry/function-registry.service';
import { FieldContextRegistryService } from '../../core/registry/field-context-registry.service';
import { RootFormRegistryService } from '../../core/registry/root-form-registry.service';
import { FormStateManager } from '../../state/form-state-manager';
import { DynamicFormLogger } from '../../providers/features/logger/logger.token';
import { ConsoleLogger } from '../../providers/features/logger/console-logger';

// ─── Mock Wrapper Components ──────────────────────────────────────────────────

/**
 * Mock wrapper component that provides a #fieldComponent slot.
 * Simulates a "section" wrapper with a header input.
 */
@Component({
  selector: 'test-section-wrapper',
  template: `
    <div class="test-section-wrapper">
      <h3 class="test-section-header">{{ header() ?? '' }}</h3>
      <div class="test-section-content">
        <ng-container #fieldComponent></ng-container>
      </div>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
class TestSectionWrapperComponent implements FieldWrapperContract {
  readonly fieldComponent = viewChild.required('fieldComponent', { read: ViewContainerRef });
  readonly header = input<string>();
}

/**
 * Mock wrapper component for chaining tests.
 * Simulates a "style" wrapper with a CSS class input.
 */
@Component({
  selector: 'test-style-wrapper',
  template: `
    <div class="test-style-wrapper" [class]="wrapperClass() ?? ''">
      <ng-container #fieldComponent></ng-container>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
class TestStyleWrapperComponent implements FieldWrapperContract {
  readonly fieldComponent = viewChild.required('fieldComponent', { read: ViewContainerRef });
  readonly wrapperClass = input<string>();
}

/**
 * Mock validation-aware wrapper.
 *
 * Receives validClass/invalidClass as inputs; reads form validity directly
 * from FIELD_SIGNAL_CONTEXT. Container-used wrappers don't get `fieldInputs`
 * since the container wraps a children template, not a single field.
 */
@Component({
  selector: 'test-validation-wrapper',
  template: `
    <div class="test-validation-wrapper" [class]="activeClass()">
      <ng-container #fieldComponent></ng-container>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
class TestValidationWrapperComponent implements FieldWrapperContract {
  readonly fieldComponent = viewChild.required('fieldComponent', { read: ViewContainerRef });
  readonly validClass = input<string>('is-valid');
  readonly invalidClass = input<string>('is-invalid');

  private readonly fieldSignalContext = inject(FIELD_SIGNAL_CONTEXT) as FieldSignalContext;

  private readonly isValid = computed(() => this.fieldSignalContext.form().valid());

  readonly activeClass = computed(() => (this.isValid() ? this.validClass() : this.invalidClass()));
}

// ─── Test Setup ───────────────────────────────────────────────────────────────

interface SetupWrapperTestOptions {
  value?: Record<string, unknown>;
  /** When provided, creates a form schema that applies a required validator to the given field keys */
  requiredFields?: string[];
}

function setupWrapperTest(field: ContainerField, opts?: SetupWrapperTestOptions | Record<string, unknown>) {
  // Support legacy call signature: setupWrapperTest(field, parentValue)
  const options: SetupWrapperTestOptions =
    opts && ('value' in opts || 'requiredFields' in opts)
      ? (opts as SetupWrapperTestOptions)
      : { value: (opts as Record<string, unknown>) ?? {} };

  const parentValue = options.value ?? {};

  const mockFieldType: FieldTypeDefinition = {
    name: 'test',
    loadComponent: async () => TestFieldComponent,
    mapper: baseFieldMapper,
  };

  const mockWrapperTypes: WrapperTypeDefinition[] = [
    { wrapperName: 'section', loadComponent: async () => TestSectionWrapperComponent },
    { wrapperName: 'style', loadComponent: async () => TestStyleWrapperComponent },
    { wrapperName: 'validation', loadComponent: async () => TestValidationWrapperComponent },
  ];

  const mockFormSignal = signal<unknown>(undefined);
  const entitySignal = signal<Record<string, unknown>>(parentValue);

  TestBed.configureTestingModule({
    imports: [ContainerFieldComponent],
    providers: [
      provideDynamicForm(mockFieldType, ...mockWrapperTypes),
      EventBus,
      FunctionRegistryService,
      FieldContextRegistryService,
      { provide: RootFormRegistryService, useValue: { formValue: entitySignal, rootForm: mockFormSignal } },
      { provide: FormStateManager, useValue: { activeConfig: signal(undefined) } },
      { provide: DynamicFormLogger, useValue: new ConsoleLogger() },
      {
        provide: FIELD_SIGNAL_CONTEXT,
        useFactory: (injector: Injector) => {
          return runInInjectionContext(injector, () => {
            const requiredFields = options.requiredFields;

            const testForm = requiredFields?.length
              ? form(
                  entitySignal,
                  schema<Record<string, unknown>>((path) => {
                    for (const key of requiredFields) {
                      applyValidator({ type: 'required' }, path[key] as SchemaPath<unknown>);
                    }
                  }),
                )
              : form(entitySignal);

            mockFormSignal.set(testForm);

            return {
              injector,
              value: entitySignal,
              defaultValues: () => parentValue,
              form: testForm,
            } as FieldSignalContext<Record<string, unknown>>;
          });
        },
        deps: [Injector],
      },
    ],
  });

  const fixture = TestBed.createComponent(ContainerFieldComponent);
  const component = fixture.componentInstance;

  fixture.componentRef.setInput('key', field.key);
  fixture.componentRef.setInput('field', field);

  fixture.detectChanges();

  return { component, fixture, entity: entitySignal };
}

/**
 * Flushes the async wrapper loading pipeline.
 *
 * The wrapper chain builds through: toObservable (effect) → switchMap →
 * forkJoin(from(Promise)) → subscribe → buildWrapperChain → detectChanges.
 * This requires multiple microtask flushes + change detection cycles.
 */
async function flushWrapperChain(fixture: { detectChanges: () => void; whenStable: () => Promise<void> }): Promise<void> {
  // Wait for the async component loading promises
  await fixture.whenStable();
  fixture.detectChanges();

  // Another tick for the subscribe callback → buildWrapperChain → detectChanges
  await new Promise((resolve) => setTimeout(resolve, 0));
  fixture.detectChanges();
}

describe('ContainerFieldComponent', () => {
  it('should create', () => {
    const field = {
      key: 'testWrapper',
      type: 'container',
      fields: [],
      wrappers: [],
    } as unknown as ContainerField;

    const { component } = setupWrapperTest(field);

    expect(component).toBeDefined();
    expect(component).toBeInstanceOf(ContainerFieldComponent);
  });

  it('should have field input property', () => {
    const field = {
      key: 'testWrapper',
      type: 'container',
      fields: [],
      wrappers: [],
    } as unknown as ContainerField;

    const { component } = setupWrapperTest(field);

    expect(component.field()).toEqual(field);
  });

  it('should have host classes', () => {
    const field = {
      key: 'testWrapper',
      type: 'container',
      fields: [],
      wrappers: [],
    } as unknown as ContainerField;

    const { fixture } = setupWrapperTest(field);

    const element = fixture.nativeElement;
    expect(element.classList.contains('df-field')).toBe(true);
    expect(element.classList.contains('df-container')).toBe(true);
  });

  it('should not have df-container-hidden class when hidden is false', () => {
    const field = {
      key: 'testWrapper',
      type: 'container',
      fields: [],
      wrappers: [],
    } as unknown as ContainerField;

    const { fixture } = setupWrapperTest(field);
    fixture.componentRef.setInput('hidden', false);
    fixture.detectChanges();

    const element = fixture.nativeElement;
    expect(element.classList.contains('df-container-hidden')).toBe(false);
    expect(element.getAttribute('aria-hidden')).toBeNull();
  });

  it('should have df-container-hidden class and aria-hidden when hidden is true', () => {
    const field = {
      key: 'testWrapper',
      type: 'container',
      fields: [],
      wrappers: [],
    } as unknown as ContainerField;

    const { fixture } = setupWrapperTest(field);
    fixture.componentRef.setInput('hidden', true);
    fixture.detectChanges();

    const element = fixture.nativeElement;
    expect(element.classList.contains('df-container-hidden')).toBe(true);
    expect(element.getAttribute('aria-hidden')).toBe('true');
  });

  describe('wrapper chain rendering', () => {
    it('should render children directly when wrappers array is empty', async () => {
      const field = {
        key: 'noWrappers',
        type: 'container',
        fields: [createSimpleTestField('child1', 'Child 1')],
        wrappers: [],
      } as unknown as ContainerField;

      const { fixture } = setupWrapperTest(field, { child1: 'value1' });
      await flushWrapperChain(fixture);

      // No wrapper components should be present
      const sectionWrapper = fixture.nativeElement.querySelector('.test-section-wrapper');
      expect(sectionWrapper).toBeNull();
    });

    it('should render a single wrapper around children', async () => {
      const field = {
        key: 'singleWrapper',
        type: 'container',
        fields: [createSimpleTestField('child1', 'Child 1')],
        wrappers: [{ type: 'section', header: 'Test Section' }],
      } as unknown as ContainerField;

      const { fixture } = setupWrapperTest(field, { child1: 'value1' });
      await flushWrapperChain(fixture);

      // The section wrapper component should be rendered
      const sectionWrapper = fixture.nativeElement.querySelector('.test-section-wrapper');
      expect(sectionWrapper).toBeTruthy();
    });

    it('should chain multiple wrappers (outermost first)', async () => {
      const field = {
        key: 'chainedWrappers',
        type: 'container',
        fields: [createSimpleTestField('child1', 'Child 1')],
        wrappers: [
          { type: 'section', header: 'Outer Section' },
          { type: 'style', wrapperClass: 'inner-style' },
        ],
      } as unknown as ContainerField;

      const { fixture } = setupWrapperTest(field, { child1: 'value1' });
      await flushWrapperChain(fixture);

      // Both wrappers should be present
      const sectionWrapper = fixture.nativeElement.querySelector('.test-section-wrapper');
      const styleWrapper = fixture.nativeElement.querySelector('.test-style-wrapper');

      expect(sectionWrapper).toBeTruthy();
      expect(styleWrapper).toBeTruthy();

      // The style wrapper should be nested inside the section wrapper
      const nestedStyleWrapper = sectionWrapper?.querySelector('.test-style-wrapper');
      expect(nestedStyleWrapper).toBeTruthy();
    });
  });

  describe('validation-aware wrapper', () => {
    /** Creates a test field with required validation configured */
    function createRequiredTestField(key: string, label: string, value?: unknown): FieldDef<unknown> {
      return {
        key,
        type: 'test',
        label,
        required: true,
        ...(value !== undefined && { value }),
      } as FieldDef<unknown>;
    }

    it('should apply validClass when all children are valid', async () => {
      const field = {
        key: 'validWrapper',
        type: 'container',
        fields: [createRequiredTestField('child1', 'Child 1', 'hello')],
        wrappers: [{ type: 'validation', validClass: 'form-valid', invalidClass: 'form-invalid' }],
      } as unknown as ContainerField;

      // child1 has a value so required passes
      const { fixture } = setupWrapperTest(field, {
        value: { child1: 'hello' },
        requiredFields: ['child1'],
      });
      await flushWrapperChain(fixture);

      const wrapper = fixture.nativeElement.querySelector('.test-validation-wrapper');
      expect(wrapper).toBeTruthy();
      expect(wrapper.classList.contains('form-valid')).toBe(true);
      expect(wrapper.classList.contains('form-invalid')).toBe(false);
    });

    it('should apply invalidClass when a child field fails validation', async () => {
      const field = {
        key: 'invalidWrapper',
        type: 'container',
        fields: [createRequiredTestField('child1', 'Child 1', '')],
        wrappers: [{ type: 'validation', validClass: 'form-valid', invalidClass: 'form-invalid' }],
      } as unknown as ContainerField;

      // child1 is empty string — required validator will fail
      const { fixture } = setupWrapperTest(field, {
        value: { child1: '' },
        requiredFields: ['child1'],
      });
      await flushWrapperChain(fixture);

      const wrapper = fixture.nativeElement.querySelector('.test-validation-wrapper');
      expect(wrapper).toBeTruthy();
      expect(wrapper.classList.contains('form-invalid')).toBe(true);
      expect(wrapper.classList.contains('form-valid')).toBe(false);
    });

    it('should switch from valid to invalid when value changes', async () => {
      const field = {
        key: 'reactiveWrapper',
        type: 'container',
        fields: [createRequiredTestField('child1', 'Child 1', 'valid')],
        wrappers: [{ type: 'validation', validClass: 'form-valid', invalidClass: 'form-invalid' }],
      } as unknown as ContainerField;

      // Start with a valid value, required validator is active
      const { fixture, entity } = setupWrapperTest(field, {
        value: { child1: 'valid' },
        requiredFields: ['child1'],
      });
      await flushWrapperChain(fixture);

      const wrapper = fixture.nativeElement.querySelector('.test-validation-wrapper');
      expect(wrapper).toBeTruthy();
      expect(wrapper.classList.contains('form-valid')).toBe(true);

      // Update to empty value — should become invalid
      entity.set({ child1: '' });
      fixture.detectChanges();
      await flushWrapperChain(fixture);

      expect(wrapper.classList.contains('form-invalid')).toBe(true);
      expect(wrapper.classList.contains('form-valid')).toBe(false);
    });
  });
});
