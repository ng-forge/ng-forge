import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideAnimations } from '@angular/platform-browser/animations';
import { MatMultiCheckboxFieldComponent } from './mat-multi-checkbox.component';
import { DebugElement } from '@angular/core';
import { By } from '@angular/platform-browser';
import { MatCheckbox } from '@angular/material/checkbox';

interface TestOption {
  value: string;
  label: string;
  disabled?: boolean;
}

describe('MatMultiCheckboxFieldComponent Integration Tests', () => {
  let component: MatMultiCheckboxFieldComponent<string>;
  let fixture: ComponentFixture<MatMultiCheckboxFieldComponent<string>>;
  let debugElement: DebugElement;

  const defaultOptions: TestOption[] = [
    { value: 'option1', label: 'Option 1' },
    { value: 'option2', label: 'Option 2' },
    { value: 'option3', label: 'Option 3' }
  ];

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MatMultiCheckboxFieldComponent],
      providers: [provideAnimations()]
    }).compileComponents();

    fixture = TestBed.createComponent(MatMultiCheckboxFieldComponent<string>);
    component = fixture.componentInstance;
    debugElement = fixture.debugElement;
  });

  describe('Happy Flow - All Inputs Set', () => {
    beforeEach(() => {
      const optionsWithDisabled: TestOption[] = [
        { value: 'fruits', label: 'Fruits' },
        { value: 'vegetables', label: 'Vegetables' },
        { value: 'meat', label: 'Meat', disabled: true },
        { value: 'dairy', label: 'Dairy Products' }
      ];

      fixture.componentRef.setInput('label', 'Food Preferences');
      fixture.componentRef.setInput('options', optionsWithDisabled);
      fixture.componentRef.setInput('required', true);
      fixture.componentRef.setInput('color', 'accent');
      fixture.componentRef.setInput('labelPosition', 'before');
      fixture.componentRef.setInput('hint', 'Select all that apply');
      fixture.componentRef.setInput('className', 'custom-multi-checkbox');
      fixture.componentRef.setInput('appearance', 'outline');
      fixture.detectChanges();
    });

    it('should render with all properties correctly set', () => {
      const container = debugElement.query(By.css('div'));
      const labelElement = debugElement.query(By.css('.checkbox-group-label'));
      const checkboxes = debugElement.queryAll(By.directive(MatCheckbox));
      const hintElement = debugElement.query(By.css('.mat-hint'));

      expect(component.label()).toBe('Food Preferences');
      expect(component.options().length).toBe(4);
      expect(component.required()).toBe(true);
      expect(component.color()).toBe('accent');
      expect(component.labelPosition()).toBe('before');
      expect(component.hint()).toBe('Select all that apply');
      expect(component.className()).toBe('custom-multi-checkbox');
      expect(component.appearance()).toBe('outline');

      expect(container.nativeElement.className).toBe('custom-multi-checkbox');
      expect(labelElement.nativeElement.textContent.trim()).toBe('Food Preferences');
      expect(checkboxes.length).toBe(4);
      expect(hintElement.nativeElement.textContent.trim()).toBe('Select all that apply');

      // Check individual checkbox properties
      checkboxes.forEach((checkbox, index) => {
        expect(checkbox.nativeElement.getAttribute('ng-reflect-color')).toBe('accent');
        expect(checkbox.nativeElement.getAttribute('ng-reflect-label-position')).toBe('before');
      });
    });

    it('should handle checkbox selection correctly', () => {
      const checkboxes = debugElement.queryAll(By.directive(MatCheckbox));
      
      expect(component.value()).toEqual([]);
      expect(component.isChecked('fruits')).toBe(false);
      
      // Simulate checking the first checkbox
      component.onCheckboxChange('fruits', true);
      fixture.detectChanges();
      
      expect(component.value()).toEqual(['fruits']);
      expect(component.isChecked('fruits')).toBe(true);
      expect(component.touched()).toBe(true);
    });

    it('should handle multiple selections correctly', () => {
      expect(component.value()).toEqual([]);
      
      // Select multiple options
      component.onCheckboxChange('fruits', true);
      component.onCheckboxChange('vegetables', true);
      fixture.detectChanges();
      
      expect(component.value()).toEqual(['fruits', 'vegetables']);
      expect(component.isChecked('fruits')).toBe(true);
      expect(component.isChecked('vegetables')).toBe(true);
      expect(component.isChecked('dairy')).toBe(false);
    });

    it('should handle unchecking selections correctly', () => {
      // First select some options
      component.onCheckboxChange('fruits', true);
      component.onCheckboxChange('vegetables', true);
      component.onCheckboxChange('dairy', true);
      fixture.detectChanges();
      
      expect(component.value()).toEqual(['fruits', 'vegetables', 'dairy']);
      
      // Uncheck one option
      component.onCheckboxChange('vegetables', false);
      fixture.detectChanges();
      
      expect(component.value()).toEqual(['fruits', 'dairy']);
      expect(component.isChecked('fruits')).toBe(true);
      expect(component.isChecked('vegetables')).toBe(false);
      expect(component.isChecked('dairy')).toBe(true);
    });

    it('should display disabled checkboxes correctly', () => {
      const checkboxes = debugElement.queryAll(By.directive(MatCheckbox));
      const meatCheckbox = checkboxes[2]; // meat option is disabled
      
      expect(meatCheckbox.nativeElement.getAttribute('ng-reflect-disabled')).toBe('true');
    });
  });

  describe('Minimal Configuration', () => {
    beforeEach(() => {
      fixture.componentRef.setInput('label', 'Simple Multi-Checkbox');
      fixture.componentRef.setInput('options', defaultOptions);
      fixture.detectChanges();
    });

    it('should render with default values when only required props are set', () => {
      const container = debugElement.query(By.css('div'));
      const checkboxes = debugElement.queryAll(By.directive(MatCheckbox));

      expect(component.label()).toBe('Simple Multi-Checkbox');
      expect(component.options()).toEqual(defaultOptions);
      expect(component.required()).toBe(false);
      expect(component.color()).toBe('primary');
      expect(component.labelPosition()).toBe('after');
      expect(component.hint()).toBe('');
      expect(component.className()).toBe('');
      expect(component.appearance()).toBe('fill');

      expect(container.nativeElement.className).toBe('');
      expect(checkboxes.length).toBe(3);

      checkboxes.forEach((checkbox) => {
        expect(checkbox.nativeElement.getAttribute('ng-reflect-color')).toBe('primary');
        expect(checkbox.nativeElement.getAttribute('ng-reflect-label-position')).toBe('after');
      });
    });

    it('should not display hint when not provided', () => {
      const hintElement = debugElement.query(By.css('.mat-hint'));
      expect(hintElement).toBeNull();
    });
  });

  describe('Disabled State', () => {
    beforeEach(() => {
      fixture.componentRef.setInput('label', 'Disabled Multi-Checkbox');
      fixture.componentRef.setInput('options', defaultOptions);
      component.disabled.set(true);
      fixture.detectChanges();
    });

    it('should render all checkboxes as disabled', () => {
      const checkboxes = debugElement.queryAll(By.directive(MatCheckbox));
      
      expect(component.disabled()).toBe(true);
      
      checkboxes.forEach((checkbox) => {
        expect(checkbox.nativeElement.getAttribute('ng-reflect-disabled')).toBe('true');
      });
    });

    it('should still allow programmatic value changes when disabled', () => {
      component.onCheckboxChange('option1', true);
      fixture.detectChanges();
      
      expect(component.value()).toEqual(['option1']);
      expect(component.isChecked('option1')).toBe(true);
    });
  });

  describe('Individual Option Disabled State', () => {
    beforeEach(() => {
      const optionsWithSomeDisabled: TestOption[] = [
        { value: 'option1', label: 'Option 1' },
        { value: 'option2', label: 'Option 2', disabled: true },
        { value: 'option3', label: 'Option 3' }
      ];

      fixture.componentRef.setInput('label', 'Mixed Disabled State');
      fixture.componentRef.setInput('options', optionsWithSomeDisabled);
      fixture.detectChanges();
    });

    it('should render only specific checkboxes as disabled', () => {
      const checkboxes = debugElement.queryAll(By.directive(MatCheckbox));
      
      expect(checkboxes[0].nativeElement.getAttribute('ng-reflect-disabled')).toBe('false');
      expect(checkboxes[1].nativeElement.getAttribute('ng-reflect-disabled')).toBe('true');
      expect(checkboxes[2].nativeElement.getAttribute('ng-reflect-disabled')).toBe('false');
    });
  });

  describe('Error Handling and Validation', () => {
    beforeEach(() => {
      fixture.componentRef.setInput('label', 'Validated Multi-Checkbox');
      fixture.componentRef.setInput('options', defaultOptions);
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
      component.errors.set([{ message: 'At least one option must be selected' }]);
      fixture.detectChanges();

      const errorElements = debugElement.queryAll(By.css('.mat-error'));
      expect(errorElements.length).toBe(0);
    });

    it('should display errors when invalid and touched', () => {
      component.invalid.set(true);
      component.touched.set(true);
      component.errors.set([{ message: 'At least one option must be selected' }]);
      fixture.detectChanges();

      const errorElements = debugElement.queryAll(By.css('.mat-error'));
      expect(errorElements.length).toBe(1);
      expect(errorElements[0].nativeElement.textContent.trim()).toBe('At least one option must be selected');
    });

    it('should display multiple errors when invalid and touched', () => {
      component.invalid.set(true);
      component.touched.set(true);
      component.errors.set([
        { message: 'At least one option must be selected' },
        { message: 'Maximum 2 options allowed' }
      ]);
      fixture.detectChanges();

      const errorElements = debugElement.queryAll(By.css('.mat-error'));
      expect(errorElements.length).toBe(2);
      expect(errorElements[0].nativeElement.textContent.trim()).toBe('At least one option must be selected');
      expect(errorElements[1].nativeElement.textContent.trim()).toBe('Maximum 2 options allowed');
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

  describe('Color Variations', () => {
    beforeEach(() => {
      fixture.componentRef.setInput('label', 'Color Test');
      fixture.componentRef.setInput('options', defaultOptions);
      fixture.detectChanges();
    });

    it('should handle primary color', () => {
      fixture.componentRef.setInput('color', 'primary');
      fixture.detectChanges();

      const checkboxes = debugElement.queryAll(By.directive(MatCheckbox));
      checkboxes.forEach((checkbox) => {
        expect(checkbox.nativeElement.getAttribute('ng-reflect-color')).toBe('primary');
      });
    });

    it('should handle accent color', () => {
      fixture.componentRef.setInput('color', 'accent');
      fixture.detectChanges();

      const checkboxes = debugElement.queryAll(By.directive(MatCheckbox));
      checkboxes.forEach((checkbox) => {
        expect(checkbox.nativeElement.getAttribute('ng-reflect-color')).toBe('accent');
      });
    });

    it('should handle warn color', () => {
      fixture.componentRef.setInput('color', 'warn');
      fixture.detectChanges();

      const checkboxes = debugElement.queryAll(By.directive(MatCheckbox));
      checkboxes.forEach((checkbox) => {
        expect(checkbox.nativeElement.getAttribute('ng-reflect-color')).toBe('warn');
      });
    });
  });

  describe('Label Position Variations', () => {
    beforeEach(() => {
      fixture.componentRef.setInput('label', 'Label Position Test');
      fixture.componentRef.setInput('options', defaultOptions);
      fixture.detectChanges();
    });

    it('should handle label position after', () => {
      fixture.componentRef.setInput('labelPosition', 'after');
      fixture.detectChanges();

      const checkboxes = debugElement.queryAll(By.directive(MatCheckbox));
      checkboxes.forEach((checkbox) => {
        expect(checkbox.nativeElement.getAttribute('ng-reflect-label-position')).toBe('after');
      });
    });

    it('should handle label position before', () => {
      fixture.componentRef.setInput('labelPosition', 'before');
      fixture.detectChanges();

      const checkboxes = debugElement.queryAll(By.directive(MatCheckbox));
      checkboxes.forEach((checkbox) => {
        expect(checkbox.nativeElement.getAttribute('ng-reflect-label-position')).toBe('before');
      });
    });
  });

  describe('Dynamic State Changes', () => {
    beforeEach(() => {
      fixture.componentRef.setInput('label', 'Dynamic Multi-Checkbox');
      fixture.componentRef.setInput('options', defaultOptions);
      fixture.detectChanges();
    });

    it('should handle multiple state changes in sequence', () => {
      // Select some options
      component.onCheckboxChange('option1', true);
      component.onCheckboxChange('option3', true);
      fixture.detectChanges();
      
      expect(component.value()).toEqual(['option1', 'option3']);
      expect(component.touched()).toBe(true);

      // Make it invalid
      component.invalid.set(true);
      component.errors.set([{ message: 'Error occurred' }]);
      fixture.detectChanges();
      
      const errorElements = debugElement.queryAll(By.css('.mat-error'));
      expect(errorElements.length).toBe(1);

      // Disable it
      component.disabled.set(true);
      fixture.detectChanges();
      
      const checkboxes = debugElement.queryAll(By.directive(MatCheckbox));
      checkboxes.forEach((checkbox) => {
        expect(checkbox.nativeElement.getAttribute('ng-reflect-disabled')).toBe('true');
      });

      // Change selection programmatically
      component.onCheckboxChange('option2', true);
      fixture.detectChanges();
      expect(component.value()).toEqual(['option1', 'option3', 'option2']);

      // Unselect an option
      component.onCheckboxChange('option1', false);
      fixture.detectChanges();
      expect(component.value()).toEqual(['option3', 'option2']);
    });

    it('should handle options changes', () => {
      const newOptions: TestOption[] = [
        { value: 'newOption1', label: 'New Option 1' },
        { value: 'newOption2', label: 'New Option 2' }
      ];

      fixture.componentRef.setInput('options', newOptions);
      fixture.detectChanges();

      const checkboxes = debugElement.queryAll(By.directive(MatCheckbox));
      expect(checkboxes.length).toBe(2);
      expect(checkboxes[0].nativeElement.textContent.trim()).toBe('New Option 1');
      expect(checkboxes[1].nativeElement.textContent.trim()).toBe('New Option 2');
    });
  });

  describe('Value Management', () => {
    beforeEach(() => {
      fixture.componentRef.setInput('label', 'Value Management Test');
      fixture.componentRef.setInput('options', defaultOptions);
      fixture.detectChanges();
    });

    it('should handle initial value setting', () => {
      component.value.set(['option1', 'option3']);
      fixture.detectChanges();

      expect(component.isChecked('option1')).toBe(true);
      expect(component.isChecked('option2')).toBe(false);
      expect(component.isChecked('option3')).toBe(true);
    });

    it('should prevent duplicate values', () => {
      // Try to add the same value multiple times
      component.onCheckboxChange('option1', true);
      component.onCheckboxChange('option1', true);
      fixture.detectChanges();

      expect(component.value()).toEqual(['option1']);
    });

    it('should handle removing non-existent values gracefully', () => {
      component.value.set(['option1', 'option2']);
      
      // Try to remove a value that doesn't exist
      component.onCheckboxChange('option3', false);
      fixture.detectChanges();

      expect(component.value()).toEqual(['option1', 'option2']);
    });

    it('should clear all values correctly', () => {
      component.value.set(['option1', 'option2', 'option3']);
      fixture.detectChanges();

      // Uncheck all
      component.onCheckboxChange('option1', false);
      component.onCheckboxChange('option2', false);
      component.onCheckboxChange('option3', false);
      fixture.detectChanges();

      expect(component.value()).toEqual([]);
    });
  });

  describe('Option Labels and Values', () => {
    beforeEach(() => {
      const complexOptions: TestOption[] = [
        { value: 'complex_value_1', label: 'Complex Label 1 with Special Characters !@#$%' },
        { value: 'value-with-dashes', label: 'Label with Dashes' },
        { value: 'value_with_underscores', label: 'Label with Underscores' }
      ];

      fixture.componentRef.setInput('label', 'Complex Options Test');
      fixture.componentRef.setInput('options', complexOptions);
      fixture.detectChanges();
    });

    it('should handle complex option values and labels', () => {
      const checkboxes = debugElement.queryAll(By.directive(MatCheckbox));
      
      expect(checkboxes[0].nativeElement.textContent.trim()).toBe('Complex Label 1 with Special Characters !@#$%');
      expect(checkboxes[1].nativeElement.textContent.trim()).toBe('Label with Dashes');
      expect(checkboxes[2].nativeElement.textContent.trim()).toBe('Label with Underscores');

      // Test value selection
      component.onCheckboxChange('complex_value_1', true);
      component.onCheckboxChange('value-with-dashes', true);
      fixture.detectChanges();

      expect(component.value()).toEqual(['complex_value_1', 'value-with-dashes']);
    });
  });
});