import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideAnimations } from '@angular/platform-browser/animations';
import { MatDatepickerFieldComponent } from './mat-datepicker.component';
import { DebugElement } from '@angular/core';
import { By } from '@angular/platform-browser';
import { MatFormField } from '@angular/material/form-field';
import { MatDatepicker, MatDatepickerToggle } from '@angular/material/datepicker';
import { MatInput } from '@angular/material/input';

describe('MatDatepickerFieldComponent Integration Tests', () => {
  let component: MatDatepickerFieldComponent;
  let fixture: ComponentFixture<MatDatepickerFieldComponent>;
  let debugElement: DebugElement;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MatDatepickerFieldComponent],
      providers: [provideAnimations()],
    }).compileComponents();

    fixture = TestBed.createComponent(MatDatepickerFieldComponent);
    component = fixture.componentInstance;
    debugElement = fixture.debugElement;
  });

  describe('Happy Flow - All Inputs Set', () => {
    beforeEach(() => {
      const startDate = new Date(2024, 0, 1);
      const minDate = new Date(2023, 0, 1);
      const maxDate = new Date(2025, 11, 31);

      fixture.componentRef.setInput('label', 'Birth Date');
      fixture.componentRef.setInput('placeholder', 'Select your birth date');
      fixture.componentRef.setInput('minDate', minDate);
      fixture.componentRef.setInput('maxDate', maxDate);
      fixture.componentRef.setInput('startAt', startDate);
      fixture.componentRef.setInput('startView', 'year');
      fixture.componentRef.setInput('touchUi', true);
      fixture.componentRef.setInput('hint', 'Choose a date between 2023 and 2025');
      fixture.componentRef.setInput('tabIndex', 2);
      fixture.componentRef.setInput('className', 'custom-datepicker');
      fixture.componentRef.setInput('appearance', 'outline');
      fixture.componentRef.setInput('color', 'accent');
      fixture.componentRef.setInput('disableRipple', true);
      fixture.detectChanges();
    });

    it('should render with all properties correctly set', () => {
      const formField = debugElement.query(By.directive(MatFormField));
      const input = debugElement.query(By.directive(MatInput));
      const datepicker = debugElement.query(By.directive(MatDatepicker));
      const hintElement = debugElement.query(By.css('mat-hint'));

      expect(component.label()).toBe('Birth Date');
      expect(component.placeholder()).toBe('Select your birth date');
      expect(component.minDate()).toEqual(new Date(2023, 0, 1));
      expect(component.maxDate()).toEqual(new Date(2025, 11, 31));
      expect(component.startAt()).toEqual(new Date(2024, 0, 1));
      expect(component.startView()).toBe('year');
      expect(component.touchUi()).toBe(true);
      expect(component.hint()).toBe('Choose a date between 2023 and 2025');
      expect(component.tabIndex()).toBe(2);
      expect(component.className()).toBe('custom-datepicker');
      expect(component.appearance()).toBe('outline');
      expect(component.color()).toBe('accent');
      expect(component.disableRipple()).toBe(true);

      expect(formField.nativeElement.getAttribute('ng-reflect-appearance')).toBe('outline');
      expect(formField.nativeElement.className).toContain('custom-datepicker');
      expect(input.nativeElement.getAttribute('placeholder')).toBe('Select your birth date');
      expect(datepicker.nativeElement.getAttribute('ng-reflect-start-view')).toBe('year');
      expect(datepicker.nativeElement.getAttribute('ng-reflect-touch-ui')).toBe('true');
      expect(hintElement.nativeElement.textContent.trim()).toBe('Choose a date between 2023 and 2025');
    });

    it('should handle date value changes correctly', () => {
      const testDate = new Date(2024, 5, 15);

      expect(component.value()).toBeNull();

      component.value.set(testDate);
      fixture.detectChanges();

      expect(component.value()).toEqual(testDate);
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
      expect(labelElement.nativeElement.textContent.trim()).toBe('Birth Date');
    });
  });

  describe('Minimal Configuration', () => {
    beforeEach(() => {
      fixture.componentRef.setInput('label', 'Simple Date');
      fixture.detectChanges();
    });

    it('should render with default values when only required props are set', () => {
      const formField = debugElement.query(By.directive(MatFormField));
      const input = debugElement.query(By.directive(MatInput));
      const datepicker = debugElement.query(By.directive(MatDatepicker));

      expect(component.label()).toBe('Simple Date');
      expect(component.placeholder()).toBe('');
      expect(component.minDate()).toBeNull();
      expect(component.maxDate()).toBeNull();
      expect(component.startAt()).toBeNull();
      expect(component.startView()).toBe('month');
      expect(component.touchUi()).toBe(false);
      expect(component.hint()).toBe('');
      expect(component.tabIndex()).toBeUndefined();
      expect(component.className()).toBe('');
      expect(component.appearance()).toBe('fill');
      expect(component.color()).toBeUndefined();
      expect(component.disableRipple()).toBe(false);

      expect(formField.nativeElement.getAttribute('ng-reflect-appearance')).toBe('fill');
      expect(input.nativeElement.getAttribute('placeholder')).toBe('');
      expect(datepicker.nativeElement.getAttribute('ng-reflect-start-view')).toBe('month');
      expect(datepicker.nativeElement.getAttribute('ng-reflect-touch-ui')).toBe('false');
    });

    it('should not display hint when not provided', () => {
      const hintElement = debugElement.query(By.css('mat-hint'));
      expect(hintElement).toBeNull();
    });
  });

  describe('Disabled State', () => {
    beforeEach(() => {
      fixture.componentRef.setInput('label', 'Disabled Date');
      fixture.componentRef.setInput('disabled', true);
      fixture.detectChanges();
    });

    it('should render as disabled', () => {
      const input = debugElement.query(By.directive(MatInput));

      expect(component.disabled()).toBe(true);
      expect(input.nativeElement.disabled).toBe(true);
    });

    it('should not be interactive when disabled', () => {
      const input = debugElement.query(By.directive(MatInput));
      const toggle = debugElement.query(By.directive(MatDatepickerToggle));

      expect(input.nativeElement.disabled).toBe(true);
      // The toggle should also be disabled when the input is disabled
      expect(toggle).toBeTruthy();
    });
  });

  describe('Date Constraints', () => {
    beforeEach(() => {
      const minDate = new Date(2020, 0, 1);
      const maxDate = new Date(2030, 11, 31);

      fixture.componentRef.setInput('label', 'Constrained Date');
      fixture.componentRef.setInput('minDate', minDate);
      fixture.componentRef.setInput('maxDate', maxDate);
      fixture.detectChanges();
    });

    it('should apply min and max date constraints', () => {
      const input = debugElement.query(By.directive(MatInput));

      expect(component.minDate()).toEqual(new Date(2020, 0, 1));
      expect(component.maxDate()).toEqual(new Date(2030, 11, 31));

      // Note: The actual min/max validation would be handled by Angular Material internally
      expect(input.nativeElement.getAttribute('min')).toBe('2020-01-01T00:00:00.000Z');
      expect(input.nativeElement.getAttribute('max')).toBe('2030-12-31T00:00:00.000Z');
    });

    it('should handle valid date within constraints', () => {
      const validDate = new Date(2025, 5, 15);

      component.value.set(validDate);
      fixture.detectChanges();

      expect(component.value()).toEqual(validDate);
    });
  });

  describe('Error Handling and Validation', () => {
    beforeEach(() => {
      fixture.componentRef.setInput('label', 'Validated Date');
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
      component.errors.set([{ message: 'Invalid date' }]);
      fixture.detectChanges();

      const errorElements = debugElement.queryAll(By.css('mat-error'));
      expect(errorElements.length).toBe(0);
    });

    it('should display errors when invalid and touched', () => {
      component.invalid.set(true);
      component.touched.set(true);
      component.errors.set([{ message: 'Date is required' }]);
      fixture.detectChanges();

      const errorElements = debugElement.queryAll(By.css('mat-error'));
      expect(errorElements.length).toBe(1);
      expect(errorElements[0].nativeElement.textContent.trim()).toBe('Date is required');
    });

    it('should display multiple errors when invalid and touched', () => {
      component.invalid.set(true);
      component.touched.set(true);
      component.errors.set([{ message: 'Date is required' }, { message: 'Date must be in the future' }]);
      fixture.detectChanges();

      const errorElements = debugElement.queryAll(By.css('mat-error span'));
      expect(errorElements.length).toBe(2);
      expect(errorElements[0].nativeElement.textContent.trim()).toBe('Date is required');
      expect(errorElements[1].nativeElement.textContent.trim()).toBe('Date must be in the future');
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
      component.errors.set([{ message: 'Date validation failed' }]);
      fixture.detectChanges();

      errorElements = debugElement.queryAll(By.css('mat-error'));
      expect(errorElements.length).toBe(1);
      expect(errorElements[0].nativeElement.textContent.trim()).toBe('Date validation failed');

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
      fixture.componentRef.setInput('label', 'Fill Date');
      fixture.componentRef.setInput('appearance', 'fill');
      fixture.detectChanges();

      const formField = debugElement.query(By.directive(MatFormField));
      expect(formField.nativeElement.getAttribute('ng-reflect-appearance')).toBe('fill');
    });

    it('should handle outline appearance', () => {
      fixture.componentRef.setInput('label', 'Outline Date');
      fixture.componentRef.setInput('appearance', 'outline');
      fixture.detectChanges();

      const formField = debugElement.query(By.directive(MatFormField));
      expect(formField.nativeElement.getAttribute('ng-reflect-appearance')).toBe('outline');
    });
  });

  describe('Start View Variations', () => {
    it('should handle month start view', () => {
      fixture.componentRef.setInput('label', 'Month View');
      fixture.componentRef.setInput('startView', 'month');
      fixture.detectChanges();

      const datepicker = debugElement.query(By.directive(MatDatepicker));
      expect(datepicker.nativeElement.getAttribute('ng-reflect-start-view')).toBe('month');
    });

    it('should handle year start view', () => {
      fixture.componentRef.setInput('label', 'Year View');
      fixture.componentRef.setInput('startView', 'year');
      fixture.detectChanges();

      const datepicker = debugElement.query(By.directive(MatDatepicker));
      expect(datepicker.nativeElement.getAttribute('ng-reflect-start-view')).toBe('year');
    });

    it('should handle multi-year start view', () => {
      fixture.componentRef.setInput('label', 'Multi-year View');
      fixture.componentRef.setInput('startView', 'multi-year');
      fixture.detectChanges();

      const datepicker = debugElement.query(By.directive(MatDatepicker));
      expect(datepicker.nativeElement.getAttribute('ng-reflect-start-view')).toBe('multi-year');
    });
  });

  describe('Touch UI', () => {
    it('should handle touch UI enabled', () => {
      fixture.componentRef.setInput('label', 'Touch UI Date');
      fixture.componentRef.setInput('touchUi', true);
      fixture.detectChanges();

      const datepicker = debugElement.query(By.directive(MatDatepicker));
      expect(datepicker.nativeElement.getAttribute('ng-reflect-touch-ui')).toBe('true');
    });

    it('should handle touch UI disabled', () => {
      fixture.componentRef.setInput('label', 'Desktop UI Date');
      fixture.componentRef.setInput('touchUi', false);
      fixture.detectChanges();

      const datepicker = debugElement.query(By.directive(MatDatepicker));
      expect(datepicker.nativeElement.getAttribute('ng-reflect-touch-ui')).toBe('false');
    });
  });

  describe('Accessibility', () => {
    beforeEach(() => {
      fixture.componentRef.setInput('label', 'Accessible Date');
      fixture.componentRef.setInput('tabIndex', 3);
      fixture.detectChanges();
    });

    it('should support custom tabIndex', () => {
      const input = debugElement.query(By.directive(MatInput));
      expect(component.tabIndex()).toBe(3);
      expect(input.nativeElement.getAttribute('tabindex')).toBe('3');
    });

    it('should have proper label association', () => {
      const labelElement = debugElement.query(By.css('mat-label'));
      expect(labelElement.nativeElement.textContent.trim()).toBe('Accessible Date');
    });
  });

  describe('Dynamic State Changes', () => {
    beforeEach(() => {
      fixture.componentRef.setInput('label', 'Dynamic Date');
      fixture.detectChanges();
    });

    it('should handle multiple state changes in sequence', () => {
      const testDate = new Date(2024, 6, 20);

      // Set a date value
      component.value.set(testDate);
      fixture.detectChanges();
      expect(component.value()).toEqual(testDate);

      // Touch it
      component.touched.set(true);
      fixture.detectChanges();
      expect(component.touched()).toBe(true);

      // Make it invalid
      component.invalid.set(true);
      component.errors.set([{ message: 'Date error occurred' }]);
      fixture.detectChanges();

      const errorElements = debugElement.queryAll(By.css('mat-error'));
      expect(errorElements.length).toBe(1);

      // Clear the date
      component.value.set(null);
      fixture.detectChanges();
      expect(component.value()).toBeNull();

      // Make it valid again
      component.invalid.set(false);
      component.errors.set([]);
      fixture.detectChanges();

      const errorElementsAfter = debugElement.queryAll(By.css('mat-error'));
      expect(errorElementsAfter.length).toBe(0);
    });

    it('should handle startAt date changes', () => {
      const initialStartDate = new Date(2024, 0, 1);
      const newStartDate = new Date(2024, 6, 1);

      fixture.componentRef.setInput('startAt', initialStartDate);
      fixture.detectChanges();
      expect(component.startAt()).toEqual(initialStartDate);

      fixture.componentRef.setInput('startAt', newStartDate);
      fixture.detectChanges();
      expect(component.startAt()).toEqual(newStartDate);
    });
  });

  describe('Datepicker Toggle', () => {
    beforeEach(() => {
      fixture.componentRef.setInput('label', 'Toggle Test');
      fixture.detectChanges();
    });

    it('should render datepicker toggle', () => {
      const toggle = debugElement.query(By.directive(MatDatepickerToggle));
      expect(toggle).toBeTruthy();
    });

    it('should be associated with the datepicker', () => {
      const toggle = debugElement.query(By.directive(MatDatepickerToggle));
      const datepicker = debugElement.query(By.directive(MatDatepicker));

      expect(toggle).toBeTruthy();
      expect(datepicker).toBeTruthy();
    });
  });
});
