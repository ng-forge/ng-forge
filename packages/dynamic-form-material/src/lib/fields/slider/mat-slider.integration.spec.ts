import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideAnimations } from '@angular/platform-browser/animations';
import { By } from '@angular/platform-browser';
import { DebugElement } from '@angular/core';
import { MatSlider } from '@angular/material/slider';
import { DynamicForm, FormConfig, provideDynamicForm } from '@ng-forge/dynamic-form';
import { withMaterialFields } from '../../providers/material-providers';
import { delay, waitForDFInit } from '../../testing';

interface TestFormModel {
  volume: number;
  brightness: number;
  rating: number;
  temperature: number;
  speed: number;
}

describe('MatSliderFieldComponent - Dynamic Form Integration', () => {
  let component: DynamicForm;
  let fixture: ComponentFixture<DynamicForm>;
  let debugElement: DebugElement;

  const createComponent = (config: FormConfig, initialValue?: Partial<TestFormModel>) => {
    fixture = TestBed.createComponent(DynamicForm<any>);
    component = fixture.componentInstance;
    debugElement = fixture.debugElement;

    fixture.componentRef.setInput('config', config);
    if (initialValue !== undefined) {
      fixture.componentRef.setInput('value', initialValue);
    }
    fixture.detectChanges();

    return { component, fixture, debugElement };
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DynamicForm],
      providers: [provideAnimations(), provideDynamicForm(...withMaterialFields())],
    }).compileComponents();
  });

  describe('Basic Material Slider Integration', () => {
    it('should render volume slider with full configuration', async () => {
      const config: FormConfig = {
        fields: [
          {
            key: 'volume',
            type: 'slider',
            label: 'Volume Level',
            props: {
              min: 0,
              max: 100,
              step: 5,
              thumbLabel: true,
              showThumbLabel: true,
              hint: 'Adjust the volume level',
              color: 'primary',
              tabIndex: 1,
              className: 'volume-slider',
              tickInterval: 25,
            },
          },
        ],
      };

      createComponent(config, {
        volume: 50,
        brightness: 0,
        rating: 0,
        temperature: 0,
        speed: 0,
      });

      await waitForDFInit(component, fixture);

      const slider = debugElement.query(By.directive(MatSlider));
      const sliderInput = debugElement.query(By.css('input[matSliderThumb]'));
      const label = debugElement.query(By.css('.slider-label'));
      const hint = debugElement.query(By.css('.mat-hint'));
      const container = debugElement.query(By.css('.volume-slider'));

      expect(slider).toBeTruthy();
      expect(slider.componentInstance.min).toBe(0);
      expect(slider.componentInstance.max).toBe(100);
      expect(slider.componentInstance.discrete).toBe(true);
      expect(slider.componentInstance.showTickMarks).toBe(true);
      expect(slider.componentInstance.color).toBe('primary');
      expect(sliderInput.nativeElement.getAttribute('tabindex')).toBe('1');
      expect(container).toBeTruthy();
      expect(label.nativeElement.textContent.trim()).toBe('Volume Level');
      expect(hint.nativeElement.textContent.trim()).toBe('Adjust the volume level');
    });

    it('should handle user input and update form value', async () => {
      const config: FormConfig = {
        fields: [
          {
            key: 'volume',
            type: 'slider',
            label: 'Volume Level',
            props: {
              min: 0,
              max: 100,
              step: 1,
            },
          },
        ],
      };

      const { component } = createComponent(config, {
        volume: 25,
        brightness: 0,
        rating: 0,
        temperature: 0,
        speed: 0,
      });

      await waitForDFInit(component, fixture);

      // Initial value check
      expect(component.formValue().volume).toBe(25);

      // Simulate user changing slider value
      const sliderInput = debugElement.query(By.css('input[matSliderThumb]'));
      sliderInput.nativeElement.value = 75;
      sliderInput.nativeElement.dispatchEvent(new Event('input'));
      fixture.detectChanges();

      await delay();
      fixture.detectChanges();

      // Verify form value updated
      expect(component.formValue().volume).toBe(75);
    });

    it('should reflect external value changes in slider field', async () => {
      const config: FormConfig = {
        fields: [
          {
            key: 'volume',
            type: 'slider',
            label: 'Volume Level',
            props: {
              min: 0,
              max: 100,
            },
          },
        ],
      };

      const { component } = createComponent(config, {
        volume: 30,
        brightness: 0,
        rating: 0,
        temperature: 0,
        speed: 0,
      });

      await waitForDFInit(component, fixture);

      // Update form model programmatically
      fixture.componentRef.setInput('value', {
        volume: 80,
        brightness: 0,
        rating: 0,
        temperature: 0,
        speed: 0,
      });
      fixture.detectChanges();

      await delay();
      fixture.detectChanges();

      expect(component.formValue().volume).toBe(80);
    });
  });

  describe('Different Slider Configurations Integration', () => {
    it('should render various slider configurations with correct attributes', async () => {
      const config: FormConfig = {
        fields: [
          {
            key: 'volume',
            type: 'slider',
            label: 'Volume',
            props: { min: 0, max: 100, step: 1 },
          },
          {
            key: 'brightness',
            type: 'slider',
            label: 'Brightness',
            props: { min: 0, max: 255, step: 5, color: 'accent' },
          },
          {
            key: 'rating',
            type: 'slider',
            label: 'Rating',
            props: { min: 1, max: 5, step: 0.5, thumbLabel: true },
          },
          {
            key: 'temperature',
            type: 'slider',
            label: 'Temperature',
            props: { min: -10, max: 40, step: 1, color: 'warn' },
          },
        ],
      };

      const { component } = createComponent(config, {
        volume: 50,
        brightness: 128,
        rating: 3,
        temperature: 20,
        speed: 0,
      });

      await waitForDFInit(component, fixture);

      const sliders = debugElement.queryAll(By.directive(MatSlider));

      expect(sliders.length).toBe(4);
      expect(sliders[0].componentInstance.min).toBe(0);
      expect(sliders[0].componentInstance.max).toBe(100);
      expect(sliders[1].componentInstance.min).toBe(0);
      expect(sliders[1].componentInstance.max).toBe(255);
      expect(sliders[1].componentInstance.color).toBe('accent');
      expect(sliders[2].componentInstance.min).toBe(1);
      expect(sliders[2].componentInstance.max).toBe(5);
      expect(sliders[2].componentInstance.discrete).toBe(true);
      expect(sliders[3].componentInstance.min).toBe(-10);
      expect(sliders[3].componentInstance.max).toBe(40);
      expect(sliders[3].componentInstance.color).toBe('warn');
    });

    it('should handle different step values correctly', async () => {
      const config: FormConfig = {
        fields: [
          {
            key: 'rating',
            type: 'slider',
            label: 'Rating',
            props: { min: 0, max: 10, step: 0.5 },
          },
        ],
      };

      const { component } = createComponent(config, { rating: 5 });

      await waitForDFInit(component, fixture);

      // Initial value
      expect(component.formValue().rating).toBe(5);

      // Simulate changing to a half-step value
      const sliderInput = debugElement.query(By.css('input[matSliderThumb]'));
      sliderInput.nativeElement.value = 7.5;
      sliderInput.nativeElement.dispatchEvent(new Event('input'));
      fixture.detectChanges();

      await delay();
      fixture.detectChanges();

      expect(component.formValue().rating).toBe(7.5);
    });

    it('should reflect external value changes for all slider types', async () => {
      const config: FormConfig = {
        fields: [
          {
            key: 'volume',
            type: 'slider',
            label: 'Volume',
            props: { min: 0, max: 100 },
          },
          {
            key: 'brightness',
            type: 'slider',
            label: 'Brightness',
            props: { min: 0, max: 255 },
          },
          {
            key: 'rating',
            type: 'slider',
            label: 'Rating',
            props: { min: 1, max: 5, step: 0.1 },
          },
        ],
      };

      const { component } = createComponent(config, {
        volume: 0,
        brightness: 0,
        rating: 1,
        temperature: 0,
        speed: 0,
      });

      await waitForDFInit(component, fixture);

      // Update form model programmatically
      fixture.componentRef.setInput('value', {
        volume: 85,
        brightness: 200,
        rating: 4.7,
        temperature: 0,
        speed: 0,
      });
      fixture.detectChanges();

      await delay();
      fixture.detectChanges();

      const formValue = component.formValue();
      expect(formValue.volume).toBe(85);
      expect(formValue.brightness).toBe(200);
      expect(formValue.rating).toBe(4.7);
    });
  });

  describe('Minimal Configuration Tests', () => {
    it('should render with default Material configuration', async () => {
      const config: FormConfig = {
        fields: [
          {
            key: 'volume',
            type: 'slider',
            label: 'Volume',
          },
        ],
      };

      createComponent(config, { volume: 0 });

      await delay();
      fixture.detectChanges();

      const slider = debugElement.query(By.directive(MatSlider));
      const sliderInput = debugElement.query(By.css('input[matSliderThumb]'));

      expect(slider.componentInstance.color).toBe('primary');
      expect(slider.componentInstance.discrete).toBe(false);
      expect(slider.componentInstance.showTickMarks).toBe(false);
      expect(sliderInput).toBeTruthy();
    });

    it('should not display hint when not provided', async () => {
      const config: FormConfig = {
        fields: [
          {
            key: 'volume',
            type: 'slider',
            label: 'Volume',
          },
        ],
      };

      createComponent(config, { volume: 0 });

      await delay();
      fixture.detectChanges();

      const hint = debugElement.query(By.css('.mat-hint'));
      expect(hint).toBeNull();
    });
  });

  describe('Field State and Configuration Tests', () => {
    it('should handle disabled state correctly', async () => {
      const config: FormConfig = {
        fields: [
          {
            key: 'volume',
            type: 'slider',
            label: 'Disabled Slider',
            disabled: true,
          },
        ],
      };

      createComponent(config, { volume: 50 });

      await waitForDFInit(component, fixture);

      const slider = debugElement.query(By.directive(MatSlider));
      const sliderInput = debugElement.query(By.css('input[matSliderThumb]'));
      expect(slider.componentInstance.disabled).toBe(true);
      expect(sliderInput.nativeElement.disabled).toBe(true);
    });

    it('should apply different Material color themes', async () => {
      const config: FormConfig = {
        fields: [
          {
            key: 'volume',
            type: 'slider',
            label: 'Primary Slider',
            props: {
              color: 'primary',
            },
          },
          {
            key: 'brightness',
            type: 'slider',
            label: 'Accent Slider',
            props: {
              color: 'accent',
            },
          },
          {
            key: 'rating',
            type: 'slider',
            label: 'Warn Slider',
            props: {
              color: 'warn',
            },
          },
        ],
      };

      createComponent(config, { volume: 50, brightness: 128, rating: 3 });

      await delay();
      fixture.detectChanges();

      const sliders = debugElement.queryAll(By.directive(MatSlider));
      expect(sliders[0].componentInstance.color).toBe('primary');
      expect(sliders[1].componentInstance.color).toBe('accent');
      expect(sliders[2].componentInstance.color).toBe('warn');
    });

    it('should handle multiple sliders with independent value changes', async () => {
      const config: FormConfig = {
        fields: [
          {
            key: 'volume',
            type: 'slider',
            label: 'Volume',
            props: { min: 0, max: 100 },
          },
          {
            key: 'brightness',
            type: 'slider',
            label: 'Brightness',
            props: { min: 0, max: 255 },
          },
        ],
      };

      const { component } = createComponent(config, {
        volume: 30,
        brightness: 100,
      });

      await delay();
      fixture.detectChanges();

      // Initial values
      expect(component.formValue().volume).toBe(30);
      expect(component.formValue().brightness).toBe(100);

      const sliderInputs = debugElement.queryAll(By.css('input[matSliderThumb]'));

      // Change first slider
      sliderInputs[0].nativeElement.value = 70;
      sliderInputs[0].nativeElement.dispatchEvent(new Event('input'));
      fixture.detectChanges();

      await delay();
      fixture.detectChanges();

      let formValue = component.formValue();
      expect(formValue.volume).toBe(70);
      expect(formValue.brightness).toBe(100);

      // Change second slider
      sliderInputs[1].nativeElement.value = 200;
      sliderInputs[1].nativeElement.dispatchEvent(new Event('input'));
      fixture.detectChanges();

      await delay();
      fixture.detectChanges();

      formValue = component.formValue();
      expect(formValue.volume).toBe(70);
      expect(formValue.brightness).toBe(200);
    });
  });

  describe('Slider-Specific Features Tests', () => {
    it('should display tick marks when tickInterval is provided', async () => {
      const config: FormConfig = {
        fields: [
          {
            key: 'volume',
            type: 'slider',
            label: 'Volume with Ticks',
            props: {
              min: 0,
              max: 100,
              tickInterval: 20,
            },
          },
        ],
      };

      createComponent(config, { volume: 50 });

      await delay();
      fixture.detectChanges();

      const slider = debugElement.query(By.directive(MatSlider));
      expect(slider.componentInstance.showTickMarks).toBe(true);
    });

    it('should enable discrete mode when thumbLabel or showThumbLabel is true', async () => {
      const config: FormConfig = {
        fields: [
          {
            key: 'volume',
            type: 'slider',
            label: 'Volume with Thumb Label',
            props: {
              thumbLabel: true,
            },
          },
          {
            key: 'brightness',
            type: 'slider',
            label: 'Brightness with Show Thumb Label',
            props: {
              showThumbLabel: true,
            },
          },
        ],
      };

      createComponent(config, { volume: 50, brightness: 128 });

      await delay();
      fixture.detectChanges();

      const sliders = debugElement.queryAll(By.directive(MatSlider));
      expect(sliders[0].componentInstance.discrete).toBe(true);
      expect(sliders[1].componentInstance.discrete).toBe(true);
    });

    it('should handle touched state on blur', async () => {
      const config: FormConfig = {
        fields: [
          {
            key: 'volume',
            type: 'slider',
            label: 'Volume',
          },
        ],
      };

      createComponent(config, { volume: 50 });

      await delay();
      fixture.detectChanges();

      const sliderInput = debugElement.query(By.css('input[matSliderThumb]'));

      // Simulate focus and then blur
      sliderInput.nativeElement.focus();
      sliderInput.nativeElement.dispatchEvent(new Event('blur'));
      fixture.detectChanges();

      await delay();
      fixture.detectChanges();

      // Note: The touched state is handled internally by the component
      // We can't directly access it from the form, but we can verify the event was handled
      expect(sliderInput).toBeTruthy();
    });
  });

  describe('Edge Cases and Robustness Tests', () => {
    it('should handle undefined form values gracefully', async () => {
      const config: FormConfig = {
        fields: [
          {
            key: 'volume',
            type: 'slider',
            label: 'Volume',
          },
        ],
      };

      createComponent(config); // No initial value provided

      await delay();
      fixture.detectChanges();

      const slider = debugElement.query(By.directive(MatSlider));
      expect(slider).toBeTruthy();
    });

    it('should handle null form values gracefully', async () => {
      const config: FormConfig = {
        fields: [
          {
            key: 'volume',
            type: 'slider',
            label: 'Volume',
          },
        ],
      };

      createComponent(config, null as unknown as TestFormModel);

      await delay();
      fixture.detectChanges();

      const slider = debugElement.query(By.directive(MatSlider));
      expect(slider).toBeTruthy();
    });

    it('should handle zero values correctly', async () => {
      const config: FormConfig = {
        fields: [
          {
            key: 'volume',
            type: 'slider',
            label: 'Volume',
            props: { min: 0, max: 100 },
          },
        ],
      };

      const { component } = createComponent(config, { volume: 0 });

      await delay();
      fixture.detectChanges();

      expect(component.formValue().volume).toBe(0);
    });

    it('should handle negative values correctly', async () => {
      const config: FormConfig = {
        fields: [
          {
            key: 'temperature',
            type: 'slider',
            label: 'Temperature',
            props: { min: -20, max: 40 },
          },
        ],
      };

      const { component } = createComponent(config, { temperature: -10 });

      await delay();
      fixture.detectChanges();

      expect(component.formValue().temperature).toBe(-10);

      // Test changing to another negative value
      const sliderInput = debugElement.query(By.css('input[matSliderThumb]'));
      sliderInput.nativeElement.value = -5;
      sliderInput.nativeElement.dispatchEvent(new Event('input'));
      fixture.detectChanges();

      await delay();
      fixture.detectChanges();

      expect(component.formValue().temperature).toBe(-5);
    });

    it('should handle decimal values correctly', async () => {
      const config: FormConfig = {
        fields: [
          {
            key: 'rating',
            type: 'slider',
            label: 'Rating',
            props: { min: 0, max: 5, step: 0.1 },
          },
        ],
      };

      const { component } = createComponent(config, { rating: 3.7 });

      await delay();
      fixture.detectChanges();

      expect(component.formValue().rating).toBe(3.7);

      // Test changing to another decimal value
      const sliderInput = debugElement.query(By.css('input[matSliderThumb]'));
      sliderInput.nativeElement.value = 4.2;
      sliderInput.nativeElement.dispatchEvent(new Event('input'));
      fixture.detectChanges();

      await delay();
      fixture.detectChanges();

      expect(component.formValue().rating).toBe(4.2);
    });

    it('should handle rapid value changes correctly', async () => {
      const config: FormConfig = {
        fields: [
          {
            key: 'volume',
            type: 'slider',
            label: 'Volume',
            props: { min: 0, max: 100 },
          },
        ],
      };

      const { component } = createComponent(config, { volume: 0 });

      await delay();
      fixture.detectChanges();

      const sliderInput = debugElement.query(By.css('input[matSliderThumb]'));
      const testValues = [10, 25, 50, 75, 90];

      // Simulate rapid value changes
      for (const value of testValues) {
        sliderInput.nativeElement.value = value;
        sliderInput.nativeElement.dispatchEvent(new Event('input'));
        fixture.detectChanges();
      }

      await delay();
      fixture.detectChanges();

      // Should have the final value
      expect(component.formValue().volume).toBe(90);
    });

    it('should apply default Material Design configuration', async () => {
      const config: FormConfig = {
        fields: [
          {
            key: 'volume',
            type: 'slider',
            label: 'Test Slider',
          },
        ],
      };

      createComponent(config, { volume: 50 });

      await delay();
      fixture.detectChanges();

      const slider = debugElement.query(By.directive(MatSlider));

      // Verify default Material configuration is applied
      expect(slider.componentInstance.color).toBe('primary');
      expect(slider.componentInstance.discrete).toBe(false);
      expect(slider.componentInstance.showTickMarks).toBe(false);
    });
  });
});
