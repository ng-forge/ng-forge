import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideAnimations } from '@angular/platform-browser/animations';
import { MatInputFieldComponent } from './mat-input.component';
import { DebugElement } from '@angular/core';
import { By } from '@angular/platform-browser';
import { MatFormField } from '@angular/material/form-field';
import { MatInput } from '@angular/material/input';

describe('MatInputFieldComponent Integration Tests', () => {
  let component: MatInputFieldComponent;
  let fixture: ComponentFixture<MatInputFieldComponent>;
  let debugElement: DebugElement;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MatInputFieldComponent],
      providers: [provideAnimations()],
    }).compileComponents();

    fixture = TestBed.createComponent(MatInputFieldComponent);
    component = fixture.componentInstance;
    debugElement = fixture.debugElement;
  });

  describe('Happy Flow - All Inputs Set', () => {
    beforeEach(() => {
      fixture.componentRef.setInput('label', 'Email Address');
      fixture.componentRef.setInput('placeholder', 'Enter your email');
      fixture.componentRef.setInput('type', 'email');
      fixture.componentRef.setInput('autocomplete', 'email');
      fixture.componentRef.setInput('hint', 'We will never share your email');
      fixture.componentRef.setInput('tabIndex', 1);
      fixture.componentRef.setInput('className', 'custom-input');
      fixture.componentRef.setInput('appearance', 'outline');
      fixture.detectChanges();
    });

    it('should render with all properties correctly set', () => {
      const formField = debugElement.query(By.directive(MatFormField));
      const input = debugElement.query(By.directive(MatInput));
      const hintElement = debugElement.query(By.css('mat-hint'));

      expect(component.label()).toBe('Email Address');
      expect(component.placeholder()).toBe('Enter your email');
      expect(component.type()).toBe('email');
      expect(component.autocomplete()).toBe('email');
      expect(component.hint()).toBe('We will never share your email');
      expect(component.tabIndex()).toBe(1);
      expect(component.className()).toBe('custom-input');
      expect(component.appearance()).toBe('outline');

      expect(formField.nativeElement.getAttribute('ng-reflect-appearance')).toBe('outline');
      expect(formField.nativeElement.className).toContain('custom-input');
      expect(input.nativeElement.getAttribute('type')).toBe('email');
      expect(input.nativeElement.getAttribute('placeholder')).toBe('Enter your email');
      expect(input.nativeElement.getAttribute('autocomplete')).toBe('email');
      expect(input.nativeElement.getAttribute('tabindex')).toBe('1');
      expect(hintElement.nativeElement.textContent.trim()).toBe('We will never share your email');
    });

    it('should handle input value changes correctly', () => {
      const input = debugElement.query(By.directive(MatInput));

      expect(component.value()).toBe('');

      component.value.set('test@example.com');
      fixture.detectChanges();

      expect(component.value()).toBe('test@example.com');
      expect(input.nativeElement.getAttribute('ng-reflect-ng-model')).toBe('test@example.com');
    });

    it('should handle touched state correctly', () => {
      const input = debugElement.query(By.directive(MatInput));

      expect(component.touched()).toBe(false);

      input.triggerEventHandler('blur', {});
      fixture.detectChanges();

      expect(component.touched()).toBe(true);
    });

    it('should display label correctly', () => {
      const labelElement = debugElement.query(By.css('mat-label'));
      expect(labelElement.nativeElement.textContent.trim()).toBe('Email Address');
    });
  });

  describe('Minimal Configuration', () => {
    beforeEach(() => {
      fixture.componentRef.setInput('label', 'Simple Input');
      fixture.detectChanges();
    });

    it('should render with default values when only required props are set', () => {
      const formField = debugElement.query(By.directive(MatFormField));
      const input = debugElement.query(By.directive(MatInput));

      expect(component.label()).toBe('Simple Input');
      expect(component.placeholder()).toBe('');
      expect(component.type()).toBe('text');
      expect(component.autocomplete()).toBeUndefined();
      expect(component.hint()).toBe('');
      expect(component.tabIndex()).toBeUndefined();
      expect(component.className()).toBe('');
      expect(component.appearance()).toBe('fill');

      expect(formField.nativeElement.getAttribute('ng-reflect-appearance')).toBe('fill');
      expect(input.nativeElement.getAttribute('type')).toBe('text');
      expect(input.nativeElement.getAttribute('placeholder')).toBe('');
      expect(input.nativeElement.getAttribute('autocomplete')).toBeNull();
      expect(input.nativeElement.getAttribute('tabindex')).toBeNull();
    });

    it('should not display hint when not provided', () => {
      const hintElement = debugElement.query(By.css('mat-hint'));
      expect(hintElement).toBeNull();
    });
  });

  describe('Disabled State', () => {
    beforeEach(() => {
      fixture.componentRef.setInput('label', 'Disabled Input');
      component.disabled.set(true);
      fixture.detectChanges();
    });

    it('should render as disabled', () => {
      const input = debugElement.query(By.directive(MatInput));

      expect(component.disabled()).toBe(true);
      expect(input.nativeElement.disabled).toBe(true);
    });

    it('should not be interactive when disabled', () => {
      const input = debugElement.query(By.directive(MatInput));

      expect(input.nativeElement.disabled).toBe(true);

      // Try to set a value on disabled input
      component.value.set('test value');
      fixture.detectChanges();

      expect(component.value()).toBe('test value');
      expect(input.nativeElement.disabled).toBe(true);
    });
  });

  describe('Input Types', () => {
    it('should handle text input type', () => {
      fixture.componentRef.setInput('label', 'Text Input');
      fixture.componentRef.setInput('type', 'text');
      fixture.detectChanges();

      const input = debugElement.query(By.directive(MatInput));
      expect(input.nativeElement.getAttribute('type')).toBe('text');
    });

    it('should handle email input type', () => {
      fixture.componentRef.setInput('label', 'Email Input');
      fixture.componentRef.setInput('type', 'email');
      fixture.detectChanges();

      const input = debugElement.query(By.directive(MatInput));
      expect(input.nativeElement.getAttribute('type')).toBe('email');
    });

    it('should handle password input type', () => {
      fixture.componentRef.setInput('label', 'Password Input');
      fixture.componentRef.setInput('type', 'password');
      fixture.detectChanges();

      const input = debugElement.query(By.directive(MatInput));
      expect(input.nativeElement.getAttribute('type')).toBe('password');
    });

    it('should handle number input type', () => {
      fixture.componentRef.setInput('label', 'Number Input');
      fixture.componentRef.setInput('type', 'number');
      fixture.detectChanges();

      const input = debugElement.query(By.directive(MatInput));
      expect(input.nativeElement.getAttribute('type')).toBe('number');
    });

    it('should handle tel input type', () => {
      fixture.componentRef.setInput('label', 'Phone Input');
      fixture.componentRef.setInput('type', 'tel');
      fixture.detectChanges();

      const input = debugElement.query(By.directive(MatInput));
      expect(input.nativeElement.getAttribute('type')).toBe('tel');
    });

    it('should handle url input type', () => {
      fixture.componentRef.setInput('label', 'URL Input');
      fixture.componentRef.setInput('type', 'url');
      fixture.detectChanges();

      const input = debugElement.query(By.directive(MatInput));
      expect(input.nativeElement.getAttribute('type')).toBe('url');
    });
  });

  describe('Error Handling and Validation', () => {
    beforeEach(() => {
      fixture.componentRef.setInput('label', 'Validated Input');
      fixture.detectChanges();
    });

    it('should not display errors when valid', () => {
      component.invalid.set(false);
      component.touched.set(true);
      component.errors.set([]);
      fixture.detectChanges();

      const errorElements = debugElement.queryAll(By.css('mat-error'));
      expect(errorElements.length).toBe(0);
    });

    it('should not display errors when invalid but not touched', () => {
      component.invalid.set(true);
      component.touched.set(false);
      component.errors.set([{ message: 'This field is required' }]);
      fixture.detectChanges();

      const errorElements = debugElement.queryAll(By.css('mat-error'));
      expect(errorElements.length).toBe(0);
    });

    it('should display errors when invalid and touched', () => {
      component.invalid.set(true);
      component.touched.set(true);
      component.errors.set([{ message: 'This field is required' }]);
      fixture.detectChanges();

      const errorElements = debugElement.queryAll(By.css('mat-error'));
      expect(errorElements.length).toBe(1);
      expect(errorElements[0].nativeElement.textContent.trim()).toBe('This field is required');
    });

    it('should display multiple errors when invalid and touched', () => {
      component.invalid.set(true);
      component.touched.set(true);
      component.errors.set([{ message: 'This field is required' }, { message: 'Must be a valid email address' }]);
      fixture.detectChanges();

      const errorElements = debugElement.queryAll(By.css('mat-error span'));
      expect(errorElements.length).toBe(2);
      expect(errorElements[0].nativeElement.textContent.trim()).toBe('This field is required');
      expect(errorElements[1].nativeElement.textContent.trim()).toBe('Must be a valid email address');
    });

    it('should handle error state changes dynamically', () => {
      // Start valid
      component.invalid.set(false);
      component.touched.set(true);
      component.errors.set([]);
      fixture.detectChanges();

      let errorElements = debugElement.queryAll(By.css('mat-error'));
      expect(errorElements.length).toBe(0);

      // Become invalid
      component.invalid.set(true);
      component.errors.set([{ message: 'Validation failed' }]);
      fixture.detectChanges();

      errorElements = debugElement.queryAll(By.css('mat-error'));
      expect(errorElements.length).toBe(1);
      expect(errorElements[0].nativeElement.textContent.trim()).toBe('Validation failed');

      // Become valid again
      component.invalid.set(false);
      component.errors.set([]);
      fixture.detectChanges();

      errorElements = debugElement.queryAll(By.css('mat-error'));
      expect(errorElements.length).toBe(0);
    });
  });

  describe('Appearance Variations', () => {
    it('should handle fill appearance', () => {
      fixture.componentRef.setInput('label', 'Fill Input');
      fixture.componentRef.setInput('appearance', 'fill');
      fixture.detectChanges();

      const formField = debugElement.query(By.directive(MatFormField));
      expect(formField.nativeElement.getAttribute('ng-reflect-appearance')).toBe('fill');
    });

    it('should handle outline appearance', () => {
      fixture.componentRef.setInput('label', 'Outline Input');
      fixture.componentRef.setInput('appearance', 'outline');
      fixture.detectChanges();

      const formField = debugElement.query(By.directive(MatFormField));
      expect(formField.nativeElement.getAttribute('ng-reflect-appearance')).toBe('outline');
    });
  });

  describe('Autocomplete Variations', () => {
    it('should handle email autocomplete', () => {
      fixture.componentRef.setInput('label', 'Email');
      fixture.componentRef.setInput('autocomplete', 'email');
      fixture.detectChanges();

      const input = debugElement.query(By.directive(MatInput));
      expect(input.nativeElement.getAttribute('autocomplete')).toBe('email');
    });

    it('should handle name autocomplete', () => {
      fixture.componentRef.setInput('label', 'Name');
      fixture.componentRef.setInput('autocomplete', 'name');
      fixture.detectChanges();

      const input = debugElement.query(By.directive(MatInput));
      expect(input.nativeElement.getAttribute('autocomplete')).toBe('name');
    });

    it('should handle off autocomplete', () => {
      fixture.componentRef.setInput('label', 'No Autocomplete');
      fixture.componentRef.setInput('autocomplete', 'off');
      fixture.detectChanges();

      const input = debugElement.query(By.directive(MatInput));
      expect(input.nativeElement.getAttribute('autocomplete')).toBe('off');
    });
  });

  describe('Accessibility', () => {
    beforeEach(() => {
      fixture.componentRef.setInput('label', 'Accessible Input');
      fixture.componentRef.setInput('tabIndex', 2);
      fixture.detectChanges();
    });

    it('should support custom tabIndex', () => {
      const input = debugElement.query(By.directive(MatInput));
      expect(component.tabIndex()).toBe(2);
      expect(input.nativeElement.getAttribute('tabindex')).toBe('2');
    });

    it('should have proper label association', () => {
      const labelElement = debugElement.query(By.css('mat-label'));
      expect(labelElement.nativeElement.textContent.trim()).toBe('Accessible Input');
    });
  });

  describe('Dynamic State Changes', () => {
    beforeEach(() => {
      fixture.componentRef.setInput('label', 'Dynamic Input');
      fixture.detectChanges();
    });

    it('should handle multiple state changes in sequence', () => {
      // Set a value
      component.value.set('initial value');
      fixture.detectChanges();
      expect(component.value()).toBe('initial value');

      // Touch it
      component.touched.set(true);
      fixture.detectChanges();
      expect(component.touched()).toBe(true);

      // Make it invalid
      component.invalid.set(true);
      component.errors.set([{ message: 'Input error occurred' }]);
      fixture.detectChanges();

      const errorElements = debugElement.queryAll(By.css('mat-error'));
      expect(errorElements.length).toBe(1);

      // Disable it
      component.disabled.set(true);
      fixture.detectChanges();

      const input = debugElement.query(By.directive(MatInput));
      expect(input.nativeElement.disabled).toBe(true);

      // Change the value
      component.value.set('updated value');
      fixture.detectChanges();
      expect(component.value()).toBe('updated value');

      // Enable it again
      component.disabled.set(false);
      fixture.detectChanges();
      expect(input.nativeElement.disabled).toBe(false);

      // Make it valid again
      component.invalid.set(false);
      component.errors.set([]);
      fixture.detectChanges();

      const errorElementsAfter = debugElement.queryAll(By.css('mat-error'));
      expect(errorElementsAfter.length).toBe(0);
    });

    it('should handle input type changes', () => {
      const input = debugElement.query(By.directive(MatInput));

      // Start with text
      expect(component.type()).toBe('text');
      expect(input.nativeElement.getAttribute('type')).toBe('text');

      // Change to email
      fixture.componentRef.setInput('type', 'email');
      fixture.detectChanges();
      expect(component.type()).toBe('email');
      expect(input.nativeElement.getAttribute('type')).toBe('email');

      // Change to password
      fixture.componentRef.setInput('type', 'password');
      fixture.detectChanges();
      expect(component.type()).toBe('password');
      expect(input.nativeElement.getAttribute('type')).toBe('password');
    });

    it('should handle placeholder changes', () => {
      const input = debugElement.query(By.directive(MatInput));

      // Start with empty placeholder
      expect(component.placeholder()).toBe('');
      expect(input.nativeElement.getAttribute('placeholder')).toBe('');

      // Change placeholder
      fixture.componentRef.setInput('placeholder', 'Enter text here');
      fixture.detectChanges();
      expect(component.placeholder()).toBe('Enter text here');
      expect(input.nativeElement.getAttribute('placeholder')).toBe('Enter text here');
    });
  });

  describe('Value Handling', () => {
    beforeEach(() => {
      fixture.componentRef.setInput('label', 'Value Test');
      fixture.detectChanges();
    });

    it('should handle empty string values', () => {
      component.value.set('');
      fixture.detectChanges();
      expect(component.value()).toBe('');
    });

    it('should handle string values', () => {
      component.value.set('test string');
      fixture.detectChanges();
      expect(component.value()).toBe('test string');
    });

    it('should handle special characters', () => {
      const specialValue = 'Hello @#$%^&*()_+ World!';
      component.value.set(specialValue);
      fixture.detectChanges();
      expect(component.value()).toBe(specialValue);
    });

    it('should handle unicode characters', () => {
      const unicodeValue = '🚀 Hello 世界 🌍';
      component.value.set(unicodeValue);
      fixture.detectChanges();
      expect(component.value()).toBe(unicodeValue);
    });
  });
});
