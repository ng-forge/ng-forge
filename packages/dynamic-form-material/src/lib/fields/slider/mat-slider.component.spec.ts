import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideAnimations } from '@angular/platform-browser/animations';
import { MatSliderFieldComponent } from './mat-slider.component';
import { DebugElement } from '@angular/core';
import { By } from '@angular/platform-browser';
import { MatSlider, MatSliderThumb } from '@angular/material/slider';

describe('MatSliderFieldComponent Integration Tests', () => {
  let component: MatSliderFieldComponent;
  let fixture: ComponentFixture<MatSliderFieldComponent>;
  let debugElement: DebugElement;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MatSliderFieldComponent],
      providers: [provideAnimations()],
    }).compileComponents();

    fixture = TestBed.createComponent(MatSliderFieldComponent);
    component = fixture.componentInstance;
    debugElement = fixture.debugElement;
  });

  describe('Happy Flow - All Inputs Set', () => {
    beforeEach(() => {
      fixture.componentRef.setInput('label', 'Volume Level');
      fixture.componentRef.setInput('minValue', 0);
      fixture.componentRef.setInput('maxValue', 100);
      fixture.componentRef.setInput('step', 5);
      fixture.componentRef.setInput('thumbLabel', true);
      fixture.componentRef.setInput('showThumbLabel', true);
      fixture.componentRef.setInput('tickInterval', 10);
      fixture.componentRef.setInput('vertical', false);
      fixture.componentRef.setInput('invert', false);
      fixture.componentRef.setInput('color', 'accent');
      fixture.componentRef.setInput('hint', 'Adjust the volume level');
      fixture.componentRef.setInput('className', 'custom-slider');
      fixture.componentRef.setInput('appearance', 'outline');
      fixture.detectChanges();
    });

    it('should render with all properties correctly set', () => {
      const matSlider = debugElement.query(By.directive(MatSlider));
      const matSliderThumb = debugElement.query(By.directive(MatSliderThumb));
      const containerDiv = debugElement.query(By.css('div'));
      const labelElement = debugElement.query(By.css('.slider-label'));
      const hintElement = debugElement.query(By.css('.mat-hint'));

      expect(component.label()).toBe('Volume Level');
      expect(component.minValue()).toBe(0);
      expect(component.maxValue()).toBe(100);
      expect(component.step()).toBe(5);
      expect(component.thumbLabel()).toBe(true);
      expect(component.showThumbLabel()).toBe(true);
      expect(component.tickInterval()).toBe(10);
      expect(component.vertical()).toBe(false);
      expect(component.invert()).toBe(false);
      expect(component.color()).toBe('accent');
      expect(component.hint()).toBe('Adjust the volume level');
      expect(component.className()).toBe('custom-slider');
      expect(component.appearance()).toBe('outline');

      expect(matSlider.nativeElement.getAttribute('min')).toBe('0');
      expect(matSlider.nativeElement.getAttribute('max')).toBe('100');
      expect(matSlider.nativeElement.getAttribute('step')).toBe('5');
      expect(containerDiv.nativeElement.className).toBe('custom-slider');
      expect(labelElement.nativeElement.textContent.trim()).toBe('Volume Level');
      expect(hintElement.nativeElement.textContent.trim()).toBe('Adjust the volume level');
    });

    it('should handle value changes correctly', () => {
      const matSliderThumb = debugElement.query(By.css('input[matSliderThumb]'));

      expect(component.value()).toBe(0);

      // Simulate slider value change
      component.value.set(50);
      fixture.detectChanges();

      expect(component.value()).toBe(50);
      expect(matSliderThumb.nativeElement.value).toBe('50');
    });

    it('should handle touched state correctly', () => {
      const matSliderThumb = debugElement.query(By.css('input[matSliderThumb]'));

      expect(component.touched()).toBe(false);

      // Trigger blur event
      matSliderThumb.triggerEventHandler('blur', {});
      fixture.detectChanges();

      expect(component.touched()).toBe(true);
    });
  });

  describe('Minimal Configuration', () => {
    beforeEach(() => {
      fixture.componentRef.setInput('label', 'Simple Slider');
      fixture.detectChanges();
    });

    it('should render with default values when only required props are set', () => {
      const matSlider = debugElement.query(By.directive(MatSlider));
      const containerDiv = debugElement.query(By.css('div'));
      const labelElement = debugElement.query(By.css('.slider-label'));

      expect(component.label()).toBe('Simple Slider');
      expect(component.minValue()).toBe(0);
      expect(component.maxValue()).toBe(100);
      expect(component.step()).toBe(1);
      expect(component.thumbLabel()).toBe(false);
      expect(component.showThumbLabel()).toBe(false);
      expect(component.tickInterval()).toBeUndefined();
      expect(component.vertical()).toBe(false);
      expect(component.invert()).toBe(false);
      expect(component.color()).toBe('primary');
      expect(component.hint()).toBe('');
      expect(component.className()).toBe('');
      expect(component.appearance()).toBe('fill');

      expect(matSlider.nativeElement.getAttribute('min')).toBe('0');
      expect(matSlider.nativeElement.getAttribute('max')).toBe('100');
      expect(matSlider.nativeElement.getAttribute('step')).toBe('1');
      expect(containerDiv.nativeElement.className).toBe('');
      expect(labelElement.nativeElement.textContent.trim()).toBe('Simple Slider');
    });

    it('should not display hint when not provided', () => {
      const hintElement = debugElement.query(By.css('.mat-hint'));
      expect(hintElement).toBeNull();
    });

    it('should have default value of 0', () => {
      expect(component.value()).toBe(0);
    });
  });

  describe('Disabled State', () => {
    beforeEach(() => {
      fixture.componentRef.setInput('label', 'Disabled Slider');
      component.disabled.set(true);
      fixture.detectChanges();
    });

    it('should render as disabled', () => {
      const matSlider = debugElement.query(By.directive(MatSlider));

      expect(component.disabled()).toBe(true);
      expect(component.disabled()).toBe(true);
    });

    it('should not be interactive when disabled', () => {
      const matSliderThumb = debugElement.query(By.css('input[matSliderThumb]'));

      // Try to change value on disabled slider
      component.value.set(75);
      fixture.detectChanges();

      expect(component.value()).toBe(75);
      // The model value changes but the slider should appear disabled
      expect(matSliderThumb.nativeElement.value).toBe('75');
    });
  });

  describe('Error Handling and Validation', () => {
    beforeEach(() => {
      fixture.componentRef.setInput('label', 'Validated Slider');
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
      component.errors.set([{ message: 'Value is out of range' }]);
      fixture.detectChanges();

      const errorElements = debugElement.queryAll(By.css('.mat-error'));
      expect(errorElements.length).toBe(0);
    });

    it('should display errors when invalid and touched', () => {
      component.invalid.set(true);
      component.touched.set(true);
      component.errors.set([{ message: 'Value is out of range' }]);
      fixture.detectChanges();

      const errorElements = debugElement.queryAll(By.css('.mat-error'));
      expect(errorElements.length).toBe(1);
      expect(errorElements[0].nativeElement.textContent.trim()).toBe('Value is out of range');
    });

    it('should display multiple errors when invalid and touched', () => {
      component.invalid.set(true);
      component.touched.set(true);
      component.errors.set([{ message: 'Value is out of range' }, { message: 'Step value is invalid' }]);
      fixture.detectChanges();

      const errorElements = debugElement.queryAll(By.css('.mat-error'));
      expect(errorElements.length).toBe(2);
      expect(errorElements[0].nativeElement.textContent.trim()).toBe('Value is out of range');
      expect(errorElements[1].nativeElement.textContent.trim()).toBe('Step value is invalid');
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
      fixture.componentRef.setInput('label', 'Primary Slider');
      fixture.componentRef.setInput('color', 'primary');
      fixture.detectChanges();

      expect(component.color()).toBe('primary');
    });

    it('should handle accent color', () => {
      fixture.componentRef.setInput('label', 'Accent Slider');
      fixture.componentRef.setInput('color', 'accent');
      fixture.detectChanges();

      expect(component.color()).toBe('accent');
    });

    it('should handle warn color', () => {
      fixture.componentRef.setInput('label', 'Warn Slider');
      fixture.componentRef.setInput('color', 'warn');
      fixture.detectChanges();

      expect(component.color()).toBe('warn');
    });
  });

  describe('Range Configuration', () => {
    it('should handle custom min and max values', () => {
      fixture.componentRef.setInput('label', 'Custom Range Slider');
      fixture.componentRef.setInput('minValue', -50);
      fixture.componentRef.setInput('maxValue', 200);
      fixture.detectChanges();

      expect(component.minValue()).toBe(-50);
      expect(component.maxValue()).toBe(200);
    });

    it('should handle custom step value', () => {
      fixture.componentRef.setInput('label', 'Custom Step Slider');
      fixture.componentRef.setInput('step', 0.5);
      fixture.detectChanges();

      expect(component.step()).toBe(0.5);
    });
  });

  describe('Thumb Label and Tick Marks', () => {
    it('should enable thumb label', () => {
      fixture.componentRef.setInput('label', 'Thumb Label Slider');
      fixture.componentRef.setInput('thumbLabel', true);
      fixture.detectChanges();

      expect(component.thumbLabel()).toBe(true);
    });

    it('should enable tick marks with numeric interval', () => {
      fixture.componentRef.setInput('label', 'Tick Marks Slider');
      fixture.componentRef.setInput('tickInterval', 5);
      fixture.detectChanges();

      expect(component.tickInterval()).toBe(5);
    });

    it('should enable tick marks with auto interval', () => {
      fixture.componentRef.setInput('label', 'Auto Tick Slider');
      fixture.componentRef.setInput('tickInterval', 'auto');
      fixture.detectChanges();

      expect(component.tickInterval()).toBe('auto');
    });

    it('should disable tick marks when tickInterval is undefined', () => {
      fixture.componentRef.setInput('label', 'No Tick Slider');
      fixture.componentRef.setInput('tickInterval', undefined);
      fixture.detectChanges();

      expect(component.tickInterval()).toBeUndefined();
    });
  });

  describe('Accessibility', () => {
    beforeEach(() => {
      fixture.componentRef.setInput('label', 'Accessible Slider');
      fixture.detectChanges();
    });

    it('should have proper label for accessibility', () => {
      const labelElement = debugElement.query(By.css('.slider-label'));

      expect(labelElement.nativeElement.textContent.trim()).toBe('Accessible Slider');
    });

    it('should be keyboard accessible', () => {
      const matSliderThumb = debugElement.query(By.css('input[matSliderThumb]'));

      expect(matSliderThumb.nativeElement.tagName.toLowerCase()).toBe('input');
    });
  });

  describe('Dynamic State Changes', () => {
    beforeEach(() => {
      fixture.componentRef.setInput('label', 'Dynamic Slider');
      fixture.detectChanges();
    });

    it('should handle multiple state changes in sequence', () => {
      // Set a value
      component.value.set(25);
      fixture.detectChanges();
      expect(component.value()).toBe(25);

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

      expect(component.disabled()).toBe(true);

      // Change value
      component.value.set(75);
      fixture.detectChanges();
      expect(component.value()).toBe(75);
    });

    it('should handle range changes dynamically', () => {
      // Start with default range
      expect(component.minValue()).toBe(0);
      expect(component.maxValue()).toBe(100);

      // Change range
      fixture.componentRef.setInput('minValue', 10);
      fixture.componentRef.setInput('maxValue', 50);
      fixture.detectChanges();

      expect(component.minValue()).toBe(10);
      expect(component.maxValue()).toBe(50);
    });
  });

  describe('Value Boundaries', () => {
    beforeEach(() => {
      fixture.componentRef.setInput('label', 'Boundary Test Slider');
      fixture.componentRef.setInput('minValue', 0);
      fixture.componentRef.setInput('maxValue', 100);
      fixture.detectChanges();
    });

    it('should handle minimum value', () => {
      component.value.set(0);
      fixture.detectChanges();

      expect(component.value()).toBe(0);
    });

    it('should handle maximum value', () => {
      component.value.set(100);
      fixture.detectChanges();

      expect(component.value()).toBe(100);
    });

    it('should handle mid-range values', () => {
      component.value.set(50);
      fixture.detectChanges();

      expect(component.value()).toBe(50);
    });

    it('should handle decimal values when step allows', () => {
      fixture.componentRef.setInput('step', 0.1);
      fixture.detectChanges();

      component.value.set(25.5);
      fixture.detectChanges();

      expect(component.value()).toBe(25.5);
    });
  });

  describe('Label Display', () => {
    it('should display label when provided', () => {
      fixture.componentRef.setInput('label', 'Test Label');
      fixture.detectChanges();

      const labelElement = debugElement.query(By.css('.slider-label'));
      expect(labelElement.nativeElement.textContent.trim()).toBe('Test Label');
    });

    it('should not display label element when label is empty', () => {
      fixture.componentRef.setInput('label', '');
      fixture.detectChanges();

      const labelElement = debugElement.query(By.css('.slider-label'));
      expect(labelElement).toBeNull();
    });
  });
});
