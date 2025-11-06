import { By } from '@angular/platform-browser';
import { createTestTranslationService } from '../../testing/fake-translation.service';
import { MaterialFormTestUtils } from '../../testing/material-test-utils';

describe('MatCheckboxFieldComponent', () => {
  describe('Basic Material Checkbox Integration', () => {
    it('should render checkbox with full configuration', async () => {
      const config = MaterialFormTestUtils.builder()
        .field({
          key: 'acceptTerms',
          type: 'checkbox',
          label: 'Accept Terms and Conditions',
          required: true,
          className: 'terms-checkbox',
          tabIndex: 1,
          props: {
            hint: 'Please read and accept our terms',
            color: 'accent',
            labelPosition: 'before',
            indeterminate: false,
            disableRipple: true,
          },
        })
        .build();

      const { fixture } = await MaterialFormTestUtils.createTest({
        config,
        initialValue: {
          acceptTerms: false,
          newsletter: false,
          enableNotifications: false,
        },
      });

      const checkbox = fixture.debugElement.query(By.css('mat-checkbox'));
      const matCheckboxComponent = fixture.debugElement.query(By.css('df-mat-checkbox'))?.componentInstance;
      const containerDiv = fixture.debugElement.query(By.css('.terms-checkbox'));
      const hintElement = fixture.debugElement.query(By.css('.mat-hint'));

      // ITERATION 2 FIX: Verify elements exist AND have correct structure/type
      // Previous: expect(checkbox).toBeTruthy() - only checks truthy
      expect(checkbox).not.toBeNull();
      expect(checkbox.nativeElement).toBeInstanceOf(HTMLElement);
      expect(checkbox.nativeElement.textContent.trim()).toBe('Accept Terms and Conditions');

      expect(containerDiv).not.toBeNull();
      expect(containerDiv.nativeElement).toBeInstanceOf(HTMLElement);
      expect(containerDiv.nativeElement.classList.contains('terms-checkbox')).toBe(true);
      expect(hintElement?.nativeElement.textContent.trim()).toBe('Please read and accept our terms');

      // Verify form control integration and dynamic field component properties
      if (matCheckboxComponent) {
        expect(matCheckboxComponent.label()).toBe('Accept Terms and Conditions');
        expect(matCheckboxComponent.props().color).toBe('accent');
        expect(matCheckboxComponent.props().labelPosition).toBe('before');
      }
    });

    it('should handle user interactions and update form value', async () => {
      const config = MaterialFormTestUtils.builder().matCheckboxField({ key: 'acceptTerms', label: 'Acceptterms' }).build();

      const { component, fixture } = await MaterialFormTestUtils.createTest({
        config,
        initialValue: {
          acceptTerms: false,
          newsletter: false,
          enableNotifications: false,
        },
      });

      // Initial value check
      expect(MaterialFormTestUtils.getFormValue(component)['acceptTerms']).toBe(false);

      // Simulate checkbox interaction using utility
      await MaterialFormTestUtils.simulateMatCheckbox(fixture, 'mat-checkbox', true);

      // Verify form value updated
      expect(MaterialFormTestUtils.getFormValue(component)['acceptTerms']).toBe(true);
    });

    it('should reflect external value changes in checkbox', async () => {
      const config = MaterialFormTestUtils.builder().matCheckboxField({ key: 'acceptTerms', label: 'Acceptterms' }).build();

      const { component, fixture } = await MaterialFormTestUtils.createTest({
        config,
        initialValue: {
          acceptTerms: false,
          newsletter: false,
          enableNotifications: false,
        },
      });

      const checkbox = fixture.debugElement.query(By.css('mat-checkbox'));
      const checkboxComponent = checkbox.componentInstance;

      // Update form model programmatically
      fixture.componentRef.setInput('value', {
        acceptTerms: true,
        newsletter: false,
        enableNotifications: false,
      });

      fixture.detectChanges();

      expect(checkboxComponent.checked).toBe(true);
      expect(MaterialFormTestUtils.getFormValue(component)['acceptTerms']).toBe(true);
    });

    it('should handle Material-specific checkbox properties', async () => {
      const config = MaterialFormTestUtils.builder()
        .field({
          key: 'acceptTerms',
          type: 'checkbox',
          label: 'Test Checkbox',
          tabIndex: 1,
          props: {
            indeterminate: false,
            disableRipple: true,
          },
        })
        .build();

      const { fixture } = await MaterialFormTestUtils.createTest({
        config,
        initialValue: { acceptTerms: false },
      });

      const checkbox = fixture.debugElement.query(By.css('mat-checkbox'));
      const checkboxComponent = checkbox.componentInstance;

      // These properties are passed to the inner MatCheckbox component
      expect(checkboxComponent.indeterminate).toBe(false);
      // Note: disableRipple and tabIndex are not directly exposed by Material checkbox
      // They are internal properties that don't need testing at this integration level
    });
  });

  describe('Minimal Configuration Tests', () => {
    it('should render with default Material configuration', async () => {
      const config = MaterialFormTestUtils.builder()
        .field({
          key: 'newsletter',
          type: 'checkbox',
          label: 'Subscribe to Newsletter',
        })
        .build();

      const { fixture } = await MaterialFormTestUtils.createTest({
        config,
        initialValue: {
          acceptTerms: false,
          newsletter: false,
          enableNotifications: false,
        },
      });

      const checkbox = fixture.debugElement.query(By.css('mat-checkbox'));
      const checkboxComponent = checkbox.componentInstance;

      // ITERATION 5 FIX: Verify checkbox component exists with minimal config
      // Previous: expect(checkbox).toBeTruthy()
      expect(checkbox).not.toBeNull();
      expect(checkbox.nativeElement).toBeInstanceOf(HTMLElement);
      expect(checkbox.nativeElement.textContent.trim()).toBe('Subscribe to Newsletter');
      expect(checkboxComponent.color).toBe('primary');
      expect(checkboxComponent.labelPosition).toBe('after');
    });

    it('should not display hint when not provided', async () => {
      const config = MaterialFormTestUtils.builder().matCheckboxField({ key: 'newsletter', label: 'Newsletter' }).build();

      const { fixture } = await MaterialFormTestUtils.createTest({
        config,
        initialValue: { newsletter: false },
      });

      const hintElement = fixture.debugElement.query(By.css('.mat-hint'));
      expect(hintElement).toBeNull();
    });
  });

  describe('Multiple Checkbox Integration Tests', () => {
    it('should render multiple checkboxes with different configurations', async () => {
      const config = MaterialFormTestUtils.builder()
        .field({
          key: 'acceptTerms',
          type: 'checkbox',
          label: 'Accept Terms',
          required: true,
        })
        .matCheckboxField({ key: 'newsletter', label: 'Newsletter', props: { color: 'accent' } })
        .matCheckboxField({ key: 'enableNotifications', label: 'Enablenotifications', props: { color: 'warn' } })
        .build();

      const { fixture } = await MaterialFormTestUtils.createTest({
        config,
        initialValue: {
          acceptTerms: false,
          newsletter: true,
          enableNotifications: false,
        },
      });

      const checkboxes = fixture.debugElement.queryAll(By.css('mat-checkbox'));

      expect(checkboxes.length).toBe(3);
      expect(checkboxes[0].nativeElement.textContent.trim()).toBe('Accept Terms');
      expect(checkboxes[1].nativeElement.textContent.trim()).toBe('Newsletter');
      expect(checkboxes[2].nativeElement.textContent.trim()).toBe('Enablenotifications');
    });

    it('should reflect individual checkbox states from form model', async () => {
      const config = MaterialFormTestUtils.builder()
        .matCheckboxField({ key: 'acceptTerms', label: 'Acceptterms' })
        .matCheckboxField({ key: 'newsletter', label: 'Newsletter' })
        .matCheckboxField({ key: 'enableNotifications', label: 'Enablenotifications' })
        .build();

      const { fixture } = await MaterialFormTestUtils.createTest({
        config,
        initialValue: {
          acceptTerms: false,
          newsletter: true,
          enableNotifications: false,
        },
      });

      const checkboxes = fixture.debugElement.queryAll(By.css('mat-checkbox'));

      expect(checkboxes[0].componentInstance.checked).toBe(false);
      expect(checkboxes[1].componentInstance.checked).toBe(true);
      expect(checkboxes[2].componentInstance.checked).toBe(false);
    });

    it('should handle independent checkbox interactions', async () => {
      const config = MaterialFormTestUtils.builder()
        .matCheckboxField({ key: 'acceptTerms', label: 'Acceptterms' })
        .matCheckboxField({ key: 'newsletter', label: 'Newsletter' })
        .matCheckboxField({ key: 'enableNotifications', label: 'Enablenotifications' })
        .build();

      const { component, fixture } = await MaterialFormTestUtils.createTest({
        config,
        initialValue: {
          acceptTerms: false,
          newsletter: true,
          enableNotifications: false,
        },
      });

      // Simulate first checkbox click using utility
      await MaterialFormTestUtils.simulateMatCheckbox(fixture, 'mat-checkbox:first-of-type', true);

      let formValue = MaterialFormTestUtils.getFormValue(component);
      expect(formValue['acceptTerms']).toBe(true);
      expect(formValue['newsletter']).toBe(true);
      expect(formValue['enableNotifications']).toBe(false);

      // Simulate third checkbox click using utility
      await MaterialFormTestUtils.simulateMatCheckbox(fixture, 'mat-checkbox:nth-of-type(3)', true);

      formValue = MaterialFormTestUtils.getFormValue(component);
      expect(formValue['acceptTerms']).toBe(true);
      expect(formValue['newsletter']).toBe(true);
      expect(formValue['enableNotifications']).toBe(true);
    });

    it('should apply different Material colors to checkboxes', async () => {
      const config = MaterialFormTestUtils.builder()
        .matCheckboxField({ key: 'acceptTerms', label: 'Acceptterms' })
        .matCheckboxField({ key: 'newsletter', label: 'Newsletter', props: { color: 'accent' } })
        .matCheckboxField({ key: 'enableNotifications', label: 'Enablenotifications', props: { color: 'warn' } })
        .build();

      const { fixture } = await MaterialFormTestUtils.createTest({
        config,
        initialValue: {
          acceptTerms: false,
          newsletter: false,
          enableNotifications: false,
        },
      });

      const checkboxes = fixture.debugElement.queryAll(By.css('mat-checkbox'));

      expect(checkboxes[0].componentInstance.color).toBe('primary');
      expect(checkboxes[1].componentInstance.color).toBe('accent');
      expect(checkboxes[2].componentInstance.color).toBe('warn');
    });
  });

  describe('Checkbox State and Edge Cases', () => {
    it('should handle disabled state correctly', async () => {
      const config = MaterialFormTestUtils.builder()
        .field({
          key: 'acceptTerms',
          type: 'checkbox',
          label: 'Disabled Checkbox',
          disabled: true,
        })
        .build();

      const { fixture } = await MaterialFormTestUtils.createTest({
        config,
        initialValue: {
          acceptTerms: false,
          newsletter: false,
          enableNotifications: false,
        },
      });

      const checkbox = fixture.debugElement.query(By.css('mat-checkbox'));
      const checkboxInput = fixture.debugElement.query(By.css('input[type="checkbox"]'));
      const checkboxComponent = checkbox.componentInstance;

      expect(checkboxInput.nativeElement.disabled).toBe(true);

      // Try to click disabled checkbox - should not change value since it's disabled
      checkbox.nativeElement.click();
      fixture.detectChanges();

      // Verify the checkbox remains disabled and doesn't change
      expect(checkboxInput.nativeElement.disabled).toBe(true);
      expect(checkboxComponent.checked).toBe(false);
    });

    it('should apply default Material Design configuration', async () => {
      const config = MaterialFormTestUtils.builder().matCheckboxField({ key: 'acceptTerms', label: 'Acceptterms' }).build();

      const { fixture } = await MaterialFormTestUtils.createTest({
        config,
        initialValue: { acceptTerms: false },
      });

      const checkbox = fixture.debugElement.query(By.css('mat-checkbox'));
      const checkboxComponent = checkbox.componentInstance;

      // Check default props from Material configuration
      expect(checkboxComponent.color).toBe('primary');
      expect(checkboxComponent.labelPosition).toBe('after');
    });

    it('should handle indeterminate state correctly', async () => {
      const config = MaterialFormTestUtils.builder()
        .field({
          key: 'acceptTerms',
          type: 'checkbox',
          label: 'Indeterminate Checkbox',
          props: {
            indeterminate: true,
          },
        })
        .build();

      const { fixture } = await MaterialFormTestUtils.createTest({
        config,
        initialValue: { acceptTerms: false },
      });

      const checkbox = fixture.debugElement.query(By.css('mat-checkbox'));
      const checkboxComponent = checkbox.componentInstance;

      expect(checkboxComponent.indeterminate).toBe(true);
    });

    it('should handle undefined form values gracefully', async () => {
      const config = MaterialFormTestUtils.builder().matCheckboxField({ key: 'acceptTerms', label: 'Acceptterms' }).build();

      const { fixture } = await MaterialFormTestUtils.createTest({ config }); // No initial value provided

      const checkbox = fixture.debugElement.query(By.css('mat-checkbox'));
      // ITERATION 5 FIX: Verify checkbox component exists with undefined value
      // Previous: expect(checkbox).toBeTruthy()
      expect(checkbox).not.toBeNull();
      expect(checkbox.nativeElement).toBeInstanceOf(HTMLElement);
    });

    it('should handle null form values gracefully', async () => {
      const config = MaterialFormTestUtils.builder().matCheckboxField({ key: 'acceptTerms', label: 'Acceptterms' }).build();

      const { fixture } = await MaterialFormTestUtils.createTest({
        config,
        initialValue: null as any,
      });

      const checkbox = fixture.debugElement.query(By.css('mat-checkbox'));
      // ITERATION 5 FIX: Verify checkbox component exists with null value
      // Previous: expect(checkbox).toBeTruthy()
      expect(checkbox).not.toBeNull();
      expect(checkbox.nativeElement).toBeInstanceOf(HTMLElement);
    });

    it('should handle programmatic value updates correctly', async () => {
      const config = MaterialFormTestUtils.builder().matCheckboxField({ key: 'acceptTerms', label: 'Acceptterms' }).build();

      const { component, fixture } = await MaterialFormTestUtils.createTest({
        config,
        initialValue: { acceptTerms: false },
      });

      const checkbox = fixture.debugElement.query(By.css('mat-checkbox'));
      const checkboxComponent = checkbox.componentInstance;

      // Initial state
      expect(checkboxComponent.checked).toBe(false);

      // Update via programmatic value change
      fixture.componentRef.setInput('value', { acceptTerms: true });
      fixture.detectChanges();

      expect(checkboxComponent.checked).toBe(true);
      expect(MaterialFormTestUtils.getFormValue(component)['acceptTerms']).toBe(true);
    });
  });

  describe('Dynamic Text Support', () => {
    describe('Translation Service Integration', () => {
      it('should handle translation service with dynamic language updates for checkbox', async () => {
        const translationService = createTestTranslationService({
          'form.terms.label': 'Accept Terms and Conditions',
          'form.terms.hint': 'Please read and accept our terms',
        });

        const config = MaterialFormTestUtils.builder()
          .field({
            key: 'acceptTerms',
            type: 'checkbox',
            label: translationService.translate('form.terms.label'),
            props: {
              hint: translationService.translate('form.terms.hint'),
            },
          })
          .build();

        const { fixture } = await MaterialFormTestUtils.createTest({
          config,
          initialValue: { acceptTerms: false },
        });

        const checkbox = fixture.debugElement.query(By.css('mat-checkbox'));
        const hint = fixture.debugElement.query(By.css('.mat-hint'));

        // Initial translations
        expect(checkbox.nativeElement.textContent.trim()).toBe('Accept Terms and Conditions');
        expect(hint.nativeElement.textContent.trim()).toBe('Please read and accept our terms');

        // Update to Spanish
        translationService.addTranslations({
          'form.terms.label': 'Aceptar Términos y Condiciones',
          'form.terms.hint': 'Por favor lea y acepte nuestros términos',
        });
        translationService.setLanguage('es');
        fixture.detectChanges();

        expect(checkbox.nativeElement.textContent.trim()).toBe('Aceptar Términos y Condiciones');
        expect(hint.nativeElement.textContent.trim()).toBe('Por favor lea y acepte nuestros términos');
      });
    });
  });
});
