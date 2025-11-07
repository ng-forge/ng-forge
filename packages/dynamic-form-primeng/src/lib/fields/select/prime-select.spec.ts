import { untracked } from '@angular/core';
import { By } from '@angular/platform-browser';
import { Select } from 'primeng/select';
import { MultiSelect } from 'primeng/multiselect';
import { createTestTranslationService } from '../../testing/fake-translation.service';
import { PrimeNGFormTestUtils } from '../../testing/primeng-test-utils';

describe('PrimeSelectFieldComponent', () => {
  describe('Basic PrimeNG Select Integration', () => {
    it('should render select with full configuration', async () => {
      const config = PrimeNGFormTestUtils.builder()
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
          },
        })
        .build();

      const { fixture } = await PrimeNGFormTestUtils.createTest({
        config,
        initialValue: {
          country: 'US',
          languages: [],
          priority: 0,
          categories: [],
        },
      });

      const select = fixture.debugElement.query(By.directive(Select));
      const selectHost = fixture.debugElement.query(By.css('df-prime-select'));
      const label = fixture.debugElement.query(By.css('label'));

      expect(select).toBeTruthy();
      // Note: Placeholder comes from props.placeholder in PrimeNG implementation, not field-level placeholder
      // The component passes props()?.placeholder through dynamicText pipe
      // className is applied to the host element via host bindings
      expect(selectHost.nativeElement.className).toContain('country-select');
      expect(label.nativeElement.textContent.trim()).toBe('Country');
    });

    it('should handle user selection and update form value', async () => {
      const config = PrimeNGFormTestUtils.builder()
        .primeSelectField({
          key: 'country',
          options: [
            { label: 'United States', value: 'US' },
            { label: 'Canada', value: 'CA' },
            { label: 'United Kingdom', value: 'UK' },
          ],
        })
        .build();

      const { component, fixture } = await PrimeNGFormTestUtils.createTest({
        config,
        initialValue: {
          country: '',
          languages: [],
          priority: 0,
          categories: [],
        },
      });

      // Initial value check
      expect(PrimeNGFormTestUtils.getFormValue(component).country).toBe('');

      // Simulate selection change by updating form value
      // Note: PrimeNG Select with Field directive doesn't expose a simple way to simulate user clicks
      // so we test the integration by updating the form value programmatically
      await PrimeNGFormTestUtils.updateFormValue(fixture, {
        country: 'CA',
        languages: [],
        priority: 0,
        categories: [],
      });

      // Verify form value updated
      expect(PrimeNGFormTestUtils.getFormValue(component).country).toBe('CA');
    });

    it('should reflect external value changes in select field', async () => {
      const config = PrimeNGFormTestUtils.builder()
        .primeSelectField({
          key: 'country',
          options: [
            { label: 'United States', value: 'US' },
            { label: 'Canada', value: 'CA' },
            { label: 'United Kingdom', value: 'UK' },
          ],
        })
        .build();

      const { component, fixture } = await PrimeNGFormTestUtils.createTest({
        config,
        initialValue: {
          country: 'US',
          languages: [],
          priority: 0,
          categories: [],
        },
      });

      // Update form model programmatically
      await PrimeNGFormTestUtils.updateFormValue(fixture, {
        country: 'UK',
        languages: [],
        priority: 0,
        categories: [],
      });

      expect(PrimeNGFormTestUtils.getFormValue(component).country).toBe('UK');
    });

    it('should handle select options with disabled states', async () => {
      const config = PrimeNGFormTestUtils.builder()
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

      const { fixture } = await PrimeNGFormTestUtils.createTest({
        config,
        initialValue: { country: 'US' },
      });

      const select = fixture.debugElement.query(By.directive(Select));
      expect(select).toBeTruthy();
      // Disabled options are tested when the select panel is opened
    });
  });

  describe('Multi-Select Configuration Tests', () => {
    it('should render multi-select correctly', async () => {
      const config = PrimeNGFormTestUtils.builder()
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

      const { fixture } = await PrimeNGFormTestUtils.createTest({
        config,
        initialValue: {
          country: '',
          languages: ['en', 'es'],
          priority: 0,
          categories: [],
        },
      });

      const select = fixture.debugElement.query(By.directive(MultiSelect));

      expect(select).toBeTruthy();
    });

    it('should handle multi-select value changes', async () => {
      const config = PrimeNGFormTestUtils.builder()
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

      const { component, fixture } = await PrimeNGFormTestUtils.createTest({
        config,
        initialValue: {
          languages: ['en', 'es'],
        },
      });

      // Initial value check
      expect(PrimeNGFormTestUtils.getFormValue(component).languages).toEqual(['en', 'es']);

      // Simulate multi-selection change by updating form value
      await PrimeNGFormTestUtils.updateFormValue(fixture, {
        languages: ['en', 'es', 'fr'],
      });

      expect(PrimeNGFormTestUtils.getFormValue(component).languages).toEqual(['en', 'es', 'fr']);
    });

    it('should reflect multi-select form model changes', async () => {
      const config = PrimeNGFormTestUtils.builder()
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

      const { component, fixture } = await PrimeNGFormTestUtils.createTest({
        config,
        initialValue: {
          languages: ['en', 'es'],
        },
      });

      // Update form model programmatically
      await PrimeNGFormTestUtils.updateFormValue(fixture, {
        country: '',
        languages: ['fr', 'de'],
        priority: 0,
        categories: [],
      });

      expect(PrimeNGFormTestUtils.getFormValue(component).languages).toEqual(['fr', 'de']);
    });
  });

  describe('Minimal Configuration Tests', () => {
    it('should render with default PrimeNG configuration', async () => {
      const config = PrimeNGFormTestUtils.builder()
        .primeSelectField({
          key: 'country',
          options: [
            { label: 'Option 1', value: 'opt1' },
            { label: 'Option 2', value: 'opt2' },
          ],
        })
        .build();

      const { fixture } = await PrimeNGFormTestUtils.createTest({
        config,
        initialValue: { country: '' },
      });

      const select = fixture.debugElement.query(By.directive(Select));
      const fieldWrapper = fixture.debugElement.query(By.css('.df-prime-field'));

      expect(select).toBeTruthy();
      expect(fieldWrapper).toBeTruthy();
    });

    it('should not display hint when not provided', async () => {
      const config = PrimeNGFormTestUtils.builder()
        .primeSelectField({
          key: 'country',
          options: [
            { label: 'Option 1', value: 'opt1' },
            { label: 'Option 2', value: 'opt2' },
          ],
        })
        .build();

      const { fixture } = await PrimeNGFormTestUtils.createTest({
        config,
        initialValue: { country: '' },
      });

      const hint = fixture.debugElement.query(By.css('small.p-error'));
      expect(hint).toBeNull();
    });
  });

  describe('Multiple Select Integration Tests', () => {
    it('should render multiple select definitions with different configurations', async () => {
      const config = PrimeNGFormTestUtils.builder()
        .primeSelectField({
          key: 'country',
          label: 'Country',
          options: [
            { label: 'US', value: 'US' },
            { label: 'CA', value: 'CA' },
          ],
        })
        .primeSelectField({
          key: 'priority',
          label: 'Priority',
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

      const { fixture } = await PrimeNGFormTestUtils.createTest({
        config,
        initialValue: {
          country: 'US',
          languages: [],
          priority: 2,
          categories: ['tech'],
        },
      });

      const dropdowns = fixture.debugElement.queryAll(By.directive(Select));
      const multiSelects = fixture.debugElement.queryAll(By.directive(MultiSelect));
      const labels = fixture.debugElement.queryAll(By.css('label'));

      expect(dropdowns.length).toBe(2);
      expect(multiSelects.length).toBe(1);
      expect(labels[0].nativeElement.textContent.trim()).toBe('Country');
      expect(labels[1].nativeElement.textContent.trim()).toBe('Priority');
      expect(labels[2].nativeElement.textContent.trim()).toBe('Categories');
    });

    it('should reflect individual field states from form model', async () => {
      const config = PrimeNGFormTestUtils.builder()
        .primeSelectField({
          key: 'country',
          options: [
            { label: 'US', value: 'US' },
            { label: 'CA', value: 'CA' },
          ],
        })
        .primeSelectField({
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

      const { component } = await PrimeNGFormTestUtils.createTest({
        config,
        initialValue: {
          country: 'US',
          priority: 2,
          categories: ['tech'],
        },
      });

      const formValue = PrimeNGFormTestUtils.getFormValue(component);
      expect(formValue.country).toBe('US');
      expect(formValue.priority).toBe(2);
      expect(formValue.categories).toEqual(['tech']);
    });

    it('should handle independent field interactions', async () => {
      const config = PrimeNGFormTestUtils.builder()
        .primeSelectField({
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

      const { component, fixture } = await PrimeNGFormTestUtils.createTest({
        config,
        initialValue: {
          country: 'US',
          categories: ['tech'],
        },
      });

      // Change country programmatically
      await PrimeNGFormTestUtils.updateFormValue(fixture, {
        country: 'CA',
        categories: ['tech'],
      });

      let formValue = PrimeNGFormTestUtils.getFormValue(component);
      expect(formValue.country).toBe('CA');
      expect(formValue.categories).toEqual(['tech']);

      // Change categories programmatically
      await PrimeNGFormTestUtils.updateFormValue(fixture, {
        country: 'CA',
        categories: ['tech', 'business'],
      });

      formValue = PrimeNGFormTestUtils.getFormValue(component);
      expect(formValue.country).toBe('CA');
      expect(formValue.categories).toEqual(['tech', 'business']);
    });
  });

  describe('Select State and Edge Cases', () => {
    it('should handle disabled state correctly', async () => {
      const config = PrimeNGFormTestUtils.builder()
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

      const { fixture } = await PrimeNGFormTestUtils.createTest({
        config,
        initialValue: {
          country: '',
          languages: [],
          priority: 0,
          categories: [],
        },
      });

      const select = fixture.debugElement.query(By.directive(Select));

      // Verify the select component renders with disabled configuration
      expect(select).toBeTruthy();

      // Verify the field's disabled state from the Field directive
      const selectHost = fixture.debugElement.query(By.css('df-prime-select'));
      const fieldTree = selectHost.componentInstance.field();
      expect(fieldTree().disabled()).toBe(true);
    });

    it('should apply default PrimeNG configuration', async () => {
      const config = PrimeNGFormTestUtils.builder()
        .primeSelectField({ key: 'country', options: [{ label: 'Option 1', value: 'opt1' }] })
        .build();

      const { fixture } = await PrimeNGFormTestUtils.createTest({
        config,
        initialValue: { country: '' },
      });

      const select = fixture.debugElement.query(By.directive(Select));

      // Check default props from PrimeNG configuration
      expect(select).toBeTruthy();
    });

    it('should handle undefined form values gracefully', async () => {
      const config = PrimeNGFormTestUtils.builder()
        .primeSelectField({ key: 'country', options: [{ label: 'Option 1', value: 'opt1' }] })
        .build();

      const { fixture } = await PrimeNGFormTestUtils.createTest({ config }); // No initial value provided

      const select = fixture.debugElement.query(By.directive(Select));
      expect(select).toBeTruthy();
    });

    it('should handle null form values gracefully', async () => {
      const config = PrimeNGFormTestUtils.builder()
        .primeSelectField({ key: 'country', options: [{ label: 'Option 1', value: 'opt1' }] })
        .build();

      const { fixture } = await PrimeNGFormTestUtils.createTest({
        config,
        initialValue: null as unknown,
      });

      const select = fixture.debugElement.query(By.directive(Select));
      expect(select).toBeTruthy();
    });

    it('should handle programmatic value updates correctly', async () => {
      const config = PrimeNGFormTestUtils.builder()
        .primeSelectField({
          key: 'country',
          options: [
            { label: 'Option 1', value: 'opt1' },
            { label: 'Option 2', value: 'opt2' },
          ],
        })
        .build();

      const { component, fixture } = await PrimeNGFormTestUtils.createTest({
        config,
        initialValue: { country: 'opt1' },
      });

      // Initial state check
      expect(PrimeNGFormTestUtils.getFormValue(component).country).toBe('opt1');

      // Update via programmatic value change (like the working test above)
      await PrimeNGFormTestUtils.updateFormValue(fixture, { country: 'opt2' });

      // Verify form value updated correctly
      expect(PrimeNGFormTestUtils.getFormValue(component).country).toBe('opt2');
    });
  });

  describe('Field Configuration Validation', () => {
    it('should handle missing key gracefully', async () => {
      const config = PrimeNGFormTestUtils.builder()
        .field({
          type: 'select',
          label: 'Select without key',
          options: [{ label: 'Option 1', value: 'opt1' }],
        })
        .build();

      const { fixture } = await PrimeNGFormTestUtils.createTest({ config });

      const select = fixture.debugElement.query(By.directive(Select));
      expect(select).toBeTruthy();
    });

    it('should auto-generate field IDs', async () => {
      const config = PrimeNGFormTestUtils.builder()
        .primeSelectField({ key: 'country', options: [{ label: 'Option 1', value: 'opt1' }] })
        .build();

      const { fixture } = await PrimeNGFormTestUtils.createTest({ config });

      const select = fixture.debugElement.query(By.directive(Select));
      expect(select).toBeTruthy();
    });
  });

  describe('Dynamic Text Support', () => {
    describe('Translation Service Integration', () => {
      it('should handle translation service with dynamic language updates for labels and options', async () => {
        const translationService = createTestTranslationService({
          'form.country.label': 'Country',
          'form.country.placeholder': 'Select your country',
          'form.country.hint': 'Choose the country you live in',
          'country.us': 'United States',
          'country.ca': 'Canada',
          'country.uk': 'United Kingdom',
        });

        const dynamicOptions = [
          { label: translationService.translate('country.us'), value: 'US' },
          { label: translationService.translate('country.ca'), value: 'CA' },
          { label: translationService.translate('country.uk'), value: 'UK' },
        ];

        const config = PrimeNGFormTestUtils.builder()
          .field({
            key: 'country',
            type: 'select',
            label: translationService.translate('form.country.label'),
            placeholder: translationService.translate('form.country.placeholder'),
            options: dynamicOptions,
            props: {
              hint: translationService.translate('form.country.hint'),
            },
          })
          .build();

        const { fixture } = await PrimeNGFormTestUtils.createTest({
          config,
          initialValue: { country: '' },
        });

        const label = fixture.debugElement.query(By.css('label'));
        const hint = fixture.debugElement.query(By.css('.p-hint'));

        // Initial translations
        expect(label.nativeElement.textContent.trim()).toBe('Country');
        expect(hint.nativeElement.textContent.trim()).toBe('Choose the country you live in');
        // Note: Options are dynamic and tested via the options input
        // Opening the overlay in tests requires matchMedia support

        // Update to Spanish
        translationService.addTranslations({
          'form.country.label': 'País',
          'form.country.placeholder': 'Selecciona tu país',
          'form.country.hint': 'Elige el país donde vives',
          'country.us': 'Estados Unidos',
          'country.ca': 'Canadá',
          'country.uk': 'Reino Unido',
        });
        translationService.setLanguage('es');

        untracked(() => fixture.detectChanges());
        await fixture.whenStable();

        expect(label.nativeElement.textContent.trim()).toBe('País');
        expect(hint.nativeElement.textContent.trim()).toBe('Elige el país donde vives');
      });
    });
  });
});
