import { ArrayFieldComponent } from './array-field.component';
import { ArrayField, RowField } from '../../definitions';
import { createSimpleTestField, delay } from '../../testing';
import { TestBed } from '@angular/core/testing';
import { Injector, runInInjectionContext, signal } from '@angular/core';
import { form } from '@angular/forms/signals';
import { baseFieldMapper, FieldSignalContext, valueFieldMapper } from '../../mappers';
import { provideDynamicForm } from '../../providers';
import { FIELD_REGISTRY, FieldTypeDefinition, FIELD_SIGNAL_CONTEXT } from '../../models';
import { AddArrayItemEvent, EventBus, RemoveArrayItemEvent } from '../../events';
import { createSchemaFromFields } from '../../core/schema-builder';
import { vi } from 'vitest';
import { FieldDef } from '../../definitions/base';

describe('ArrayFieldComponent', () => {
  function setupArrayTest(field: ArrayField<any>, value?: Record<string, unknown>) {
    const mockFieldType: FieldTypeDefinition = {
      name: 'test',
      loadComponent: async () => {
        const module = await import('../../testing/simple-test-utils');
        return module.TestFieldComponent;
      },
      mapper: baseFieldMapper,
    };

    const registry = new Map([['test', mockFieldType]]);

    TestBed.configureTestingModule({
      imports: [ArrayFieldComponent],
      providers: [
        provideDynamicForm(),
        EventBus,
        {
          provide: FIELD_REGISTRY,
          useValue: registry,
        },
        {
          provide: FIELD_SIGNAL_CONTEXT,
          useFactory: (injector: Injector) => {
            return runInInjectionContext(injector, () => {
              const valueSignal = signal(value || {});
              const defaultValues = () => ({}) as any;

              // Create schema from the array field to properly setup Signal Forms
              const schema = createSchemaFromFields([field], registry);
              const testForm = form(valueSignal, schema);

              // Force Signal Forms to initialize the structure by reading the form
              // This ensures the FieldTree structure is set up before the component accesses it
              const formValue = testForm();
              const structure = (testForm as any).structure?.();

              const mockFieldSignalContext: FieldSignalContext<Record<string, unknown>> = {
                injector,
                value: valueSignal,
                defaultValues,
                form: testForm,
                defaultValidationMessages: signal({}),
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
    const field: ArrayField<any> = {
      key: 'testArray',
      type: 'array',
      fields: [],
    };

    const { component } = setupArrayTest(field);

    expect(component).toBeDefined();
    expect(component).toBeInstanceOf(ArrayFieldComponent);
  });

  it('should have field input property', () => {
    const field: ArrayField<any> = {
      key: 'testArray',
      type: 'array',
      fields: [],
    };

    const { component } = setupArrayTest(field);

    expect(component.field()).toEqual(field);
  });

  it('should have key input property', () => {
    const field: ArrayField<any> = {
      key: 'testArray',
      type: 'array',
      fields: [],
    };

    const { component } = setupArrayTest(field);

    expect(component.key()).toBe('testArray');
  });

  it('should store field template from fields array', () => {
    const templateField = createSimpleTestField('item', 'Item');
    const field: ArrayField<any> = {
      key: 'testArray',
      type: 'array',
      fields: [templateField],
    };

    const { component } = setupArrayTest(field);

    // The component should store the first field as a template
    expect(component['fieldTemplate']()).toEqual(templateField);
  });

  it('should initialize with zero items for empty array', () => {
    const field: ArrayField<any> = {
      key: 'testArray',
      type: 'array',
      fields: [createSimpleTestField('item', 'Item')],
    };

    const { component } = setupArrayTest(field, { testArray: [] });

    expect(component.fields()).toHaveLength(0);
  });

  it('should create field instances for existing array items', async () => {
    const field: ArrayField<any> = {
      key: 'items',
      type: 'array',
      fields: [createSimpleTestField('item', 'Item')],
    };

    const { component, fixture } = setupArrayTest(field, {
      items: ['value1', 'value2', 'value3'],
    });

    // The component loads array items asynchronously via forkJoin in a switchMap
    // Poll until the fields are loaded or timeout
    const maxAttempts = 50; // 5 seconds max
    let attempts = 0;

    while (component.fields().length < 3 && attempts < maxAttempts) {
      await fixture.whenStable();
      fixture.detectChanges();
      TestBed.flushEffects();
      await new Promise((resolve) => setTimeout(resolve, 100));
      attempts++;
    }

    expect(component.fields()).toHaveLength(3);
  });

  it('should render array container in template', () => {
    const field: ArrayField<any> = {
      key: 'testArray',
      type: 'array',
      fields: [],
    };

    const { fixture } = setupArrayTest(field);

    const container = fixture.nativeElement.querySelector('.array-container');
    expect(container).toBeTruthy();
  });

  it('should have host classes', () => {
    const field: ArrayField<any> = {
      key: 'testArray',
      type: 'array',
      fields: [],
    };

    const { fixture } = setupArrayTest(field);

    const host = fixture.nativeElement;
    expect(host.classList.contains('df-field')).toBe(true);
    expect(host.classList.contains('df-array')).toBe(true);
  });

  describe('AddArrayItemEvent', () => {
    it('should add item when AddArrayItemEvent is dispatched with custom field template', async () => {
      const field: ArrayField<any> = {
        key: 'items',
        type: 'array',
        fields: [createSimpleTestField('item', 'Default Item')],
      };

      const { component, fixture } = setupArrayTest(field, { items: [] });
      const eventBus = TestBed.inject(EventBus);

      // Initially empty
      expect(component.fields()).toHaveLength(0);

      // Dispatch event with custom field template
      const customField = createSimpleTestField('customItem', 'Custom Item');
      eventBus.dispatch(AddArrayItemEvent, 'items', customField);

      // Wait for async component loading
      const maxAttempts = 50;
      let attempts = 0;
      while (component.fields().length < 1 && attempts < maxAttempts) {
        await fixture.whenStable();
        fixture.detectChanges();
        TestBed.flushEffects();
        await delay(100);
        attempts++;
      }

      expect(component.fields()).toHaveLength(1);
    });

    it('should add item using array template as fallback when AddArrayItemEvent has no field', async () => {
      const field: ArrayField<any> = {
        key: 'items',
        type: 'array',
        fields: [createSimpleTestField('item', 'Default Item')],
      };

      const { component, fixture } = setupArrayTest(field, { items: [] });
      const eventBus = TestBed.inject(EventBus);

      // Initially empty
      expect(component.fields()).toHaveLength(0);

      // Dispatch event WITHOUT field parameter - should use array's template
      eventBus.dispatch(AddArrayItemEvent, 'items');

      // Wait for async component loading
      const maxAttempts = 50;
      let attempts = 0;
      while (component.fields().length < 1 && attempts < maxAttempts) {
        await fixture.whenStable();
        fixture.detectChanges();
        TestBed.flushEffects();
        await new Promise((resolve) => setTimeout(resolve, 100));
        attempts++;
      }

      expect(component.fields()).toHaveLength(1);
    });

    it('should add item at specific index when index is provided', async () => {
      const field: ArrayField<any> = {
        key: 'items',
        type: 'array',
        fields: [createSimpleTestField('item', 'Item')],
      };

      const { component, fixture } = setupArrayTest(field, {
        items: ['first', 'second', 'third'],
      });

      const eventBus = TestBed.inject(EventBus);

      // Wait for initial items to load
      const maxAttempts = 50;
      let attempts = 0;
      while (component.fields().length < 3 && attempts < maxAttempts) {
        await fixture.whenStable();
        fixture.detectChanges();
        TestBed.flushEffects();
        await new Promise((resolve) => setTimeout(resolve, 100));
        attempts++;
      }

      expect(component.fields()).toHaveLength(3);

      // Add at index 1 (between first and second)
      eventBus.dispatch(AddArrayItemEvent, 'items', undefined, 1);

      // Wait for new item
      attempts = 0;
      while (component.fields().length < 4 && attempts < maxAttempts) {
        await fixture.whenStable();
        fixture.detectChanges();
        TestBed.flushEffects();
        await new Promise((resolve) => setTimeout(resolve, 100));
        attempts++;
      }

      expect(component.fields()).toHaveLength(4);
    });

    it('should not add item if array has no template', async () => {
      const field: ArrayField<any> = {
        key: 'items',
        type: 'array',
        fields: [], // No template
      };

      const { component, fixture } = setupArrayTest(field, { items: [] });
      const eventBus = TestBed.inject(EventBus);
      const consoleSpy = vi.spyOn(console, 'error');

      // Dispatch event without field and no array template
      eventBus.dispatch(AddArrayItemEvent, 'items');

      await fixture.whenStable();
      fixture.detectChanges();

      expect(component.fields()).toHaveLength(0);
      expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining('Cannot add item to array'));
    });
  });

  describe('RemoveArrayItemEvent', () => {
    it('should remove last item when RemoveArrayItemEvent is dispatched without index', async () => {
      const field: ArrayField<any> = {
        key: 'items',
        type: 'array',
        fields: [createSimpleTestField('item', 'Item')],
      };

      const { component, fixture } = setupArrayTest(field, {
        items: ['first', 'second', 'third'],
      });

      const eventBus = TestBed.inject(EventBus);

      // Wait for initial items
      const maxAttempts = 50;
      let attempts = 0;
      while (component.fields().length < 3 && attempts < maxAttempts) {
        await fixture.whenStable();
        fixture.detectChanges();
        TestBed.flushEffects();
        await new Promise((resolve) => setTimeout(resolve, 100));
        attempts++;
      }

      expect(component.fields()).toHaveLength(3);

      // Remove last item
      eventBus.dispatch(RemoveArrayItemEvent, 'items');

      // Wait for the component to update
      attempts = 0;
      while (component.fields().length > 2 && attempts < maxAttempts) {
        await fixture.whenStable();
        fixture.detectChanges();
        TestBed.flushEffects();
        await delay(100);
        attempts++;
      }

      expect(component.fields()).toHaveLength(2);
    });

    it('should remove item at specific index when index is provided', async () => {
      const field: ArrayField<any> = {
        key: 'items',
        type: 'array',
        fields: [createSimpleTestField('item', 'Item')],
      };

      const { component, fixture } = setupArrayTest(field, {
        items: ['first', 'second', 'third'],
      });

      const eventBus = TestBed.inject(EventBus);

      // Wait for initial items
      const maxAttempts = 50;
      let attempts = 0;
      while (component.fields().length < 3 && attempts < maxAttempts) {
        await fixture.whenStable();
        fixture.detectChanges();
        TestBed.flushEffects();
        await delay(100);
        attempts++;
      }

      expect(component.fields()).toHaveLength(3);

      // Remove item at index 1 (middle item)
      eventBus.dispatch(RemoveArrayItemEvent, 'items', 1);

      // Wait for the component to update
      attempts = 0;
      while (component.fields().length > 2 && attempts < maxAttempts) {
        await fixture.whenStable();
        fixture.detectChanges();
        TestBed.flushEffects();
        await delay(100);
        attempts++;
      }

      expect(component.fields()).toHaveLength(2);
    });

    it('should not remove from empty array', async () => {
      const field: ArrayField<any> = {
        key: 'items',
        type: 'array',
        fields: [createSimpleTestField('item', 'Item')],
      };

      const { component, fixture } = setupArrayTest(field, { items: [] });
      const eventBus = TestBed.inject(EventBus);

      expect(component.fields()).toHaveLength(0);

      // Try to remove from empty array
      eventBus.dispatch(RemoveArrayItemEvent, 'items');

      await fixture.whenStable();
      fixture.detectChanges();

      expect(component.fields()).toHaveLength(0);
    });
  });

  describe('Nested Object Items', () => {
    /**
     * Tests for arrays with nested object items like contacts: [{name, email}]
     * These tests ensure that the valueFieldMapper correctly accesses fields
     * from FormRecord where fields are direct properties (formRoot[key])
     */

    function setupNestedObjectArrayTest(field: ArrayField<any>, value?: Record<string, unknown>) {
      // Create registry with row and input field types to properly test nested structures
      const rowFieldType: FieldTypeDefinition = {
        name: 'row',
        loadComponent: async () => {
          const module = await import('../row/row-field.component');
          return module.default;
        },
        mapper: baseFieldMapper,
        valueHandling: 'flatten', // Row fields flatten children to parent level
      };

      const inputFieldType: FieldTypeDefinition = {
        name: 'input',
        loadComponent: async () => {
          const module = await import('../../testing/simple-test-utils');
          return module.TestFieldComponent;
        },
        mapper: valueFieldMapper,
        valueHandling: 'include',
      };

      const testFieldType: FieldTypeDefinition = {
        name: 'test',
        loadComponent: async () => {
          const module = await import('../../testing/simple-test-utils');
          return module.TestFieldComponent;
        },
        mapper: baseFieldMapper,
      };

      const registry = new Map([
        ['row', rowFieldType],
        ['input', inputFieldType],
        ['test', testFieldType],
      ]);

      TestBed.configureTestingModule({
        imports: [ArrayFieldComponent],
        providers: [
          provideDynamicForm(),
          EventBus,
          {
            provide: FIELD_REGISTRY,
            useValue: registry,
          },
          {
            provide: FIELD_SIGNAL_CONTEXT,
            useFactory: (injector: Injector) => {
              return runInInjectionContext(injector, () => {
                const valueSignal = signal(value || {});
                const defaultValues = () => ({}) as any;

                // Create schema from the array field with proper registry
                const schema = createSchemaFromFields([field], registry);
                const testForm = form(valueSignal, schema);

                // Force Signal Forms initialization
                const formValue = testForm();
                const structure = (testForm as any).structure?.();

                const mockFieldSignalContext: FieldSignalContext<Record<string, unknown>> = {
                  injector,
                  value: valueSignal,
                  defaultValues,
                  form: testForm,
                  defaultValidationMessages: signal({}),
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
      // This tests the key fix: arrays with objects like contacts: [{name: 'Alice', email: '...'}]
      const field: ArrayField<any> = {
        key: 'contacts',
        type: 'array',
        fields: [
          {
            key: 'row1',
            type: 'row',
            fields: [
              { key: 'name', type: 'input', label: 'Name' },
              { key: 'email', type: 'input', label: 'Email' },
            ],
          } as RowField<any>,
        ],
      };

      const { component, fixture } = setupNestedObjectArrayTest(field, {
        contacts: [
          { name: 'Alice', email: 'alice@example.com' },
          { name: 'Bob', email: 'bob@example.com' },
        ],
      });

      // Wait for async component loading
      const maxAttempts = 50;
      let attempts = 0;
      while (component.fields().length < 2 && attempts < maxAttempts) {
        await fixture.whenStable();
        fixture.detectChanges();
        TestBed.flushEffects();
        await delay(100);
        attempts++;
      }

      // Should have 2 field instances (one per contact object)
      expect(component.fields()).toHaveLength(2);
    });

    it('should handle adding items to array with nested object structure', async () => {
      const field: ArrayField<any> = {
        key: 'contacts',
        type: 'array',
        fields: [
          {
            key: 'row1',
            type: 'row',
            fields: [
              { key: 'name', type: 'input', label: 'Name' },
              { key: 'email', type: 'input', label: 'Email' },
            ],
          } as RowField<any>,
        ],
      };

      const { component, fixture } = setupNestedObjectArrayTest(field, {
        contacts: [{ name: 'Alice', email: 'alice@example.com' }],
      });

      const eventBus = TestBed.inject(EventBus);

      // Wait for initial item
      const maxAttempts = 50;
      let attempts = 0;
      while (component.fields().length < 1 && attempts < maxAttempts) {
        await fixture.whenStable();
        fixture.detectChanges();
        TestBed.flushEffects();
        await delay(100);
        attempts++;
      }

      expect(component.fields()).toHaveLength(1);

      // Add another contact using row template
      const rowTemplate: RowField<any> = {
        key: 'row1',
        type: 'row',
        fields: [
          { key: 'name', type: 'input', label: 'Name' },
          { key: 'email', type: 'input', label: 'Email' },
        ],
      };
      eventBus.dispatch(AddArrayItemEvent, 'contacts', rowTemplate);

      // Wait for new item
      attempts = 0;
      while (component.fields().length < 2 && attempts < maxAttempts) {
        await fixture.whenStable();
        fixture.detectChanges();
        TestBed.flushEffects();
        await delay(100);
        attempts++;
      }

      expect(component.fields()).toHaveLength(2);
    });

    it('should handle removing items from array with nested object structure', async () => {
      const field: ArrayField<any> = {
        key: 'contacts',
        type: 'array',
        fields: [
          {
            key: 'row1',
            type: 'row',
            fields: [
              { key: 'name', type: 'input', label: 'Name' },
              { key: 'email', type: 'input', label: 'Email' },
            ],
          } as RowField<any>,
        ],
      };

      const { component, fixture } = setupNestedObjectArrayTest(field, {
        contacts: [
          { name: 'Alice', email: 'alice@example.com' },
          { name: 'Bob', email: 'bob@example.com' },
          { name: 'Charlie', email: 'charlie@example.com' },
        ],
      });

      const eventBus = TestBed.inject(EventBus);

      // Wait for initial items
      const maxAttempts = 50;
      let attempts = 0;
      while (component.fields().length < 3 && attempts < maxAttempts) {
        await fixture.whenStable();
        fixture.detectChanges();
        TestBed.flushEffects();
        await delay(100);
        attempts++;
      }

      expect(component.fields()).toHaveLength(3);

      // Remove middle item (index 1)
      eventBus.dispatch(RemoveArrayItemEvent, 'contacts', 1);

      // Wait for removal
      attempts = 0;
      while (component.fields().length > 2 && attempts < maxAttempts) {
        await fixture.whenStable();
        fixture.detectChanges();
        TestBed.flushEffects();
        await delay(100);
        attempts++;
      }

      expect(component.fields()).toHaveLength(2);
    });

    it('should create fields for array with simple input template', async () => {
      // Test simpler case: arrays with single input field as template (using object items)
      const field: ArrayField<any> = {
        key: 'emails',
        type: 'array',
        fields: [{ key: 'email', type: 'input', label: 'Email' }],
      };

      const { component, fixture } = setupNestedObjectArrayTest(field, {
        emails: [{ email: 'alice@example.com' }, { email: 'bob@example.com' }],
      });

      const maxAttempts = 50;
      let attempts = 0;
      while (component.fields().length < 2 && attempts < maxAttempts) {
        await fixture.whenStable();
        fixture.detectChanges();
        TestBed.flushEffects();
        await delay(100);
        attempts++;
      }

      expect(component.fields()).toHaveLength(2);
    });

    it('should handle empty nested object array gracefully', async () => {
      const field: ArrayField<any> = {
        key: 'contacts',
        type: 'array',
        fields: [
          {
            key: 'row1',
            type: 'row',
            fields: [
              { key: 'name', type: 'input', label: 'Name' },
              { key: 'email', type: 'input', label: 'Email' },
            ],
          } as RowField<any>,
        ],
      };

      const { component, fixture } = setupNestedObjectArrayTest(field, {
        contacts: [],
      });

      await fixture.whenStable();
      fixture.detectChanges();

      expect(component.fields()).toHaveLength(0);
    });
  });

  describe('valueFieldMapper Field Binding (Regression Tests)', () => {
    /**
     * CRITICAL REGRESSION TESTS: These tests verify that the valueFieldMapper
     * produces the correct 'field' binding for array items.
     *
     * The fix ensures that for schemaless forms (like array item forms),
     * the mapper can find the field either through:
     * 1. childrenMap (standard path for schema-based forms)
     * 2. Direct property access (formRoot[key]) for schemaless forms
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
        providers: [{ provide: FIELD_SIGNAL_CONTEXT, useValue: fieldSignalContext }],
      });
    }

    beforeEach(() => {
      TestBed.configureTestingModule({
        providers: [provideDynamicForm()],
      });
    });

    it('should produce field binding for schemaless form with data', () => {
      const injector = createSchemalessFormInjector({ username: 'testuser' });
      const fieldDef = { key: 'username', type: 'input', label: 'Username' };

      const bindings = runInInjectionContext(injector, () => valueFieldMapper(fieldDef));

      // Expected bindings:
      // From baseFieldMapper: 'label' (1) + 'key' (2) = 2 bindings
      // From valueFieldMapper: 'validationMessages' (3) + 'field' (4) = 2 more bindings
      // Total: 4 bindings
      //
      // If the fix is broken, 'field' won't be added and we'd have only 3 bindings
      expect(bindings.length).toBe(4);
    });

    it('should handle field access when form value has nested structure', () => {
      // This simulates array items with object values like { name: 'Alice', email: 'alice@test.com' }
      const injector = createSchemalessFormInjector({
        name: 'Alice',
        email: 'alice@example.com',
      });

      const fieldDef = { key: 'name', type: 'input', label: 'Name' };
      const bindings = runInInjectionContext(injector, () => valueFieldMapper(fieldDef));

      // Should still produce 4 bindings including 'field'
      expect(bindings.length).toBe(4);
    });

    it('should produce field binding for array item context', () => {
      // Simulate what happens inside array-field.component when creating
      // a context for array items
      const itemValue = { itemField: 'item value' };
      const valueSignal = signal(itemValue);
      const formInstance = runInInjectionContext(TestBed.inject(Injector), () => form(valueSignal));
      formInstance();

      const fieldSignalContext: FieldSignalContext<Record<string, unknown>> = {
        injector: TestBed.inject(Injector),
        value: valueSignal,
        defaultValues: () => ({}) as Record<string, unknown>,
        form: formInstance,
        defaultValidationMessages: undefined,
      };

      const injector = Injector.create({
        parent: TestBed.inject(Injector),
        providers: [{ provide: FIELD_SIGNAL_CONTEXT, useValue: fieldSignalContext }],
      });

      const fieldDef = { key: 'itemField', type: 'input', label: 'Item Field' };
      const bindings = runInInjectionContext(injector, () => valueFieldMapper(fieldDef));

      // This should produce 4 bindings including 'field' - the critical binding
      // for the array item to work correctly
      expect(bindings.length).toBe(4);
    });

    it('should handle field without label', () => {
      const injector = createSchemalessFormInjector({ noLabel: 'value' });
      // Field without label
      const fieldDef = { key: 'noLabel', type: 'input' };

      const bindings = runInInjectionContext(injector, () => valueFieldMapper(fieldDef));

      // baseFieldMapper: key (1) = 1
      // valueFieldMapper: validationMessages (2) + field (3) = 2
      // Total: 3
      expect(bindings.length).toBe(3);
    });

    it('should add defaultValidationMessages binding when context provides it', () => {
      const valueSignal = signal({ test: 'value' });
      const formInstance = runInInjectionContext(TestBed.inject(Injector), () => form(valueSignal));
      formInstance();

      const fieldSignalContext: FieldSignalContext<Record<string, unknown>> = {
        injector: TestBed.inject(Injector),
        value: valueSignal,
        defaultValues: () => ({}) as Record<string, unknown>,
        form: formInstance,
        defaultValidationMessages: signal({ required: 'This field is required' }),
      };

      const injector = Injector.create({
        parent: TestBed.inject(Injector),
        providers: [{ provide: FIELD_SIGNAL_CONTEXT, useValue: fieldSignalContext }],
      });

      const fieldDef = { key: 'test', type: 'input', label: 'Test' };
      const bindings = runInInjectionContext(injector, () => valueFieldMapper(fieldDef));

      // baseFieldMapper: label (1) + key (2) = 2
      // valueFieldMapper: validationMessages (3) + defaultValidationMessages (4) + field (5) = 3
      // Total: 5
      expect(bindings.length).toBe(5);
    });
  });
});
