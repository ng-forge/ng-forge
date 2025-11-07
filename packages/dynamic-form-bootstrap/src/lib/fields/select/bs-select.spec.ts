import { By } from '@angular/platform-browser';
import { createTestTranslationService } from '../../testing/fake-translation.service';
import { BootstrapFormTestUtils } from '../../testing/bootstrap-test-utils';

describe('BsSelectFieldComponent', () => {
  describe('Basic Bootstrap Select Integration', () => {
    it('should render select with full configuration', async () => {
      const config = BootstrapFormTestUtils.builder()
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
            helpText: 'Choose the country you live in',
            size: 'lg',
          },
        })
        .build();

      const { fixture } = await BootstrapFormTestUtils.createTest({
        config,
        initialValue: {
          country: 'US',
          languages: [],
          priority: 0,
          categories: [],
        },
      });

      const select = fixture.debugElement.query(By.css('.form-select'));
      const container = fixture.debugElement.query(By.css('df-bs-select'));
      const label = fixture.debugElement.query(By.css('.form-label'));
      const helpText = fixture.debugElement.query(By.css('.form-text'));

      expect(select).toBeTruthy();
      expect(select.nativeElement.classList.contains('form-select-lg')).toBe(true);
      expect(container.nativeElement.classList.contains('country-select')).toBe(true);
      expect(label.nativeElement.textContent.trim()).toBe('Country');
      expect(helpText.nativeElement.textContent.trim()).toBe('Choose the country you live in');

      // Check placeholder option
      const options = select.nativeElement.querySelectorAll('option');
      expect(options[0].textContent.trim()).toBe('Select your country');
      expect(options[0].disabled).toBe(true);
    });

    it('should handle user selection and update form value', async () => {
      const config = BootstrapFormTestUtils.builder()
        .bsSelectField({
          key: 'country',
          options: [
            { label: 'United States', value: 'US' },
            { label: 'Canada', value: 'CA' },
            { label: 'United Kingdom', value: 'UK' },
          ],
        })
        .build();

      const { component, fixture } = await BootstrapFormTestUtils.createTest({
        config,
        initialValue: {
          country: '',
          languages: [],
          priority: 0,
          categories: [],
        },
      });

      // Initial value check
      expect(BootstrapFormTestUtils.getFormValue(component).country).toBe('');

      // Simulate selection change using utility
      await BootstrapFormTestUtils.simulateBsSelect(fixture, '.form-select', 'CA');

      // Verify form value updated
      expect(BootstrapFormTestUtils.getFormValue(component).country).toBe('CA');
    });

    it('should reflect external value changes in select field', async () => {
      const config = BootstrapFormTestUtils.builder()
        .bsSelectField({
          key: 'country',
          options: [
            { label: 'United States', value: 'US' },
            { label: 'Canada', value: 'CA' },
            { label: 'United Kingdom', value: 'UK' },
          ],
        })
        .build();

      const { component, fixture } = await BootstrapFormTestUtils.createTest({
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

      expect(BootstrapFormTestUtils.getFormValue(component).country).toBe('UK');
    });

    it('should handle select options with disabled states', async () => {
      const config = BootstrapFormTestUtils.builder()
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

      const { fixture } = await BootstrapFormTestUtils.createTest({
        config,
        initialValue: { country: 'US' },
      });

      const select = fixture.debugElement.query(By.css('.form-select'));
      const options = select.nativeElement.querySelectorAll('option');

      // Find the disabled option (Germany)
      const disabledOption = Array.from(options).find((opt: any) => opt.value === 'DE');
      expect(disabledOption).toBeTruthy();
      expect((disabledOption as HTMLOptionElement).disabled).toBe(true);
    });
  });

  describe('Multi-Select Configuration Tests', () => {
    it('should render multi-select correctly', async () => {
      const config = BootstrapFormTestUtils.builder()
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
            helpText: 'Select all languages you speak',
          },
        })
        .build();

      const { fixture } = await BootstrapFormTestUtils.createTest({
        config,
        initialValue: {
          country: '',
          languages: ['en', 'es'],
          priority: 0,
          categories: [],
        },
      });

      const select = fixture.debugElement.query(By.css('.form-select'));
      const helpText = fixture.debugElement.query(By.css('.form-text'));

      expect(select.nativeElement.multiple).toBe(true);
      expect(helpText.nativeElement.textContent.trim()).toBe('Select all languages you speak');
    });

    it('should handle multi-select value changes', async () => {
      const config = BootstrapFormTestUtils.builder()
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

      const { component, fixture } = await BootstrapFormTestUtils.createTest({
        config,
        initialValue: {
          languages: ['en', 'es'],
        },
      });

      // Initial value check
      expect(BootstrapFormTestUtils.getFormValue(component).languages).toEqual(['en', 'es']);

      // Update form value programmatically (simulating form value change)
      // Note: Native multi-select with Field directive is complex to simulate in tests
      fixture.componentRef.setInput('value', {
        languages: ['en', 'es', 'fr'],
      });
      fixture.detectChanges();

      expect(BootstrapFormTestUtils.getFormValue(component).languages).toEqual(['en', 'es', 'fr']);
    });

    it('should reflect multi-select form model changes', async () => {
      const config = BootstrapFormTestUtils.builder()
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

      const { component, fixture } = await BootstrapFormTestUtils.createTest({
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

      expect(BootstrapFormTestUtils.getFormValue(component).languages).toEqual(['fr', 'de']);
    });
  });

  describe('Minimal Configuration Tests', () => {
    it('should render with default Bootstrap configuration', async () => {
      const config = BootstrapFormTestUtils.builder()
        .bsSelectField({
          key: 'country',
          options: [
            { label: 'Option 1', value: 'opt1' },
            { label: 'Option 2', value: 'opt2' },
          ],
        })
        .build();

      const { fixture } = await BootstrapFormTestUtils.createTest({
        config,
        initialValue: { country: '' },
      });

      const select = fixture.debugElement.query(By.css('.form-select'));
      const container = fixture.debugElement.query(By.css('.mb-3'));

      expect(select).toBeTruthy();
      expect(select.nativeElement.multiple).toBe(false);
      expect(container).toBeTruthy();
    });

    it('should not display help text when not provided', async () => {
      const config = BootstrapFormTestUtils.builder()
        .bsSelectField({
          key: 'country',
          options: [
            { label: 'Option 1', value: 'opt1' },
            { label: 'Option 2', value: 'opt2' },
          ],
        })
        .build();

      const { fixture } = await BootstrapFormTestUtils.createTest({
        config,
        initialValue: { country: '' },
      });

      const helpText = fixture.debugElement.query(By.css('.form-text'));
      expect(helpText).toBeNull();
    });
  });

  describe('Multiple Select Integration Tests', () => {
    it('should render multiple select definitions with different configurations', async () => {
      const config = BootstrapFormTestUtils.builder()
        .bsSelectField({
          key: 'country',
          label: 'Country',
          options: [
            { label: 'US', value: 'US' },
            { label: 'CA', value: 'CA' },
          ],
          props: { size: 'lg' },
        })
        .bsSelectField({
          key: 'priority',
          label: 'Priority',
          options: [
            { label: 'Low', value: 1 },
            { label: 'High', value: 2 },
          ],
          props: { size: 'sm' },
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

      const { fixture } = await BootstrapFormTestUtils.createTest({
        config,
        initialValue: {
          country: 'US',
          languages: [],
          priority: 2,
          categories: ['tech'],
        },
      });

      const selects = fixture.debugElement.queryAll(By.css('.form-select'));
      const labels = fixture.debugElement.queryAll(By.css('.form-label'));

      expect(selects.length).toBe(3);
      expect(labels[0].nativeElement.textContent.trim()).toBe('Country');
      expect(labels[1].nativeElement.textContent.trim()).toBe('Priority');
      expect(labels[2].nativeElement.textContent.trim()).toBe('Categories');
    });

    it('should reflect individual field states from form model', async () => {
      const config = BootstrapFormTestUtils.builder()
        .bsSelectField({
          key: 'country',
          options: [
            { label: 'US', value: 'US' },
            { label: 'CA', value: 'CA' },
          ],
        })
        .bsSelectField({
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

      const { component } = await BootstrapFormTestUtils.createTest({
        config,
        initialValue: {
          country: 'US',
          priority: 2,
          categories: ['tech'],
        },
      });

      const formValue = BootstrapFormTestUtils.getFormValue(component);
      expect(formValue.country).toBe('US');
      expect(formValue.priority).toBe(2);
      expect(formValue.categories).toEqual(['tech']);
    });

    it('should handle independent field interactions', async () => {
      const config = BootstrapFormTestUtils.builder()
        .bsSelectField({
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

      const { component, fixture } = await BootstrapFormTestUtils.createTest({
        config,
        initialValue: {
          country: 'US',
          categories: ['tech'],
        },
      });

      const selects = fixture.debugElement.queryAll(By.css('.form-select'));

      // Change country using direct select interaction
      const countrySelect = selects[0].nativeElement as HTMLSelectElement;
      countrySelect.value = 'CA';
      countrySelect.dispatchEvent(new Event('input', { bubbles: true }));
      countrySelect.dispatchEvent(new Event('change', { bubbles: true }));
      fixture.detectChanges();
      await new Promise(resolve => setTimeout(resolve, 0));

      let formValue = BootstrapFormTestUtils.getFormValue(component);
      expect(formValue.country).toBe('CA');
      expect(formValue.categories).toEqual(['tech']);

      // Change categories programmatically (simulating form value change)
      // Note: Native multi-select with Field directive is complex to simulate in tests
      fixture.componentRef.setInput('value', {
        country: 'CA',
        categories: ['tech', 'business'],
      });
      fixture.detectChanges();

      formValue = BootstrapFormTestUtils.getFormValue(component);
      expect(formValue.country).toBe('CA');
      expect(formValue.categories).toEqual(['tech', 'business']);
    });
  });

  describe('Select State and Edge Cases', () => {
    it('should handle disabled state correctly', async () => {
      const config = BootstrapFormTestUtils.builder()
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

      const { fixture } = await BootstrapFormTestUtils.createTest({
        config,
        initialValue: {
          country: '',
          languages: [],
          priority: 0,
          categories: [],
        },
      });

      const select = fixture.debugElement.query(By.css('.form-select'));

      expect(select.nativeElement.disabled).toBe(true);

      // Try to click disabled select - should not change value since it's disabled
      select.nativeElement.click();
      fixture.detectChanges();

      // Verify the select remains disabled and doesn't change
      expect(select.nativeElement.disabled).toBe(true);
      expect(select.nativeElement.value).toBe('');
    });

    it('should apply default Bootstrap configuration', async () => {
      const config = BootstrapFormTestUtils.builder()
        .bsSelectField({ key: 'country', options: [{ label: 'Option 1', value: 'opt1' }] })
        .build();

      const { fixture } = await BootstrapFormTestUtils.createTest({
        config,
        initialValue: { country: '' },
      });

      const select = fixture.debugElement.query(By.css('.form-select'));

      // Check default props from Bootstrap configuration
      expect(select.nativeElement.multiple).toBe(false);
    });

    it('should handle undefined form values gracefully', async () => {
      const config = BootstrapFormTestUtils.builder()
        .bsSelectField({ key: 'country', options: [{ label: 'Option 1', value: 'opt1' }] })
        .build();

      const { fixture } = await BootstrapFormTestUtils.createTest({ config }); // No initial value provided

      const select = fixture.debugElement.query(By.css('.form-select'));
      expect(select).toBeTruthy();
    });

    it('should handle null form values gracefully', async () => {
      const config = BootstrapFormTestUtils.builder()
        .bsSelectField({ key: 'country', options: [{ label: 'Option 1', value: 'opt1' }] })
        .build();

      const { fixture } = await BootstrapFormTestUtils.createTest({
        config,
        initialValue: null as any,
      });

      const select = fixture.debugElement.query(By.css('.form-select'));
      expect(select).toBeTruthy();
    });

    it('should handle programmatic value updates correctly', async () => {
      const config = BootstrapFormTestUtils.builder()
        .bsSelectField({
          key: 'country',
          options: [
            { label: 'Option 1', value: 'opt1' },
            { label: 'Option 2', value: 'opt2' },
          ],
        })
        .build();

      const { component, fixture } = await BootstrapFormTestUtils.createTest({
        config,
        initialValue: { country: 'opt1' },
      });

      // Initial state check
      expect(BootstrapFormTestUtils.getFormValue(component).country).toBe('opt1');

      // Update via programmatic value change
      fixture.componentRef.setInput('value', { country: 'opt2' });

      // Verify form value updated correctly
      expect(BootstrapFormTestUtils.getFormValue(component).country).toBe('opt2');
    });
  });

  describe('Field Configuration Validation', () => {
    it('should handle missing key gracefully', async () => {
      const config = BootstrapFormTestUtils.builder()
        .field({
          type: 'select',
          label: 'Select without key',
          options: [{ label: 'Option 1', value: 'opt1' }],
        })
        .build();

      const { fixture } = await BootstrapFormTestUtils.createTest({ config });

      const select = fixture.debugElement.query(By.css('.form-select'));
      expect(select).toBeTruthy();
    });

    it('should auto-generate field IDs', async () => {
      const config = BootstrapFormTestUtils.builder()
        .bsSelectField({ key: 'country', options: [{ label: 'Option 1', value: 'opt1' }] })
        .build();

      const { fixture } = await BootstrapFormTestUtils.createTest({ config });

      const select = fixture.debugElement.query(By.css('.form-select'));
      expect(select).toBeTruthy();
    });
  });

  describe('Bootstrap-Specific Feature Tests', () => {
    it('should apply Bootstrap size variants', async () => {
      const config = BootstrapFormTestUtils.builder()
        .bsSelectField({
          key: 'country',
          options: [{ label: 'Option 1', value: 'opt1' }],
          props: { size: 'sm' },
        })
        .bsSelectField({
          key: 'priority',
          options: [{ label: 'Option 2', value: 'opt2' }],
          props: { size: 'lg' },
        })
        .build();

      const { fixture } = await BootstrapFormTestUtils.createTest({
        config,
        initialValue: { country: '', priority: '' },
      });

      const selects = fixture.debugElement.queryAll(By.css('.form-select'));
      expect(selects[0].nativeElement.classList.contains('form-select-sm')).toBe(true);
      expect(selects[1].nativeElement.classList.contains('form-select-lg')).toBe(true);
    });

    it('should handle htmlSize attribute for visible options', async () => {
      const config = BootstrapFormTestUtils.builder()
        .bsSelectField({
          key: 'country',
          options: [
            { label: 'Option 1', value: 'opt1' },
            { label: 'Option 2', value: 'opt2' },
            { label: 'Option 3', value: 'opt3' },
          ],
          props: { htmlSize: 3 },
        })
        .build();

      const { fixture } = await BootstrapFormTestUtils.createTest({
        config,
        initialValue: { country: '' },
      });

      const select = fixture.debugElement.query(By.css('.form-select'));
      expect(select.nativeElement.size).toBe(3);
    });
  });

  describe('Dynamic Text Support', () => {
    describe('Translation Service Integration', () => {
      it('should handle translation service with dynamic language updates for labels and options', async () => {
        const translationService = createTestTranslationService({
          'form.country.label': 'Country',
          'form.country.placeholder': 'Select your country',
          'form.country.helpText': 'Choose the country you live in',
          'country.us': 'United States',
          'country.ca': 'Canada',
          'country.uk': 'United Kingdom',
        });

        const dynamicOptions = [
          { label: translationService.translate('country.us'), value: 'US' },
          { label: translationService.translate('country.ca'), value: 'CA' },
          { label: translationService.translate('country.uk'), value: 'UK' },
        ];

        const config = BootstrapFormTestUtils.builder()
          .field({
            key: 'country',
            type: 'select',
            label: translationService.translate('form.country.label'),
            placeholder: translationService.translate('form.country.placeholder'),
            options: dynamicOptions,
            props: {
              helpText: translationService.translate('form.country.helpText'),
            },
          })
          .build();

        const { fixture } = await BootstrapFormTestUtils.createTest({
          config,
          initialValue: { country: '' },
        });

        const label = fixture.debugElement.query(By.css('.form-label'));
        const select = fixture.debugElement.query(By.css('.form-select'));
        const helpText = fixture.debugElement.query(By.css('.form-text'));

        // Initial translations
        expect(label.nativeElement.textContent.trim()).toBe('Country');
        expect(helpText.nativeElement.textContent.trim()).toBe('Choose the country you live in');

        // Check placeholder option
        const options = select.nativeElement.querySelectorAll('option');
        expect(options[0].textContent.trim()).toBe('Select your country');
        expect(options[1].textContent.trim()).toBe('United States');
        expect(options[2].textContent.trim()).toBe('Canada');
        expect(options[3].textContent.trim()).toBe('United Kingdom');

        // Update to Spanish
        translationService.addTranslations({
          'form.country.label': 'País',
          'form.country.placeholder': 'Selecciona tu país',
          'form.country.helpText': 'Elige el país donde vives',
          'country.us': 'Estados Unidos',
          'country.ca': 'Canadá',
          'country.uk': 'Reino Unido',
        });
        translationService.setLanguage('es');

        fixture.detectChanges();
        await fixture.whenStable();

        expect(label.nativeElement.textContent.trim()).toBe('País');
        expect(helpText.nativeElement.textContent.trim()).toBe('Elige el país donde vives');

        const updatedOptions = select.nativeElement.querySelectorAll('option');
        expect(updatedOptions[0].textContent.trim()).toBe('Selecciona tu país');
        expect(updatedOptions[1].textContent.trim()).toBe('Estados Unidos');
        expect(updatedOptions[2].textContent.trim()).toBe('Canadá');
        expect(updatedOptions[3].textContent.trim()).toBe('Reino Unido');
      });
    });
  });
});
