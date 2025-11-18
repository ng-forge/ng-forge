import { ArrayFieldComponent } from './array-field.component';
import { ArrayField } from '../../definitions';
import { createSimpleTestField } from '../../testing';
import { TestBed } from '@angular/core/testing';
import { Injector, runInInjectionContext, signal } from '@angular/core';
import { form } from '@angular/forms/signals';
import { baseFieldMapper, FieldSignalContext } from '../../mappers';
import { provideDynamicForm } from '../../providers';
import { FIELD_REGISTRY, FieldTypeDefinition } from '../../models';
import { AddArrayItemEvent, EventBus, RemoveArrayItemEvent } from '../../events';
import { createSchemaFromFields } from '../../core/schema-builder';

describe('ArrayFieldComponent', () => {
  function setupArrayTest(field: ArrayField<any>, value?: Record<string, unknown>) {
    const mockFieldType: FieldTypeDefinition = {
      name: 'test',
      loadComponent: () => import('../../testing/simple-test-utils'),
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
      ],
    });

    const fixture = TestBed.createComponent(ArrayFieldComponent);
    const component = fixture.componentInstance;
    const injector = TestBed.inject(Injector);

    const valueSignal = signal(value || {});
    const defaultValues = signal({});

    // Create schema from the array field to properly setup Signal Forms
    const schema = createSchemaFromFields([field], registry);
    const testForm = runInInjectionContext(injector, () => form(valueSignal, schema));

    const mockFieldSignalContext: FieldSignalContext<Record<string, unknown>> = {
      injector,
      value: valueSignal,
      defaultValues,
      form: testForm,
      defaultValidationMessages: signal({}),
    };

    fixture.componentRef.setInput('key', field.key);
    fixture.componentRef.setInput('field', field);
    fixture.componentRef.setInput('parentForm', testForm);
    fixture.componentRef.setInput('parentFieldSignalContext', mockFieldSignalContext);

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

  it('should have parentForm and parentFieldSignalContext inputs', () => {
    const field: ArrayField<any> = {
      key: 'testArray',
      type: 'array',
      label: 'Test Array',
      fields: [],
    };

    const { component } = setupArrayTest(field);

    expect(component.parentForm()).toBeDefined();
    expect(component.parentFieldSignalContext()).toBeDefined();
  });

  it('should initialize fields signal', () => {
    const field: ArrayField<any> = {
      key: 'items',
      type: 'array',
      fields: [createSimpleTestField('item', 'Item')],
    };

    const { component } = setupArrayTest(field, { items: [] });

    // The fields signal should exist and be initialized
    expect(component.fields).toBeDefined();
    expect(Array.isArray(component.fields())).toBe(true);
  });

  it('should render array container in template', () => {
    const field: ArrayField<any> = {
      key: 'testArray',
      type: 'array',
      fields: [createSimpleTestField('item', 'Item')],
    };

    const { fixture } = setupArrayTest(field, { testArray: [] });

    // The array container should be present in the template
    const containerElement = fixture.nativeElement.querySelector('.array-container');
    expect(containerElement).not.toBeNull();
    expect(containerElement).toBeInstanceOf(HTMLDivElement);
  });

  it('should have host classes', () => {
    const field: ArrayField<any> = {
      key: 'testArray',
      type: 'array',
      label: 'Test Array',
      fields: [],
    };

    const { fixture } = setupArrayTest(field);

    const element = fixture.nativeElement;
    expect(element.classList.contains('df-field')).toBe(true);
    expect(element.classList.contains('df-array')).toBe(true);
  });

  it('should subscribe to AddArrayItemEvent on construction', () => {
    const templateField = createSimpleTestField('item', 'Item');
    templateField.value = 'default';

    const field: ArrayField<any> = {
      key: 'items',
      type: 'array',
      fields: [templateField],
    };

    const { component, fixture } = setupArrayTest(field, { items: [] });
    const eventBus = TestBed.inject(EventBus);

    // Verify the component was constructed successfully
    expect(component).toBeDefined();

    // Dispatch add event and verify parent form value is updated
    eventBus.dispatch(AddArrayItemEvent, 'items', templateField);

    fixture.detectChanges();

    // The value should have been updated with a new array item
    const updatedValue = component.parentFieldSignalContext().value() as Record<string, unknown>;
    expect(Array.isArray(updatedValue['items'])).toBe(true);
    expect((updatedValue['items'] as unknown[]).length).toBe(1);
  });

  it('should add item at specific index when index is provided', () => {
    const templateField = createSimpleTestField('item', 'Item');
    templateField.value = 'new';

    const field: ArrayField<any> = {
      key: 'items',
      type: 'array',
      fields: [templateField],
    };

    const { component, fixture } = setupArrayTest(field, { items: ['first', 'third'] });
    const eventBus = TestBed.inject(EventBus);

    // Add at index 1 (between first and third)
    eventBus.dispatch(AddArrayItemEvent, 'items', templateField, 1);

    fixture.detectChanges();

    const updatedValue = component.parentFieldSignalContext().value() as Record<string, unknown>;
    const items = updatedValue['items'] as unknown[];

    // Should have 3 items now
    expect(items.length).toBe(3);
  });

  it('should remove item when RemoveArrayItemEvent is dispatched', () => {
    const field: ArrayField<any> = {
      key: 'items',
      type: 'array',
      fields: [createSimpleTestField('item', 'Item')],
    };

    const { component, fixture } = setupArrayTest(field, { items: ['value1', 'value2'] });
    const eventBus = TestBed.inject(EventBus);

    // Dispatch remove event
    eventBus.dispatch(RemoveArrayItemEvent, 'items', 0);

    fixture.detectChanges();

    const updatedValue = component.parentFieldSignalContext().value() as Record<string, unknown>;
    const items = updatedValue['items'] as unknown[];

    // Should have removed one item
    expect(items.length).toBe(1);
  });

  it('should not respond to events for different array keys', () => {
    const field: ArrayField<any> = {
      key: 'items',
      type: 'array',
      fields: [createSimpleTestField('item', 'Item')],
    };

    const { component, fixture } = setupArrayTest(field, { items: ['value1'] });
    const eventBus = TestBed.inject(EventBus);

    const initialValue = component.parentFieldSignalContext().value();

    // Dispatch event for different array
    eventBus.dispatch(AddArrayItemEvent, 'otherArray', createSimpleTestField('other', 'Other'));

    fixture.detectChanges();

    const updatedValue = component.parentFieldSignalContext().value();

    // Should not have changed
    expect(updatedValue).toEqual(initialValue);
  });
});
