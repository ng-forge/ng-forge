import { By } from '@angular/platform-browser';
import { MatCheckbox } from '@angular/material/checkbox';
import { createTestTranslationService } from '../../testing/fake-translation.service';
import { MaterialFormTestUtils } from '../../testing/material-test-utils';

describe('MatMultiCheckboxFieldComponent', () => {
  describe('Basic Multi-Checkbox Integration', () => {
    it('should render multi-checkbox with full configuration', async () => {
      const config = MaterialFormTestUtils.builder()
        .field({
          key: 'hobbies',
          type: 'multi-checkbox',
          label: 'Hobbies',
          required: true,
          className: 'hobbies-checkbox',
          props: {
            hint: 'Select all that apply',
            color: 'primary',
            labelPosition: 'after',
          },
          options: [
            { value: 'reading', label: 'Reading' },
            { value: 'gaming', label: 'Gaming' },
            { value: 'cooking', label: 'Cooking' },
          ],
        })
        .build();

      const { fixture } = await MaterialFormTestUtils.createTest({
        config,
        initialValue: {
          hobbies: [],
          skills: [],
          preferences: [],
        },
      });

      const checkboxes = fixture.debugElement.queryAll(By.directive(MatCheckbox));
      const label = fixture.debugElement.query(By.css('.checkbox-group-label'));
      const hint = fixture.debugElement.query(By.css('.mat-hint'));
      const wrapper = fixture.debugElement.query(By.css('df-mat-multi-checkbox'));

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
      const config = MaterialFormTestUtils.builder()
        .matMultiCheckboxField({
          key: 'hobbies',
          options: [
            { value: 'reading', label: 'Reading' },
            { value: 'gaming', label: 'Gaming' },
            { value: 'cooking', label: 'Cooking' },
          ],
        })
        .build();

      const { component, fixture } = await MaterialFormTestUtils.createTest({
        config,
        initialValue: {
          hobbies: [],
          skills: [],
          preferences: [],
        },
      });

      // Initial value check
      expect(MaterialFormTestUtils.getFormValue(component).hobbies).toEqual([]);

      // Simulate checking first checkbox using utility
      await MaterialFormTestUtils.simulateMatCheckbox(fixture, 'mat-checkbox:first-of-type', true);

      // Verify form value updated
      expect(MaterialFormTestUtils.getFormValue(component).hobbies).toEqual(['reading']);

      // Check second checkbox using utility
      await MaterialFormTestUtils.simulateMatCheckbox(fixture, 'mat-checkbox:nth-of-type(2)', true);

      expect(MaterialFormTestUtils.getFormValue(component).hobbies).toEqual(['reading', 'gaming']);
    });

    it('should reflect external value changes in checkbox states', async () => {
      const config = MaterialFormTestUtils.builder()
        .matMultiCheckboxField({
          key: 'hobbies',
          options: [
            { value: 'reading', label: 'Reading' },
            { value: 'gaming', label: 'Gaming' },
            { value: 'cooking', label: 'Cooking' },
          ],
        })
        .build();

      const { component, fixture } = await MaterialFormTestUtils.createTest({
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

      expect(MaterialFormTestUtils.getFormValue(component).hobbies).toEqual(['reading', 'cooking']);

      // Check that checkboxes reflect the state
      const checkboxes = fixture.debugElement.queryAll(By.directive(MatCheckbox));
      expect(checkboxes[0].componentInstance.checked).toBe(true); // reading
      expect(checkboxes[1].componentInstance.checked).toBe(false); // gaming
      expect(checkboxes[2].componentInstance.checked).toBe(true); // cooking
    });
  });

  describe('Different Option Types Integration', () => {
    it('should handle string and number options correctly', async () => {
      const config = MaterialFormTestUtils.builder()
        .matMultiCheckboxField({
          key: 'skills',
          options: [
            { value: 'typescript', label: 'TypeScript' },
            { value: 'angular', label: 'Angular' },
            { value: 'react', label: 'React' },
          ],
        })
        .matMultiCheckboxField({
          key: 'preferences',
          options: [
            { value: 1, label: 'Option 1' },
            { value: 2, label: 'Option 2' },
            { value: 3, label: 'Option 3' },
          ],
        })
        .build();

      const { component, fixture } = await MaterialFormTestUtils.createTest({
        config,
        initialValue: {
          hobbies: [],
          skills: [],
          preferences: [],
        },
      });

      const checkboxGroups = fixture.debugElement.queryAll(By.css('df-mat-multi-checkbox'));
      const skillsCheckboxes = checkboxGroups[0].queryAll(By.directive(MatCheckbox));
      const preferencesCheckboxes = checkboxGroups[1].queryAll(By.directive(MatCheckbox));

      expect(skillsCheckboxes.length).toBe(3);
      expect(preferencesCheckboxes.length).toBe(3);

      // Test string options using utility
      await MaterialFormTestUtils.simulateMatCheckbox(fixture, 'df-mat-multi-checkbox:first-of-type mat-checkbox:first-of-type', true);
      await MaterialFormTestUtils.simulateMatCheckbox(fixture, 'df-mat-multi-checkbox:first-of-type mat-checkbox:last-of-type', true);

      expect(MaterialFormTestUtils.getFormValue(component).skills).toEqual(['typescript', 'react']);

      // Test number options using utility
      await MaterialFormTestUtils.simulateMatCheckbox(fixture, 'df-mat-multi-checkbox:nth-of-type(2) mat-checkbox:nth-of-type(1)', true);
      await MaterialFormTestUtils.simulateMatCheckbox(fixture, 'df-mat-multi-checkbox:nth-of-type(2) mat-checkbox:nth-of-type(2)', true);

      expect(MaterialFormTestUtils.getFormValue(component).preferences).toEqual([1, 2]);
    });

    it('should handle disabled options correctly', async () => {
      const config = MaterialFormTestUtils.builder()
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

      const { fixture } = await MaterialFormTestUtils.createTest({
        config,
        initialValue: { hobbies: [] },
      });

      const checkboxes = fixture.debugElement.queryAll(By.directive(MatCheckbox));

      expect(checkboxes[0].componentInstance.disabled).toBe(false);
      expect(checkboxes[1].componentInstance.disabled).toBe(true);
      expect(checkboxes[2].componentInstance.disabled).toBe(false);
    });

    it('should handle field-level disabled state', async () => {
      const config = MaterialFormTestUtils.builder()
        .matMultiCheckboxField({
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

      const { fixture } = await MaterialFormTestUtils.createTest({
        config,
        initialValue: { hobbies: [] },
      });

      const checkboxes = fixture.debugElement.queryAll(By.directive(MatCheckbox));

      checkboxes.forEach((checkbox) => {
        expect(checkbox.componentInstance.disabled).toBe(true);
      });
    });
  });

  describe('Different Material Configurations', () => {
    it('should apply different color themes correctly', async () => {
      const config = MaterialFormTestUtils.builder()
        .matMultiCheckboxField({ key: 'hobbies', options: [{ value: 'reading', label: 'Reading' }], props: { color: 'primary' } })
        .matMultiCheckboxField({ key: 'skills', options: [{ value: 'typescript', label: 'TypeScript' }], props: { color: 'accent' } })
        .build();

      const { fixture } = await MaterialFormTestUtils.createTest({
        config,
        initialValue: { hobbies: [], skills: [] },
      });

      const checkboxGroups = fixture.debugElement.queryAll(By.css('df-mat-multi-checkbox'));
      const primaryCheckbox = checkboxGroups[0].query(By.directive(MatCheckbox));
      const accentCheckbox = checkboxGroups[1].query(By.directive(MatCheckbox));

      expect(primaryCheckbox.componentInstance.color).toBe('primary');
      expect(accentCheckbox.componentInstance.color).toBe('accent');
    });

    it('should apply different label positions correctly', async () => {
      const config = MaterialFormTestUtils.builder()
        .matMultiCheckboxField({ key: 'hobbies', options: [{ value: 'reading', label: 'Reading' }], props: { labelPosition: 'after' } })
        .matMultiCheckboxField({
          key: 'skills',
          options: [{ value: 'typescript', label: 'TypeScript' }],
          props: { labelPosition: 'before' },
        })
        .build();

      const { fixture } = await MaterialFormTestUtils.createTest({
        config,
        initialValue: { hobbies: [], skills: [] },
      });

      const checkboxGroups = fixture.debugElement.queryAll(By.css('df-mat-multi-checkbox'));
      const afterCheckbox = checkboxGroups[0].query(By.directive(MatCheckbox));
      const beforeCheckbox = checkboxGroups[1].query(By.directive(MatCheckbox));

      expect(afterCheckbox.componentInstance.labelPosition).toBe('after');
      expect(beforeCheckbox.componentInstance.labelPosition).toBe('before');
    });
  });

  describe('Minimal Configuration Tests', () => {
    it('should render with default Material configuration', async () => {
      const config = MaterialFormTestUtils.builder()
        .matMultiCheckboxField({
          key: 'hobbies',
          options: [
            { value: 'reading', label: 'Reading' },
            { value: 'gaming', label: 'Gaming' },
          ],
        })
        .build();

      const { fixture } = await MaterialFormTestUtils.createTest({
        config,
        initialValue: { hobbies: [] },
      });

      const checkboxes = fixture.debugElement.queryAll(By.directive(MatCheckbox));
      expect(checkboxes[0].componentInstance.color).toBe('primary');
      expect(checkboxes[0].componentInstance.labelPosition).toBe('after');
    });

    it('should not display hint when not provided', async () => {
      const config = MaterialFormTestUtils.builder()
        .matMultiCheckboxField({ key: 'hobbies', options: [{ value: 'reading', label: 'Reading' }] })
        .build();

      const { fixture } = await MaterialFormTestUtils.createTest({
        config,
        initialValue: { hobbies: [] },
      });

      const hint = fixture.debugElement.query(By.css('.mat-hint'));
      expect(hint).toBeNull();
    });

    it('should not display label when not provided', async () => {
      const config = MaterialFormTestUtils.builder()
        .field({
          key: 'hobbies',
          type: 'multi-checkbox',
          options: [{ value: 'reading', label: 'Reading' }],
        })
        .build();

      const { fixture } = await MaterialFormTestUtils.createTest({
        config,
        initialValue: { hobbies: [] },
      });

      const label = fixture.debugElement.query(By.css('.checkbox-group-label'));
      expect(label).toBeNull();
    });
  });

  describe('Complex Interaction Tests', () => {
    it('should handle checking and unchecking multiple checkboxes', async () => {
      const config = MaterialFormTestUtils.builder()
        .matMultiCheckboxField({
          key: 'hobbies',
          options: [
            { value: 'reading', label: 'Reading' },
            { value: 'gaming', label: 'Gaming' },
            { value: 'cooking', label: 'Cooking' },
          ],
        })
        .build();

      const { component, fixture } = await MaterialFormTestUtils.createTest({
        config,
        initialValue: { hobbies: [] },
      });

      // Check all checkboxes using utility
      await MaterialFormTestUtils.simulateMatCheckbox(fixture, 'mat-checkbox:nth-of-type(1)', true);
      await MaterialFormTestUtils.simulateMatCheckbox(fixture, 'mat-checkbox:nth-of-type(2)', true);
      await MaterialFormTestUtils.simulateMatCheckbox(fixture, 'mat-checkbox:nth-of-type(3)', true);

      expect(MaterialFormTestUtils.getFormValue(component).hobbies).toEqual(['reading', 'gaming', 'cooking']);

      // Uncheck middle checkbox using utility
      await MaterialFormTestUtils.simulateMatCheckbox(fixture, 'mat-checkbox:nth-of-type(2)', false);

      expect(MaterialFormTestUtils.getFormValue(component).hobbies).toEqual(['reading', 'cooking']);

      // Uncheck all remaining using utility
      await MaterialFormTestUtils.simulateMatCheckbox(fixture, 'mat-checkbox:nth-of-type(1)', false);
      await MaterialFormTestUtils.simulateMatCheckbox(fixture, 'mat-checkbox:nth-of-type(3)', false);

      expect(MaterialFormTestUtils.getFormValue(component).hobbies).toEqual([]);
    });

    it('should handle multiple checkbox groups independently', async () => {
      const config = MaterialFormTestUtils.builder()
        .matMultiCheckboxField({
          key: 'hobbies',
          options: [
            { value: 'reading', label: 'Reading' },
            { value: 'gaming', label: 'Gaming' },
          ],
        })
        .matMultiCheckboxField({
          key: 'skills',
          options: [
            { value: 'typescript', label: 'TypeScript' },
            { value: 'angular', label: 'Angular' },
          ],
        })
        .build();

      const { component, fixture } = await MaterialFormTestUtils.createTest({
        config,
        initialValue: {
          hobbies: ['reading'],
          skills: ['typescript'],
        },
      });

      // Initial values
      expect(MaterialFormTestUtils.getFormValue(component).hobbies).toEqual(['reading']);
      expect(MaterialFormTestUtils.getFormValue(component).skills).toEqual(['typescript']);

      // Change hobbies using utility
      await MaterialFormTestUtils.simulateMatCheckbox(fixture, 'df-mat-multi-checkbox:first-of-type mat-checkbox:last-of-type', true);

      let formValue = MaterialFormTestUtils.getFormValue(component);
      expect(formValue.hobbies).toEqual(['reading', 'gaming']);
      expect(formValue.skills).toEqual(['typescript']); // Should remain unchanged

      // Change skills using utility
      await MaterialFormTestUtils.simulateMatCheckbox(fixture, 'df-mat-multi-checkbox:last-of-type mat-checkbox:last-of-type', true);

      formValue = MaterialFormTestUtils.getFormValue(component);
      expect(formValue.hobbies).toEqual(['reading', 'gaming']); // Should remain unchanged
      expect(formValue.skills).toEqual(['typescript', 'angular']);
    });
  });

  describe('Edge Cases and Robustness Tests', () => {
    it('should handle undefined form values gracefully', async () => {
      const config = MaterialFormTestUtils.builder()
        .matMultiCheckboxField({ key: 'hobbies', options: [{ value: 'reading', label: 'Reading' }] })
        .build();

      const { fixture } = await MaterialFormTestUtils.createTest({ config }); // No initial value provided

      const checkboxes = fixture.debugElement.queryAll(By.directive(MatCheckbox));
      expect(checkboxes).toBeTruthy();
      expect(checkboxes.length).toBe(1);
    });

    it('should handle null form values gracefully', async () => {
      const config = MaterialFormTestUtils.builder()
        .matMultiCheckboxField({ key: 'hobbies', options: [{ value: 'reading', label: 'Reading' }] })
        .build();

      const { fixture } = await MaterialFormTestUtils.createTest({
        config,
        initialValue: null as any,
      });

      const checkboxes = fixture.debugElement.queryAll(By.directive(MatCheckbox));
      expect(checkboxes).toBeTruthy();
      expect(checkboxes.length).toBe(1);
    });

    it('should handle empty options array', async () => {
      const config = MaterialFormTestUtils.builder()
        .field({
          key: 'hobbies',
          type: 'multi-checkbox',
          label: 'Hobbies',
          options: [],
        })
        .build();

      const { component, fixture } = await MaterialFormTestUtils.createTest({
        config,
        initialValue: { hobbies: [] },
      });

      const checkboxes = fixture.debugElement.queryAll(By.directive(MatCheckbox));
      expect(checkboxes.length).toBe(0);
      expect(MaterialFormTestUtils.getFormValue(component).hobbies).toEqual([]);
    });

    it('should handle rapid checkbox clicking correctly', async () => {
      const config = MaterialFormTestUtils.builder()
        .matMultiCheckboxField({
          key: 'hobbies',
          options: [
            { value: 'reading', label: 'Reading' },
            { value: 'gaming', label: 'Gaming' },
          ],
        })
        .build();

      const { component, fixture } = await MaterialFormTestUtils.createTest({
        config,
        initialValue: { hobbies: [] },
      });

      // Rapid clicking using utility methods
      await MaterialFormTestUtils.simulateMatCheckbox(fixture, 'mat-checkbox:first-of-type', true);
      await MaterialFormTestUtils.simulateMatCheckbox(fixture, 'mat-checkbox:last-of-type', true);
      await MaterialFormTestUtils.simulateMatCheckbox(fixture, 'mat-checkbox:first-of-type', false); // Uncheck
      await MaterialFormTestUtils.simulateMatCheckbox(fixture, 'mat-checkbox:last-of-type', false); // Uncheck
      await MaterialFormTestUtils.simulateMatCheckbox(fixture, 'mat-checkbox:first-of-type', true); // Check again

      // Should have the final state
      expect(MaterialFormTestUtils.getFormValue(component).hobbies).toEqual(['reading']);

      const checkboxes = fixture.debugElement.queryAll(By.directive(MatCheckbox));
      expect(checkboxes[0].componentInstance.checked).toBe(true);
      expect(checkboxes[1].componentInstance.checked).toBe(false);
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

        const config = MaterialFormTestUtils.builder()
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

        const { fixture } = await MaterialFormTestUtils.createTest({
          config,
          initialValue: { hobbies: [] },
        });

        const labelElement = fixture.debugElement.query(By.css('.checkbox-group-label'));
        const hintElement = fixture.debugElement.query(By.css('.mat-hint'));
        const checkboxes = fixture.debugElement.queryAll(By.directive(MatCheckbox));

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

        const updatedCheckboxes = fixture.debugElement.queryAll(By.directive(MatCheckbox));
        expect(updatedCheckboxes[0].nativeElement.textContent.trim()).toBe('Lectura');
        expect(updatedCheckboxes[1].nativeElement.textContent.trim()).toBe('Juegos');
        expect(updatedCheckboxes[2].nativeElement.textContent.trim()).toBe('Cocina');
      });
    });
  });
});
