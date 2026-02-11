import { ArrayFieldComponent } from './array-field.component';
import { ArrayField } from '../../definitions/default/array-field';
import { RowField } from '../../definitions/default/row-field';
import { delay } from '@ng-forge/utils';
import { createSimpleTestField, TestFieldComponent } from '../../../../testing/src/simple-test-utils';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Injector, runInInjectionContext, signal } from '@angular/core';
import { form } from '@angular/forms/signals';
import { baseFieldMapper, FieldSignalContext, rowFieldMapper } from '../../mappers';
import { valueFieldMapper } from '@ng-forge/dynamic-forms/integration';
import { provideDynamicForm } from '../../providers';
import { withLoggerConfig } from '../../providers/features/logger/with-logger-config';
import { FIELD_REGISTRY } from '../../models/field-type';
import { FieldTypeDefinition } from '../../models/field-type';
import { DEFAULT_PROPS, DEFAULT_VALIDATION_MESSAGES, FIELD_SIGNAL_CONTEXT, FORM_OPTIONS } from '../../models/field-signal-context.token';
import { AppendArrayItemEvent, EventBus, InsertArrayItemEvent, PopArrayItemEvent, RemoveAtIndexEvent } from '../../events';
import { createSchemaFromFields } from '../../core/schema-builder';
import { vi } from 'vitest';
import { FunctionRegistryService } from '../../core/registry/function-registry.service';
import { RootFormRegistryService } from '../../core/registry/root-form-registry.service';
import { getFieldDefaultValue } from '../../utils/default-value/default-value';
import { createPropertyOverrideStore, PROPERTY_OVERRIDE_STORE } from '../../core/property-derivation/property-override-store';

/**
 * Polls until the component's resolvedItems count satisfies the predicate.
 * Flushes Angular effects and change detection each tick.
 */
async function waitForItems(
  component: ArrayFieldComponent,
  fixture: ComponentFixture<ArrayFieldComponent>,
  predicate: (count: number) => boolean,
): Promise<void> {
  while (!predicate(component.resolvedItems().length)) {
    await fixture.whenStable();
    fixture.detectChanges();
    TestBed.flushEffects();
    await delay(50);
  }
  fixture.detectChanges();
}

describe('ArrayFieldComponent', () => {
  function setupArrayTest(field: ArrayField<unknown>, value?: Record<string, unknown>) {
    const mockFieldType: FieldTypeDefinition = {
      name: 'test',
      loadComponent: async () => TestFieldComponent,
      mapper: baseFieldMapper,
    };

    const registry = new Map([['test', mockFieldType]]);

    const mockEntity = signal<Record<string, unknown>>({});
    const mockFormSignal = signal<unknown>(undefined);

    TestBed.configureTestingModule({
      imports: [ArrayFieldComponent],
      providers: [
        // Include withLoggerConfig() to enable logging in tests
        provideDynamicForm(withLoggerConfig()),
        EventBus,
        FunctionRegistryService,
        { provide: PROPERTY_OVERRIDE_STORE, useFactory: createPropertyOverrideStore },
        { provide: RootFormRegistryService, useValue: { formValue: mockEntity, rootForm: mockFormSignal } },
        {
          provide: FIELD_REGISTRY,
          useValue: registry,
        },
        {
          provide: FIELD_SIGNAL_CONTEXT,
          useFactory: (injector: Injector) => {
            return runInInjectionContext(injector, () => {
              // Compute default value from field definition if no explicit value provided
              const computedValue = value || { [field.key]: getFieldDefaultValue(field, registry) };
              const valueSignal = signal(computedValue as Record<string, unknown>);
              const defaultValues = () => ({}) as Record<string, unknown>;

              // Create schema from the array field to properly setup Signal Forms
              const schema = createSchemaFromFields([field], registry);
              const testForm = form(valueSignal, schema);

              // Force Signal Forms to initialize the structure by reading the form
              // This ensures the FieldTree structure is set up before the component accesses it
              testForm();

              // Access internal structure to force initialization (internal Angular API)
              (testForm as unknown as { structure?: () => void }).structure?.();

              // Register the root form via mock signals
              mockEntity.set(computedValue as Record<string, unknown>);
              mockFormSignal.set(testForm);

              const mockFieldSignalContext: FieldSignalContext<Record<string, unknown>> = {
                injector,
                value: valueSignal,
                defaultValues,
                form: testForm,
                defaultValidationMessages: undefined,
              };

              return mockFieldSignalContext;
            });
          },
          deps: [Injector],
        },
      ],
    });

    const fixture = TestBed.createComponent(ArrayFieldComponent);
    const component = fixture.componentInstance;

    fixture.componentRef.setInput('key', field.key);
    fixture.componentRef.setInput('field', field);

    fixture.detectChanges();

    return { component, fixture };
  }

  it('should create', () => {
    const field: ArrayField<unknown> = {
      key: 'testArray',
      type: 'array',
      fields: [], // Empty array = no initial items
    };

    const { component } = setupArrayTest(field);

    expect(component).toBeDefined();
    expect(component).toBeInstanceOf(ArrayFieldComponent);
  });

  it('should have field input property', () => {
    const field: ArrayField<unknown> = {
      key: 'testArray',
      type: 'array',
      fields: [], // Empty array = no initial items
    };

    const { component } = setupArrayTest(field);

    expect(component.field()).toEqual(field);
  });

  it('should have key input property', () => {
    const field: ArrayField<unknown> = {
      key: 'testArray',
      type: 'array',
      fields: [], // Empty array = no initial items
    };

    const { component } = setupArrayTest(field);

    expect(component.key()).toBe('testArray');
  });

  it('should store item templates from fields array', () => {
    const templateField = createSimpleTestField('item', 'Item');
    const field: ArrayField<unknown> = {
      key: 'testArray',
      type: 'array',
      fields: [[templateField]], // One initial item with one field
    };

    const { component } = setupArrayTest(field);

    // The component should store all item templates (each inner array is one item)
    expect(component['itemTemplates']()).toEqual([[templateField]]);
  });

  it('should initialize with zero items for empty fields array', () => {
    const field: ArrayField<unknown> = {
      key: 'testArray',
      type: 'array',
      fields: [], // Empty = no initial items
    };

    const { component } = setupArrayTest(field, { testArray: [] });

    expect(component.resolvedItems()).toHaveLength(0);
  });

  it('should create field instances for items defined in fields array', async () => {
    const field: ArrayField<unknown> = {
      key: 'items',
      type: 'array',
      fields: [
        [createSimpleTestField('item', 'Item', 'value1')],
        [createSimpleTestField('item', 'Item', 'value2')],
        [createSimpleTestField('item', 'Item', 'value3')],
      ],
    };

    const { component, fixture } = setupArrayTest(field);
    await waitForItems(component, fixture, (n) => n >= 3);

    expect(component.resolvedItems()).toHaveLength(3);
  });

  it('should render with grid layout on host', () => {
    const field: ArrayField<unknown> = {
      key: 'testArray',
      type: 'array',
      fields: [],
    };

    const { fixture } = setupArrayTest(field);

    const host = fixture.nativeElement;
    // Host should have the df-array class which provides grid styling
    expect(host.classList.contains('df-array')).toBe(true);
  });

  it('should have host classes', () => {
    const field: ArrayField<unknown> = {
      key: 'testArray',
      type: 'array',
      fields: [],
    };

    const { fixture } = setupArrayTest(field);

    const host = fixture.nativeElement;
    expect(host.classList.contains('df-field')).toBe(true);
    expect(host.classList.contains('df-array')).toBe(true);
  });

  describe('AppendArrayItemEvent', () => {
    it('should add item when AppendArrayItemEvent is dispatched with field template', async () => {
      const field: ArrayField<unknown> = {
        key: 'items',
        type: 'array',
        fields: [],
      };

      const { component, fixture } = setupArrayTest(field, { items: [] });
      const eventBus = TestBed.inject(EventBus);

      expect(component.resolvedItems()).toHaveLength(0);

      const template = [createSimpleTestField('item', 'Item')];
      eventBus.dispatch(AppendArrayItemEvent, 'items', template);

      await waitForItems(component, fixture, (n) => n >= 1);

      expect(component.resolvedItems()).toHaveLength(1);
    });

    it('should not add item when AppendArrayItemEvent has empty template', async () => {
      const field: ArrayField<unknown> = {
        key: 'items',
        type: 'array',
        fields: [],
      };

      const { component, fixture } = setupArrayTest(field, { items: [] });
      const eventBus = TestBed.inject(EventBus);
      const consoleSpy = vi.spyOn(console, 'error');

      expect(component.resolvedItems()).toHaveLength(0);

      eventBus.dispatch(AppendArrayItemEvent, 'items', []);

      await fixture.whenStable();
      fixture.detectChanges();

      expect(component.resolvedItems()).toHaveLength(0);
      expect(consoleSpy).toHaveBeenCalledWith('[Dynamic Forms]', expect.stringContaining('template is REQUIRED'));
    });
  });

  describe('InsertArrayItemEvent', () => {
    it('should add item at specific index when InsertArrayItemEvent is dispatched', async () => {
      const field: ArrayField<unknown> = {
        key: 'items',
        type: 'array',
        fields: [
          [createSimpleTestField('item', 'Item', 'first')],
          [createSimpleTestField('item', 'Item', 'second')],
          [createSimpleTestField('item', 'Item', 'third')],
        ],
      };

      const { component, fixture } = setupArrayTest(field);
      const eventBus = TestBed.inject(EventBus);

      await waitForItems(component, fixture, (n) => n >= 3);
      expect(component.resolvedItems()).toHaveLength(3);

      const template = [createSimpleTestField('item', 'Item')];
      eventBus.dispatch(InsertArrayItemEvent, 'items', 1, template);

      await waitForItems(component, fixture, (n) => n >= 4);

      expect(component.resolvedItems()).toHaveLength(4);
    });
  });

  describe('PopArrayItemEvent', () => {
    it('should remove last item when PopArrayItemEvent is dispatched', async () => {
      const field: ArrayField<unknown> = {
        key: 'items',
        type: 'array',
        fields: [
          [createSimpleTestField('item', 'Item', 'first')],
          [createSimpleTestField('item', 'Item', 'second')],
          [createSimpleTestField('item', 'Item', 'third')],
        ],
      };

      const { component, fixture } = setupArrayTest(field);
      const eventBus = TestBed.inject(EventBus);

      await waitForItems(component, fixture, (n) => n >= 3);
      expect(component.resolvedItems()).toHaveLength(3);

      eventBus.dispatch(PopArrayItemEvent, 'items');

      await waitForItems(component, fixture, (n) => n <= 2);

      expect(component.resolvedItems()).toHaveLength(2);
    });

    it('should not remove from empty array', async () => {
      const field: ArrayField<unknown> = {
        key: 'items',
        type: 'array',
        fields: [],
      };

      const { component, fixture } = setupArrayTest(field, { items: [] });
      const eventBus = TestBed.inject(EventBus);

      expect(component.resolvedItems()).toHaveLength(0);

      eventBus.dispatch(PopArrayItemEvent, 'items');

      await fixture.whenStable();
      fixture.detectChanges();

      expect(component.resolvedItems()).toHaveLength(0);
    });
  });

  describe('RemoveAtIndexEvent', () => {
    it('should remove item at specific index when RemoveAtIndexEvent is dispatched', async () => {
      const field: ArrayField<unknown> = {
        key: 'items',
        type: 'array',
        fields: [
          [createSimpleTestField('item', 'Item', 'first')],
          [createSimpleTestField('item', 'Item', 'second')],
          [createSimpleTestField('item', 'Item', 'third')],
        ],
      };

      const { component, fixture } = setupArrayTest(field);
      const eventBus = TestBed.inject(EventBus);

      await waitForItems(component, fixture, (n) => n >= 3);
      expect(component.resolvedItems()).toHaveLength(3);

      eventBus.dispatch(RemoveAtIndexEvent, 'items', 1);

      await waitForItems(component, fixture, (n) => n <= 2);

      expect(component.resolvedItems()).toHaveLength(2);
    });
  });

  describe('Nested Object Items', () => {
    /**
     * Tests for arrays with nested object items like contacts: [{name, email}]
     * These tests ensure that the valueFieldMapper correctly accesses fields
     * from FormRecord where fields are direct properties (formRoot[key])
     */

    function setupNestedObjectArrayTest(field: ArrayField<unknown>, value?: Record<string, unknown>) {
      // Create registry with row and input field types to properly test nested structures
      const rowFieldType: FieldTypeDefinition = {
        name: 'row',
        loadComponent: async () => {
          const module = await import('../row/row-field.component');
          return module.default;
        },
        mapper: rowFieldMapper,
        valueHandling: 'flatten', // Row fields flatten children to parent level
      };

      const inputFieldType: FieldTypeDefinition = {
        name: 'input',
        loadComponent: async () => TestFieldComponent,
        mapper: valueFieldMapper,
        valueHandling: 'include',
      };

      const testFieldType: FieldTypeDefinition = {
        name: 'test',
        loadComponent: async () => TestFieldComponent,
        mapper: baseFieldMapper,
      };

      const registry = new Map([
        ['row', rowFieldType],
        ['input', inputFieldType],
        ['test', testFieldType],
      ]);

      const mockEntity = signal<Record<string, unknown>>({});
      const mockFormSignal = signal<unknown>(undefined);

      TestBed.configureTestingModule({
        imports: [ArrayFieldComponent],
        providers: [
          provideDynamicForm(),
          EventBus,
          FunctionRegistryService,
          { provide: PROPERTY_OVERRIDE_STORE, useFactory: createPropertyOverrideStore },
          { provide: RootFormRegistryService, useValue: { formValue: mockEntity, rootForm: mockFormSignal } },
          {
            provide: FIELD_REGISTRY,
            useValue: registry,
          },
          { provide: DEFAULT_PROPS, useValue: signal(undefined) },
          { provide: DEFAULT_VALIDATION_MESSAGES, useValue: signal(undefined) },
          { provide: FORM_OPTIONS, useValue: signal(undefined) },
          {
            provide: FIELD_SIGNAL_CONTEXT,
            useFactory: (injector: Injector) => {
              return runInInjectionContext(injector, () => {
                // Compute default value from field definition if no explicit value provided
                const computedValue = value || { [field.key]: getFieldDefaultValue(field, registry) };
                const valueSignal = signal(computedValue as Record<string, unknown>);
                const defaultValues = () => ({}) as Record<string, unknown>;

                // Create schema from the array field with proper registry
                const schema = createSchemaFromFields([field], registry);
                const testForm = form(valueSignal, schema);

                // Force Signal Forms initialization
                testForm();

                // Access internal structure to force initialization (internal Angular API)
                (testForm as unknown as { structure?: () => void }).structure?.();

                // Register the root form via mock signals
                mockEntity.set(computedValue as Record<string, unknown>);
                mockFormSignal.set(testForm);

                const mockFieldSignalContext: FieldSignalContext<Record<string, unknown>> = {
                  injector,
                  value: valueSignal,
                  defaultValues,
                  form: testForm,
                  defaultValidationMessages: undefined,
                };

                return mockFieldSignalContext;
              });
            },
            deps: [Injector],
          },
        ],
      });

      const fixture = TestBed.createComponent(ArrayFieldComponent);
      const component = fixture.componentInstance;

      fixture.componentRef.setInput('key', field.key);
      fixture.componentRef.setInput('field', field);

      fixture.detectChanges();

      return { component, fixture };
    }

    it('should create field instances for array items with nested object structure', async () => {
      const field: ArrayField<unknown> = {
        key: 'contacts',
        type: 'array',
        fields: [
          [
            {
              key: 'row1',
              type: 'row',
              fields: [
                { key: 'name', type: 'input', label: 'Name', value: 'Alice' },
                { key: 'email', type: 'input', label: 'Email', value: 'alice@example.com' },
              ],
            } as RowField<unknown>,
          ],
          [
            {
              key: 'row1',
              type: 'row',
              fields: [
                { key: 'name', type: 'input', label: 'Name', value: 'Bob' },
                { key: 'email', type: 'input', label: 'Email', value: 'bob@example.com' },
              ],
            } as RowField<unknown>,
          ],
        ],
      };

      const { component, fixture } = setupNestedObjectArrayTest(field);
      await waitForItems(component, fixture, (n) => n >= 2);

      expect(component.resolvedItems()).toHaveLength(2);
    });

    it('should handle adding items to array with nested object structure', async () => {
      const field: ArrayField<unknown> = {
        key: 'contacts',
        type: 'array',
        fields: [
          [
            {
              key: 'row1',
              type: 'row',
              fields: [
                { key: 'name', type: 'input', label: 'Name', value: 'Alice' },
                { key: 'email', type: 'input', label: 'Email', value: 'alice@example.com' },
              ],
            } as RowField<unknown>,
          ],
        ],
      };

      const { component, fixture } = setupNestedObjectArrayTest(field);
      const eventBus = TestBed.inject(EventBus);

      await waitForItems(component, fixture, (n) => n >= 1);
      expect(component.resolvedItems()).toHaveLength(1);

      const rowTemplate: RowField<unknown> = {
        key: 'row1',
        type: 'row',
        fields: [
          { key: 'name', type: 'input', label: 'Name' },
          { key: 'email', type: 'input', label: 'Email' },
        ],
      };
      eventBus.dispatch(AppendArrayItemEvent, 'contacts', [rowTemplate]);

      await waitForItems(component, fixture, (n) => n >= 2);

      expect(component.resolvedItems()).toHaveLength(2);
    });

    it('should handle removing items from array with nested object structure', async () => {
      const field: ArrayField<unknown> = {
        key: 'contacts',
        type: 'array',
        fields: [
          [
            {
              key: 'row1',
              type: 'row',
              fields: [
                { key: 'name', type: 'input', label: 'Name', value: 'Alice' },
                { key: 'email', type: 'input', label: 'Email', value: 'alice@example.com' },
              ],
            } as RowField<unknown>,
          ],
          [
            {
              key: 'row1',
              type: 'row',
              fields: [
                { key: 'name', type: 'input', label: 'Name', value: 'Bob' },
                { key: 'email', type: 'input', label: 'Email', value: 'bob@example.com' },
              ],
            } as RowField<unknown>,
          ],
          [
            {
              key: 'row1',
              type: 'row',
              fields: [
                { key: 'name', type: 'input', label: 'Name', value: 'Charlie' },
                { key: 'email', type: 'input', label: 'Email', value: 'charlie@example.com' },
              ],
            } as RowField<unknown>,
          ],
        ],
      };

      const { component, fixture } = setupNestedObjectArrayTest(field);
      const eventBus = TestBed.inject(EventBus);

      await waitForItems(component, fixture, (n) => n >= 3);
      expect(component.resolvedItems()).toHaveLength(3);

      eventBus.dispatch(RemoveAtIndexEvent, 'contacts', 1);

      await waitForItems(component, fixture, (n) => n <= 2);

      expect(component.resolvedItems()).toHaveLength(2);
    });

    it('should create fields for array with simple input template', async () => {
      const field: ArrayField<unknown> = {
        key: 'emails',
        type: 'array',
        fields: [
          [{ key: 'email', type: 'input', label: 'Email', value: 'alice@example.com' }],
          [{ key: 'email', type: 'input', label: 'Email', value: 'bob@example.com' }],
        ],
      };

      const { component, fixture } = setupNestedObjectArrayTest(field);
      await waitForItems(component, fixture, (n) => n >= 2);

      expect(component.resolvedItems()).toHaveLength(2);
    });

    it('should handle empty nested object array gracefully', async () => {
      const field: ArrayField<unknown> = {
        key: 'contacts',
        type: 'array',
        fields: [],
      };

      const { component, fixture } = setupNestedObjectArrayTest(field, {
        contacts: [],
      });

      await fixture.whenStable();
      fixture.detectChanges();

      expect(component.resolvedItems()).toHaveLength(0);
    });
  });

  describe('valueFieldMapper Field Binding (Regression Tests)', () => {
    /**
     * CRITICAL REGRESSION TESTS: These tests verify that the valueFieldMapper
     * produces the correct 'field' binding for array items.
     *
     * The mapper finds the field through bracket notation (formRoot[key])
     * which works for both schema-based and schemaless forms.
     *
     * If these tests fail, the array field rendering will break with NG0950 errors.
     */

    /**
     * Helper to create a test injector with a schemaless form context
     * This simulates the context used for array items
     */
    function createSchemalessFormInjector(initialValue: Record<string, unknown> = {}) {
      const valueSignal = signal(initialValue);
      const formInstance = runInInjectionContext(TestBed.inject(Injector), () => form(valueSignal));

      // Force Signal Forms to initialize
      formInstance();

      const fieldSignalContext: FieldSignalContext<Record<string, unknown>> = {
        injector: TestBed.inject(Injector),
        value: valueSignal,
        defaultValues: () => ({}) as Record<string, unknown>,
        form: formInstance,
        defaultValidationMessages: undefined,
      };

      return Injector.create({
        parent: TestBed.inject(Injector),
        providers: [
          { provide: FIELD_SIGNAL_CONTEXT, useValue: fieldSignalContext },
          { provide: DEFAULT_PROPS, useValue: signal(undefined) },
          { provide: DEFAULT_VALIDATION_MESSAGES, useValue: signal(undefined) },
          { provide: FORM_OPTIONS, useValue: signal(undefined) },
        ],
      });
    }

    beforeEach(() => {
      TestBed.configureTestingModule({
        providers: [provideDynamicForm()],
      });
    });

    it('should produce field input for schemaless form with data', () => {
      const injector = createSchemalessFormInjector({ username: 'testuser' });
      const fieldDef = { key: 'username', type: 'input', label: 'Username' };

      const inputsSignal = runInInjectionContext(injector, () => valueFieldMapper(fieldDef));
      const inputs = inputsSignal(); // Call the signal to get the actual inputs

      // Expected inputs:
      // From baseFieldMapper: 'label' (1) + 'key' (2) = 2 inputs
      // From valueFieldMapper: 'validationMessages' (3) + 'field' (4) = 2 more inputs
      // Total: 4 inputs
      //
      // If the fix is broken, 'field' won't be added and we'd have only 3 inputs
      expect(Object.keys(inputs)).toHaveLength(4);
      expect(inputs).toHaveProperty('field');
    });

    it('should handle field access when form value has nested structure', () => {
      // This simulates array items with object values like { name: 'Alice', email: 'alice@test.com' }
      const injector = createSchemalessFormInjector({
        name: 'Alice',
        email: 'alice@example.com',
      });

      const fieldDef = { key: 'name', type: 'input', label: 'Name' };
      const inputsSignal = runInInjectionContext(injector, () => valueFieldMapper(fieldDef));
      const inputs = inputsSignal(); // Call the signal to get the actual inputs

      // Should still produce 4 inputs including 'field'
      expect(Object.keys(inputs)).toHaveLength(4);
      expect(inputs).toHaveProperty('field');
    });

    it('should produce field input for array item context', () => {
      // Simulate what happens inside array-field.component when creating
      // a context for array items
      const itemValue = signal<Record<string, unknown>>({ itemField: 'item value' });
      const formInstance = runInInjectionContext(TestBed.inject(Injector), () => form(itemValue));
      formInstance();

      const fieldSignalContext: FieldSignalContext<Record<string, unknown>> = {
        injector: TestBed.inject(Injector),
        value: itemValue,
        defaultValues: () => ({}) as Record<string, unknown>,
        form: formInstance,
        defaultValidationMessages: undefined,
      };

      const injector = Injector.create({
        parent: TestBed.inject(Injector),
        providers: [
          { provide: FIELD_SIGNAL_CONTEXT, useValue: fieldSignalContext },
          { provide: DEFAULT_PROPS, useValue: signal(undefined) },
          { provide: DEFAULT_VALIDATION_MESSAGES, useValue: signal(undefined) },
          { provide: FORM_OPTIONS, useValue: signal(undefined) },
        ],
      });

      const fieldDef = { key: 'itemField', type: 'input', label: 'Item Field' };
      const inputsSignal = runInInjectionContext(injector, () => valueFieldMapper(fieldDef));
      const inputs = inputsSignal(); // Call the signal to get the actual inputs

      // This should produce 4 inputs including 'field' - the critical input
      // for the array item to work correctly
      expect(Object.keys(inputs)).toHaveLength(4);
      expect(inputs).toHaveProperty('field');
    });

    it('should handle field without label', () => {
      const injector = createSchemalessFormInjector({ noLabel: 'value' });
      // Field without label
      const fieldDef = { key: 'noLabel', type: 'input' };

      const inputsSignal = runInInjectionContext(injector, () => valueFieldMapper(fieldDef));
      const inputs = inputsSignal(); // Call the signal to get the actual inputs

      // baseFieldMapper: key (1) = 1
      // valueFieldMapper: validationMessages (2) + field (3) = 2
      // Total: 3
      expect(Object.keys(inputs)).toHaveLength(3);
      expect(inputs).toHaveProperty('field');
    });

    it('should add defaultValidationMessages input when context provides it', () => {
      const valueSignal = signal<Record<string, unknown>>({ test: 'value' });
      const formInstance = runInInjectionContext(TestBed.inject(Injector), () => form(valueSignal));
      formInstance();

      const fieldSignalContext: FieldSignalContext<Record<string, unknown>> = {
        injector: TestBed.inject(Injector),
        value: valueSignal,
        defaultValues: () => ({}) as Record<string, unknown>,
        form: formInstance,
      };

      const injector = Injector.create({
        parent: TestBed.inject(Injector),
        providers: [
          { provide: FIELD_SIGNAL_CONTEXT, useValue: fieldSignalContext },
          { provide: DEFAULT_PROPS, useValue: signal(undefined) },
          { provide: DEFAULT_VALIDATION_MESSAGES, useValue: signal({ required: 'This field is required' }) },
          { provide: FORM_OPTIONS, useValue: signal(undefined) },
        ],
      });

      const fieldDef = { key: 'test', type: 'input', label: 'Test' };
      const inputsSignal = runInInjectionContext(injector, () => valueFieldMapper(fieldDef));
      const inputs = inputsSignal(); // Call the signal to get the actual inputs

      // baseFieldMapper: label (1) + key (2) = 2
      // valueFieldMapper: validationMessages (3) + defaultValidationMessages (4) + field (5) = 3
      // Total: 5
      expect(Object.keys(inputs)).toHaveLength(5);
      expect(inputs).toHaveProperty('field');
      expect(inputs).toHaveProperty('defaultValidationMessages');
    });
  });

  describe('df-array-item wrapper', () => {
    it('should render wrapper divs matching the number of items', async () => {
      const field: ArrayField<unknown> = {
        key: 'items',
        type: 'array',
        fields: [[createSimpleTestField('item', 'Item', 'value1')], [createSimpleTestField('item', 'Item', 'value2')]],
      };

      const { component, fixture } = setupArrayTest(field);
      await waitForItems(component, fixture, (n) => n >= 2);

      const wrappers = fixture.nativeElement.querySelectorAll('.df-array-item');
      expect(wrappers).toHaveLength(2);
    });

    it('should set role="group" on each wrapper', async () => {
      const field: ArrayField<unknown> = {
        key: 'items',
        type: 'array',
        fields: [[createSimpleTestField('item', 'Item', 'value1')], [createSimpleTestField('item', 'Item', 'value2')]],
      };

      const { component, fixture } = setupArrayTest(field);
      await waitForItems(component, fixture, (n) => n >= 2);

      const wrappers = fixture.nativeElement.querySelectorAll('.df-array-item');
      wrappers.forEach((wrapper: HTMLElement) => {
        expect(wrapper.getAttribute('role')).toBe('group');
      });
    });

    it('should set 1-based aria-label on each wrapper', async () => {
      const field: ArrayField<unknown> = {
        key: 'items',
        type: 'array',
        fields: [
          [createSimpleTestField('item', 'Item', 'value1')],
          [createSimpleTestField('item', 'Item', 'value2')],
          [createSimpleTestField('item', 'Item', 'value3')],
        ],
      };

      const { component, fixture } = setupArrayTest(field);
      await waitForItems(component, fixture, (n) => n >= 3);

      const wrappers = fixture.nativeElement.querySelectorAll('.df-array-item');
      expect(wrappers[0].getAttribute('aria-label')).toBe('Item 1');
      expect(wrappers[1].getAttribute('aria-label')).toBe('Item 2');
      expect(wrappers[2].getAttribute('aria-label')).toBe('Item 3');
    });

    it('should set data-array-item-id on each wrapper', async () => {
      const field: ArrayField<unknown> = {
        key: 'items',
        type: 'array',
        fields: [[createSimpleTestField('item', 'Item', 'value1')]],
      };

      const { component, fixture } = setupArrayTest(field);
      await waitForItems(component, fixture, (n) => n >= 1);

      const wrapper = fixture.nativeElement.querySelector('.df-array-item');
      const itemId = wrapper.getAttribute('data-array-item-id');
      expect(itemId).toBeTruthy();
      expect(itemId).toBe(component.resolvedItems()[0].id);
    });

    it('should set data-array-item-index matching position', async () => {
      const field: ArrayField<unknown> = {
        key: 'items',
        type: 'array',
        fields: [[createSimpleTestField('item', 'Item', 'value1')], [createSimpleTestField('item', 'Item', 'value2')]],
      };

      const { component, fixture } = setupArrayTest(field);
      await waitForItems(component, fixture, (n) => n >= 2);

      const wrappers = fixture.nativeElement.querySelectorAll('.df-array-item');
      expect(wrappers[0].getAttribute('data-array-item-index')).toBe('0');
      expect(wrappers[1].getAttribute('data-array-item-index')).toBe('1');
    });

    it('should render child fields inside their wrapper', async () => {
      const field: ArrayField<unknown> = {
        key: 'items',
        type: 'array',
        fields: [[createSimpleTestField('item', 'Item', 'value1')]],
      };

      const { component, fixture } = setupArrayTest(field);
      await waitForItems(component, fixture, (n) => n >= 1);

      const wrapper = fixture.nativeElement.querySelector('.df-array-item');
      expect(wrapper).toBeTruthy();
      expect(wrapper.children.length).toBeGreaterThan(0);
    });

    it('should add a wrapper div when an item is dynamically appended', async () => {
      const field: ArrayField<unknown> = {
        key: 'items',
        type: 'array',
        fields: [[createSimpleTestField('item', 'Item', 'value1')]],
      };

      const { component, fixture } = setupArrayTest(field);
      const eventBus = TestBed.inject(EventBus);

      await waitForItems(component, fixture, (n) => n >= 1);
      expect(fixture.nativeElement.querySelectorAll('.df-array-item')).toHaveLength(1);

      const template = [createSimpleTestField('item', 'Item')];
      eventBus.dispatch(AppendArrayItemEvent, 'items', template);

      await waitForItems(component, fixture, (n) => n >= 2);

      const wrappers = fixture.nativeElement.querySelectorAll('.df-array-item');
      expect(wrappers).toHaveLength(2);
      expect(wrappers[0].getAttribute('data-array-item-index')).toBe('0');
      expect(wrappers[1].getAttribute('data-array-item-index')).toBe('1');
      expect(wrappers[1].getAttribute('aria-label')).toBe('Item 2');
    });

    it('should remove a wrapper div when an item is dynamically removed', async () => {
      const field: ArrayField<unknown> = {
        key: 'items',
        type: 'array',
        fields: [
          [createSimpleTestField('item', 'Item', 'value1')],
          [createSimpleTestField('item', 'Item', 'value2')],
          [createSimpleTestField('item', 'Item', 'value3')],
        ],
      };

      const { component, fixture } = setupArrayTest(field);
      const eventBus = TestBed.inject(EventBus);

      await waitForItems(component, fixture, (n) => n >= 3);
      expect(fixture.nativeElement.querySelectorAll('.df-array-item')).toHaveLength(3);

      eventBus.dispatch(RemoveAtIndexEvent, 'items', 1);

      await waitForItems(component, fixture, (n) => n <= 2);

      const wrappers = fixture.nativeElement.querySelectorAll('.df-array-item');
      expect(wrappers).toHaveLength(2);
      expect(wrappers[0].getAttribute('aria-label')).toBe('Item 1');
      expect(wrappers[1].getAttribute('aria-label')).toBe('Item 2');
    });
  });

  describe('hidden input', () => {
    it('should not have df-container-hidden class when hidden is false', () => {
      const field: ArrayField<unknown> = {
        key: 'testArray',
        type: 'array',
        fields: [],
      };

      const { fixture } = setupArrayTest(field);
      fixture.componentRef.setInput('hidden', false);
      fixture.detectChanges();

      const element = fixture.nativeElement;
      expect(element.classList.contains('df-container-hidden')).toBe(false);
      expect(element.getAttribute('aria-hidden')).toBeNull();
    });

    it('should have df-container-hidden class and aria-hidden when hidden is true', () => {
      const field: ArrayField<unknown> = {
        key: 'testArray',
        type: 'array',
        fields: [],
      };

      const { fixture } = setupArrayTest(field);
      fixture.componentRef.setInput('hidden', true);
      fixture.detectChanges();

      const element = fixture.nativeElement;
      expect(element.classList.contains('df-container-hidden')).toBe(true);
      expect(element.getAttribute('aria-hidden')).toBe('true');
    });
  });
});
