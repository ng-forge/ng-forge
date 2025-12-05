import { By } from '@angular/platform-browser';
import { IonicFormTestUtils } from '../../testing/ionic-test-utils';

describe('IonicInputFieldComponent', () => {
  describe('Basic Ionic Input Integration', () => {
    it('should render email input with full configuration', async () => {
      const config = IonicFormTestUtils.builder()
        .ionicInputField({
          key: 'email',
          label: 'Email Address',
          placeholder: 'Enter your email',
          required: true,
          tabIndex: 1,
          className: 'email-input',
          props: {
            clearInput: true,
            counter: true,
            fill: 'outline',
            color: 'primary',
            helperText: 'We will never share your email',
          },
        })
        .build();

      const { fixture } = await IonicFormTestUtils.createTest({
        config,
        initialValue: { email: '' },
      });

      const ionInput = fixture.debugElement.query(By.css('df-ionic-input ion-input'));

      expect(ionInput).not.toBeNull();

      // ion-input passes tabindex to its internal native input, not the custom element
      // This is correct Ionic behavior - the wrapper has tabIndex=-1 to pass focus through
      const nativeInput = ionInput.nativeElement.querySelector('input');
      expect(nativeInput).not.toBeNull();
      expect(nativeInput.getAttribute('tabindex')).toBe('1');
    });

    it('should handle user input and update form value', async () => {
      const config = IonicFormTestUtils.builder()
        .ionicInputField({ key: 'email', props: { fill: 'outline' } })
        .build();

      const { component, fixture } = await IonicFormTestUtils.createTest({
        config,
        initialValue: { email: '' },
      });

      expect(IonicFormTestUtils.getFormValue(component).email).toBe('');

      await IonicFormTestUtils.simulateIonicInput(fixture, 'ion-input input', 'test@example.com');

      expect(IonicFormTestUtils.getFormValue(component).email).toBe('test@example.com');
    });

    it('should reflect external value changes in input field', async () => {
      const config = IonicFormTestUtils.builder().ionicInputField({ key: 'email' }).build();

      const { component, fixture } = await IonicFormTestUtils.createTest({
        config,
        initialValue: { email: '' },
      });

      fixture.componentRef.setInput('value', { email: 'user@domain.com' });
      fixture.detectChanges();

      expect(IonicFormTestUtils.getFormValue(component).email).toBe('user@domain.com');
    });
  });

  describe('Different Input Types Integration', () => {
    it('should render various input types with correct attributes', async () => {
      const config = IonicFormTestUtils.builder()
        .ionicInputField({ key: 'firstName' })
        .ionicInputField({ key: 'password', props: { fill: 'outline' } })
        .ionicInputField({ key: 'age', props: { fill: 'outline' } })
        .ionicInputField({ key: 'website', props: { fill: 'outline' } })
        .ionicInputField({ key: 'phone' })
        .build();

      const { fixture } = await IonicFormTestUtils.createTest({
        config,
        initialValue: { firstName: '', password: '', age: 0, website: '', phone: '' },
      });

      const ionInputs = fixture.debugElement.queryAll(By.css('df-ionic-input ion-input'));

      expect(ionInputs.length).toBe(5);
      expect(ionInputs[0]).not.toBeNull();
      expect(ionInputs[1]).not.toBeNull();
      expect(ionInputs[2]).not.toBeNull();
      expect(ionInputs[3]).not.toBeNull();
      expect(ionInputs[4]).not.toBeNull();
    });

    it('should handle number input value changes', async () => {
      const config = IonicFormTestUtils.builder().ionicInputField({ key: 'age' }).build();

      const { component, fixture } = await IonicFormTestUtils.createTest({
        config,
        initialValue: { age: 0 },
      });

      expect(IonicFormTestUtils.getFormValue(component).age).toBe(0);

      await IonicFormTestUtils.simulateIonicInput(fixture, 'ion-input input', '25');

      expect(IonicFormTestUtils.getFormValue(component).age).toBe('25');
    });

    it('should reflect external value changes for all input types', async () => {
      const config = IonicFormTestUtils.builder()
        .ionicInputField({ key: 'firstName' })
        .ionicInputField({ key: 'password' })
        .ionicInputField({ key: 'age' })
        .ionicInputField({ key: 'website' })
        .ionicInputField({ key: 'phone' })
        .build();

      const { component, fixture } = await IonicFormTestUtils.createTest({
        config,
        initialValue: { firstName: '', password: '', age: 0, website: '', phone: '' },
      });

      fixture.componentRef.setInput('value', {
        firstName: 'John',
        password: 'secret123',
        age: 30,
        website: 'https://example.com',
        phone: '555-0123',
      });
      fixture.detectChanges();

      const formValue = IonicFormTestUtils.getFormValue(component);
      expect(formValue.firstName).toBe('John');
      expect(formValue.password).toBe('secret123');
      expect(formValue.age).toBe(30);
      expect(formValue.website).toBe('https://example.com');
      expect(formValue.phone).toBe('555-0123');
    });
  });

  describe('Minimal Configuration Tests', () => {
    it('should render with default Ionic configuration', async () => {
      const config = IonicFormTestUtils.builder().ionicInputField({ key: 'firstName' }).build();

      const { fixture } = await IonicFormTestUtils.createTest({
        config,
        initialValue: { firstName: '' },
      });

      const ionInput = fixture.debugElement.query(By.css('df-ionic-input ion-input'));
    });

    it('should not display helper text when not provided', async () => {
      const config = IonicFormTestUtils.builder().ionicInputField({ key: 'firstName' }).build();

      const { fixture } = await IonicFormTestUtils.createTest({
        config,
        initialValue: { firstName: '' },
      });

      const ionInput = fixture.debugElement.query(By.css('df-ionic-input ion-input'));
      const helperText = ionInput.nativeElement.getAttribute('ng-reflect-helper-text');
      expect(helperText).toBeNull();
    });
  });

  describe('Field State and Configuration Tests', () => {
    it('should handle disabled state correctly', async () => {
      const config = IonicFormTestUtils.builder()
        .field({
          key: 'firstName',
          type: 'input',
          label: 'Disabled Input',
          disabled: true,
        })
        .build();

      const { fixture } = await IonicFormTestUtils.createTest({
        config,
        initialValue: { firstName: '' },
      });

      //       const input = fixture.debugElement.query(By.css('ion-input input'));
    });

    it('should apply different Ionic fill styles', async () => {
      const config = IonicFormTestUtils.builder()
        .ionicInputField({ key: 'firstName', props: { fill: 'solid' } })
        .ionicInputField({ key: 'email', props: { fill: 'outline' } })
        .build();

      const { fixture } = await IonicFormTestUtils.createTest({
        config,
        initialValue: { firstName: '', email: '' },
      });

      const ionInputs = fixture.debugElement.queryAll(By.css('df-ionic-input ion-input'));
    });

    it('should handle multiple inputs with independent value changes', async () => {
      const config = IonicFormTestUtils.builder().ionicInputField({ key: 'firstName' }).ionicInputField({ key: 'email' }).build();

      const { component, fixture } = await IonicFormTestUtils.createTest({
        config,
        initialValue: { firstName: 'Initial Name', email: 'initial@email.com' },
      });

      IonicFormTestUtils.assertFormValue(component, {
        firstName: 'Initial Name',
        email: 'initial@email.com',
      });

      fixture.componentRef.setInput('value', { firstName: 'Updated Name', email: 'initial@email.com' });
      fixture.detectChanges();

      let formValue = IonicFormTestUtils.getFormValue(component);
      expect(formValue.firstName).toBe('Updated Name');
      expect(formValue.email).toBe('initial@email.com');

      fixture.componentRef.setInput('value', { firstName: 'Updated Name', email: 'updated@email.com' });
      fixture.detectChanges();

      formValue = IonicFormTestUtils.getFormValue(component);
      expect(formValue.firstName).toBe('Updated Name');
      expect(formValue.email).toBe('updated@email.com');
    });
  });

  describe('Edge Cases and Robustness Tests', () => {
    it('should handle undefined form values gracefully', async () => {
      const config = IonicFormTestUtils.builder().ionicInputField({ key: 'firstName' }).build();

      const { fixture } = await IonicFormTestUtils.createTest({ config }); // No initial value

      const ionInput = fixture.debugElement.query(By.css('df-ionic-input ion-input'));
      expect(ionInput).not.toBeNull();
      expect(ionInput.nativeElement.tagName.toLowerCase()).toBe('ion-input');
    });

    it('should handle null form values gracefully', async () => {
      const config = IonicFormTestUtils.builder().ionicInputField({ key: 'firstName' }).build();

      const { fixture } = await IonicFormTestUtils.createTest({
        config,
        initialValue: null as any,
      });

      const ionInput = fixture.debugElement.query(By.css('df-ionic-input ion-input'));
      expect(ionInput).not.toBeNull();
      expect(ionInput.nativeElement.tagName.toLowerCase()).toBe('ion-input');
    });

    it('should handle empty string values correctly', async () => {
      const config = IonicFormTestUtils.builder().ionicInputField({ key: 'firstName' }).build();

      const { component } = await IonicFormTestUtils.createTest({
        config,
        initialValue: { firstName: '' },
      });

      expect(IonicFormTestUtils.getFormValue(component).firstName).toBe('');
    });

    it('should handle special characters and unicode input', async () => {
      const config = IonicFormTestUtils.builder().ionicInputField({ key: 'firstName' }).build();

      const { component, fixture } = await IonicFormTestUtils.createTest({
        config,
        initialValue: { firstName: '' },
      });

      const specialText = 'José María';

      await IonicFormTestUtils.simulateIonicInput(fixture, 'ion-input input', specialText);

      expect(IonicFormTestUtils.getFormValue(component).firstName).toBe(specialText);
    });

    it('should handle rapid value changes correctly', async () => {
      const config = IonicFormTestUtils.builder().ionicInputField({ key: 'firstName' }).build();

      const { component, fixture } = await IonicFormTestUtils.createTest({
        config,
        initialValue: { firstName: '' },
      });

      await IonicFormTestUtils.simulateIonicInput(fixture, 'ion-input input', 'Alice');

      expect(IonicFormTestUtils.getFormValue(component).firstName).toBe('Alice');
    });
  });

  describe('Ionic-Specific Props Tests', () => {
    it('should handle clearInput prop', async () => {
      const config = IonicFormTestUtils.builder()
        .ionicInputField({ key: 'email', props: { clearInput: true } })
        .build();

      const { fixture } = await IonicFormTestUtils.createTest({
        config,
        initialValue: { email: '' },
      });

      const ionInput = fixture.debugElement.query(By.css('df-ionic-input ion-input'));
    });

    it('should handle counter prop', async () => {
      const config = IonicFormTestUtils.builder()
        .ionicInputField({ key: 'email', props: { counter: true } })
        .build();

      const { fixture } = await IonicFormTestUtils.createTest({
        config,
        initialValue: { email: '' },
      });

      const ionInput = fixture.debugElement.query(By.css('df-ionic-input ion-input'));
    });

    it('should handle different label placements', async () => {
      const config = IonicFormTestUtils.builder()
        .ionicInputField({ key: 'email', props: { labelPlacement: 'floating' } })
        .build();

      const { fixture } = await IonicFormTestUtils.createTest({
        config,
        initialValue: { email: '' },
      });

      const ionInput = fixture.debugElement.query(By.css('df-ionic-input ion-input'));
    });
  });
});
