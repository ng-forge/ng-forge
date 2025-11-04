import { GroupFieldComponent } from './group-field.component';
import { GroupField } from '../../definitions';
import { createSimpleTestField } from '../../testing';
import { TestBed } from '@angular/core/testing';
import { Injector, runInInjectionContext, signal } from '@angular/core';
import { form } from '@angular/forms/signals';
import { baseFieldMapper, FieldSignalContext } from '../../mappers';
import { provideDynamicForm } from '../../providers';
import { FIELD_REGISTRY, FieldTypeDefinition } from '../../models';

describe('GroupFieldComponent', () => {
  function setupGroupTest(field: GroupField<any>, value?: Record<string, unknown>) {
    const mockFieldType: FieldTypeDefinition = {
      name: 'test',
      loadComponent: () => import('../../testing/simple-test-utils'),
      mapper: baseFieldMapper,
    };

    TestBed.configureTestingModule({
      imports: [GroupFieldComponent],
      providers: [
        provideDynamicForm(),
        {
          provide: FIELD_REGISTRY,
          useValue: new Map([['test', mockFieldType]]),
        },
      ],
    });

    const fixture = TestBed.createComponent(GroupFieldComponent);
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
    const field: GroupField<any> = {
      key: 'testGroup',
      type: 'group',
      label: 'Test Group',
      fields: [],
    };

    const { component } = setupGroupTest(field);

    expect(component).toBeTruthy();
  });

  it('should have field input property', () => {
    const field: GroupField<any> = {
      key: 'testGroup',
      type: 'group',
      label: 'Test Group',
      fields: [],
    };

    const { component } = setupGroupTest(field);

    expect(component.field()).toEqual(field);
  });

  it('should have form state properties', () => {
    const field: GroupField<any> = {
      key: 'testGroup',
      type: 'group',
      label: 'Test Group',
      fields: [],
    };

    const { component } = setupGroupTest(field);

    expect(typeof component.valid()).toBe('boolean');
    expect(typeof component.invalid()).toBe('boolean');
    expect(typeof component.dirty()).toBe('boolean');
    expect(typeof component.touched()).toBe('boolean');
  });

  it('should render with child fields', () => {
    const field: GroupField<any> = {
      key: 'testGroup',
      type: 'group',
      label: 'Test Group',
      fields: [createSimpleTestField('field1', 'Field 1'), createSimpleTestField('field2', 'Field 2')],
    };

    const { fixture } = setupGroupTest(field, { field1: 'value1', field2: 'value2' });

    // The form element should be present in the template
    const formElement = fixture.nativeElement.querySelector('form');
    expect(formElement).toBeTruthy();
  });

  it('should have host classes', () => {
    const field: GroupField<any> = {
      key: 'testGroup',
      type: 'group',
      label: 'Test Group',
      fields: [],
    };

    const { fixture } = setupGroupTest(field);

    const element = fixture.nativeElement;
    expect(element.classList.contains('df-field')).toBe(true);
    expect(element.classList.contains('df-group')).toBe(true);
  });
});
