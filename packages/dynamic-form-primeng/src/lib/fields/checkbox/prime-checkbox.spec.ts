import { untracked } from '@angular/core';
import { By } from '@angular/platform-browser';
import { Checkbox } from 'primeng/checkbox';
import { createTestTranslationService } from '../../testing/fake-translation.service';
import { PrimeNGFormTestUtils } from '../../testing/primeng-test-utils';

describe('PrimeCheckboxFieldComponent', () => {
  describe('Basic PrimeNG Checkbox Integration', () => {
    it('should render checkbox with full configuration', async () => {
      const config = PrimeNGFormTestUtils.builder()
        .field({
          key: 'acceptTerms',
          type: 'checkbox',
          label: 'Accept Terms and Conditions',
          required: true,
          className: 'terms-checkbox',
          tabIndex: 1,
          props: {
            hint: 'Please read and accept our terms',
            binary: true,
            styleClass: 'custom-checkbox',
          },
        })
        .build();

      const { fixture } = await PrimeNGFormTestUtils.createTest({
        config,
        initialValue: {
          acceptTerms: false,
          newsletter: false,
          enableNotifications: false,
        },
      });

      await fixture.whenStable();
      untracked(() => fixture.detectChanges());
      const checkbox = fixture.debugElement.query(By.directive(Checkbox));
      const primeCheckboxComponent = fixture.debugElement.query(By.css('df-prime-checkbox'))?.componentInstance;
      const containerDiv = fixture.debugElement.query(By.css('.terms-checkbox'));
      const hintElement = fixture.debugElement.query(By.css('.p-hint'));

      expect(checkbox).toBeTruthy();
      expect(checkbox.nativeElement.textContent.trim()).toBe('Accept Terms and Conditions');
      expect(containerDiv).toBeTruthy();
      expect(hintElement?.nativeElement.textContent.trim()).toBe('Please read and accept our terms');

      // Verify form control integration and dynamic field component properties
      if (primeCheckboxComponent) {
        expect(primeCheckboxComponent.label()).toBe('Accept Terms and Conditions');
        expect(primeCheckboxComponent.props().binary).toBe(true);
        expect(primeCheckboxComponent.props().styleClass).toBe('custom-checkbox');
      }
    });

    it('should handle user interactions and update form value', async () => {
      const config = PrimeNGFormTestUtils.builder().primeCheckboxField({ key: 'acceptTerms', label: 'Acceptterms' }).build();

      const { component, fixture } = await PrimeNGFormTestUtils.createTest({
        config,
        initialValue: {
          acceptTerms: false,
          newsletter: false,
          enableNotifications: false,
        },
      });

      // Initial value check
      expect(PrimeNGFormTestUtils.getFormValue(component)['acceptTerms']).toBe(false);

      // Simulate checkbox interaction using utility
      await PrimeNGFormTestUtils.simulatePrimeCheckbox(fixture, 'p-checkbox', true);

      // Verify form value updated
      expect(PrimeNGFormTestUtils.getFormValue(component)['acceptTerms']).toBe(true);
    });

    it('should reflect external value changes in checkbox', async () => {
      const config = PrimeNGFormTestUtils.builder().primeCheckboxField({ key: 'acceptTerms', label: 'Acceptterms' }).build();

      const { component, fixture } = await PrimeNGFormTestUtils.createTest({
        config,
        initialValue: {
          acceptTerms: false,
          newsletter: false,
          enableNotifications: false,
        },
      });

      const checkbox = fixture.debugElement.query(By.directive(Checkbox));
      const checkboxComponent = checkbox.componentInstance;

      // Update form model programmatically
      fixture.componentRef.setInput('value', {
        acceptTerms: true,
        newsletter: false,
        enableNotifications: false,
      });

      untracked(() => fixture.detectChanges());

      expect(checkboxComponent.checked).toBe(true);
      expect(PrimeNGFormTestUtils.getFormValue(component)['acceptTerms']).toBe(true);
    });

    it('should handle PrimeNG-specific checkbox properties', async () => {
      const config = PrimeNGFormTestUtils.builder()
        .field({
          key: 'acceptTerms',
          type: 'checkbox',
          label: 'Test Checkbox',
          tabIndex: 1,
          props: {
            binary: true,
            trueValue: 'yes',
            falseValue: 'no',
            styleClass: 'my-checkbox',
          },
        })
        .build();

      const { fixture } = await PrimeNGFormTestUtils.createTest({
        config,
        initialValue: { acceptTerms: false },
      });

      const checkbox = fixture.debugElement.query(By.directive(Checkbox));
      const checkboxComponent = checkbox.componentInstance;

      // These properties are passed to the inner Checkbox component
      expect(checkboxComponent.binary).toBe(true);
      expect(checkboxComponent.trueValue).toBe('yes');
      expect(checkboxComponent.falseValue).toBe('no');
    });
  });

  describe('Minimal Configuration Tests', () => {
    it('should render with default PrimeNG configuration', async () => {
      const config = PrimeNGFormTestUtils.builder()
        .field({
          key: 'newsletter',
          type: 'checkbox',
          label: 'Subscribe to Newsletter',
        })
        .build();

      const { fixture } = await PrimeNGFormTestUtils.createTest({
        config,
        initialValue: {
          acceptTerms: false,
          newsletter: false,
          enableNotifications: false,
        },
      });

      const checkbox = fixture.debugElement.query(By.directive(Checkbox));
      const checkboxComponent = checkbox.componentInstance;

      expect(checkbox).toBeTruthy();
      expect(checkbox.nativeElement.textContent.trim()).toBe('Subscribe to Newsletter');
      expect(checkboxComponent.binary).toBe(true);
    });

    it('should not display hint when not provided', async () => {
      const config = PrimeNGFormTestUtils.builder().primeCheckboxField({ key: 'newsletter', label: 'Newsletter' }).build();

      const { fixture } = await PrimeNGFormTestUtils.createTest({
        config,
        initialValue: { newsletter: false },
      });

      const hintElement = fixture.debugElement.query(By.css('.p-hint'));
      expect(hintElement).toBeNull();
    });
  });

  describe('Multiple Checkbox Integration Tests', () => {
    it('should render multiple checkboxes with different configurations', async () => {
      const config = PrimeNGFormTestUtils.builder()
        .field({
          key: 'acceptTerms',
          type: 'checkbox',
          label: 'Accept Terms',
          required: true,
        })
        .primeCheckboxField({ key: 'newsletter', label: 'Newsletter', props: { styleClass: 'accent-checkbox' } })
        .primeCheckboxField({ key: 'enableNotifications', label: 'Enablenotifications', props: { styleClass: 'warn-checkbox' } })
        .build();

      const { fixture } = await PrimeNGFormTestUtils.createTest({
        config,
        initialValue: {
          acceptTerms: false,
          newsletter: true,
          enableNotifications: false,
        },
      });

      await fixture.whenStable();
      untracked(() => fixture.detectChanges());
      const checkboxes = fixture.debugElement.queryAll(By.directive(Checkbox));

      expect(checkboxes.length).toBe(3);
      expect(checkboxes[0].nativeElement.textContent.trim()).toBe('Accept Terms');
      expect(checkboxes[1].nativeElement.textContent.trim()).toBe('Newsletter');
      expect(checkboxes[2].nativeElement.textContent.trim()).toBe('Enablenotifications');
    });

    it('should reflect individual checkbox states from form model', async () => {
      const config = PrimeNGFormTestUtils.builder()
        .primeCheckboxField({ key: 'acceptTerms', label: 'Acceptterms' })
        .primeCheckboxField({ key: 'newsletter', label: 'Newsletter' })
        .primeCheckboxField({ key: 'enableNotifications', label: 'Enablenotifications' })
        .build();

      const { fixture } = await PrimeNGFormTestUtils.createTest({
        config,
        initialValue: {
          acceptTerms: false,
          newsletter: true,
          enableNotifications: false,
        },
      });

      await fixture.whenStable();
      untracked(() => fixture.detectChanges());
      const checkboxes = fixture.debugElement.queryAll(By.directive(Checkbox));

      expect(checkboxes[0].componentInstance.checked).toBe(false);
      expect(checkboxes[1].componentInstance.checked).toBe(true);
      expect(checkboxes[2].componentInstance.checked).toBe(false);
    });

    it('should handle independent checkbox interactions', async () => {
      const config = PrimeNGFormTestUtils.builder()
        .primeCheckboxField({ key: 'acceptTerms', label: 'Acceptterms' })
        .primeCheckboxField({ key: 'newsletter', label: 'Newsletter' })
        .primeCheckboxField({ key: 'enableNotifications', label: 'Enablenotifications' })
        .build();

      const { component, fixture } = await PrimeNGFormTestUtils.createTest({
        config,
        initialValue: {
          acceptTerms: false,
          newsletter: true,
          enableNotifications: false,
        },
      });

      // Simulate first checkbox click using utility
      await PrimeNGFormTestUtils.simulatePrimeCheckbox(fixture, 'p-checkbox:first-of-type', true);
      await fixture.whenStable();
      untracked(() => fixture.detectChanges());

      let formValue = PrimeNGFormTestUtils.getFormValue(component);
      expect(formValue['acceptTerms']).toBe(true);
      expect(formValue['newsletter']).toBe(true);
      expect(formValue['enableNotifications']).toBe(false);

      // Simulate third checkbox click using utility
      await PrimeNGFormTestUtils.simulatePrimeCheckbox(fixture, 'p-checkbox:nth-of-type(3)', true);

      formValue = PrimeNGFormTestUtils.getFormValue(component);
      expect(formValue['acceptTerms']).toBe(true);
      expect(formValue['newsletter']).toBe(true);
      expect(formValue['enableNotifications']).toBe(true);
    });

    it('should apply different style classes to checkboxes', async () => {
      const config = PrimeNGFormTestUtils.builder()
        .primeCheckboxField({ key: 'acceptTerms', label: 'Acceptterms' })
        .primeCheckboxField({ key: 'newsletter', label: 'Newsletter', props: { styleClass: 'accent-checkbox' } })
        .primeCheckboxField({ key: 'enableNotifications', label: 'Enablenotifications', props: { styleClass: 'warn-checkbox' } })
        .build();

      const { fixture } = await PrimeNGFormTestUtils.createTest({
        config,
        initialValue: {
          acceptTerms: false,
          newsletter: false,
          enableNotifications: false,
        },
      });

      const checkboxes = fixture.debugElement.queryAll(By.directive(Checkbox));

      expect(checkboxes[0].componentInstance.styleClass).toBeFalsy();
      expect(checkboxes[1].componentInstance.styleClass).toBe('accent-checkbox');
      expect(checkboxes[2].componentInstance.styleClass).toBe('warn-checkbox');
    });
  });

  describe('Checkbox State and Edge Cases', () => {
    it('should handle disabled state correctly', async () => {
      const config = PrimeNGFormTestUtils.builder()
        .field({
          key: 'acceptTerms',
          type: 'checkbox',
          label: 'Disabled Checkbox',
          disabled: true,
        })
        .build();

      const { fixture } = await PrimeNGFormTestUtils.createTest({
        config,
        initialValue: {
          acceptTerms: false,
          newsletter: false,
          enableNotifications: false,
        },
      });

      await fixture.whenStable();
      const checkbox = fixture.debugElement.query(By.directive(Checkbox));
      const checkboxInput = fixture.debugElement.query(By.css('input[type="checkbox"]'));
      const checkboxComponent = checkbox.componentInstance;

      expect(checkboxInput.nativeElement.disabled).toBe(true);

      // Try to click disabled checkbox - should not change value since it's disabled
      checkbox.nativeElement.click();
      untracked(() => fixture.detectChanges());

      // Verify the checkbox remains disabled and doesn't change
      expect(checkboxInput.nativeElement.disabled).toBe(true);
      expect(checkboxComponent.checked).toBe(false);
    });

    it('should apply default PrimeNG configuration', async () => {
      const config = PrimeNGFormTestUtils.builder().primeCheckboxField({ key: 'acceptTerms', label: 'Acceptterms' }).build();

      const { fixture } = await PrimeNGFormTestUtils.createTest({
        config,
        initialValue: { acceptTerms: false },
      });

      const checkbox = fixture.debugElement.query(By.directive(Checkbox));
      const checkboxComponent = checkbox.componentInstance;

      // Check default props from PrimeNG configuration
      expect(checkboxComponent.binary).toBe(true);
    });

    it('should handle binary mode correctly', async () => {
      const config = PrimeNGFormTestUtils.builder()
        .field({
          key: 'acceptTerms',
          type: 'checkbox',
          label: 'Binary Mode Checkbox',
          props: {
            binary: false,
          },
        })
        .build();

      const { fixture } = await PrimeNGFormTestUtils.createTest({
        config,
        initialValue: { acceptTerms: false },
      });

      const checkbox = fixture.debugElement.query(By.directive(Checkbox));
      const checkboxComponent = checkbox.componentInstance;

      expect(checkboxComponent.binary).toBe(false);
    });

    it('should handle undefined form values gracefully', async () => {
      const config = PrimeNGFormTestUtils.builder().primeCheckboxField({ key: 'acceptTerms', label: 'Acceptterms' }).build();

      const { fixture } = await PrimeNGFormTestUtils.createTest({ config }); // No initial value provided

      const checkbox = fixture.debugElement.query(By.directive(Checkbox));
      expect(checkbox).toBeTruthy();
    });

    it('should handle null form values gracefully', async () => {
      const config = PrimeNGFormTestUtils.builder().primeCheckboxField({ key: 'acceptTerms', label: 'Acceptterms' }).build();

      const { fixture } = await PrimeNGFormTestUtils.createTest({
        config,
        initialValue: null as unknown,
      });

      const checkbox = fixture.debugElement.query(By.directive(Checkbox));
      expect(checkbox).toBeTruthy();
    });

    it('should handle programmatic value updates correctly', async () => {
      const config = PrimeNGFormTestUtils.builder().primeCheckboxField({ key: 'acceptTerms', label: 'Acceptterms' }).build();

      const { component, fixture } = await PrimeNGFormTestUtils.createTest({
        config,
        initialValue: { acceptTerms: false },
      });

      const checkbox = fixture.debugElement.query(By.directive(Checkbox));
      const checkboxComponent = checkbox.componentInstance;

      // Initial state
      expect(checkboxComponent.checked).toBe(false);

      // Update via programmatic value change
      fixture.componentRef.setInput('value', { acceptTerms: true });
      untracked(() => fixture.detectChanges());
      await fixture.whenStable();
      untracked(() => fixture.detectChanges());

      expect(checkboxComponent.checked).toBe(true);
      expect(PrimeNGFormTestUtils.getFormValue(component)['acceptTerms']).toBe(true);
    });
  });

  describe('Dynamic Text Support', () => {
    describe('Translation Service Integration', () => {
      it('should handle translation service with dynamic language updates for checkbox', async () => {
        const translationService = createTestTranslationService({
          'form.terms.label': 'Accept Terms and Conditions',
          'form.terms.hint': 'Please read and accept our terms',
        });

        const config = PrimeNGFormTestUtils.builder()
          .field({
            key: 'acceptTerms',
            type: 'checkbox',
            label: translationService.translate('form.terms.label'),
            props: {
              hint: translationService.translate('form.terms.hint'),
            },
          })
          .build();

        const { fixture } = await PrimeNGFormTestUtils.createTest({
          config,
          initialValue: { acceptTerms: false },
        });

        await fixture.whenStable();
        untracked(() => fixture.detectChanges());
        const checkbox = fixture.debugElement.query(By.directive(Checkbox));
        const hint = fixture.debugElement.query(By.css('.p-hint'));

        // Initial translations
        expect(checkbox.nativeElement.textContent.trim()).toBe('Accept Terms and Conditions');
        expect(hint.nativeElement.textContent.trim()).toBe('Please read and accept our terms');

        // Update to Spanish
        translationService.addTranslations({
          'form.terms.label': 'Aceptar Términos y Condiciones',
          'form.terms.hint': 'Por favor lea y acepte nuestros términos',
        });
        translationService.setLanguage('es');
        untracked(() => fixture.detectChanges());

        expect(checkbox.nativeElement.textContent.trim()).toBe('Aceptar Términos y Condiciones');
        expect(hint.nativeElement.textContent.trim()).toBe('Por favor lea y acepte nuestros términos');
      });
    });
  });
});
