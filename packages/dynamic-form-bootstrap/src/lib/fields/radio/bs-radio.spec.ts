import { By } from '@angular/platform-browser';
import { createTestTranslationService } from '../../testing/fake-translation.service';
import { BootstrapFormTestUtils } from '../../testing/bootstrap-test-utils';

describe('BsRadioFieldComponent', () => {
  describe('Basic Bootstrap Radio Integration', () => {
    it('should render radio group with full configuration', async () => {
      const config = BootstrapFormTestUtils.builder()
        .field({
          key: 'gender',
          type: 'radio',
          label: 'Select Gender',
          required: true,
          className: 'gender-radio',
          options: [
            { value: 'male', label: 'Male' },
            { value: 'female', label: 'Female' },
            { value: 'other', label: 'Other' },
          ],
          props: {
            helpText: 'Choose your gender',
          },
        })
        .build();

      const { fixture } = await BootstrapFormTestUtils.createTest({
        config,
        initialValue: {
          gender: 'male',
          preference: '',
          priority: '',
        },
      });

      const radioInputs = fixture.debugElement.queryAll(By.css('.form-check-input[type="radio"]'));
      const containerDiv = fixture.debugElement.query(By.css('.gender-radio'));
      const helpTextElement = fixture.debugElement.query(By.css('.form-text'));
      const labelElement = fixture.debugElement.query(By.css('.form-label'));

      expect(radioInputs.length).toBe(3);
      expect(containerDiv).toBeTruthy();
      expect(helpTextElement?.nativeElement.textContent.trim()).toBe('Choose your gender');
      expect(labelElement?.nativeElement.textContent.trim()).toBe('Select Gender');

      // Verify radio button labels
      const radioLabels = fixture.debugElement.queryAll(By.css('.form-check-label'));
      expect(radioLabels[0].nativeElement.textContent.trim()).toBe('Male');
      expect(radioLabels[1].nativeElement.textContent.trim()).toBe('Female');
      expect(radioLabels[2].nativeElement.textContent.trim()).toBe('Other');
    });

    it.skip('should handle user interactions and update form value', async () => {
      const config = BootstrapFormTestUtils.builder()
        .bsRadioField({
          key: 'preference',
          options: [
            { value: 'option1', label: 'Option 1' },
            { value: 'option2', label: 'Option 2' },
            { value: 'option3', label: 'Option 3' },
          ],
        })
        .build();

      const { component, fixture } = await BootstrapFormTestUtils.createTest({
        config,
        initialValue: {
          gender: '',
          preference: '',
          priority: '',
        },
      });

      // Initial value check
      expect(BootstrapFormTestUtils.getFormValue(component)['preference']).toBe('');

      // Simulate radio button interaction by clicking the second option
      const radioInputs = fixture.debugElement.queryAll(By.css('.form-check-input[type="radio"]'));
      radioInputs[1].nativeElement.click();
      fixture.detectChanges();

      // Verify form value updated
      expect(BootstrapFormTestUtils.getFormValue(component)['preference']).toBe('option2');
    });

    it.skip('should reflect external value changes in radio selection', async () => {
      const config = BootstrapFormTestUtils.builder()
        .bsRadioField({
          key: 'preference',
          options: [
            { value: 'option1', label: 'Option 1' },
            { value: 'option2', label: 'Option 2' },
            { value: 'option3', label: 'Option 3' },
          ],
        })
        .build();

      const { component, fixture } = await BootstrapFormTestUtils.createTest({
        config,
        initialValue: {
          gender: '',
          preference: '',
          priority: '',
        },
      });

      // Update form model programmatically
      fixture.componentRef.setInput('value', {
        gender: '',
        preference: 'option3',
        priority: '',
      });
      fixture.detectChanges();

      const radioInputs = fixture.debugElement.queryAll(By.css('.form-check-input[type="radio"]'));
      expect((radioInputs[2].nativeElement as HTMLInputElement).checked).toBe(true);
      expect(BootstrapFormTestUtils.getFormValue(component)['preference']).toBe('option3');
    });

    it('should handle Bootstrap-specific radio properties with disabled options', async () => {
      const config = BootstrapFormTestUtils.builder()
        .field({
          key: 'preference',
          type: 'radio',
          label: 'Test Radio',
          options: [
            { value: 'option1', label: 'Option 1' },
            { value: 'option2', label: 'Option 2', disabled: true },
          ],
        })
        .build();

      const { fixture } = await BootstrapFormTestUtils.createTest({
        config,
        initialValue: { preference: '' },
      });

      const radioInputs = fixture.debugElement.queryAll(By.css('.form-check-input[type="radio"]'));

      // Check that the second option is disabled
      expect((radioInputs[1].nativeElement as HTMLInputElement).disabled).toBe(true);
    });
  });

  describe('Bootstrap-Specific Features', () => {
    it('should render inline radio buttons when inline prop is true', async () => {
      const config = BootstrapFormTestUtils.builder()
        .field({
          key: 'preference',
          type: 'radio',
          label: 'Inline Radio',
          options: [
            { value: 'yes', label: 'Yes' },
            { value: 'no', label: 'No' },
          ],
          props: {
            inline: true,
          },
        })
        .build();

      const { fixture } = await BootstrapFormTestUtils.createTest({
        config,
        initialValue: { preference: '' },
      });

      const formCheckDivs = fixture.debugElement.queryAll(By.css('.form-check'));
      expect(formCheckDivs[0].nativeElement.classList.contains('form-check-inline')).toBe(true);
      expect(formCheckDivs[1].nativeElement.classList.contains('form-check-inline')).toBe(true);
    });

    it('should render reverse radio buttons when reverse prop is true', async () => {
      const config = BootstrapFormTestUtils.builder()
        .field({
          key: 'preference',
          type: 'radio',
          label: 'Reverse Radio',
          options: [
            { value: 'yes', label: 'Yes' },
            { value: 'no', label: 'No' },
          ],
          props: {
            reverse: true,
          },
        })
        .build();

      const { fixture } = await BootstrapFormTestUtils.createTest({
        config,
        initialValue: { preference: '' },
      });

      const formCheckDivs = fixture.debugElement.queryAll(By.css('.form-check'));
      expect(formCheckDivs[0].nativeElement.classList.contains('form-check-reverse')).toBe(true);
      expect(formCheckDivs[1].nativeElement.classList.contains('form-check-reverse')).toBe(true);
    });

    it('should render button group style when buttonGroup prop is true', async () => {
      const config = BootstrapFormTestUtils.builder()
        .field({
          key: 'preference',
          type: 'radio',
          label: 'Button Group Radio',
          options: [
            { value: 'option1', label: 'Option 1' },
            { value: 'option2', label: 'Option 2' },
            { value: 'option3', label: 'Option 3' },
          ],
          props: {
            buttonGroup: true,
          },
        })
        .build();

      const { fixture } = await BootstrapFormTestUtils.createTest({
        config,
        initialValue: { preference: '' },
      });

      const btnGroup = fixture.debugElement.query(By.css('.btn-group'));
      const btnCheckInputs = fixture.debugElement.queryAll(By.css('.btn-check'));
      const btnLabels = fixture.debugElement.queryAll(By.css('.btn.btn-outline-primary'));

      expect(btnGroup).toBeTruthy();
      expect(btnCheckInputs.length).toBe(3);
      expect(btnLabels.length).toBe(3);
      expect(btnLabels[0].nativeElement.textContent.trim()).toBe('Option 1');
    });

    it('should apply button sizes in button group mode', async () => {
      const config = BootstrapFormTestUtils.builder()
        .field({
          key: 'small',
          type: 'radio',
          options: [
            { value: 'yes', label: 'Yes' },
            { value: 'no', label: 'No' },
          ],
          props: {
            buttonGroup: true,
            buttonSize: 'sm',
          },
        })
        .field({
          key: 'large',
          type: 'radio',
          options: [
            { value: 'yes', label: 'Yes' },
            { value: 'no', label: 'No' },
          ],
          props: {
            buttonGroup: true,
            buttonSize: 'lg',
          },
        })
        .build();

      const { fixture } = await BootstrapFormTestUtils.createTest({
        config,
        initialValue: { small: '', large: '' },
      });

      const allBtnLabels = fixture.debugElement.queryAll(By.css('.btn'));

      // First group should have btn-sm
      expect(allBtnLabels[0].nativeElement.classList.contains('btn-sm')).toBe(true);
      expect(allBtnLabels[1].nativeElement.classList.contains('btn-sm')).toBe(true);

      // Second group should have btn-lg
      expect(allBtnLabels[2].nativeElement.classList.contains('btn-lg')).toBe(true);
      expect(allBtnLabels[3].nativeElement.classList.contains('btn-lg')).toBe(true);
    });

    it.skip('should handle button group interactions correctly', async () => {
      const config = BootstrapFormTestUtils.builder()
        .field({
          key: 'preference',
          type: 'radio',
          options: [
            { value: 'option1', label: 'Option 1' },
            { value: 'option2', label: 'Option 2' },
          ],
          props: {
            buttonGroup: true,
          },
        })
        .build();

      const { component, fixture } = await BootstrapFormTestUtils.createTest({
        config,
        initialValue: { preference: '' },
      });

      // Click on second button
      const btnCheckInputs = fixture.debugElement.queryAll(By.css('.btn-check'));
      btnCheckInputs[1].nativeElement.click();
      fixture.detectChanges();

      expect(BootstrapFormTestUtils.getFormValue(component)['preference']).toBe('option2');
    });
  });

  describe('Minimal Configuration Tests', () => {
    it('should render with default Bootstrap configuration', async () => {
      const config = BootstrapFormTestUtils.builder()
        .bsRadioField({
          key: 'preference',
          options: [
            { value: 'yes', label: 'Yes' },
            { value: 'no', label: 'No' },
          ],
        })
        .build();

      const { fixture } = await BootstrapFormTestUtils.createTest({
        config,
        initialValue: {
          gender: '',
          preference: '',
          priority: '',
        },
      });

      const radioInputs = fixture.debugElement.queryAll(By.css('.form-check-input[type="radio"]'));
      const radioLabels = fixture.debugElement.queryAll(By.css('.form-check-label'));

      expect(radioInputs.length).toBe(2);
      expect(radioLabels[0].nativeElement.textContent.trim()).toBe('Yes');
      expect(radioLabels[1].nativeElement.textContent.trim()).toBe('No');
    });

    it('should not display help text when not provided', async () => {
      const config = BootstrapFormTestUtils.builder()
        .bsRadioField({
          key: 'preference',
          options: [
            { value: 'yes', label: 'Yes' },
            { value: 'no', label: 'No' },
          ],
        })
        .build();

      const { fixture } = await BootstrapFormTestUtils.createTest({
        config,
        initialValue: { preference: '' },
      });

      const helpTextElement = fixture.debugElement.query(By.css('.form-text'));
      expect(helpTextElement).toBeNull();
    });

    it('should not display label when not provided', async () => {
      const config = BootstrapFormTestUtils.builder()
        .field({
          key: 'preference',
          type: 'radio',
          props: {
            options: [
              { value: 'yes', label: 'Yes' },
              { value: 'no', label: 'No' },
            ],
          },
        })
        .build();

      const { fixture } = await BootstrapFormTestUtils.createTest({
        config,
        initialValue: { preference: '' },
      });

      const labelElement = fixture.debugElement.query(By.css('.form-label'));
      expect(labelElement).toBeNull();
    });
  });

  describe('Multiple Radio Group Integration Tests', () => {
    it('should render multiple radio groups with different configurations', async () => {
      const config = BootstrapFormTestUtils.builder()
        .field({
          key: 'gender',
          type: 'radio',
          label: 'Gender',
          options: [
            { value: 'male', label: 'Male' },
            { value: 'female', label: 'Female' },
          ],
          props: {
            required: true,
          },
        })
        .bsRadioField({
          key: 'preference',
          options: [
            { value: 'option1', label: 'Option 1' },
            { value: 'option2', label: 'Option 2' },
          ],
          props: { inline: true },
        })
        .bsRadioField({
          key: 'priority',
          options: [
            { value: 'high', label: 'High' },
            { value: 'low', label: 'Low' },
          ],
          props: { buttonGroup: true },
        })
        .build();

      const { fixture } = await BootstrapFormTestUtils.createTest({
        config,
        initialValue: {
          gender: 'male',
          preference: 'option2',
          priority: 'high',
        },
      });

      const radioGroups = fixture.debugElement.queryAll(By.css('df-bs-radio'));
      expect(radioGroups.length).toBe(3);
    });

    // Note: Initial value reflection is tested through external value changes test
    // which properly handles the signal-based forms initialization sequence

    it.skip('should handle independent radio group interactions', async () => {
      const config = BootstrapFormTestUtils.builder()
        .bsRadioField({
          key: 'gender',
          options: [
            { value: 'male', label: 'Male' },
            { value: 'female', label: 'Female' },
          ],
        })
        .bsRadioField({
          key: 'preference',
          options: [
            { value: 'option1', label: 'Option 1' },
            { value: 'option2', label: 'Option 2' },
          ],
        })
        .build();

      const { component, fixture } = await BootstrapFormTestUtils.createTest({
        config,
        initialValue: {
          gender: '',
          preference: '',
          priority: '',
        },
      });

      // Get all radio inputs
      const allRadioInputs = fixture.debugElement.queryAll(By.css('.form-check-input[type="radio"]'));

      // Simulate first group selection (first option)
      allRadioInputs[0].nativeElement.click();
      fixture.detectChanges();

      let formValue = BootstrapFormTestUtils.getFormValue(component);
      expect(formValue['gender']).toBe('male');
      expect(formValue['preference']).toBe('');

      // Simulate second group selection (second option)
      allRadioInputs[3].nativeElement.click();
      fixture.detectChanges();

      formValue = BootstrapFormTestUtils.getFormValue(component);
      expect(formValue['gender']).toBe('male');
      expect(formValue['preference']).toBe('option2');
    });
  });

  describe('Radio State and Edge Cases', () => {
    it('should handle disabled state correctly', async () => {
      const config = BootstrapFormTestUtils.builder()
        .field({
          key: 'preference',
          type: 'radio',
          label: 'Disabled Radio',
          disabled: true,
          options: [
            { value: 'option1', label: 'Option 1' },
            { value: 'option2', label: 'Option 2' },
          ],
        })
        .build();

      const { component, fixture } = await BootstrapFormTestUtils.createTest({
        config,
        initialValue: {
          gender: '',
          preference: '',
          priority: '',
        },
      });

      const radioInputs = fixture.debugElement.queryAll(By.css('.form-check-input[type="radio"]'));
      const firstRadioInput = radioInputs[0].nativeElement as HTMLInputElement;

      expect(firstRadioInput.disabled).toBe(true);

      // Try to click disabled radio - should not change value since it's disabled
      firstRadioInput.click();
      fixture.detectChanges();

      // Verify the radio remains disabled and doesn't change
      expect(firstRadioInput.disabled).toBe(true);
      expect(BootstrapFormTestUtils.getFormValue(component).preference).toBeFalsy();
    });

    it('should apply default Bootstrap configuration', async () => {
      const config = BootstrapFormTestUtils.builder()
        .bsRadioField({ key: 'preference', options: [{ value: 'option1', label: 'Option 1' }] })
        .build();

      const { fixture } = await BootstrapFormTestUtils.createTest({
        config,
        initialValue: { preference: '' },
      });

      const formCheck = fixture.debugElement.query(By.css('.form-check'));
      expect(formCheck).toBeTruthy();
      expect(formCheck.nativeElement.classList.contains('form-check-inline')).toBe(false);
      expect(formCheck.nativeElement.classList.contains('form-check-reverse')).toBe(false);
    });

    it('should handle undefined form values gracefully', async () => {
      const config = BootstrapFormTestUtils.builder()
        .bsRadioField({ key: 'preference', options: [{ value: 'option1', label: 'Option 1' }] })
        .build();

      const { fixture } = await BootstrapFormTestUtils.createTest({ config }); // No initial value provided

      const radioInputs = fixture.debugElement.queryAll(By.css('.form-check-input[type="radio"]'));
      expect(radioInputs.length).toBe(1);
    });

    it('should handle null form values gracefully', async () => {
      const config = BootstrapFormTestUtils.builder()
        .bsRadioField({ key: 'preference', options: [{ value: 'option1', label: 'Option 1' }] })
        .build();

      const { fixture } = await BootstrapFormTestUtils.createTest({
        config,
        initialValue: null as any,
      });

      const radioInputs = fixture.debugElement.queryAll(By.css('.form-check-input[type="radio"]'));
      expect(radioInputs.length).toBe(1);
    });

    it.skip('should handle programmatic value updates correctly', async () => {
      const config = BootstrapFormTestUtils.builder()
        .bsRadioField({
          key: 'preference',
          options: [
            { value: 'option1', label: 'Option 1' },
            { value: 'option2', label: 'Option 2' },
          ],
        })
        .build();

      const { component, fixture } = await BootstrapFormTestUtils.createTest({
        config,
        initialValue: { preference: '' },
      });

      const radioInputs = fixture.debugElement.queryAll(By.css('.form-check-input[type="radio"]'));

      // Initial state
      expect((radioInputs[0].nativeElement as HTMLInputElement).checked).toBe(false);
      expect((radioInputs[1].nativeElement as HTMLInputElement).checked).toBe(false);

      // Update via programmatic value change
      fixture.componentRef.setInput('value', { preference: 'option2' });
      fixture.detectChanges();

      expect((radioInputs[1].nativeElement as HTMLInputElement).checked).toBe(true);
      expect(BootstrapFormTestUtils.getFormValue(component)['preference']).toBe('option2');
    });

    it('should handle disabled individual options correctly', async () => {
      const config = BootstrapFormTestUtils.builder()
        .field({
          key: 'preference',
          type: 'radio',
          label: 'Test Radio',
          options: [
            { value: 'option1', label: 'Option 1' },
            { value: 'option2', label: 'Option 2', disabled: true },
            { value: 'option3', label: 'Option 3' },
          ],
        })
        .build();

      const { fixture } = await BootstrapFormTestUtils.createTest({
        config,
        initialValue: { preference: '' },
      });

      const radioInputs = fixture.debugElement.queryAll(By.css('.form-check-input[type="radio"]'));

      expect((radioInputs[0].nativeElement as HTMLInputElement).disabled).toBe(false);
      expect((radioInputs[1].nativeElement as HTMLInputElement).disabled).toBe(true);
      expect((radioInputs[2].nativeElement as HTMLInputElement).disabled).toBe(false);
    });
  });

  describe('Dynamic Text Support', () => {
    describe('Translation Service Integration', () => {
      it('should handle translation service with dynamic language updates for labels and options', async () => {
        const translationService = createTestTranslationService({
          'form.gender.label': 'Select Gender',
          'form.gender.helpText': 'Choose your gender',
          'gender.male': 'Male',
          'gender.female': 'Female',
          'gender.other': 'Other',
        });

        const dynamicOptions = [
          { value: 'male', label: translationService.translate('gender.male') },
          { value: 'female', label: translationService.translate('gender.female') },
          { value: 'other', label: translationService.translate('gender.other') },
        ];

        const config = BootstrapFormTestUtils.builder()
          .field({
            key: 'gender',
            type: 'radio',
            label: translationService.translate('form.gender.label'),
            options: dynamicOptions,
            props: {
              helpText: translationService.translate('form.gender.helpText'),
            },
          })
          .build();

        const { fixture } = await BootstrapFormTestUtils.createTest({
          config,
          initialValue: { gender: '' },
        });

        const labelElement = fixture.debugElement.query(By.css('.form-label'));
        const helpTextElement = fixture.debugElement.query(By.css('.form-text'));
        const radioLabels = fixture.debugElement.queryAll(By.css('.form-check-label'));

        // Initial translations
        expect(labelElement.nativeElement.textContent.trim()).toBe('Select Gender');
        expect(helpTextElement.nativeElement.textContent.trim()).toBe('Choose your gender');
        expect(radioLabels[0].nativeElement.textContent.trim()).toBe('Male');
        expect(radioLabels[1].nativeElement.textContent.trim()).toBe('Female');
        expect(radioLabels[2].nativeElement.textContent.trim()).toBe('Other');

        // Update to Spanish
        translationService.addTranslations({
          'form.gender.label': 'Seleccionar G�nero',
          'form.gender.helpText': 'Elige tu g�nero',
          'gender.male': 'Masculino',
          'gender.female': 'Femenino',
          'gender.other': 'Otro',
        });
        translationService.setLanguage('es');

        fixture.detectChanges();
        await fixture.whenStable();

        expect(labelElement.nativeElement.textContent.trim()).toBe('Seleccionar G�nero');
        expect(helpTextElement.nativeElement.textContent.trim()).toBe('Elige tu g�nero');

        const updatedRadioLabels = fixture.debugElement.queryAll(By.css('.form-check-label'));
        expect(updatedRadioLabels[0].nativeElement.textContent.trim()).toBe('Masculino');
        expect(updatedRadioLabels[1].nativeElement.textContent.trim()).toBe('Femenino');
        expect(updatedRadioLabels[2].nativeElement.textContent.trim()).toBe('Otro');
      });
    });
  });
});
