import { By } from '@angular/platform-browser';
import { createTestTranslationService } from '../../testing/fake-translation.service';
import { BootstrapFormTestUtils } from '../../testing/bootstrap-test-utils';

describe('BsMultiCheckboxFieldComponent', () => {
  describe('Basic Multi-Checkbox Integration', () => {
    it('should render multi-checkbox with full configuration', async () => {
      const config = BootstrapFormTestUtils.builder()
        .field({
          key: 'hobbies',
          type: 'multi-checkbox',
          label: 'Hobbies',
          required: true,
          className: 'hobbies-checkbox',
          props: {
            helpText: 'Select all that apply',
          },
          options: [
            { value: 'reading', label: 'Reading' },
            { value: 'gaming', label: 'Gaming' },
            { value: 'cooking', label: 'Cooking' },
          ],
        })
        .build();

      const { fixture } = await BootstrapFormTestUtils.createTest({
        config,
        initialValue: {
          hobbies: [],
          skills: [],
          preferences: [],
        },
      });

      const checkboxes = fixture.debugElement.queryAll(By.css('.form-check-input[type="checkbox"]'));
      const label = fixture.debugElement.query(By.css('.form-label'));
      const helpText = fixture.debugElement.query(By.css('.form-text'));
      const wrapper = fixture.debugElement.query(By.css('df-bs-multi-checkbox'));

      expect(checkboxes.length).toBe(3);
      expect(label.nativeElement.textContent.trim()).toBe('Hobbies');
      expect(helpText.nativeElement.textContent.trim()).toBe('Select all that apply');
      expect(wrapper.nativeElement.className).toContain('hobbies-checkbox');

      // Check individual checkbox labels
      const checkboxLabels = fixture.debugElement.queryAll(By.css('.form-check-label'));
      expect(checkboxLabels[0].nativeElement.textContent.trim()).toBe('Reading');
      expect(checkboxLabels[1].nativeElement.textContent.trim()).toBe('Gaming');
      expect(checkboxLabels[2].nativeElement.textContent.trim()).toBe('Cooking');
    });

    it('should handle user checkbox selection and update form value', async () => {
      const config = BootstrapFormTestUtils.builder()
        .bsMultiCheckboxField({
          key: 'hobbies',
          options: [
            { value: 'reading', label: 'Reading' },
            { value: 'gaming', label: 'Gaming' },
            { value: 'cooking', label: 'Cooking' },
          ],
        })
        .build();

      const { component, fixture } = await BootstrapFormTestUtils.createTest({
        config,
        initialValue: {
          hobbies: [],
          skills: [],
          preferences: [],
        },
      });

      expect(BootstrapFormTestUtils.getFormValue(component).hobbies).toEqual([]);

      // Simulate checking first checkbox using utility
      await BootstrapFormTestUtils.simulateBsCheckbox(fixture, '.form-check-input[type="checkbox"]:first-of-type', true);

      expect(BootstrapFormTestUtils.getFormValue(component).hobbies).toEqual(['reading']);

      // Check second checkbox using utility
      await BootstrapFormTestUtils.simulateBsCheckbox(fixture, '.form-check-input[type="checkbox"]:nth-of-type(2)', true);

      expect(BootstrapFormTestUtils.getFormValue(component).hobbies).toEqual(['reading', 'gaming']);
    });

    it('should reflect external value changes in checkbox states', async () => {
      const config = BootstrapFormTestUtils.builder()
        .bsMultiCheckboxField({
          key: 'hobbies',
          options: [
            { value: 'reading', label: 'Reading' },
            { value: 'gaming', label: 'Gaming' },
            { value: 'cooking', label: 'Cooking' },
          ],
        })
        .build();

      const { component, fixture } = await BootstrapFormTestUtils.createTest({
        config,
        initialValue: {
          hobbies: [],
          skills: [],
          preferences: [],
        },
      });

      fixture.componentRef.setInput('value', {
        hobbies: ['reading', 'cooking'],
        skills: [],
        preferences: [],
      });
      fixture.detectChanges();

      expect(BootstrapFormTestUtils.getFormValue(component).hobbies).toEqual(['reading', 'cooking']);

      // Check that checkboxes reflect the state
      const checkboxes = fixture.debugElement.queryAll(By.css('.form-check-input[type="checkbox"]'));
      expect((checkboxes[0].nativeElement as HTMLInputElement).checked).toBe(true); // reading
      expect((checkboxes[1].nativeElement as HTMLInputElement).checked).toBe(false); // gaming
      expect((checkboxes[2].nativeElement as HTMLInputElement).checked).toBe(true); // cooking
    });
  });

  describe('Different Option Types Integration', () => {
    it('should handle string and number options correctly', async () => {
      const config = BootstrapFormTestUtils.builder()
        .bsMultiCheckboxField({
          key: 'skills',
          options: [
            { value: 'typescript', label: 'TypeScript' },
            { value: 'angular', label: 'Angular' },
            { value: 'react', label: 'React' },
          ],
        })
        .bsMultiCheckboxField({
          key: 'preferences',
          options: [
            { value: 1, label: 'Option 1' },
            { value: 2, label: 'Option 2' },
            { value: 3, label: 'Option 3' },
          ],
        })
        .build();

      const { component, fixture } = await BootstrapFormTestUtils.createTest({
        config,
        initialValue: {
          hobbies: [],
          skills: [],
          preferences: [],
        },
      });

      const checkboxGroups = fixture.debugElement.queryAll(By.css('df-bs-multi-checkbox'));
      const skillsCheckboxes = checkboxGroups[0].queryAll(By.css('.form-check-input[type="checkbox"]'));
      const preferencesCheckboxes = checkboxGroups[1].queryAll(By.css('.form-check-input[type="checkbox"]'));

      expect(skillsCheckboxes.length).toBe(3);
      expect(preferencesCheckboxes.length).toBe(3);

      // Test string options using utility
      await BootstrapFormTestUtils.simulateBsCheckbox(fixture, 'df-bs-multi-checkbox:first-of-type .form-check-input:first-of-type', true);
      await BootstrapFormTestUtils.simulateBsCheckbox(fixture, 'df-bs-multi-checkbox:first-of-type .form-check-input:last-of-type', true);

      expect(BootstrapFormTestUtils.getFormValue(component).skills).toEqual(['typescript', 'react']);

      // Test number options using utility
      await BootstrapFormTestUtils.simulateBsCheckbox(fixture, '.form-check-input[type="checkbox"]:nth-of-type(4)', true);
      await BootstrapFormTestUtils.simulateBsCheckbox(fixture, '.form-check-input[type="checkbox"]:nth-of-type(5)', true);

      expect(BootstrapFormTestUtils.getFormValue(component).preferences).toEqual([1, 2]);
    });

    it('should handle disabled options correctly', async () => {
      const config = BootstrapFormTestUtils.builder()
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

      const { fixture } = await BootstrapFormTestUtils.createTest({
        config,
        initialValue: { hobbies: [] },
      });

      const checkboxes = fixture.debugElement.queryAll(By.css('.form-check-input[type="checkbox"]'));

      expect((checkboxes[0].nativeElement as HTMLInputElement).disabled).toBe(false);
      expect((checkboxes[1].nativeElement as HTMLInputElement).disabled).toBe(true);
      expect((checkboxes[2].nativeElement as HTMLInputElement).disabled).toBe(false);
    });

    it('should handle field-level disabled state', async () => {
      const config = BootstrapFormTestUtils.builder()
        .bsMultiCheckboxField({
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

      const { fixture } = await BootstrapFormTestUtils.createTest({
        config,
        initialValue: { hobbies: [] },
      });

      const checkboxes = fixture.debugElement.queryAll(By.css('.form-check-input[type="checkbox"]'));

      checkboxes.forEach((checkbox) => {
        expect((checkbox.nativeElement as HTMLInputElement).disabled).toBe(true);
      });
    });
  });

  describe('Bootstrap-Specific Multi-Checkbox Features', () => {
    it('should render as switches when switch prop is true', async () => {
      const config = BootstrapFormTestUtils.builder()
        .bsMultiCheckboxField({
          key: 'hobbies',
          options: [
            { value: 'reading', label: 'Reading' },
            { value: 'gaming', label: 'Gaming' },
          ],
          props: {
            switch: true,
          },
        })
        .build();

      const { fixture } = await BootstrapFormTestUtils.createTest({
        config,
        initialValue: { hobbies: [] },
      });

      const formChecks = fixture.debugElement.queryAll(By.css('.form-check'));
      formChecks.forEach((formCheck) => {
        expect(formCheck.nativeElement.className).toContain('form-switch');
      });
    });

    it('should render inline when inline prop is true', async () => {
      const config = BootstrapFormTestUtils.builder()
        .bsMultiCheckboxField({
          key: 'hobbies',
          options: [
            { value: 'reading', label: 'Reading' },
            { value: 'gaming', label: 'Gaming' },
          ],
          props: {
            inline: true,
          },
        })
        .build();

      const { fixture } = await BootstrapFormTestUtils.createTest({
        config,
        initialValue: { hobbies: [] },
      });

      const formChecks = fixture.debugElement.queryAll(By.css('.form-check'));
      formChecks.forEach((formCheck) => {
        expect(formCheck.nativeElement.className).toContain('form-check-inline');
      });
    });

    it('should render with reverse layout when reverse prop is true', async () => {
      const config = BootstrapFormTestUtils.builder()
        .bsMultiCheckboxField({
          key: 'hobbies',
          options: [
            { value: 'reading', label: 'Reading' },
            { value: 'gaming', label: 'Gaming' },
          ],
          props: {
            reverse: true,
          },
        })
        .build();

      const { fixture } = await BootstrapFormTestUtils.createTest({
        config,
        initialValue: { hobbies: [] },
      });

      const formChecks = fixture.debugElement.queryAll(By.css('.form-check'));
      formChecks.forEach((formCheck) => {
        expect(formCheck.nativeElement.className).toContain('form-check-reverse');
      });
    });

    it('should combine multiple Bootstrap props', async () => {
      const config = BootstrapFormTestUtils.builder()
        .bsMultiCheckboxField({
          key: 'hobbies',
          options: [
            { value: 'reading', label: 'Reading' },
            { value: 'gaming', label: 'Gaming' },
          ],
          props: {
            switch: true,
            inline: true,
          },
        })
        .build();

      const { fixture } = await BootstrapFormTestUtils.createTest({
        config,
        initialValue: { hobbies: [] },
      });

      const formChecks = fixture.debugElement.queryAll(By.css('.form-check'));
      formChecks.forEach((formCheck) => {
        expect(formCheck.nativeElement.className).toContain('form-switch');
        expect(formCheck.nativeElement.className).toContain('form-check-inline');
      });
    });
  });

  describe('Minimal Configuration Tests', () => {
    it('should render with default Bootstrap configuration', async () => {
      const config = BootstrapFormTestUtils.builder()
        .bsMultiCheckboxField({
          key: 'hobbies',
          options: [
            { value: 'reading', label: 'Reading' },
            { value: 'gaming', label: 'Gaming' },
          ],
        })
        .build();

      const { fixture } = await BootstrapFormTestUtils.createTest({
        config,
        initialValue: { hobbies: [] },
      });

      const checkboxes = fixture.debugElement.queryAll(By.css('.form-check-input[type="checkbox"]'));
      const formChecks = fixture.debugElement.queryAll(By.css('.form-check'));

      expect(checkboxes.length).toBe(2);
      // Should not have switch, inline, or reverse classes by default
      formChecks.forEach((formCheck) => {
        expect(formCheck.nativeElement.className).not.toContain('form-switch');
        expect(formCheck.nativeElement.className).not.toContain('form-check-inline');
        expect(formCheck.nativeElement.className).not.toContain('form-check-reverse');
      });
    });

    it('should not display helpText when not provided', async () => {
      const config = BootstrapFormTestUtils.builder()
        .bsMultiCheckboxField({ key: 'hobbies', options: [{ value: 'reading', label: 'Reading' }] })
        .build();

      const { fixture } = await BootstrapFormTestUtils.createTest({
        config,
        initialValue: { hobbies: [] },
      });

      const helpText = fixture.debugElement.query(By.css('.form-text'));
      expect(helpText).toBeNull();
    });

    it('should not display label when not provided', async () => {
      const config = BootstrapFormTestUtils.builder()
        .field({
          key: 'hobbies',
          type: 'multi-checkbox',
          options: [{ value: 'reading', label: 'Reading' }],
        })
        .build();

      const { fixture } = await BootstrapFormTestUtils.createTest({
        config,
        initialValue: { hobbies: [] },
      });

      const label = fixture.debugElement.query(By.css('.form-label'));
      expect(label).toBeNull();
    });
  });

  describe('Complex Interaction Tests', () => {
    it('should handle checking and unchecking multiple checkboxes', async () => {
      const config = BootstrapFormTestUtils.builder()
        .bsMultiCheckboxField({
          key: 'hobbies',
          options: [
            { value: 'reading', label: 'Reading' },
            { value: 'gaming', label: 'Gaming' },
            { value: 'cooking', label: 'Cooking' },
          ],
        })
        .build();

      const { component, fixture } = await BootstrapFormTestUtils.createTest({
        config,
        initialValue: { hobbies: [] },
      });

      // Check all checkboxes using utility
      await BootstrapFormTestUtils.simulateBsCheckbox(fixture, '.form-check-input[type="checkbox"]:nth-of-type(1)', true);
      await BootstrapFormTestUtils.simulateBsCheckbox(fixture, '.form-check-input[type="checkbox"]:nth-of-type(2)', true);
      await BootstrapFormTestUtils.simulateBsCheckbox(fixture, '.form-check-input[type="checkbox"]:nth-of-type(3)', true);

      expect(BootstrapFormTestUtils.getFormValue(component).hobbies).toEqual(['reading', 'gaming', 'cooking']);

      // Uncheck middle checkbox using utility
      await BootstrapFormTestUtils.simulateBsCheckbox(fixture, '.form-check-input[type="checkbox"]:nth-of-type(2)', false);

      expect(BootstrapFormTestUtils.getFormValue(component).hobbies).toEqual(['reading', 'cooking']);

      // Uncheck all remaining using utility
      await BootstrapFormTestUtils.simulateBsCheckbox(fixture, '.form-check-input[type="checkbox"]:nth-of-type(1)', false);
      await BootstrapFormTestUtils.simulateBsCheckbox(fixture, '.form-check-input[type="checkbox"]:nth-of-type(3)', false);

      expect(BootstrapFormTestUtils.getFormValue(component).hobbies).toEqual([]);
    });

    it('should handle multiple checkbox groups independently', async () => {
      const config = BootstrapFormTestUtils.builder()
        .bsMultiCheckboxField({
          key: 'hobbies',
          options: [
            { value: 'reading', label: 'Reading' },
            { value: 'gaming', label: 'Gaming' },
          ],
        })
        .bsMultiCheckboxField({
          key: 'skills',
          options: [
            { value: 'typescript', label: 'TypeScript' },
            { value: 'angular', label: 'Angular' },
          ],
        })
        .build();

      const { component, fixture } = await BootstrapFormTestUtils.createTest({
        config,
        initialValue: {
          hobbies: ['reading'],
          skills: ['typescript'],
        },
      });

      expect(BootstrapFormTestUtils.getFormValue(component).hobbies).toEqual(['reading']);
      expect(BootstrapFormTestUtils.getFormValue(component).skills).toEqual(['typescript']);

      // Change hobbies using utility (last checkbox in first group)
      await BootstrapFormTestUtils.simulateBsCheckbox(fixture, '.form-check-input[type="checkbox"]:nth-of-type(2)', true);

      let formValue = BootstrapFormTestUtils.getFormValue(component);
      expect(formValue.hobbies).toEqual(['reading', 'gaming']);
      expect(formValue.skills).toEqual(['typescript']); // Should remain unchanged

      // Change skills using utility (last checkbox overall)
      await BootstrapFormTestUtils.simulateBsCheckbox(fixture, '.form-check-input[type="checkbox"]:last-of-type', true);

      formValue = BootstrapFormTestUtils.getFormValue(component);
      expect(formValue.hobbies).toEqual(['reading', 'gaming']); // Should remain unchanged
      expect(formValue.skills).toEqual(['typescript', 'angular']);
    });
  });

  describe('Edge Cases and Robustness Tests', () => {
    it('should handle undefined form values gracefully', async () => {
      const config = BootstrapFormTestUtils.builder()
        .bsMultiCheckboxField({ key: 'hobbies', options: [{ value: 'reading', label: 'Reading' }] })
        .build();

      const { fixture } = await BootstrapFormTestUtils.createTest({ config }); // No initial value provided

      const checkboxes = fixture.debugElement.queryAll(By.css('.form-check-input[type="checkbox"]'));
      expect(checkboxes).toBeTruthy();
      expect(checkboxes.length).toBe(1);
    });

    it('should handle null form values gracefully', async () => {
      const config = BootstrapFormTestUtils.builder()
        .bsMultiCheckboxField({ key: 'hobbies', options: [{ value: 'reading', label: 'Reading' }] })
        .build();

      const { fixture } = await BootstrapFormTestUtils.createTest({
        config,
        initialValue: null as any,
      });

      const checkboxes = fixture.debugElement.queryAll(By.css('.form-check-input[type="checkbox"]'));
      expect(checkboxes).toBeTruthy();
      expect(checkboxes.length).toBe(1);
    });

    it('should handle empty options array', async () => {
      const config = BootstrapFormTestUtils.builder()
        .field({
          key: 'hobbies',
          type: 'multi-checkbox',
          label: 'Hobbies',
          options: [],
        })
        .build();

      const { component, fixture } = await BootstrapFormTestUtils.createTest({
        config,
        initialValue: { hobbies: [] },
      });

      const checkboxes = fixture.debugElement.queryAll(By.css('.form-check-input[type="checkbox"]'));
      expect(checkboxes.length).toBe(0);
      expect(BootstrapFormTestUtils.getFormValue(component).hobbies).toEqual([]);
    });

    it('should handle rapid checkbox clicking correctly', async () => {
      const config = BootstrapFormTestUtils.builder()
        .bsMultiCheckboxField({
          key: 'hobbies',
          options: [
            { value: 'reading', label: 'Reading' },
            { value: 'gaming', label: 'Gaming' },
          ],
        })
        .build();

      const { component, fixture } = await BootstrapFormTestUtils.createTest({
        config,
        initialValue: { hobbies: [] },
      });

      // Rapid clicking using utility methods
      await BootstrapFormTestUtils.simulateBsCheckbox(fixture, '.form-check-input[type="checkbox"]:first-of-type', true);
      await BootstrapFormTestUtils.simulateBsCheckbox(fixture, '.form-check-input[type="checkbox"]:last-of-type', true);
      await BootstrapFormTestUtils.simulateBsCheckbox(fixture, '.form-check-input[type="checkbox"]:first-of-type', false); // Uncheck
      await BootstrapFormTestUtils.simulateBsCheckbox(fixture, '.form-check-input[type="checkbox"]:last-of-type', false); // Uncheck
      await BootstrapFormTestUtils.simulateBsCheckbox(fixture, '.form-check-input[type="checkbox"]:first-of-type', true); // Check again

      // Should have the final state
      expect(BootstrapFormTestUtils.getFormValue(component).hobbies).toEqual(['reading']);

      const checkboxes = fixture.debugElement.queryAll(By.css('.form-check-input[type="checkbox"]'));
      expect((checkboxes[0].nativeElement as HTMLInputElement).checked).toBe(true);
      expect((checkboxes[1].nativeElement as HTMLInputElement).checked).toBe(false);
    });
  });

  describe('Dynamic Text Support', () => {
    describe('Translation Service Integration', () => {
      it('should handle translation service with dynamic language updates for labels and options', async () => {
        const translationService = createTestTranslationService({
          'form.hobbies.label': 'Select Hobbies',
          'form.hobbies.helpText': 'Choose your hobbies',
          'hobby.reading': 'Reading',
          'hobby.gaming': 'Gaming',
          'hobby.cooking': 'Cooking',
        });

        const dynamicOptions = [
          { value: 'reading', label: translationService.translate('hobby.reading') },
          { value: 'gaming', label: translationService.translate('hobby.gaming') },
          { value: 'cooking', label: translationService.translate('hobby.cooking') },
        ];

        const config = BootstrapFormTestUtils.builder()
          .field({
            key: 'hobbies',
            type: 'multi-checkbox',
            label: translationService.translate('form.hobbies.label'),
            options: dynamicOptions,
            props: {
              helpText: translationService.translate('form.hobbies.helpText'),
            },
          })
          .build();

        const { fixture } = await BootstrapFormTestUtils.createTest({
          config,
          initialValue: { hobbies: [] },
        });

        const labelElement = fixture.debugElement.query(By.css('.form-label'));
        const helpTextElement = fixture.debugElement.query(By.css('.form-text'));
        const checkboxLabels = fixture.debugElement.queryAll(By.css('.form-check-label'));

        expect(labelElement.nativeElement.textContent.trim()).toBe('Select Hobbies');
        expect(helpTextElement.nativeElement.textContent.trim()).toBe('Choose your hobbies');
        expect(checkboxLabels[0].nativeElement.textContent.trim()).toBe('Reading');
        expect(checkboxLabels[1].nativeElement.textContent.trim()).toBe('Gaming');
        expect(checkboxLabels[2].nativeElement.textContent.trim()).toBe('Cooking');

        translationService.addTranslations({
          'form.hobbies.label': 'Seleccionar Pasatiempos',
          'form.hobbies.helpText': 'Elige tus pasatiempos',
          'hobby.reading': 'Lectura',
          'hobby.gaming': 'Juegos',
          'hobby.cooking': 'Cocina',
        });
        translationService.setLanguage('es');

        fixture.detectChanges();
        await fixture.whenStable();

        expect(labelElement.nativeElement.textContent.trim()).toBe('Seleccionar Pasatiempos');
        expect(helpTextElement.nativeElement.textContent.trim()).toBe('Elige tus pasatiempos');

        const updatedCheckboxLabels = fixture.debugElement.queryAll(By.css('.form-check-label'));
        expect(updatedCheckboxLabels[0].nativeElement.textContent.trim()).toBe('Lectura');
        expect(updatedCheckboxLabels[1].nativeElement.textContent.trim()).toBe('Juegos');
        expect(updatedCheckboxLabels[2].nativeElement.textContent.trim()).toBe('Cocina');
      });
    });
  });

  // Note: Validation state display is handled at the form level in signal-based forms
  // and is tested through the form validation tests above
});
