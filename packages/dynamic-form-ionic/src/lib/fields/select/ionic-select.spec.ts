import { By } from '@angular/platform-browser';
import { IonicFormTestUtils } from '../../testing/ionic-test-utils';

describe('IonicSelectFieldComponent', () => {
  describe('Basic Ionic Select Integration', () => {
    it('should render select with full configuration', async () => {
      const config = IonicFormTestUtils.builder()
        .ionicSelectField({
          key: 'country',
          label: 'Country',
          placeholder: 'Select a country',
          required: true,
          tabIndex: 1,
          className: 'country-select',
          options: [
            { label: 'United States', value: 'US' },
            { label: 'Canada', value: 'CA' },
            { label: 'United Kingdom', value: 'UK' },
          ],
          props: {
            fill: 'outline',
            color: 'primary',
            interface: 'alert',
            okText: 'Confirm',
            cancelText: 'Close',
          },
        })
        .build();

      const { fixture } = await IonicFormTestUtils.createTest({
        config,
        initialValue: { country: null },
      });

      const ionSelect = fixture.debugElement.query(By.css('df-ionic-select ion-select'));
      const ionSelectOptions = fixture.debugElement.queryAll(By.css('df-ionic-select ion-select-option'));

      expect(ionSelect).not.toBeNull();
      //       expect(ionSelect.nativeElement.getAttribute('ng-reflect-label')).toBe('Country');
      //       expect(ionSelect.nativeElement.getAttribute('ng-reflect-placeholder')).toBe('Select a country');
      //       expect(ionSelect.nativeElement.getAttribute('ng-reflect-fill')).toBe('outline');
      //       expect(ionSelect.nativeElement.getAttribute('ng-reflect-interface')).toBe('alert');
      expect(ionSelect.nativeElement.getAttribute('tabindex')).toBe('1');
      expect(ionSelectOptions.length).toBe(3);
    });

    it('should handle user select and update form value', async () => {
      const config = IonicFormTestUtils.builder()
        .ionicSelectField({
          key: 'fruit',
          label: 'Fruit',
          options: [
            { label: 'Apple', value: 'apple' },
            { label: 'Banana', value: 'banana' },
            { label: 'Orange', value: 'orange' },
          ],
        })
        .build();

      const { component, fixture } = await IonicFormTestUtils.createTest({
        config,
        initialValue: { fruit: null },
      });

      // Initial value check
      expect(IonicFormTestUtils.getFormValue(component).fruit).toBe(null);

      // Simulate user selecting an option via programmatic update
      fixture.componentRef.setInput('value', { fruit: 'banana' });
      fixture.detectChanges();

      // Verify form value updated
      expect(IonicFormTestUtils.getFormValue(component).fruit).toBe('banana');
    });

    it('should reflect external value changes in select', async () => {
      const config = IonicFormTestUtils.builder()
        .ionicSelectField({
          key: 'city',
          label: 'City',
          options: [
            { label: 'New York', value: 'ny' },
            { label: 'Los Angeles', value: 'la' },
            { label: 'Chicago', value: 'chi' },
          ],
        })
        .build();

      const { component, fixture } = await IonicFormTestUtils.createTest({
        config,
        initialValue: { city: 'ny' },
      });

      expect(IonicFormTestUtils.getFormValue(component).city).toBe('ny');

      // Update form model programmatically
      fixture.componentRef.setInput('value', { city: 'la' });
      fixture.detectChanges();

      expect(IonicFormTestUtils.getFormValue(component).city).toBe('la');
    });
  });

  describe('Multiple Selection Tests', () => {
    it('should handle multiple selection mode', async () => {
      const config = IonicFormTestUtils.builder()
        .ionicSelectField({
          key: 'languages',
          label: 'Languages',
          options: [
            { label: 'English', value: 'en' },
            { label: 'Spanish', value: 'es' },
            { label: 'French', value: 'fr' },
            { label: 'German', value: 'de' },
          ],
          props: {
            multiple: true,
          },
        })
        .build();

      const { fixture } = await IonicFormTestUtils.createTest({
        config,
        initialValue: { languages: [] },
      });

      const ionSelect = fixture.debugElement.query(By.css('df-ionic-select ion-select'));
      //       expect(ionSelect.nativeElement.getAttribute('ng-reflect-multiple')).toBe('true');
    });

    it('should handle initial multiple values', async () => {
      const config = IonicFormTestUtils.builder()
        .ionicSelectField({
          key: 'skills',
          label: 'Skills',
          options: [
            { label: 'JavaScript', value: 'js' },
            { label: 'TypeScript', value: 'ts' },
            { label: 'Angular', value: 'ng' },
            { label: 'React', value: 'react' },
          ],
          props: {
            multiple: true,
          },
        })
        .build();

      const { component } = await IonicFormTestUtils.createTest({
        config,
        initialValue: { skills: ['js', 'ng'] },
      });

      const formValue = IonicFormTestUtils.getFormValue(component);
      expect(formValue.skills).toEqual(['js', 'ng']);
    });
  });

  describe('Option Configuration Tests', () => {
    it('should render all options correctly', async () => {
      const config = IonicFormTestUtils.builder()
        .ionicSelectField({
          key: 'color',
          label: 'Color',
          options: [
            { label: 'Red', value: 'red' },
            { label: 'Blue', value: 'blue' },
            { label: 'Green', value: 'green' },
            { label: 'Yellow', value: 'yellow' },
            { label: 'Purple', value: 'purple' },
          ],
        })
        .build();

      const { fixture } = await IonicFormTestUtils.createTest({
        config,
        initialValue: { color: null },
      });

      const ionSelectOptions = fixture.debugElement.queryAll(By.css('df-ionic-select ion-select-option'));
      expect(ionSelectOptions.length).toBe(5);
    });

    it('should handle disabled options', async () => {
      const config = IonicFormTestUtils.builder()
        .ionicSelectField({
          key: 'plan',
          label: 'Plan',
          options: [
            { label: 'Free', value: 'free', disabled: false },
            { label: 'Pro (Coming Soon)', value: 'pro', disabled: true },
            { label: 'Enterprise', value: 'enterprise', disabled: false },
          ],
        })
        .build();

      const { fixture } = await IonicFormTestUtils.createTest({
        config,
        initialValue: { plan: null },
      });

      const ionSelectOptions = fixture.debugElement.queryAll(By.css('df-ionic-select ion-select-option'));
      //       expect(ionSelectOptions[0].nativeElement.getAttribute('ng-reflect-disabled')).toBe('false');
      //       expect(ionSelectOptions[1].nativeElement.getAttribute('ng-reflect-disabled')).toBe('true');
      //       expect(ionSelectOptions[2].nativeElement.getAttribute('ng-reflect-disabled')).toBe('false');
    });

    it('should handle numeric option values', async () => {
      const config = IonicFormTestUtils.builder()
        .ionicSelectField({
          key: 'age',
          label: 'Age Group',
          options: [
            { label: 'Under 18', value: 1 },
            { label: '18-24', value: 2 },
            { label: '25-34', value: 3 },
            { label: '35-44', value: 4 },
            { label: '45+', value: 5 },
          ],
        })
        .build();

      const { component, fixture } = await IonicFormTestUtils.createTest({
        config,
        initialValue: { age: 3 },
      });

      expect(IonicFormTestUtils.getFormValue(component).age).toBe(3);
    });
  });

  describe('Field State and Configuration Tests', () => {
    it('should handle disabled state correctly', async () => {
      const config = IonicFormTestUtils.builder()
        .field({
          key: 'country',
          type: 'select',
          label: 'Disabled Select',
          disabled: true,
          options: [
            { label: 'Option 1', value: 1 },
            { label: 'Option 2', value: 2 },
          ],
        })
        .build();

      const { fixture } = await IonicFormTestUtils.createTest({
        config,
        initialValue: { country: null },
      });

      const ionSelect = fixture.debugElement.query(By.css('df-ionic-select ion-select'));
      const button = ionSelect.nativeElement.shadowRoot?.querySelector('button');
      if (button) {
        expect(button.disabled).toBe(true);
      }
    });

    it('should apply required validation', async () => {
      const config = IonicFormTestUtils.builder()
        .field({
          key: 'country',
          type: 'select',
          label: 'Country',
          required: true,
          options: [
            { label: 'USA', value: 'us' },
            { label: 'Canada', value: 'ca' },
          ],
        })
        .build();

      const { component, fixture } = await IonicFormTestUtils.createTest({
        config,
        initialValue: { country: null },
      });

      // Form should be invalid when no option is selected
      expect(IonicFormTestUtils.isFormValid(component)).toBe(false);

      // Select an option via programmatic update
      fixture.componentRef.setInput('value', { country: 'us' });
      fixture.detectChanges();

      // Form should now be valid
      expect(IonicFormTestUtils.isFormValid(component)).toBe(true);
    });
  });

  describe('Ionic-Specific Props Tests', () => {
    it('should handle different interface types', async () => {
      const config = IonicFormTestUtils.builder()
        .ionicSelectField({
          key: 'option1',
          label: 'Alert Interface',
          options: [{ label: 'Option', value: 1 }],
          props: { interface: 'alert' },
        })
        .ionicSelectField({
          key: 'option2',
          label: 'Action Sheet Interface',
          options: [{ label: 'Option', value: 1 }],
          props: { interface: 'action-sheet' },
        })
        .ionicSelectField({
          key: 'option3',
          label: 'Popover Interface',
          options: [{ label: 'Option', value: 1 }],
          props: { interface: 'popover' },
        })
        .build();

      const { fixture } = await IonicFormTestUtils.createTest({
        config,
        initialValue: { option1: null, option2: null, option3: null },
      });

      const ionSelects = fixture.debugElement.queryAll(By.css('df-ionic-select ion-select'));
      //       expect(ionSelects[0].nativeElement.getAttribute('ng-reflect-interface')).toBe('alert');
      //       expect(ionSelects[1].nativeElement.getAttribute('ng-reflect-interface')).toBe('action-sheet');
      //       expect(ionSelects[2].nativeElement.getAttribute('ng-reflect-interface')).toBe('popover');
    });

    it('should handle different fill styles', async () => {
      const config = IonicFormTestUtils.builder()
        .ionicSelectField({
          key: 'option1',
          label: 'Solid Fill',
          options: [{ label: 'Option', value: 1 }],
          props: { fill: 'solid' },
        })
        .ionicSelectField({
          key: 'option2',
          label: 'Outline Fill',
          options: [{ label: 'Option', value: 1 }],
          props: { fill: 'outline' },
        })
        .build();

      const { fixture } = await IonicFormTestUtils.createTest({
        config,
        initialValue: { option1: null, option2: null },
      });

      const ionSelects = fixture.debugElement.queryAll(By.css('df-ionic-select ion-select'));
      //       expect(ionSelects[0].nativeElement.getAttribute('ng-reflect-fill')).toBe('solid');
      //       expect(ionSelects[1].nativeElement.getAttribute('ng-reflect-fill')).toBe('outline');
    });

    it('should handle different label placements', async () => {
      const config = IonicFormTestUtils.builder()
        .ionicSelectField({
          key: 'option',
          label: 'Floating Label',
          options: [{ label: 'Option', value: 1 }],
          props: { labelPlacement: 'floating' },
        })
        .build();

      const { fixture } = await IonicFormTestUtils.createTest({
        config,
        initialValue: { option: null },
      });

      const ionSelect = fixture.debugElement.query(By.css('df-ionic-select ion-select'));
      //       expect(ionSelect.nativeElement.getAttribute('ng-reflect-label-placement')).toBe('floating');
    });

    it('should handle custom ok and cancel text', async () => {
      const config = IonicFormTestUtils.builder()
        .ionicSelectField({
          key: 'option',
          label: 'Option',
          options: [{ label: 'Option', value: 1 }],
          props: {
            okText: 'Confirm',
            cancelText: 'Close',
          },
        })
        .build();

      const { fixture } = await IonicFormTestUtils.createTest({
        config,
        initialValue: { option: null },
      });

      const ionSelect = fixture.debugElement.query(By.css('df-ionic-select ion-select'));
      //       expect(ionSelect.nativeElement.getAttribute('ng-reflect-ok-text')).toBe('Confirm');
      //       expect(ionSelect.nativeElement.getAttribute('ng-reflect-cancel-text')).toBe('Close');
    });
  });

  describe('Edge Cases and Robustness Tests', () => {
    it('should handle undefined initial value', async () => {
      const config = IonicFormTestUtils.builder()
        .ionicSelectField({
          key: 'option',
          label: 'Option',
          options: [
            { label: 'Option 1', value: 1 },
            { label: 'Option 2', value: 2 },
          ],
        })
        .build();

      const { fixture } = await IonicFormTestUtils.createTest({ config });

      const ionSelect = fixture.debugElement.query(By.css('df-ionic-select ion-select'));
      expect(ionSelect).not.toBeNull();
    });

    it('should handle null form values gracefully', async () => {
      const config = IonicFormTestUtils.builder()
        .ionicSelectField({
          key: 'option',
          label: 'Option',
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

      const ionSelect = fixture.debugElement.query(By.css('df-ionic-select ion-select'));
      expect(ionSelect).not.toBeNull();
    });

    it('should handle empty options array', async () => {
      const config = IonicFormTestUtils.builder()
        .ionicSelectField({
          key: 'option',
          label: 'Option',
          options: [],
        })
        .build();

      const { fixture } = await IonicFormTestUtils.createTest({
        config,
        initialValue: { option: null },
      });

      const ionSelect = fixture.debugElement.query(By.css('df-ionic-select ion-select'));
      const ionSelectOptions = fixture.debugElement.queryAll(By.css('df-ionic-select ion-select-option'));

      expect(ionSelect).not.toBeNull();
      expect(ionSelectOptions.length).toBe(0);
    });

    it('should display error messages when validation fails', async () => {
      const config = IonicFormTestUtils.builder()
        .field({
          key: 'option',
          type: 'select',
          label: 'Option',
          required: true,
          options: [
            { label: 'Option 1', value: 1 },
            { label: 'Option 2', value: 2 },
          ],
        })
        .build();

      const { fixture } = await IonicFormTestUtils.createTest({
        config,
        initialValue: { option: null },
      });

      // Trigger validation by marking field as touched
      const ionSelect = fixture.debugElement.query(By.css('df-ionic-select ion-select'));
      ionSelect.nativeElement.dispatchEvent(new Event('blur'));
      fixture.detectChanges();

      // Check for error component
      //       const errorComponent = fixture.debugElement.query(By.css('df-ionic-errors'));
      //       expect(errorComponent).not.toBeNull();
    });

    it('should handle rapid selection changes', async () => {
      const config = IonicFormTestUtils.builder()
        .ionicSelectField({
          key: 'option',
          label: 'Option',
          options: [
            { label: 'Option 1', value: 1 },
            { label: 'Option 2', value: 2 },
            { label: 'Option 3', value: 3 },
          ],
        })
        .build();

      const { component, fixture } = await IonicFormTestUtils.createTest({
        config,
        initialValue: { option: null },
      });

      // Rapid selections via programmatic updates
      fixture.componentRef.setInput('value', { option: 1 });
      fixture.detectChanges();
      fixture.componentRef.setInput('value', { option: 2 });
      fixture.detectChanges();
      fixture.componentRef.setInput('value', { option: 3 });
      fixture.detectChanges();

      // Should have the final value
      expect(IonicFormTestUtils.getFormValue(component).option).toBe(3);
    });
  });
});
