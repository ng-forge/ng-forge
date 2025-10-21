import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideAnimations } from '@angular/platform-browser/animations';
import { MatTextareaFieldComponent } from './mat-textarea.component';
import { DebugElement } from '@angular/core';
import { By } from '@angular/platform-browser';
import { MatFormField } from '@angular/material/form-field';

describe('MatTextareaFieldComponent Integration Tests', () => {
  let component: MatTextareaFieldComponent;
  let fixture: ComponentFixture<MatTextareaFieldComponent>;
  let debugElement: DebugElement;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MatTextareaFieldComponent],
      providers: [provideAnimations()],
    }).compileComponents();

    fixture = TestBed.createComponent(MatTextareaFieldComponent);
    component = fixture.componentInstance;
    debugElement = fixture.debugElement;
  });

  describe('Happy Flow - All Inputs Set', () => {
    beforeEach(() => {
      fixture.componentRef.setInput('label', 'Description');
      fixture.componentRef.setInput('placeholder', 'Enter your description here...');
      fixture.componentRef.setInput('rows', 6);
      fixture.componentRef.setInput('cols', 80);
      fixture.componentRef.setInput('maxlength', 500);
      fixture.componentRef.setInput('hint', 'Provide a detailed description');
      fixture.componentRef.setInput('tabIndex', 2);
      fixture.componentRef.setInput('className', 'custom-textarea');
      fixture.componentRef.setInput('resize', 'both');
      fixture.componentRef.setInput('appearance', 'outline');
      fixture.detectChanges();
    });

    it('should render with all properties correctly set', () => {
      const textarea = debugElement.query(By.css('textarea'));
      const matFormField = debugElement.query(By.directive(MatFormField));
      const labelElement = debugElement.query(By.css('mat-label'));
      const hintElement = debugElement.query(By.css('.mat-hint'));

      expect(component.label()).toBe('Description');
      expect(component.placeholder()).toBe('Enter your description here...');
      expect(component.rows()).toBe(6);
      expect(component.cols()).toBe(80);
      expect(component.maxlength()).toBe(500);
      expect(component.hint()).toBe('Provide a detailed description');
      expect(component.tabIndex()).toBe(2);
      expect(component.className()).toBe('custom-textarea');
      expect(component.resize()).toBe('both');
      expect(component.appearance()).toBe('outline');

      expect(matFormField.nativeElement.getAttribute('ng-reflect-appearance')).toBe('outline');
      expect(matFormField.nativeElement.className).toContain('custom-textarea');
      expect(labelElement.nativeElement.textContent.trim()).toBe('Description');
      expect(textarea.nativeElement.getAttribute('placeholder')).toBe('Enter your description here...');
      expect(textarea.nativeElement.getAttribute('rows')).toBe('6');
      expect(textarea.nativeElement.getAttribute('cols')).toBe('80');
      expect(textarea.nativeElement.getAttribute('maxlength')).toBe('500');
      expect(textarea.nativeElement.getAttribute('tabindex')).toBe('2');
      expect(textarea.nativeElement.style.resize).toBe('both');
      expect(hintElement.nativeElement.textContent.trim()).toBe('Provide a detailed description');
    });

    it('should handle value changes correctly', () => {
      const textarea = debugElement.query(By.css('textarea'));

      expect(component.value()).toBe('');

      // Simulate typing in textarea
      component.value.set('Sample description text');
      fixture.detectChanges();

      expect(component.value()).toBe('Sample description text');
      expect(textarea.nativeElement.getAttribute('ng-reflect-ng-model')).toBe('Sample description text');
    });

    it('should handle touched state correctly', () => {
      const textarea = debugElement.query(By.css('textarea'));

      expect(component.touched()).toBe(false);

      // Trigger blur event
      textarea.triggerEventHandler('blur', {});
      fixture.detectChanges();

      expect(component.touched()).toBe(true);
    });
  });

  describe('Minimal Configuration', () => {
    beforeEach(() => {
      fixture.componentRef.setInput('label', 'Simple Textarea');
      fixture.detectChanges();
    });

    it('should render with default values when only required props are set', () => {
      const textarea = debugElement.query(By.css('textarea'));
      const matFormField = debugElement.query(By.directive(MatFormField));
      const labelElement = debugElement.query(By.css('mat-label'));

      expect(component.label()).toBe('Simple Textarea');
      expect(component.placeholder()).toBe('');
      expect(component.rows()).toBe(4);
      expect(component.cols()).toBeUndefined();
      expect(component.maxlength()).toBeUndefined();
      expect(component.hint()).toBe('');
      expect(component.tabIndex()).toBeUndefined();
      expect(component.className()).toBe('');
      expect(component.resize()).toBe('vertical');
      expect(component.appearance()).toBe('fill');

      expect(matFormField.nativeElement.getAttribute('ng-reflect-appearance')).toBe('fill');
      expect(matFormField.nativeElement.className).toContain('mat-mdc-form-field');
      expect(labelElement.nativeElement.textContent.trim()).toBe('Simple Textarea');
      expect(textarea.nativeElement.getAttribute('placeholder')).toBe('');
      expect(textarea.nativeElement.getAttribute('rows')).toBe('4');
      expect(textarea.nativeElement.getAttribute('cols')).toBeNull();
      expect(textarea.nativeElement.getAttribute('maxlength')).toBeNull();
      expect(textarea.nativeElement.getAttribute('tabindex')).toBeNull();
      expect(textarea.nativeElement.style.resize).toBe('vertical');
    });

    it('should not display hint when not provided', () => {
      const hintElement = debugElement.query(By.css('.mat-hint'));
      expect(hintElement).toBeNull();
    });

    it('should have default empty value', () => {
      expect(component.value()).toBe('');
    });
  });

  describe('Disabled State', () => {
    beforeEach(() => {
      fixture.componentRef.setInput('label', 'Disabled Textarea');
      component.disabled.set(true);
      fixture.detectChanges();
    });

    it('should render as disabled', () => {
      const textarea = debugElement.query(By.css('textarea'));

      expect(component.disabled()).toBe(true);
      expect(textarea.nativeElement.disabled).toBe(true);
      expect(textarea.nativeElement.getAttribute('ng-reflect-disabled')).toBe('true');
    });

    it('should not be interactive when disabled', () => {
      const textarea = debugElement.query(By.css('textarea'));

      // Try to change value on disabled textarea
      component.value.set('Should not work when disabled');
      fixture.detectChanges();

      expect(component.value()).toBe('Should not work when disabled');
      // The model value changes but the textarea should appear disabled
      expect(textarea.nativeElement.disabled).toBe(true);
    });
  });

  describe('Error Handling and Validation', () => {
    beforeEach(() => {
      fixture.componentRef.setInput('label', 'Validated Textarea');
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
      component.errors.set([{ message: 'This field is required' }, { message: 'Text is too long' }]);
      fixture.detectChanges();

      const errorElements = debugElement.queryAll(By.css('.mat-error'));
      expect(errorElements.length).toBe(1);
      const errorSpans = errorElements[0].queryAll(By.css('span'));
      expect(errorSpans.length).toBe(2);
      expect(errorSpans[0].nativeElement.textContent.trim()).toBe('This field is required');
      expect(errorSpans[1].nativeElement.textContent.trim()).toBe('Text is too long');
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
      fixture.componentRef.setInput('label', 'Fill Textarea');
      fixture.componentRef.setInput('appearance', 'fill');
      fixture.detectChanges();

      const matFormField = debugElement.query(By.directive(MatFormField));
      expect(matFormField.nativeElement.getAttribute('ng-reflect-appearance')).toBe('fill');
    });

    it('should handle outline appearance', () => {
      fixture.componentRef.setInput('label', 'Outline Textarea');
      fixture.componentRef.setInput('appearance', 'outline');
      fixture.detectChanges();

      const matFormField = debugElement.query(By.directive(MatFormField));
      expect(matFormField.nativeElement.getAttribute('ng-reflect-appearance')).toBe('outline');
    });
  });

  describe('Resize Options', () => {
    it('should handle vertical resize', () => {
      fixture.componentRef.setInput('label', 'Vertical Resize');
      fixture.componentRef.setInput('resize', 'vertical');
      fixture.detectChanges();

      const textarea = debugElement.query(By.css('textarea'));
      expect(component.resize()).toBe('vertical');
      expect(textarea.nativeElement.style.resize).toBe('vertical');
    });

    it('should handle horizontal resize', () => {
      fixture.componentRef.setInput('label', 'Horizontal Resize');
      fixture.componentRef.setInput('resize', 'horizontal');
      fixture.detectChanges();

      const textarea = debugElement.query(By.css('textarea'));
      expect(component.resize()).toBe('horizontal');
      expect(textarea.nativeElement.style.resize).toBe('horizontal');
    });

    it('should handle both resize', () => {
      fixture.componentRef.setInput('label', 'Both Resize');
      fixture.componentRef.setInput('resize', 'both');
      fixture.detectChanges();

      const textarea = debugElement.query(By.css('textarea'));
      expect(component.resize()).toBe('both');
      expect(textarea.nativeElement.style.resize).toBe('both');
    });

    it('should handle no resize', () => {
      fixture.componentRef.setInput('label', 'No Resize');
      fixture.componentRef.setInput('resize', 'none');
      fixture.detectChanges();

      const textarea = debugElement.query(By.css('textarea'));
      expect(component.resize()).toBe('none');
      expect(textarea.nativeElement.style.resize).toBe('none');
    });
  });

  describe('Dimensions Configuration', () => {
    it('should handle custom rows', () => {
      fixture.componentRef.setInput('label', 'Custom Rows');
      fixture.componentRef.setInput('rows', 10);
      fixture.detectChanges();

      const textarea = debugElement.query(By.css('textarea'));
      expect(component.rows()).toBe(10);
      expect(textarea.nativeElement.getAttribute('rows')).toBe('10');
    });

    it('should handle custom cols', () => {
      fixture.componentRef.setInput('label', 'Custom Cols');
      fixture.componentRef.setInput('cols', 120);
      fixture.detectChanges();

      const textarea = debugElement.query(By.css('textarea'));
      expect(component.cols()).toBe(120);
      expect(textarea.nativeElement.getAttribute('cols')).toBe('120');
    });

    it('should handle maxlength', () => {
      fixture.componentRef.setInput('label', 'Max Length');
      fixture.componentRef.setInput('maxlength', 200);
      fixture.detectChanges();

      const textarea = debugElement.query(By.css('textarea'));
      expect(component.maxlength()).toBe(200);
      expect(textarea.nativeElement.getAttribute('maxlength')).toBe('200');
    });

    it('should handle no maxlength', () => {
      fixture.componentRef.setInput('label', 'No Max Length');
      fixture.componentRef.setInput('maxlength', undefined);
      fixture.detectChanges();

      const textarea = debugElement.query(By.css('textarea'));
      expect(component.maxlength()).toBeUndefined();
      expect(textarea.nativeElement.getAttribute('maxlength')).toBeNull();
    });
  });

  describe('Accessibility', () => {
    beforeEach(() => {
      fixture.componentRef.setInput('label', 'Accessible Textarea');
      fixture.componentRef.setInput('tabIndex', 3);
      fixture.detectChanges();
    });

    it('should support custom tabIndex', () => {
      const textarea = debugElement.query(By.css('textarea'));

      expect(component.tabIndex()).toBe(3);
      expect(textarea.nativeElement.getAttribute('tabindex')).toBe('3');
    });

    it('should have proper label association', () => {
      const labelElement = debugElement.query(By.css('mat-label'));
      const textarea = debugElement.query(By.css('textarea'));

      expect(labelElement.nativeElement.textContent.trim()).toBe('Accessible Textarea');
      expect(textarea.nativeElement).toBeTruthy();
    });

    it('should support placeholder for accessibility', () => {
      fixture.componentRef.setInput('placeholder', 'Enter text here');
      fixture.detectChanges();

      const textarea = debugElement.query(By.css('textarea'));
      expect(textarea.nativeElement.getAttribute('placeholder')).toBe('Enter text here');
    });
  });

  describe('Dynamic State Changes', () => {
    beforeEach(() => {
      fixture.componentRef.setInput('label', 'Dynamic Textarea');
      fixture.detectChanges();
    });

    it('should handle multiple state changes in sequence', () => {
      const textarea = debugElement.query(By.css('textarea'));

      // Set a value
      component.value.set('Initial text');
      fixture.detectChanges();
      expect(component.value()).toBe('Initial text');

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

      expect(textarea.nativeElement.disabled).toBe(true);

      // Change value
      component.value.set('Updated text');
      fixture.detectChanges();
      expect(component.value()).toBe('Updated text');
    });

    it('should handle rows and cols changes dynamically', () => {
      const textarea = debugElement.query(By.css('textarea'));

      // Initial dimensions
      expect(component.rows()).toBe(4);
      expect(textarea.nativeElement.getAttribute('rows')).toBe('4');

      // Change dimensions
      fixture.componentRef.setInput('rows', 8);
      fixture.componentRef.setInput('cols', 100);
      fixture.detectChanges();

      expect(component.rows()).toBe(8);
      expect(component.cols()).toBe(100);
      expect(textarea.nativeElement.getAttribute('rows')).toBe('8');
      expect(textarea.nativeElement.getAttribute('cols')).toBe('100');
    });
  });

  describe('Value Management', () => {
    beforeEach(() => {
      fixture.componentRef.setInput('label', 'Value Test Textarea');
      fixture.detectChanges();
    });

    it('should handle empty initial value', () => {
      expect(component.value()).toBe('');
    });

    it('should handle string values', () => {
      component.value.set('Test textarea content');
      fixture.detectChanges();

      expect(component.value()).toBe('Test textarea content');
    });

    it('should handle multiline text', () => {
      const multilineText = 'Line 1\nLine 2\nLine 3';
      component.value.set(multilineText);
      fixture.detectChanges();

      expect(component.value()).toBe(multilineText);
    });

    it('should handle value changes', () => {
      component.value.set('Initial value');
      fixture.detectChanges();
      expect(component.value()).toBe('Initial value');

      component.value.set('Updated value');
      fixture.detectChanges();
      expect(component.value()).toBe('Updated value');
    });

    it('should handle long text values', () => {
      const longText =
        'This is a very long text that exceeds normal textarea content length to test how the component handles large amounts of text input from users.'.repeat(
          5
        );
      component.value.set(longText);
      fixture.detectChanges();

      expect(component.value()).toBe(longText);
    });
  });

  describe('Placeholder Behavior', () => {
    it('should display placeholder when value is empty', () => {
      fixture.componentRef.setInput('label', 'Placeholder Test');
      fixture.componentRef.setInput('placeholder', 'Type something...');
      fixture.detectChanges();

      const textarea = debugElement.query(By.css('textarea'));
      expect(textarea.nativeElement.getAttribute('placeholder')).toBe('Type something...');
    });

    it('should handle empty placeholder', () => {
      fixture.componentRef.setInput('label', 'Empty Placeholder');
      fixture.componentRef.setInput('placeholder', '');
      fixture.detectChanges();

      const textarea = debugElement.query(By.css('textarea'));
      expect(textarea.nativeElement.getAttribute('placeholder')).toBe('');
    });
  });
});
