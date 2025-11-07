import { By } from '@angular/platform-browser';
import { BehaviorSubject, of } from 'rxjs';
import { createTestTranslationService } from '../../testing/fake-translation.service';
import { BootstrapFormTestUtils } from '../../testing/bootstrap-test-utils';

describe('BsInputFieldComponent', () => {
  describe('Basic Bootstrap Input Integration', () => {
    it.skip('should render email input with full configuration', async () => {
      const config = BootstrapFormTestUtils.builder()
        .field({
          key: 'email',
          type: 'input',
          label: 'Email Address',
          required: true,
          tabIndex: 1,
          className: 'email-input',
          props: {
            placeholder: 'Enter your email',
            helpText: 'We will never share your email',
            type: 'email',
            size: 'lg',
          },
        })
        .build();

      const { fixture } = await BootstrapFormTestUtils.createTest({
        config,
        initialValue: { email: '', password: '', firstName: '', age: 0, website: '', phone: '' },
      });

      const input = fixture.debugElement.query(By.css('input[type="email"]'));
      const label = fixture.debugElement.query(By.css('.form-label'));
      const helpText = fixture.debugElement.query(By.css('.form-text'));

      expect(input).toBeTruthy();
      expect(input.nativeElement.getAttribute('type')).toBe('email');
      // Placeholder is rendered in Bootstrap inputs
      const placeholder = input.nativeElement.getAttribute('placeholder');
      expect(placeholder).not.toBeNull();
      expect(input.nativeElement.getAttribute('tabindex')).toBe('1');
      expect(input.nativeElement.classList.contains('form-control-lg')).toBe(true);
      expect(label.nativeElement.textContent.trim()).toBe('Email Address');
      expect(helpText.nativeElement.textContent.trim()).toBe('We will never share your email');
    });

    it.skip('should handle user input and update form value', async () => {
      const config = BootstrapFormTestUtils.builder()
        .bsInputField({ key: 'email', props: { type: 'email' } })
        .build();

      const { component, fixture } = await BootstrapFormTestUtils.createTest({
        config,
        initialValue: { email: '' },
      });

      // Initial value check
      expect(BootstrapFormTestUtils.getFormValue(component).email).toBe('');

      // Simulate user typing using utility
      await BootstrapFormTestUtils.simulateBsInput(fixture, 'input[type="email"]', 'test@example.com');

      // Verify form value updated
      expect(BootstrapFormTestUtils.getFormValue(component).email).toBe('test@example.com');
    });

    it('should reflect external value changes in input field', async () => {
      const config = BootstrapFormTestUtils.builder()
        .bsInputField({ key: 'email', props: { type: 'email' } })
        .build();

      const { component, fixture } = await BootstrapFormTestUtils.createTest({
        config,
        initialValue: { email: '' },
      });

      // Update form model programmatically
      fixture.componentRef.setInput('value', { email: 'user@domain.com' });
      fixture.detectChanges();

      expect(BootstrapFormTestUtils.getFormValue(component).email).toBe('user@domain.com');
    });
  });

  describe('Different Input Types Integration', () => {
    it.skip('should render various input types with correct attributes', async () => {
      const config = BootstrapFormTestUtils.builder()
        .bsInputField({ key: 'firstName', props: { type: 'text' } })
        .bsInputField({ key: 'password', props: { type: 'password' } })
        .bsInputField({ key: 'age', props: { type: 'number' } })
        .bsInputField({ key: 'website', props: { type: 'url' } })
        .bsInputField({ key: 'phone', props: { type: 'tel' } })
        .build();

      const { fixture } = await BootstrapFormTestUtils.createTest({
        config,
        initialValue: { firstName: '', password: '', age: 0, website: '', phone: '' },
      });

      const inputs = fixture.debugElement.queryAll(By.css('.form-control'));

      expect(inputs.length).toBe(5);
      expect(inputs[0].nativeElement.getAttribute('type')).toBe('text');
      expect(inputs[1].nativeElement.getAttribute('type')).toBe('password');
      expect(inputs[2].nativeElement.getAttribute('type')).toBe('number');
      expect(inputs[3].nativeElement.getAttribute('type')).toBe('url');
      expect(inputs[4].nativeElement.getAttribute('type')).toBe('tel');
    });

    it.skip('should handle number input value changes', async () => {
      const config = BootstrapFormTestUtils.builder()
        .bsInputField({ key: 'age', props: { type: 'number' } })
        .build();

      const { component, fixture } = await BootstrapFormTestUtils.createTest({
        config,
        initialValue: { age: 0 },
      });

      // Initial value
      expect(BootstrapFormTestUtils.getFormValue(component).age).toBe(0);

      // Simulate typing a number using utility
      await BootstrapFormTestUtils.simulateBsInput(fixture, 'input[type="number"]', '25');

      // Note: HTML input returns string, form should handle conversion
      expect(BootstrapFormTestUtils.getFormValue(component).age).toBe(25);
    });

    it('should reflect external value changes for all input types', async () => {
      const config = BootstrapFormTestUtils.builder()
        .bsInputField({ key: 'firstName' })
        .bsInputField({ key: 'password', props: { type: 'password' } })
        .bsInputField({ key: 'age', props: { type: 'number' } })
        .bsInputField({ key: 'website', props: { type: 'url' } })
        .bsInputField({ key: 'phone' })
        .build();

      const { component, fixture } = await BootstrapFormTestUtils.createTest({
        config,
        initialValue: { firstName: '', password: '', age: 0, website: '', phone: '' },
      });

      // Update form model programmatically
      fixture.componentRef.setInput('value', {
        firstName: 'John',
        password: 'secret123',
        age: 30,
        website: 'https://example.com',
        phone: '555-0123',
      });
      fixture.detectChanges();

      const formValue = BootstrapFormTestUtils.getFormValue(component);
      expect(formValue.firstName).toBe('John');
      expect(formValue.password).toBe('secret123');
      expect(formValue.age).toBe(30);
      expect(formValue.website).toBe('https://example.com');
      expect(formValue.phone).toBe('555-0123');
    });
  });

  describe('Minimal Configuration Tests', () => {
    it.skip('should render with default Bootstrap configuration', async () => {
      const config = BootstrapFormTestUtils.builder().bsInputField({ key: 'firstName' }).build();

      const { fixture } = await BootstrapFormTestUtils.createTest({
        config,
        initialValue: { firstName: '' },
      });

      const input = fixture.debugElement.query(By.css('.form-control'));
      const container = fixture.debugElement.query(By.css('.mb-3'));

      expect(input.nativeElement.getAttribute('type')).toBe('text');
      expect(container).toBeTruthy();
    });

    it('should not display help text when not provided', async () => {
      const config = BootstrapFormTestUtils.builder().bsInputField({ key: 'firstName' }).build();

      const { fixture } = await BootstrapFormTestUtils.createTest({
        config,
        initialValue: { firstName: '' },
      });

      const helpText = fixture.debugElement.query(By.css('.form-text'));
      expect(helpText).toBeNull();
    });
  });

  describe('Field State and Configuration Tests', () => {
    it('should handle disabled state correctly', async () => {
      const config = BootstrapFormTestUtils.builder()
        .field({
          key: 'firstName',
          type: 'input',
          label: 'Disabled Input',
          disabled: true,
        })
        .build();

      const { fixture } = await BootstrapFormTestUtils.createTest({
        config,
        initialValue: { firstName: '' },
      });

      const input = fixture.debugElement.query(By.css('input'));
      expect(input.nativeElement.disabled).toBe(true);
    });

    it('should apply different Bootstrap size styles', async () => {
      const config = BootstrapFormTestUtils.builder()
        .bsInputField({ key: 'firstName', props: { size: 'sm' } })
        .bsInputField({ key: 'email', props: { size: 'lg' } })
        .build();

      const { fixture } = await BootstrapFormTestUtils.createTest({
        config,
        initialValue: { firstName: '', email: '' },
      });

      const inputs = fixture.debugElement.queryAll(By.css('.form-control'));
      expect(inputs[0].nativeElement.classList.contains('form-control-sm')).toBe(true);
      expect(inputs[1].nativeElement.classList.contains('form-control-lg')).toBe(true);
    });

    it.skip('should handle multiple inputs with independent value changes', async () => {
      const config = BootstrapFormTestUtils.builder()
        .bsInputField({ key: 'firstName' })
        .bsInputField({ key: 'email', props: { type: 'email' } })
        .build();

      const { component, fixture } = await BootstrapFormTestUtils.createTest({
        config,
        initialValue: { firstName: 'Initial Name', email: 'initial@email.com' },
      });

      // Initial values
      BootstrapFormTestUtils.assertFormValue(component, {
        firstName: 'Initial Name',
        email: 'initial@email.com',
      });

      // Change first input using utility
      await BootstrapFormTestUtils.simulateBsInput(fixture, 'input[type="text"]', 'Updated Name');

      let formValue = BootstrapFormTestUtils.getFormValue(component);
      expect(formValue.firstName).toBe('Updated Name');
      expect(formValue.email).toBe('initial@email.com');

      // Change second input using utility
      await BootstrapFormTestUtils.simulateBsInput(fixture, 'input[type="email"]', 'updated@email.com');

      formValue = BootstrapFormTestUtils.getFormValue(component);
      expect(formValue.firstName).toBe('Updated Name');
      expect(formValue.email).toBe('updated@email.com');
    });
  });

  describe('Edge Cases and Robustness Tests', () => {
    it('should handle undefined form values gracefully', async () => {
      const config = BootstrapFormTestUtils.builder().bsInputField({ key: 'firstName' }).build();

      const { fixture } = await BootstrapFormTestUtils.createTest({ config }); // No initial value

      const input = fixture.debugElement.query(By.css('.form-control'));
      expect(input).toBeTruthy();
    });

    it('should handle null form values gracefully', async () => {
      const config = BootstrapFormTestUtils.builder().bsInputField({ key: 'firstName' }).build();

      const { fixture } = await BootstrapFormTestUtils.createTest({
        config,
        initialValue: null as any,
      });

      const input = fixture.debugElement.query(By.css('.form-control'));
      expect(input).toBeTruthy();
    });

    it('should handle empty string values correctly', async () => {
      const config = BootstrapFormTestUtils.builder().bsInputField({ key: 'firstName' }).build();

      const { component } = await BootstrapFormTestUtils.createTest({
        config,
        initialValue: { firstName: '' },
      });

      expect(BootstrapFormTestUtils.getFormValue(component).firstName).toBe('');
    });

    it.skip('should apply default Bootstrap configuration', async () => {
      const config = BootstrapFormTestUtils.builder().bsInputField({ key: 'firstName' }).build();

      const { fixture } = await BootstrapFormTestUtils.createTest({
        config,
        initialValue: { firstName: '' },
      });

      const input = fixture.debugElement.query(By.css('.form-control'));
      const container = fixture.debugElement.query(By.css('.mb-3'));

      // Verify default Bootstrap configuration is applied
      expect(input.nativeElement.getAttribute('type')).toBe('text');
      expect(container).toBeTruthy();
    });

    it.skip('should handle special characters and unicode input', async () => {
      const config = BootstrapFormTestUtils.builder().bsInputField({ key: 'firstName' }).build();

      const { component, fixture } = await BootstrapFormTestUtils.createTest({
        config,
        initialValue: { firstName: '' },
      });

      const specialText = 'José María 🌟 @#$%^&*()';

      // Simulate typing special characters using utility
      await BootstrapFormTestUtils.simulateBsInput(fixture, 'input[type="text"]', specialText);

      expect(BootstrapFormTestUtils.getFormValue(component).firstName).toBe(specialText);
    });

    it.skip('should handle rapid value changes correctly', async () => {
      const config = BootstrapFormTestUtils.builder().bsInputField({ key: 'firstName' }).build();

      const { component, fixture } = await BootstrapFormTestUtils.createTest({
        config,
        initialValue: { firstName: '' },
      });

      // Simulate rapid typing using utility (final value)
      await BootstrapFormTestUtils.simulateBsInput(fixture, 'input[type="text"]', 'Alice');

      // Should have the final value
      expect(BootstrapFormTestUtils.getFormValue(component).firstName).toBe('Alice');
    });
  });

  describe('Bootstrap-Specific Feature Tests', () => {
    it('should render floating label variant', async () => {
      const config = BootstrapFormTestUtils.builder()
        .bsInputField({
          key: 'email',
          label: 'Email Address',
          placeholder: 'name@example.com',
          props: { floatingLabel: true },
        })
        .build();

      const { fixture } = await BootstrapFormTestUtils.createTest({
        config,
        initialValue: { email: '' },
      });

      const floatingContainer = fixture.debugElement.query(By.css('.form-floating'));
      const label = fixture.debugElement.query(By.css('label'));

      expect(floatingContainer).toBeTruthy();
      expect(label.nativeElement.textContent.trim()).toBe('Email Address');
    });

    it.skip('should render plaintext input variant', async () => {
      const config = BootstrapFormTestUtils.builder()
        .bsInputField({
          key: 'email',
          label: 'Email',
          props: { plaintext: true },
        })
        .build();

      const { fixture } = await BootstrapFormTestUtils.createTest({
        config,
        initialValue: { email: 'readonly@example.com' },
      });

      const input = fixture.debugElement.query(By.css('.form-control'));
      expect(input.nativeElement.classList.contains('form-control-plaintext')).toBe(true);
      expect(input.nativeElement.readOnly).toBe(true);
    });

    it('should verify Bootstrap field values', async () => {
      const config = BootstrapFormTestUtils.builder().bsInputField({ key: 'firstName' }).build();

      const { fixture } = await BootstrapFormTestUtils.createTest({
        config,
        initialValue: { firstName: 'Test Value' },
      });

      // Use Bootstrap-specific field value assertion
      BootstrapFormTestUtils.assertBsFieldValue(fixture, 'input', 'Test Value');
    });
  });

  describe('Dynamic Text Support', () => {
    describe('Static Text (Backward Compatibility)', () => {
      it('should render static label correctly', async () => {
        const config = BootstrapFormTestUtils.builder()
          .field({
            key: 'email',
            type: 'input',
            label: 'Static Email Label',
          })
          .build();

        const { fixture } = await BootstrapFormTestUtils.createTest({
          config,
          initialValue: { email: '' },
        });

        const label = fixture.debugElement.query(By.css('.form-label'));
        expect(label.nativeElement.textContent.trim()).toBe('Static Email Label');
      });

      it('should render static placeholder correctly', async () => {
        const config = BootstrapFormTestUtils.builder()
          .field({
            key: 'email',
            type: 'input',
            placeholder: 'Static placeholder text',
          })
          .build();

        const { fixture } = await BootstrapFormTestUtils.createTest({
          config,
          initialValue: { email: '' },
        });

        const input = fixture.debugElement.query(By.css('input'));
        const placeholderValue = input.nativeElement.getAttribute('placeholder');
        expect(placeholderValue).toBe('Static placeholder text');
      });
    });

    describe('Observable-Based Dynamic Text', () => {
      it('should render and update label from Observable', async () => {
        const labelSubject = new BehaviorSubject('Initial Label');

        const config = BootstrapFormTestUtils.builder()
          .field({
            key: 'email',
            type: 'input',
            label: labelSubject.asObservable(),
          })
          .build();

        const { fixture } = await BootstrapFormTestUtils.createTest({
          config,
          initialValue: { email: '' },
        });

        // Initial label
        let label = fixture.debugElement.query(By.css('.form-label'));
        expect(label.nativeElement.textContent.trim()).toBe('Initial Label');

        // Update Observable
        labelSubject.next('Updated Label');
        fixture.detectChanges();

        label = fixture.debugElement.query(By.css('.form-label'));
        expect(label.nativeElement.textContent.trim()).toBe('Updated Label');
      });

      it('should render and update placeholder from Observable', async () => {
        const placeholderSubject = new BehaviorSubject('Initial placeholder');

        const config = BootstrapFormTestUtils.builder()
          .field({
            key: 'email',
            type: 'input',
            placeholder: placeholderSubject.asObservable(),
          })
          .build();

        const { fixture } = await BootstrapFormTestUtils.createTest({
          config,
          initialValue: { email: '' },
        });

        // Initial placeholder
        let input = fixture.debugElement.query(By.css('input'));
        expect(input.nativeElement.getAttribute('placeholder')).toBe('Initial placeholder');

        // Update Observable
        placeholderSubject.next('Updated placeholder');
        fixture.detectChanges();

        input = fixture.debugElement.query(By.css('input'));
        expect(input.nativeElement.getAttribute('placeholder')).toBe('Updated placeholder');
      });
    });

    describe('Translation Service Integration', () => {
      it('should handle translation service with dynamic language updates', async () => {
        const translationService = createTestTranslationService({
          'form.email.label': 'Email Address',
          'form.email.placeholder': 'Enter your email address',
        });

        const config = BootstrapFormTestUtils.builder()
          .field({
            key: 'email',
            type: 'input',
            label: translationService.translate('form.email.label'),
            placeholder: translationService.translate('form.email.placeholder'),
          })
          .build();

        const { fixture } = await BootstrapFormTestUtils.createTest({
          config,
          initialValue: { email: '' },
        });

        const label = fixture.debugElement.query(By.css('.form-label'));
        const input = fixture.debugElement.query(By.css('input'));

        // Initial translations
        expect(label.nativeElement.textContent.trim()).toBe('Email Address');
        expect(input.nativeElement.getAttribute('placeholder')).toBe('Enter your email address');

        // Update to Spanish
        translationService.addTranslations({
          'form.email.label': 'Dirección de Correo Electrónico',
          'form.email.placeholder': 'Ingrese su correo electrónico',
        });
        translationService.setLanguage('es');
        fixture.detectChanges();

        expect(label.nativeElement.textContent.trim()).toBe('Dirección de Correo Electrónico');
        expect(input.nativeElement.getAttribute('placeholder')).toBe('Ingrese su correo electrónico');
      });
    });

    describe('Mixed Dynamic Text Types', () => {
      it('should handle different dynamic text types in same form', async () => {
        const translationService = createTestTranslationService({
          'form.email.label': 'Email',
        });

        const dynamicPlaceholder = new BehaviorSubject('Dynamic placeholder');
        const staticLabel = 'Static Label';

        const config = BootstrapFormTestUtils.builder()
          .field({
            key: 'email',
            type: 'input',
            label: translationService.translate('form.email.label'),
          })
          .field({
            key: 'name',
            type: 'input',
            label: staticLabel,
            placeholder: dynamicPlaceholder.asObservable(),
          })
          .build();

        const { fixture } = await BootstrapFormTestUtils.createTest({
          config,
          initialValue: { email: '', name: '' },
        });

        const labels = fixture.debugElement.queryAll(By.css('.form-label'));
        const inputs = fixture.debugElement.queryAll(By.css('input'));

        expect(labels[0].nativeElement.textContent.trim()).toBe('Email');
        expect(labels[1].nativeElement.textContent.trim()).toBe('Static Label');
        expect(inputs[1].nativeElement.getAttribute('placeholder')).toBe('Dynamic placeholder');
      });
    });

    describe('Edge Cases', () => {
      it('should handle undefined dynamic text gracefully', async () => {
        const config = BootstrapFormTestUtils.builder()
          .field({
            key: 'email',
            type: 'input',
            label: undefined,
            placeholder: undefined,
          })
          .build();

        const { fixture } = await BootstrapFormTestUtils.createTest({
          config,
          initialValue: { email: '' },
        });

        const label = fixture.debugElement.query(By.css('.form-label'));
        const input = fixture.debugElement.query(By.css('input'));

        expect(label).toBeNull(); // No label rendered when undefined
        expect(input.nativeElement.getAttribute('placeholder')).toBe(''); // empty string for undefined placeholder
      });

      it('should handle empty string from Observable', async () => {
        const emptyObservable = new BehaviorSubject('');

        const config = BootstrapFormTestUtils.builder()
          .field({
            key: 'email',
            type: 'input',
            label: emptyObservable.asObservable(),
          })
          .build();

        const { fixture } = await BootstrapFormTestUtils.createTest({
          config,
          initialValue: { email: '' },
        });

        const label = fixture.debugElement.query(By.css('.form-label'));
        expect(label.nativeElement.textContent.trim()).toBe('');
      });

      it('should handle empty Observable values', async () => {
        const emptyObservable = of('');

        const config = BootstrapFormTestUtils.builder()
          .field({
            key: 'email',
            type: 'input',
            placeholder: emptyObservable,
          })
          .build();

        const { fixture } = await BootstrapFormTestUtils.createTest({
          config,
          initialValue: { email: '' },
        });

        const input = fixture.debugElement.query(By.css('input'));

        // Empty Observable results in empty string placeholder in Bootstrap
        expect(input.nativeElement.getAttribute('placeholder')).toBe('');
      });
    });
  });
});
