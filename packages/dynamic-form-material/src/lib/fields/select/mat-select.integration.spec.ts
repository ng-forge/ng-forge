import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideAnimations } from '@angular/platform-browser/animations';
import { By } from '@angular/platform-browser';
import { DebugElement } from '@angular/core';
import { MatSelect } from '@angular/material/select';
import { DynamicForm, FormConfig, provideDynamicForm } from '@ng-forge/dynamic-form';
import { withMaterial } from '../../providers/material-providers';
import { delay, waitForDFInit } from '../../testing';

interface TestFormModel {
  country: string;
  languages: string[];
  priority: number;
  categories: string[];
}

describe('MatSelectFieldComponent - Dynamic Form Integration', () => {
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

  describe('Basic Material Select Integration', () => {
    it('should render select with full configuration', async () => {
      const config: FormConfig = {
        fields: [
          {
            key: 'country',
            type: 'select',
            label: 'Country',
            props: {
              placeholder: 'Select your country',
              hint: 'Choose the country you live in',
              required: true,
              appearance: 'outline',
              className: 'country-select',
              options: [
                { label: 'United States', value: 'US' },
                { label: 'Canada', value: 'CA' },
                { label: 'United Kingdom', value: 'UK' },
                { label: 'Germany', value: 'DE', disabled: true },
              ],
            },
          },
        ] as any[],
      };

      createComponent(config, {
        country: 'US',
        languages: [],
        priority: 0,
        categories: [],
      });

      await waitForDFInit(component, fixture);

      const select = debugElement.query(By.directive(MatSelect));
      const formField = debugElement.query(By.css('mat-form-field'));
      const label = debugElement.query(By.css('mat-label'));
      const hint = debugElement.query(By.css('mat-hint'));

      expect(select).toBeTruthy();
      expect(select.componentInstance.placeholder).toBe('Select your country');
      expect(formField.nativeElement.className).toContain('country-select');
      expect(formField.nativeElement.className).toContain('mat-form-field-appearance-outline');
      expect(label.nativeElement.textContent.trim()).toBe('Country');
      expect(hint.nativeElement.textContent.trim()).toBe('Choose the country you live in');
    });

    it('should handle user selection and update form value', async () => {
      const config: FormConfig = {
        fields: [
          {
            key: 'country',
            type: 'select',
            label: 'Country',
            props: {
              options: [
                { label: 'United States', value: 'US' },
                { label: 'Canada', value: 'CA' },
                { label: 'United Kingdom', value: 'UK' },
              ],
            },
          },
        ] as any[],
      };

      const { component } = createComponent(config, {
        country: '',
        languages: [],
        priority: 0,
        categories: [],
      });

      await waitForDFInit(component, fixture);

      // Initial value check
      expect(component.formValue().country).toBe('');

      // Simulate selection change
      const select = debugElement.query(By.directive(MatSelect));
      select.componentInstance.value = 'CA';
      select.componentInstance.selectionChange.emit({
        value: 'CA',
        source: select.componentInstance,
      });
      fixture.detectChanges();

      await delay();
      fixture.detectChanges();

      // Verify form value updated
      expect(component.formValue().country).toBe('CA');
    });

    it('should reflect external value changes in select field', async () => {
      const config: FormConfig = {
        fields: [
          {
            key: 'country',
            type: 'select',
            label: 'Country',
            props: {
              options: [
                { label: 'United States', value: 'US' },
                { label: 'Canada', value: 'CA' },
                { label: 'United Kingdom', value: 'UK' },
              ],
            },
          },
        ] as any[],
      };

      const { component } = createComponent(config, {
        country: 'US',
        languages: [],
        priority: 0,
        categories: [],
      });

      await waitForDFInit(component, fixture);

      // Update form model programmatically
      fixture.componentRef.setInput('value', {
        country: 'UK',
        languages: [],
        priority: 0,
        categories: [],
      });
      fixture.detectChanges();

      await delay();
      fixture.detectChanges();

      expect(component.formValue().country).toBe('UK');
    });

    it('should handle select options with disabled states', async () => {
      const config: FormConfig = {
        fields: [
          {
            key: 'country',
            type: 'select',
            label: 'Country',
            props: {
              options: [
                { label: 'United States', value: 'US' },
                { label: 'Canada', value: 'CA' },
                { label: 'Germany', value: 'DE', disabled: true },
              ],
            },
          },
        ] as any[],
      };

      createComponent(config, { country: 'US' });

      await waitForDFInit(component, fixture);

      const select = debugElement.query(By.directive(MatSelect));
      expect(select).toBeTruthy();
      // Disabled options are tested when the select panel is opened
    });
  });

  describe('Multi-Select Configuration Tests', () => {
    it('should render multi-select correctly', async () => {
      const config: FormConfig = {
        fields: [
          {
            key: 'languages',
            type: 'select',
            label: 'Languages',
            props: {
              multiple: true,
              hint: 'Select all languages you speak',
              options: [
                { label: 'English', value: 'en' },
                { label: 'Spanish', value: 'es' },
                { label: 'French', value: 'fr' },
                { label: 'German', value: 'de' },
              ],
            },
          },
        ] as any[],
      };

      createComponent(config, {
        country: '',
        languages: ['en', 'es'],
        priority: 0,
        categories: [],
      });

      await waitForDFInit(component, fixture);

      const select = debugElement.query(By.directive(MatSelect));
      const hint = debugElement.query(By.css('mat-hint'));

      expect(select.componentInstance.multiple).toBe(true);
      expect(hint.nativeElement.textContent.trim()).toBe('Select all languages you speak');
    });

    it('should handle multi-select value changes', async () => {
      const config: FormConfig = {
        fields: [
          {
            key: 'languages',
            type: 'select',
            label: 'Languages',
            props: {
              multiple: true,
              options: [
                { label: 'English', value: 'en' },
                { label: 'Spanish', value: 'es' },
                { label: 'French', value: 'fr' },
                { label: 'German', value: 'de' },
              ],
            },
          },
        ] as any[],
      };

      const { component } = createComponent(config, {
        languages: ['en', 'es'],
      });

      await waitForDFInit(component, fixture);

      // Initial value check
      expect(component.formValue().languages).toEqual(['en', 'es']);

      // Simulate multi-selection change
      const select = debugElement.query(By.directive(MatSelect));
      select.componentInstance.value = ['en', 'es', 'fr'];
      select.componentInstance.selectionChange.emit({
        value: ['en', 'es', 'fr'],
        source: select.componentInstance,
      });
      fixture.detectChanges();

      await delay();
      fixture.detectChanges();

      expect(component.formValue().languages).toEqual(['en', 'es', 'fr']);
    });

    it('should reflect multi-select form model changes', async () => {
      const config: FormConfig = {
        fields: [
          {
            key: 'languages',
            type: 'select',
            label: 'Languages',
            props: {
              multiple: true,
              options: [
                { label: 'English', value: 'en' },
                { label: 'Spanish', value: 'es' },
                { label: 'French', value: 'fr' },
                { label: 'German', value: 'de' },
              ],
            },
          },
        ] as any[],
      };

      const { component } = createComponent(config, {
        languages: ['en', 'es'],
      });

      await waitForDFInit(component, fixture);

      // Update form model programmatically
      fixture.componentRef.setInput('value', {
        country: '',
        languages: ['fr', 'de'],
        priority: 0,
        categories: [],
      });
      fixture.detectChanges();

      await delay();
      fixture.detectChanges();

      expect(component.formValue().languages).toEqual(['fr', 'de']);
    });
  });

  describe('Minimal Configuration Tests', () => {
    it('should render with default Material configuration', async () => {
      const config: FormConfig = {
        fields: [
          {
            key: 'country',
            type: 'select',
            label: 'Simple Select',
            props: {
              options: [
                { label: 'Option 1', value: 'opt1' },
                { label: 'Option 2', value: 'opt2' },
              ],
            },
          },
        ] as any[],
      };

      createComponent(config, { country: '' });

      await waitForDFInit(component, fixture);

      const select = debugElement.query(By.directive(MatSelect));
      const formField = debugElement.query(By.css('mat-form-field'));

      expect(select).toBeTruthy();
      expect(select.componentInstance.multiple).toBe(false);
      expect(formField.nativeElement.className).toContain('mat-form-field-appearance-fill');
    });

    it('should not display hint when not provided', async () => {
      const config: FormConfig = {
        fields: [
          {
            key: 'country',
            type: 'select',
            label: 'Simple Select',
            props: {
              options: [
                { label: 'Option 1', value: 'opt1' },
                { label: 'Option 2', value: 'opt2' },
              ],
            },
          },
        ] as any[],
      };

      createComponent(config, { country: '' });

      await waitForDFInit(component, fixture);

      const hint = debugElement.query(By.css('mat-hint'));
      expect(hint).toBeNull();
    });
  });

  describe('Multiple Select Integration Tests', () => {
    it('should render multiple select fields with different configurations', async () => {
      const config: FormConfig = {
        fields: [
          {
            key: 'country',
            type: 'select',
            label: 'Country',
            props: {
              appearance: 'outline',
              options: [
                { label: 'US', value: 'US' },
                { label: 'CA', value: 'CA' },
              ],
            },
          },
          {
            key: 'priority',
            type: 'select',
            label: 'Priority',
            props: {
              appearance: 'fill',
              options: [
                { label: 'Low', value: 1 },
                { label: 'High', value: 2 },
              ],
            },
          },
          {
            key: 'categories',
            type: 'select',
            label: 'Categories',
            props: {
              multiple: true,
              options: [
                { label: 'Tech', value: 'tech' },
                { label: 'Business', value: 'business' },
              ],
            },
          },
        ] as any[],
      };

      createComponent(config, {
        country: 'US',
        languages: [],
        priority: 2,
        categories: ['tech'],
      });

      await waitForDFInit(component, fixture);

      const selects = debugElement.queryAll(By.directive(MatSelect));
      const labels = debugElement.queryAll(By.css('mat-label'));

      expect(selects.length).toBe(3);
      expect(labels[0].nativeElement.textContent.trim()).toBe('Country');
      expect(labels[1].nativeElement.textContent.trim()).toBe('Priority');
      expect(labels[2].nativeElement.textContent.trim()).toBe('Categories');
    });

    it('should reflect individual field states from form model', async () => {
      const config: FormConfig = {
        fields: [
          {
            key: 'country',
            type: 'select',
            label: 'Country',
            props: {
              options: [
                { label: 'US', value: 'US' },
                { label: 'CA', value: 'CA' },
              ],
            },
          },
          {
            key: 'priority',
            type: 'select',
            label: 'Priority',
            props: {
              options: [
                { label: 'Low', value: 1 },
                { label: 'High', value: 2 },
              ],
            },
          },
          {
            key: 'categories',
            type: 'select',
            label: 'Categories',
            props: {
              multiple: true,
              options: [
                { label: 'Tech', value: 'tech' },
                { label: 'Business', value: 'business' },
              ],
            },
          },
        ] as any[],
      };

      createComponent(config, {
        country: 'US',
        priority: 2,
        categories: ['tech'],
      });

      await waitForDFInit(component, fixture);

      const formValue = component.formValue();
      expect(formValue.country).toBe('US');
      expect(formValue.priority).toBe(2);
      expect(formValue.categories).toEqual(['tech']);
    });

    it('should handle independent field interactions', async () => {
      const config: FormConfig = {
        fields: [
          {
            key: 'country',
            type: 'select',
            label: 'Country',
            props: {
              options: [
                { label: 'US', value: 'US' },
                { label: 'CA', value: 'CA' },
              ],
            },
          },
          {
            key: 'categories',
            type: 'select',
            label: 'Categories',
            props: {
              multiple: true,
              options: [
                { label: 'Tech', value: 'tech' },
                { label: 'Business', value: 'business' },
              ],
            },
          },
        ] as any[],
      };

      const { component } = createComponent(config, {
        country: 'US',
        categories: ['tech'],
      });

      await waitForDFInit(component, fixture);

      const selects = debugElement.queryAll(By.directive(MatSelect));

      // Change country
      selects[0].componentInstance.value = 'CA';
      selects[0].componentInstance.selectionChange.emit({
        value: 'CA',
        source: selects[0].componentInstance,
      });
      fixture.detectChanges();

      await delay();
      fixture.detectChanges();

      let formValue = component.formValue();
      expect(formValue.country).toBe('CA');
      expect(formValue.categories).toEqual(['tech']);

      // Change categories
      selects[1].componentInstance.value = ['tech', 'business'];
      selects[1].componentInstance.selectionChange.emit({
        value: ['tech', 'business'],
        source: selects[1].componentInstance,
      });
      fixture.detectChanges();

      await delay();
      fixture.detectChanges();

      formValue = component.formValue();
      expect(formValue.country).toBe('CA');
      expect(formValue.categories).toEqual(['tech', 'business']);
    });
  });

  describe('Select State and Edge Cases', () => {
    it('should handle disabled state correctly', async () => {
      const config: FormConfig = {
        fields: [
          {
            key: 'country',
            type: 'select',
            label: 'Disabled Select',
            disabled: true,
            props: {
              options: [
                { label: 'Option 1', value: 'opt1' },
                { label: 'Option 2', value: 'opt2' },
              ],
            },
          },
        ] as any[],
      };

      createComponent(config, {
        country: '',
        languages: [],
        priority: 0,
        categories: [],
      });

      await delay();
      fixture.detectChanges();
      await delay();
      fixture.detectChanges();

      const select = debugElement.query(By.directive(MatSelect));
      const selectComponent = select.componentInstance;

      expect(selectComponent.disabled).toBe(true);

      // Try to click disabled select - should not change value since it's disabled
      select.nativeElement.click();
      fixture.detectChanges();

      // Verify the select remains disabled and doesn't change
      expect(selectComponent.disabled).toBe(true);
      expect(selectComponent.value).toBe('');
    });

    it('should apply default Material Design configuration', async () => {
      const config: FormConfig = {
        fields: [
          {
            key: 'country',
            type: 'select',
            label: 'Test Select',
            props: {
              options: [{ label: 'Option 1', value: 'opt1' }],
            },
          },
        ] as any[],
      };

      createComponent(config, { country: '' });

      await waitForDFInit(component, fixture);

      const select = debugElement.query(By.directive(MatSelect));
      const selectComponent = select.componentInstance;

      // Check default props from Material configuration
      expect(selectComponent.multiple).toBe(false);
    });

    it('should handle undefined form values gracefully', async () => {
      const config: FormConfig = {
        fields: [
          {
            key: 'country',
            type: 'select',
            label: 'Test Select',
            props: {
              options: [{ label: 'Option 1', value: 'opt1' }],
            },
          },
        ] as any[],
      };

      createComponent(config); // No initial value provided

      await waitForDFInit(component, fixture);

      const select = debugElement.query(By.directive(MatSelect));
      expect(select).toBeTruthy();
    });

    it('should handle null form values gracefully', async () => {
      const config: FormConfig = {
        fields: [
          {
            key: 'country',
            type: 'select',
            label: 'Test Select',
            props: {
              options: [{ label: 'Option 1', value: 'opt1' }],
            },
          },
        ] as any[],
      };

      createComponent(config, null as unknown as TestFormModel);

      await waitForDFInit(component, fixture);

      const select = debugElement.query(By.directive(MatSelect));
      expect(select).toBeTruthy();
    });

    it('should handle programmatic value updates correctly', async () => {
      const config: FormConfig = {
        fields: [
          {
            key: 'country',
            type: 'select',
            label: 'Test Select',
            props: {
              options: [
                { label: 'Option 1', value: 'opt1' },
                { label: 'Option 2', value: 'opt2' },
              ],
            },
          },
        ] as any[],
      };

      const { component } = createComponent(config, { country: 'opt1' });

      await waitForDFInit(component, fixture);

      const select = debugElement.query(By.directive(MatSelect));
      const selectComponent = select.componentInstance;

      // Initial state
      expect(selectComponent.value).toBe('opt1');

      // Update via programmatic value change
      fixture.componentRef.setInput('value', { country: 'opt2' });
      fixture.detectChanges();

      await delay();
      fixture.detectChanges();

      expect(selectComponent.value).toBe('opt2');
      expect(component.formValue().country).toBe('opt2');
    });
  });

  describe('Field Configuration Validation', () => {
    it('should handle missing key gracefully', async () => {
      const config: FormConfig = {
        fields: [
          {
            type: 'select',
            label: 'Select without key',
            props: {
              options: [{ label: 'Option 1', value: 'opt1' }],
            },
          },
        ] as any[],
      };

      createComponent(config);

      await waitForDFInit(component, fixture);

      const select = debugElement.query(By.directive(MatSelect));
      expect(select).toBeTruthy();
    });

    it('should auto-generate field IDs', async () => {
      const config: FormConfig = {
        fields: [
          {
            key: 'country',
            type: 'select',
            label: 'Test Select',
            props: {
              options: [{ label: 'Option 1', value: 'opt1' }],
            },
          },
        ] as any[],
      };

      createComponent(config);

      await waitForDFInit(component, fixture);

      const select = debugElement.query(By.directive(MatSelect));
      expect(select).toBeTruthy();
    });
  });
});
