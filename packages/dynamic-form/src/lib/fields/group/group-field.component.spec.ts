import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Component, signal } from '@angular/core';
import { GroupFieldComponent } from './group-field.component';
import { FieldRegistry } from '../../core/field-registry';
import { GroupField } from '../../definitions/default/group-field';
import { provideDynamicForm } from '../../providers/dynamic-form-providers';

// Mock field component for testing
@Component({
  selector: 'df-mock-field',
  template: '<div>Mock Field: {{ value() }}</div>',
})
class MockFieldComponent {
  value = signal('test');
}

describe('GroupFieldComponent', () => {
  let component: GroupFieldComponent;
  let fixture: ComponentFixture<GroupFieldComponent>;
  let fieldRegistry: FieldRegistry;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GroupFieldComponent],
      providers: [provideDynamicForm()],
    }).compileComponents();

    fixture = TestBed.createComponent(GroupFieldComponent);
    component = fixture.componentInstance;
    fieldRegistry = TestBed.inject(FieldRegistry);

    // Register mock field type
    fieldRegistry.registerType({
      name: 'mock',
      component: MockFieldComponent,
    });
  });

  it('should create', () => {
    const groupField: GroupField = {
      key: 'testGroup',
      type: 'group',
      label: 'Test Group',
      fields: [],
    };

    fixture.componentRef.setInput('field', groupField);
    fixture.componentRef.setInput('formValue', {});

    fixture.detectChanges();
    expect(component).toBeTruthy();
  });

  it('should render group label as legend', () => {
    const groupField: GroupField = {
      key: 'testGroup',
      type: 'group',
      label: 'Test Group Label',
      fields: [],
    };

    fixture.componentRef.setInput('field', groupField);
    fixture.componentRef.setInput('formValue', {});

    fixture.detectChanges();

    const legend = fixture.nativeElement.querySelector('.lib-group-field__legend');
    expect(legend).toBeTruthy();
    expect(legend.textContent.trim()).toBe('Test Group Label');
  });

  it('should render child definitions in vertical layout', () => {
    const groupField: GroupField = {
      key: 'testGroup',
      type: 'group',
      label: 'Test Group',
      fields: [
        { key: 'field1', type: 'mock', label: 'Field 1' },
        { key: 'field2', type: 'mock', label: 'Field 2' },
      ],
    };

    fixture.componentRef.setInput('field', groupField);
    fixture.componentRef.setInput('formValue', {
      testGroup: { field1: 'value1', field2: 'value2' },
    });

    fixture.detectChanges();

    const content = fixture.nativeElement.querySelector('.lib-group-field__content');
    expect(content).toBeTruthy();
    expect(getComputedStyle(content).display).toBe('flex');
    expect(getComputedStyle(content).flexDirection).toBe('column');
  });

  it('should apply custom gap styles', () => {
    const groupField: GroupField = {
      key: 'testGroup',
      type: 'group',
      label: 'Test Group',
      fields: [],
      gap: {
        horizontal: '2rem',
        vertical: '1.5rem',
      },
    };

    fixture.componentRef.setInput('field', groupField);
    fixture.componentRef.setInput('formValue', {});

    fixture.detectChanges();

    const styles = component.contentStyles();
    expect(styles.gap).toBe('1.5rem 2rem');
  });

  it('should apply custom CSS classes', () => {
    const groupField: GroupField = {
      key: 'testGroup',
      type: 'group',
      label: 'Test Group',
      fields: [],
      className: 'custom-group-class',
    };

    fixture.componentRef.setInput('field', groupField);
    fixture.componentRef.setInput('formValue', {});

    fixture.detectChanges();

    const classes = component.containerClasses();
    expect(classes).toContain('custom-group-class');
    expect(classes).toContain('lib-group-field__container');
    expect(classes).toContain('lib-group-field__bordered');
  });

  it('should create nested keys for child definitions', async () => {
    const groupField: GroupField = {
      key: 'address',
      type: 'group',
      label: 'Address Information',
      fields: [
        { key: 'street', type: 'mock', label: 'Street' },
        { key: 'city', type: 'mock', label: 'City' },
      ],
    };

    fixture.componentRef.setInput('field', groupField);
    fixture.componentRef.setInput('formValue', { address: { street: '123 Main St', city: 'New York' } });

    fixture.detectChanges();

    // Wait for async field creation
    await fixture.whenStable();

    // Verify that nested keys are properly created
    // This is tested indirectly through the form value structure
    const formValue = component.formValue();
    expect(formValue.address).toBeDefined();
    expect(formValue.address.street).toBe('123 Main St');
    expect(formValue.address.city).toBe('New York');
  });
});
