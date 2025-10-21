import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideAnimations } from '@angular/platform-browser/animations';
import { MatCheckboxFieldComponent } from './mat-checkbox.component';
import { DebugElement } from '@angular/core';
import { By } from '@angular/platform-browser';
import { MatCheckbox } from '@angular/material/checkbox';

describe('MatCheckboxFieldComponent Integration Tests', () => {
  let component: MatCheckboxFieldComponent;
  let fixture: ComponentFixture<MatCheckboxFieldComponent>;
  let debugElement: DebugElement;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MatCheckboxFieldComponent],
      providers: [provideAnimations()],
    }).compileComponents();

    fixture = TestBed.createComponent(MatCheckboxFieldComponent);
    component = fixture.componentInstance;
    debugElement = fixture.debugElement;
  });

  describe('Happy Flow - All Inputs Set', () => {
    beforeEach(() => {
      fixture.componentRef.setInput('label', 'Accept Terms');
      fixture.componentRef.setInput('labelPosition', 'before');
      fixture.componentRef.setInput('indeterminate', false);
      fixture.componentRef.setInput('color', 'accent');
      fixture.componentRef.setInput('hint', 'Please read and accept our terms');
      fixture.componentRef.setInput('className', 'custom-checkbox');
      fixture.componentRef.setInput('disableRipple', true);
      fixture.componentRef.setInput('tabIndex', 1);
      fixture.componentRef.setInput('required', true);
      fixture.detectChanges();
    });

    it('should render with all properties correctly set', () => {
      const matCheckbox = debugElement.query(By.directive(MatCheckbox));
      const containerDiv = debugElement.query(By.css('div'));
      const hintElement = debugElement.query(By.css('.mat-hint'));

      expect(component.label()).toBe('Accept Terms');
      expect(component.labelPosition()).toBe('before');
      expect(component.indeterminate()).toBe(false);
      expect(component.color()).toBe('accent');
      expect(component.hint()).toBe('Please read and accept our terms');
      expect(component.className()).toBe('custom-checkbox');
      expect(component.disableRipple()).toBe(true);
      expect(component.tabIndex()).toBe(1);
      expect(component.required()).toBe(true);

      expect(matCheckbox.nativeElement.getAttribute('ng-reflect-label-position')).toBe('before');
      expect(matCheckbox.nativeElement.getAttribute('ng-reflect-color')).toBe('accent');
      expect(containerDiv.nativeElement.className).toBe('custom-checkbox');
      expect(hintElement.nativeElement.textContent.trim()).toBe('Please read and accept our terms');
    });

    it('should handle checkbox state changes correctly', () => {
      const matCheckbox = debugElement.query(By.directive(MatCheckbox));

      expect(component.checked()).toBe(false);

      // Simulate checking the checkbox
      component.checked.set(true);
      fixture.detectChanges();

      expect(component.checked()).toBe(true);
      expect(matCheckbox.nativeElement.getAttribute('ng-reflect-ng-model')).toBe('true');
    });

    it('should handle touched state correctly', () => {
      const matCheckbox = debugElement.query(By.directive(MatCheckbox));

      expect(component.touched()).toBe(false);

      // Trigger blur event
      matCheckbox.triggerEventHandler('blur', {});
      fixture.detectChanges();

      expect(component.touched()).toBe(true);
    });

    it('should display label text correctly', () => {
      const matCheckbox = debugElement.query(By.directive(MatCheckbox));

      expect(matCheckbox.nativeElement.textContent.trim()).toBe('Accept Terms');
    });
  });

  describe('Minimal Configuration', () => {
    beforeEach(() => {
      fixture.componentRef.setInput('label', 'Simple Checkbox');
      fixture.detectChanges();
    });

    it('should render with default values when only required props are set', () => {
      const matCheckbox = debugElement.query(By.directive(MatCheckbox));
      const containerDiv = debugElement.query(By.css('div'));

      expect(component.label()).toBe('Simple Checkbox');
      expect(component.labelPosition()).toBe('after');
      expect(component.indeterminate()).toBe(false);
      expect(component.color()).toBe('primary');
      expect(component.hint()).toBe('');
      expect(component.className()).toBe('');
      expect(component.disableRipple()).toBe(false);
      expect(component.tabIndex()).toBeUndefined();
      expect(component.required()).toBe(false);

      expect(matCheckbox.nativeElement.getAttribute('ng-reflect-label-position')).toBe('after');
      expect(matCheckbox.nativeElement.getAttribute('ng-reflect-color')).toBe('primary');
      expect(containerDiv.nativeElement.className).toBe('');
    });

    it('should not display hint when not provided', () => {
      const hintElement = debugElement.query(By.css('.mat-hint'));
      expect(hintElement).toBeNull();
    });
  });

  describe('Disabled State', () => {
    beforeEach(() => {
      fixture.componentRef.setInput('label', 'Disabled Checkbox');
      component.disabled.set(true);
      fixture.detectChanges();
    });

    it('should render as disabled', () => {
      const matCheckbox = debugElement.query(By.directive(MatCheckbox));

      expect(component.disabled()).toBe(true);
      expect(matCheckbox.nativeElement.getAttribute('ng-reflect-disabled')).toBe('true');
    });

    it('should not be interactive when disabled', () => {
      const matCheckbox = debugElement.query(By.directive(MatCheckbox));

      // Try to check the disabled checkbox
      component.checked.set(true);
      fixture.detectChanges();

      expect(component.checked()).toBe(true);
      // The model value changes but the checkbox should appear disabled
      expect(matCheckbox.nativeElement.getAttribute('ng-reflect-disabled')).toBe('true');
    });
  });

  describe('Indeterminate State', () => {
    beforeEach(() => {
      fixture.componentRef.setInput('label', 'Indeterminate Checkbox');
      fixture.componentRef.setInput('indeterminate', true);
      fixture.detectChanges();
    });

    it('should render in indeterminate state', () => {
      const matCheckbox = debugElement.query(By.directive(MatCheckbox));

      expect(component.indeterminate()).toBe(true);
      expect(matCheckbox.nativeElement.getAttribute('ng-reflect-indeterminate')).toBe('true');
    });
  });

  describe('Error Handling and Validation', () => {
    beforeEach(() => {
      fixture.componentRef.setInput('label', 'Validated Checkbox');
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
      component.errors.set([{ message: 'This field is required' }, { message: 'Additional validation error' }]);
      fixture.detectChanges();

      const errorElements = debugElement.queryAll(By.css('.mat-error'));
      expect(errorElements.length).toBe(2);
      expect(errorElements[0].nativeElement.textContent.trim()).toBe('This field is required');
      expect(errorElements[1].nativeElement.textContent.trim()).toBe('Additional validation error');
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
    it('should handle primary color', () => {
      fixture.componentRef.setInput('label', 'Primary Checkbox');
      fixture.componentRef.setInput('color', 'primary');
      fixture.detectChanges();

      const matCheckbox = debugElement.query(By.directive(MatCheckbox));
      expect(matCheckbox.nativeElement.getAttribute('ng-reflect-color')).toBe('primary');
    });

    it('should handle accent color', () => {
      fixture.componentRef.setInput('label', 'Accent Checkbox');
      fixture.componentRef.setInput('color', 'accent');
      fixture.detectChanges();

      const matCheckbox = debugElement.query(By.directive(MatCheckbox));
      expect(matCheckbox.nativeElement.getAttribute('ng-reflect-color')).toBe('accent');
    });

    it('should handle warn color', () => {
      fixture.componentRef.setInput('label', 'Warn Checkbox');
      fixture.componentRef.setInput('color', 'warn');
      fixture.detectChanges();

      const matCheckbox = debugElement.query(By.directive(MatCheckbox));
      expect(matCheckbox.nativeElement.getAttribute('ng-reflect-color')).toBe('warn');
    });
  });

  describe('Label Position Variations', () => {
    it('should handle label position after', () => {
      fixture.componentRef.setInput('label', 'Label After');
      fixture.componentRef.setInput('labelPosition', 'after');
      fixture.detectChanges();

      const matCheckbox = debugElement.query(By.directive(MatCheckbox));
      expect(matCheckbox.nativeElement.getAttribute('ng-reflect-label-position')).toBe('after');
    });

    it('should handle label position before', () => {
      fixture.componentRef.setInput('label', 'Label Before');
      fixture.componentRef.setInput('labelPosition', 'before');
      fixture.detectChanges();

      const matCheckbox = debugElement.query(By.directive(MatCheckbox));
      expect(matCheckbox.nativeElement.getAttribute('ng-reflect-label-position')).toBe('before');
    });
  });

  describe('Accessibility', () => {
    beforeEach(() => {
      fixture.componentRef.setInput('label', 'Accessible Checkbox');
      fixture.componentRef.setInput('tabIndex', 5);
      fixture.detectChanges();
    });

    it('should support custom tabIndex', () => {
      expect(component.tabIndex()).toBe(5);
    });

    it('should handle required state for accessibility', () => {
      fixture.componentRef.setInput('required', true);
      fixture.detectChanges();

      expect(component.required()).toBe(true);
    });
  });

  describe('Dynamic State Changes', () => {
    beforeEach(() => {
      fixture.componentRef.setInput('label', 'Dynamic Checkbox');
      fixture.detectChanges();
    });

    it('should handle multiple state changes in sequence', () => {
      // Check the checkbox
      component.checked.set(true);
      fixture.detectChanges();
      expect(component.checked()).toBe(true);

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

      const matCheckbox = debugElement.query(By.directive(MatCheckbox));
      expect(matCheckbox.nativeElement.getAttribute('ng-reflect-disabled')).toBe('true');

      // Uncheck it
      component.checked.set(false);
      fixture.detectChanges();
      expect(component.checked()).toBe(false);
    });
  });
});
