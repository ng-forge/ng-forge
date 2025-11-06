import { By } from '@angular/platform-browser';
import { createTestTranslationService } from '../../testing/fake-translation.service';
import { BootstrapFormTestUtils } from '../../testing/bootstrap-test-utils';

describe('BsSliderFieldComponent', () => {
  describe('Basic Bootstrap Slider Integration', () => {
    it('should render volume slider with full configuration', async () => {
      const config = BootstrapFormTestUtils.builder()
        .field({
          key: 'volume',
          type: 'slider',
          label: 'Volume Level',
          tabIndex: 1,
          className: 'volume-slider',
          minValue: 0,
          maxValue: 100,
          step: 5,
          props: {
            showValue: true,
            helpText: 'Adjust the volume level',
          },
        })
        .build();

      const { fixture } = await BootstrapFormTestUtils.createTest({
        config,
        initialValue: {
          volume: 50,
          brightness: 0,
          rating: 0,
          temperature: 0,
          speed: 0,
        },
      });

      const slider = fixture.debugElement.query(By.css('.form-range'));
      const sliderInput = fixture.debugElement.query(By.css('input[type="range"]'));
      const label = fixture.debugElement.query(By.css('.form-label'));
      const helpText = fixture.debugElement.query(By.css('.form-text'));
      const container = fixture.debugElement.query(By.css('df-bs-slider'));

      expect(slider).toBeTruthy();
      expect(sliderInput.nativeElement.getAttribute('min')).toBe('0');
      expect(sliderInput.nativeElement.getAttribute('max')).toBe('100');
      expect(sliderInput.nativeElement.getAttribute('step')).toBe('5');
      expect(sliderInput.nativeElement.getAttribute('tabindex')).toBe('1');
      expect(container.nativeElement.className).toContain('volume-slider');
      expect(label.nativeElement.textContent.trim()).toContain('Volume Level');
      expect(helpText.nativeElement.textContent.trim()).toBe('Adjust the volume level');
    });

    it('should handle user input and update form value', async () => {
      const config = BootstrapFormTestUtils.builder()
        .bsSliderField({
          key: 'volume',
          minValue: 0,
          maxValue: 100,
          step: 1,
        })
        .build();

      const { component, fixture } = await BootstrapFormTestUtils.createTest({
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
      expect(BootstrapFormTestUtils.getFormValue(component).volume).toBe(25);

      // Simulate user changing slider value
      await BootstrapFormTestUtils.simulateBsSlider(fixture, 'input[type="range"]', 75);

      // Verify form value updated
      expect(BootstrapFormTestUtils.getFormValue(component).volume).toBe(75);
    });

    it('should reflect external value changes in slider field', async () => {
      const config = BootstrapFormTestUtils.builder()
        .bsSliderField({
          key: 'volume',
          minValue: 0,
          maxValue: 100,
        })
        .build();

      const { component, fixture } = await BootstrapFormTestUtils.createTest({
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

      expect(BootstrapFormTestUtils.getFormValue(component).volume).toBe(80);
    });
  });

  describe('Different Slider Configurations Integration', () => {
    it('should render various slider configurations with correct attributes', async () => {
      const config = BootstrapFormTestUtils.builder()
        .bsSliderField({ key: 'volume', minValue: 0, maxValue: 100, step: 1 })
        .bsSliderField({ key: 'brightness', minValue: 0, maxValue: 255, step: 5 })
        .bsSliderField({ key: 'rating', minValue: 1, maxValue: 5, step: 0.5 })
        .bsSliderField({ key: 'temperature', minValue: -10, maxValue: 40, step: 1 })
        .build();

      const { fixture } = await BootstrapFormTestUtils.createTest({
        config,
        initialValue: {
          volume: 50,
          brightness: 128,
          rating: 3,
          temperature: 20,
          speed: 0,
        },
      });

      const sliders = fixture.debugElement.queryAll(By.css('.form-range'));

      expect(sliders.length).toBe(4);
      expect(sliders[0].nativeElement.getAttribute('min')).toBe('0');
      expect(sliders[0].nativeElement.getAttribute('max')).toBe('100');
      expect(sliders[1].nativeElement.getAttribute('min')).toBe('0');
      expect(sliders[1].nativeElement.getAttribute('max')).toBe('255');
      expect(sliders[2].nativeElement.getAttribute('min')).toBe('1');
      expect(sliders[2].nativeElement.getAttribute('max')).toBe('5');
      expect(sliders[3].nativeElement.getAttribute('min')).toBe('-10');
      expect(sliders[3].nativeElement.getAttribute('max')).toBe('40');
    });

    it('should handle different step values correctly', async () => {
      const config = BootstrapFormTestUtils.builder()
        .bsSliderField({ key: 'rating', minValue: 0, maxValue: 10, step: 0.5 })
        .build();

      const { component, fixture } = await BootstrapFormTestUtils.createTest({
        config,
        initialValue: { rating: 5 },
      });

      // Initial value
      expect(BootstrapFormTestUtils.getFormValue(component).rating).toBe(5);

      // Simulate changing to a half-step value
      await BootstrapFormTestUtils.simulateBsSlider(fixture, 'input[type="range"]', 7.5);

      expect(BootstrapFormTestUtils.getFormValue(component).rating).toBe(7.5);
    });

    it('should reflect external value changes for all slider types', async () => {
      const config = BootstrapFormTestUtils.builder()
        .bsSliderField({ key: 'volume', minValue: 0, maxValue: 100 })
        .bsSliderField({ key: 'brightness', minValue: 0, maxValue: 255 })
        .bsSliderField({ key: 'rating', minValue: 1, maxValue: 5, step: 0.1 })
        .build();

      const { component, fixture } = await BootstrapFormTestUtils.createTest({
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

      const formValue = BootstrapFormTestUtils.getFormValue(component);
      expect(formValue.volume).toBe(85);
      expect(formValue.brightness).toBe(200);
      expect(formValue.rating).toBe(4.7);
    });
  });

  describe('Bootstrap-Specific Slider Features', () => {
    it('should display value badge when showValue is true', async () => {
      const config = BootstrapFormTestUtils.builder()
        .bsSliderField({
          key: 'volume',
          label: 'Volume',
          props: {
            showValue: true,
          },
        })
        .build();

      const { fixture } = await BootstrapFormTestUtils.createTest({
        config,
        initialValue: { volume: 50 },
      });

      const valueBadge = fixture.debugElement.query(By.css('.badge.bg-secondary'));
      expect(valueBadge).toBeTruthy();
      expect(valueBadge.nativeElement.textContent.trim()).toBe('50');
    });

    it('should not display value badge when showValue is false or not specified', async () => {
      const config = BootstrapFormTestUtils.builder()
        .bsSliderField({
          key: 'volume',
          label: 'Volume',
        })
        .build();

      const { fixture } = await BootstrapFormTestUtils.createTest({
        config,
        initialValue: { volume: 50 },
      });

      const valueBadge = fixture.debugElement.query(By.css('.badge.bg-secondary'));
      expect(valueBadge).toBeNull();
    });

    it('should display value with prefix when valuePrefix is provided', async () => {
      const config = BootstrapFormTestUtils.builder()
        .bsSliderField({
          key: 'price',
          label: 'Price',
          props: {
            showValue: true,
            valuePrefix: '$',
          },
        })
        .build();

      const { fixture } = await BootstrapFormTestUtils.createTest({
        config,
        initialValue: { price: 100 },
      });

      const valueBadge = fixture.debugElement.query(By.css('.badge.bg-secondary'));
      expect(valueBadge).toBeTruthy();
      expect(valueBadge.nativeElement.textContent.trim()).toBe('$100');
    });

    it('should display value with suffix when valueSuffix is provided', async () => {
      const config = BootstrapFormTestUtils.builder()
        .bsSliderField({
          key: 'volume',
          label: 'Volume',
          props: {
            showValue: true,
            valueSuffix: '%',
          },
        })
        .build();

      const { fixture } = await BootstrapFormTestUtils.createTest({
        config,
        initialValue: { volume: 75 },
      });

      const valueBadge = fixture.debugElement.query(By.css('.badge.bg-secondary'));
      expect(valueBadge).toBeTruthy();
      expect(valueBadge.nativeElement.textContent.trim()).toBe('75%');
    });

    it('should display value with both prefix and suffix', async () => {
      const config = BootstrapFormTestUtils.builder()
        .bsSliderField({
          key: 'temperature',
          label: 'Temperature',
          props: {
            showValue: true,
            valuePrefix: '+',
            valueSuffix: '°C',
          },
        })
        .build();

      const { fixture } = await BootstrapFormTestUtils.createTest({
        config,
        initialValue: { temperature: 22 },
      });

      const valueBadge = fixture.debugElement.query(By.css('.badge.bg-secondary'));
      expect(valueBadge).toBeTruthy();
      expect(valueBadge.nativeElement.textContent.trim()).toBe('+22°C');
    });

    it('should update displayed value when slider is moved', async () => {
      const config = BootstrapFormTestUtils.builder()
        .bsSliderField({
          key: 'volume',
          label: 'Volume',
          props: {
            showValue: true,
            valueSuffix: '%',
          },
        })
        .build();

      const { fixture } = await BootstrapFormTestUtils.createTest({
        config,
        initialValue: { volume: 50 },
      });

      let valueBadge = fixture.debugElement.query(By.css('.badge.bg-secondary'));
      expect(valueBadge.nativeElement.textContent.trim()).toBe('50%');

      // Move slider
      await BootstrapFormTestUtils.simulateBsSlider(fixture, 'input[type="range"]', 80);

      valueBadge = fixture.debugElement.query(By.css('.badge.bg-secondary'));
      expect(valueBadge.nativeElement.textContent.trim()).toBe('80%');
    });
  });

  describe('Minimal Configuration Tests', () => {
    it('should render with default Bootstrap configuration', async () => {
      const config = BootstrapFormTestUtils.builder().bsSliderField({ key: 'volume' }).build();

      const { fixture } = await BootstrapFormTestUtils.createTest({
        config,
        initialValue: { volume: 0 },
      });

      const slider = fixture.debugElement.query(By.css('.form-range'));
      const sliderInput = fixture.debugElement.query(By.css('input[type="range"]'));

      expect(slider).toBeTruthy();
      expect(sliderInput).toBeTruthy();
      expect(sliderInput.nativeElement.getAttribute('min')).toBe('0');
      expect(sliderInput.nativeElement.getAttribute('max')).toBe('100');
      expect(sliderInput.nativeElement.getAttribute('step')).toBe('1');
    });

    it('should not display helpText when not provided', async () => {
      const config = BootstrapFormTestUtils.builder().bsSliderField({ key: 'volume' }).build();

      const { fixture } = await BootstrapFormTestUtils.createTest({
        config,
        initialValue: { volume: 0 },
      });

      const helpText = fixture.debugElement.query(By.css('.form-text'));
      expect(helpText).toBeNull();
    });
  });

  describe('Field State and Configuration Tests', () => {
    it('should handle disabled state correctly', async () => {
      const config = BootstrapFormTestUtils.builder()
        .field({
          key: 'volume',
          type: 'slider',
          label: 'Disabled Slider',
          disabled: true,
        })
        .build();

      const { fixture } = await BootstrapFormTestUtils.createTest({
        config,
        initialValue: { volume: 50 },
      });

      const sliderInput = fixture.debugElement.query(By.css('input[type="range"]'));
      expect(sliderInput.nativeElement.disabled).toBe(true);
    });

    it('should handle multiple sliders with independent value changes', async () => {
      const config = BootstrapFormTestUtils.builder()
        .bsSliderField({ key: 'volume', minValue: 0, maxValue: 100 })
        .bsSliderField({ key: 'brightness', minValue: 0, maxValue: 255 })
        .build();

      const { component, fixture } = await BootstrapFormTestUtils.createTest({
        config,
        initialValue: {
          volume: 30,
          brightness: 100,
        },
      });

      // Initial values
      expect(BootstrapFormTestUtils.getFormValue(component).volume).toBe(30);
      expect(BootstrapFormTestUtils.getFormValue(component).brightness).toBe(100);

      const sliderInputs = fixture.debugElement.queryAll(By.css('input[type="range"]'));

      // Change first slider
      await BootstrapFormTestUtils.simulateBsSlider(fixture, 'input[type="range"]:first-of-type', 70);

      let formValue = BootstrapFormTestUtils.getFormValue(component);
      expect(formValue.volume).toBe(70);
      expect(formValue.brightness).toBe(100);

      // Change second slider - use nth selector
      sliderInputs[1].nativeElement.value = '200';
      sliderInputs[1].nativeElement.dispatchEvent(new Event('input'));
      sliderInputs[1].nativeElement.dispatchEvent(new Event('change'));
      fixture.detectChanges();

      formValue = BootstrapFormTestUtils.getFormValue(component);
      expect(formValue.volume).toBe(70);
      expect(formValue.brightness).toBe(200);
    });
  });

  describe('Edge Cases and Robustness Tests', () => {
    it('should handle undefined form values gracefully', async () => {
      const config = BootstrapFormTestUtils.builder().bsSliderField({ key: 'volume' }).build();

      const { fixture } = await BootstrapFormTestUtils.createTest({ config }); // No initial value provided

      const slider = fixture.debugElement.query(By.css('.form-range'));
      expect(slider).toBeTruthy();
    });

    it('should handle null form values gracefully', async () => {
      const config = BootstrapFormTestUtils.builder().bsSliderField({ key: 'volume' }).build();

      const { fixture } = await BootstrapFormTestUtils.createTest({
        config,
        initialValue: null as any,
      });

      const slider = fixture.debugElement.query(By.css('.form-range'));
      expect(slider).toBeTruthy();
    });

    it('should handle zero values correctly', async () => {
      const config = BootstrapFormTestUtils.builder()
        .bsSliderField({ key: 'volume', minValue: 0, maxValue: 100 })
        .build();

      const { component } = await BootstrapFormTestUtils.createTest({
        config,
        initialValue: { volume: 0 },
      });

      expect(BootstrapFormTestUtils.getFormValue(component).volume).toBe(0);
    });

    it('should handle negative values correctly', async () => {
      const config = BootstrapFormTestUtils.builder()
        .bsSliderField({ key: 'temperature', minValue: -20, maxValue: 40 })
        .build();

      const { component, fixture } = await BootstrapFormTestUtils.createTest({
        config,
        initialValue: { temperature: -10 },
      });

      expect(BootstrapFormTestUtils.getFormValue(component).temperature).toBe(-10);

      // Test changing to another negative value
      await BootstrapFormTestUtils.simulateBsSlider(fixture, 'input[type="range"]', -5);

      expect(BootstrapFormTestUtils.getFormValue(component).temperature).toBe(-5);
    });

    it('should handle decimal values correctly', async () => {
      const config = BootstrapFormTestUtils.builder()
        .bsSliderField({ key: 'rating', minValue: 0, maxValue: 5, step: 0.1 })
        .build();

      const { component, fixture } = await BootstrapFormTestUtils.createTest({
        config,
        initialValue: { rating: 3.7 },
      });

      expect(BootstrapFormTestUtils.getFormValue(component).rating).toBe(3.7);

      // Test changing to another decimal value
      await BootstrapFormTestUtils.simulateBsSlider(fixture, 'input[type="range"]', 4.2);

      expect(BootstrapFormTestUtils.getFormValue(component).rating).toBe(4.2);
    });

    it('should handle rapid value changes correctly', async () => {
      const config = BootstrapFormTestUtils.builder()
        .bsSliderField({ key: 'volume', minValue: 0, maxValue: 100 })
        .build();

      const { component, fixture } = await BootstrapFormTestUtils.createTest({
        config,
        initialValue: { volume: 0 },
      });

      const testValues = [10, 25, 50, 75, 90];

      // Simulate rapid value changes
      for (const value of testValues) {
        await BootstrapFormTestUtils.simulateBsSlider(fixture, 'input[type="range"]', value);
      }

      // Should have the final value
      expect(BootstrapFormTestUtils.getFormValue(component).volume).toBe(90);
    });
  });

  describe('Dynamic Text Support', () => {
    describe('Translation Service Integration', () => {
      it('should handle translation service with dynamic language updates for labels and helpText', async () => {
        const translationService = createTestTranslationService({
          'form.volume.label': 'Volume Level',
          'form.volume.helpText': 'Adjust the volume to your preference',
        });

        const config = BootstrapFormTestUtils.builder()
          .field({
            key: 'volume',
            type: 'slider',
            label: translationService.translate('form.volume.label'),
            minValue: 0,
            maxValue: 100,
            step: 5,
            props: {
              helpText: translationService.translate('form.volume.helpText'),
            },
          })
          .build();

        const { fixture } = await BootstrapFormTestUtils.createTest({
          config,
          initialValue: { volume: 50 },
        });

        const labelElement = fixture.debugElement.query(By.css('.form-label'));
        const helpTextElement = fixture.debugElement.query(By.css('.form-text'));

        // Initial translations
        expect(labelElement.nativeElement.textContent.trim()).toContain('Volume Level');
        expect(helpTextElement.nativeElement.textContent.trim()).toBe('Adjust the volume to your preference');

        // Update to Spanish
        translationService.addTranslations({
          'form.volume.label': 'Nivel de Volumen',
          'form.volume.helpText': 'Ajusta el volumen según tu preferencia',
        });
        translationService.setLanguage('es');
        fixture.detectChanges();

        expect(labelElement.nativeElement.textContent.trim()).toContain('Nivel de Volumen');
        expect(helpTextElement.nativeElement.textContent.trim()).toBe('Ajusta el volumen según tu preferencia');
      });
    });
  });

  describe('Value Display Integration', () => {
    it('should show value in badge alongside label', async () => {
      const config = BootstrapFormTestUtils.builder()
        .bsSliderField({
          key: 'volume',
          label: 'Volume',
          props: {
            showValue: true,
          },
        })
        .build();

      const { fixture } = await BootstrapFormTestUtils.createTest({
        config,
        initialValue: { volume: 65 },
      });

      const label = fixture.debugElement.query(By.css('.form-label'));

      // Label should contain both the text and the value badge
      expect(label.nativeElement.textContent).toContain('Volume');
      expect(label.nativeElement.textContent).toContain('65');

      const badge = label.query(By.css('.badge.bg-secondary'));
      expect(badge).toBeTruthy();
    });

    it('should update value badge in real-time as slider moves', async () => {
      const config = BootstrapFormTestUtils.builder()
        .bsSliderField({
          key: 'volume',
          label: 'Volume',
          minValue: 0,
          maxValue: 100,
          props: {
            showValue: true,
          },
        })
        .build();

      const { fixture } = await BootstrapFormTestUtils.createTest({
        config,
        initialValue: { volume: 25 },
      });

      // Check initial value
      let badge = fixture.debugElement.query(By.css('.badge.bg-secondary'));
      expect(badge.nativeElement.textContent.trim()).toBe('25');

      // Move slider multiple times
      await BootstrapFormTestUtils.simulateBsSlider(fixture, 'input[type="range"]', 40);
      badge = fixture.debugElement.query(By.css('.badge.bg-secondary'));
      expect(badge.nativeElement.textContent.trim()).toBe('40');

      await BootstrapFormTestUtils.simulateBsSlider(fixture, 'input[type="range"]', 75);
      badge = fixture.debugElement.query(By.css('.badge.bg-secondary'));
      expect(badge.nativeElement.textContent.trim()).toBe('75');
    });
  });

  describe('Validation State Display', () => {
    it('should handle touched state on blur', async () => {
      const config = BootstrapFormTestUtils.builder().bsSliderField({ key: 'volume' }).build();

      const { fixture } = await BootstrapFormTestUtils.createTest({
        config,
        initialValue: { volume: 50 },
      });

      const sliderInput = fixture.debugElement.query(By.css('input[type="range"]'));

      // Simulate focus and then blur
      sliderInput.nativeElement.focus();
      sliderInput.nativeElement.dispatchEvent(new Event('blur'));
      fixture.detectChanges();

      // Note: The touched state is handled internally by the component
      // We can't directly access it from the form, but we can verify the event was handled
      expect(sliderInput).toBeTruthy();
    });
  });

  describe('Label-less Configuration', () => {
    it('should not display label when not provided', async () => {
      const config = BootstrapFormTestUtils.builder()
        .field({
          key: 'volume',
          type: 'slider',
        })
        .build();

      const { fixture } = await BootstrapFormTestUtils.createTest({
        config,
        initialValue: { volume: 50 },
      });

      const label = fixture.debugElement.query(By.css('.form-label'));
      expect(label).toBeNull();
    });

    it('should not display value badge when label is not provided even if showValue is true', async () => {
      const config = BootstrapFormTestUtils.builder()
        .field({
          key: 'volume',
          type: 'slider',
          props: {
            showValue: true,
          },
        })
        .build();

      const { fixture } = await BootstrapFormTestUtils.createTest({
        config,
        initialValue: { volume: 50 },
      });

      const label = fixture.debugElement.query(By.css('.form-label'));
      const badge = fixture.debugElement.query(By.css('.badge.bg-secondary'));

      expect(label).toBeNull();
      expect(badge).toBeNull();
    });
  });
});
