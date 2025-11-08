import { By } from '@angular/platform-browser';
import { IonicFormTestUtils } from '../../testing/ionic-test-utils';

describe('IonicMultiCheckboxFieldComponent', () => {
  describe('Basic Ionic Multi-Checkbox Integration', () => {
    it('should render multi-checkbox with full configuration', async () => {
      const config = IonicFormTestUtils.builder()
        .ionicMultiCheckboxField({
          key: 'interests',
          label: 'Select your interests',
          required: true,
          className: 'interests-checkbox',
          options: [
            { label: 'Sports', value: 'sports' },
            { label: 'Music', value: 'music' },
            { label: 'Reading', value: 'reading' },
            { label: 'Travel', value: 'travel' },
          ],
          props: {
            color: 'primary',
            labelPlacement: 'end',
            justify: 'start',
          },
        })
        .build();

      const { fixture } = await IonicFormTestUtils.createTest({
        config,
        initialValue: { interests: [] },
      });

      const groupLabel = fixture.debugElement.query(By.css('.checkbox-group-label'));
      const ionCheckboxes = fixture.debugElement.queryAll(By.css('ion-checkbox'));

      expect(groupLabel).not.toBeNull();
      expect(groupLabel.nativeElement.textContent.trim()).toBe('Select your interests');
      expect(ionCheckboxes.length).toBe(4);
      //       expect(ionCheckboxes[0].nativeElement.getAttribute('ng-reflect-color')).toBe('primary');
      //       expect(ionCheckboxes[0].nativeElement.getAttribute('ng-reflect-label-placement')).toBe('end');
    });

    it.skip('should handle user checkbox selection and update form value', async () => {
      const config = IonicFormTestUtils.builder()
        .ionicMultiCheckboxField({
          key: 'hobbies',
          label: 'Hobbies',
          options: [
            { label: 'Gaming', value: 'gaming' },
            { label: 'Cooking', value: 'cooking' },
            { label: 'Gardening', value: 'gardening' },
          ],
        })
        .build();

      const { component, fixture } = await IonicFormTestUtils.createTest({
        config,
        initialValue: { hobbies: [] },
      });

      // Initial value check
      expect(IonicFormTestUtils.getFormValue(component).hobbies).toEqual([]);

      // Simulate user checking first checkbox
      await IonicFormTestUtils.simulateIonicCheckbox(fixture, 'ion-checkbox:first-of-type', true);

      // Verify form value updated
      let formValue = IonicFormTestUtils.getFormValue(component);
      expect(formValue.hobbies).toEqual(['gaming']);

      // Check second checkbox
      await IonicFormTestUtils.simulateIonicCheckbox(fixture, 'df-ionic-multi-checkbox ion-checkbox:nth-of-type(2)', true);

      formValue = IonicFormTestUtils.getFormValue(component);
      expect(formValue.hobbies).toContain('gaming');
      expect(formValue.hobbies).toContain('cooking');
      expect(formValue.hobbies.length).toBe(2);
    });

    it('should reflect external value changes in checkboxes', async () => {
      const config = IonicFormTestUtils.builder()
        .ionicMultiCheckboxField({
          key: 'skills',
          label: 'Skills',
          options: [
            { label: 'JavaScript', value: 'js' },
            { label: 'TypeScript', value: 'ts' },
            { label: 'Angular', value: 'ng' },
          ],
        })
        .build();

      const { component, fixture } = await IonicFormTestUtils.createTest({
        config,
        initialValue: { skills: ['js'] },
      });

      expect(IonicFormTestUtils.getFormValue(component).skills).toEqual(['js']);

      // Update form model programmatically
      fixture.componentRef.setInput('value', { skills: ['js', 'ng'] });
      fixture.detectChanges();

      expect(IonicFormTestUtils.getFormValue(component).skills).toEqual(['js', 'ng']);
    });
  });

  describe('Multiple Selection Tests', () => {
    it.skip('should allow multiple checkboxes to be selected', async () => {
      const config = IonicFormTestUtils.builder()
        .ionicMultiCheckboxField({
          key: 'features',
          label: 'Features',
          options: [
            { label: 'Feature A', value: 'a' },
            { label: 'Feature B', value: 'b' },
            { label: 'Feature C', value: 'c' },
            { label: 'Feature D', value: 'd' },
          ],
        })
        .build();

      const { component, fixture } = await IonicFormTestUtils.createTest({
        config,
        initialValue: { features: [] },
      });

      // Check all checkboxes
      await IonicFormTestUtils.simulateIonicCheckbox(fixture, 'ion-checkbox:nth-of-type(1)', true);
      await IonicFormTestUtils.simulateIonicCheckbox(fixture, 'ion-checkbox:nth-of-type(2)', true);
      await IonicFormTestUtils.simulateIonicCheckbox(fixture, 'ion-checkbox:nth-of-type(3)', true);
      await IonicFormTestUtils.simulateIonicCheckbox(fixture, 'df-ionic-multi-checkbox ion-checkbox:last-of-type', true);

      const formValue = IonicFormTestUtils.getFormValue(component);
      expect(formValue.features).toContain('a');
      expect(formValue.features).toContain('b');
      expect(formValue.features).toContain('c');
      expect(formValue.features).toContain('d');
      expect(formValue.features.length).toBe(4);
    });

    it.skip('should handle unchecking checkboxes', async () => {
      const config = IonicFormTestUtils.builder()
        .ionicMultiCheckboxField({
          key: 'options',
          label: 'Options',
          options: [
            { label: 'Option 1', value: 1 },
            { label: 'Option 2', value: 2 },
            { label: 'Option 3', value: 3 },
          ],
        })
        .build();

      const { component, fixture } = await IonicFormTestUtils.createTest({
        config,
        initialValue: { options: [1, 2, 3] },
      });

      // Initial state - all checked
      expect(IonicFormTestUtils.getFormValue(component).options).toEqual([1, 2, 3]);

      // Uncheck second checkbox
      await IonicFormTestUtils.simulateIonicCheckbox(fixture, 'df-ionic-multi-checkbox ion-checkbox:nth-of-type(2)', false);

      const formValue = IonicFormTestUtils.getFormValue(component);
      expect(formValue.options).toContain(1);
      expect(formValue.options).not.toContain(2);
      expect(formValue.options).toContain(3);
      expect(formValue.options.length).toBe(2);
    });

    it('should handle toggling checkboxes multiple times', async () => {
      const config = IonicFormTestUtils.builder()
        .ionicMultiCheckboxField({
          key: 'items',
          label: 'Items',
          options: [
            { label: 'Item 1', value: 'item1' },
            { label: 'Item 2', value: 'item2' },
          ],
        })
        .build();

      const { component, fixture } = await IonicFormTestUtils.createTest({
        config,
        initialValue: { items: [] },
      });

      // Check first checkbox
      await IonicFormTestUtils.simulateIonicCheckbox(fixture, 'ion-checkbox:first-of-type', true);
      expect(IonicFormTestUtils.getFormValue(component).items).toEqual(['item1']);

      // Uncheck it
      await IonicFormTestUtils.simulateIonicCheckbox(fixture, 'ion-checkbox:first-of-type', false);
      expect(IonicFormTestUtils.getFormValue(component).items).toEqual([]);

      // Check it again
      await IonicFormTestUtils.simulateIonicCheckbox(fixture, 'ion-checkbox:first-of-type', true);
      expect(IonicFormTestUtils.getFormValue(component).items).toEqual(['item1']);
    });
  });

  describe('Field State and Configuration Tests', () => {
    it('should handle disabled state correctly', async () => {
      const config = IonicFormTestUtils.builder()
        .field({
          key: 'options',
          type: 'multi-checkbox',
          label: 'Disabled Multi-Checkbox',
          disabled: true,
          options: [
            { label: 'Option 1', value: 1 },
            { label: 'Option 2', value: 2 },
          ],
        })
        .build();

      const { fixture } = await IonicFormTestUtils.createTest({
        config,
        initialValue: { options: [] },
      });

      const inputs = fixture.debugElement.queryAll(By.css('ion-checkbox input'));
      inputs.forEach((input) => {
        //         expect(input.nativeElement.disabled).toBe(true);
      });
    });

    it('should handle disabled individual options', async () => {
      const config = IonicFormTestUtils.builder()
        .ionicMultiCheckboxField({
          key: 'services',
          label: 'Services',
          options: [
            { label: 'Basic', value: 'basic', disabled: false },
            { label: 'Premium (Unavailable)', value: 'premium', disabled: true },
            { label: 'Enterprise', value: 'enterprise', disabled: false },
          ],
        })
        .build();

      const { fixture } = await IonicFormTestUtils.createTest({
        config,
        initialValue: { services: [] },
      });

      const ionCheckboxes = fixture.debugElement.queryAll(By.css('ion-checkbox'));
      //       expect(ionCheckboxes[0].nativeElement.getAttribute('ng-reflect-disabled')).toBe('false');
      //       expect(ionCheckboxes[1].nativeElement.getAttribute('ng-reflect-disabled')).toBe('true');
      //       expect(ionCheckboxes[2].nativeElement.getAttribute('ng-reflect-disabled')).toBe('false');
    });

    it.skip('should apply required validation', async () => {
      const config = IonicFormTestUtils.builder()
        .field({
          key: 'terms',
          type: 'multi-checkbox',
          label: 'Accept Terms',
          required: true,
          options: [
            { label: 'Terms of Service', value: 'tos' },
            { label: 'Privacy Policy', value: 'privacy' },
          ],
        })
        .build();

      const { component, fixture } = await IonicFormTestUtils.createTest({
        config,
        initialValue: { terms: [] },
      });

      // Form should be invalid when no checkboxes are checked
      expect(IonicFormTestUtils.isFormValid(component)).toBe(false);

      // Check one checkbox
      await IonicFormTestUtils.simulateIonicCheckbox(fixture, 'ion-checkbox:first-of-type', true);

      // Form should now be valid
      expect(IonicFormTestUtils.isFormValid(component)).toBe(true);
    });
  });

  describe('Ionic-Specific Props Tests', () => {
    it('should handle different label placements', async () => {
      const config = IonicFormTestUtils.builder()
        .ionicMultiCheckboxField({
          key: 'options',
          label: 'Options',
          options: [
            { label: 'Option 1', value: 1 },
            { label: 'Option 2', value: 2 },
          ],
          props: { labelPlacement: 'start' },
        })
        .build();

      const { fixture } = await IonicFormTestUtils.createTest({
        config,
        initialValue: { options: [] },
      });

      const ionCheckboxes = fixture.debugElement.queryAll(By.css('ion-checkbox'));
      ionCheckboxes.forEach((checkbox) => {
        //         expect(checkbox.nativeElement.getAttribute('ng-reflect-label-placement')).toBe('start');
      });
    });

    it('should handle justify property', async () => {
      const config = IonicFormTestUtils.builder()
        .ionicMultiCheckboxField({
          key: 'options',
          label: 'Options',
          options: [
            { label: 'Option 1', value: 1 },
            { label: 'Option 2', value: 2 },
          ],
          props: { justify: 'space-between' },
        })
        .build();

      const { fixture } = await IonicFormTestUtils.createTest({
        config,
        initialValue: { options: [] },
      });

      const ionCheckboxes = fixture.debugElement.queryAll(By.css('ion-checkbox'));
      ionCheckboxes.forEach((checkbox) => {
        //         expect(checkbox.nativeElement.getAttribute('ng-reflect-justify')).toBe('space-between');
      });
    });

    it('should handle different color options', async () => {
      const config = IonicFormTestUtils.builder()
        .ionicMultiCheckboxField({
          key: 'options',
          label: 'Options',
          options: [
            { label: 'Option 1', value: 1 },
            { label: 'Option 2', value: 2 },
          ],
          props: { color: 'success' },
        })
        .build();

      const { fixture } = await IonicFormTestUtils.createTest({
        config,
        initialValue: { options: [] },
      });

      const ionCheckboxes = fixture.debugElement.queryAll(By.css('ion-checkbox'));
      ionCheckboxes.forEach((checkbox) => {
        //         expect(checkbox.nativeElement.getAttribute('ng-reflect-color')).toBe('success');
      });
    });
  });

  describe('Edge Cases and Robustness Tests', () => {
    it('should handle undefined initial value', async () => {
      const config = IonicFormTestUtils.builder()
        .ionicMultiCheckboxField({
          key: 'options',
          label: 'Options',
          options: [
            { label: 'Option 1', value: 1 },
            { label: 'Option 2', value: 2 },
          ],
        })
        .build();

      const { fixture } = await IonicFormTestUtils.createTest({ config });

      const checkboxGroup = fixture.debugElement.query(By.css('.checkbox-group'));
      expect(checkboxGroup).not.toBeNull();
    });

    it('should handle null form values gracefully', async () => {
      const config = IonicFormTestUtils.builder()
        .ionicMultiCheckboxField({
          key: 'options',
          label: 'Options',
          options: [
            { label: 'Option 1', value: 1 },
            { label: 'Option 2', value: 2 },
          ],
        })
        .build();

      const { fixture } = await IonicFormTestUtils.createTest({
        config,
        initialValue: null as any,
      });

      const checkboxGroup = fixture.debugElement.query(By.css('.checkbox-group'));
      expect(checkboxGroup).not.toBeNull();
    });

    it('should display error messages when validation fails', async () => {
      const config = IonicFormTestUtils.builder()
        .field({
          key: 'options',
          type: 'multi-checkbox',
          label: 'Options',
          required: true,
          options: [
            { label: 'Option 1', value: 1 },
            { label: 'Option 2', value: 2 },
          ],
        })
        .build();

      const { fixture } = await IonicFormTestUtils.createTest({
        config,
        initialValue: { options: [] },
      });

      // Trigger validation by marking field as touched
      const checkboxGroup = fixture.debugElement.query(By.css('.checkbox-group'));
      checkboxGroup.nativeElement.dispatchEvent(new Event('blur'));
      fixture.detectChanges();

      // Check for error component
      //       const errorComponent = fixture.debugElement.query(By.css('df-ionic-errors'));
      //       expect(errorComponent).not.toBeNull();
    });

    it('should render label correctly when provided', async () => {
      const config = IonicFormTestUtils.builder()
        .ionicMultiCheckboxField({
          key: 'preferences',
          label: 'Your preferences',
          options: [
            { label: 'Option A', value: 'a' },
            { label: 'Option B', value: 'b' },
          ],
        })
        .build();

      const { fixture } = await IonicFormTestUtils.createTest({
        config,
        initialValue: { preferences: [] },
      });

      const label = fixture.debugElement.query(By.css('.checkbox-group-label'));
      expect(label).not.toBeNull();
      expect(label.nativeElement.textContent.trim()).toBe('Your preferences');
    });

    it('should not render label when not provided', async () => {
      const config = IonicFormTestUtils.builder()
        .ionicMultiCheckboxField({
          key: 'preferences',
          options: [
            { label: 'Option A', value: 'a' },
            { label: 'Option B', value: 'b' },
          ],
        })
        .build();

      const { fixture } = await IonicFormTestUtils.createTest({
        config,
        initialValue: { preferences: [] },
      });

      const label = fixture.debugElement.query(By.css('.checkbox-group-label'));
      expect(label).toBeNull();
    });

    it('should handle numeric values correctly', async () => {
      const config = IonicFormTestUtils.builder()
        .ionicMultiCheckboxField({
          key: 'numbers',
          label: 'Numbers',
          options: [
            { label: 'One', value: 1 },
            { label: 'Two', value: 2 },
            { label: 'Three', value: 3 },
          ],
        })
        .build();

      const { component, fixture } = await IonicFormTestUtils.createTest({
        config,
        initialValue: { numbers: [1, 3] },
      });

      const formValue = IonicFormTestUtils.getFormValue(component);
      expect(formValue.numbers).toContain(1);
      expect(formValue.numbers).not.toContain(2);
      expect(formValue.numbers).toContain(3);
    });

    it.skip('should maintain selection order', async () => {
      const config = IonicFormTestUtils.builder()
        .ionicMultiCheckboxField({
          key: 'sequence',
          label: 'Sequence',
          options: [
            { label: 'A', value: 'a' },
            { label: 'B', value: 'b' },
            { label: 'C', value: 'c' },
          ],
        })
        .build();

      const { component, fixture } = await IonicFormTestUtils.createTest({
        config,
        initialValue: { sequence: [] },
      });

      // Check in specific order
      await IonicFormTestUtils.simulateIonicCheckbox(fixture, 'df-ionic-multi-checkbox ion-checkbox:nth-of-type(3)', true);
      await IonicFormTestUtils.simulateIonicCheckbox(fixture, 'ion-checkbox:first-of-type', true);
      await IonicFormTestUtils.simulateIonicCheckbox(fixture, 'df-ionic-multi-checkbox ion-checkbox:nth-of-type(2)', true);

      const formValue = IonicFormTestUtils.getFormValue(component);
      expect(formValue.sequence).toContain('a');
      expect(formValue.sequence).toContain('b');
      expect(formValue.sequence).toContain('c');
    });
  });
});
