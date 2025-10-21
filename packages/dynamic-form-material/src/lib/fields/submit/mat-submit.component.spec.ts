import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideAnimations } from '@angular/platform-browser/animations';
import { MatSubmitFieldComponent } from './mat-submit.component';
import { DebugElement } from '@angular/core';
import { By } from '@angular/platform-browser';
import { MatButton } from '@angular/material/button';

describe('MatSubmitFieldComponent Integration Tests', () => {
  let component: MatSubmitFieldComponent;
  let fixture: ComponentFixture<MatSubmitFieldComponent>;
  let debugElement: DebugElement;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MatSubmitFieldComponent],
      providers: [provideAnimations()],
    }).compileComponents();

    fixture = TestBed.createComponent(MatSubmitFieldComponent);
    component = fixture.componentInstance;
    debugElement = fixture.debugElement;
  });

  describe('Happy Flow - All Inputs Set', () => {
    let clickHandler: jasmine.Spy;

    beforeEach(() => {
      clickHandler = jasmine.createSpy('clickHandler');
      fixture.componentRef.setInput('label', 'Submit Form');
      fixture.componentRef.setInput('disabled', false);
      fixture.componentRef.setInput('className', 'custom-submit-btn');
      fixture.componentRef.setInput('onClick', clickHandler);
      fixture.componentRef.setInput('color', 'accent');
      fixture.detectChanges();
    });

    it('should render with all properties correctly set', () => {
      const button = debugElement.query(By.css('button'));
      const matButton = debugElement.query(By.directive(MatButton));

      expect(component.label()).toBe('Submit Form');
      expect(component.disabled()).toBe(false);
      expect(component.className()).toBe('custom-submit-btn');
      expect(component.onClick()).toBe(clickHandler);
      expect(component.color()).toBe('accent');

      expect(button.nativeElement.textContent.trim()).toBe('Submit Form');
      expect(button.nativeElement.getAttribute('type')).toBe('button');
      expect(button.nativeElement.getAttribute('ng-reflect-color')).toBe('accent');
      expect(button.nativeElement.className).toContain('custom-submit-btn');
      expect(button.nativeElement.disabled).toBe(false);
      expect(matButton.nativeElement.hasAttribute('mat-raised-button')).toBe(true);
    });

    it('should execute click handler when clicked', () => {
      const button = debugElement.query(By.css('button'));

      expect(clickHandler).not.toHaveBeenCalled();

      button.nativeElement.click();
      fixture.detectChanges();

      expect(clickHandler).toHaveBeenCalledTimes(1);
    });

    it('should trigger handleClick method when button is clicked', () => {
      spyOn(component, 'handleClick');
      const button = debugElement.query(By.css('button'));

      button.nativeElement.click();
      fixture.detectChanges();

      expect(component.handleClick).toHaveBeenCalledTimes(1);
    });
  });

  describe('Minimal Configuration', () => {
    beforeEach(() => {
      fixture.componentRef.setInput('label', 'Simple Submit');
      fixture.detectChanges();
    });

    it('should render with default values when only required props are set', () => {
      const button = debugElement.query(By.css('button'));

      expect(component.label()).toBe('Simple Submit');
      expect(component.disabled()).toBe(false);
      expect(component.className()).toBe('');
      expect(component.onClick()).toBeUndefined();
      expect(component.color()).toBe('primary');

      expect(button.nativeElement.textContent.trim()).toBe('Simple Submit');
      expect(button.nativeElement.getAttribute('ng-reflect-color')).toBe('primary');
      expect(button.nativeElement.className).toContain('mat-mdc-raised-button');
      expect(button.nativeElement.disabled).toBe(false);
    });

    it('should not execute any click handler when none is provided', () => {
      const button = debugElement.query(By.css('button'));

      // This should not throw an error
      expect(() => {
        button.nativeElement.click();
        fixture.detectChanges();
      }).not.toThrow();
    });
  });

  describe('Disabled State', () => {
    beforeEach(() => {
      fixture.componentRef.setInput('label', 'Disabled Submit');
      fixture.componentRef.setInput('disabled', true);
      fixture.detectChanges();
    });

    it('should render as disabled', () => {
      const button = debugElement.query(By.css('button'));

      expect(component.disabled()).toBe(true);
      expect(button.nativeElement.disabled).toBe(true);
      expect(button.nativeElement.getAttribute('ng-reflect-disabled')).toBe('true');
    });

    it('should not execute click handler when disabled', () => {
      const clickHandler = jasmine.createSpy('clickHandler');
      fixture.componentRef.setInput('onClick', clickHandler);
      fixture.detectChanges();

      const button = debugElement.query(By.css('button'));

      // Try to click the disabled button
      button.nativeElement.click();
      fixture.detectChanges();

      // Click handler should not be called due to disabled state
      expect(clickHandler).not.toHaveBeenCalled();
    });
  });

  describe('Color Variations', () => {
    it('should handle primary color', () => {
      fixture.componentRef.setInput('label', 'Primary Submit');
      fixture.componentRef.setInput('color', 'primary');
      fixture.detectChanges();

      const button = debugElement.query(By.css('button'));
      expect(button.nativeElement.getAttribute('ng-reflect-color')).toBe('primary');
      expect(button.nativeElement.className).toContain('mat-primary');
    });

    it('should handle accent color', () => {
      fixture.componentRef.setInput('label', 'Accent Submit');
      fixture.componentRef.setInput('color', 'accent');
      fixture.detectChanges();

      const button = debugElement.query(By.css('button'));
      expect(button.nativeElement.getAttribute('ng-reflect-color')).toBe('accent');
      expect(button.nativeElement.className).toContain('mat-accent');
    });

    it('should handle warn color', () => {
      fixture.componentRef.setInput('label', 'Warn Submit');
      fixture.componentRef.setInput('color', 'warn');
      fixture.detectChanges();

      const button = debugElement.query(By.css('button'));
      expect(button.nativeElement.getAttribute('ng-reflect-color')).toBe('warn');
      expect(button.nativeElement.className).toContain('mat-warn');
    });
  });

  describe('Click Handler Functionality', () => {
    let clickHandler: jasmine.Spy;

    beforeEach(() => {
      clickHandler = jasmine.createSpy('clickHandler');
      fixture.componentRef.setInput('label', 'Click Test Submit');
      fixture.componentRef.setInput('onClick', clickHandler);
      fixture.detectChanges();
    });

    it('should call click handler exactly once per click', () => {
      const button = debugElement.query(By.css('button'));

      button.nativeElement.click();
      fixture.detectChanges();
      expect(clickHandler).toHaveBeenCalledTimes(1);

      button.nativeElement.click();
      fixture.detectChanges();
      expect(clickHandler).toHaveBeenCalledTimes(2);
    });

    it('should handle click handler that throws an error gracefully', () => {
      const errorHandler = jasmine.createSpy('errorHandler').and.throwError('Test error');
      fixture.componentRef.setInput('onClick', errorHandler);
      fixture.detectChanges();

      const button = debugElement.query(By.css('button'));

      expect(() => {
        button.nativeElement.click();
        fixture.detectChanges();
      }).toThrow('Test error');

      expect(errorHandler).toHaveBeenCalledTimes(1);
    });

    it('should handle handleClick method directly', () => {
      expect(clickHandler).not.toHaveBeenCalled();

      component.handleClick();

      expect(clickHandler).toHaveBeenCalledTimes(1);
    });

    it('should handle handleClick when no onClick handler is set', () => {
      fixture.componentRef.setInput('onClick', undefined);
      fixture.detectChanges();

      expect(() => {
        component.handleClick();
      }).not.toThrow();
    });
  });

  describe('Accessibility', () => {
    beforeEach(() => {
      fixture.componentRef.setInput('label', 'Accessible Submit');
      fixture.detectChanges();
    });

    it('should have proper button semantics', () => {
      const button = debugElement.query(By.css('button'));

      expect(button.nativeElement.tagName.toLowerCase()).toBe('button');
      expect(button.nativeElement.getAttribute('type')).toBe('button');
    });

    it('should have accessible label text', () => {
      const button = debugElement.query(By.css('button'));

      expect(button.nativeElement.textContent.trim()).toBe('Accessible Submit');
      expect(button.nativeElement.textContent.trim().length).toBeGreaterThan(0);
    });

    it('should support Material Design raised button styling', () => {
      const matButton = debugElement.query(By.directive(MatButton));

      expect(matButton.nativeElement.hasAttribute('mat-raised-button')).toBe(true);
    });
  });

  describe('Dynamic State Changes', () => {
    let clickHandler: jasmine.Spy;

    beforeEach(() => {
      clickHandler = jasmine.createSpy('clickHandler');
      fixture.componentRef.setInput('label', 'Dynamic Submit');
      fixture.componentRef.setInput('onClick', clickHandler);
      fixture.detectChanges();
    });

    it('should handle multiple property changes in sequence', () => {
      const button = debugElement.query(By.css('button'));

      // Initial state
      expect(button.nativeElement.textContent.trim()).toBe('Dynamic Submit');
      expect(button.nativeElement.disabled).toBe(false);

      // Change label
      fixture.componentRef.setInput('label', 'Updated Submit');
      fixture.detectChanges();
      expect(button.nativeElement.textContent.trim()).toBe('Updated Submit');

      // Disable button
      fixture.componentRef.setInput('disabled', true);
      fixture.detectChanges();
      expect(button.nativeElement.disabled).toBe(true);

      // Change color
      fixture.componentRef.setInput('color', 'warn');
      fixture.detectChanges();
      expect(button.nativeElement.getAttribute('ng-reflect-color')).toBe('warn');

      // Enable button again
      fixture.componentRef.setInput('disabled', false);
      fixture.detectChanges();
      expect(button.nativeElement.disabled).toBe(false);

      // Test click still works
      button.nativeElement.click();
      fixture.detectChanges();
      expect(clickHandler).toHaveBeenCalledTimes(1);
    });

    it('should handle click handler changes dynamically', () => {
      const newClickHandler = jasmine.createSpy('newClickHandler');
      const button = debugElement.query(By.css('button'));

      // Initial click handler
      button.nativeElement.click();
      fixture.detectChanges();
      expect(clickHandler).toHaveBeenCalledTimes(1);
      expect(newClickHandler).not.toHaveBeenCalled();

      // Change click handler
      fixture.componentRef.setInput('onClick', newClickHandler);
      fixture.detectChanges();

      // New click handler should be called
      button.nativeElement.click();
      fixture.detectChanges();
      expect(clickHandler).toHaveBeenCalledTimes(1);
      expect(newClickHandler).toHaveBeenCalledTimes(1);
    });
  });

  describe('CSS Class Management', () => {
    it('should apply custom CSS classes', () => {
      fixture.componentRef.setInput('label', 'CSS Test Submit');
      fixture.componentRef.setInput('className', 'custom-class another-class');
      fixture.detectChanges();

      const button = debugElement.query(By.css('button'));
      expect(button.nativeElement.className).toContain('custom-class');
      expect(button.nativeElement.className).toContain('another-class');
    });

    it('should handle empty className gracefully', () => {
      fixture.componentRef.setInput('label', 'Empty Class Submit');
      fixture.componentRef.setInput('className', '');
      fixture.detectChanges();

      const button = debugElement.query(By.css('button'));
      expect(button.nativeElement.className).not.toContain('undefined');
      expect(button.nativeElement.className).not.toContain('null');
    });

    it('should combine custom classes with Material Design classes', () => {
      fixture.componentRef.setInput('label', 'Combined Class Submit');
      fixture.componentRef.setInput('className', 'my-custom-class');
      fixture.componentRef.setInput('color', 'primary');
      fixture.detectChanges();

      const button = debugElement.query(By.css('button'));
      expect(button.nativeElement.className).toContain('my-custom-class');
      expect(button.nativeElement.className).toContain('mat-mdc-raised-button');
      expect(button.nativeElement.className).toContain('mat-primary');
    });
  });

  describe('Error Handling', () => {
    it('should handle null click handler gracefully', () => {
      fixture.componentRef.setInput('label', 'Null Handler Submit');
      fixture.componentRef.setInput('onClick', null as any);
      fixture.detectChanges();

      const button = debugElement.query(By.css('button'));

      expect(() => {
        button.nativeElement.click();
        fixture.detectChanges();
      }).not.toThrow();
    });

    it('should handle undefined click handler gracefully', () => {
      fixture.componentRef.setInput('label', 'Undefined Handler Submit');
      fixture.componentRef.setInput('onClick', undefined);
      fixture.detectChanges();

      const button = debugElement.query(By.css('button'));

      expect(() => {
        button.nativeElement.click();
        fixture.detectChanges();
      }).not.toThrow();
    });
  });
});
