import { By } from '@angular/platform-browser';
import { createTestTranslationService } from '../../testing/fake-translation.service';
import { BootstrapFormTestUtils } from '../../testing/bootstrap-test-utils';

describe('BsToggleFieldComponent', () => {
  describe('Basic Bootstrap Toggle Integration', () => {
    it('should render toggle with full configuration', async () => {
      const config = BootstrapFormTestUtils.builder()
        .field({
          key: 'darkMode',
          type: 'toggle',
          label: 'Enable Dark Mode',
          className: 'dark-mode-toggle',
          props: {
            helpText: 'Toggle between light and dark themes',
            required: true,
            size: 'lg',
            inline: false,
            reverse: false,
          },
        })
        .build();

      const { fixture } = await BootstrapFormTestUtils.createTest({
        config,
        initialValue: {
          darkMode: false,
          notifications: false,
          enableFeature: false,
        },
      });

      const toggle = fixture.debugElement.query(By.css('.form-check-input[type="checkbox"]'));
      const toggleContainer = fixture.debugElement.query(By.css('.form-check.form-switch'));
      const label = fixture.debugElement.query(By.css('.form-check-label'));
      const containerDiv = fixture.debugElement.query(By.css('.dark-mode-toggle'));
      const helpTextElement = fixture.debugElement.query(By.css('.form-text'));

      expect(toggle).toBeTruthy();
      expect(toggleContainer).toBeTruthy();
      expect(label.nativeElement.textContent.trim()).toBe('Enable Dark Mode');
      expect(containerDiv).toBeTruthy();
      expect(helpTextElement?.nativeElement.textContent.trim()).toBe('Toggle between light and dark themes');
      expect(toggleContainer.nativeElement.classList.contains('form-switch-lg')).toBe(true);
    });

    it.skip('should handle user interactions and update form value', async () => {
      const config = BootstrapFormTestUtils.builder().bsToggleField({ key: 'darkMode' }).build();

      const { component, fixture } = await BootstrapFormTestUtils.createTest({
        config,
        initialValue: {
          darkMode: false,
          notifications: false,
          enableFeature: false,
        },
      });

      // Initial value check
      expect(BootstrapFormTestUtils.getFormValue(component)['darkMode']).toBe(false);

      // Simulate toggle interaction using utility
      await BootstrapFormTestUtils.simulateBsToggle(fixture, '.form-check-input[type="checkbox"]', true);

      // Verify form value updated
      expect(BootstrapFormTestUtils.getFormValue(component)['darkMode']).toBe(true);
    });

    it('should reflect external value changes in toggle', async () => {
      const config = BootstrapFormTestUtils.builder()
        .field({
          key: 'darkMode',
          type: 'toggle',
          props: {
            label: 'Dark Mode',
          },
        })
        .build();

      const { component, fixture } = await BootstrapFormTestUtils.createTest({
        config,
        initialValue: {
          darkMode: false,
          notifications: false,
          enableFeature: false,
        },
      });

      const toggle = fixture.debugElement.query(By.css('.form-check-input[type="checkbox"]'));
      const toggleElement = toggle.nativeElement as HTMLInputElement;

      // Update form model programmatically
      fixture.componentRef.setInput('value', {
        darkMode: true,
        notifications: false,
        enableFeature: false,
      });
      fixture.detectChanges();

      expect(toggleElement.checked).toBe(true);
      expect(BootstrapFormTestUtils.getFormValue(component)['darkMode']).toBe(true);
    });

    it('should handle Bootstrap-specific toggle properties', async () => {
      const config = BootstrapFormTestUtils.builder()
        .field({
          key: 'darkMode',
          type: 'toggle',
          props: {
            label: 'Test Toggle',
            size: 'sm',
            inline: true,
            reverse: true,
          },
        })
        .build();

      const { fixture } = await BootstrapFormTestUtils.createTest({
        config,
        initialValue: { darkMode: false },
      });

      const toggleContainer = fixture.debugElement.query(By.css('.form-check.form-switch'));

      // Check Bootstrap-specific classes
      expect(toggleContainer.nativeElement.classList.contains('form-switch-sm')).toBe(true);
      expect(toggleContainer.nativeElement.classList.contains('form-check-inline')).toBe(true);
      expect(toggleContainer.nativeElement.classList.contains('form-check-reverse')).toBe(true);
    });
  });

  describe('Bootstrap-Specific Features', () => {
    it('should render inline toggle when inline prop is true', async () => {
      const config = BootstrapFormTestUtils.builder()
        .field({
          key: 'darkMode',
          type: 'toggle',
          label: 'Inline Toggle',
          props: {
            inline: true,
          },
        })
        .build();

      const { fixture } = await BootstrapFormTestUtils.createTest({
        config,
        initialValue: { darkMode: false },
      });

      const toggleContainer = fixture.debugElement.query(By.css('.form-check.form-switch'));
      expect(toggleContainer.nativeElement.classList.contains('form-check-inline')).toBe(true);
    });

    it('should render reverse toggle when reverse prop is true', async () => {
      const config = BootstrapFormTestUtils.builder()
        .field({
          key: 'darkMode',
          type: 'toggle',
          label: 'Reverse Toggle',
          props: {
            reverse: true,
          },
        })
        .build();

      const { fixture } = await BootstrapFormTestUtils.createTest({
        config,
        initialValue: { darkMode: false },
      });

      const toggleContainer = fixture.debugElement.query(By.css('.form-check.form-switch'));
      expect(toggleContainer.nativeElement.classList.contains('form-check-reverse')).toBe(true);
    });

    it('should apply size classes correctly', async () => {
      const config = BootstrapFormTestUtils.builder()
        .field({
          key: 'small',
          type: 'toggle',
          label: 'Small Toggle',
          props: {
            size: 'sm',
          },
        })
        .field({
          key: 'large',
          type: 'toggle',
          label: 'Large Toggle',
          props: {
            size: 'lg',
          },
        })
        .build();

      const { fixture } = await BootstrapFormTestUtils.createTest({
        config,
        initialValue: { small: false, large: false },
      });

      const toggleContainers = fixture.debugElement.queryAll(By.css('.form-check.form-switch'));
      expect(toggleContainers[0].nativeElement.classList.contains('form-switch-sm')).toBe(true);
      expect(toggleContainers[1].nativeElement.classList.contains('form-switch-lg')).toBe(true);
    });

    it('should display help text when provided', async () => {
      const config = BootstrapFormTestUtils.builder()
        .field({
          key: 'darkMode',
          type: 'toggle',
          label: 'Dark Mode',
          props: {
            helpText: 'Switch to dark theme',
          },
        })
        .build();

      const { fixture } = await BootstrapFormTestUtils.createTest({
        config,
        initialValue: { darkMode: false },
      });

      const helpText = fixture.debugElement.query(By.css('.form-text'));
      expect(helpText).toBeTruthy();
      expect(helpText.nativeElement.textContent.trim()).toBe('Switch to dark theme');
    });
  });

  describe('Minimal Configuration Tests', () => {
    it('should render with default Bootstrap configuration', async () => {
      const config = BootstrapFormTestUtils.builder()
        .field({
          key: 'notifications',
          type: 'toggle',
          label: 'Enable Notifications',
        })
        .build();

      const { fixture } = await BootstrapFormTestUtils.createTest({
        config,
        initialValue: {
          darkMode: false,
          notifications: false,
          enableFeature: false,
        },
      });

      const toggle = fixture.debugElement.query(By.css('.form-check-input[type="checkbox"]'));
      const toggleContainer = fixture.debugElement.query(By.css('.form-check.form-switch'));
      const label = fixture.debugElement.query(By.css('.form-check-label'));

      expect(toggle).toBeTruthy();
      expect(toggleContainer).toBeTruthy();
      expect(label.nativeElement.textContent.trim()).toBe('Enable Notifications');
    });

    it('should not display help text when not provided', async () => {
      const config = BootstrapFormTestUtils.builder().bsToggleField({ key: 'notifications' }).build();

      const { fixture } = await BootstrapFormTestUtils.createTest({
        config,
        initialValue: { notifications: false },
      });

      const helpTextElement = fixture.debugElement.query(By.css('.form-text'));
      expect(helpTextElement).toBeNull();
    });
  });

  describe('Multiple Toggle Integration Tests', () => {
    it('should render multiple toggles with different configurations', async () => {
      const config = BootstrapFormTestUtils.builder()
        .field({
          key: 'darkMode',
          type: 'toggle',
          label: 'Dark Mode',
          required: true,
        })
        .bsToggleField({ key: 'notifications', label: 'Notifications', props: { size: 'sm' } })
        .bsToggleField({ key: 'enableFeature', label: 'Enable Feature', props: { size: 'lg' } })
        .build();

      const { fixture } = await BootstrapFormTestUtils.createTest({
        config,
        initialValue: {
          darkMode: false,
          notifications: true,
          enableFeature: false,
        },
      });

      const toggles = fixture.debugElement.queryAll(By.css('.form-check-input[type="checkbox"]'));
      const labels = fixture.debugElement.queryAll(By.css('.form-check-label'));

      expect(toggles.length).toBe(3);
      expect(labels[0].nativeElement.textContent.trim()).toBe('Dark Mode');
      expect(labels[1].nativeElement.textContent.trim()).toBe('Notifications');
      expect(labels[2].nativeElement.textContent.trim()).toBe('Enable Feature');
    });

    it('should reflect individual toggle states from form model', async () => {
      const config = BootstrapFormTestUtils.builder()
        .bsToggleField({ key: 'darkMode' })
        .bsToggleField({ key: 'notifications' })
        .bsToggleField({ key: 'enableFeature' })
        .build();

      const { fixture } = await BootstrapFormTestUtils.createTest({
        config,
        initialValue: {
          darkMode: false,
          notifications: true,
          enableFeature: false,
        },
      });

      const toggles = fixture.debugElement.queryAll(By.css('.form-check-input[type="checkbox"]'));

      expect((toggles[0].nativeElement as HTMLInputElement).checked).toBe(false);
      expect((toggles[1].nativeElement as HTMLInputElement).checked).toBe(true);
      expect((toggles[2].nativeElement as HTMLInputElement).checked).toBe(false);
    });

    it('should handle independent toggle interactions', async () => {
      const config = BootstrapFormTestUtils.builder()
        .bsToggleField({ key: 'darkMode' })
        .bsToggleField({ key: 'notifications' })
        .bsToggleField({ key: 'enableFeature' })
        .build();

      const { component, fixture } = await BootstrapFormTestUtils.createTest({
        config,
        initialValue: {
          darkMode: false,
          notifications: true,
          enableFeature: false,
        },
      });

      const toggles = fixture.debugElement.queryAll(By.css('.form-check-input[type="checkbox"]'));

      // Simulate first toggle click
      (toggles[0].nativeElement as HTMLInputElement).click();
      fixture.detectChanges();

      let formValue = BootstrapFormTestUtils.getFormValue(component);
      expect(formValue['darkMode']).toBe(true);
      expect(formValue['notifications']).toBe(true);
      expect(formValue['enableFeature']).toBe(false);

      // Simulate third toggle click
      (toggles[2].nativeElement as HTMLInputElement).click();
      fixture.detectChanges();

      formValue = BootstrapFormTestUtils.getFormValue(component);
      expect(formValue['darkMode']).toBe(true);
      expect(formValue['notifications']).toBe(true);
      expect(formValue['enableFeature']).toBe(true);
    });

    it('should handle combined inline and reverse styles', async () => {
      const config = BootstrapFormTestUtils.builder()
        .bsToggleField({ key: 'darkMode' }) // Default
        .bsToggleField({ key: 'notifications', props: { inline: true } })
        .bsToggleField({ key: 'enableFeature', props: { reverse: true } })
        .build();

      const { fixture } = await BootstrapFormTestUtils.createTest({
        config,
        initialValue: {
          darkMode: false,
          notifications: false,
          enableFeature: false,
        },
      });

      const toggleContainers = fixture.debugElement.queryAll(By.css('.form-check.form-switch'));

      expect(toggleContainers[0].nativeElement.classList.contains('form-check-inline')).toBe(false);
      expect(toggleContainers[1].nativeElement.classList.contains('form-check-inline')).toBe(true);
      expect(toggleContainers[2].nativeElement.classList.contains('form-check-reverse')).toBe(true);
    });
  });

  describe('Toggle State and Edge Cases', () => {
    it('should handle disabled state correctly', async () => {
      const config = BootstrapFormTestUtils.builder()
        .field({
          key: 'darkMode',
          type: 'toggle',
          label: 'Disabled Toggle',
          disabled: true,
        })
        .build();

      const { fixture } = await BootstrapFormTestUtils.createTest({
        config,
        initialValue: {
          darkMode: false,
          notifications: false,
          enableFeature: false,
        },
      });

      const toggle = fixture.debugElement.query(By.css('.form-check-input[type="checkbox"]'));
      const toggleElement = toggle.nativeElement as HTMLInputElement;

      expect(toggleElement.disabled).toBe(true);

      // Try to click disabled toggle - should not change value since it's disabled
      toggleElement.click();
      fixture.detectChanges();

      // Verify the toggle remains disabled and doesn't change
      expect(toggleElement.disabled).toBe(true);
      expect(toggleElement.checked).toBe(false);
    });

    it('should apply default Bootstrap configuration', async () => {
      const config = BootstrapFormTestUtils.builder().bsToggleField({ key: 'darkMode' }).build();

      const { fixture } = await BootstrapFormTestUtils.createTest({
        config,
        initialValue: { darkMode: false },
      });

      const toggleContainer = fixture.debugElement.query(By.css('.form-check.form-switch'));

      // Check default classes
      expect(toggleContainer).toBeTruthy();
      expect(toggleContainer.nativeElement.classList.contains('form-check-inline')).toBe(false);
      expect(toggleContainer.nativeElement.classList.contains('form-check-reverse')).toBe(false);
    });

    it('should handle undefined form values gracefully', async () => {
      const config = BootstrapFormTestUtils.builder().bsToggleField({ key: 'darkMode' }).build();

      const { fixture } = await BootstrapFormTestUtils.createTest({ config }); // No initial value provided

      const toggle = fixture.debugElement.query(By.css('.form-check-input[type="checkbox"]'));
      expect(toggle).toBeTruthy();
    });

    it('should handle null form values gracefully', async () => {
      const config = BootstrapFormTestUtils.builder().bsToggleField({ key: 'darkMode' }).build();

      const { fixture } = await BootstrapFormTestUtils.createTest({
        config,
        initialValue: null as any,
      });

      const toggle = fixture.debugElement.query(By.css('.form-check-input[type="checkbox"]'));
      expect(toggle).toBeTruthy();
    });

    it('should handle programmatic value updates correctly', async () => {
      const config = BootstrapFormTestUtils.builder().bsToggleField({ key: 'darkMode' }).build();

      const { component, fixture } = await BootstrapFormTestUtils.createTest({
        config,
        initialValue: { darkMode: false },
      });

      const toggle = fixture.debugElement.query(By.css('.form-check-input[type="checkbox"]'));
      const toggleElement = toggle.nativeElement as HTMLInputElement;

      // Initial state
      expect(toggleElement.checked).toBe(false);

      // Update via programmatic value change
      fixture.componentRef.setInput('value', { darkMode: true });
      fixture.detectChanges();

      expect(toggleElement.checked).toBe(true);
      expect(BootstrapFormTestUtils.getFormValue(component)['darkMode']).toBe(true);
    });

    it('should handle validation states correctly', async () => {
      const config = BootstrapFormTestUtils.builder()
        .field({
          key: 'darkMode',
          type: 'toggle',
          label: 'Dark Mode',
          required: true,
        })
        .build();

      const { fixture } = await BootstrapFormTestUtils.createTest({
        config,
        initialValue: { darkMode: false },
      });

      const toggle = fixture.debugElement.query(By.css('.form-check-input[type="checkbox"]'));

      // Touch the field to trigger validation display
      toggle.nativeElement.dispatchEvent(new Event('blur', { bubbles: true }));
      fixture.detectChanges();

      // For Bootstrap, required validation on toggle shows is-invalid when unchecked and touched
      expect(toggle.nativeElement.classList.contains('is-invalid')).toBe(true);
    });
  });

  describe('Dynamic Text Support', () => {
    describe('Translation Service Integration', () => {
      it('should handle translation service with dynamic language updates for toggle', async () => {
        const translationService = createTestTranslationService({
          'form.darkMode.label': 'Enable Dark Mode',
          'form.darkMode.helpText': 'Toggle between light and dark themes',
        });

        const config = BootstrapFormTestUtils.builder()
          .field({
            key: 'darkMode',
            type: 'toggle',
            label: translationService.translate('form.darkMode.label'),
            props: {
              helpText: translationService.translate('form.darkMode.helpText'),
            },
          })
          .build();

        const { fixture } = await BootstrapFormTestUtils.createTest({
          config,
          initialValue: { darkMode: false },
        });

        const label = fixture.debugElement.query(By.css('.form-check-label'));
        const helpText = fixture.debugElement.query(By.css('.form-text'));

        // Initial translations
        expect(label.nativeElement.textContent.trim()).toBe('Enable Dark Mode');
        expect(helpText.nativeElement.textContent.trim()).toBe('Toggle between light and dark themes');

        // Update to Spanish
        translationService.addTranslations({
          'form.darkMode.label': 'Habilitar Modo Oscuro',
          'form.darkMode.helpText': 'Alternar entre temas claro y oscuro',
        });
        translationService.setLanguage('es');
        fixture.detectChanges();

        expect(label.nativeElement.textContent.trim()).toBe('Habilitar Modo Oscuro');
        expect(helpText.nativeElement.textContent.trim()).toBe('Alternar entre temas claro y oscuro');
      });
    });
  });
});
