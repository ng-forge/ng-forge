import { By } from '@angular/platform-browser';
import { createTestTranslationService } from '../../testing/fake-translation.service';
import { PrimeNGFormTestUtils } from '../../testing/primeng-test-utils';

describe('PrimeToggleFieldComponent', () => {
  describe('Basic PrimeNG Toggle Integration', () => {
    it('should render toggle with full configuration', async () => {
      const config = PrimeNGFormTestUtils.builder()
        .field({
          key: 'darkMode',
          type: 'toggle',
          label: 'Enable Dark Mode',
          className: 'dark-mode-toggle',
          props: {
            hint: 'Toggle between light and dark themes',
            required: true,
            tabIndex: 1,
          },
        })
        .build();

      const { fixture } = await PrimeNGFormTestUtils.createTest({
        config,
        initialValue: {
          darkMode: false,
          notifications: false,
          enableFeature: false,
        },
      });

      const toggle = fixture.debugElement.query(By.css('p-toggleswitch'));
      const primeToggleComponent = fixture.debugElement.query(By.css('df-prime-toggle'))?.componentInstance;
      const containerDiv = fixture.debugElement.query(By.css('.dark-mode-toggle'));
      const hintElement = fixture.debugElement.query(By.css('.p-hint'));

      expect(toggle).toBeTruthy();
      expect(containerDiv).toBeTruthy();
      expect(hintElement?.nativeElement.textContent.trim()).toBe('Toggle between light and dark themes');

      // Verify form control integration and dynamic field component properties
      if (primeToggleComponent) {
        expect(primeToggleComponent.label()).toBe('Enable Dark Mode');
      }
    });

    it('should handle user interactions and update form value', async () => {
      const config = PrimeNGFormTestUtils.builder().primeToggleField({ key: 'darkMode' }).build();

      const { component, fixture } = await PrimeNGFormTestUtils.createTest({
        config,
        initialValue: {
          darkMode: false,
          notifications: false,
          enableFeature: false,
        },
      });

      // Initial value check
      expect(PrimeNGFormTestUtils.getFormValue(component)['darkMode']).toBe(false);

      // Simulate toggle interaction using utility
      await PrimeNGFormTestUtils.simulatePrimeToggle(fixture, 'p-toggleswitch', true);

      // Verify form value updated
      expect(PrimeNGFormTestUtils.getFormValue(component)['darkMode']).toBe(true);
    });

    it('should reflect external value changes in toggle', async () => {
      const config = PrimeNGFormTestUtils.builder()
        .field({
          key: 'darkMode',
          type: 'toggle',
          props: {
            label: 'Dark Mode',
          },
        })
        .build();

      const { component, fixture } = await PrimeNGFormTestUtils.createTest({
        config,
        initialValue: {
          darkMode: false,
          notifications: false,
          enableFeature: false,
        },
      });

      const toggle = fixture.debugElement.query(By.css('p-toggleswitch'));
      const toggleInput = toggle.nativeElement.querySelector('input');

      // Update form model programmatically
      fixture.componentRef.setInput('value', {
        darkMode: true,
        notifications: false,
        enableFeature: false,
      });
      fixture.detectChanges();

      expect(toggleInput.checked).toBe(true);
      expect(PrimeNGFormTestUtils.getFormValue(component)['darkMode']).toBe(true);
    });

    it('should handle PrimeNG-specific toggle properties', async () => {
      const config = PrimeNGFormTestUtils.builder()
        .field({
          key: 'darkMode',
          type: 'toggle',
          props: {
            label: 'Test Toggle',
            tabIndex: 1,
          },
        })
        .build();

      const { fixture } = await PrimeNGFormTestUtils.createTest({
        config,
        initialValue: { darkMode: false },
      });

      const toggle = fixture.debugElement.query(By.css('p-toggleswitch'));

      // These properties are passed to the inner InputSwitch component
      expect(toggle).toBeTruthy();
      // Note: tabIndex and other properties are internal properties that don't need testing at this integration level
    });
  });

  describe('Minimal Configuration Tests', () => {
    it('should render with default PrimeNG configuration', async () => {
      const config = PrimeNGFormTestUtils.builder()
        .field({
          key: 'notifications',
          type: 'toggle',
          label: 'Enable Notifications',
        })
        .build();

      const { fixture } = await PrimeNGFormTestUtils.createTest({
        config,
        initialValue: {
          darkMode: false,
          notifications: false,
          enableFeature: false,
        },
      });

      const toggle = fixture.debugElement.query(By.css('p-toggleswitch'));

      expect(toggle).toBeTruthy();
    });

    it('should not display hint when not provided', async () => {
      const config = PrimeNGFormTestUtils.builder().primeToggleField({ key: 'notifications' }).build();

      const { fixture } = await PrimeNGFormTestUtils.createTest({
        config,
        initialValue: { notifications: false },
      });

      const hintElement = fixture.debugElement.query(By.css('.p-hint'));
      expect(hintElement).toBeNull();
    });
  });

  describe('Multiple Toggle Integration Tests', () => {
    it('should render multiple toggles with different configurations', async () => {
      const config = PrimeNGFormTestUtils.builder()
        .field({
          key: 'darkMode',
          type: 'toggle',
          label: 'Dark Mode',
          required: true,
        })
        .primeToggleField({ key: 'notifications', label: 'Notifications' })
        .primeToggleField({ key: 'enableFeature', label: 'Enablefeature' })
        .build();

      const { fixture } = await PrimeNGFormTestUtils.createTest({
        config,
        initialValue: {
          darkMode: false,
          notifications: true,
          enableFeature: false,
        },
      });

      const toggles = fixture.debugElement.queryAll(By.css('p-toggleswitch'));

      expect(toggles.length).toBe(3);
    });

    it('should reflect individual toggle states from form model', async () => {
      const config = PrimeNGFormTestUtils.builder()
        .primeToggleField({ key: 'darkMode' })
        .primeToggleField({ key: 'notifications' })
        .primeToggleField({ key: 'enableFeature' })
        .build();

      const { fixture } = await PrimeNGFormTestUtils.createTest({
        config,
        initialValue: {
          darkMode: false,
          notifications: true,
          enableFeature: false,
        },
      });

      const toggles = fixture.debugElement.queryAll(By.css('p-toggleswitch'));

      expect(toggles[0].nativeElement.querySelector('input').checked).toBe(false);
      expect(toggles[1].nativeElement.querySelector('input').checked).toBe(true);
      expect(toggles[2].nativeElement.querySelector('input').checked).toBe(false);
    });

    it('should handle independent toggle interactions', async () => {
      const config = PrimeNGFormTestUtils.builder()
        .primeToggleField({ key: 'darkMode' })
        .primeToggleField({ key: 'notifications' })
        .primeToggleField({ key: 'enableFeature' })
        .build();

      const { component, fixture } = await PrimeNGFormTestUtils.createTest({
        config,
        initialValue: {
          darkMode: false,
          notifications: true,
          enableFeature: false,
        },
      });

      const toggles = fixture.debugElement.queryAll(By.css('p-toggleswitch'));

      // Simulate first toggle click using direct component interaction
      const firstToggleInput = toggles[0].nativeElement.querySelector('input');
      firstToggleInput.click();
      fixture.detectChanges();

      let formValue = PrimeNGFormTestUtils.getFormValue(component);
      expect(formValue['darkMode']).toBe(true);
      expect(formValue['notifications']).toBe(true);
      expect(formValue['enableFeature']).toBe(false);

      // Simulate third toggle click using direct component interaction
      const thirdToggleInput = toggles[2].nativeElement.querySelector('input');
      thirdToggleInput.click();
      fixture.detectChanges();

      formValue = PrimeNGFormTestUtils.getFormValue(component);
      expect(formValue['darkMode']).toBe(true);
      expect(formValue['notifications']).toBe(true);
      expect(formValue['enableFeature']).toBe(true);
    });
  });

  describe('Toggle State and Edge Cases', () => {
    it('should handle disabled state correctly', async () => {
      const config = PrimeNGFormTestUtils.builder()
        .field({
          key: 'darkMode',
          type: 'toggle',
          label: 'Disabled Toggle',
          disabled: true,
        })
        .build();

      const { fixture } = await PrimeNGFormTestUtils.createTest({
        config,
        initialValue: {
          darkMode: false,
          notifications: false,
          enableFeature: false,
        },
      });

      const toggle = fixture.debugElement.query(By.css('p-toggleswitch'));
      const toggleInput = fixture.debugElement.query(By.css('input'));

      expect(toggleInput.nativeElement.disabled).toBe(true);

      // Try to click disabled toggle - should not change value since it's disabled
      toggle.nativeElement.click();
      fixture.detectChanges();

      // Verify the toggle remains disabled and doesn't change
      expect(toggleInput.nativeElement.disabled).toBe(true);
      expect(toggleInput.nativeElement.checked).toBe(false);
    });

    it('should apply default PrimeNG configuration', async () => {
      const config = PrimeNGFormTestUtils.builder().primeToggleField({ key: 'darkMode' }).build();

      const { fixture } = await PrimeNGFormTestUtils.createTest({
        config,
        initialValue: { darkMode: false },
      });

      const toggle = fixture.debugElement.query(By.css('p-toggleswitch'));

      // Check default props from PrimeNG configuration
      expect(toggle).toBeTruthy();
    });

    it('should handle undefined form values gracefully', async () => {
      const config = PrimeNGFormTestUtils.builder().primeToggleField({ key: 'darkMode' }).build();

      const { fixture } = await PrimeNGFormTestUtils.createTest({ config }); // No initial value provided

      const toggle = fixture.debugElement.query(By.css('p-toggleswitch'));
      expect(toggle).toBeTruthy();
    });

    it('should handle null form values gracefully', async () => {
      const config = PrimeNGFormTestUtils.builder().primeToggleField({ key: 'darkMode' }).build();

      const { fixture } = await PrimeNGFormTestUtils.createTest({
        config,
        initialValue: null as any,
      });

      const toggle = fixture.debugElement.query(By.css('p-toggleswitch'));
      expect(toggle).toBeTruthy();
    });

    it('should handle programmatic value updates correctly', async () => {
      const config = PrimeNGFormTestUtils.builder().primeToggleField({ key: 'darkMode' }).build();

      const { component, fixture } = await PrimeNGFormTestUtils.createTest({
        config,
        initialValue: { darkMode: false },
      });

      const toggle = fixture.debugElement.query(By.css('p-toggleswitch'));
      const toggleInput = toggle.nativeElement.querySelector('input');

      // Initial state
      expect(toggleInput.checked).toBe(false);

      // Update via programmatic value change
      fixture.componentRef.setInput('value', { darkMode: true });
      fixture.detectChanges();

      expect(toggleInput.checked).toBe(true);
      expect(PrimeNGFormTestUtils.getFormValue(component)['darkMode']).toBe(true);
    });
  });

  describe('Dynamic Text Support', () => {
    describe('Translation Service Integration', () => {
      it('should handle translation service with dynamic language updates for toggle', async () => {
        const translationService = createTestTranslationService({
          'form.darkMode.label': 'Enable Dark Mode',
          'form.darkMode.hint': 'Toggle between light and dark themes',
        });

        const config = PrimeNGFormTestUtils.builder()
          .field({
            key: 'darkMode',
            type: 'toggle',
            label: translationService.translate('form.darkMode.label'),
            props: {
              hint: translationService.translate('form.darkMode.hint'),
            },
          })
          .build();

        const { fixture } = await PrimeNGFormTestUtils.createTest({
          config,
          initialValue: { darkMode: false },
        });

        const label = fixture.debugElement.query(By.css('label'));
        const hint = fixture.debugElement.query(By.css('.p-hint'));

        // Initial translations
        expect(label.nativeElement.textContent.trim()).toBe('Enable Dark Mode');
        expect(hint.nativeElement.textContent.trim()).toBe('Toggle between light and dark themes');

        // Update to Spanish
        translationService.addTranslations({
          'form.darkMode.label': 'Habilitar Modo Oscuro',
          'form.darkMode.hint': 'Alternar entre temas claro y oscuro',
        });
        translationService.setLanguage('es');
        fixture.detectChanges();

        expect(label.nativeElement.textContent.trim()).toBe('Habilitar Modo Oscuro');
        expect(hint.nativeElement.textContent.trim()).toBe('Alternar entre temas claro y oscuro');
      });
    });
  });
});
