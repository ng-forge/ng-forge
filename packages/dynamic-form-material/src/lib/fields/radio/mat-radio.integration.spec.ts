import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideAnimations } from '@angular/platform-browser/animations';
import { By } from '@angular/platform-browser';
import { DebugElement } from '@angular/core';
import { MatRadioButton, MatRadioGroup } from '@angular/material/radio';
import { DynamicForm, FormConfig, provideDynamicForm } from '@ng-forge/dynamic-form';
import { delay, waitForDFInit } from '../../testing';
import { withMaterialFields } from '../../providers/material-providers';

interface TestFormModel {
  gender: string;
  preference: string;
  priority: string;
}

describe('MatRadioFieldComponent - Dynamic Form Integration', () => {
  let component: DynamicForm;
  let fixture: ComponentFixture<DynamicForm>;
  let debugElement: DebugElement;

  const createComponent = (config: FormConfig, initialValue?: Partial<TestFormModel>) => {
    fixture = TestBed.createComponent(DynamicForm<any>);
    component = fixture.componentInstance;
    debugElement = fixture.debugElement;

    fixture.componentRef.setInput('config', config);
    if (initialValue !== undefined) {
      fixture.componentRef.setInput('value', initialValue);
    }
    fixture.detectChanges();

    return { component, fixture, debugElement };
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DynamicForm],
      providers: [provideAnimations(), provideDynamicForm(...withMaterialFields())],
    }).compileComponents();
  });

  describe('Basic Material Radio Integration', () => {
    it('should render radio group with full configuration', async () => {
      const config: FormConfig = {
        fields: [
          {
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
          },
        ],
      };

      createComponent(config, {
        gender: 'male',
        preference: '',
        priority: '',
      });

      await waitForDFInit(component, fixture);

      const radioGroup = debugElement.query(By.directive(MatRadioGroup));
      const radioButtons = debugElement.queryAll(By.directive(MatRadioButton));
      const matRadioComponent = debugElement.query(By.css('df-mat-radio'))?.componentInstance;
      const containerDiv = debugElement.query(By.css('.gender-radio'));
      const hintElement = debugElement.query(By.css('.mat-hint'));
      const labelElement = debugElement.query(By.css('.radio-label'));

      expect(radioGroup).toBeTruthy();
      expect(radioButtons.length).toBe(3);
      expect(containerDiv).toBeTruthy();
      expect(hintElement?.nativeElement.textContent.trim()).toBe('Choose your gender');
      expect(labelElement?.nativeElement.textContent.trim()).toBe('Select Gender');

      // Verify radio button labels
      expect(radioButtons[0].nativeElement.textContent.trim()).toBe('Male');
      expect(radioButtons[1].nativeElement.textContent.trim()).toBe('Female');
      expect(radioButtons[2].nativeElement.textContent.trim()).toBe('Other');

      // Verify form control integration and dynamic field component properties
      if (matRadioComponent) {
        expect(matRadioComponent.label()).toBe('Select Gender');
        expect(matRadioComponent.color()).toBe('accent');
        expect(matRadioComponent.labelPosition()).toBe('before');
      }
    });

    it('should handle user interactions and update form value', async () => {
      const config: FormConfig = {
        fields: [
          {
            key: 'preference',
            type: 'radio',
            label: 'Select Preference',
            options: [
              { value: 'option1', label: 'Option 1' },
              { value: 'option2', label: 'Option 2' },
              { value: 'option3', label: 'Option 3' },
            ],
          },
        ],
      };

      const { component } = createComponent(config, {
        gender: '',
        preference: '',
        priority: '',
      });

      await waitForDFInit(component, fixture);

      // Initial value check
      expect(component.formValue()['preference']).toBe('');

      // Simulate radio button interaction by clicking the second option
      const radioButtons = debugElement.queryAll(By.directive(MatRadioButton));
      const secondRadioInput = radioButtons[1].nativeElement.querySelector('input[type="radio"]');

      // Simulate user click on radio button
      secondRadioInput.click();
      fixture.detectChanges();

      await delay();
      fixture.detectChanges();

      // Verify form value updated
      expect(component.formValue()['preference']).toBe('option2');
    });

    it('should reflect external value changes in radio selection', async () => {
      const config: FormConfig = {
        fields: [
          {
            key: 'preference',
            type: 'radio',
            label: 'Select Preference',
            options: [
              { value: 'option1', label: 'Option 1' },
              { value: 'option2', label: 'Option 2' },
              { value: 'option3', label: 'Option 3' },
            ],
          },
        ],
      };

      const { component } = createComponent(config, {
        gender: '',
        preference: '',
        priority: '',
      });

      await waitForDFInit(component, fixture);

      const radioGroup = debugElement.query(By.directive(MatRadioGroup));
      const radioGroupComponent = radioGroup.componentInstance;

      // Update form model programmatically
      fixture.componentRef.setInput('value', {
        gender: '',
        preference: 'option3',
        priority: '',
      });
      fixture.detectChanges();

      await delay();
      fixture.detectChanges();

      expect(radioGroupComponent.value()).toBe('option3');
      expect(component.formValue()['preference']).toBe('option3');
    });

    it('should handle Material-specific radio properties', async () => {
      const config: FormConfig = {
        fields: [
          {
            key: 'preference',
            type: 'radio',
            label: 'Test Radio',

            options: [
              { value: 'option1', label: 'Option 1' },
              { value: 'option2', label: 'Option 2', disabled: true },
            ],
          },
        ],
      };

      createComponent(config, { preference: '' });

      await waitForDFInit(component, fixture);

      const radioButtons = debugElement.queryAll(By.directive(MatRadioButton));

      // Check that the second option is disabled
      expect(radioButtons[1].componentInstance.disabled).toBe(true);
    });
  });

  describe('Minimal Configuration Tests', () => {
    it('should render with default Material configuration', async () => {
      const config: FormConfig = {
        fields: [
          {
            key: 'preference',
            type: 'radio',
            label: 'Simple Radio',
            options: [
              { value: 'yes', label: 'Yes' },
              { value: 'no', label: 'No' },
            ],
          },
        ],
      };

      createComponent(config, {
        gender: '',
        preference: '',
        priority: '',
      });

      await waitForDFInit(component, fixture);

      const radioGroup = debugElement.query(By.directive(MatRadioGroup));
      const radioButtons = debugElement.queryAll(By.directive(MatRadioButton));

      expect(radioGroup).toBeTruthy();
      expect(radioButtons.length).toBe(2);
      expect(radioButtons[0].nativeElement.textContent.trim()).toBe('Yes');
      expect(radioButtons[1].nativeElement.textContent.trim()).toBe('No');
    });

    it('should not display hint when not provided', async () => {
      const config: FormConfig = {
        fields: [
          {
            key: 'preference',
            type: 'radio',
            label: 'Simple Radio',
            options: [
              { value: 'yes', label: 'Yes' },
              { value: 'no', label: 'No' },
            ],
          },
        ],
      };

      createComponent(config, { preference: '' });

      await waitForDFInit(component, fixture);

      const hintElement = debugElement.query(By.css('.mat-hint'));
      expect(hintElement).toBeNull();
    });

    it('should not display label when not provided', async () => {
      const config: FormConfig = {
        fields: [
          {
            key: 'preference',
            type: 'radio',
            props: {
              options: [
                { value: 'yes', label: 'Yes' },
                { value: 'no', label: 'No' },
              ],
            },
          },
        ],
      } as any;

      createComponent(config, { preference: '' });

      await waitForDFInit(component, fixture);

      const labelElement = debugElement.query(By.css('.radio-label'));
      expect(labelElement).toBeNull();
    });
  });

  describe('Multiple Radio Group Integration Tests', () => {
    it('should render multiple radio groups with different configurations', async () => {
      const config: FormConfig = {
        fields: [
          {
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
          },
          {
            key: 'preference',
            type: 'radio',
            label: 'Preference',
            options: [
              { value: 'option1', label: 'Option 1' },
              { value: 'option2', label: 'Option 2' },
            ],
            props: {
              color: 'accent',
            },
          },
          {
            key: 'priority',
            type: 'radio',
            label: 'Priority',
            options: [
              { value: 'high', label: 'High' },
              { value: 'low', label: 'Low' },
            ],
            props: {
              color: 'warn',
            },
          },
        ],
      };

      createComponent(config, {
        gender: 'male',
        preference: 'option2',
        priority: 'high',
      });

      await waitForDFInit(component, fixture);

      const radioGroups = debugElement.queryAll(By.directive(MatRadioGroup));

      expect(radioGroups.length).toBe(3);
    });

    it('should reflect individual radio group states from form model', async () => {
      const config: FormConfig = {
        fields: [
          {
            key: 'gender',
            type: 'radio',
            label: 'Gender',
            options: [
              { value: 'male', label: 'Male' },
              { value: 'female', label: 'Female' },
            ],
          },
          {
            key: 'preference',
            type: 'radio',
            label: 'Preference',
            options: [
              { value: 'option1', label: 'Option 1' },
              { value: 'option2', label: 'Option 2' },
            ],
          },
        ],
      };

      createComponent(config, {
        gender: 'female',
        preference: 'option1',
        priority: '',
      });

      await waitForDFInit(component, fixture);

      const radioGroups = debugElement.queryAll(By.directive(MatRadioGroup));

      expect(radioGroups[0].componentInstance.value()).toBe('female');
      expect(radioGroups[1].componentInstance.value()).toBe('option1');
    });

    it('should handle independent radio group interactions', async () => {
      const config: FormConfig = {
        fields: [
          {
            key: 'gender',
            type: 'radio',
            label: 'Gender',

            options: [
              { value: 'male', label: 'Male' },
              { value: 'female', label: 'Female' },
            ],
          },
          {
            key: 'preference',
            type: 'radio',
            label: 'Preference',

            options: [
              { value: 'option1', label: 'Option 1' },
              { value: 'option2', label: 'Option 2' },
            ],
          },
        ],
      };

      const { component } = createComponent(config, {
        gender: '',
        preference: '',
        priority: '',
      });

      await delay();
      fixture.detectChanges();

      // Get all radio buttons from first group
      const firstGroupRadios = debugElement.queryAll(By.css('df-mat-radio:first-child mat-radio-button'));
      const secondGroupRadios = debugElement.queryAll(By.css('df-mat-radio:last-child mat-radio-button'));

      // Simulate first group selection
      const firstGroupFirstRadio = firstGroupRadios[0].nativeElement.querySelector('input[type="radio"]');
      firstGroupFirstRadio.click();
      fixture.detectChanges();
      await delay();

      let formValue = component.formValue();
      expect(formValue['gender']).toBe('male');
      expect(formValue['preference']).toBe('');

      // Simulate second group selection
      const secondGroupSecondRadio = secondGroupRadios[1].nativeElement.querySelector('input[type="radio"]');
      secondGroupSecondRadio.click();
      fixture.detectChanges();
      await delay();

      formValue = component.formValue();
      expect(formValue['gender']).toBe('male');
      expect(formValue['preference']).toBe('option2');
    });

    it('should apply different Material colors to radio groups', async () => {
      const config: FormConfig = {
        fields: [
          {
            key: 'gender',
            type: 'radio',
            label: 'Gender',
            options: [{ value: 'male', label: 'Male' }],
          },
          {
            key: 'preference',
            type: 'radio',
            label: 'Preference',
            options: [{ value: 'option1', label: 'Option 1' }],
            props: {
              color: 'accent',
            },
          },
          {
            key: 'priority',
            type: 'radio',
            label: 'Priority',
            options: [{ value: 'high', label: 'High' }],
            props: {
              color: 'warn',
            },
          },
        ],
      };

      createComponent(config, {
        gender: '',
        preference: '',
        priority: '',
      });

      await delay();
      fixture.detectChanges();

      const radioButtons = debugElement.queryAll(By.directive(MatRadioButton));

      expect(radioButtons[0].componentInstance.color).toBe('primary');
      expect(radioButtons[1].componentInstance.color).toBe('accent');
      expect(radioButtons[2].componentInstance.color).toBe('warn');
    });
  });

  describe('Radio State and Edge Cases', () => {
    it('should handle disabled state correctly', async () => {
      const config: FormConfig = {
        fields: [
          {
            key: 'preference',
            type: 'radio',
            label: 'Disabled Radio',
            disabled: true,

            options: [
              { value: 'option1', label: 'Option 1' },
              { value: 'option2', label: 'Option 2' },
            ],
          },
        ],
      };

      createComponent(config, {
        gender: '',
        preference: '',
        priority: '',
      });

      await waitForDFInit(component, fixture);

      const radioGroup = debugElement.query(By.directive(MatRadioGroup));
      const radioButtons = debugElement.queryAll(By.directive(MatRadioButton));
      const firstRadioInput = radioButtons[0].nativeElement.querySelector('input[type="radio"]');

      expect(firstRadioInput.disabled).toBe(true);

      // Try to click disabled radio - should not change value since it's disabled

      firstRadioInput.click();
      fixture.detectChanges();

      // Verify the radio group remains disabled and doesn't change
      expect(firstRadioInput.disabled).toBe(true);
      expect(component.formValue().gender).toBeFalsy();
    });

    it('should apply default Material Design configuration', async () => {
      const config: FormConfig = {
        fields: [
          {
            key: 'preference',
            type: 'radio',
            label: 'Test Radio',
            options: [{ value: 'option1', label: 'Option 1' }],
          },
        ],
      };

      createComponent(config, { preference: '' });

      await waitForDFInit(component, fixture);

      const radioButtons = debugElement.queryAll(By.directive(MatRadioButton));

      // Check default props from Material configuration
      expect(radioButtons[0].componentInstance.color).toBe('primary');
      expect(radioButtons[0].componentInstance.labelPosition).toBe('after');
    });

    it('should handle undefined form values gracefully', async () => {
      const config: FormConfig = {
        fields: [
          {
            key: 'preference',
            type: 'radio',
            label: 'Test Radio',
            options: [{ value: 'option1', label: 'Option 1' }],
          },
        ],
      };

      createComponent(config); // No initial value provided

      await waitForDFInit(component, fixture);

      const radioGroup = debugElement.query(By.directive(MatRadioGroup));
      expect(radioGroup).toBeTruthy();
    });

    it('should handle null form values gracefully', async () => {
      const config: FormConfig = {
        fields: [
          {
            key: 'preference',
            type: 'radio',
            label: 'Test Radio',
            options: [{ value: 'option1', label: 'Option 1' }],
          },
        ],
      };

      createComponent(config, null as unknown as TestFormModel);

      await waitForDFInit(component, fixture);

      const radioGroup = debugElement.query(By.directive(MatRadioGroup));
      expect(radioGroup).toBeTruthy();
    });

    it('should handle programmatic value updates correctly', async () => {
      const config: FormConfig = {
        fields: [
          {
            key: 'preference',
            type: 'radio',
            label: 'Test Radio',
            options: [
              { value: 'option1', label: 'Option 1' },
              { value: 'option2', label: 'Option 2' },
            ],
          },
        ],
      } as any;

      const { component } = createComponent(config, { preference: '' });

      await waitForDFInit(component, fixture);

      const radioGroup = debugElement.query(By.directive(MatRadioGroup));
      const radioGroupComponent = radioGroup.componentInstance;

      // Initial state
      expect(radioGroupComponent.value()).toBeFalsy();

      // Update via programmatic value change
      fixture.componentRef.setInput('value', { preference: 'option2' });
      fixture.detectChanges();

      await delay();
      fixture.detectChanges();

      expect(radioGroupComponent.value()).toBe('option2');
      expect(component.formValue()['preference']).toBe('option2');
    });

    it('should handle disabled individual options correctly', async () => {
      const config: FormConfig = {
        fields: [
          {
            key: 'preference',
            type: 'radio',
            label: 'Test Radio',
            options: [
              { value: 'option1', label: 'Option 1' },
              { value: 'option2', label: 'Option 2', disabled: true },
              { value: 'option3', label: 'Option 3' },
            ],
          },
        ],
      } as any;

      createComponent(config, { preference: '' });

      await waitForDFInit(component, fixture);

      const radioButtons = debugElement.queryAll(By.directive(MatRadioButton));

      expect(radioButtons[0].componentInstance.disabled).toBe(false);
      expect(radioButtons[1].componentInstance.disabled).toBe(true);
      expect(radioButtons[2].componentInstance.disabled).toBe(false);
    });
  });
});
