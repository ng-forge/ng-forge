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

    // Wait for all async operations to complete and allow multiple change detection cycles
    // This is necessary because:
    // 1. arrayFieldTrees computed needs to run
    // 2. toObservable needs to emit
    // 3. switchMap needs to load components asynchronously
    // 4. toSignal needs to update with the results
    await fixture.whenStable();
    fixture.detectChanges();

    // Give the toSignal time to process the observable emission
    await new Promise((resolve) => setTimeout(resolve, 100));
    fixture.detectChanges();

    await fixture.whenStable();
    fixture.detectChanges();

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
});
