import { By } from '@angular/platform-browser';
import { MatRadioButton, MatRadioGroup } from '@angular/material/radio';
import { createTestTranslationService } from '../../testing/fake-translation.service';
import { MaterialFormTestUtils } from '../../testing/material-test-utils';

describe('MatRadioFieldComponent', () => {
  describe('Basic Material Radio Integration', () => {
    it('should render radio group with full configuration', async () => {
      const config = MaterialFormTestUtils.builder()
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

      const { fixture } = await MaterialFormTestUtils.createTest({
        config,
        initialValue: {
          gender: 'male',
          preference: '',
          priority: '',
        },
      });

      const radioGroup = fixture.debugElement.query(By.css('mat-radio-group'));
      const radioButtons = fixture.debugElement.queryAll(By.css('mat-radio-button'));
      const matRadioComponent = fixture.debugElement.query(By.css('df-mat-radio'))?.componentInstance;
      const containerDiv = fixture.debugElement.query(By.css('.gender-radio'));
      const hintElement = fixture.debugElement.query(By.css('.mat-hint'));
      const labelElement = fixture.debugElement.query(By.css('.radio-label'));

      // ITERATION 3 FIX: Verify radio group and container structure
      // Previous: expect(radioGroup).toBeTruthy()
      expect(radioGroup).not.toBeNull();
      expect(radioGroup.nativeElement.tagName.toLowerCase()).toBe('mat-radio-group');
      expect(radioButtons.length).toBe(3);

      // ITERATION 3 FIX: Verify container element structure
      // Previous: expect(containerDiv).toBeTruthy()
      expect(containerDiv).not.toBeNull();
      expect(containerDiv.nativeElement).toBeInstanceOf(HTMLElement);
      expect(containerDiv.nativeElement.classList.contains('gender-radio')).toBe(true);
      expect(hintElement?.nativeElement.textContent.trim()).toBe('Choose your gender');
      expect(labelElement?.nativeElement.textContent.trim()).toBe('Select Gender');

      // Verify radio button labels
      expect(radioButtons[0].nativeElement.textContent.trim()).toBe('Male');
      expect(radioButtons[1].nativeElement.textContent.trim()).toBe('Female');
      expect(radioButtons[2].nativeElement.textContent.trim()).toBe('Other');

      // Verify form control integration and dynamic field component properties
      if (matRadioComponent) {
        expect(matRadioComponent.label()).toBe('Select Gender');
        expect(matRadioComponent.props().color).toBe('accent');
        expect(matRadioComponent.props().labelPosition).toBe('before');
      }
    });

    it('should handle user interactions and update form value', async () => {
      const config = MaterialFormTestUtils.builder()
        .matRadioField({
          key: 'preference',
          options: [
            { value: 'option1', label: 'Option 1' },
            { value: 'option2', label: 'Option 2' },
            { value: 'option3', label: 'Option 3' },
          ],
        })
        .build();

      const { component, fixture } = await MaterialFormTestUtils.createTest({
        config,
        initialValue: {
          gender: '',
          preference: '',
          priority: '',
        },
      });

      // Initial value check
      expect(MaterialFormTestUtils.getFormValue(component)['preference']).toBe('');

      // Simulate radio button interaction by clicking the second option
      const radioButtons = fixture.debugElement.queryAll(By.css('mat-radio-button'));
      const secondRadioInput = radioButtons[1].nativeElement.querySelector('input[type="radio"]');

      // Simulate user click on radio button
      secondRadioInput.click();
      fixture.detectChanges();

      // Verify form value updated
      expect(MaterialFormTestUtils.getFormValue(component)['preference']).toBe('option2');
    });

    it('should reflect external value changes in radio selection', async () => {
      const config = MaterialFormTestUtils.builder()
        .matRadioField({
          key: 'preference',
          options: [
            { value: 'option1', label: 'Option 1' },
            { value: 'option2', label: 'Option 2' },
            { value: 'option3', label: 'Option 3' },
          ],
        })
        .build();

      const { component, fixture } = await MaterialFormTestUtils.createTest({
        config,
        initialValue: {
          gender: '',
          preference: '',
          priority: '',
        },
      });

      const radioGroup = fixture.debugElement.query(By.css('mat-radio-group'));
      const radioGroupComponent = radioGroup.componentInstance;

      // Update form model programmatically
      fixture.componentRef.setInput('value', {
        gender: '',
        preference: 'option3',
        priority: '',
      });
      fixture.detectChanges();

      expect(radioGroupComponent.field()().value()).toBe('option3');
      expect(MaterialFormTestUtils.getFormValue(component)['preference']).toBe('option3');
    });

    it('should handle Material-specific radio properties', async () => {
      const config = MaterialFormTestUtils.builder()
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

      const { fixture } = await MaterialFormTestUtils.createTest({
        config,
        initialValue: { preference: '' },
      });

      const radioButtons = fixture.debugElement.queryAll(By.css('mat-radio-button'));

      // Check that the second option is disabled
      expect(radioButtons[1].componentInstance.disabled).toBe(true);
    });
  });

  describe('Minimal Configuration Tests', () => {
    it('should render with default Material configuration', async () => {
      const config = MaterialFormTestUtils.builder()
        .matRadioField({
          key: 'preference',
          options: [
            { value: 'yes', label: 'Yes' },
            { value: 'no', label: 'No' },
          ],
        })
        .build();

      const { fixture } = await MaterialFormTestUtils.createTest({
        config,
        initialValue: {
          gender: '',
          preference: '',
          priority: '',
        },
      });

      const radioGroup = fixture.debugElement.query(By.css('mat-radio-group'));
      const radioButtons = fixture.debugElement.queryAll(By.css('mat-radio-button'));

      expect(radioGroup).toBeTruthy();
      expect(radioButtons.length).toBe(2);
      expect(radioButtons[0].nativeElement.textContent.trim()).toBe('Yes');
      expect(radioButtons[1].nativeElement.textContent.trim()).toBe('No');
    });

    it('should not display hint when not provided', async () => {
      const config = MaterialFormTestUtils.builder()
        .matRadioField({
          key: 'preference',
          options: [
            { value: 'yes', label: 'Yes' },
            { value: 'no', label: 'No' },
          ],
        })
        .build();

      const { fixture } = await MaterialFormTestUtils.createTest({
        config,
        initialValue: { preference: '' },
      });

      const hintElement = fixture.debugElement.query(By.css('.mat-hint'));
      expect(hintElement).toBeNull();
    });

    it('should not display label when not provided', async () => {
      const config = MaterialFormTestUtils.builder()
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

      const { fixture } = await MaterialFormTestUtils.createTest({
        config,
        initialValue: { preference: '' },
      });

      const labelElement = fixture.debugElement.query(By.css('.radio-label'));
      expect(labelElement).toBeNull();
    });
  });

  describe('Multiple Radio Group Integration Tests', () => {
    it('should render multiple radio groups with different configurations', async () => {
      const config = MaterialFormTestUtils.builder()
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
        .matRadioField({
          key: 'preference',
          options: [
            { value: 'option1', label: 'Option 1' },
            { value: 'option2', label: 'Option 2' },
          ],
          props: { color: 'accent' },
        })
        .matRadioField({
          key: 'priority',
          options: [
            { value: 'high', label: 'High' },
            { value: 'low', label: 'Low' },
          ],
          props: { color: 'warn' },
        })
        .build();

      const { fixture } = await MaterialFormTestUtils.createTest({
        config,
        initialValue: {
          gender: 'male',
          preference: 'option2',
          priority: 'high',
        },
      });

      const radioGroups = fixture.debugElement.queryAll(By.css('mat-radio-group'));

      expect(radioGroups.length).toBe(3);
    });

    it('should reflect individual radio group states from form model', async () => {
      const config = MaterialFormTestUtils.builder()
        .matRadioField({
          key: 'gender',
          options: [
            { value: 'male', label: 'Male' },
            { value: 'female', label: 'Female' },
          ],
        })
        .matRadioField({
          key: 'preference',
          options: [
            { value: 'option1', label: 'Option 1' },
            { value: 'option2', label: 'Option 2' },
          ],
        })
        .build();

      const { fixture } = await MaterialFormTestUtils.createTest({
        config,
        initialValue: {
          gender: 'female',
          preference: 'option1',
          priority: '',
        },
      });

      const radioGroups = fixture.debugElement.queryAll(By.css('mat-radio-group'));

      expect(radioGroups[0].componentInstance.field()().value()).toBe('female');
      expect(radioGroups[1].componentInstance.field()().value()).toBe('option1');
    });

    it('should handle independent radio group interactions', async () => {
      const config = MaterialFormTestUtils.builder()
        .matRadioField({
          key: 'gender',
          options: [
            { value: 'male', label: 'Male' },
            { value: 'female', label: 'Female' },
          ],
        })
        .matRadioField({
          key: 'preference',
          options: [
            { value: 'option1', label: 'Option 1' },
            { value: 'option2', label: 'Option 2' },
          ],
        })
        .build();

      const { component, fixture } = await MaterialFormTestUtils.createTest({
        config,
        initialValue: {
          gender: '',
          preference: '',
          priority: '',
        },
      });

      // Get all radio buttons from first group
      const firstGroupRadios = fixture.debugElement.queryAll(By.css('df-mat-radio:first-child mat-radio-button'));
      const secondGroupRadios = fixture.debugElement.queryAll(By.css('df-mat-radio:last-child mat-radio-button'));

      // Simulate first group selection
      const firstGroupFirstRadio = firstGroupRadios[0].nativeElement.querySelector('input[type="radio"]');
      firstGroupFirstRadio.click();
      fixture.detectChanges();

      let formValue = MaterialFormTestUtils.getFormValue(component);
      expect(formValue['gender']).toBe('male');
      expect(formValue['preference']).toBe('');

      // Simulate second group selection
      const secondGroupSecondRadio = secondGroupRadios[1].nativeElement.querySelector('input[type="radio"]');
      secondGroupSecondRadio.click();
      fixture.detectChanges();

      formValue = MaterialFormTestUtils.getFormValue(component);
      expect(formValue['gender']).toBe('male');
      expect(formValue['preference']).toBe('option2');
    });

    it('should apply different Material colors to radio groups', async () => {
      const config = MaterialFormTestUtils.builder()
        .matRadioField({ key: 'gender', options: [{ value: 'male', label: 'Male' }] })
        .matRadioField({ key: 'preference', options: [{ value: 'option1', label: 'Option 1' }], props: { color: 'accent' } })
        .matRadioField({ key: 'priority', options: [{ value: 'high', label: 'High' }], props: { color: 'warn' } })
        .build();

      const { fixture } = await MaterialFormTestUtils.createTest({
        config,
        initialValue: {
          gender: '',
          preference: '',
          priority: '',
        },
      });

      const radioButtons = fixture.debugElement.queryAll(By.css('mat-radio-button'));

      expect(radioButtons[0].componentInstance.color).toBe('primary');
      expect(radioButtons[1].componentInstance.color).toBe('accent');
      expect(radioButtons[2].componentInstance.color).toBe('warn');
    });
  });

  describe('Radio State and Edge Cases', () => {
    it('should handle disabled state correctly', async () => {
      const config = MaterialFormTestUtils.builder()
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

      const { component, fixture } = await MaterialFormTestUtils.createTest({
        config,
        initialValue: {
          gender: '',
          preference: '',
          priority: '',
        },
      });

      const radioGroup = fixture.debugElement.query(By.css('mat-radio-group'));
      const radioButtons = fixture.debugElement.queryAll(By.css('mat-radio-button'));
      const firstRadioInput = radioButtons[0].nativeElement.querySelector('input[type="radio"]');

      expect(firstRadioInput.disabled).toBe(true);

      // Try to click disabled radio - should not change value since it's disabled
      firstRadioInput.click();
      fixture.detectChanges();

      // Verify the radio group remains disabled and doesn't change
      expect(firstRadioInput.disabled).toBe(true);
      expect(MaterialFormTestUtils.getFormValue(component).gender).toBeFalsy();
    });

    it('should apply default Material Design configuration', async () => {
      const config = MaterialFormTestUtils.builder()
        .matRadioField({ key: 'preference', options: [{ value: 'option1', label: 'Option 1' }] })
        .build();

      const { fixture } = await MaterialFormTestUtils.createTest({
        config,
        initialValue: { preference: '' },
      });

      const radioButtons = fixture.debugElement.queryAll(By.css('mat-radio-button'));

      // Check default props from Material configuration
      expect(radioButtons[0].componentInstance.color).toBe('primary');
      expect(radioButtons[0].componentInstance.labelPosition).toBe('after');
    });

    it('should handle undefined form values gracefully', async () => {
      const config = MaterialFormTestUtils.builder()
        .matRadioField({ key: 'preference', options: [{ value: 'option1', label: 'Option 1' }] })
        .build();

      const { fixture } = await MaterialFormTestUtils.createTest({ config }); // No initial value provided

      const radioGroup = fixture.debugElement.query(By.css('mat-radio-group'));
      expect(radioGroup).toBeTruthy();
    });

    it('should handle null form values gracefully', async () => {
      const config = MaterialFormTestUtils.builder()
        .matRadioField({ key: 'preference', options: [{ value: 'option1', label: 'Option 1' }] })
        .build();

      const { fixture } = await MaterialFormTestUtils.createTest({
        config,
        initialValue: null as any,
      });

      const radioGroup = fixture.debugElement.query(By.css('mat-radio-group'));
      expect(radioGroup).toBeTruthy();
    });

    it('should handle programmatic value updates correctly', async () => {
      const config = MaterialFormTestUtils.builder()
        .matRadioField({
          key: 'preference',
          options: [
            { value: 'option1', label: 'Option 1' },
            { value: 'option2', label: 'Option 2' },
          ],
        })
        .build();

      const { component, fixture } = await MaterialFormTestUtils.createTest({
        config,
        initialValue: { preference: '' },
      });

      const radioGroup = fixture.debugElement.query(By.css('mat-radio-group'));
      const radioGroupComponent = radioGroup.componentInstance;

      // Initial state
      expect(radioGroupComponent.field()().value()).toBeFalsy();

      // Update via programmatic value change
      fixture.componentRef.setInput('value', { preference: 'option2' });
      fixture.detectChanges();

      expect(radioGroupComponent.field()().value()).toBe('option2');
      expect(MaterialFormTestUtils.getFormValue(component)['preference']).toBe('option2');
    });

    it('should handle disabled individual options correctly', async () => {
      const config = MaterialFormTestUtils.builder()
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

      const { fixture } = await MaterialFormTestUtils.createTest({
        config,
        initialValue: { preference: '' },
      });

      const radioButtons = fixture.debugElement.queryAll(By.css('mat-radio-button'));

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

        const config = MaterialFormTestUtils.builder()
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

        const { fixture } = await MaterialFormTestUtils.createTest({
          config,
          initialValue: { gender: '' },
        });

        const labelElement = fixture.debugElement.query(By.css('.radio-label'));
        const hintElement = fixture.debugElement.query(By.css('.mat-hint'));
        const radioButtons = fixture.debugElement.queryAll(By.css('mat-radio-button'));

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

        fixture.detectChanges();
        await fixture.whenStable();

        expect(labelElement.nativeElement.textContent.trim()).toBe('Seleccionar Género');
        expect(hintElement.nativeElement.textContent.trim()).toBe('Elige tu género');

        const updatedRadioButtons = fixture.debugElement.queryAll(By.css('mat-radio-button'));
        expect(updatedRadioButtons[0].nativeElement.textContent.trim()).toBe('Masculino');
        expect(updatedRadioButtons[1].nativeElement.textContent.trim()).toBe('Femenino');
        expect(updatedRadioButtons[2].nativeElement.textContent.trim()).toBe('Otro');
      });
    });
  });
});
