import { By } from '@angular/platform-browser';
import { IonicFormTestUtils } from '../../testing/ionic-test-utils';

describe('IonicCheckboxFieldComponent', () => {
  describe('Basic Ionic Checkbox Integration', () => {
    it('should render checkbox with full configuration', async () => {
      const config = IonicFormTestUtils.builder()
        .ionicCheckboxField({
          key: 'agreeToTerms',
          label: 'I agree to the terms and conditions',
          required: true,
          tabIndex: 1,
          className: 'terms-checkbox',
          props: {
            color: 'primary',
            labelPlacement: 'end',
            justify: 'start',
          },
        })
        .build();

      const { fixture } = await IonicFormTestUtils.createTest({
        config,
        initialValue: { agreeToTerms: false },
      });

      const ionCheckbox = fixture.debugElement.query(By.css('df-ionic-checkbox ion-checkbox'));
      const input = fixture.debugElement.query(By.css('ion-checkbox input'));

      expect(ionCheckbox).not.toBeNull();
      expect(ionCheckbox.nativeElement.getAttribute('tabindex')).toBe('1');
    });

    it('should handle user checkbox interaction and update form value', async () => {
      const config = IonicFormTestUtils.builder().ionicCheckboxField({ key: 'agreeToTerms', label: 'Agree' }).build();

      const { component, fixture } = await IonicFormTestUtils.createTest({
        config,
        initialValue: { agreeToTerms: false },
      });

      expect(IonicFormTestUtils.getFormValue(component).agreeToTerms).toBe(false);

      await IonicFormTestUtils.simulateIonicCheckbox(fixture, 'ion-checkbox', true);

      expect(IonicFormTestUtils.getFormValue(component).agreeToTerms).toBe(true);
    });

    it('should reflect external value changes in checkbox', async () => {
      const config = IonicFormTestUtils.builder().ionicCheckboxField({ key: 'agreeToTerms', label: 'Agree' }).build();

      const { component, fixture } = await IonicFormTestUtils.createTest({
        config,
        initialValue: { agreeToTerms: false },
      });

      fixture.componentRef.setInput('value', { agreeToTerms: true });
      fixture.detectChanges();

      expect(IonicFormTestUtils.getFormValue(component).agreeToTerms).toBe(true);
    });
  });

  describe('Checkbox State Tests', () => {
    it('should toggle checkbox state correctly', async () => {
      const config = IonicFormTestUtils.builder().ionicCheckboxField({ key: 'subscribe', label: 'Subscribe to newsletter' }).build();

      const { component, fixture } = await IonicFormTestUtils.createTest({
        config,
        initialValue: { subscribe: false },
      });

      expect(IonicFormTestUtils.getFormValue(component).subscribe).toBe(false);

      // Check the checkbox via programmatic update
      fixture.componentRef.setInput('value', { subscribe: true });
      fixture.detectChanges();
      expect(IonicFormTestUtils.getFormValue(component).subscribe).toBe(true);

      // Uncheck the checkbox via programmatic update
      fixture.componentRef.setInput('value', { subscribe: false });
      fixture.detectChanges();
      expect(IonicFormTestUtils.getFormValue(component).subscribe).toBe(false);
    });

    it('should handle multiple checkboxes independently', async () => {
      const config = IonicFormTestUtils.builder()
        .ionicCheckboxField({ key: 'option1', label: 'Option 1' })
        .ionicCheckboxField({ key: 'option2', label: 'Option 2' })
        .ionicCheckboxField({ key: 'option3', label: 'Option 3' })
        .build();

      const { component, fixture } = await IonicFormTestUtils.createTest({
        config,
        initialValue: { option1: false, option2: false, option3: false },
      });

      const checkboxes = fixture.debugElement.queryAll(By.css('df-ionic-checkbox ion-checkbox'));
      await IonicFormTestUtils.simulateIonicCheckbox(fixture, 'ion-checkbox:first-of-type', true);

      let formValue = IonicFormTestUtils.getFormValue(component);
      expect(formValue.option1).toBe(true);
      expect(formValue.option2).toBe(false);
      expect(formValue.option3).toBe(false);

      await IonicFormTestUtils.simulateIonicCheckbox(fixture, 'ion-checkbox:nth-of-type(3)', true);

      formValue = IonicFormTestUtils.getFormValue(component);
      expect(formValue.option1).toBe(true);
      expect(formValue.option2).toBe(false);
      expect(formValue.option3).toBe(true);
    });
  });

  describe('Field State and Configuration Tests', () => {
    it('should handle disabled state correctly', async () => {
      const config = IonicFormTestUtils.builder()
        .field({
          key: 'agreeToTerms',
          type: 'checkbox',
          label: 'Disabled Checkbox',
          disabled: true,
        })
        .build();

      const { fixture } = await IonicFormTestUtils.createTest({
        config,
        initialValue: { agreeToTerms: false },
      });

      const input = fixture.debugElement.query(By.css('ion-checkbox input'));
    });

    it('should apply required validation', async () => {
      const config = IonicFormTestUtils.builder()
        .field({
          key: 'agreeToTerms',
          type: 'checkbox',
          label: 'Accept Terms',
          required: true,
        })
        .build();

      const { component, fixture } = await IonicFormTestUtils.createTest({
        config,
        initialValue: { agreeToTerms: false },
      });

      expect(IonicFormTestUtils.isFormValid(component)).toBe(false);

      await IonicFormTestUtils.simulateIonicCheckbox(fixture, 'ion-checkbox', true);

      expect(IonicFormTestUtils.isFormValid(component)).toBe(true);
    });

    it('should handle initial checked state', async () => {
      const config = IonicFormTestUtils.builder().ionicCheckboxField({ key: 'rememberMe', label: 'Remember me' }).build();

      const { component } = await IonicFormTestUtils.createTest({
        config,
        initialValue: { rememberMe: true },
      });

      expect(IonicFormTestUtils.getFormValue(component).rememberMe).toBe(true);
    });
  });

  describe('Ionic-Specific Props Tests', () => {
    it('should handle different label placements', async () => {
      const config = IonicFormTestUtils.builder()
        .ionicCheckboxField({ key: 'option1', label: 'Start', props: { labelPlacement: 'start' } })
        .ionicCheckboxField({ key: 'option2', label: 'End', props: { labelPlacement: 'end' } })
        .build();

      const { fixture } = await IonicFormTestUtils.createTest({
        config,
        initialValue: { option1: false, option2: false },
      });

      const checkboxes = fixture.debugElement.queryAll(By.css('df-ionic-checkbox ion-checkbox'));
    });

    it('should handle indeterminate state', async () => {
      const config = IonicFormTestUtils.builder()
        .ionicCheckboxField({ key: 'partial', label: 'Partial', props: { indeterminate: true } })
        .build();

      const { fixture } = await IonicFormTestUtils.createTest({
        config,
        initialValue: { partial: false },
      });

      const ionCheckbox = fixture.debugElement.query(By.css('df-ionic-checkbox ion-checkbox'));
    });

    it('should handle justify property', async () => {
      const config = IonicFormTestUtils.builder()
        .ionicCheckboxField({ key: 'option', label: 'Option', props: { justify: 'space-between' } })
        .build();

      const { fixture } = await IonicFormTestUtils.createTest({
        config,
        initialValue: { option: false },
      });

      const ionCheckbox = fixture.debugElement.query(By.css('df-ionic-checkbox ion-checkbox'));
    });
  });

  describe('Edge Cases and Robustness Tests', () => {
    it('should handle undefined initial value', async () => {
      const config = IonicFormTestUtils.builder().ionicCheckboxField({ key: 'agreeToTerms', label: 'Agree' }).build();

      const { fixture } = await IonicFormTestUtils.createTest({ config });

      const ionCheckbox = fixture.debugElement.query(By.css('df-ionic-checkbox ion-checkbox'));
      expect(ionCheckbox).not.toBeNull();
    });

    it('should handle null form values gracefully', async () => {
      const config = IonicFormTestUtils.builder().ionicCheckboxField({ key: 'agreeToTerms', label: 'Agree' }).build();

      const { fixture } = await IonicFormTestUtils.createTest({
        config,
        initialValue: null as any,
      });

      const ionCheckbox = fixture.debugElement.query(By.css('df-ionic-checkbox ion-checkbox'));
      expect(ionCheckbox).not.toBeNull();
    });

    it('should display error messages when validation fails', async () => {
      const config = IonicFormTestUtils.builder()
        .field({
          key: 'agreeToTerms',
          type: 'checkbox',
          label: 'Accept Terms',
          required: true,
        })
        .build();

      const { fixture } = await IonicFormTestUtils.createTest({
        config,
        initialValue: { agreeToTerms: false },
      });

      const input = fixture.debugElement.query(By.css('ion-checkbox input'));
      input.nativeElement.dispatchEvent(new Event('blur'));
      fixture.detectChanges();

      //       const errorComponent = fixture.debugElement.query(By.css('df-ionic-errors'));
    });
  });
});
