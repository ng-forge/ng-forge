import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Component, signal } from '@angular/core';
import { RowFieldComponent } from './row-field.component';
import { FieldRegistry } from '../../core/field-registry';
import { RowField } from '../../definitions/default/row-field';
import { provideDynamicForm } from '../../providers/dynamic-form-providers';

// Mock field component for testing
@Component({
  selector: 'df-mock-field',
  template: '<div>Mock Field: {{ value() }}</div>',
})
class MockFieldComponent {
  value = signal('test');
}

describe('RowFieldComponent', () => {
  let component: RowFieldComponent;
  let fixture: ComponentFixture<RowFieldComponent>;
  let fieldRegistry: FieldRegistry;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RowFieldComponent],
      providers: [provideDynamicForm()],
    }).compileComponents();

    fixture = TestBed.createComponent(RowFieldComponent);
    component = fixture.componentInstance;
    fieldRegistry = TestBed.inject(FieldRegistry);

    // Register mock field type
    fieldRegistry.registerType({
      name: 'mock',
      component: MockFieldComponent,
    });
  });

  it('should create', () => {
    const rowField: RowField = {
      key: 'testRow',
      type: 'row',
      label: 'Test Row',
      fields: [],
    };

    fixture.componentRef.setInput('field', rowField);
    fixture.componentRef.setInput('formValue', {});

    fixture.detectChanges();
    expect(component).toBeTruthy();
  });

  it('should render child definitions in horizontal layout', () => {
    const rowField: RowField = {
      key: 'testRow',
      type: 'row',
      label: 'Test Row',
      fields: [
        { key: 'field1', type: 'mock', label: 'Field 1' },
        { key: 'field2', type: 'mock', label: 'Field 2' },
      ],
    };

    fixture.componentRef.setInput('field', rowField);
    fixture.componentRef.setInput('formValue', { field1: 'value1', field2: 'value2' });

    fixture.detectChanges();

    const container = fixture.nativeElement.querySelector('.lib-row-field__container');
    expect(container).toBeTruthy();
    expect(getComputedStyle(container).display).toBe('flex');
  });

  it('should apply custom gap styles', () => {
    const rowField: RowField = {
      key: 'testRow',
      type: 'row',
      label: 'Test Row',
      fields: [],
      gap: {
        horizontal: '2rem',
        vertical: '1.5rem',
      },
    };

    fixture.componentRef.setInput('field', rowField);
    fixture.componentRef.setInput('formValue', {});

    fixture.detectChanges();

    const styles = component.containerStyles();
    expect(styles['--row-gap-width']).toBe('2rem');
    expect(styles['--row-gap-height']).toBe('1.5rem');
  });

  it('should apply custom CSS classes', () => {
    const rowField: RowField = {
      key: 'testRow',
      type: 'row',
      label: 'Test Row',
      fields: [],
      className: 'custom-row-class',
    };

    fixture.componentRef.setInput('field', rowField);
    fixture.componentRef.setInput('formValue', {});

    fixture.detectChanges();

    const classes = component.containerClasses();
    expect(classes).toContain('custom-row-class');
    expect(classes).toContain('lib-row-field__container');
  });

  it('should handle responsive breakpoints', () => {
    const rowField: RowField = {
      key: 'testRow',
      type: 'row',
      label: 'Test Row',
      fields: [],
      breakpoints: {
        stackAt: 'md',
      },
    };

    fixture.componentRef.setInput('field', rowField);
    fixture.componentRef.setInput('formValue', {});

    fixture.detectChanges();

    const classes = component.containerClasses();
    expect(classes).toContain('lib-row-field__stack-at-md');
  });

  it('should apply default breakpoint when not specified', () => {
    const rowField: RowField = {
      key: 'testRow',
      type: 'row',
      label: 'Test Row',
      fields: [],
    };

    fixture.componentRef.setInput('field', rowField);
    fixture.componentRef.setInput('formValue', {});

    fixture.detectChanges();

    const classes = component.containerClasses();
    expect(classes).toContain('lib-row-field__stack-at-sm');
  });
});
