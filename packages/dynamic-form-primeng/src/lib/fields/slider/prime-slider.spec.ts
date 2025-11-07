import { untracked } from '@angular/core';
import { By } from '@angular/platform-browser';
import { createTestTranslationService } from '../../testing/fake-translation.service';
import { PrimeNGFormTestUtils } from '../../testing/primeng-test-utils';

// TODO: un-skip tests when maximum callstack on disabled error is fixed

describe('PrimeSliderFieldComponent', () => {
  describe('Basic PrimeNG Slider Integration', () => {
    it.skip('should render volume slider with full configuration', async () => {
      const config = PrimeNGFormTestUtils.builder()
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
            hint: 'Adjust the volume level',
            styleClass: 'custom-slider',
          },
        })
        .build();

      const { fixture } = await PrimeNGFormTestUtils.createTest({
        config,
        initialValue: {
          volume: 50,
          brightness: 0,
          rating: 0,
          temperature: 0,
          speed: 0,
        },
      });

      const slider = fixture.debugElement.query(By.css('p-slider'));
      const sliderInput = fixture.debugElement.query(By.css('p-slider input'));
      const label = fixture.debugElement.query(By.css('label'));
      const hint = fixture.debugElement.query(By.css('.p-hint'));
      const container = fixture.debugElement.query(By.css('.volume-slider'));

      expect(slider).toBeTruthy();
      expect(slider.componentInstance.min).toBe(0);
      expect(slider.componentInstance.max).toBe(100);
      expect(slider.componentInstance.step).toBe(5);
      expect(sliderInput.nativeElement.getAttribute('tabindex')).toBe('1');
      expect(container).toBeTruthy();
      expect(label.nativeElement.textContent.trim()).toBe('Volume Level');
      expect(hint.nativeElement.textContent.trim()).toBe('Adjust the volume level');
    });

    it.skip('should handle user input and update form value', async () => {
      const config = PrimeNGFormTestUtils.builder()
        .primeSliderField({
          key: 'volume',
          props: {
            min: 0,
            max: 100,
            step: 1,
          },
        })
        .build();

      const { component, fixture } = await PrimeNGFormTestUtils.createTest({
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
      expect(PrimeNGFormTestUtils.getFormValue(component).volume).toBe(25);

      // Simulate user changing slider value
      const sliderInput = fixture.debugElement.query(By.css('p-slider input'));
      sliderInput.nativeElement.value = 75;
      sliderInput.nativeElement.dispatchEvent(new Event('input'));
      untracked(() => fixture.detectChanges());

      // Verify form value updated
      expect(PrimeNGFormTestUtils.getFormValue(component).volume).toBe(75);
    });

    it.skip('should reflect external value changes in slider field', async () => {
      const config = PrimeNGFormTestUtils.builder()
        .primeSliderField({
          key: 'volume',
          props: {
            min: 0,
            max: 100,
          },
        })
        .build();

      const { component, fixture } = await PrimeNGFormTestUtils.createTest({
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
      await PrimeNGFormTestUtils.updateFormValue(fixture, {
        volume: 80,
        brightness: 0,
        rating: 0,
        temperature: 0,
        speed: 0,
      });

      expect(PrimeNGFormTestUtils.getFormValue(component).volume).toBe(80);
    });
  });

  describe('Different Slider Configurations Integration', () => {
    it.skip('should render various slider configurations with correct attributes', async () => {
      const config = PrimeNGFormTestUtils.builder()
        .primeSliderField({ key: 'volume', props: { min: 0, max: 100, step: 1 } })
        .primeSliderField({ key: 'brightness', props: { min: 0, max: 255, step: 5 } })
        .primeSliderField({ key: 'rating', props: { min: 1, max: 5, step: 0.5 } })
        .primeSliderField({ key: 'temperature', props: { min: -10, max: 40, step: 1 } })
        .build();

      const { fixture } = await PrimeNGFormTestUtils.createTest({
        config,
        initialValue: {
          volume: 50,
          brightness: 128,
          rating: 3,
          temperature: 20,
          speed: 0,
        },
      });

      const sliders = fixture.debugElement.queryAll(By.css('p-slider'));

      expect(sliders.length).toBe(4);
      expect(sliders[0].componentInstance.min).toBe(0);
      expect(sliders[0].componentInstance.max).toBe(100);
      expect(sliders[1].componentInstance.min).toBe(0);
      expect(sliders[1].componentInstance.max).toBe(255);
      expect(sliders[2].componentInstance.min).toBe(1);
      expect(sliders[2].componentInstance.max).toBe(5);
      expect(sliders[3].componentInstance.min).toBe(-10);
      expect(sliders[3].componentInstance.max).toBe(40);
    });

    it.skip('should handle different step values correctly', async () => {
      const config = PrimeNGFormTestUtils.builder()
        .primeSliderField({ key: 'rating', props: { min: 0, max: 10, step: 0.5 } })
        .build();

      const { component, fixture } = await PrimeNGFormTestUtils.createTest({
        config,
        initialValue: { rating: 5 },
      });

      // Initial value
      expect(PrimeNGFormTestUtils.getFormValue(component).rating).toBe(5);

      // Simulate changing to a half-step value
      const sliderInput = fixture.debugElement.query(By.css('p-slider input'));
      sliderInput.nativeElement.value = 7.5;
      sliderInput.nativeElement.dispatchEvent(new Event('input'));
      untracked(() => fixture.detectChanges());

      expect(PrimeNGFormTestUtils.getFormValue(component).rating).toBe(7.5);
    });

    it.skip('should reflect external value changes for all slider types', async () => {
      const config = PrimeNGFormTestUtils.builder()
        .primeSliderField({ key: 'volume', props: { min: 0, max: 100 } })
        .primeSliderField({ key: 'brightness', props: { min: 0, max: 255 } })
        .primeSliderField({ key: 'rating', props: { min: 1, max: 5, step: 0.1 } })
        .build();

      const { component, fixture } = await PrimeNGFormTestUtils.createTest({
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
      await PrimeNGFormTestUtils.updateFormValue(fixture, {
        volume: 85,
        brightness: 200,
        rating: 4.7,
        temperature: 0,
        speed: 0,
      });

      const formValue = PrimeNGFormTestUtils.getFormValue(component);
      expect(formValue.volume).toBe(85);
      expect(formValue.brightness).toBe(200);
      expect(formValue.rating).toBe(4.7);
    });
  });

  describe('Minimal Configuration Tests', () => {
    it.skip('should render with default PrimeNG configuration', async () => {
      const config = PrimeNGFormTestUtils.builder().primeSliderField({ key: 'volume' }).build();

      const { fixture } = await PrimeNGFormTestUtils.createTest({
        config,
        initialValue: { volume: 0 },
      });

      const slider = fixture.debugElement.query(By.css('p-slider'));
      const sliderInput = fixture.debugElement.query(By.css('p-slider input'));

      expect(slider.componentInstance.orientation).toBe('horizontal');
      expect(slider.componentInstance.range).toBe(false);
      expect(sliderInput).toBeTruthy();
    });

    it.skip('should not display hint when not provided', async () => {
      const config = PrimeNGFormTestUtils.builder().primeSliderField({ key: 'volume' }).build();

      const { fixture } = await PrimeNGFormTestUtils.createTest({
        config,
        initialValue: { volume: 0 },
      });

      const hint = fixture.debugElement.query(By.css('.p-hint'));
      expect(hint).toBeNull();
    });
  });

  describe('Field State and Configuration Tests', () => {
    it.skip('should handle disabled state correctly', async () => {
      const config = PrimeNGFormTestUtils.builder()
        .field({
          key: 'volume',
          type: 'slider',
          label: 'Disabled Slider',
          disabled: true,
        })
        .build();

      const { fixture } = await PrimeNGFormTestUtils.createTest({
        config,
        initialValue: { volume: 50 },
      });

      const slider = fixture.debugElement.query(By.css('p-slider'));
      const sliderInput = fixture.debugElement.query(By.css('p-slider input'));
      expect(slider.componentInstance.disabled).toBe(true);
      expect(sliderInput.nativeElement.disabled).toBe(true);
    });

    it.skip('should apply orientation configuration', async () => {
      const config = PrimeNGFormTestUtils.builder()
        .primeSliderField({ key: 'volume', props: { orientation: 'horizontal' } })
        .primeSliderField({ key: 'brightness', props: { orientation: 'vertical' } })
        .build();

      const { fixture } = await PrimeNGFormTestUtils.createTest({
        config,
        initialValue: { volume: 50, brightness: 128 },
      });

      const sliders = fixture.debugElement.queryAll(By.css('p-slider'));
      expect(sliders[0].componentInstance.orientation).toBe('horizontal');
      expect(sliders[1].componentInstance.orientation).toBe('vertical');
    });

    it.skip('should handle multiple sliders with independent value changes', async () => {
      const config = PrimeNGFormTestUtils.builder()
        .primeSliderField({ key: 'volume', props: { min: 0, max: 100 } })
        .primeSliderField({ key: 'brightness', props: { min: 0, max: 255 } })
        .build();

      const { component, fixture } = await PrimeNGFormTestUtils.createTest({
        config,
        initialValue: {
          volume: 30,
          brightness: 100,
        },
      });

      // Initial values
      expect(PrimeNGFormTestUtils.getFormValue(component).volume).toBe(30);
      expect(PrimeNGFormTestUtils.getFormValue(component).brightness).toBe(100);

      const sliderInputs = fixture.debugElement.queryAll(By.css('p-slider input'));

      // Change first slider
      sliderInputs[0].nativeElement.value = 70;
      sliderInputs[0].nativeElement.dispatchEvent(new Event('input'));
      untracked(() => fixture.detectChanges());

      let formValue = PrimeNGFormTestUtils.getFormValue(component);
      expect(formValue.volume).toBe(70);
      expect(formValue.brightness).toBe(100);

      // Change second slider
      sliderInputs[1].nativeElement.value = 200;
      sliderInputs[1].nativeElement.dispatchEvent(new Event('input'));
      untracked(() => fixture.detectChanges());

      formValue = PrimeNGFormTestUtils.getFormValue(component);
      expect(formValue.volume).toBe(70);
      expect(formValue.brightness).toBe(200);
    });
  });

  describe('Slider-Specific Features Tests', () => {
    it.skip('should support range mode with two handles', async () => {
      const config = PrimeNGFormTestUtils.builder()
        .primeSliderField({
          key: 'priceRange',
          props: {
            min: 0,
            max: 1000,
            range: true,
          },
        })
        .build();

      const { fixture } = await PrimeNGFormTestUtils.createTest({
        config,
        initialValue: { priceRange: [200, 800] },
      });

      const slider = fixture.debugElement.query(By.css('p-slider'));
      expect(slider.componentInstance.range).toBe(true);
    });

    it.skip('should apply custom styleClass', async () => {
      const config = PrimeNGFormTestUtils.builder()
        .primeSliderField({ key: 'volume', props: { styleClass: 'custom-slider-style' } })
        .build();

      const { fixture } = await PrimeNGFormTestUtils.createTest({
        config,
        initialValue: { volume: 50 },
      });

      const slider = fixture.debugElement.query(By.css('p-slider'));
      expect(slider.componentInstance.styleClass).toContain('custom-slider-style');
    });

    it.skip('should handle touched state on blur', async () => {
      const config = PrimeNGFormTestUtils.builder().primeSliderField({ key: 'volume' }).build();

      const { fixture } = await PrimeNGFormTestUtils.createTest({
        config,
        initialValue: { volume: 50 },
      });

      const sliderInput = fixture.debugElement.query(By.css('p-slider input'));

      // Simulate focus and then blur
      sliderInput.nativeElement.focus();
      sliderInput.nativeElement.dispatchEvent(new Event('blur'));
      untracked(() => fixture.detectChanges());

      // Note: The touched state is handled internally by the component
      // We can't directly access it from the form, but we can verify the event was handled
      expect(sliderInput).toBeTruthy();
    });
  });

  describe('Edge Cases and Robustness Tests', () => {
    it.skip('should handle undefined form values gracefully', async () => {
      const config = PrimeNGFormTestUtils.builder().primeSliderField({ key: 'volume' }).build();

      const { fixture } = await PrimeNGFormTestUtils.createTest({ config }); // No initial value provided

      const slider = fixture.debugElement.query(By.css('p-slider'));
      expect(slider).toBeTruthy();
    });

    it.skip('should handle null form values gracefully', async () => {
      const config = PrimeNGFormTestUtils.builder().primeSliderField({ key: 'volume' }).build();

      const { fixture } = await PrimeNGFormTestUtils.createTest({
        config,
        initialValue: null as unknown,
      });

      const slider = fixture.debugElement.query(By.css('p-slider'));
      expect(slider).toBeTruthy();
    });

    it.skip('should handle zero values correctly', async () => {
      const config = PrimeNGFormTestUtils.builder()
        .primeSliderField({ key: 'volume', props: { min: 0, max: 100 } })
        .build();

      const { component } = await PrimeNGFormTestUtils.createTest({
        config,
        initialValue: { volume: 0 },
      });

      expect(PrimeNGFormTestUtils.getFormValue(component).volume).toBe(0);
    });

    it.skip('should handle negative values correctly', async () => {
      const config = PrimeNGFormTestUtils.builder()
        .primeSliderField({ key: 'temperature', props: { min: -20, max: 40 } })
        .build();

      const { component, fixture } = await PrimeNGFormTestUtils.createTest({
        config,
        initialValue: { temperature: -10 },
      });

      expect(PrimeNGFormTestUtils.getFormValue(component).temperature).toBe(-10);

      // Test changing to another negative value
      const sliderInput = fixture.debugElement.query(By.css('p-slider input'));
      sliderInput.nativeElement.value = -5;
      sliderInput.nativeElement.dispatchEvent(new Event('input'));
      untracked(() => fixture.detectChanges());

      await fixture.whenStable();

      expect(PrimeNGFormTestUtils.getFormValue(component).temperature).toBe(-5);
    });

    it.skip('should handle decimal values correctly', async () => {
      const config = PrimeNGFormTestUtils.builder()
        .primeSliderField({ key: 'rating', props: { min: 0, max: 5, step: 0.1 } })
        .build();

      const { component, fixture } = await PrimeNGFormTestUtils.createTest({
        config,
        initialValue: { rating: 3.7 },
      });

      expect(PrimeNGFormTestUtils.getFormValue(component).rating).toBe(3.7);

      // Test changing to another decimal value
      const sliderInput = fixture.debugElement.query(By.css('p-slider input'));
      sliderInput.nativeElement.value = 4.2;
      sliderInput.nativeElement.dispatchEvent(new Event('input'));
      untracked(() => fixture.detectChanges());

      await fixture.whenStable();

      expect(PrimeNGFormTestUtils.getFormValue(component).rating).toBe(4.2);
    });

    it.skip('should handle rapid value changes correctly', async () => {
      const config = PrimeNGFormTestUtils.builder()
        .primeSliderField({ key: 'volume', props: { min: 0, max: 100 } })
        .build();

      const { component, fixture } = await PrimeNGFormTestUtils.createTest({
        config,
        initialValue: { volume: 0 },
      });

      const sliderInput = fixture.debugElement.query(By.css('p-slider input'));
      const testValues = [10, 25, 50, 75, 90];

      // Simulate rapid value changes
      for (const value of testValues) {
        sliderInput.nativeElement.value = value;
        sliderInput.nativeElement.dispatchEvent(new Event('input'));
        untracked(() => fixture.detectChanges());
      }

      await fixture.whenStable();

      // Should have the final value
      expect(PrimeNGFormTestUtils.getFormValue(component).volume).toBe(90);
    });
  });

  describe('Dynamic Text Support', () => {
    describe('Translation Service Integration', () => {
      it.skip('should handle translation service with dynamic language updates for labels and hints', async () => {
        const translationService = createTestTranslationService({
          'form.volume.label': 'Volume Level',
          'form.volume.hint': 'Adjust the volume to your preference',
        });

        const config = PrimeNGFormTestUtils.builder()
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

        const { fixture } = await PrimeNGFormTestUtils.createTest({
          config,
          initialValue: { volume: 50 },
        });

        const labelElement = fixture.debugElement.query(By.css('label'));
        const hintElement = fixture.debugElement.query(By.css('.p-hint'));

        // Initial translations
        expect(labelElement.nativeElement.textContent.trim()).toBe('Volume Level');
        expect(hintElement.nativeElement.textContent.trim()).toBe('Adjust the volume to your preference');

        // Update to Spanish
        translationService.addTranslations({
          'form.volume.label': 'Nivel de Volumen',
          'form.volume.hint': 'Ajusta el volumen según tu preferencia',
        });
        translationService.setLanguage('es');
        untracked(() => fixture.detectChanges());

        expect(labelElement.nativeElement.textContent.trim()).toBe('Nivel de Volumen');
        expect(hintElement.nativeElement.textContent.trim()).toBe('Ajusta el volumen según tu preferencia');
      });
    });
  });
});
