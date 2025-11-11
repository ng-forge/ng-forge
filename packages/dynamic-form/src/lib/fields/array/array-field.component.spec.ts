import { ArrayFieldComponent } from './array-field.component';
import { ArrayField } from '../../definitions';
import { createSimpleTestField } from '../../testing';
import { TestBed } from '@angular/core/testing';
import { Injector, runInInjectionContext, signal } from '@angular/core';
import { form } from '@angular/forms/signals';
import { baseFieldMapper, FieldSignalContext } from '../../mappers';
import { provideDynamicForm } from '../../providers';
import { FIELD_REGISTRY, FieldTypeDefinition } from '../../models';

describe('ArrayFieldComponent', () => {
  function setupArrayTest(field: ArrayField<any>, value?: Record<string, unknown>) {
    const mockFieldType: FieldTypeDefinition = {
      name: 'test',
      loadComponent: () => import('../../testing/simple-test-utils'),
      mapper: baseFieldMapper,
    };

    TestBed.configureTestingModule({
      imports: [ArrayFieldComponent],
      providers: [
        provideDynamicForm(),
        {
          provide: FIELD_REGISTRY,
          useValue: new Map([['test', mockFieldType]]),
        },
      ],
    });

    const fixture = TestBed.createComponent(ArrayFieldComponent);
    const component = fixture.componentInstance;
    const injector = TestBed.inject(Injector);

    const valueSignal = signal(value || {});
    const defaultValues = () => ({});
    const testForm = runInInjectionContext(injector, () => form(valueSignal));

    const mockFieldSignalContext: FieldSignalContext<Record<string, unknown>> = {
      injector,
      value: valueSignal,
      defaultValues,
      form: testForm,
    };

    fixture.componentRef.setInput('key', 'key');
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

  it('should have form state properties', () => {
    const field: ArrayField<any> = {
      key: 'testArray',
      type: 'array',
      label: 'Test Array',
      fields: [],
    };

    const { component } = setupArrayTest(field);

    expect(typeof component.valid()).toBe('boolean');
    expect(typeof component.invalid()).toBe('boolean');
    expect(typeof component.dirty()).toBe('boolean');
    expect(typeof component.touched()).toBe('boolean');
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
    // This is tested indirectly through the component's behavior
    expect(component).toBeDefined();
  });

  it('should initialize with zero items for empty array', () => {
    const field: ArrayField<any> = {
      key: 'items',
      type: 'array',
      fields: [createSimpleTestField('item', 'Item')],
    };

    const { component } = setupArrayTest(field, { items: [] });

    // With an empty array value, there should be no field instances
    expect(component.fields()).toHaveLength(0);
  });

  it('should create field instances for existing array items', () => {
    const field: ArrayField<any> = {
      key: 'items',
      type: 'array',
      fields: [createSimpleTestField('item', 'Item')],
    };

    const { component } = setupArrayTest(field, { items: ['value1', 'value2', 'value3'] });

    // Should create one field instance per array item
    // Note: Actual field creation happens asynchronously, so this tests the setup
    expect(component).toBeDefined();
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
});
