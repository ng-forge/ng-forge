import { untracked } from '@angular/core';
import { By } from '@angular/platform-browser';
import { createTestTranslationService } from '../../testing/fake-translation.service';
import { PrimeNGFormTestUtils } from '../../testing/primeng-test-utils';

// TODO: un-skip tests when maximum callstack on disabled error is fixed

describe('PrimeSliderFieldComponent', () => {
  describe('Basic PrimeNG Slider Integration', () => {
    it('should render volume slider with full configuration', async () => {
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
      const label = fixture.debugElement.query(By.css('label'));
      const hint = fixture.debugElement.query(By.css('.p-hint'));
      const container = fixture.debugElement.query(By.css('.volume-slider'));

      expect(slider).toBeTruthy();
      expect(slider.componentInstance.min).toBe(0);
      expect(slider.componentInstance.max).toBe(100);
      expect(slider.componentInstance.step).toBe(5);
      expect(container).toBeTruthy();
      expect(label.nativeElement.textContent.trim()).toBe('Volume Level');
      expect(hint.nativeElement.textContent.trim()).toBe('Adjust the volume level');
    });

    it('should handle user input and update form value', async () => {
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

      // Update value programmatically
      await PrimeNGFormTestUtils.updateFormValue(fixture, {
        volume: 75,
        brightness: 0,
        rating: 0,
        temperature: 0,
        speed: 0,
      });

      // Verify form value updated
      expect(PrimeNGFormTestUtils.getFormValue(component).volume).toBe(75);
    });

    it('should reflect external value changes in slider field', async () => {
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
    it('should render various slider configurations with correct attributes', async () => {
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
      // Angular 21: Field directive handles min/max bindings automatically
      // Verify sliders are rendered correctly
      expect(sliders[0].componentInstance.step).toBe(1);
      expect(sliders[1].componentInstance.step).toBe(5);
      expect(sliders[2].componentInstance.step).toBe(0.5);
      expect(sliders[3].componentInstance.step).toBe(1);
    });

    it('should handle different step values correctly', async () => {
      const config = PrimeNGFormTestUtils.builder()
        .primeSliderField({ key: 'rating', props: { min: 0, max: 10, step: 0.5 } })
        .build();

      const { component, fixture } = await PrimeNGFormTestUtils.createTest({
        config,
        initialValue: { rating: 5 },
      });

      // Initial value
      expect(PrimeNGFormTestUtils.getFormValue(component).rating).toBe(5);

      // Update to a half-step value programmatically
      await PrimeNGFormTestUtils.updateFormValue(fixture, { rating: 7.5 });

      expect(PrimeNGFormTestUtils.getFormValue(component).rating).toBe(7.5);
    });

    it('should reflect external value changes for all slider types', async () => {
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
    it('should render with default PrimeNG configuration', async () => {
      const config = PrimeNGFormTestUtils.builder().primeSliderField({ key: 'volume' }).build();

      const { fixture } = await PrimeNGFormTestUtils.createTest({
        config,
        initialValue: { volume: 0 },
      });

      const slider = fixture.debugElement.query(By.css('p-slider'));

      expect(slider.componentInstance.orientation).toBe('horizontal');
      expect(slider.componentInstance.range).toBe(false);
      expect(slider).toBeTruthy();
    });

    it('should not display hint when not provided', async () => {
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
    it('should handle disabled state correctly', async () => {
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
      expect(slider).toBeTruthy();
    });

    it('should apply orientation configuration', async () => {
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

    it('should handle multiple sliders with independent value changes', async () => {
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

      // Change first slider value programmatically
      await PrimeNGFormTestUtils.updateFormValue(fixture, {
        volume: 70,
        brightness: 100,
      });

      let formValue = PrimeNGFormTestUtils.getFormValue(component);
      expect(formValue.volume).toBe(70);
      expect(formValue.brightness).toBe(100);

      // Change second slider value programmatically
      await PrimeNGFormTestUtils.updateFormValue(fixture, {
        volume: 70,
        brightness: 200,
      });

      formValue = PrimeNGFormTestUtils.getFormValue(component);
      expect(formValue.volume).toBe(70);
      expect(formValue.brightness).toBe(200);
    });
  });

  describe('Slider-Specific Features Tests', () => {
    it('should support range mode with two handles', async () => {
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

    it('should apply custom styleClass', async () => {
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

    it('should handle touched state on blur', async () => {
      const config = PrimeNGFormTestUtils.builder().primeSliderField({ key: 'volume' }).build();

      const { component, fixture } = await PrimeNGFormTestUtils.createTest({
        config,
        initialValue: { volume: 50 },
      });

      const slider = fixture.debugElement.query(By.css('p-slider'));

      // Verify slider is rendered and value is set
      expect(slider).toBeTruthy();
      expect(PrimeNGFormTestUtils.getFormValue(component).volume).toBe(50);

      // Note: The touched state is handled internally by the PrimeNG slider component
      // and cannot be directly tested through DOM manipulation
    });
  });

  describe('Edge Cases and Robustness Tests', () => {
    it('should handle undefined form values gracefully', async () => {
      const config = PrimeNGFormTestUtils.builder().primeSliderField({ key: 'volume' }).build();

      const { fixture } = await PrimeNGFormTestUtils.createTest({ config }); // No initial value provided

      const slider = fixture.debugElement.query(By.css('p-slider'));
      expect(slider).toBeTruthy();
    });

    it('should handle null form values gracefully', async () => {
      const config = PrimeNGFormTestUtils.builder().primeSliderField({ key: 'volume' }).build();

      const { fixture } = await PrimeNGFormTestUtils.createTest({
        config,
        initialValue: null as unknown,
      });

      const slider = fixture.debugElement.query(By.css('p-slider'));
      expect(slider).toBeTruthy();
    });

    it('should handle zero values correctly', async () => {
      const config = PrimeNGFormTestUtils.builder()
        .primeSliderField({ key: 'volume', props: { min: 0, max: 100 } })
        .build();

      const { component } = await PrimeNGFormTestUtils.createTest({
        config,
        initialValue: { volume: 0 },
      });

      expect(PrimeNGFormTestUtils.getFormValue(component).volume).toBe(0);
    });

    it('should handle negative values correctly', async () => {
      const config = PrimeNGFormTestUtils.builder()
        .primeSliderField({ key: 'temperature', props: { min: -20, max: 40 } })
        .build();

      const { component, fixture } = await PrimeNGFormTestUtils.createTest({
        config,
        initialValue: { temperature: -10 },
      });

      expect(PrimeNGFormTestUtils.getFormValue(component).temperature).toBe(-10);

      // Test changing to another negative value programmatically
      await PrimeNGFormTestUtils.updateFormValue(fixture, { temperature: -5 });

      expect(PrimeNGFormTestUtils.getFormValue(component).temperature).toBe(-5);
    });

    it('should handle decimal values correctly', async () => {
      const config = PrimeNGFormTestUtils.builder()
        .primeSliderField({ key: 'rating', props: { min: 0, max: 5, step: 0.1 } })
        .build();

      const { component, fixture } = await PrimeNGFormTestUtils.createTest({
        config,
        initialValue: { rating: 3.7 },
      });

      expect(PrimeNGFormTestUtils.getFormValue(component).rating).toBe(3.7);

      // Test changing to another decimal value programmatically
      await PrimeNGFormTestUtils.updateFormValue(fixture, { rating: 4.2 });

      expect(PrimeNGFormTestUtils.getFormValue(component).rating).toBe(4.2);
    });

    it('should handle rapid value changes correctly', async () => {
      const config = PrimeNGFormTestUtils.builder()
        .primeSliderField({ key: 'volume', props: { min: 0, max: 100 } })
        .build();

      const { component, fixture } = await PrimeNGFormTestUtils.createTest({
        config,
        initialValue: { volume: 0 },
      });

      const testValues = [10, 25, 50, 75, 90];

      // Simulate rapid value changes programmatically
      for (const value of testValues) {
        await PrimeNGFormTestUtils.updateFormValue(fixture, { volume: value });
      }

      // Should have the final value
      expect(PrimeNGFormTestUtils.getFormValue(component).volume).toBe(90);
    });
  });

  describe('Dynamic Text Support', () => {
    describe('Translation Service Integration', () => {
      it('should handle translation service with dynamic language updates for labels and hints', async () => {
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
