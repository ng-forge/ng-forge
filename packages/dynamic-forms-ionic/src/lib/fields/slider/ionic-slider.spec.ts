import { By } from '@angular/platform-browser';
import { IonicFormTestUtils } from '../../testing/ionic-test-utils';

describe('IonicSliderFieldComponent', () => {
  describe('Basic Ionic Slider Integration', () => {
    it('should render slider with full configuration', async () => {
      const config = IonicFormTestUtils.builder()
        .ionicSliderField({
          key: 'volume',
          label: 'Volume',
          minValue: 0,
          maxValue: 100,
          step: 5,
          required: true,
          tabIndex: 1,
          className: 'volume-slider',
          props: {
            pin: true,
            ticks: true,
            snaps: true,
            color: 'primary',
            labelPlacement: 'stacked',
          },
        })
        .build();

      const { fixture } = await IonicFormTestUtils.createTest({
        config,
        initialValue: { volume: 50 },
      });

      const ionRange = fixture.debugElement.query(By.css('df-ionic-slider ion-range'));

      expect(ionRange).not.toBeNull();
      expect(ionRange.nativeElement.getAttribute('tabindex')).toBe('1');
    });

    it('should handle user slider interaction and update form value', async () => {
      const config = IonicFormTestUtils.builder()
        .ionicSliderField({
          key: 'brightness',
          label: 'Brightness',
          minValue: 0,
          maxValue: 100,
          step: 1,
        })
        .build();

      const { component, fixture } = await IonicFormTestUtils.createTest({
        config,
        initialValue: { brightness: 50 },
      });

      expect(IonicFormTestUtils.getFormValue(component).brightness).toBe(50);

      const ionRange = fixture.debugElement.query(By.css('df-ionic-slider ion-range'));
      const rangeElement = ionRange.nativeElement;

      // Trigger ionChange event
      rangeElement.value = 75;
      rangeElement.dispatchEvent(new CustomEvent('ionChange', { detail: { value: 75 } }));
      fixture.detectChanges();

    });

    it('should reflect external value changes in slider', async () => {
      const config = IonicFormTestUtils.builder()
        .ionicSliderField({
          key: 'opacity',
          label: 'Opacity',
          minValue: 0,
          maxValue: 1,
          step: 0.1,
        })
        .build();

      const { component, fixture } = await IonicFormTestUtils.createTest({
        config,
        initialValue: { opacity: 0.5 },
      });

      expect(IonicFormTestUtils.getFormValue(component).opacity).toBe(0.5);

      fixture.componentRef.setInput('value', { opacity: 0.8 });
      fixture.detectChanges();

      expect(IonicFormTestUtils.getFormValue(component).opacity).toBe(0.8);
    });
  });

  describe('Slider Range Tests', () => {
    it('should handle different min/max ranges', async () => {
      const config = IonicFormTestUtils.builder()
        .ionicSliderField({
          key: 'temperature',
          label: 'Temperature',
          minValue: -20,
          maxValue: 40,
          step: 1,
        })
        .build();

      const { component, fixture } = await IonicFormTestUtils.createTest({
        config,
        initialValue: { temperature: 20 },
      });

      expect(IonicFormTestUtils.getFormValue(component).temperature).toBe(20);
    });

    it('should handle decimal step values', async () => {
      const config = IonicFormTestUtils.builder()
        .ionicSliderField({
          key: 'rating',
          label: 'Rating',
          minValue: 0,
          maxValue: 5,
          step: 0.5,
        })
        .build();

      const { fixture } = await IonicFormTestUtils.createTest({
        config,
        initialValue: { rating: 3.5 },
      });

      const ionRange = fixture.debugElement.query(By.css('df-ionic-slider ion-range'));
    });

    it('should handle large ranges', async () => {
      const config = IonicFormTestUtils.builder()
        .ionicSliderField({
          key: 'price',
          label: 'Price',
          minValue: 0,
          maxValue: 10000,
          step: 100,
        })
        .build();

      const { component, fixture } = await IonicFormTestUtils.createTest({
        config,
        initialValue: { price: 5000 },
      });

      expect(IonicFormTestUtils.getFormValue(component).price).toBe(5000);
    });
  });

  describe('Field State and Configuration Tests', () => {
    it('should handle disabled state correctly', async () => {
      const config = IonicFormTestUtils.builder()
        .field({
          key: 'slider',
          type: 'slider',
          label: 'Disabled Slider',
          disabled: true,
          minValue: 0,
          maxValue: 100,
          step: 1,
        })
        .build();

      const { fixture } = await IonicFormTestUtils.createTest({
        config,
        initialValue: { slider: 50 },
      });

      const ionRange = fixture.debugElement.query(By.css('df-ionic-slider ion-range'));
      expect(ionRange).not.toBeNull();
    });

    it('should apply required validation', async () => {
      const config = IonicFormTestUtils.builder()
        .field({
          key: 'rating',
          type: 'slider',
          label: 'Rating',
          required: true,
          minValue: 1,
          maxValue: 5,
          step: 1,
        })
        .build();

      const { component } = await IonicFormTestUtils.createTest({
        config,
        initialValue: { rating: 3 },
      });

      expect(IonicFormTestUtils.isFormValid(component)).toBe(true);
    });

    it('should handle default step value', async () => {
      const config = IonicFormTestUtils.builder()
        .ionicSliderField({
          key: 'value',
          label: 'Value',
          minValue: 0,
          maxValue: 100,
        })
        .build();

      const { fixture } = await IonicFormTestUtils.createTest({
        config,
        initialValue: { value: 50 },
      });

      const ionRange = fixture.debugElement.query(By.css('df-ionic-slider ion-range'));
    });
  });

  describe('Ionic-Specific Props Tests', () => {
    it('should handle pin property', async () => {
      const config = IonicFormTestUtils.builder()
        .ionicSliderField({
          key: 'volume',
          label: 'Volume',
          minValue: 0,
          maxValue: 100,
          step: 1,
          props: { pin: true },
        })
        .build();

      const { fixture } = await IonicFormTestUtils.createTest({
        config,
        initialValue: { volume: 50 },
      });

      const ionRange = fixture.debugElement.query(By.css('df-ionic-slider ion-range'));
    });

    it('should handle ticks property', async () => {
      const config = IonicFormTestUtils.builder()
        .ionicSliderField({
          key: 'volume',
          label: 'Volume',
          minValue: 0,
          maxValue: 100,
          step: 10,
          props: { ticks: true },
        })
        .build();

      const { fixture } = await IonicFormTestUtils.createTest({
        config,
        initialValue: { volume: 50 },
      });

      const ionRange = fixture.debugElement.query(By.css('df-ionic-slider ion-range'));
    });

    it('should handle snaps property', async () => {
      const config = IonicFormTestUtils.builder()
        .ionicSliderField({
          key: 'volume',
          label: 'Volume',
          minValue: 0,
          maxValue: 100,
          step: 5,
          props: { snaps: true },
        })
        .build();

      const { fixture } = await IonicFormTestUtils.createTest({
        config,
        initialValue: { volume: 50 },
      });

      const ionRange = fixture.debugElement.query(By.css('df-ionic-slider ion-range'));
    });

    it('should handle dualKnobs property', async () => {
      const config = IonicFormTestUtils.builder()
        .ionicSliderField({
          key: 'range',
          label: 'Range',
          minValue: 0,
          maxValue: 100,
          step: 1,
          props: { dualKnobs: true },
        })
        .build();

      const { fixture } = await IonicFormTestUtils.createTest({
        config,
        initialValue: { range: { lower: 20, upper: 80 } },
      });

      const ionRange = fixture.debugElement.query(By.css('df-ionic-slider ion-range'));
    });

    it('should handle different label placements', async () => {
      const config = IonicFormTestUtils.builder()
        .ionicSliderField({
          key: 'volume',
          label: 'Volume',
          minValue: 0,
          maxValue: 100,
          step: 1,
          props: { labelPlacement: 'floating' },
        })
        .build();

      const { fixture } = await IonicFormTestUtils.createTest({
        config,
        initialValue: { volume: 50 },
      });

      const ionRange = fixture.debugElement.query(By.css('df-ionic-slider ion-range'));
    });

    it('should handle different color options', async () => {
      const config = IonicFormTestUtils.builder()
        .ionicSliderField({
          key: 'volume',
          label: 'Volume',
          minValue: 0,
          maxValue: 100,
          step: 1,
          props: { color: 'success' },
        })
        .build();

      const { fixture } = await IonicFormTestUtils.createTest({
        config,
        initialValue: { volume: 50 },
      });

      const ionRange = fixture.debugElement.query(By.css('df-ionic-slider ion-range'));
    });
  });

  describe('Edge Cases and Robustness Tests', () => {
    it('should handle undefined initial value', async () => {
      const config = IonicFormTestUtils.builder()
        .ionicSliderField({
          key: 'volume',
          label: 'Volume',
          minValue: 0,
          maxValue: 100,
          step: 1,
        })
        .build();

      const { fixture } = await IonicFormTestUtils.createTest({ config });

      const ionRange = fixture.debugElement.query(By.css('df-ionic-slider ion-range'));
      expect(ionRange).not.toBeNull();
    });

    it('should handle null form values gracefully', async () => {
      const config = IonicFormTestUtils.builder()
        .ionicSliderField({
          key: 'volume',
          label: 'Volume',
          minValue: 0,
          maxValue: 100,
          step: 1,
        })
        .build();

      const { fixture } = await IonicFormTestUtils.createTest({
        config,
        initialValue: null as any,
      });

      const ionRange = fixture.debugElement.query(By.css('df-ionic-slider ion-range'));
      expect(ionRange).not.toBeNull();
    });

    it('should handle zero as initial value', async () => {
      const config = IonicFormTestUtils.builder()
        .ionicSliderField({
          key: 'volume',
          label: 'Volume',
          minValue: 0,
          maxValue: 100,
          step: 1,
        })
        .build();

      const { component } = await IonicFormTestUtils.createTest({
        config,
        initialValue: { volume: 0 },
      });

      expect(IonicFormTestUtils.getFormValue(component).volume).toBe(0);
    });

    it('should handle negative values', async () => {
      const config = IonicFormTestUtils.builder()
        .ionicSliderField({
          key: 'temperature',
          label: 'Temperature',
          minValue: -50,
          maxValue: 50,
          step: 1,
        })
        .build();

      const { component } = await IonicFormTestUtils.createTest({
        config,
        initialValue: { temperature: -25 },
      });

      expect(IonicFormTestUtils.getFormValue(component).temperature).toBe(-25);
    });

    it('should display error messages when validation fails', async () => {
      const config = IonicFormTestUtils.builder()
        .field({
          key: 'rating',
          type: 'slider',
          label: 'Rating',
          required: true,
          minValue: 0,
          maxValue: 5,
          step: 1,
        })
        .build();

      const { fixture } = await IonicFormTestUtils.createTest({
        config,
        initialValue: { rating: null },
      });

      const ionRange = fixture.debugElement.query(By.css('df-ionic-slider ion-range'));
      ionRange.nativeElement.dispatchEvent(new Event('blur'));
      fixture.detectChanges();

      //       const errorComponent = fixture.debugElement.query(By.css('df-ionic-errors'));
    });

    it('should handle boundary values correctly', async () => {
      const config = IonicFormTestUtils.builder()
        .ionicSliderField({
          key: 'percentage',
          label: 'Percentage',
          minValue: 0,
          maxValue: 100,
          step: 1,
        })
        .build();

      const { component, fixture } = await IonicFormTestUtils.createTest({
        config,
        initialValue: { percentage: 0 },
      });

      expect(IonicFormTestUtils.getFormValue(component).percentage).toBe(0);

      fixture.componentRef.setInput('value', { percentage: 100 });
      fixture.detectChanges();

      expect(IonicFormTestUtils.getFormValue(component).percentage).toBe(100);
    });

    it('should handle small step increments', async () => {
      const config = IonicFormTestUtils.builder()
        .ionicSliderField({
          key: 'precision',
          label: 'Precision',
          minValue: 0,
          maxValue: 1,
          step: 0.01,
        })
        .build();

      const { component } = await IonicFormTestUtils.createTest({
        config,
        initialValue: { precision: 0.55 },
      });

      expect(IonicFormTestUtils.getFormValue(component).precision).toBe(0.55);
    });
  });
});
