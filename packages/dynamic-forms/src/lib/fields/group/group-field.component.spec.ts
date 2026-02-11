import { GroupFieldComponent } from './group-field.component';
import { GroupField } from '../../definitions/default/group-field';
import { FieldDef } from '../../definitions/base/field-def';
import { createSimpleTestField, TestFieldComponent } from '../../../../testing/src/simple-test-utils';
import { TestBed } from '@angular/core/testing';
import { Injector, runInInjectionContext, signal } from '@angular/core';
import { form } from '@angular/forms/signals';
import { baseFieldMapper, FieldSignalContext } from '../../mappers';
import { provideDynamicForm } from '../../providers';
import { FIELD_REGISTRY } from '../../models/field-type';
import { FIELD_SIGNAL_CONTEXT } from '../../models/field-signal-context.token';
import { FieldTypeDefinition } from '../../models/field-type';
import { EventBus } from '../../events';
import { FunctionRegistryService } from '../../core/registry/function-registry.service';

describe('GroupFieldComponent', () => {
  function setupGroupTest(field: GroupField<readonly FieldDef<unknown>[]>, groupValue?: Record<string, unknown>) {
    const mockFieldType: FieldTypeDefinition = {
      name: 'test',
      loadComponent: async () => TestFieldComponent,
      mapper: baseFieldMapper,
    };

    TestBed.configureTestingModule({
      imports: [GroupFieldComponent],
      providers: [
        provideDynamicForm(),
        EventBus,
        FunctionRegistryService,
        {
          provide: FIELD_REGISTRY,
          useValue: new Map([['test', mockFieldType]]),
        },
        {
          provide: FIELD_SIGNAL_CONTEXT,
          useFactory: (injector: Injector) => {
            return runInInjectionContext(injector, () => {
              // Parent form value must contain the group key with its nested values
              const parentValue = { [field.key]: groupValue || {} };
              const valueSignal = signal(parentValue);
              const testForm = form(valueSignal);
              const mockFieldSignalContext: FieldSignalContext<Record<string, unknown>> = {
                injector,
                value: valueSignal,
                defaultValues: () => ({}),
                form: testForm,
              };
              return mockFieldSignalContext;
            });
          },
          deps: [Injector],
        },
      ],
    });

    const fixture = TestBed.createComponent(GroupFieldComponent);
    const component = fixture.componentInstance;

    fixture.componentRef.setInput('key', field.key);
    fixture.componentRef.setInput('field', field);

    fixture.detectChanges();

    return { component, fixture };
  }

  it('should create', () => {
    const field: GroupField<readonly FieldDef<unknown>[]> = {
      key: 'testGroup',
      type: 'group',
      label: 'Test Group',
      fields: [],
    };

    const { component } = setupGroupTest(field);

    expect(component).toBeDefined();
    expect(component).toBeInstanceOf(GroupFieldComponent);
  });

  it('should have field input property', () => {
    const field: GroupField<readonly FieldDef<unknown>[]> = {
      key: 'testGroup',
      type: 'group',
      label: 'Test Group',
      fields: [],
    };

    const { component } = setupGroupTest(field);

    expect(component.field()).toEqual(field);
  });

  it('should render with child fields', () => {
    const field: GroupField<readonly FieldDef<unknown>[]> = {
      key: 'testGroup',
      type: 'group',
      label: 'Test Group',
      fields: [createSimpleTestField('field1', 'Field 1'), createSimpleTestField('field2', 'Field 2')],
    };

    // Group value is the nested content of the group
    const { fixture } = setupGroupTest(field, { field1: 'value1', field2: 'value2' });

    // Host should have grid layout via df-group class
    const host = fixture.nativeElement;
    expect(host.classList.contains('df-group')).toBe(true);
    expect(host.classList.contains('df-field')).toBe(true);
  });

  it('should have host classes', () => {
    const field: GroupField<readonly FieldDef<unknown>[]> = {
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

  it('should not have df-container-hidden class when hidden is false', () => {
    const field: GroupField<readonly FieldDef<unknown>[]> = {
      key: 'testGroup',
      type: 'group',
      fields: [],
    };

    const { fixture } = setupGroupTest(field);
    fixture.componentRef.setInput('hidden', false);
    fixture.detectChanges();

    const element = fixture.nativeElement;
    expect(element.classList.contains('df-container-hidden')).toBe(false);
    expect(element.getAttribute('aria-hidden')).toBeNull();
  });

  it('should have df-container-hidden class and aria-hidden when hidden is true', () => {
    const field: GroupField<readonly FieldDef<unknown>[]> = {
      key: 'testGroup',
      type: 'group',
      fields: [],
    };

    const { fixture } = setupGroupTest(field);
    fixture.componentRef.setInput('hidden', true);
    fixture.detectChanges();

    const element = fixture.nativeElement;
    expect(element.classList.contains('df-container-hidden')).toBe(true);
    expect(element.getAttribute('aria-hidden')).toBe('true');
  });
});
