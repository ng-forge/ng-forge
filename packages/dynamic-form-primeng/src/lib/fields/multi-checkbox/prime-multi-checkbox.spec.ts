import { By } from '@angular/platform-browser';
import { Checkbox } from 'primeng/checkbox';
import { createTestTranslationService } from '../../testing/fake-translation.service';
import { PrimeNGFormTestUtils } from '../../testing/primeng-test-utils';

describe('PrimeMultiCheckboxFieldComponent', () => {
  describe('Basic Multi-Checkbox Integration', () => {
    it('should render multi-checkbox with full configuration', async () => {
      const config = PrimeNGFormTestUtils.builder()
        .field({
          key: 'hobbies',
          type: 'multi-checkbox',
          label: 'Hobbies',
          required: true,
          className: 'hobbies-checkbox',
          props: {
            hint: 'Select all that apply',
          },
          options: [
            { value: 'reading', label: 'Reading' },
            { value: 'gaming', label: 'Gaming' },
            { value: 'cooking', label: 'Cooking' },
          ],
        })
        .build();

      const { fixture } = await PrimeNGFormTestUtils.createTest({
        config,
        initialValue: {
          hobbies: [],
          skills: [],
          preferences: [],
        },
      });

      const checkboxes = fixture.debugElement.queryAll(By.directive(Checkbox));
      const label = fixture.debugElement.query(By.css('.checkbox-group-label'));
      const hint = fixture.debugElement.query(By.css('.p-hint'));
      const wrapper = fixture.debugElement.query(By.css('df-prime-multi-checkbox'));

      expect(checkboxes.length).toBe(3);
      expect(label.nativeElement.textContent.trim()).toBe('Hobbies');
      expect(hint.nativeElement.textContent.trim()).toBe('Select all that apply');
      expect(wrapper.nativeElement.className).toContain('hobbies-checkbox');

      // Check individual checkbox labels
      expect(checkboxes[0].nativeElement.textContent.trim()).toBe('Reading');
      expect(checkboxes[1].nativeElement.textContent.trim()).toBe('Gaming');
      expect(checkboxes[2].nativeElement.textContent.trim()).toBe('Cooking');
    });

    it('should handle user checkbox selection and update form value', async () => {
      const config = PrimeNGFormTestUtils.builder()
        .primeMultiCheckboxField({
          key: 'hobbies',
          options: [
            { value: 'reading', label: 'Reading' },
            { value: 'gaming', label: 'Gaming' },
            { value: 'cooking', label: 'Cooking' },
          ],
        })
        .build();

      const { component, fixture } = await PrimeNGFormTestUtils.createTest({
        config,
        initialValue: {
          hobbies: [],
          skills: [],
          preferences: [],
        },
      });

      // Initial value check
      expect(PrimeNGFormTestUtils.getFormValue(component).hobbies).toEqual([]);

      // Simulate checking first checkbox using utility
      await PrimeNGFormTestUtils.simulatePrimeCheckbox(fixture, 'p-checkbox:first-of-type', true);

      // Verify form value updated
      expect(PrimeNGFormTestUtils.getFormValue(component).hobbies).toEqual(['reading']);

      // Check second checkbox using utility
      await PrimeNGFormTestUtils.simulatePrimeCheckbox(fixture, 'p-checkbox:nth-of-type(2)', true);

      expect(PrimeNGFormTestUtils.getFormValue(component).hobbies).toEqual(['reading', 'gaming']);
    });

    it('should reflect external value changes in checkbox states', async () => {
      const config = PrimeNGFormTestUtils.builder()
        .primeMultiCheckboxField({
          key: 'hobbies',
          options: [
            { value: 'reading', label: 'Reading' },
            { value: 'gaming', label: 'Gaming' },
            { value: 'cooking', label: 'Cooking' },
          ],
        })
        .build();

      const { component, fixture } = await PrimeNGFormTestUtils.createTest({
        config,
        initialValue: {
          hobbies: [],
          skills: [],
          preferences: [],
        },
      });

      // Update form model programmatically
      fixture.componentRef.setInput('value', {
        hobbies: ['reading', 'cooking'],
        skills: [],
        preferences: [],
      });
      fixture.detectChanges();

      expect(PrimeNGFormTestUtils.getFormValue(component).hobbies).toEqual(['reading', 'cooking']);

      // Check that checkboxes reflect the state
      const checkboxes = fixture.debugElement.queryAll(By.directive(Checkbox));
      expect(checkboxes[0].componentInstance.checked()).toBe(true); // reading
      expect(checkboxes[1].componentInstance.checked()).toBe(false); // gaming
      expect(checkboxes[2].componentInstance.checked()).toBe(true); // cooking
    });
  });

  describe('Different Option Types Integration', () => {
    it('should handle string and number options correctly', async () => {
      const config = PrimeNGFormTestUtils.builder()
        .primeMultiCheckboxField({
          key: 'skills',
          options: [
            { value: 'typescript', label: 'TypeScript' },
            { value: 'angular', label: 'Angular' },
            { value: 'react', label: 'React' },
          ],
        })
        .primeMultiCheckboxField({
          key: 'preferences',
          options: [
            { value: 1, label: 'Option 1' },
            { value: 2, label: 'Option 2' },
            { value: 3, label: 'Option 3' },
          ],
        })
        .build();

      const { component, fixture } = await PrimeNGFormTestUtils.createTest({
        config,
        initialValue: {
          hobbies: [],
          skills: [],
          preferences: [],
        },
      });

      const checkboxGroups = fixture.debugElement.queryAll(By.css('df-prime-multi-checkbox'));
      const skillsCheckboxes = checkboxGroups[0].queryAll(By.directive(Checkbox));
      const preferencesCheckboxes = checkboxGroups[1].queryAll(By.directive(Checkbox));

      expect(skillsCheckboxes.length).toBe(3);
      expect(preferencesCheckboxes.length).toBe(3);

      // Test string options using utility
      await PrimeNGFormTestUtils.simulatePrimeCheckbox(fixture, 'df-prime-multi-checkbox:first-of-type p-checkbox:first-of-type', true);
      await PrimeNGFormTestUtils.simulatePrimeCheckbox(fixture, 'df-prime-multi-checkbox:first-of-type p-checkbox:last-of-type', true);

      expect(PrimeNGFormTestUtils.getFormValue(component).skills).toEqual(['typescript', 'react']);

      // Test number options using utility
      await PrimeNGFormTestUtils.simulatePrimeCheckbox(fixture, 'df-prime-multi-checkbox:nth-of-type(2) p-checkbox:nth-of-type(1)', true);
      await PrimeNGFormTestUtils.simulatePrimeCheckbox(fixture, 'df-prime-multi-checkbox:nth-of-type(2) p-checkbox:nth-of-type(2)', true);

      expect(PrimeNGFormTestUtils.getFormValue(component).preferences).toEqual([1, 2]);
    });

    it('should handle disabled options correctly', async () => {
      const config = PrimeNGFormTestUtils.builder()
        .field({
          key: 'hobbies',
          type: 'multi-checkbox',
          label: 'Hobbies',
          options: [
            { value: 'reading', label: 'Reading' },
            { value: 'gaming', label: 'Gaming', disabled: true },
            { value: 'cooking', label: 'Cooking' },
          ],
        })
        .build();

      const { fixture } = await PrimeNGFormTestUtils.createTest({
        config,
        initialValue: { hobbies: [] },
      });

      const checkboxes = fixture.debugElement.queryAll(By.directive(Checkbox));

      expect(checkboxes[0].componentInstance.disabled()).toBe(false);
      expect(checkboxes[1].componentInstance.disabled()).toBe(true);
      expect(checkboxes[2].componentInstance.disabled()).toBe(false);
    });

    it('should handle field-level disabled state', async () => {
      const config = PrimeNGFormTestUtils.builder()
        .primeMultiCheckboxField({
          key: 'hobbies',
          label: 'Hobbies',
          disabled: true,
          options: [
            { value: 'reading', label: 'Reading' },
            { value: 'gaming', label: 'Gaming' },
            { value: 'cooking', label: 'Cooking' },
          ],
        })
        .build();

      const { fixture } = await PrimeNGFormTestUtils.createTest({
        config,
        initialValue: { hobbies: [] },
      });

      const checkboxes = fixture.debugElement.queryAll(By.directive(Checkbox));

      checkboxes.forEach((checkbox) => {
        expect(checkbox.componentInstance.disabled()).toBe(true);
      });
    });
  });

  describe('Different PrimeNG Configurations', () => {
    it('should apply different style classes correctly', async () => {
      const config = PrimeNGFormTestUtils.builder()
        .primeMultiCheckboxField({
          key: 'hobbies',
          options: [{ value: 'reading', label: 'Reading' }],
          props: { styleClass: 'primary-checkbox' },
        })
        .primeMultiCheckboxField({
          key: 'skills',
          options: [{ value: 'typescript', label: 'TypeScript' }],
          props: { styleClass: 'accent-checkbox' },
        })
        .build();

      const { fixture } = await PrimeNGFormTestUtils.createTest({
        config,
        initialValue: { hobbies: [], skills: [] },
      });

      const checkboxGroups = fixture.debugElement.queryAll(By.css('df-prime-multi-checkbox'));
      const primaryCheckbox = checkboxGroups[0].query(By.directive(Checkbox));
      const accentCheckbox = checkboxGroups[1].query(By.directive(Checkbox));

      expect(primaryCheckbox.componentInstance.styleClass()).toBe('primary-checkbox');
      expect(accentCheckbox.componentInstance.styleClass()).toBe('accent-checkbox');
    });
  });

  describe('Minimal Configuration Tests', () => {
    it('should render with default PrimeNG configuration', async () => {
      const config = PrimeNGFormTestUtils.builder()
        .primeMultiCheckboxField({
          key: 'hobbies',
          options: [
            { value: 'reading', label: 'Reading' },
            { value: 'gaming', label: 'Gaming' },
          ],
        })
        .build();

      const { fixture } = await PrimeNGFormTestUtils.createTest({
        config,
        initialValue: { hobbies: [] },
      });

      const checkboxes = fixture.debugElement.queryAll(By.directive(Checkbox));
      expect(checkboxes[0].componentInstance.binary()).toBe(false);
    });

    it('should not display hint when not provided', async () => {
      const config = PrimeNGFormTestUtils.builder()
        .primeMultiCheckboxField({ key: 'hobbies', options: [{ value: 'reading', label: 'Reading' }] })
        .build();

      const { fixture } = await PrimeNGFormTestUtils.createTest({
        config,
        initialValue: { hobbies: [] },
      });

      const hint = fixture.debugElement.query(By.css('.p-hint'));
      expect(hint).toBeNull();
    });

    it('should not display label when not provided', async () => {
      const config = PrimeNGFormTestUtils.builder()
        .field({
          key: 'hobbies',
          type: 'multi-checkbox',
          options: [{ value: 'reading', label: 'Reading' }],
        })
        .build();

      const { fixture } = await PrimeNGFormTestUtils.createTest({
        config,
        initialValue: { hobbies: [] },
      });

      const label = fixture.debugElement.query(By.css('.checkbox-group-label'));
      expect(label).toBeNull();
    });
  });

  describe('Complex Interaction Tests', () => {
    it('should handle checking and unchecking multiple checkboxes', async () => {
      const config = PrimeNGFormTestUtils.builder()
        .primeMultiCheckboxField({
          key: 'hobbies',
          options: [
            { value: 'reading', label: 'Reading' },
            { value: 'gaming', label: 'Gaming' },
            { value: 'cooking', label: 'Cooking' },
          ],
        })
        .build();

      const { component, fixture } = await PrimeNGFormTestUtils.createTest({
        config,
        initialValue: { hobbies: [] },
      });

      // Check all checkboxes using utility
      await PrimeNGFormTestUtils.simulatePrimeCheckbox(fixture, 'p-checkbox:nth-of-type(1)', true);
      await PrimeNGFormTestUtils.simulatePrimeCheckbox(fixture, 'p-checkbox:nth-of-type(2)', true);
      await PrimeNGFormTestUtils.simulatePrimeCheckbox(fixture, 'p-checkbox:nth-of-type(3)', true);

      expect(PrimeNGFormTestUtils.getFormValue(component).hobbies).toEqual(['reading', 'gaming', 'cooking']);

      // Uncheck middle checkbox using utility
      await PrimeNGFormTestUtils.simulatePrimeCheckbox(fixture, 'p-checkbox:nth-of-type(2)', false);

      expect(PrimeNGFormTestUtils.getFormValue(component).hobbies).toEqual(['reading', 'cooking']);

      // Uncheck all remaining using utility
      await PrimeNGFormTestUtils.simulatePrimeCheckbox(fixture, 'p-checkbox:nth-of-type(1)', false);
      await PrimeNGFormTestUtils.simulatePrimeCheckbox(fixture, 'p-checkbox:nth-of-type(3)', false);

      expect(PrimeNGFormTestUtils.getFormValue(component).hobbies).toEqual([]);
    });

    it('should handle multiple checkbox groups independently', async () => {
      const config = PrimeNGFormTestUtils.builder()
        .primeMultiCheckboxField({
          key: 'hobbies',
          options: [
            { value: 'reading', label: 'Reading' },
            { value: 'gaming', label: 'Gaming' },
          ],
        })
        .primeMultiCheckboxField({
          key: 'skills',
          options: [
            { value: 'typescript', label: 'TypeScript' },
            { value: 'angular', label: 'Angular' },
          ],
        })
        .build();

      const { component, fixture } = await PrimeNGFormTestUtils.createTest({
        config,
        initialValue: {
          hobbies: ['reading'],
          skills: ['typescript'],
        },
      });

      // Initial values
      expect(PrimeNGFormTestUtils.getFormValue(component).hobbies).toEqual(['reading']);
      expect(PrimeNGFormTestUtils.getFormValue(component).skills).toEqual(['typescript']);

      // Change hobbies using utility
      await PrimeNGFormTestUtils.simulatePrimeCheckbox(fixture, 'df-prime-multi-checkbox:first-of-type p-checkbox:last-of-type', true);

      let formValue = PrimeNGFormTestUtils.getFormValue(component);
      expect(formValue.hobbies).toEqual(['reading', 'gaming']);
      expect(formValue.skills).toEqual(['typescript']); // Should remain unchanged

      // Change skills using utility
      await PrimeNGFormTestUtils.simulatePrimeCheckbox(fixture, 'df-prime-multi-checkbox:last-of-type p-checkbox:last-of-type', true);

      formValue = PrimeNGFormTestUtils.getFormValue(component);
      expect(formValue.hobbies).toEqual(['reading', 'gaming']); // Should remain unchanged
      expect(formValue.skills).toEqual(['typescript', 'angular']);
    });
  });

  describe('Edge Cases and Robustness Tests', () => {
    it('should handle undefined form values gracefully', async () => {
      const config = PrimeNGFormTestUtils.builder()
        .primeMultiCheckboxField({ key: 'hobbies', options: [{ value: 'reading', label: 'Reading' }] })
        .build();

      const { fixture } = await PrimeNGFormTestUtils.createTest({ config }); // No initial value provided

      const checkboxes = fixture.debugElement.queryAll(By.directive(Checkbox));
      expect(checkboxes).toBeTruthy();
      expect(checkboxes.length).toBe(1);
    });

    it('should handle null form values gracefully', async () => {
      const config = PrimeNGFormTestUtils.builder()
        .primeMultiCheckboxField({ key: 'hobbies', options: [{ value: 'reading', label: 'Reading' }] })
        .build();

      const { fixture } = await PrimeNGFormTestUtils.createTest({
        config,
        initialValue: null as unknown,
      });

      const checkboxes = fixture.debugElement.queryAll(By.directive(Checkbox));
      expect(checkboxes).toBeTruthy();
      expect(checkboxes.length).toBe(1);
    });

    it('should handle empty options array', async () => {
      const config = PrimeNGFormTestUtils.builder()
        .field({
          key: 'hobbies',
          type: 'multi-checkbox',
          label: 'Hobbies',
          options: [],
        })
        .build();

      const { component, fixture } = await PrimeNGFormTestUtils.createTest({
        config,
        initialValue: { hobbies: [] },
      });

      const checkboxes = fixture.debugElement.queryAll(By.directive(Checkbox));
      expect(checkboxes.length).toBe(0);
      expect(PrimeNGFormTestUtils.getFormValue(component).hobbies).toEqual([]);
    });

    it('should handle rapid checkbox clicking correctly', async () => {
      const config = PrimeNGFormTestUtils.builder()
        .primeMultiCheckboxField({
          key: 'hobbies',
          options: [
            { value: 'reading', label: 'Reading' },
            { value: 'gaming', label: 'Gaming' },
          ],
        })
        .build();

      const { component, fixture } = await PrimeNGFormTestUtils.createTest({
        config,
        initialValue: { hobbies: [] },
      });

      // Rapid clicking using utility methods
      await PrimeNGFormTestUtils.simulatePrimeCheckbox(fixture, 'p-checkbox:first-of-type', true);
      await PrimeNGFormTestUtils.simulatePrimeCheckbox(fixture, 'p-checkbox:last-of-type', true);
      await PrimeNGFormTestUtils.simulatePrimeCheckbox(fixture, 'p-checkbox:first-of-type', false); // Uncheck
      await PrimeNGFormTestUtils.simulatePrimeCheckbox(fixture, 'p-checkbox:last-of-type', false); // Uncheck
      await PrimeNGFormTestUtils.simulatePrimeCheckbox(fixture, 'p-checkbox:first-of-type', true); // Check again

      // Should have the final state
      expect(PrimeNGFormTestUtils.getFormValue(component).hobbies).toEqual(['reading']);

      const checkboxes = fixture.debugElement.queryAll(By.directive(Checkbox));
      expect(checkboxes[0].componentInstance.checked()).toBe(true);
      expect(checkboxes[1].componentInstance.checked()).toBe(false);
    });
  });

  describe('Dynamic Text Support', () => {
    describe('Translation Service Integration', () => {
      it('should handle translation service with dynamic language updates for labels and options', async () => {
        const translationService = createTestTranslationService({
          'form.hobbies.label': 'Select Hobbies',
          'form.hobbies.hint': 'Choose your hobbies',
          'hobby.reading': 'Reading',
          'hobby.gaming': 'Gaming',
          'hobby.cooking': 'Cooking',
        });

        const dynamicOptions = [
          { value: 'reading', label: translationService.translate('hobby.reading') },
          { value: 'gaming', label: translationService.translate('hobby.gaming') },
          { value: 'cooking', label: translationService.translate('hobby.cooking') },
        ];

        const config = PrimeNGFormTestUtils.builder()
          .field({
            key: 'hobbies',
            type: 'multi-checkbox',
            label: translationService.translate('form.hobbies.label'),
            options: dynamicOptions,
            props: {
              hint: translationService.translate('form.hobbies.hint'),
            },
          })
          .build();

        const { fixture } = await PrimeNGFormTestUtils.createTest({
          config,
          initialValue: { hobbies: [] },
        });

        const labelElement = fixture.debugElement.query(By.css('.checkbox-group-label'));
        const hintElement = fixture.debugElement.query(By.css('.p-hint'));
        const checkboxes = fixture.debugElement.queryAll(By.directive(Checkbox));

        // Initial translations
        expect(labelElement.nativeElement.textContent.trim()).toBe('Select Hobbies');
        expect(hintElement.nativeElement.textContent.trim()).toBe('Choose your hobbies');
        expect(checkboxes[0].nativeElement.textContent.trim()).toBe('Reading');
        expect(checkboxes[1].nativeElement.textContent.trim()).toBe('Gaming');
        expect(checkboxes[2].nativeElement.textContent.trim()).toBe('Cooking');

        // Update to Spanish
        translationService.addTranslations({
          'form.hobbies.label': 'Seleccionar Pasatiempos',
          'form.hobbies.hint': 'Elige tus pasatiempos',
          'hobby.reading': 'Lectura',
          'hobby.gaming': 'Juegos',
          'hobby.cooking': 'Cocina',
        });
        translationService.setLanguage('es');

        fixture.detectChanges();
        await fixture.whenStable();

        expect(labelElement.nativeElement.textContent.trim()).toBe('Seleccionar Pasatiempos');
        expect(hintElement.nativeElement.textContent.trim()).toBe('Elige tus pasatiempos');

        const updatedCheckboxes = fixture.debugElement.queryAll(By.directive(Checkbox));
        expect(updatedCheckboxes[0].nativeElement.textContent.trim()).toBe('Lectura');
        expect(updatedCheckboxes[1].nativeElement.textContent.trim()).toBe('Juegos');
        expect(updatedCheckboxes[2].nativeElement.textContent.trim()).toBe('Cocina');
      });
    });
  });
});
