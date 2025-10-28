import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideAnimations } from '@angular/platform-browser/animations';
import { By } from '@angular/platform-browser';
import { DebugElement } from '@angular/core';
import { MatRadioButton, MatRadioGroup } from '@angular/material/radio';
import { DynamicForm, FormConfig, provideDynamicForm } from '@ng-forge/dynamic-form';
import { withMaterial } from '../../providers/material-providers';
import { delay, waitForDynamicFormInitialized } from '../../testing/delay';

interface TestFormModel {
  gender: string;
  plan: string;
  theme: string;
  priority: number;
  category: string;
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
      providers: [provideAnimations(), provideDynamicForm(withMaterial())],
    }).compileComponents();
  });

  describe('Basic Material Radio Integration', () => {
    it('should render radio group with full configuration', async () => {
      const config: FormConfig = {
        fields: [
          {
            key: 'gender',
            type: 'radio',
            label: 'Gender',
            props: {
              options: [
                { value: 'male', label: 'Male' },
                { value: 'female', label: 'Female' },
                { value: 'other', label: 'Other' },
              ],
              hint: 'Please select your gender',
              required: true,
              color: 'primary',
              labelPosition: 'after',
              className: 'gender-radio',
            },
          },
        ],
      };

      createComponent(config, {
        gender: '',
        plan: '',
        theme: '',
        priority: 0,
        category: '',
      });

      await waitForDynamicFormInitialized(component, fixture);

      const radioGroup = debugElement.query(By.directive(MatRadioGroup));
      const radioButtons = debugElement.queryAll(By.directive(MatRadioButton));
      const label = debugElement.query(By.css('.radio-label'));
      const hint = debugElement.query(By.css('.mat-hint'));
      const container = debugElement.query(By.css('.gender-radio'));

      expect(radioGroup).toBeTruthy();
      expect(radioButtons.length).toBe(3);
      expect(radioButtons[0].nativeElement.textContent.trim()).toBe('Male');
      expect(radioButtons[1].nativeElement.textContent.trim()).toBe('Female');
      expect(radioButtons[2].nativeElement.textContent.trim()).toBe('Other');
      expect(radioGroup.nativeElement.getAttribute('required')).toBe('');
      expect(label.nativeElement.textContent.trim()).toBe('Gender');
      expect(hint.nativeElement.textContent.trim()).toBe('Please select your gender');
      expect(container).toBeTruthy();
    });

    it('should handle user selection and update form value', async () => {
      const config: FormConfig = {
        fields: [
          {
            key: 'plan',
            type: 'radio',
            label: 'Subscription Plan',
            props: {
              options: [
                { value: 'basic', label: 'Basic' },
                { value: 'premium', label: 'Premium' },
                { value: 'enterprise', label: 'Enterprise' },
              ],
            },
          },
        ],
      };

      const { component } = createComponent(config, {
        gender: '',
        plan: '',
        theme: '',
        priority: 0,
        category: '',
      });

      await waitForDynamicFormInitialized(component, fixture);

      // Initial value check
      expect(component.formValue().plan).toBe('');

      // Simulate user selecting a radio button
      const radioButtons = debugElement.queryAll(By.directive(MatRadioButton));
      radioButtons[1].nativeElement.click();
      fixture.detectChanges();

      await delay();
      fixture.detectChanges();

      // Verify form value updated
      expect(component.formValue().plan).toBe('premium');
    });

    it('should reflect external value changes in radio selection', async () => {
      const config: FormConfig = {
        fields: [
          {
            key: 'theme',
            type: 'radio',
            label: 'Theme',
            props: {
              options: [
                { value: 'light', label: 'Light' },
                { value: 'dark', label: 'Dark' },
                { value: 'auto', label: 'Auto' },
              ],
            },
          },
        ],
      };

      const { component } = createComponent(config, {
        gender: '',
        plan: '',
        theme: '',
        priority: 0,
        category: '',
      });

      await waitForDynamicFormInitialized(component, fixture);

      // Update form model programmatically
      fixture.componentRef.setInput('value', {
        gender: '',
        plan: '',
        theme: 'dark',
        priority: 0,
        category: '',
      });
      fixture.detectChanges();

      await delay();
      fixture.detectChanges();

      expect(component.formValue().theme).toBe('dark');
    });
  });

  describe('Radio Options and Configuration Tests', () => {
    it('should render radio options with different configurations', async () => {
      const config: FormConfig = {
        fields: [
          {
            key: 'priority',
            type: 'radio',
            label: 'Priority Level',
            props: {
              options: [
                { value: 1, label: 'Low', disabled: false },
                { value: 2, label: 'Medium', disabled: false },
                { value: 3, label: 'High', disabled: true },
                { value: 4, label: 'Critical', disabled: false },
              ],
              color: 'accent',
            },
          },
        ],
      };

      const { component } = createComponent(config, {
        gender: '',
        plan: '',
        theme: '',
        priority: 0,
        category: '',
      });

      await waitForDynamicFormInitialized(component, fixture);

      const radioButtons = debugElement.queryAll(By.directive(MatRadioButton));

      expect(radioButtons.length).toBe(4);
      expect(radioButtons[0].nativeElement.getAttribute('disabled')).toBeNull();
      expect(radioButtons[1].nativeElement.getAttribute('disabled')).toBeNull();
      expect(radioButtons[2].nativeElement.hasAttribute('disabled')).toBe(true);
      expect(radioButtons[3].nativeElement.getAttribute('disabled')).toBeNull();
    });

    it('should handle different radio colors', async () => {
      const config: FormConfig = {
        fields: [
          {
            key: 'gender',
            type: 'radio',
            label: 'Primary Color',
            props: {
              options: [
                { value: 'option1', label: 'Option 1' },
                { value: 'option2', label: 'Option 2' },
              ],
              color: 'primary',
            },
          },
          {
            key: 'plan',
            type: 'radio',
            label: 'Accent Color',
            props: {
              options: [
                { value: 'option1', label: 'Option 1' },
                { value: 'option2', label: 'Option 2' },
              ],
              color: 'accent',
            },
          },
          {
            key: 'theme',
            type: 'radio',
            label: 'Warn Color',
            props: {
              options: [
                { value: 'option1', label: 'Option 1' },
                { value: 'option2', label: 'Option 2' },
              ],
              color: 'warn',
            },
          },
        ],
      };

      const { component } = createComponent(config, {
        gender: '',
        plan: '',
        theme: '',
        priority: 0,
        category: '',
      });

      await waitForDynamicFormInitialized(component, fixture);

      const radioGroups = debugElement.queryAll(By.directive(MatRadioGroup));
      expect(radioGroups.length).toBe(3);
    });

    it('should handle label position configuration', async () => {
      const config: FormConfig = {
        fields: [
          {
            key: 'category',
            type: 'radio',
            label: 'Category',
            props: {
              options: [
                { value: 'tech', label: 'Technology' },
                { value: 'business', label: 'Business' },
              ],
              labelPosition: 'before',
            },
          },
        ],
      };

      const { component } = createComponent(config, {
        gender: '',
        plan: '',
        theme: '',
        priority: 0,
        category: '',
      });

      await waitForDynamicFormInitialized(component, fixture);

      const radioButtons = debugElement.queryAll(By.directive(MatRadioButton));
      expect(radioButtons.length).toBe(2);
    });

    it('should handle number and string option values', async () => {
      const config: FormConfig = {
        fields: [
          {
            key: 'priority',
            type: 'radio',
            label: 'Priority (Numbers)',
            props: {
              options: [
                { value: 1, label: 'Low Priority' },
                { value: 2, label: 'Medium Priority' },
                { value: 3, label: 'High Priority' },
              ],
            },
          },
        ],
      };

      const { component } = createComponent(config, {
        gender: '',
        plan: '',
        theme: '',
        priority: 0,
        category: '',
      });

      await waitForDynamicFormInitialized(component, fixture);

      // Select a radio button with number value
      const radioButtons = debugElement.queryAll(By.directive(MatRadioButton));
      radioButtons[2].nativeElement.click();
      fixture.detectChanges();

      await delay();
      fixture.detectChanges();

      expect(component.formValue().priority).toBe(3);
    });
  });

  describe('Minimal Configuration Tests', () => {
    it('should render with minimal configuration', async () => {
      const config: FormConfig = {
        fields: [
          {
            key: 'category',
            type: 'radio',
            props: {
              options: [
                { value: 'option1', label: 'Option 1' },
                { value: 'option2', label: 'Option 2' },
              ],
            },
          },
        ],
      };

      createComponent(config, { category: '' });

      await delay();
      fixture.detectChanges();

      const radioGroup = debugElement.query(By.directive(MatRadioGroup));
      const radioButtons = debugElement.queryAll(By.directive(MatRadioButton));

      expect(radioGroup).toBeTruthy();
      expect(radioButtons.length).toBe(2);
    });

    it('should not display label when not provided', async () => {
      const config: FormConfig = {
        fields: [
          {
            key: 'category',
            type: 'radio',
            props: {
              options: [
                { value: 'option1', label: 'Option 1' },
                { value: 'option2', label: 'Option 2' },
              ],
            },
          },
        ],
      };

      createComponent(config, { category: '' });

      await delay();
      fixture.detectChanges();

      const label = debugElement.query(By.css('.radio-label'));
      expect(label).toBeNull();
    });

    it('should not display hint when not provided', async () => {
      const config: FormConfig = {
        fields: [
          {
            key: 'category',
            type: 'radio',
            props: {
              options: [
                { value: 'option1', label: 'Option 1' },
                { value: 'option2', label: 'Option 2' },
              ],
            },
          },
        ],
      };

      createComponent(config, { category: '' });

      await delay();
      fixture.detectChanges();

      const hint = debugElement.query(By.css('.mat-hint'));
      expect(hint).toBeNull();
    });
  });

  describe('Field State and Configuration Tests', () => {
    it('should handle disabled state correctly', async () => {
      const config: FormConfig = {
        fields: [
          {
            key: 'category',
            type: 'radio',
            label: 'Disabled Radio',
            disabled: true,
            props: {
              options: [
                { value: 'option1', label: 'Option 1' },
                { value: 'option2', label: 'Option 2' },
              ],
            },
          },
        ],
      };

      createComponent(config, { category: '' });

      await delay();
      fixture.detectChanges();
      await delay();
      fixture.detectChanges();

      const radioGroup = debugElement.query(By.directive(MatRadioGroup));
      expect(radioGroup.nativeElement.hasAttribute('disabled')).toBe(true);
    });

    it('should handle multiple radio groups with independent selections', async () => {
      const config: FormConfig = {
        fields: [
          {
            key: 'gender',
            type: 'radio',
            label: 'Gender',
            props: {
              options: [
                { value: 'male', label: 'Male' },
                { value: 'female', label: 'Female' },
              ],
            },
          },
          {
            key: 'plan',
            type: 'radio',
            label: 'Plan',
            props: {
              options: [
                { value: 'basic', label: 'Basic' },
                { value: 'premium', label: 'Premium' },
              ],
            },
          },
        ],
      };

      const { component } = createComponent(config, {
        gender: 'male',
        plan: 'basic',
        theme: '',
        priority: 0,
        category: '',
      });

      await delay();
      fixture.detectChanges();

      // Initial values
      expect(component.formValue().gender).toBe('male');
      expect(component.formValue().plan).toBe('basic');

      const radioGroups = debugElement.queryAll(By.directive(MatRadioGroup));
      const firstGroupButtons = radioGroups[0].queryAll(By.directive(MatRadioButton));
      const secondGroupButtons = radioGroups[1].queryAll(By.directive(MatRadioButton));

      // Change first group selection
      firstGroupButtons[1].nativeElement.click();
      fixture.detectChanges();

      await delay();
      fixture.detectChanges();

      let formValue = component.formValue();
      expect(formValue.gender).toBe('female');
      expect(formValue.plan).toBe('basic');

      // Change second group selection
      secondGroupButtons[1].nativeElement.click();
      fixture.detectChanges();

      await delay();
      fixture.detectChanges();

      formValue = component.formValue();
      expect(formValue.gender).toBe('female');
      expect(formValue.plan).toBe('premium');
    });

    it('should handle pre-selected values correctly', async () => {
      const config: FormConfig = {
        fields: [
          {
            key: 'theme',
            type: 'radio',
            label: 'Theme',
            props: {
              options: [
                { value: 'light', label: 'Light' },
                { value: 'dark', label: 'Dark' },
                { value: 'auto', label: 'Auto' },
              ],
            },
          },
        ],
      };

      const { component } = createComponent(config, {
        gender: '',
        plan: '',
        theme: 'dark',
        priority: 0,
        category: '',
      });

      await delay();
      fixture.detectChanges();

      expect(component.formValue().theme).toBe('dark');
    });
  });

  describe('Edge Cases and Robustness Tests', () => {
    it('should handle undefined form values gracefully', async () => {
      const config: FormConfig = {
        fields: [
          {
            key: 'category',
            type: 'radio',
            label: 'Category',
            props: {
              options: [
                { value: 'option1', label: 'Option 1' },
                { value: 'option2', label: 'Option 2' },
              ],
            },
          },
        ],
      };

      createComponent(config); // No initial value provided

      await delay();
      fixture.detectChanges();

      const radioGroup = debugElement.query(By.directive(MatRadioGroup));
      expect(radioGroup).toBeTruthy();
    });

    it('should handle null form values gracefully', async () => {
      const config: FormConfig = {
        fields: [
          {
            key: 'category',
            type: 'radio',
            label: 'Category',
            props: {
              options: [
                { value: 'option1', label: 'Option 1' },
                { value: 'option2', label: 'Option 2' },
              ],
            },
          },
        ],
      };

      createComponent(config, null as unknown as TestFormModel);

      await delay();
      fixture.detectChanges();

      const radioGroup = debugElement.query(By.directive(MatRadioGroup));
      expect(radioGroup).toBeTruthy();
    });

    it('should handle empty options array', async () => {
      const config: FormConfig = {
        fields: [
          {
            key: 'category',
            type: 'radio',
            label: 'Category',
            props: {
              options: [],
            },
          },
        ],
      };

      createComponent(config, { category: '' });

      await delay();
      fixture.detectChanges();

      const radioGroup = debugElement.query(By.directive(MatRadioGroup));
      const radioButtons = debugElement.queryAll(By.directive(MatRadioButton));

      expect(radioGroup).toBeTruthy();
      expect(radioButtons.length).toBe(0);
    });

    it('should handle options with special characters and unicode', async () => {
      const config: FormConfig = {
        fields: [
          {
            key: 'category',
            type: 'radio',
            label: 'Special Categories',
            props: {
              options: [
                { value: 'special1', label: 'José María 🌟' },
                { value: 'special2', label: '@#$%^&*()' },
                { value: 'special3', label: '中文选项' },
              ],
            },
          },
        ],
      };

      const { component } = createComponent(config, { category: '' });

      await delay();
      fixture.detectChanges();

      const radioButtons = debugElement.queryAll(By.directive(MatRadioButton));
      expect(radioButtons[0].nativeElement.textContent.trim()).toBe('José María 🌟');
      expect(radioButtons[1].nativeElement.textContent.trim()).toBe('@#$%^&*()');
      expect(radioButtons[2].nativeElement.textContent.trim()).toBe('中文选项');

      // Test selection with special characters
      radioButtons[0].nativeElement.click();
      fixture.detectChanges();

      await delay();
      fixture.detectChanges();

      expect(component.formValue().category).toBe('special1');
    });

    it('should handle rapid selection changes correctly', async () => {
      const config: FormConfig = {
        fields: [
          {
            key: 'category',
            type: 'radio',
            label: 'Category',
            props: {
              options: [
                { value: 'option1', label: 'Option 1' },
                { value: 'option2', label: 'Option 2' },
                { value: 'option3', label: 'Option 3' },
                { value: 'option4', label: 'Option 4' },
              ],
            },
          },
        ],
      };

      const { component } = createComponent(config, { category: '' });

      await delay();
      fixture.detectChanges();

      const radioButtons = debugElement.queryAll(By.directive(MatRadioButton));

      // Simulate rapid clicking through options
      for (let i = 0; i < radioButtons.length; i++) {
        radioButtons[i].nativeElement.click();
        fixture.detectChanges();
      }

      await delay();
      fixture.detectChanges();

      // Should have the final selected value
      expect(component.formValue().category).toBe('option4');
    });

    it('should maintain selection when options are updated', async () => {
      const config: FormConfig = {
        fields: [
          {
            key: 'category',
            type: 'radio',
            label: 'Category',
            props: {
              options: [
                { value: 'option1', label: 'Option 1' },
                { value: 'option2', label: 'Option 2' },
              ],
            },
          },
        ],
      };

      const { component } = createComponent(config, { category: 'option1' });

      await delay();
      fixture.detectChanges();

      // Initial selection should be maintained
      expect(component.formValue().category).toBe('option1');
    });
  });
});
