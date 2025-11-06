import { untracked } from '@angular/core';
import { By } from '@angular/platform-browser';
import { RadioButton } from 'primeng/radiobutton';
import { createTestTranslationService } from '../../testing/fake-translation.service';
import { PrimeNGFormTestUtils } from '../../testing/primeng-test-utils';

describe.skip('PrimeRadioFieldComponent', () => {
  describe('Basic PrimeNG Radio Integration', () => {
    it('should render radio group with full configuration', async () => {
      const config = PrimeNGFormTestUtils.builder()
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
            hint: 'Choose your gender',
            color: 'accent',
            labelPosition: 'before',
          },
        })
        .build();

      const { fixture } = await PrimeNGFormTestUtils.createTest({
        config,
        initialValue: {
          gender: 'male',
          preference: '',
          priority: '',
        },
      });

      const radioButtons = fixture.debugElement.queryAll(By.directive(RadioButton));
      const primeRadioComponent = fixture.debugElement.query(By.css('df-prime-radio'))?.componentInstance;
      const containerDiv = fixture.debugElement.query(By.css('.gender-radio'));
      const hintElement = fixture.debugElement.query(By.css('.p-field-hint'));
      const labelElement = fixture.debugElement.query(By.css('.radio-label'));

      expect(radioButtons.length).toBe(3);
      expect(containerDiv).toBeTruthy();
      expect(hintElement?.nativeElement.textContent.trim()).toBe('Choose your gender');
      expect(labelElement?.nativeElement.textContent.trim()).toBe('Select Gender');

      // Verify radio button labels
      expect(radioButtons[0].nativeElement.textContent.trim()).toBe('Male');
      expect(radioButtons[1].nativeElement.textContent.trim()).toBe('Female');
      expect(radioButtons[2].nativeElement.textContent.trim()).toBe('Other');

      // Verify form control integration and dynamic field component properties
      if (primeRadioComponent) {
        expect(primeRadioComponent.label()).toBe('Select Gender');
        expect(primeRadioComponent.props().color).toBe('accent');
        expect(primeRadioComponent.props().labelPosition).toBe('before');
      }
    });

    it('should handle user interactions and update form value', async () => {
      const config = PrimeNGFormTestUtils.builder()
        .primeRadioField({
          key: 'preference',
          options: [
            { value: 'option1', label: 'Option 1' },
            { value: 'option2', label: 'Option 2' },
            { value: 'option3', label: 'Option 3' },
          ],
        })
        .build();

      const { component, fixture } = await PrimeNGFormTestUtils.createTest({
        config,
        initialValue: {
          gender: '',
          preference: '',
          priority: '',
        },
      });

      // Initial value check
      expect(PrimeNGFormTestUtils.getFormValue(component)['preference']).toBe('');

      // Simulate radio button interaction by clicking the second option
      const radioButtons = fixture.debugElement.queryAll(By.directive(RadioButton));
      const secondRadioInput = radioButtons[1].nativeElement.querySelector('input[type="radio"]');

      // Simulate user click on radio button
      secondRadioInput.click();
      untracked(() => fixture.detectChanges());

      // Verify form value updated
      expect(PrimeNGFormTestUtils.getFormValue(component)['preference']).toBe('option2');
    });

    it('should reflect external value changes in radio selection', async () => {
      const config = PrimeNGFormTestUtils.builder()
        .primeRadioField({
          key: 'preference',
          options: [
            { value: 'option1', label: 'Option 1' },
            { value: 'option2', label: 'Option 2' },
            { value: 'option3', label: 'Option 3' },
          ],
        })
        .build();

      const { component, fixture } = await PrimeNGFormTestUtils.createTest({
        config,
        initialValue: {
          gender: '',
          preference: '',
          priority: '',
        },
      });

      const radioButtons = fixture.debugElement.queryAll(By.directive(RadioButton));

      // Update form model programmatically
      fixture.componentRef.setInput('value', {
        gender: '',
        preference: 'option3',
        priority: '',
      });
      untracked(() => fixture.detectChanges());

      expect(radioButtons[2].componentInstance.checked).toBe(true);
      expect(PrimeNGFormTestUtils.getFormValue(component)['preference']).toBe('option3');
    });

    it('should handle PrimeNG-specific radio properties', async () => {
      const config = PrimeNGFormTestUtils.builder()
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

      const { fixture } = await PrimeNGFormTestUtils.createTest({
        config,
        initialValue: { preference: '' },
      });

      const radioButtons = fixture.debugElement.queryAll(By.directive(RadioButton));

      // Check that the second option is disabled
      expect(radioButtons[1].componentInstance.disabled).toBe(true);
    });
  });

  describe('Minimal Configuration Tests', () => {
    it('should render with default PrimeNG configuration', async () => {
      const config = PrimeNGFormTestUtils.builder()
        .primeRadioField({
          key: 'preference',
          options: [
            { value: 'yes', label: 'Yes' },
            { value: 'no', label: 'No' },
          ],
        })
        .build();

      const { fixture } = await PrimeNGFormTestUtils.createTest({
        config,
        initialValue: {
          gender: '',
          preference: '',
          priority: '',
        },
      });

      const radioButtons = fixture.debugElement.queryAll(By.directive(RadioButton));

      expect(radioButtons.length).toBe(2);
      expect(radioButtons[0].nativeElement.textContent.trim()).toBe('Yes');
      expect(radioButtons[1].nativeElement.textContent.trim()).toBe('No');
    });

    it('should not display hint when not provided', async () => {
      const config = PrimeNGFormTestUtils.builder()
        .primeRadioField({
          key: 'preference',
          options: [
            { value: 'yes', label: 'Yes' },
            { value: 'no', label: 'No' },
          ],
        })
        .build();

      const { fixture } = await PrimeNGFormTestUtils.createTest({
        config,
        initialValue: { preference: '' },
      });

      const hintElement = fixture.debugElement.query(By.css('.p-field-hint'));
      expect(hintElement).toBeNull();
    });

    it('should not display label when not provided', async () => {
      const config = PrimeNGFormTestUtils.builder()
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

      const { fixture } = await PrimeNGFormTestUtils.createTest({
        config,
        initialValue: { preference: '' },
      });

      const labelElement = fixture.debugElement.query(By.css('.radio-label'));
      expect(labelElement).toBeNull();
    });
  });

  describe('Multiple Radio Group Integration Tests', () => {
    it('should render multiple radio groups with different configurations', async () => {
      const config = PrimeNGFormTestUtils.builder()
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
        .primeRadioField({
          key: 'preference',
          options: [
            { value: 'option1', label: 'Option 1' },
            { value: 'option2', label: 'Option 2' },
          ],
          props: { color: 'accent' },
        })
        .primeRadioField({
          key: 'priority',
          options: [
            { value: 'high', label: 'High' },
            { value: 'low', label: 'Low' },
          ],
          props: { color: 'warn' },
        })
        .build();

      const { fixture } = await PrimeNGFormTestUtils.createTest({
        config,
        initialValue: {
          gender: 'male',
          preference: 'option2',
          priority: 'high',
        },
      });

      const radioGroups = fixture.debugElement.queryAll(By.css('df-prime-radio'));

      expect(radioGroups.length).toBe(3);
    });

    it('should reflect individual radio group states from form model', async () => {
      const config = PrimeNGFormTestUtils.builder()
        .primeRadioField({
          key: 'gender',
          options: [
            { value: 'male', label: 'Male' },
            { value: 'female', label: 'Female' },
          ],
        })
        .primeRadioField({
          key: 'preference',
          options: [
            { value: 'option1', label: 'Option 1' },
            { value: 'option2', label: 'Option 2' },
          ],
        })
        .build();

      const { fixture } = await PrimeNGFormTestUtils.createTest({
        config,
        initialValue: {
          gender: 'female',
          preference: 'option1',
          priority: '',
        },
      });

      const radioButtons = fixture.debugElement.queryAll(By.directive(RadioButton));
      const genderRadios = radioButtons.slice(0, 2);
      const preferenceRadios = radioButtons.slice(2, 4);

      expect(genderRadios[1].componentInstance.checked).toBe(true);
      expect(preferenceRadios[0].componentInstance.checked).toBe(true);
    });

    it('should handle independent radio group interactions', async () => {
      const config = PrimeNGFormTestUtils.builder()
        .primeRadioField({
          key: 'gender',
          options: [
            { value: 'male', label: 'Male' },
            { value: 'female', label: 'Female' },
          ],
        })
        .primeRadioField({
          key: 'preference',
          options: [
            { value: 'option1', label: 'Option 1' },
            { value: 'option2', label: 'Option 2' },
          ],
        })
        .build();

      const { component, fixture } = await PrimeNGFormTestUtils.createTest({
        config,
        initialValue: {
          gender: '',
          preference: '',
          priority: '',
        },
      });

      // Get all radio buttons from first group
      const firstGroupRadios = fixture.debugElement.queryAll(By.css('df-prime-radio:first-child p-radiobutton'));
      const secondGroupRadios = fixture.debugElement.queryAll(By.css('df-prime-radio:last-child p-radiobutton'));

      // Simulate first group selection
      const firstGroupFirstRadio = firstGroupRadios[0].nativeElement.querySelector('input[type="radio"]');
      firstGroupFirstRadio.click();
      untracked(() => fixture.detectChanges());

      let formValue = PrimeNGFormTestUtils.getFormValue(component);
      expect(formValue['gender']).toBe('male');
      expect(formValue['preference']).toBe('');

      // Simulate second group selection
      const secondGroupSecondRadio = secondGroupRadios[1].nativeElement.querySelector('input[type="radio"]');
      secondGroupSecondRadio.click();
      untracked(() => fixture.detectChanges());

      formValue = PrimeNGFormTestUtils.getFormValue(component);
      expect(formValue['gender']).toBe('male');
      expect(formValue['preference']).toBe('option2');
    });

    it('should apply different PrimeNG colors to radio groups', async () => {
      const config = PrimeNGFormTestUtils.builder()
        .primeRadioField({ key: 'gender', options: [{ value: 'male', label: 'Male' }] })
        .primeRadioField({ key: 'preference', options: [{ value: 'option1', label: 'Option 1' }], props: { color: 'accent' } })
        .primeRadioField({ key: 'priority', options: [{ value: 'high', label: 'High' }], props: { color: 'warn' } })
        .build();

      const { fixture } = await PrimeNGFormTestUtils.createTest({
        config,
        initialValue: {
          gender: '',
          preference: '',
          priority: '',
        },
      });

      const radioComponents = fixture.debugElement.queryAll(By.css('df-prime-radio'));

      expect(radioComponents[0].componentInstance.props().color).toBe('primary');
      expect(radioComponents[1].componentInstance.props().color).toBe('accent');
      expect(radioComponents[2].componentInstance.props().color).toBe('warn');
    });
  });

  describe('Radio State and Edge Cases', () => {
    it('should handle disabled state correctly', async () => {
      const config = PrimeNGFormTestUtils.builder()
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

      const { component, fixture } = await PrimeNGFormTestUtils.createTest({
        config,
        initialValue: {
          gender: '',
          preference: '',
          priority: '',
        },
      });

      const radioButtons = fixture.debugElement.queryAll(By.directive(RadioButton));
      const firstRadioInput = radioButtons[0].nativeElement.querySelector('input[type="radio"]');

      expect(firstRadioInput.disabled).toBe(true);

      // Try to click disabled radio - should not change value since it's disabled
      firstRadioInput.click();
      untracked(() => fixture.detectChanges());

      // Verify the radio group remains disabled and doesn't change
      expect(firstRadioInput.disabled).toBe(true);
      expect(PrimeNGFormTestUtils.getFormValue(component).gender).toBeFalsy();
    });

    it('should apply default PrimeNG Design configuration', async () => {
      const config = PrimeNGFormTestUtils.builder()
        .primeRadioField({ key: 'preference', options: [{ value: 'option1', label: 'Option 1' }] })
        .build();

      const { fixture } = await PrimeNGFormTestUtils.createTest({
        config,
        initialValue: { preference: '' },
      });

      const primeRadioComponent = fixture.debugElement.query(By.css('df-prime-radio'))?.componentInstance;

      // Check default props from PrimeNG configuration
      expect(primeRadioComponent.props().color).toBe('primary');
      expect(primeRadioComponent.props().labelPosition).toBe('after');
    });

    it('should handle undefined form values gracefully', async () => {
      const config = PrimeNGFormTestUtils.builder()
        .primeRadioField({ key: 'preference', options: [{ value: 'option1', label: 'Option 1' }] })
        .build();

      const { fixture } = await PrimeNGFormTestUtils.createTest({ config }); // No initial value provided

      const radioButtons = fixture.debugElement.queryAll(By.directive(RadioButton));
      expect(radioButtons.length).toBeGreaterThan(0);
    });

    it('should handle null form values gracefully', async () => {
      const config = PrimeNGFormTestUtils.builder()
        .primeRadioField({ key: 'preference', options: [{ value: 'option1', label: 'Option 1' }] })
        .build();

      const { fixture } = await PrimeNGFormTestUtils.createTest({
        config,
        initialValue: null as unknown,
      });

      const radioButtons = fixture.debugElement.queryAll(By.directive(RadioButton));
      expect(radioButtons.length).toBeGreaterThan(0);
    });

    it('should handle programmatic value updates correctly', async () => {
      const config = PrimeNGFormTestUtils.builder()
        .primeRadioField({
          key: 'preference',
          options: [
            { value: 'option1', label: 'Option 1' },
            { value: 'option2', label: 'Option 2' },
          ],
        })
        .build();

      const { component, fixture } = await PrimeNGFormTestUtils.createTest({
        config,
        initialValue: { preference: '' },
      });

      const radioButtons = fixture.debugElement.queryAll(By.directive(RadioButton));

      // Initial state
      expect(radioButtons[0].componentInstance.checked).toBeFalsy();
      expect(radioButtons[1].componentInstance.checked).toBeFalsy();

      // Update via programmatic value change
      fixture.componentRef.setInput('value', { preference: 'option2' });
      untracked(() => fixture.detectChanges());

      expect(radioButtons[1].componentInstance.checked).toBe(true);
      expect(PrimeNGFormTestUtils.getFormValue(component)['preference']).toBe('option2');
    });

    it('should handle disabled individual options correctly', async () => {
      const config = PrimeNGFormTestUtils.builder()
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

      const { fixture } = await PrimeNGFormTestUtils.createTest({
        config,
        initialValue: { preference: '' },
      });

      const radioButtons = fixture.debugElement.queryAll(By.directive(RadioButton));

      expect(radioButtons[0].componentInstance.disabled).toBe(false);
      expect(radioButtons[1].componentInstance.disabled).toBe(true);
      expect(radioButtons[2].componentInstance.disabled).toBe(false);
    });
  });

  describe('Dynamic Text Support', () => {
    describe('Translation Service Integration', () => {
      it('should handle translation service with dynamic language updates for labels and options', async () => {
        const translationService = createTestTranslationService({
          'form.gender.label': 'Select Gender',
          'form.gender.hint': 'Choose your gender',
          'gender.male': 'Male',
          'gender.female': 'Female',
          'gender.other': 'Other',
        });

        const dynamicOptions = [
          { value: 'male', label: translationService.translate('gender.male') },
          { value: 'female', label: translationService.translate('gender.female') },
          { value: 'other', label: translationService.translate('gender.other') },
        ];

        const config = PrimeNGFormTestUtils.builder()
          .field({
            key: 'gender',
            type: 'radio',
            label: translationService.translate('form.gender.label'),
            options: dynamicOptions,
            props: {
              hint: translationService.translate('form.gender.hint'),
            },
          })
          .build();

        const { fixture } = await PrimeNGFormTestUtils.createTest({
          config,
          initialValue: { gender: '' },
        });

        const labelElement = fixture.debugElement.query(By.css('.radio-label'));
        const hintElement = fixture.debugElement.query(By.css('.p-field-hint'));
        const radioButtons = fixture.debugElement.queryAll(By.directive(RadioButton));

        // Initial translations
        expect(labelElement.nativeElement.textContent.trim()).toBe('Select Gender');
        expect(hintElement.nativeElement.textContent.trim()).toBe('Choose your gender');
        expect(radioButtons[0].nativeElement.textContent.trim()).toBe('Male');
        expect(radioButtons[1].nativeElement.textContent.trim()).toBe('Female');
        expect(radioButtons[2].nativeElement.textContent.trim()).toBe('Other');

        // Update to Spanish
        translationService.addTranslations({
          'form.gender.label': 'Seleccionar Género',
          'form.gender.hint': 'Elige tu género',
          'gender.male': 'Masculino',
          'gender.female': 'Femenino',
          'gender.other': 'Otro',
        });
        translationService.setLanguage('es');

        untracked(() => fixture.detectChanges());
        await fixture.whenStable();

        expect(labelElement.nativeElement.textContent.trim()).toBe('Seleccionar Género');
        expect(hintElement.nativeElement.textContent.trim()).toBe('Elige tu género');

        const updatedRadioButtons = fixture.debugElement.queryAll(By.directive(RadioButton));
        expect(updatedRadioButtons[0].nativeElement.textContent.trim()).toBe('Masculino');
        expect(updatedRadioButtons[1].nativeElement.textContent.trim()).toBe('Femenino');
        expect(updatedRadioButtons[2].nativeElement.textContent.trim()).toBe('Otro');
      });
    });
  });
});
