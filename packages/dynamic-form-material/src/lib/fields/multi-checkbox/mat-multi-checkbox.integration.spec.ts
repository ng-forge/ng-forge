import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideAnimations } from '@angular/platform-browser/animations';
import { By } from '@angular/platform-browser';
import { DebugElement } from '@angular/core';
import { MatCheckbox } from '@angular/material/checkbox';
import { DynamicForm, FormConfig, provideDynamicForm } from '@ng-forge/dynamic-form';
import { withMaterial } from '../../providers/material-providers';
import { delay, waitForDynamicFormInitialized } from '../../testing/delay';

interface TestFormModel {
  hobbies: string[];
  skills: string[];
  preferences: number[];
}

describe('MatMultiCheckboxFieldComponent - Dynamic Form Integration', () => {
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

  describe('Basic Multi-Checkbox Integration', () => {
    it('should render multi-checkbox with full configuration', async () => {
      const config: FormConfig = {
        fields: [
          {
            key: 'hobbies',
            type: 'multi-checkbox',
            label: 'Hobbies',
            props: {
              options: [
                { value: 'reading', label: 'Reading' },
                { value: 'gaming', label: 'Gaming' },
                { value: 'cooking', label: 'Cooking' },
              ],
              hint: 'Select all that apply',
              required: true,
              color: 'primary',
              labelPosition: 'after',
              className: 'hobbies-checkbox',
            },
          },
        ],
      };

      createComponent(config, {
        hobbies: [],
        skills: [],
        preferences: [],
      });

      await waitForDynamicFormInitialized(component, fixture);

      const checkboxes = debugElement.queryAll(By.directive(MatCheckbox));
      const label = debugElement.query(By.css('.checkbox-group-label'));
      const hint = debugElement.query(By.css('.mat-hint'));
      const wrapper = debugElement.query(By.css('df-mat-multi-checkbox'));

      expect(checkboxes.length).toBe(3);
      expect(label.nativeElement.textContent.trim()).toBe('Hobbies');
      expect(hint.nativeElement.textContent.trim()).toBe('Select all that apply');
      expect(wrapper.nativeElement.className).toContain('hobbies-checkbox');

      // Check individual checkbox properties
      expect(checkboxes[0].componentInstance.labelPosition).toBe('after');
      expect(checkboxes[0].componentInstance.color).toBe('primary');
      expect(checkboxes[0].nativeElement.textContent.trim()).toBe('Reading');
      expect(checkboxes[1].nativeElement.textContent.trim()).toBe('Gaming');
      expect(checkboxes[2].nativeElement.textContent.trim()).toBe('Cooking');
    });

    it('should handle user checkbox selection and update form value', async () => {
      const config: FormConfig = {
        fields: [
          {
            key: 'hobbies',
            type: 'multi-checkbox',
            label: 'Hobbies',
            props: {
              options: [
                { value: 'reading', label: 'Reading' },
                { value: 'gaming', label: 'Gaming' },
                { value: 'cooking', label: 'Cooking' },
              ],
            },
          },
        ],
      };

      const { component } = createComponent(config, {
        hobbies: [],
        skills: [],
        preferences: [],
      });

      await waitForDynamicFormInitialized(component, fixture);

      // Initial value check
      expect(component.formValue().hobbies).toEqual([]);

      // Simulate checking first checkbox
      const checkboxes = debugElement.queryAll(By.directive(MatCheckbox));
      checkboxes[0].nativeElement.click();
      fixture.detectChanges();

      await delay();
      fixture.detectChanges();

      // Verify form value updated
      expect(component.formValue().hobbies).toEqual(['reading']);

      // Check second checkbox
      checkboxes[1].nativeElement.click();
      fixture.detectChanges();

      await delay();
      fixture.detectChanges();

      expect(component.formValue().hobbies).toEqual(['reading', 'gaming']);
    });

    it('should reflect external value changes in checkbox states', async () => {
      const config: FormConfig = {
        fields: [
          {
            key: 'hobbies',
            type: 'multi-checkbox',
            label: 'Hobbies',
            props: {
              options: [
                { value: 'reading', label: 'Reading' },
                { value: 'gaming', label: 'Gaming' },
                { value: 'cooking', label: 'Cooking' },
              ],
            },
          },
        ],
      };

      const { component } = createComponent(config, {
        hobbies: [],
        skills: [],
        preferences: [],
      });

      await waitForDynamicFormInitialized(component, fixture);

      // Update form model programmatically
      fixture.componentRef.setInput('value', {
        hobbies: ['reading', 'cooking'],
        skills: [],
        preferences: [],
      });
      fixture.detectChanges();

      await delay();
      fixture.detectChanges();

      expect(component.formValue().hobbies).toEqual(['reading', 'cooking']);

      // Check that checkboxes reflect the state
      const checkboxes = debugElement.queryAll(By.directive(MatCheckbox));
      expect(checkboxes[0].componentInstance.checked).toBe(true); // reading
      expect(checkboxes[1].componentInstance.checked).toBe(false); // gaming
      expect(checkboxes[2].componentInstance.checked).toBe(true); // cooking
    });
  });

  describe('Different Option Types Integration', () => {
    it('should handle string and number options correctly', async () => {
      const config: FormConfig = {
        fields: [
          {
            key: 'skills',
            type: 'multi-checkbox',
            label: 'Skills',
            props: {
              options: [
                { value: 'typescript', label: 'TypeScript' },
                { value: 'angular', label: 'Angular' },
                { value: 'react', label: 'React' },
              ],
            },
          },
          {
            key: 'preferences',
            type: 'multi-checkbox',
            label: 'Preferences',
            props: {
              options: [
                { value: 1, label: 'Option 1' },
                { value: 2, label: 'Option 2' },
                { value: 3, label: 'Option 3' },
              ],
            },
          },
        ],
      };

      const { component } = createComponent(config, {
        hobbies: [],
        skills: [],
        preferences: [],
      });

      await waitForDynamicFormInitialized(component, fixture);

      const checkboxGroups = debugElement.queryAll(By.css('df-mat-multi-checkbox'));
      const skillsCheckboxes = checkboxGroups[0].queryAll(By.directive(MatCheckbox));
      const preferencesCheckboxes = checkboxGroups[1].queryAll(By.directive(MatCheckbox));

      expect(skillsCheckboxes.length).toBe(3);
      expect(preferencesCheckboxes.length).toBe(3);

      // Test string options
      skillsCheckboxes[0].nativeElement.click();
      skillsCheckboxes[2].nativeElement.click();
      fixture.detectChanges();

      await delay();
      fixture.detectChanges();

      expect(component.formValue().skills).toEqual(['typescript', 'react']);

      // Test number options
      preferencesCheckboxes[0].nativeElement.click();
      preferencesCheckboxes[1].nativeElement.click();
      fixture.detectChanges();

      await delay();
      fixture.detectChanges();

      expect(component.formValue().preferences).toEqual([1, 2]);
    });

    it('should handle disabled options correctly', async () => {
      const config: FormConfig = {
        fields: [
          {
            key: 'hobbies',
            type: 'multi-checkbox',
            label: 'Hobbies',
            props: {
              options: [
                { value: 'reading', label: 'Reading' },
                { value: 'gaming', label: 'Gaming', disabled: true },
                { value: 'cooking', label: 'Cooking' },
              ],
            },
          },
        ],
      };

      createComponent(config, { hobbies: [] });

      await waitForDynamicFormInitialized(component, fixture);

      const checkboxes = debugElement.queryAll(By.directive(MatCheckbox));

      expect(checkboxes[0].componentInstance.disabled).toBe(false);
      expect(checkboxes[1].componentInstance.disabled).toBe(true);
      expect(checkboxes[2].componentInstance.disabled).toBe(false);
    });

    it('should handle field-level disabled state', async () => {
      const config: FormConfig = {
        fields: [
          {
            key: 'hobbies',
            type: 'multi-checkbox',
            label: 'Hobbies',
            disabled: true,
            props: {
              options: [
                { value: 'reading', label: 'Reading' },
                { value: 'gaming', label: 'Gaming' },
                { value: 'cooking', label: 'Cooking' },
              ],
            },
          },
        ],
      };

      createComponent(config, { hobbies: [] });

      await delay();
      fixture.detectChanges();
      await delay();
      fixture.detectChanges();

      const checkboxes = debugElement.queryAll(By.directive(MatCheckbox));

      checkboxes.forEach(checkbox => {
        expect(checkbox.componentInstance.disabled).toBe(true);
      });
    });
  });

  describe('Different Material Configurations', () => {
    it('should apply different color themes correctly', async () => {
      const config: FormConfig = {
        fields: [
          {
            key: 'hobbies',
            type: 'multi-checkbox',
            label: 'Primary Color',
            props: {
              options: [{ value: 'reading', label: 'Reading' }],
              color: 'primary',
            },
          },
          {
            key: 'skills',
            type: 'multi-checkbox',
            label: 'Accent Color',
            props: {
              options: [{ value: 'typescript', label: 'TypeScript' }],
              color: 'accent',
            },
          },
        ],
      };

      createComponent(config, { hobbies: [], skills: [] });

      await delay();
      fixture.detectChanges();

      const checkboxGroups = debugElement.queryAll(By.css('df-mat-multi-checkbox'));
      const primaryCheckbox = checkboxGroups[0].query(By.directive(MatCheckbox));
      const accentCheckbox = checkboxGroups[1].query(By.directive(MatCheckbox));

      expect(primaryCheckbox.componentInstance.color).toBe('primary');
      expect(accentCheckbox.componentInstance.color).toBe('accent');
    });

    it('should apply different label positions correctly', async () => {
      const config: FormConfig = {
        fields: [
          {
            key: 'hobbies',
            type: 'multi-checkbox',
            label: 'After Position',
            props: {
              options: [{ value: 'reading', label: 'Reading' }],
              labelPosition: 'after',
            },
          },
          {
            key: 'skills',
            type: 'multi-checkbox',
            label: 'Before Position',
            props: {
              options: [{ value: 'typescript', label: 'TypeScript' }],
              labelPosition: 'before',
            },
          },
        ],
      };

      createComponent(config, { hobbies: [], skills: [] });

      await delay();
      fixture.detectChanges();

      const checkboxGroups = debugElement.queryAll(By.css('df-mat-multi-checkbox'));
      const afterCheckbox = checkboxGroups[0].query(By.directive(MatCheckbox));
      const beforeCheckbox = checkboxGroups[1].query(By.directive(MatCheckbox));

      expect(afterCheckbox.componentInstance.labelPosition).toBe('after');
      expect(beforeCheckbox.componentInstance.labelPosition).toBe('before');
    });
  });

  describe('Minimal Configuration Tests', () => {
    it('should render with default Material configuration', async () => {
      const config: FormConfig = {
        fields: [
          {
            key: 'hobbies',
            type: 'multi-checkbox',
            label: 'Hobbies',
            props: {
              options: [
                { value: 'reading', label: 'Reading' },
                { value: 'gaming', label: 'Gaming' },
              ],
            },
          },
        ],
      };

      createComponent(config, { hobbies: [] });

      await delay();
      fixture.detectChanges();

      const checkboxes = debugElement.queryAll(By.directive(MatCheckbox));
      expect(checkboxes[0].componentInstance.color).toBe('primary');
      expect(checkboxes[0].componentInstance.labelPosition).toBe('after');
    });

    it('should not display hint when not provided', async () => {
      const config: FormConfig = {
        fields: [
          {
            key: 'hobbies',
            type: 'multi-checkbox',
            label: 'Hobbies',
            props: {
              options: [{ value: 'reading', label: 'Reading' }],
            },
          },
        ],
      };

      createComponent(config, { hobbies: [] });

      await delay();
      fixture.detectChanges();

      const hint = debugElement.query(By.css('.mat-hint'));
      expect(hint).toBeNull();
    });

    it('should not display label when not provided', async () => {
      const config: FormConfig = {
        fields: [
          {
            key: 'hobbies',
            type: 'multi-checkbox',
            props: {
              options: [{ value: 'reading', label: 'Reading' }],
            },
          },
        ],
      } as any;

      createComponent(config, { hobbies: [] });

      await delay();
      fixture.detectChanges();

      const label = debugElement.query(By.css('.checkbox-group-label'));
      expect(label).toBeNull();
    });
  });

  describe('Complex Interaction Tests', () => {
    it('should handle checking and unchecking multiple checkboxes', async () => {
      const config: FormConfig = {
        fields: [
          {
            key: 'hobbies',
            type: 'multi-checkbox',
            label: 'Hobbies',
            props: {
              options: [
                { value: 'reading', label: 'Reading' },
                { value: 'gaming', label: 'Gaming' },
                { value: 'cooking', label: 'Cooking' },
              ],
            },
          },
        ],
      };

      const { component } = createComponent(config, { hobbies: [] });

      await delay();
      fixture.detectChanges();

      const checkboxes = debugElement.queryAll(By.directive(MatCheckbox));

      // Check all checkboxes
      checkboxes[0].nativeElement.click();
      checkboxes[1].nativeElement.click();
      checkboxes[2].nativeElement.click();
      fixture.detectChanges();

      await delay();
      fixture.detectChanges();

      expect(component.formValue().hobbies).toEqual(['reading', 'gaming', 'cooking']);

      // Uncheck middle checkbox
      checkboxes[1].nativeElement.click();
      fixture.detectChanges();

      await delay();
      fixture.detectChanges();

      expect(component.formValue().hobbies).toEqual(['reading', 'cooking']);

      // Uncheck all remaining
      checkboxes[0].nativeElement.click();
      checkboxes[2].nativeElement.click();
      fixture.detectChanges();

      await delay();
      fixture.detectChanges();

      expect(component.formValue().hobbies).toEqual([]);
    });

    it('should handle multiple checkbox groups independently', async () => {
      const config: FormConfig = {
        fields: [
          {
            key: 'hobbies',
            type: 'multi-checkbox',
            label: 'Hobbies',
            props: {
              options: [
                { value: 'reading', label: 'Reading' },
                { value: 'gaming', label: 'Gaming' },
              ],
            },
          },
          {
            key: 'skills',
            type: 'multi-checkbox',
            label: 'Skills',
            props: {
              options: [
                { value: 'typescript', label: 'TypeScript' },
                { value: 'angular', label: 'Angular' },
              ],
            },
          },
        ],
      };

      const { component } = createComponent(config, {
        hobbies: ['reading'],
        skills: ['typescript'],
      });

      await delay();
      fixture.detectChanges();

      // Initial values
      expect(component.formValue().hobbies).toEqual(['reading']);
      expect(component.formValue().skills).toEqual(['typescript']);

      const checkboxGroups = debugElement.queryAll(By.css('df-mat-multi-checkbox'));
      const hobbiesCheckboxes = checkboxGroups[0].queryAll(By.directive(MatCheckbox));
      const skillsCheckboxes = checkboxGroups[1].queryAll(By.directive(MatCheckbox));

      // Change hobbies
      hobbiesCheckboxes[1].nativeElement.click(); // Add gaming
      fixture.detectChanges();

      await delay();
      fixture.detectChanges();

      let formValue = component.formValue();
      expect(formValue.hobbies).toEqual(['reading', 'gaming']);
      expect(formValue.skills).toEqual(['typescript']); // Should remain unchanged

      // Change skills
      skillsCheckboxes[1].nativeElement.click(); // Add angular
      fixture.detectChanges();

      await delay();
      fixture.detectChanges();

      formValue = component.formValue();
      expect(formValue.hobbies).toEqual(['reading', 'gaming']); // Should remain unchanged
      expect(formValue.skills).toEqual(['typescript', 'angular']);
    });
  });

  describe('Edge Cases and Robustness Tests', () => {
    it('should handle undefined form values gracefully', async () => {
      const config: FormConfig = {
        fields: [
          {
            key: 'hobbies',
            type: 'multi-checkbox',
            label: 'Hobbies',
            props: {
              options: [{ value: 'reading', label: 'Reading' }],
            },
          },
        ],
      };

      createComponent(config); // No initial value provided

      await delay();
      fixture.detectChanges();

      const checkboxes = debugElement.queryAll(By.directive(MatCheckbox));
      expect(checkboxes).toBeTruthy();
      expect(checkboxes.length).toBe(1);
    });

    it('should handle null form values gracefully', async () => {
      const config: FormConfig = {
        fields: [
          {
            key: 'hobbies',
            type: 'multi-checkbox',
            label: 'Hobbies',
            props: {
              options: [{ value: 'reading', label: 'Reading' }],
            },
          },
        ],
      };

      createComponent(config, null as unknown as TestFormModel);

      await delay();
      fixture.detectChanges();

      const checkboxes = debugElement.queryAll(By.directive(MatCheckbox));
      expect(checkboxes).toBeTruthy();
      expect(checkboxes.length).toBe(1);
    });

    it('should handle empty options array', async () => {
      const config: FormConfig = {
        fields: [
          {
            key: 'hobbies',
            type: 'multi-checkbox',
            label: 'Hobbies',
            props: {
              options: [],
            },
          },
        ],
      };

      const { component } = createComponent(config, { hobbies: [] });

      await delay();
      fixture.detectChanges();

      const checkboxes = debugElement.queryAll(By.directive(MatCheckbox));
      expect(checkboxes.length).toBe(0);
      expect(component.formValue().hobbies).toEqual([]);
    });

    it('should handle duplicate values in options gracefully', async () => {
      const config: FormConfig = {
        fields: [
          {
            key: 'hobbies',
            type: 'multi-checkbox',
            label: 'Hobbies',
            props: {
              options: [
                { value: 'reading', label: 'Reading Books' },
                { value: 'reading', label: 'Reading Articles' },
                { value: 'gaming', label: 'Gaming' },
              ],
            },
          },
        ],
      };

      const { component } = createComponent(config, { hobbies: [] });

      await delay();
      fixture.detectChanges();

      const checkboxes = debugElement.queryAll(By.directive(MatCheckbox));
      expect(checkboxes.length).toBe(3);

      // Click first "reading" option
      checkboxes[0].nativeElement.click();
      fixture.detectChanges();

      await delay();
      fixture.detectChanges();

      // Both "reading" checkboxes should be checked due to duplicate values
      expect(checkboxes[0].componentInstance.checked).toBe(true);
      expect(checkboxes[1].componentInstance.checked).toBe(true);
      expect(checkboxes[2].componentInstance.checked).toBe(false);
      expect(component.formValue().hobbies).toEqual(['reading']);
    });

    it('should handle rapid checkbox clicking correctly', async () => {
      const config: FormConfig = {
        fields: [
          {
            key: 'hobbies',
            type: 'multi-checkbox',
            label: 'Hobbies',
            props: {
              options: [
                { value: 'reading', label: 'Reading' },
                { value: 'gaming', label: 'Gaming' },
              ],
            },
          },
        ],
      };

      const { component } = createComponent(config, { hobbies: [] });

      await delay();
      fixture.detectChanges();

      const checkboxes = debugElement.queryAll(By.directive(MatCheckbox));

      // Rapid clicking
      checkboxes[0].nativeElement.click();
      checkboxes[1].nativeElement.click();
      checkboxes[0].nativeElement.click(); // Uncheck
      checkboxes[1].nativeElement.click(); // Uncheck
      checkboxes[0].nativeElement.click(); // Check again
      fixture.detectChanges();

      await delay();
      fixture.detectChanges();

      // Should have the final state
      expect(component.formValue().hobbies).toEqual(['reading']);
      expect(checkboxes[0].componentInstance.checked).toBe(true);
      expect(checkboxes[1].componentInstance.checked).toBe(false);
    });
  });
});
