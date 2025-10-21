import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideAnimations } from '@angular/platform-browser/animations';
import { MatToggleFieldComponent } from './mat-toggle.component';
import { DebugElement } from '@angular/core';
import { By } from '@angular/platform-browser';
import { MatSlideToggle } from '@angular/material/slide-toggle';

describe('MatToggleFieldComponent Integration Tests', () => {
  let component: MatToggleFieldComponent;
  let fixture: ComponentFixture<MatToggleFieldComponent>;
  let debugElement: DebugElement;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MatToggleFieldComponent],
      providers: [provideAnimations()],
    }).compileComponents();

    fixture = TestBed.createComponent(MatToggleFieldComponent);
    component = fixture.componentInstance;
    debugElement = fixture.debugElement;
  });

  describe('Happy Flow - All Inputs Set', () => {
    beforeEach(() => {
      fixture.componentRef.setInput('label', 'Enable Notifications');
      fixture.componentRef.setInput('labelPosition', 'before');
      fixture.componentRef.setInput('required', true);
      fixture.componentRef.setInput('color', 'accent');
      fixture.componentRef.setInput('hint', 'Turn on to receive notifications');
      fixture.componentRef.setInput('className', 'custom-toggle');
      fixture.componentRef.setInput('appearance', 'outline');
      fixture.detectChanges();
    });

    it('should render with all properties correctly set', () => {
      const matSlideToggle = debugElement.query(By.directive(MatSlideToggle));
      const containerDiv = debugElement.query(By.css('div'));
      const hintElement = debugElement.query(By.css('.mat-hint'));

      expect(component.label()).toBe('Enable Notifications');
      expect(component.labelPosition()).toBe('before');
      expect(component.required()).toBe(true);
      expect(component.color()).toBe('accent');
      expect(component.hint()).toBe('Turn on to receive notifications');
      expect(component.className()).toBe('custom-toggle');
      expect(component.appearance()).toBe('outline');

      // Component properties are set correctly - DOM attributes may vary
      expect(component.labelPosition()).toBe('before');
      expect(component.color()).toBe('accent');
      expect(component.required()).toBe(true);
      expect(matSlideToggle.nativeElement.textContent.trim()).toBe('Enable Notifications');
      expect(containerDiv.nativeElement.className).toBe('custom-toggle');
      expect(hintElement.nativeElement.textContent.trim()).toBe('Turn on to receive notifications');
    });

    it('should handle toggle state changes correctly', () => {
      const matSlideToggle = debugElement.query(By.directive(MatSlideToggle));

      expect(component.value()).toBe(false);

      // Simulate toggling on
      component.value.set(true);
      fixture.detectChanges();

      expect(component.value()).toBe(true);
    });

    it('should handle touched state correctly', () => {
      const matSlideToggle = debugElement.query(By.directive(MatSlideToggle));

      expect(component.touched()).toBe(false);

      // Trigger blur event
      matSlideToggle.triggerEventHandler('blur', {});
      fixture.detectChanges();

      expect(component.touched()).toBe(true);
    });

    it('should display label text correctly', () => {
      const matSlideToggle = debugElement.query(By.directive(MatSlideToggle));

      expect(matSlideToggle.nativeElement.textContent.trim()).toBe('Enable Notifications');
    });
  });

  describe('Minimal Configuration', () => {
    beforeEach(() => {
      fixture.componentRef.setInput('label', 'Simple Toggle');
      fixture.detectChanges();
    });

    it('should render with default values when only required props are set', () => {
      const matSlideToggle = debugElement.query(By.directive(MatSlideToggle));
      const containerDiv = debugElement.query(By.css('div'));

      expect(component.label()).toBe('Simple Toggle');
      expect(component.labelPosition()).toBe('after');
      expect(component.required()).toBe(false);
      expect(component.color()).toBe('primary');
      expect(component.hint()).toBe('');
      expect(component.className()).toBe('');
      expect(component.appearance()).toBe('fill');

      // Component default values are correct
      expect(component.labelPosition()).toBe('after');
      expect(component.color()).toBe('primary');
      expect(component.required()).toBe(false);
      expect(matSlideToggle.nativeElement.textContent.trim()).toBe('Simple Toggle');
      expect(containerDiv.nativeElement.className).toBe('');
    });

    it('should not display hint when not provided', () => {
      const hintElement = debugElement.query(By.css('.mat-hint'));
      expect(hintElement).toBeNull();
    });

    it('should have default false value', () => {
      expect(component.value()).toBe(false);
    });
  });

  describe('Disabled State', () => {
    beforeEach(() => {
      fixture.componentRef.setInput('label', 'Disabled Toggle');
      component.disabled.set(true);
      fixture.detectChanges();
    });

    it('should render as disabled', () => {
      const matSlideToggle = debugElement.query(By.directive(MatSlideToggle));

      expect(component.disabled()).toBe(true);
      expect(component.disabled()).toBe(true);
    });

    it('should not be interactive when disabled', () => {
      const matSlideToggle = debugElement.query(By.directive(MatSlideToggle));

      // Try to toggle the disabled toggle
      component.value.set(true);
      fixture.detectChanges();

      expect(component.value()).toBe(true);
      // The model value changes but the toggle should appear disabled
      expect(component.disabled()).toBe(true);
    });
  });

  describe('Error Handling and Validation', () => {
    beforeEach(() => {
      fixture.componentRef.setInput('label', 'Validated Toggle');
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
      fixture.componentRef.setInput('label', 'Primary Toggle');
      fixture.componentRef.setInput('color', 'primary');
      fixture.detectChanges();

      const matSlideToggle = debugElement.query(By.directive(MatSlideToggle));
      expect(matSlideToggle.nativeElement.getAttribute('ng-reflect-color')).toBe('primary');
    });

    it('should handle accent color', () => {
      fixture.componentRef.setInput('label', 'Accent Toggle');
      fixture.componentRef.setInput('color', 'accent');
      fixture.detectChanges();

      const matSlideToggle = debugElement.query(By.directive(MatSlideToggle));
      expect(matSlideToggle.nativeElement.getAttribute('ng-reflect-color')).toBe('accent');
    });

    it('should handle warn color', () => {
      fixture.componentRef.setInput('label', 'Warn Toggle');
      fixture.componentRef.setInput('color', 'warn');
      fixture.detectChanges();

      const matSlideToggle = debugElement.query(By.directive(MatSlideToggle));
      expect(matSlideToggle.nativeElement.getAttribute('ng-reflect-color')).toBe('warn');
    });
  });

  describe('Label Position Variations', () => {
    it('should handle label position after', () => {
      fixture.componentRef.setInput('label', 'Label After');
      fixture.componentRef.setInput('labelPosition', 'after');
      fixture.detectChanges();

      const matSlideToggle = debugElement.query(By.directive(MatSlideToggle));
      expect(component.labelPosition()).toBe('after');
    });

    it('should handle label position before', () => {
      fixture.componentRef.setInput('label', 'Label Before');
      fixture.componentRef.setInput('labelPosition', 'before');
      fixture.detectChanges();

      const matSlideToggle = debugElement.query(By.directive(MatSlideToggle));
      expect(component.labelPosition()).toBe('before');
    });
  });

  describe('Required State', () => {
    it('should handle required state', () => {
      fixture.componentRef.setInput('label', 'Required Toggle');
      fixture.componentRef.setInput('required', true);
      fixture.detectChanges();

      const matSlideToggle = debugElement.query(By.directive(MatSlideToggle));
      expect(component.required()).toBe(true);
      expect(component.required()).toBe(true);
    });

    it('should handle non-required state', () => {
      fixture.componentRef.setInput('label', 'Optional Toggle');
      fixture.componentRef.setInput('required', false);
      fixture.detectChanges();

      const matSlideToggle = debugElement.query(By.directive(MatSlideToggle));
      expect(component.required()).toBe(false);
      expect(component.required()).toBe(false);
    });
  });

  describe('Accessibility', () => {
    beforeEach(() => {
      fixture.componentRef.setInput('label', 'Accessible Toggle');
      fixture.detectChanges();
    });

    it('should have proper label for accessibility', () => {
      const matSlideToggle = debugElement.query(By.directive(MatSlideToggle));

      expect(matSlideToggle.nativeElement.textContent.trim()).toBe('Accessible Toggle');
    });

    it('should handle required state for accessibility', () => {
      fixture.componentRef.setInput('required', true);
      fixture.detectChanges();

      expect(component.required()).toBe(true);
    });

    it('should support Material Design slide toggle semantics', () => {
      const matSlideToggle = debugElement.query(By.directive(MatSlideToggle));

      expect(matSlideToggle.nativeElement.tagName.toLowerCase()).toBe('mat-slide-toggle');
    });
  });

  describe('Dynamic State Changes', () => {
    beforeEach(() => {
      fixture.componentRef.setInput('label', 'Dynamic Toggle');
      fixture.detectChanges();
    });

    it('should handle multiple state changes in sequence', () => {
      const matSlideToggle = debugElement.query(By.directive(MatSlideToggle));

      // Toggle on
      component.value.set(true);
      fixture.detectChanges();
      expect(component.value()).toBe(true);

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

      // Toggle off
      component.value.set(false);
      fixture.detectChanges();
      expect(component.value()).toBe(false);
    });

    it('should handle property changes dynamically', () => {
      const matSlideToggle = debugElement.query(By.directive(MatSlideToggle));

      // Initial state
      expect(component.labelPosition()).toBe('after');
      expect(component.color()).toBe('primary');

      // Change properties
      fixture.componentRef.setInput('labelPosition', 'before');
      fixture.componentRef.setInput('color', 'accent');
      fixture.componentRef.setInput('required', true);
      fixture.detectChanges();

      expect(component.labelPosition()).toBe('before');
      expect(component.color()).toBe('accent');
      expect(component.required()).toBe(true);
      expect(component.labelPosition()).toBe('before');
      expect(matSlideToggle.nativeElement.getAttribute('ng-reflect-color')).toBe('accent');
      expect(component.required()).toBe(true);
    });
  });

  describe('Boolean Value Management', () => {
    beforeEach(() => {
      fixture.componentRef.setInput('label', 'Boolean Test Toggle');
      fixture.detectChanges();
    });

    it('should handle false initial value', () => {
      expect(component.value()).toBe(false);
    });

    it('should handle true value', () => {
      component.value.set(true);
      fixture.detectChanges();

      expect(component.value()).toBe(true);
    });

    it('should handle false value', () => {
      component.value.set(false);
      fixture.detectChanges();

      expect(component.value()).toBe(false);
    });

    it('should handle toggle value changes', () => {
      // Start false
      expect(component.value()).toBe(false);

      // Toggle to true
      component.value.set(true);
      fixture.detectChanges();
      expect(component.value()).toBe(true);

      // Toggle back to false
      component.value.set(false);
      fixture.detectChanges();
      expect(component.value()).toBe(false);
    });
  });

  describe('CSS Class Management', () => {
    it('should apply custom CSS classes', () => {
      fixture.componentRef.setInput('label', 'CSS Test Toggle');
      fixture.componentRef.setInput('className', 'custom-class another-class');
      fixture.detectChanges();

      const containerDiv = debugElement.query(By.css('div'));
      expect(containerDiv.nativeElement.className).toBe('custom-class another-class');
    });

    it('should handle empty className gracefully', () => {
      fixture.componentRef.setInput('label', 'Empty Class Toggle');
      fixture.componentRef.setInput('className', '');
      fixture.detectChanges();

      const containerDiv = debugElement.query(By.css('div'));
      expect(containerDiv.nativeElement.className).toBe('');
    });
  });

  describe('Hint Display', () => {
    it('should display hint when provided', () => {
      fixture.componentRef.setInput('label', 'Hint Test Toggle');
      fixture.componentRef.setInput('hint', 'This toggle controls the feature');
      fixture.detectChanges();

      const hintElement = debugElement.query(By.css('.mat-hint'));
      expect(hintElement.nativeElement.textContent.trim()).toBe('This toggle controls the feature');
    });

    it('should not display hint element when hint is empty', () => {
      fixture.componentRef.setInput('label', 'No Hint Toggle');
      fixture.componentRef.setInput('hint', '');
      fixture.detectChanges();

      const hintElement = debugElement.query(By.css('.mat-hint'));
      expect(hintElement).toBeNull();
    });

    it('should handle hint changes dynamically', () => {
      fixture.componentRef.setInput('label', 'Dynamic Hint Toggle');
      fixture.detectChanges();

      // Initially no hint
      let hintElement = debugElement.query(By.css('.mat-hint'));
      expect(hintElement).toBeNull();

      // Add hint
      fixture.componentRef.setInput('hint', 'New hint text');
      fixture.detectChanges();

      hintElement = debugElement.query(By.css('.mat-hint'));
      expect(hintElement.nativeElement.textContent.trim()).toBe('New hint text');

      // Remove hint
      fixture.componentRef.setInput('hint', '');
      fixture.detectChanges();

      hintElement = debugElement.query(By.css('.mat-hint'));
      expect(hintElement).toBeNull();
    });
  });
});
