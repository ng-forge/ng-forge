import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideAnimations } from '@angular/platform-browser/animations';
import { MatRadioFieldComponent } from './mat-radio.component';
import { DebugElement } from '@angular/core';
import { By } from '@angular/platform-browser';
import { MatRadioButton, MatRadioGroup } from '@angular/material/radio';

interface TestOption {
  value: string;
  label: string;
  disabled?: boolean;
}

describe('MatRadioFieldComponent Integration Tests', () => {
  let component: MatRadioFieldComponent<string>;
  let fixture: ComponentFixture<MatRadioFieldComponent<string>>;
  let debugElement: DebugElement;

  const defaultOptions: TestOption[] = [
    { value: 'option1', label: 'Option 1' },
    { value: 'option2', label: 'Option 2' },
    { value: 'option3', label: 'Option 3' },
  ];

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MatRadioFieldComponent],
      providers: [provideAnimations()],
    }).compileComponents();

    fixture = TestBed.createComponent(MatRadioFieldComponent<string>);
    component = fixture.componentInstance;
    debugElement = fixture.debugElement;
  });

  describe('Happy Flow - All Inputs Set', () => {
    beforeEach(() => {
      const optionsWithDisabled: TestOption[] = [
        { value: 'small', label: 'Small Size' },
        { value: 'medium', label: 'Medium Size' },
        { value: 'large', label: 'Large Size', disabled: true },
        { value: 'xlarge', label: 'Extra Large Size' },
      ];

      fixture.componentRef.setInput('label', 'Product Size');
      fixture.componentRef.setInput('options', optionsWithDisabled);
      fixture.componentRef.setInput('required', true);
      fixture.componentRef.setInput('color', 'accent');
      fixture.componentRef.setInput('labelPosition', 'before');
      fixture.componentRef.setInput('hint', 'Choose one size option');
      fixture.componentRef.setInput('className', 'custom-radio-group');
      fixture.componentRef.setInput('appearance', 'outline');
      fixture.detectChanges();
    });

    it('should render with all properties correctly set', () => {
      const container = debugElement.query(By.css('div'));
      const labelElement = debugElement.query(By.css('.radio-label'));
      const radioGroup = debugElement.query(By.directive(MatRadioGroup));
      const radioButtons = debugElement.queryAll(By.directive(MatRadioButton));
      const hintElement = debugElement.query(By.css('.mat-hint'));

      expect(component.label()).toBe('Product Size');
      expect(component.options().length).toBe(4);
      expect(component.required()).toBe(true);
      expect(component.color()).toBe('accent');
      expect(component.labelPosition()).toBe('before');
      expect(component.hint()).toBe('Choose one size option');
      expect(component.className()).toBe('custom-radio-group');
      expect(component.appearance()).toBe('outline');

      expect(container.nativeElement.className).toBe('custom-radio-group');
      expect(labelElement.nativeElement.textContent.trim()).toBe('Product Size');
      expect(radioGroup.nativeElement.getAttribute('ng-reflect-required')).toBe('true');
      expect(radioButtons.length).toBe(4);
      expect(hintElement.nativeElement.textContent.trim()).toBe('Choose one size option');

      // Check individual radio button properties
      radioButtons.forEach((radioButton) => {
        expect(radioButton.nativeElement.getAttribute('ng-reflect-color')).toBe('accent');
        expect(radioButton.nativeElement.getAttribute('ng-reflect-label-position')).toBe('before');
      });
    });

    it('should handle radio selection correctly', () => {
      expect(component.value()).toBeUndefined();

      // Simulate selecting a radio button
      component.value.set('small');
      fixture.detectChanges();

      expect(component.value()).toBe('small');
    });

    it('should handle touched state correctly', () => {
      const radioGroup = debugElement.query(By.directive(MatRadioGroup));

      expect(component.touched()).toBe(false);

      radioGroup.triggerEventHandler('blur', {});
      fixture.detectChanges();

      expect(component.touched()).toBe(true);
    });

    it('should display disabled radio buttons correctly', () => {
      const radioButtons = debugElement.queryAll(By.directive(MatRadioButton));
      const largeRadioButton = radioButtons[2]; // large option is disabled

      expect(largeRadioButton.nativeElement.getAttribute('ng-reflect-disabled')).toBe('true');
    });

    it('should allow only one selection at a time', () => {
      // Select first option
      component.value.set('small');
      fixture.detectChanges();
      expect(component.value()).toBe('small');

      // Select different option - should replace the previous selection
      component.value.set('medium');
      fixture.detectChanges();
      expect(component.value()).toBe('medium');
    });
  });

  describe('Minimal Configuration', () => {
    beforeEach(() => {
      fixture.componentRef.setInput('label', 'Simple Radio');
      fixture.componentRef.setInput('options', defaultOptions);
      fixture.detectChanges();
    });

    it('should render with default values when only required props are set', () => {
      const container = debugElement.query(By.css('div'));
      const radioGroup = debugElement.query(By.directive(MatRadioGroup));
      const radioButtons = debugElement.queryAll(By.directive(MatRadioButton));

      expect(component.label()).toBe('Simple Radio');
      expect(component.options()).toEqual(defaultOptions);
      expect(component.required()).toBe(false);
      expect(component.color()).toBe('primary');
      expect(component.labelPosition()).toBe('after');
      expect(component.hint()).toBe('');
      expect(component.className()).toBe('');
      expect(component.appearance()).toBe('fill');

      expect(container.nativeElement.className).toBe('');
      expect(radioGroup.nativeElement.getAttribute('ng-reflect-required')).toBe('false');
      expect(radioButtons.length).toBe(3);

      radioButtons.forEach((radioButton) => {
        expect(radioButton.nativeElement.getAttribute('ng-reflect-color')).toBe('primary');
        expect(radioButton.nativeElement.getAttribute('ng-reflect-label-position')).toBe('after');
      });
    });

    it('should not display hint when not provided', () => {
      const hintElement = debugElement.query(By.css('.mat-hint'));
      expect(hintElement).toBeNull();
    });
  });

  describe('Disabled State', () => {
    beforeEach(() => {
      fixture.componentRef.setInput('label', 'Disabled Radio');
      fixture.componentRef.setInput('options', defaultOptions);
      component.disabled.set(true);
      fixture.detectChanges();
    });

    it('should render radio group as disabled', () => {
      const radioGroup = debugElement.query(By.directive(MatRadioGroup));

      expect(component.disabled()).toBe(true);
      expect(radioGroup.nativeElement.getAttribute('ng-reflect-disabled')).toBe('true');
    });

    it('should still allow programmatic value changes when disabled', () => {
      component.value.set('option1');
      fixture.detectChanges();

      expect(component.value()).toBe('option1');
    });
  });

  describe('Individual Option Disabled State', () => {
    beforeEach(() => {
      const optionsWithSomeDisabled: TestOption[] = [
        { value: 'option1', label: 'Option 1' },
        { value: 'option2', label: 'Option 2', disabled: true },
        { value: 'option3', label: 'Option 3' },
      ];

      fixture.componentRef.setInput('label', 'Mixed Disabled State');
      fixture.componentRef.setInput('options', optionsWithSomeDisabled);
      fixture.detectChanges();
    });

    it('should render only specific radio buttons as disabled', () => {
      const radioButtons = debugElement.queryAll(By.directive(MatRadioButton));

      expect(radioButtons[0].nativeElement.getAttribute('ng-reflect-disabled')).toBe('false');
      expect(radioButtons[1].nativeElement.getAttribute('ng-reflect-disabled')).toBe('true');
      expect(radioButtons[2].nativeElement.getAttribute('ng-reflect-disabled')).toBe('false');
    });
  });

  describe('Error Handling and Validation', () => {
    beforeEach(() => {
      fixture.componentRef.setInput('label', 'Validated Radio');
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
      component.errors.set([{ message: 'Please select an option' }]);
      fixture.detectChanges();

      const errorElements = debugElement.queryAll(By.css('.mat-error'));
      expect(errorElements.length).toBe(0);
    });

    it('should display errors when invalid and touched', () => {
      component.invalid.set(true);
      component.touched.set(true);
      component.errors.set([{ message: 'Please select an option' }]);
      fixture.detectChanges();

      const errorElements = debugElement.queryAll(By.css('.mat-error'));
      expect(errorElements.length).toBe(1);
      expect(errorElements[0].nativeElement.textContent.trim()).toBe('Please select an option');
    });

    it('should display multiple errors when invalid and touched', () => {
      component.invalid.set(true);
      component.touched.set(true);
      component.errors.set([{ message: 'Please select an option' }, { message: 'Selection is required for this field' }]);
      fixture.detectChanges();

      const errorElements = debugElement.queryAll(By.css('.mat-error'));
      expect(errorElements.length).toBe(2);
      expect(errorElements[0].nativeElement.textContent.trim()).toBe('Please select an option');
      expect(errorElements[1].nativeElement.textContent.trim()).toBe('Selection is required for this field');
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

      const radioButtons = debugElement.queryAll(By.directive(MatRadioButton));
      radioButtons.forEach((radioButton) => {
        expect(radioButton.nativeElement.getAttribute('ng-reflect-color')).toBe('primary');
      });
    });

    it('should handle accent color', () => {
      fixture.componentRef.setInput('color', 'accent');
      fixture.detectChanges();

      const radioButtons = debugElement.queryAll(By.directive(MatRadioButton));
      radioButtons.forEach((radioButton) => {
        expect(radioButton.nativeElement.getAttribute('ng-reflect-color')).toBe('accent');
      });
    });

    it('should handle warn color', () => {
      fixture.componentRef.setInput('color', 'warn');
      fixture.detectChanges();

      const radioButtons = debugElement.queryAll(By.directive(MatRadioButton));
      radioButtons.forEach((radioButton) => {
        expect(radioButton.nativeElement.getAttribute('ng-reflect-color')).toBe('warn');
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

      const radioButtons = debugElement.queryAll(By.directive(MatRadioButton));
      radioButtons.forEach((radioButton) => {
        expect(radioButton.nativeElement.getAttribute('ng-reflect-label-position')).toBe('after');
      });
    });

    it('should handle label position before', () => {
      fixture.componentRef.setInput('labelPosition', 'before');
      fixture.detectChanges();

      const radioButtons = debugElement.queryAll(By.directive(MatRadioButton));
      radioButtons.forEach((radioButton) => {
        expect(radioButton.nativeElement.getAttribute('ng-reflect-label-position')).toBe('before');
      });
    });
  });

  describe('Dynamic State Changes', () => {
    beforeEach(() => {
      fixture.componentRef.setInput('label', 'Dynamic Radio');
      fixture.componentRef.setInput('options', defaultOptions);
      fixture.detectChanges();
    });

    it('should handle multiple state changes in sequence', () => {
      // Select an option
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

      const errorElements = debugElement.queryAll(By.css('.mat-error'));
      expect(errorElements.length).toBe(1);

      // Disable it
      component.disabled.set(true);
      fixture.detectChanges();

      const radioGroup = debugElement.query(By.directive(MatRadioGroup));
      expect(radioGroup.nativeElement.getAttribute('ng-reflect-disabled')).toBe('true');

      // Change selection
      component.value.set('option3');
      fixture.detectChanges();
      expect(component.value()).toBe('option3');

      // Enable it again
      component.disabled.set(false);
      fixture.detectChanges();
      expect(radioGroup.nativeElement.getAttribute('ng-reflect-disabled')).toBe('false');
    });

    it('should handle options changes', () => {
      const newOptions: TestOption[] = [
        { value: 'newOption1', label: 'New Option 1' },
        { value: 'newOption2', label: 'New Option 2' },
      ];

      fixture.componentRef.setInput('options', newOptions);
      fixture.detectChanges();

      const radioButtons = debugElement.queryAll(By.directive(MatRadioButton));
      expect(radioButtons.length).toBe(2);
      expect(radioButtons[0].nativeElement.textContent.trim()).toBe('New Option 1');
      expect(radioButtons[1].nativeElement.textContent.trim()).toBe('New Option 2');
    });
  });

  describe('Value Management', () => {
    beforeEach(() => {
      fixture.componentRef.setInput('label', 'Value Management Test');
      fixture.componentRef.setInput('options', defaultOptions);
      fixture.detectChanges();
    });

    it('should handle initial value setting', () => {
      component.value.set('option2');
      fixture.detectChanges();

      expect(component.value()).toBe('option2');
    });

    it('should handle clearing selection', () => {
      component.value.set('option1');
      fixture.detectChanges();
      expect(component.value()).toBe('option1');

      component.value.set(undefined as any);
      fixture.detectChanges();
      expect(component.value()).toBeUndefined();
    });

    it('should handle invalid value gracefully', () => {
      component.value.set('nonexistent_option' as any);
      fixture.detectChanges();

      // Component should accept any value type T
      expect(component.value()).toBe('nonexistent_option');
    });
  });

  describe('Option Labels and Values', () => {
    beforeEach(() => {
      const complexOptions: TestOption[] = [
        { value: 'complex_value_1', label: 'Complex Label 1 with Special Characters !@#$%' },
        { value: 'value-with-dashes', label: 'Label with Dashes' },
        { value: 'value_with_underscores', label: 'Label with Underscores' },
      ];

      fixture.componentRef.setInput('label', 'Complex Options Test');
      fixture.componentRef.setInput('options', complexOptions);
      fixture.detectChanges();
    });

    it('should handle complex option values and labels', () => {
      const radioButtons = debugElement.queryAll(By.directive(MatRadioButton));

      expect(radioButtons[0].nativeElement.textContent.trim()).toBe('Complex Label 1 with Special Characters !@#$%');
      expect(radioButtons[1].nativeElement.textContent.trim()).toBe('Label with Dashes');
      expect(radioButtons[2].nativeElement.textContent.trim()).toBe('Label with Underscores');

      // Test value selection
      component.value.set('complex_value_1');
      fixture.detectChanges();
      expect(component.value()).toBe('complex_value_1');

      component.value.set('value-with-dashes');
      fixture.detectChanges();
      expect(component.value()).toBe('value-with-dashes');
    });
  });

  describe('Required Field Behavior', () => {
    beforeEach(() => {
      fixture.componentRef.setInput('label', 'Required Radio Test');
      fixture.componentRef.setInput('options', defaultOptions);
      fixture.componentRef.setInput('required', true);
      fixture.detectChanges();
    });

    it('should mark radio group as required', () => {
      const radioGroup = debugElement.query(By.directive(MatRadioGroup));
      expect(radioGroup.nativeElement.getAttribute('ng-reflect-required')).toBe('true');
    });

    it('should handle required validation state', () => {
      expect(component.required()).toBe(true);

      // Initially no selection - should be invalid if touched
      component.touched.set(true);
      component.invalid.set(true);
      component.errors.set([{ message: 'Selection is required' }]);
      fixture.detectChanges();

      const errorElements = debugElement.queryAll(By.css('.mat-error'));
      expect(errorElements.length).toBe(1);

      // Select an option - should become valid
      component.value.set('option1');
      component.invalid.set(false);
      component.errors.set([]);
      fixture.detectChanges();

      const errorElementsAfter = debugElement.queryAll(By.css('.mat-error'));
      expect(errorElementsAfter.length).toBe(0);
    });
  });
});
