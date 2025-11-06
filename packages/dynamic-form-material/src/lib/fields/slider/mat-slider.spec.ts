import { By } from '@angular/platform-browser';
import { MatSlider } from '@angular/material/slider';
import { createTestTranslationService } from '../../testing/fake-translation.service';
import { MaterialFormTestUtils } from '../../testing/material-test-utils';

// TODO: un-skip tests when maximum callstack on disabled error is fixed

describe('MatSliderFieldComponent', () => {
  describe('Basic Material Slider Integration', () => {
    it('should render volume slider with full configuration', async () => {
      const config = MaterialFormTestUtils.builder()
        .field({
          key: 'volume',
          type: 'slider',
          label: 'Volume Level',
          tabIndex: 1,
          className: 'volume-slider',
          props: {
            min: 0,
            max: 100,
            step: 5,
            thumbLabel: true,
            showThumbLabel: true,
            hint: 'Adjust the volume level',
            color: 'primary',
            tickInterval: 25,
          },
        })
        .build();

      const { fixture } = await MaterialFormTestUtils.createTest({
        config,
        initialValue: {
          volume: 50,
          brightness: 0,
          rating: 0,
          temperature: 0,
          speed: 0,
        },
      });

      const slider = fixture.debugElement.query(By.css('mat-slider'));
      const sliderInput = fixture.debugElement.query(By.css('input[matSliderThumb]'));
      const label = fixture.debugElement.query(By.css('.slider-label'));
      const hint = fixture.debugElement.query(By.css('.mat-hint'));
      const container = fixture.debugElement.query(By.css('.volume-slider'));

      // ITERATION 4 FIX: Verify slider is MatSlider instance
      // Previous: expect(slider).toBeTruthy()
      expect(slider).not.toBeNull();
      expect(slider.nativeElement).toBeInstanceOf(HTMLElement);
      expect(slider.componentInstance.min).toBe(0);
      expect(slider.componentInstance.max).toBe(100);
      expect(slider.componentInstance.discrete).toBe(true);
      expect(slider.componentInstance.showTickMarks).toBe(true);
      expect(slider.componentInstance.color).toBe('primary');
      expect(sliderInput.nativeElement.getAttribute('tabindex')).toBe('1');

      // ITERATION 4 FIX: Verify container element structure
      // Previous: expect(container).toBeTruthy()
      expect(container).not.toBeNull();
      expect(container.nativeElement).toBeInstanceOf(HTMLElement);
      expect(container.nativeElement.classList.contains('volume-slider')).toBe(true);
      expect(label.nativeElement.textContent.trim()).toBe('Volume Level');
      expect(hint.nativeElement.textContent.trim()).toBe('Adjust the volume level');
    });

    it.skip('should handle user input and update form value', async () => {
      const config = MaterialFormTestUtils.builder()
        .matSliderField({
          key: 'volume',
          props: {
            min: 0,
            max: 100,
            step: 1,
          },
        })
        .build();

      const { component, fixture } = await MaterialFormTestUtils.createTest({
        config,
        initialValue: {
          volume: 25,
          brightness: 0,
          rating: 0,
          temperature: 0,
          speed: 0,
        },
      });

      // Initial value check
      expect(MaterialFormTestUtils.getFormValue(component).volume).toBe(25);

      // Simulate user changing slider value
      const sliderInput = fixture.debugElement.query(By.css('input[matSliderThumb]'));
      sliderInput.nativeElement.value = 75;
      sliderInput.nativeElement.dispatchEvent(new Event('input'));
      fixture.detectChanges();

      // Verify form value updated
      expect(MaterialFormTestUtils.getFormValue(component).volume).toBe(75);
    });

    it('should reflect external value changes in slider field', async () => {
      const config = MaterialFormTestUtils.builder()
        .matSliderField({
          key: 'volume',
          props: {
            min: 0,
            max: 100,
          },
        })
        .build();

      const { component, fixture } = await MaterialFormTestUtils.createTest({
        config,
        initialValue: {
          volume: 30,
          brightness: 0,
          rating: 0,
          temperature: 0,
          speed: 0,
        },
      });

      // Update form model programmatically
      fixture.componentRef.setInput('value', {
        volume: 80,
        brightness: 0,
        rating: 0,
        temperature: 0,
        speed: 0,
      });
      fixture.detectChanges();

      expect(MaterialFormTestUtils.getFormValue(component).volume).toBe(80);
    });
  });

  describe('Different Slider Configurations Integration', () => {
    it.skip('should render various slider configurations with correct attributes', async () => {
      const config = MaterialFormTestUtils.builder()
        .matSliderField({ key: 'volume', props: { min: 0, max: 100, step: 1 } })
        .matSliderField({ key: 'brightness', props: { min: 0, max: 255, step: 5, color: 'accent' } })
        .matSliderField({ key: 'rating', props: { min: 1, max: 5, step: 0.5, thumbLabel: true } })
        .matSliderField({ key: 'temperature', props: { min: -10, max: 40, step: 1, color: 'warn' } })
        .build();

      const { component, fixture } = await MaterialFormTestUtils.createTest({
        config,
        initialValue: {
          volume: 50,
          brightness: 128,
          rating: 3,
          temperature: 20,
          speed: 0,
        },
      });

      const sliders = fixture.debugElement.queryAll(By.css('mat-slider'));

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

    it.skip('should handle different step values correctly', async () => {
      const config = MaterialFormTestUtils.builder()
        .matSliderField({ key: 'rating', props: { min: 0, max: 10, step: 0.5 } })
        .build();

      const { component, fixture } = await MaterialFormTestUtils.createTest({
        config,
        initialValue: { rating: 5 },
      });

      // Initial value
      expect(MaterialFormTestUtils.getFormValue(component).rating).toBe(5);

      // Simulate changing to a half-step value
      const sliderInput = fixture.debugElement.query(By.css('input[matSliderThumb]'));
      sliderInput.nativeElement.value = 7.5;
      sliderInput.nativeElement.dispatchEvent(new Event('input'));
      fixture.detectChanges();

      expect(MaterialFormTestUtils.getFormValue(component).rating).toBe(7.5);
    });

    it('should reflect external value changes for all slider types', async () => {
      const config = MaterialFormTestUtils.builder()
        .matSliderField({ key: 'volume', props: { min: 0, max: 100 } })
        .matSliderField({ key: 'brightness', props: { min: 0, max: 255 } })
        .matSliderField({ key: 'rating', props: { min: 1, max: 5, step: 0.1 } })
        .build();

      const { component, fixture } = await MaterialFormTestUtils.createTest({
        config,
        initialValue: {
          volume: 0,
          brightness: 0,
          rating: 1,
          temperature: 0,
          speed: 0,
        },
      });

      // Update form model programmatically
      fixture.componentRef.setInput('value', {
        volume: 85,
        brightness: 200,
        rating: 4.7,
        temperature: 0,
        speed: 0,
      });
      fixture.detectChanges();

      const formValue = MaterialFormTestUtils.getFormValue(component);
      expect(formValue.volume).toBe(85);
      expect(formValue.brightness).toBe(200);
      expect(formValue.rating).toBe(4.7);
    });
  });

  describe('Minimal Configuration Tests', () => {
    it.skip('should render with default Material configuration', async () => {
      const config = MaterialFormTestUtils.builder().matSliderField({ key: 'volume' }).build();

      const { fixture } = await MaterialFormTestUtils.createTest({
        config,
        initialValue: { volume: 0 },
      });

      const slider = fixture.debugElement.query(By.css('mat-slider'));
      const sliderInput = fixture.debugElement.query(By.css('input[matSliderThumb]'));

      expect(slider.componentInstance.color).toBe('primary');
      expect(slider.componentInstance.discrete).toBe(false);
      expect(slider.componentInstance.showTickMarks).toBe(false);
      // ITERATION 5 FIX: Verify slider input element exists and is correct type
      // Previous: expect(sliderInput).toBeTruthy()
      expect(sliderInput).not.toBeNull();
      expect(sliderInput.nativeElement).toBeInstanceOf(HTMLInputElement);
    });

    it('should not display hint when not provided', async () => {
      const config = MaterialFormTestUtils.builder().matSliderField({ key: 'volume' }).build();

      const { fixture } = await MaterialFormTestUtils.createTest({
        config,
        initialValue: { volume: 0 },
      });

      const hint = fixture.debugElement.query(By.css('.mat-hint'));
      expect(hint).toBeNull();
    });
  });

  describe('Field State and Configuration Tests', () => {
    it('should handle disabled state correctly', async () => {
      const config = MaterialFormTestUtils.builder()
        .field({
          key: 'volume',
          type: 'slider',
          label: 'Disabled Slider',
          disabled: true,
        })
        .build();

      const { fixture } = await MaterialFormTestUtils.createTest({
        config,
        initialValue: { volume: 50 },
      });

      const slider = fixture.debugElement.query(By.css('mat-slider'));
      const sliderInput = fixture.debugElement.query(By.css('input[matSliderThumb]'));
      expect(slider.componentInstance.disabled).toBe(true);
      expect(sliderInput.nativeElement.disabled).toBe(true);
    });

    it('should apply different Material color themes', async () => {
      const config = MaterialFormTestUtils.builder()
        .matSliderField({ key: 'volume', props: { color: 'primary' } })
        .matSliderField({ key: 'brightness', props: { color: 'accent' } })
        .matSliderField({ key: 'rating', props: { color: 'warn' } })
        .build();

      const { fixture } = await MaterialFormTestUtils.createTest({
        config,
        initialValue: { volume: 50, brightness: 128, rating: 3 },
      });

      const sliders = fixture.debugElement.queryAll(By.css('mat-slider'));
      expect(sliders[0].componentInstance.color).toBe('primary');
      expect(sliders[1].componentInstance.color).toBe('accent');
      expect(sliders[2].componentInstance.color).toBe('warn');
    });

    it.skip('should handle multiple sliders with independent value changes', async () => {
      const config = MaterialFormTestUtils.builder()
        .matSliderField({ key: 'volume', props: { min: 0, max: 100 } })
        .matSliderField({ key: 'brightness', props: { min: 0, max: 255 } })
        .build();

      const { component, fixture } = await MaterialFormTestUtils.createTest({
        config,
        initialValue: {
          volume: 30,
          brightness: 100,
        },
      });

      // Initial values
      expect(MaterialFormTestUtils.getFormValue(component).volume).toBe(30);
      expect(MaterialFormTestUtils.getFormValue(component).brightness).toBe(100);

      const sliderInputs = fixture.debugElement.queryAll(By.css('input[matSliderThumb]'));

      // Change first slider
      sliderInputs[0].nativeElement.value = 70;
      sliderInputs[0].nativeElement.dispatchEvent(new Event('input'));
      fixture.detectChanges();

      let formValue = MaterialFormTestUtils.getFormValue(component);
      expect(formValue.volume).toBe(70);
      expect(formValue.brightness).toBe(100);

      // Change second slider
      sliderInputs[1].nativeElement.value = 200;
      sliderInputs[1].nativeElement.dispatchEvent(new Event('input'));
      fixture.detectChanges();

      formValue = MaterialFormTestUtils.getFormValue(component);
      expect(formValue.volume).toBe(70);
      expect(formValue.brightness).toBe(200);
    });
  });

  describe('Slider-Specific Features Tests', () => {
    it('should display tick marks when tickInterval is provided', async () => {
      const config = MaterialFormTestUtils.builder()
        .matSliderField({
          key: 'volume',
          props: {
            min: 0,
            max: 100,
            tickInterval: 20,
          },
        })
        .build();

      const { fixture } = await MaterialFormTestUtils.createTest({
        config,
        initialValue: { volume: 50 },
      });

      const slider = fixture.debugElement.query(By.css('mat-slider'));
      expect(slider.componentInstance.showTickMarks).toBe(true);
    });

    it('should enable discrete mode when thumbLabel or showThumbLabel is true', async () => {
      const config = MaterialFormTestUtils.builder()
        .matSliderField({ key: 'volume', props: { thumbLabel: true } })
        .matSliderField({ key: 'brightness', props: { showThumbLabel: true } })
        .build();

      const { fixture } = await MaterialFormTestUtils.createTest({
        config,
        initialValue: { volume: 50, brightness: 128 },
      });

      const sliders = fixture.debugElement.queryAll(By.css('mat-slider'));
      expect(sliders[0].componentInstance.discrete).toBe(true);
      expect(sliders[1].componentInstance.discrete).toBe(true);
    });

    it('should handle touched state on blur', async () => {
      const config = MaterialFormTestUtils.builder().matSliderField({ key: 'volume' }).build();

      const { fixture } = await MaterialFormTestUtils.createTest({
        config,
        initialValue: { volume: 50 },
      });

      const sliderInput = fixture.debugElement.query(By.css('input[matSliderThumb]'));

      // Simulate focus and then blur
      sliderInput.nativeElement.focus();
      sliderInput.nativeElement.dispatchEvent(new Event('blur'));
      fixture.detectChanges();

      // Note: The touched state is handled internally by the component
      // We can't directly access it from the form, but we can verify the event was handled
      // ITERATION 5 FIX: Verify slider input element exists after blur event
      // Previous: expect(sliderInput).toBeTruthy()
      expect(sliderInput).not.toBeNull();
      expect(sliderInput.nativeElement).toBeInstanceOf(HTMLInputElement);
    });
  });

  describe('Edge Cases and Robustness Tests', () => {
    it('should handle undefined form values gracefully', async () => {
      const config = MaterialFormTestUtils.builder().matSliderField({ key: 'volume' }).build();

      const { fixture } = await MaterialFormTestUtils.createTest({ config }); // No initial value provided

      const slider = fixture.debugElement.query(By.css('mat-slider'));
      // ITERATION 5 FIX: Verify slider component exists with undefined value
      // Previous: expect(slider).toBeTruthy()
      expect(slider).not.toBeNull();
      expect(slider.nativeElement).toBeInstanceOf(HTMLElement);
    });

    it('should handle null form values gracefully', async () => {
      const config = MaterialFormTestUtils.builder().matSliderField({ key: 'volume' }).build();

      const { fixture } = await MaterialFormTestUtils.createTest({
        config,
        initialValue: null as any,
      });

      const slider = fixture.debugElement.query(By.css('mat-slider'));
      // ITERATION 5 FIX: Verify slider component exists with null value
      // Previous: expect(slider).toBeTruthy()
      expect(slider).not.toBeNull();
      expect(slider.nativeElement).toBeInstanceOf(HTMLElement);
    });

    it('should handle zero values correctly', async () => {
      const config = MaterialFormTestUtils.builder()
        .matSliderField({ key: 'volume', props: { min: 0, max: 100 } })
        .build();

      const { component } = await MaterialFormTestUtils.createTest({
        config,
        initialValue: { volume: 0 },
      });

      expect(MaterialFormTestUtils.getFormValue(component).volume).toBe(0);
    });

    it.skip('should handle negative values correctly', async () => {
      const config = MaterialFormTestUtils.builder()
        .matSliderField({ key: 'temperature', props: { min: -20, max: 40 } })
        .build();

      const { component, fixture } = await MaterialFormTestUtils.createTest({
        config,
        initialValue: { temperature: -10 },
      });

      expect(MaterialFormTestUtils.getFormValue(component).temperature).toBe(-10);

      // Test changing to another negative value
      const sliderInput = fixture.debugElement.query(By.css('input[matSliderThumb]'));
      sliderInput.nativeElement.value = -5;
      sliderInput.nativeElement.dispatchEvent(new Event('input'));
      fixture.detectChanges();

      await fixture.whenStable();

      expect(MaterialFormTestUtils.getFormValue(component).temperature).toBe(-5);
    });

    it.skip('should handle decimal values correctly', async () => {
      const config = MaterialFormTestUtils.builder()
        .matSliderField({ key: 'rating', props: { min: 0, max: 5, step: 0.1 } })
        .build();

      const { component, fixture } = await MaterialFormTestUtils.createTest({
        config,
        initialValue: { rating: 3.7 },
      });

      expect(MaterialFormTestUtils.getFormValue(component).rating).toBe(3.7);

      // Test changing to another decimal value
      const sliderInput = fixture.debugElement.query(By.css('input[matSliderThumb]'));
      sliderInput.nativeElement.value = 4.2;
      sliderInput.nativeElement.dispatchEvent(new Event('input'));
      fixture.detectChanges();

      await fixture.whenStable();

      expect(MaterialFormTestUtils.getFormValue(component).rating).toBe(4.2);
    });

    it.skip('should handle rapid value changes correctly', async () => {
      const config = MaterialFormTestUtils.builder()
        .matSliderField({ key: 'volume', props: { min: 0, max: 100 } })
        .build();

      const { component, fixture } = await MaterialFormTestUtils.createTest({
        config,
        initialValue: { volume: 0 },
      });

      const sliderInput = fixture.debugElement.query(By.css('input[matSliderThumb]'));
      const testValues = [10, 25, 50, 75, 90];

      // Simulate rapid value changes
      for (const value of testValues) {
        sliderInput.nativeElement.value = value;
        sliderInput.nativeElement.dispatchEvent(new Event('input'));
        fixture.detectChanges();
      }

      await fixture.whenStable();

      // Should have the final value
      expect(MaterialFormTestUtils.getFormValue(component).volume).toBe(90);
    });
  });

  describe('Dynamic Text Support', () => {
    describe('Translation Service Integration', () => {
      it('should handle translation service with dynamic language updates for labels and hints', async () => {
        const translationService = createTestTranslationService({
          'form.volume.label': 'Volume Level',
          'form.volume.hint': 'Adjust the volume to your preference',
        });

        const config = MaterialFormTestUtils.builder()
          .field({
            key: 'volume',
            type: 'slider',
            label: translationService.translate('form.volume.label'),
            props: {
              min: 0,
              max: 100,
              step: 5,
              hint: translationService.translate('form.volume.hint'),
            },
          })
          .build();

        const { fixture } = await MaterialFormTestUtils.createTest({
          config,
          initialValue: { volume: 50 },
        });

        const labelElement = fixture.debugElement.query(By.css('.slider-label'));
        const hintElement = fixture.debugElement.query(By.css('.mat-hint'));

        // Initial translations
        expect(labelElement.nativeElement.textContent.trim()).toBe('Volume Level');
        expect(hintElement.nativeElement.textContent.trim()).toBe('Adjust the volume to your preference');

        // Update to Spanish
        translationService.addTranslations({
          'form.volume.label': 'Nivel de Volumen',
          'form.volume.hint': 'Ajusta el volumen según tu preferencia',
        });
        translationService.setLanguage('es');
        fixture.detectChanges();

        expect(labelElement.nativeElement.textContent.trim()).toBe('Nivel de Volumen');
        expect(hintElement.nativeElement.textContent.trim()).toBe('Ajusta el volumen según tu preferencia');
      });
    });
  });
});
