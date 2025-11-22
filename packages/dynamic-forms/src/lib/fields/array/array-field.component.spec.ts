import { ArrayFieldComponent } from './array-field.component';
import { ArrayField } from '../../definitions';
import { createSimpleTestField } from '../../testing';
import { TestBed } from '@angular/core/testing';
import { Injector, runInInjectionContext, signal } from '@angular/core';
import { form } from '@angular/forms/signals';
import { baseFieldMapper, FieldSignalContext } from '../../mappers';
import { provideDynamicForm } from '../../providers';
import { FIELD_REGISTRY, FieldTypeDefinition, FIELD_SIGNAL_CONTEXT } from '../../models';
import { AddArrayItemEvent, EventBus, RemoveArrayItemEvent } from '../../events';
import { createSchemaFromFields } from '../../core/schema-builder';
import { vi } from 'vitest';

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
      label: 'Test Array',
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
      label: 'Test Array',
      fields: [],
    };

    const { component } = setupArrayTest(field);

    expect(component.field()).toEqual(field);
  });

  it('should have key input property', () => {
    const field: ArrayField<any> = {
      key: 'testArray',
      type: 'array',
      label: 'Test Array',
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
      label: 'Test Array',
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
      label: 'Test Array',
      fields: [createSimpleTestField('item', 'Item')],
    };

    const { component } = setupArrayTest(field, { testArray: [] });

    expect(component.fields()).toHaveLength(0);
  });

  it('should create field instances for existing array items', async () => {
    const field: ArrayField<any> = {
      key: 'items',
      type: 'array',
      label: 'Items',
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
      label: 'Test Array',
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
      label: 'Test Array',
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
        label: 'Items',
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
        await new Promise((resolve) => setTimeout(resolve, 100));
        attempts++;
      }

      expect(component.fields()).toHaveLength(1);
    });

    it('should add item using array template as fallback when AddArrayItemEvent has no field', async () => {
      const field: ArrayField<any> = {
        key: 'items',
        type: 'array',
        label: 'Items',
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
        label: 'Items',
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
        label: 'Items',
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
        label: 'Items',
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
        await new Promise((resolve) => setTimeout(resolve, 100));
        attempts++;
      }

      expect(component.fields()).toHaveLength(2);
    });

    it('should remove item at specific index when index is provided', async () => {
      const field: ArrayField<any> = {
        key: 'items',
        type: 'array',
        label: 'Items',
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

      // Remove item at index 1 (middle item)
      eventBus.dispatch(RemoveArrayItemEvent, 'items', 1);

      // Wait for the component to update
      attempts = 0;
      while (component.fields().length > 2 && attempts < maxAttempts) {
        await fixture.whenStable();
        fixture.detectChanges();
        TestBed.flushEffects();
        await new Promise((resolve) => setTimeout(resolve, 100));
        attempts++;
      }

      expect(component.fields()).toHaveLength(2);
    });

    it('should not remove from empty array', async () => {
      const field: ArrayField<any> = {
        key: 'items',
        type: 'array',
        label: 'Items',
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
});
