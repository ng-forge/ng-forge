import { By } from '@angular/platform-browser';
import { createTestTranslationService } from '../../testing/fake-translation.service';
import { BootstrapFormTestUtils } from '../../testing/bootstrap-test-utils';

describe('BsCheckboxFieldComponent', () => {
  describe('Basic Bootstrap Checkbox Integration', () => {
    it('should render checkbox with full configuration', async () => {
      const config = BootstrapFormTestUtils.builder()
        .field({
          key: 'acceptTerms',
          type: 'checkbox',
          label: 'Accept Terms and Conditions',
          required: true,
          className: 'terms-checkbox',
          tabIndex: 1,
          props: {
            helpText: 'Please read and accept our terms',
            inline: false,
            reverse: false,
            switch: false,
          },
        })
        .build();

      const { fixture } = await BootstrapFormTestUtils.createTest({
        config,
        initialValue: {
          acceptTerms: false,
          newsletter: false,
          enableNotifications: false,
        },
      });

      const checkbox = fixture.debugElement.query(By.css('.form-check-input[type="checkbox"]'));
      const bsCheckboxComponent = fixture.debugElement.query(By.css('df-bs-checkbox'))?.componentInstance;
      const containerDiv = fixture.debugElement.query(By.css('.terms-checkbox'));
      const helpTextElement = fixture.debugElement.query(By.css('.form-text'));
      const label = fixture.debugElement.query(By.css('.form-check-label'));

      expect(checkbox).toBeTruthy();
      expect(label.nativeElement.textContent.trim()).toBe('Accept Terms and Conditions');
      expect(containerDiv).toBeTruthy();
      expect(helpTextElement?.nativeElement.textContent.trim()).toBe('Please read and accept our terms');

      // Verify form control integration and dynamic field component properties
      if (bsCheckboxComponent) {
        expect(bsCheckboxComponent.label()).toBe('Accept Terms and Conditions');
        expect(bsCheckboxComponent.props().inline).toBe(false);
        expect(bsCheckboxComponent.props().reverse).toBe(false);
      }
    });

    it('should handle user interactions and update form value', async () => {
      const config = BootstrapFormTestUtils.builder().bsCheckboxField({ key: 'acceptTerms', label: 'Accept Terms' }).build();

      const { component, fixture } = await BootstrapFormTestUtils.createTest({
        config,
        initialValue: {
          acceptTerms: false,
          newsletter: false,
          enableNotifications: false,
        },
      });

      // Initial value check
      expect(BootstrapFormTestUtils.getFormValue(component)['acceptTerms']).toBe(false);

      // Simulate checkbox interaction using utility
      await BootstrapFormTestUtils.simulateBsCheckbox(fixture, '.form-check-input[type="checkbox"]', true);

      // Verify form value updated
      expect(BootstrapFormTestUtils.getFormValue(component)['acceptTerms']).toBe(true);
    });

    it('should reflect external value changes in checkbox', async () => {
      const config = BootstrapFormTestUtils.builder().bsCheckboxField({ key: 'acceptTerms', label: 'Accept Terms' }).build();

      const { component, fixture } = await BootstrapFormTestUtils.createTest({
        config,
        initialValue: {
          acceptTerms: false,
          newsletter: false,
          enableNotifications: false,
        },
      });

      const checkbox = fixture.debugElement.query(By.css('.form-check-input[type="checkbox"]'));

      // Update form model programmatically
      fixture.componentRef.setInput('value', {
        acceptTerms: true,
        newsletter: false,
        enableNotifications: false,
      });

      fixture.detectChanges();

      expect((checkbox.nativeElement as HTMLInputElement).checked).toBe(true);
      expect(BootstrapFormTestUtils.getFormValue(component)['acceptTerms']).toBe(true);
    });

    it('should handle Bootstrap-specific checkbox properties', async () => {
      const config = BootstrapFormTestUtils.builder()
        .field({
          key: 'acceptTerms',
          type: 'checkbox',
          label: 'Test Checkbox',
          tabIndex: 1,
          props: {
            indeterminate: false,
            inline: true,
            reverse: false,
          },
        })
        .build();

      const { fixture } = await BootstrapFormTestUtils.createTest({
        config,
        initialValue: { acceptTerms: false },
      });

      const checkboxContainer = fixture.debugElement.query(By.css('.form-check'));

      // Check Bootstrap-specific classes
      expect(checkboxContainer.nativeElement.classList.contains('form-check-inline')).toBe(true);
    });
  });

  describe('Minimal Configuration Tests', () => {
    it('should render with default Bootstrap configuration', async () => {
      const config = BootstrapFormTestUtils.builder()
        .field({
          key: 'newsletter',
          type: 'checkbox',
          label: 'Subscribe to Newsletter',
        })
        .build();

      const { fixture } = await BootstrapFormTestUtils.createTest({
        config,
        initialValue: {
          acceptTerms: false,
          newsletter: false,
          enableNotifications: false,
        },
      });

      const checkbox = fixture.debugElement.query(By.css('.form-check-input[type="checkbox"]'));
      const label = fixture.debugElement.query(By.css('.form-check-label'));
      const formCheck = fixture.debugElement.query(By.css('.form-check'));

      expect(checkbox).toBeTruthy();
      expect(label.nativeElement.textContent.trim()).toBe('Subscribe to Newsletter');
      expect(formCheck).toBeTruthy();
    });

    it('should not display help text when not provided', async () => {
      const config = BootstrapFormTestUtils.builder().bsCheckboxField({ key: 'newsletter', label: 'Newsletter' }).build();

      const { fixture } = await BootstrapFormTestUtils.createTest({
        config,
        initialValue: { newsletter: false },
      });

      const helpTextElement = fixture.debugElement.query(By.css('.form-text'));
      expect(helpTextElement).toBeNull();
    });
  });

  describe('Multiple Checkbox Integration Tests', () => {
    it('should render multiple checkboxes with different configurations', async () => {
      const config = BootstrapFormTestUtils.builder()
        .field({
          key: 'acceptTerms',
          type: 'checkbox',
          label: 'Accept Terms',
          required: true,
        })
        .bsCheckboxField({ key: 'newsletter', label: 'Newsletter', props: { inline: true } })
        .bsCheckboxField({ key: 'enableNotifications', label: 'Enable Notifications', props: { switch: true } })
        .build();

      const { fixture } = await BootstrapFormTestUtils.createTest({
        config,
        initialValue: {
          acceptTerms: false,
          newsletter: true,
          enableNotifications: false,
        },
      });

      const checkboxes = fixture.debugElement.queryAll(By.css('.form-check-input[type="checkbox"]'));

      expect(checkboxes.length).toBe(3);

      const labels = fixture.debugElement.queryAll(By.css('.form-check-label'));
      expect(labels[0].nativeElement.textContent.trim()).toBe('Accept Terms');
      expect(labels[1].nativeElement.textContent.trim()).toBe('Newsletter');
      expect(labels[2].nativeElement.textContent.trim()).toBe('Enable Notifications');
    });

    it('should reflect individual checkbox states from form model', async () => {
      const config = BootstrapFormTestUtils.builder()
        .bsCheckboxField({ key: 'acceptTerms', label: 'Accept Terms' })
        .bsCheckboxField({ key: 'newsletter', label: 'Newsletter' })
        .bsCheckboxField({ key: 'enableNotifications', label: 'Enable Notifications' })
        .build();

      const { fixture } = await BootstrapFormTestUtils.createTest({
        config,
        initialValue: {
          acceptTerms: false,
          newsletter: true,
          enableNotifications: false,
        },
      });

      const checkboxes = fixture.debugElement.queryAll(By.css('.form-check-input[type="checkbox"]'));

      expect((checkboxes[0].nativeElement as HTMLInputElement).checked).toBe(false);
      expect((checkboxes[1].nativeElement as HTMLInputElement).checked).toBe(true);
      expect((checkboxes[2].nativeElement as HTMLInputElement).checked).toBe(false);
    });

    it('should handle independent checkbox interactions', async () => {
      const config = BootstrapFormTestUtils.builder()
        .bsCheckboxField({ key: 'acceptTerms', label: 'Accept Terms' })
        .bsCheckboxField({ key: 'newsletter', label: 'Newsletter' })
        .bsCheckboxField({ key: 'enableNotifications', label: 'Enable Notifications' })
        .build();

      const { component, fixture } = await BootstrapFormTestUtils.createTest({
        config,
        initialValue: {
          acceptTerms: false,
          newsletter: true,
          enableNotifications: false,
        },
      });

      // Simulate first checkbox click using utility
      await BootstrapFormTestUtils.simulateBsCheckbox(fixture, '.form-check-input[type="checkbox"]:first-of-type', true);

      let formValue = BootstrapFormTestUtils.getFormValue(component);
      expect(formValue['acceptTerms']).toBe(true);
      expect(formValue['newsletter']).toBe(true);
      expect(formValue['enableNotifications']).toBe(false);

      // Simulate third checkbox click using utility
      await BootstrapFormTestUtils.simulateBsCheckbox(fixture, '.form-check-input[type="checkbox"]:nth-of-type(3)', true);

      formValue = BootstrapFormTestUtils.getFormValue(component);
      expect(formValue['acceptTerms']).toBe(true);
      expect(formValue['newsletter']).toBe(true);
      expect(formValue['enableNotifications']).toBe(true);
    });

    it('should apply different Bootstrap variants to checkboxes', async () => {
      const config = BootstrapFormTestUtils.builder()
        .bsCheckboxField({ key: 'acceptTerms', label: 'Accept Terms' })
        .bsCheckboxField({ key: 'newsletter', label: 'Newsletter', props: { inline: true } })
        .bsCheckboxField({ key: 'enableNotifications', label: 'Enable Notifications', props: { switch: true } })
        .build();

      const { fixture } = await BootstrapFormTestUtils.createTest({
        config,
        initialValue: {
          acceptTerms: false,
          newsletter: false,
          enableNotifications: false,
        },
      });

      const formChecks = fixture.debugElement.queryAll(By.css('.form-check'));

      expect(formChecks[0].nativeElement.classList.contains('form-check-inline')).toBe(false);
      expect(formChecks[1].nativeElement.classList.contains('form-check-inline')).toBe(true);
      expect(formChecks[2].nativeElement.classList.contains('form-switch')).toBe(true);
    });
  });

  describe('Checkbox State and Edge Cases', () => {
    it('should handle disabled state correctly', async () => {
      const config = BootstrapFormTestUtils.builder()
        .field({
          key: 'acceptTerms',
          type: 'checkbox',
          label: 'Disabled Checkbox',
          disabled: true,
        })
        .build();

      const { fixture } = await BootstrapFormTestUtils.createTest({
        config,
        initialValue: {
          acceptTerms: false,
          newsletter: false,
          enableNotifications: false,
        },
      });

      const checkbox = fixture.debugElement.query(By.css('.form-check-input[type="checkbox"]'));
      const checkboxInput = checkbox.nativeElement as HTMLInputElement;

      expect(checkboxInput.disabled).toBe(true);

      // Try to click disabled checkbox - should not change value since it's disabled
      checkbox.nativeElement.click();
      fixture.detectChanges();

      // Verify the checkbox remains disabled and doesn't change
      expect(checkboxInput.disabled).toBe(true);
      expect(checkboxInput.checked).toBe(false);
    });

    it('should apply default Bootstrap configuration', async () => {
      const config = BootstrapFormTestUtils.builder().bsCheckboxField({ key: 'acceptTerms', label: 'Accept Terms' }).build();

      const { fixture } = await BootstrapFormTestUtils.createTest({
        config,
        initialValue: { acceptTerms: false },
      });

      const formCheck = fixture.debugElement.query(By.css('.form-check'));

      // Check default props from Bootstrap configuration
      expect(formCheck.nativeElement.classList.contains('form-check')).toBe(true);
      expect(formCheck.nativeElement.classList.contains('form-switch')).toBe(false);
      expect(formCheck.nativeElement.classList.contains('form-check-inline')).toBe(false);
    });

    it('should handle indeterminate state correctly', async () => {
      const config = BootstrapFormTestUtils.builder()
        .field({
          key: 'acceptTerms',
          type: 'checkbox',
          label: 'Indeterminate Checkbox',
          props: {
            indeterminate: true,
          },
        })
        .build();

      const { fixture } = await BootstrapFormTestUtils.createTest({
        config,
        initialValue: { acceptTerms: false },
      });

      const checkbox = fixture.debugElement.query(By.css('.form-check-input[type="checkbox"]'));
      const checkboxInput = checkbox.nativeElement as HTMLInputElement;

      expect(checkboxInput.indeterminate).toBe(true);
    });

    it('should handle undefined form values gracefully', async () => {
      const config = BootstrapFormTestUtils.builder().bsCheckboxField({ key: 'acceptTerms', label: 'Accept Terms' }).build();

      const { fixture } = await BootstrapFormTestUtils.createTest({ config }); // No initial value provided

      const checkbox = fixture.debugElement.query(By.css('.form-check-input[type="checkbox"]'));
      expect(checkbox).toBeTruthy();
    });

    it('should handle null form values gracefully', async () => {
      const config = BootstrapFormTestUtils.builder().bsCheckboxField({ key: 'acceptTerms', label: 'Accept Terms' }).build();

      const { fixture } = await BootstrapFormTestUtils.createTest({
        config,
        initialValue: null as any,
      });

      const checkbox = fixture.debugElement.query(By.css('.form-check-input[type="checkbox"]'));
      expect(checkbox).toBeTruthy();
    });

    it('should handle programmatic value updates correctly', async () => {
      const config = BootstrapFormTestUtils.builder().bsCheckboxField({ key: 'acceptTerms', label: 'Accept Terms' }).build();

      const { component, fixture } = await BootstrapFormTestUtils.createTest({
        config,
        initialValue: { acceptTerms: false },
      });

      const checkbox = fixture.debugElement.query(By.css('.form-check-input[type="checkbox"]'));
      const checkboxInput = checkbox.nativeElement as HTMLInputElement;

      // Initial state
      expect(checkboxInput.checked).toBe(false);

      // Update via programmatic value change
      fixture.componentRef.setInput('value', { acceptTerms: true });
      fixture.detectChanges();

      expect(checkboxInput.checked).toBe(true);
      expect(BootstrapFormTestUtils.getFormValue(component)['acceptTerms']).toBe(true);
    });
  });

  describe('Bootstrap-Specific Feature Tests', () => {
    it('should render as switch variant', async () => {
      const config = BootstrapFormTestUtils.builder()
        .bsCheckboxField({
          key: 'enableFeature',
          label: 'Enable Feature',
          props: { switch: true },
        })
        .build();

      const { fixture } = await BootstrapFormTestUtils.createTest({
        config,
        initialValue: { enableFeature: false },
      });

      const formCheck = fixture.debugElement.query(By.css('.form-check'));
      expect(formCheck.nativeElement.classList.contains('form-switch')).toBe(true);
    });

    it('should render inline checkboxes', async () => {
      const config = BootstrapFormTestUtils.builder()
        .bsCheckboxField({
          key: 'option1',
          label: 'Option 1',
          props: { inline: true },
        })
        .bsCheckboxField({
          key: 'option2',
          label: 'Option 2',
          props: { inline: true },
        })
        .build();

      const { fixture } = await BootstrapFormTestUtils.createTest({
        config,
        initialValue: { option1: false, option2: false },
      });

      const formChecks = fixture.debugElement.queryAll(By.css('.form-check'));
      expect(formChecks[0].nativeElement.classList.contains('form-check-inline')).toBe(true);
      expect(formChecks[1].nativeElement.classList.contains('form-check-inline')).toBe(true);
    });

    it('should render reverse layout checkbox', async () => {
      const config = BootstrapFormTestUtils.builder()
        .bsCheckboxField({
          key: 'reverseOption',
          label: 'Reverse Layout',
          props: { reverse: true },
        })
        .build();

      const { fixture } = await BootstrapFormTestUtils.createTest({
        config,
        initialValue: { reverseOption: false },
      });

      const formCheck = fixture.debugElement.query(By.css('.form-check'));
      expect(formCheck.nativeElement.classList.contains('form-check-reverse')).toBe(true);
    });
  });

  describe('Dynamic Text Support', () => {
    describe('Translation Service Integration', () => {
      it('should handle translation service with dynamic language updates for checkbox', async () => {
        const translationService = createTestTranslationService({
          'form.terms.label': 'Accept Terms and Conditions',
          'form.terms.helpText': 'Please read and accept our terms',
        });

        const config = BootstrapFormTestUtils.builder()
          .field({
            key: 'acceptTerms',
            type: 'checkbox',
            label: translationService.translate('form.terms.label'),
            props: {
              helpText: translationService.translate('form.terms.helpText'),
            },
          })
          .build();

        const { fixture } = await BootstrapFormTestUtils.createTest({
          config,
          initialValue: { acceptTerms: false },
        });

        const label = fixture.debugElement.query(By.css('.form-check-label'));
        const helpText = fixture.debugElement.query(By.css('.form-text'));

        // Initial translations
        expect(label.nativeElement.textContent.trim()).toBe('Accept Terms and Conditions');
        expect(helpText.nativeElement.textContent.trim()).toBe('Please read and accept our terms');

        // Update to Spanish
        translationService.addTranslations({
          'form.terms.label': 'Aceptar Términos y Condiciones',
          'form.terms.helpText': 'Por favor lea y acepte nuestros términos',
        });
        translationService.setLanguage('es');
        fixture.detectChanges();

        expect(label.nativeElement.textContent.trim()).toBe('Aceptar Términos y Condiciones');
        expect(helpText.nativeElement.textContent.trim()).toBe('Por favor lea y acepte nuestros términos');
      });
    });
  });
});
