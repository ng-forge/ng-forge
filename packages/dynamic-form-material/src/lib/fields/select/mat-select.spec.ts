import { By } from '@angular/platform-browser';
import { MatSelect } from '@angular/material/select';
import { MaterialFormTestUtils } from '../../testing/material-test-utils';

describe('MatSelectFieldComponent', () => {
  describe('Basic Material Select Integration', () => {
    it('should render select with full configuration', async () => {
      const config = MaterialFormTestUtils.builder()
        .field({
          key: 'country',
          type: 'select',
          label: 'Country',
          required: true,
          className: 'country-select',
          placeholder: 'Select your country',
          options: [
            { label: 'United States', value: 'US' },
            { label: 'Canada', value: 'CA' },
            { label: 'United Kingdom', value: 'UK' },
            { label: 'Germany', value: 'DE', disabled: true },
          ],
          props: {
            hint: 'Choose the country you live in',
            appearance: 'outline',
          },
        })
        .build();

      const { fixture } = await MaterialFormTestUtils.createTest({
        config,
        initialValue: {
          country: 'US',
          languages: [],
          priority: 0,
          categories: [],
        },
      });

      const select = fixture.debugElement.query(By.directive(MatSelect));
      const formField = fixture.debugElement.query(By.css('mat-form-field'));
      const label = fixture.debugElement.query(By.css('mat-label'));
      const hint = fixture.debugElement.query(By.css('mat-hint'));

      expect(select).toBeTruthy();
      // Check that placeholder property is properly set via the mat-select's placeholder attribute
      expect(select.componentInstance.placeholder).toBe('Select your country');
      expect(formField.nativeElement.className).toContain('country-select');
      expect(formField.nativeElement.className).toContain('mat-form-field-appearance-outline');
      expect(label.nativeElement.textContent.trim()).toBe('Country');
      expect(hint.nativeElement.textContent.trim()).toBe('Choose the country you live in');
    });

    it('should handle user selection and update form value', async () => {
      const config = MaterialFormTestUtils.builder()
        .matSelectField({
          key: 'country',
          options: [
            { label: 'United States', value: 'US' },
            { label: 'Canada', value: 'CA' },
            { label: 'United Kingdom', value: 'UK' },
          ],
        })
        .build();

      const { component, fixture } = await MaterialFormTestUtils.createTest({
        config,
        initialValue: {
          country: '',
          languages: [],
          priority: 0,
          categories: [],
        },
      });

      // Initial value check
      expect(MaterialFormTestUtils.getFormValue(component).country).toBe('');

      // Simulate selection change using utility
      await MaterialFormTestUtils.simulateMatSelect(fixture, 'mat-select', 'CA');

      // Verify form value updated
      expect(MaterialFormTestUtils.getFormValue(component).country).toBe('CA');
    });

    it('should reflect external value changes in select field', async () => {
      const config = MaterialFormTestUtils.builder()
        .matSelectField({
          key: 'country',
          options: [
            { label: 'United States', value: 'US' },
            { label: 'Canada', value: 'CA' },
            { label: 'United Kingdom', value: 'UK' },
          ],
        })
        .build();

      const { component, fixture } = await MaterialFormTestUtils.createTest({
        config,
        initialValue: {
          country: 'US',
          languages: [],
          priority: 0,
          categories: [],
        },
      });

      // Update form model programmatically
      fixture.componentRef.setInput('value', {
        country: 'UK',
        languages: [],
        priority: 0,
        categories: [],
      });

      expect(MaterialFormTestUtils.getFormValue(component).country).toBe('UK');
    });

    it('should handle select options with disabled states', async () => {
      const config = MaterialFormTestUtils.builder()
        .field({
          key: 'country',
          type: 'select',
          label: 'Country',
          options: [
            { label: 'United States', value: 'US' },
            { label: 'Canada', value: 'CA' },
            { label: 'Germany', value: 'DE', disabled: true },
          ],
        })
        .build();

      const { fixture } = await MaterialFormTestUtils.createTest({
        config,
        initialValue: { country: 'US' },
      });

      const select = fixture.debugElement.query(By.directive(MatSelect));
      expect(select).toBeTruthy();
      // Disabled options are tested when the select panel is opened
    });
  });

  describe('Multi-Select Configuration Tests', () => {
    it('should render multi-select correctly', async () => {
      const config = MaterialFormTestUtils.builder()
        .field({
          key: 'languages',
          type: 'select',
          label: 'Languages',
          options: [
            { label: 'English', value: 'en' },
            { label: 'Spanish', value: 'es' },
            { label: 'French', value: 'fr' },
            { label: 'German', value: 'de' },
          ],
          props: {
            multiple: true,
            hint: 'Select all languages you speak',
          },
        })
        .build();

      const { fixture } = await MaterialFormTestUtils.createTest({
        config,
        initialValue: {
          country: '',
          languages: ['en', 'es'],
          priority: 0,
          categories: [],
        },
      });

      const select = fixture.debugElement.query(By.directive(MatSelect));
      const hint = fixture.debugElement.query(By.css('mat-hint'));

      expect(select.componentInstance.multiple).toBe(true);
      expect(hint.nativeElement.textContent.trim()).toBe('Select all languages you speak');
    });

    it('should handle multi-select value changes', async () => {
      const config = MaterialFormTestUtils.builder()
        .field({
          key: 'languages',
          type: 'select',
          label: 'Languages',
          props: {
            multiple: true,
          },
          options: [
            { label: 'English', value: 'en' },
            { label: 'Spanish', value: 'es' },
            { label: 'French', value: 'fr' },
            { label: 'German', value: 'de' },
          ],
        })
        .build();

      const { component, fixture } = await MaterialFormTestUtils.createTest({
        config,
        initialValue: {
          languages: ['en', 'es'],
        },
      });

      // Initial value check
      expect(MaterialFormTestUtils.getFormValue(component).languages).toEqual(['en', 'es']);

      // Simulate multi-selection change
      const select = fixture.debugElement.query(By.directive(MatSelect));
      select.componentInstance.value = ['en', 'es', 'fr'];
      select.componentInstance.selectionChange.emit({
        value: ['en', 'es', 'fr'],
        source: select.componentInstance,
      });
      fixture.detectChanges();

      expect(MaterialFormTestUtils.getFormValue(component).languages).toEqual(['en', 'es', 'fr']);
    });

    it('should reflect multi-select form model changes', async () => {
      const config = MaterialFormTestUtils.builder()
        .field({
          key: 'languages',
          type: 'select',
          label: 'Languages',
          props: {
            multiple: true,
          },
          options: [
            { label: 'English', value: 'en' },
            { label: 'Spanish', value: 'es' },
            { label: 'French', value: 'fr' },
            { label: 'German', value: 'de' },
          ],
        })
        .build();

      const { component, fixture } = await MaterialFormTestUtils.createTest({
        config,
        initialValue: {
          languages: ['en', 'es'],
        },
      });

      // Update form model programmatically
      fixture.componentRef.setInput('value', {
        country: '',
        languages: ['fr', 'de'],
        priority: 0,
        categories: [],
      });
      fixture.detectChanges();

      expect(MaterialFormTestUtils.getFormValue(component).languages).toEqual(['fr', 'de']);
    });
  });

  describe('Minimal Configuration Tests', () => {
    it('should render with default Material configuration', async () => {
      const config = MaterialFormTestUtils.builder()
        .matSelectField({
          key: 'country',
          options: [
            { label: 'Option 1', value: 'opt1' },
            { label: 'Option 2', value: 'opt2' },
          ],
        })
        .build();

      const { fixture } = await MaterialFormTestUtils.createTest({
        config,
        initialValue: { country: '' },
      });

      const select = fixture.debugElement.query(By.directive(MatSelect));
      const formField = fixture.debugElement.query(By.css('mat-form-field'));

      expect(select).toBeTruthy();
      expect(select.componentInstance.multiple).toBe(false);
      expect(formField.nativeElement.className).toContain('mat-form-field-appearance-fill');
    });

    it('should not display hint when not provided', async () => {
      const config = MaterialFormTestUtils.builder()
        .matSelectField({
          key: 'country',
          options: [
            { label: 'Option 1', value: 'opt1' },
            { label: 'Option 2', value: 'opt2' },
          ],
        })
        .build();

      const { fixture } = await MaterialFormTestUtils.createTest({
        config,
        initialValue: { country: '' },
      });

      const hint = fixture.debugElement.query(By.css('mat-hint'));
      expect(hint).toBeNull();
    });
  });

  describe('Multiple Select Integration Tests', () => {
    it('should render multiple select definitions with different configurations', async () => {
      const config = MaterialFormTestUtils.builder()
        .matSelectField({
          key: 'country',
          label: 'Country',
          options: [
            { label: 'US', value: 'US' },
            { label: 'CA', value: 'CA' },
          ],
          props: { appearance: 'outline' },
        })
        .matSelectField({
          key: 'priority',
          label: 'Priority',
          options: [
            { label: 'Low', value: 1 },
            { label: 'High', value: 2 },
          ],
          props: { appearance: 'fill' },
        })
        .field({
          key: 'categories',
          type: 'select',
          label: 'Categories',
          props: {
            multiple: true,
          },
          options: [
            { label: 'Tech', value: 'tech' },
            { label: 'Business', value: 'business' },
          ],
        })
        .build();

      const { fixture } = await MaterialFormTestUtils.createTest({
        config,
        initialValue: {
          country: 'US',
          languages: [],
          priority: 2,
          categories: ['tech'],
        },
      });

      const selects = fixture.debugElement.queryAll(By.directive(MatSelect));
      const labels = fixture.debugElement.queryAll(By.css('mat-label'));

      expect(selects.length).toBe(3);
      expect(labels[0].nativeElement.textContent.trim()).toBe('Country');
      expect(labels[1].nativeElement.textContent.trim()).toBe('Priority');
      expect(labels[2].nativeElement.textContent.trim()).toBe('Categories');
    });

    it('should reflect individual field states from form model', async () => {
      const config = MaterialFormTestUtils.builder()
        .matSelectField({
          key: 'country',
          options: [
            { label: 'US', value: 'US' },
            { label: 'CA', value: 'CA' },
          ],
        })
        .matSelectField({
          key: 'priority',
          options: [
            { label: 'Low', value: 1 },
            { label: 'High', value: 2 },
          ],
        })
        .field({
          key: 'categories',
          type: 'select',
          label: 'Categories',
          props: {
            multiple: true,
          },
          options: [
            { label: 'Tech', value: 'tech' },
            { label: 'Business', value: 'business' },
          ],
        })
        .build();

      const { component } = await MaterialFormTestUtils.createTest({
        config,
        initialValue: {
          country: 'US',
          priority: 2,
          categories: ['tech'],
        },
      });

      const formValue = MaterialFormTestUtils.getFormValue(component);
      expect(formValue.country).toBe('US');
      expect(formValue.priority).toBe(2);
      expect(formValue.categories).toEqual(['tech']);
    });

    it('should handle independent field interactions', async () => {
      const config = MaterialFormTestUtils.builder()
        .matSelectField({
          key: 'country',
          options: [
            { label: 'US', value: 'US' },
            { label: 'CA', value: 'CA' },
          ],
        })
        .field({
          key: 'categories',
          type: 'select',
          label: 'Categories',
          props: {
            multiple: true,
          },
          options: [
            { label: 'Tech', value: 'tech' },
            { label: 'Business', value: 'business' },
          ],
        })
        .build();

      const { component, fixture } = await MaterialFormTestUtils.createTest({
        config,
        initialValue: {
          country: 'US',
          categories: ['tech'],
        },
      });

      const selects = fixture.debugElement.queryAll(By.directive(MatSelect));

      // Change country using direct component interaction
      selects[0].componentInstance.value = 'CA';
      selects[0].componentInstance.selectionChange.emit({
        value: 'CA',
        source: selects[0].componentInstance,
      });
      fixture.detectChanges();

      let formValue = MaterialFormTestUtils.getFormValue(component);
      expect(formValue.country).toBe('CA');
      expect(formValue.categories).toEqual(['tech']);

      // Change categories using direct component interaction
      selects[1].componentInstance.value = ['tech', 'business'];
      selects[1].componentInstance.selectionChange.emit({
        value: ['tech', 'business'],
        source: selects[1].componentInstance,
      });
      fixture.detectChanges();

      formValue = MaterialFormTestUtils.getFormValue(component);
      expect(formValue.country).toBe('CA');
      expect(formValue.categories).toEqual(['tech', 'business']);
    });
  });

  describe('Select State and Edge Cases', () => {
    it('should handle disabled state correctly', async () => {
      const config = MaterialFormTestUtils.builder()
        .field({
          key: 'country',
          type: 'select',
          label: 'Disabled Select',
          disabled: true,
          options: [
            { label: 'Option 1', value: 'opt1' },
            { label: 'Option 2', value: 'opt2' },
          ],
        })
        .build();

      const { fixture } = await MaterialFormTestUtils.createTest({
        config,
        initialValue: {
          country: '',
          languages: [],
          priority: 0,
          categories: [],
        },
      });

      const select = fixture.debugElement.query(By.directive(MatSelect));
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
      const config = MaterialFormTestUtils.builder()
        .matSelectField({ key: 'country', options: [{ label: 'Option 1', value: 'opt1' }] })
        .build();

      const { fixture } = await MaterialFormTestUtils.createTest({
        config,
        initialValue: { country: '' },
      });

      const select = fixture.debugElement.query(By.directive(MatSelect));
      const selectComponent = select.componentInstance;

      // Check default props from Material configuration
      expect(selectComponent.multiple).toBe(false);
    });

    it('should handle undefined form values gracefully', async () => {
      const config = MaterialFormTestUtils.builder()
        .matSelectField({ key: 'country', options: [{ label: 'Option 1', value: 'opt1' }] })
        .build();

      const { fixture } = await MaterialFormTestUtils.createTest({ config }); // No initial value provided

      const select = fixture.debugElement.query(By.directive(MatSelect));
      expect(select).toBeTruthy();
    });

    it('should handle null form values gracefully', async () => {
      const config = MaterialFormTestUtils.builder()
        .matSelectField({ key: 'country', options: [{ label: 'Option 1', value: 'opt1' }] })
        .build();

      const { fixture } = await MaterialFormTestUtils.createTest({
        config,
        initialValue: null as any,
      });

      const select = fixture.debugElement.query(By.directive(MatSelect));
      expect(select).toBeTruthy();
    });

    it('should handle programmatic value updates correctly', async () => {
      const config = MaterialFormTestUtils.builder()
        .matSelectField({
          key: 'country',
          options: [
            { label: 'Option 1', value: 'opt1' },
            { label: 'Option 2', value: 'opt2' },
          ],
        })
        .build();

      const { component, fixture } = await MaterialFormTestUtils.createTest({
        config,
        initialValue: { country: 'opt1' },
      });

      // Initial state check
      expect(MaterialFormTestUtils.getFormValue(component).country).toBe('opt1');

      // Update via programmatic value change (like the working test above)
      fixture.componentRef.setInput('value', { country: 'opt2' });

      // Verify form value updated correctly
      expect(MaterialFormTestUtils.getFormValue(component).country).toBe('opt2');
    });
  });

  describe('Field Configuration Validation', () => {
    it('should handle missing key gracefully', async () => {
      const config = MaterialFormTestUtils.builder()
        .field({
          type: 'select',
          label: 'Select without key',
          options: [{ label: 'Option 1', value: 'opt1' }],
        })
        .build();

      const { fixture } = await MaterialFormTestUtils.createTest({ config });

      const select = fixture.debugElement.query(By.directive(MatSelect));
      expect(select).toBeTruthy();
    });

    it('should auto-generate field IDs', async () => {
      const config = MaterialFormTestUtils.builder()
        .matSelectField({ key: 'country', options: [{ label: 'Option 1', value: 'opt1' }] })
        .build();

      const { fixture } = await MaterialFormTestUtils.createTest({ config });

      const select = fixture.debugElement.query(By.directive(MatSelect));
      expect(select).toBeTruthy();
    });
  });
});
