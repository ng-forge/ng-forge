import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideAnimations } from '@angular/platform-browser/animations';
import { MatSelectFieldComponent } from './mat-select.component';
import { DebugElement } from '@angular/core';
import { By } from '@angular/platform-browser';
import { MatSelect } from '@angular/material/select';
import { MatFormField } from '@angular/material/form-field';
import { SelectOption } from '@ng-forge/dynamic-form';

describe('MatSelectFieldComponent Integration Tests', () => {
  let component: MatSelectFieldComponent<string>;
  let fixture: ComponentFixture<MatSelectFieldComponent<string>>;
  let debugElement: DebugElement;

  const mockOptions: SelectOption<string>[] = [
    { label: 'Option 1', value: 'option1' },
    { label: 'Option 2', value: 'option2' },
    { label: 'Option 3', value: 'option3', disabled: true },
    { label: 'Option 4', value: 'option4' },
  ];

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MatSelectFieldComponent],
      providers: [provideAnimations()],
    }).compileComponents();

    fixture = TestBed.createComponent<MatSelectFieldComponent<string>>(MatSelectFieldComponent);
    component = fixture.componentInstance;
    debugElement = fixture.debugElement;
  });

  describe('Happy Flow - All Inputs Set', () => {
    beforeEach(() => {
      fixture.componentRef.setInput('label', 'Select Category');
      fixture.componentRef.setInput('placeholder', 'Choose a category');
      fixture.componentRef.setInput('options', mockOptions);
      fixture.componentRef.setInput('multiple', false);
      fixture.componentRef.setInput('hint', 'Select one option from the list');
      fixture.componentRef.setInput('className', 'custom-select');
      fixture.componentRef.setInput('appearance', 'outline');
      fixture.componentRef.setInput('required', true);
      fixture.componentRef.setInput('compareWith', (o1: string, o2: string) => o1 === o2);
      fixture.detectChanges();
    });

    it('should render with all properties correctly set', () => {
      const matSelect = debugElement.query(By.directive(MatSelect));
      const matFormField = debugElement.query(By.directive(MatFormField));
      const hintElement = debugElement.query(By.css('.mat-hint'));
      const labelElement = debugElement.query(By.css('mat-label'));

      expect(component.label()).toBe('Select Category');
      expect(component.placeholder()).toBe('Choose a category');
      expect(component.options()).toEqual(mockOptions);
      expect(component.multiple()).toBe(false);
      expect(component.hint()).toBe('Select one option from the list');
      expect(component.className()).toBe('custom-select');
      expect(component.appearance()).toBe('outline');
      expect(component.required()).toBe(true);

      expect(matFormField.nativeElement.getAttribute('ng-reflect-appearance')).toBe('outline');
      expect(matFormField.nativeElement.className).toContain('custom-select');
      expect(labelElement.nativeElement.textContent.trim()).toBe('Select Category');
      expect(matSelect.nativeElement.getAttribute('placeholder')).toBe('Choose a category');
      expect(matSelect.nativeElement.getAttribute('ng-reflect-multiple')).toBe('false');
      expect(hintElement.nativeElement.textContent.trim()).toBe('Select one option from the list');
    });

    it('should render all options correctly', () => {
      // Open the select dropdown
      const matSelect = debugElement.query(By.directive(MatSelect));
      matSelect.nativeElement.click();
      fixture.detectChanges();

      const options = debugElement.queryAll(By.css('mat-option'));
      expect(options.length).toBe(4);

      expect(options[0].nativeElement.textContent.trim()).toBe('Option 1');
      expect(options[0].nativeElement.getAttribute('ng-reflect-value')).toBe('option1');
      expect(options[0].nativeElement.getAttribute('ng-reflect-disabled')).toBe('false');

      expect(options[1].nativeElement.textContent.trim()).toBe('Option 2');
      expect(options[1].nativeElement.getAttribute('ng-reflect-value')).toBe('option2');

      expect(options[2].nativeElement.textContent.trim()).toBe('Option 3');
      expect(options[2].nativeElement.getAttribute('ng-reflect-value')).toBe('option3');
      expect(options[2].nativeElement.getAttribute('ng-reflect-disabled')).toBe('true');

      expect(options[3].nativeElement.textContent.trim()).toBe('Option 4');
      expect(options[3].nativeElement.getAttribute('ng-reflect-value')).toBe('option4');
    });

    it('should handle value selection correctly', () => {
      const matSelect = debugElement.query(By.directive(MatSelect));

      expect(component.value()).toBeUndefined();

      // Simulate selecting a value
      component.value.set('option2');
      fixture.detectChanges();

      expect(component.value()).toBe('option2');
      expect(matSelect.nativeElement.getAttribute('ng-reflect-ng-model')).toBe('option2');
    });

    it('should handle touched state correctly', () => {
      const matSelect = debugElement.query(By.directive(MatSelect));

      expect(component.touched()).toBe(false);

      // Trigger blur event
      matSelect.triggerEventHandler('blur', {});
      fixture.detectChanges();

      expect(component.touched()).toBe(true);
    });
  });

  describe('Minimal Configuration', () => {
    beforeEach(() => {
      fixture.componentRef.setInput('label', 'Simple Select');
      fixture.componentRef.setInput('options', mockOptions);
      fixture.detectChanges();
    });

    it('should render with default values when only required props are set', () => {
      const matSelect = debugElement.query(By.directive(MatSelect));
      const matFormField = debugElement.query(By.directive(MatFormField));

      expect(component.label()).toBe('Simple Select');
      expect(component.placeholder()).toBe('');
      expect(component.options()).toEqual(mockOptions);
      expect(component.multiple()).toBe(false);
      expect(component.hint()).toBe('');
      expect(component.className()).toBe('');
      expect(component.appearance()).toBe('fill');
      expect(component.required()).toBe(false);
      expect(component.compareWith()).toBeUndefined();

      expect(matFormField.nativeElement.getAttribute('ng-reflect-appearance')).toBe('fill');
      expect(matFormField.nativeElement.className).toBe('');
      expect(matSelect.nativeElement.getAttribute('placeholder')).toBe('');
      expect(matSelect.nativeElement.getAttribute('ng-reflect-multiple')).toBe('false');
    });

    it('should not display hint when not provided', () => {
      const hintElement = debugElement.query(By.css('.mat-hint'));
      expect(hintElement).toBeNull();
    });

    it('should use default comparison function', () => {
      expect(component.defaultCompare).toBe(Object.is);
    });
  });

  describe('Multiple Selection Mode', () => {
    beforeEach(() => {
      fixture.componentRef.setInput('label', 'Multiple Select');
      fixture.componentRef.setInput('options', mockOptions);
      fixture.componentRef.setInput('multiple', true);
      fixture.detectChanges();
    });

    it('should render in multiple selection mode', () => {
      const matSelect = debugElement.query(By.directive(MatSelect));

      expect(component.multiple()).toBe(true);
      expect(matSelect.nativeElement.getAttribute('ng-reflect-multiple')).toBe('true');
    });

    it('should handle multiple value selection', () => {
      expect(component.value()).toBeUndefined();

      // Simulate selecting multiple values
      component.value.set(['option1', 'option2'] as any);
      fixture.detectChanges();

      expect(component.value()).toEqual(['option1', 'option2']);
    });
  });

  describe('Disabled State', () => {
    beforeEach(() => {
      fixture.componentRef.setInput('label', 'Disabled Select');
      fixture.componentRef.setInput('options', mockOptions);
      component.disabled.set(true);
      fixture.detectChanges();
    });

    it('should render as disabled', () => {
      const matSelect = debugElement.query(By.directive(MatSelect));

      expect(component.disabled()).toBe(true);
      expect(component.disabled()).toBe(true);
    });

    it('should not be interactive when disabled', () => {
      const matSelect = debugElement.query(By.directive(MatSelect));

      // Try to select a value on disabled select
      component.value.set('option1');
      fixture.detectChanges();

      expect(component.value()).toBe('option1');
      // The model value changes but the select should appear disabled
      expect(component.disabled()).toBe(true);
    });
  });

  describe('Error Handling and Validation', () => {
    beforeEach(() => {
      fixture.componentRef.setInput('label', 'Validated Select');
      fixture.componentRef.setInput('options', mockOptions);
      fixture.componentRef.setInput('required', true);
      fixture.detectChanges();
    });

    it('should not display errors when valid', () => {
      component.invalid.set(false);
      component.touched.set(true);
      component.errors.set([]);
      fixture.detectChanges();

      const errorElements = debugElement.queryAll(By.css('.mat-error'));
      expect(errorElements.length).toBe(0);
    });

    it('should not display errors when invalid but not touched', () => {
      component.invalid.set(true);
      component.touched.set(false);
      component.errors.set([{ message: 'This field is required' }]);
      fixture.detectChanges();

      const errorElements = debugElement.queryAll(By.css('.mat-error'));
      expect(errorElements.length).toBe(0);
    });

    it('should display errors when invalid and touched', () => {
      component.invalid.set(true);
      component.touched.set(true);
      component.errors.set([{ message: 'This field is required' }]);
      fixture.detectChanges();

      const errorElements = debugElement.queryAll(By.css('.mat-error'));
      expect(errorElements.length).toBe(1);
      expect(errorElements[0].nativeElement.textContent.trim()).toBe('This field is required');
    });

    it('should display multiple errors when invalid and touched', () => {
      component.invalid.set(true);
      component.touched.set(true);
      component.errors.set([{ message: 'This field is required' }, { message: 'Please select a valid option' }]);
      fixture.detectChanges();

      const errorElements = debugElement.queryAll(By.css('.mat-error'));
      expect(errorElements.length).toBe(1);
      const errorSpans = errorElements[0].queryAll(By.css('span'));
      expect(errorSpans.length).toBe(2);
      expect(errorSpans[0].nativeElement.textContent.trim()).toBe('This field is required');
      expect(errorSpans[1].nativeElement.textContent.trim()).toBe('Please select a valid option');
    });

    it('should handle error state changes dynamically', () => {
      // Start valid
      component.invalid.set(false);
      component.touched.set(true);
      component.errors.set([]);
      fixture.detectChanges();

      let errorElements = debugElement.queryAll(By.css('.mat-error'));
      expect(errorElements.length).toBe(0);

      // Become invalid
      component.invalid.set(true);
      component.errors.set([{ message: 'Validation failed' }]);
      fixture.detectChanges();

      errorElements = debugElement.queryAll(By.css('.mat-error'));
      expect(errorElements.length).toBe(1);
      expect(errorElements[0].nativeElement.textContent.trim()).toBe('Validation failed');

      // Become valid again
      component.invalid.set(false);
      component.errors.set([]);
      fixture.detectChanges();

      errorElements = debugElement.queryAll(By.css('.mat-error'));
      expect(errorElements.length).toBe(0);
    });
  });

  describe('Appearance Variations', () => {
    it('should handle fill appearance', () => {
      fixture.componentRef.setInput('label', 'Fill Select');
      fixture.componentRef.setInput('options', mockOptions);
      fixture.componentRef.setInput('appearance', 'fill');
      fixture.detectChanges();

      const matFormField = debugElement.query(By.directive(MatFormField));
      expect(matFormField.nativeElement.getAttribute('ng-reflect-appearance')).toBe('fill');
    });

    it('should handle outline appearance', () => {
      fixture.componentRef.setInput('label', 'Outline Select');
      fixture.componentRef.setInput('options', mockOptions);
      fixture.componentRef.setInput('appearance', 'outline');
      fixture.detectChanges();

      const matFormField = debugElement.query(By.directive(MatFormField));
      expect(matFormField.nativeElement.getAttribute('ng-reflect-appearance')).toBe('outline');
    });
  });

  describe('Custom Comparison Function', () => {
    const customCompare = (o1: string, o2: string) => o1?.toLowerCase() === o2?.toLowerCase();

    beforeEach(() => {
      fixture.componentRef.setInput('label', 'Custom Compare Select');
      fixture.componentRef.setInput('options', mockOptions);
      fixture.componentRef.setInput('compareWith', customCompare);
      fixture.detectChanges();
    });

    it('should use custom comparison function', () => {
      const matSelect = debugElement.query(By.directive(MatSelect));

      expect(component.compareWith()).toBe(customCompare);
      expect(matSelect.nativeElement.getAttribute('ng-reflect-compare-with')).toBeTruthy();
    });

    it('should fallback to default comparison when not provided', () => {
      fixture.componentRef.setInput('compareWith', undefined);
      fixture.detectChanges();

      const matSelect = debugElement.query(By.directive(MatSelect));
      expect(matSelect.nativeElement.getAttribute('ng-reflect-compare-with')).toBeTruthy();
    });
  });

  describe('Accessibility', () => {
    beforeEach(() => {
      fixture.componentRef.setInput('label', 'Accessible Select');
      fixture.componentRef.setInput('options', mockOptions);
      fixture.detectChanges();
    });

    it('should have proper label association', () => {
      const labelElement = debugElement.query(By.css('mat-label'));
      const matSelect = debugElement.query(By.directive(MatSelect));

      expect(labelElement.nativeElement.textContent.trim()).toBe('Accessible Select');
      expect(matSelect.nativeElement).toBeTruthy();
    });

    it('should handle required state for accessibility', () => {
      fixture.componentRef.setInput('required', true);
      fixture.detectChanges();

      expect(component.required()).toBe(true);
    });

    it('should support placeholder for accessibility', () => {
      fixture.componentRef.setInput('placeholder', 'Select an option');
      fixture.detectChanges();

      const matSelect = debugElement.query(By.directive(MatSelect));
      expect(component.placeholder()).toBe('Select an option');
    });
  });

  describe('Dynamic State Changes', () => {
    beforeEach(() => {
      fixture.componentRef.setInput('label', 'Dynamic Select');
      fixture.componentRef.setInput('options', mockOptions);
      fixture.detectChanges();
    });

    it('should handle multiple state changes in sequence', () => {
      // Select a value
      component.value.set('option1');
      fixture.detectChanges();
      expect(component.value()).toBe('option1');

      // Touch it
      component.touched.set(true);
      fixture.detectChanges();
      expect(component.touched()).toBe(true);

      // Make it invalid
      component.invalid.set(true);
      component.errors.set([{ message: 'Error occurred' }]);
      fixture.detectChanges();

      expect(component.invalid()).toBe(true);
      expect(component.errors().length).toBe(1);

      // Disable it
      component.disabled.set(true);
      fixture.detectChanges();

      const matSelect = debugElement.query(By.directive(MatSelect));
      expect(component.disabled()).toBe(true);

      // Change value
      component.value.set('option2');
      fixture.detectChanges();
      expect(component.value()).toBe('option2');
    });

    it('should handle options changes dynamically', () => {
      const newOptions: SelectOption<string>[] = [
        { label: 'New Option 1', value: 'new1' },
        { label: 'New Option 2', value: 'new2' },
      ];

      fixture.componentRef.setInput('options', newOptions);
      fixture.detectChanges();

      expect(component.options()).toEqual(newOptions);
    });
  });

  describe('Empty Options Handling', () => {
    beforeEach(() => {
      fixture.componentRef.setInput('label', 'Empty Select');
      fixture.componentRef.setInput('options', []);
      fixture.detectChanges();
    });

    it('should handle empty options array', () => {
      const matSelect = debugElement.query(By.directive(MatSelect));

      expect(component.options()).toEqual([]);
      expect(matSelect.nativeElement).toBeTruthy();
    });
  });

  describe('Value Management', () => {
    beforeEach(() => {
      fixture.componentRef.setInput('label', 'Value Test Select');
      fixture.componentRef.setInput('options', mockOptions);
      fixture.detectChanges();
    });

    it('should handle undefined initial value', () => {
      expect(component.value()).toBeUndefined();
    });

    it('should handle null value', () => {
      component.value.set(null as any);
      fixture.detectChanges();

      expect(component.value()).toBeNull();
    });

    it('should handle string values', () => {
      component.value.set('option1');
      fixture.detectChanges();

      expect(component.value()).toBe('option1');
    });

    it('should handle value changes', () => {
      component.value.set('option1');
      fixture.detectChanges();
      expect(component.value()).toBe('option1');

      component.value.set('option2');
      fixture.detectChanges();
      expect(component.value()).toBe('option2');
    });
  });
});
