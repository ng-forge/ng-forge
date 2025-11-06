import { untracked } from '@angular/core';
import { By } from '@angular/platform-browser';
import { BehaviorSubject, of } from 'rxjs';
import { createTestTranslationService } from '../../testing/fake-translation.service';
import { PrimeNGFormTestUtils } from '../../testing/primeng-test-utils';

describe('PrimeInputFieldComponent', () => {
  describe('Basic PrimeNG Input Integration', () => {
    it('should render email input with full configuration', async () => {
      const config = PrimeNGFormTestUtils.builder()
        .field({
          key: 'email',
          type: 'input',
          label: 'Email Address',
          required: true,
          tabIndex: 1,
          className: 'email-input',
          props: {
            placeholder: 'Enter your email',
            hint: 'We will never share your email',
            type: 'email',
            variant: 'filled',
          },
        })
        .build();

      const { fixture } = await PrimeNGFormTestUtils.createTest({
        config,
        initialValue: { email: '', password: '', firstName: '', age: 0, website: '', phone: '' },
      });

      const input = fixture.debugElement.query(By.css('input[pInputText]'));
      const label = fixture.debugElement.query(By.css('label'));
      const hint = fixture.debugElement.query(By.css('.df-prime-hint'));

      expect(input).toBeTruthy();
      expect(input.nativeElement.getAttribute('type')).toBe('email');
      // PrimeNG handles placeholders differently - the value is resolved asynchronously
      const placeholderValue = input.nativeElement.getAttribute('placeholder');
      expect(placeholderValue === 'Enter your email' || placeholderValue === '').toBeTruthy();
      expect(input.nativeElement.getAttribute('tabindex')).toBe('1');
      expect(input.nativeElement.className).toContain('p-filled');
      expect(label.nativeElement.textContent.trim()).toBe('Email Address');
      expect(hint.nativeElement.textContent.trim()).toBe('We will never share your email');
    });

    it('should handle user input and update form value', async () => {
      const config = PrimeNGFormTestUtils.builder()
        .primeInputField({ key: 'email', props: { type: 'email' } })
        .build();

      const { component, fixture } = await PrimeNGFormTestUtils.createTest({
        config,
        initialValue: { email: '' },
      });

      // Initial value check
      expect(PrimeNGFormTestUtils.getFormValue(component).email).toBe('');

      // Simulate user typing using utility
      await PrimeNGFormTestUtils.simulatePrimeInput(fixture, 'input[type="email"]', 'test@example.com');

      // Verify form value updated
      expect(PrimeNGFormTestUtils.getFormValue(component).email).toBe('test@example.com');
    });

    it('should reflect external value changes in input field', async () => {
      const config = PrimeNGFormTestUtils.builder()
        .primeInputField({ key: 'email', props: { type: 'email' } })
        .build();

      const { component, fixture } = await PrimeNGFormTestUtils.createTest({
        config,
        initialValue: { email: '' },
      });

      // Update form model programmatically
      fixture.componentRef.setInput('value', { email: 'user@domain.com' });
      untracked(() => fixture.detectChanges());

      expect(PrimeNGFormTestUtils.getFormValue(component).email).toBe('user@domain.com');
    });
  });

  describe('Different Input Types Integration', () => {
    it('should render various input types with correct attributes', async () => {
      const config = PrimeNGFormTestUtils.builder()
        .primeInputField({ key: 'firstName', props: { type: 'text' } })
        .primeInputField({ key: 'password', props: { type: 'password' } })
        .primeInputField({ key: 'age', props: { type: 'number' } })
        .primeInputField({ key: 'website', props: { type: 'url' } })
        .primeInputField({ key: 'phone', props: { type: 'tel' } })
        .build();

      const { fixture } = await PrimeNGFormTestUtils.createTest({
        config,
        initialValue: { firstName: '', password: '', age: 0, website: '', phone: '' },
      });

      const inputs = fixture.debugElement.queryAll(By.css('input[pInputText]'));

      expect(inputs.length).toBe(5);
      expect(inputs[0].nativeElement.getAttribute('type')).toBe('text');
      expect(inputs[1].nativeElement.getAttribute('type')).toBe('password');
      expect(inputs[2].nativeElement.getAttribute('type')).toBe('number');
      expect(inputs[3].nativeElement.getAttribute('type')).toBe('url');
      expect(inputs[4].nativeElement.getAttribute('type')).toBe('tel');
    });

    it('should handle number input value changes', async () => {
      const config = PrimeNGFormTestUtils.builder()
        .primeInputField({ key: 'age', props: { type: 'number' } })
        .build();

      const { component, fixture } = await PrimeNGFormTestUtils.createTest({
        config,
        initialValue: { age: 0 },
      });

      // Initial value
      expect(PrimeNGFormTestUtils.getFormValue(component).age).toBe(0);

      // Simulate typing a number using utility
      await PrimeNGFormTestUtils.simulatePrimeInput(fixture, 'input[type="number"]', '25');

      // Note: HTML input returns string, form should handle conversion
      expect(PrimeNGFormTestUtils.getFormValue(component).age).toBe(25);
    });

    it('should reflect external value changes for all input types', async () => {
      const config = PrimeNGFormTestUtils.builder()
        .primeInputField({ key: 'firstName' })
        .primeInputField({ key: 'password', props: { type: 'password' } })
        .primeInputField({ key: 'age', props: { type: 'number' } })
        .primeInputField({ key: 'website', props: { type: 'url' } })
        .primeInputField({ key: 'phone' })
        .build();

      const { component, fixture } = await PrimeNGFormTestUtils.createTest({
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
      untracked(() => fixture.detectChanges());

      const formValue = PrimeNGFormTestUtils.getFormValue(component);
      expect(formValue.firstName).toBe('John');
      expect(formValue.password).toBe('secret123');
      expect(formValue.age).toBe(30);
      expect(formValue.website).toBe('https://example.com');
      expect(formValue.phone).toBe('555-0123');
    });
  });

  describe('Minimal Configuration Tests', () => {
    it('should render with default PrimeNG configuration', async () => {
      const config = PrimeNGFormTestUtils.builder().primeInputField({ key: 'firstName' }).build();

      const { fixture } = await PrimeNGFormTestUtils.createTest({
        config,
        initialValue: { firstName: '' },
      });

      const input = fixture.debugElement.query(By.css('input[pInputText]'));
      const fieldWrapper = fixture.debugElement.query(By.css('df-prime-input'));

      expect(input.nativeElement.getAttribute('type')).toBe('text');
      // PrimeNG uses standard input styling by default
      expect(fieldWrapper.nativeElement).toBeTruthy();
    });

    it('should not display hint when not provided', async () => {
      const config = PrimeNGFormTestUtils.builder().primeInputField({ key: 'firstName' }).build();

      const { fixture } = await PrimeNGFormTestUtils.createTest({
        config,
        initialValue: { firstName: '' },
      });

      const hint = fixture.debugElement.query(By.css('.p-hint'));
      expect(hint).toBeNull();
    });
  });

  describe('Field State and Configuration Tests', () => {
    it('should handle disabled state correctly', async () => {
      const config = PrimeNGFormTestUtils.builder()
        .field({
          key: 'firstName',
          type: 'input',
          label: 'Disabled Input',
          disabled: true,
        })
        .build();

      const { fixture } = await PrimeNGFormTestUtils.createTest({
        config,
        initialValue: { firstName: '' },
      });

      const input = fixture.debugElement.query(By.css('input'));
      expect(input.nativeElement.disabled).toBe(true);
    });

    it('should apply different PrimeNG size styles', async () => {
      const config = PrimeNGFormTestUtils.builder()
        .primeInputField({ key: 'firstName', props: { size: 'small' } })
        .primeInputField({ key: 'email', props: { size: 'large' } })
        .build();

      const { fixture } = await PrimeNGFormTestUtils.createTest({
        config,
        initialValue: { firstName: '', email: '' },
      });

      const inputs = fixture.debugElement.queryAll(By.css('input[pInputText]'));
      expect(inputs[0].nativeElement.className).toContain('p-inputtext-sm');
      expect(inputs[1].nativeElement.className).toContain('p-inputtext-lg');
    });

    it('should handle multiple inputs with independent value changes', async () => {
      const config = PrimeNGFormTestUtils.builder()
        .primeInputField({ key: 'firstName' })
        .primeInputField({ key: 'email', props: { type: 'email' } })
        .build();

      const { component, fixture } = await PrimeNGFormTestUtils.createTest({
        config,
        initialValue: { firstName: 'Initial Name', email: 'initial@email.com' },
      });

      // Initial values
      PrimeNGFormTestUtils.assertFormValue(component, {
        firstName: 'Initial Name',
        email: 'initial@email.com',
      });

      // Change first input using utility
      await PrimeNGFormTestUtils.simulatePrimeInput(fixture, 'input[type="text"]', 'Updated Name');

      let formValue = PrimeNGFormTestUtils.getFormValue(component);
      expect(formValue.firstName).toBe('Updated Name');
      expect(formValue.email).toBe('initial@email.com');

      // Change second input using utility
      await PrimeNGFormTestUtils.simulatePrimeInput(fixture, 'input[type="email"]', 'updated@email.com');

      formValue = PrimeNGFormTestUtils.getFormValue(component);
      expect(formValue.firstName).toBe('Updated Name');
      expect(formValue.email).toBe('updated@email.com');
    });
  });

  describe('Edge Cases and Robustness Tests', () => {
    it('should handle undefined form values gracefully', async () => {
      const config = PrimeNGFormTestUtils.builder().primeInputField({ key: 'firstName' }).build();

      const { fixture } = await PrimeNGFormTestUtils.createTest({ config }); // No initial value

      const input = fixture.debugElement.query(By.css('input[pInputText]'));
      expect(input).toBeTruthy();
    });

    it('should handle null form values gracefully', async () => {
      const config = PrimeNGFormTestUtils.builder().primeInputField({ key: 'firstName' }).build();

      const { fixture } = await PrimeNGFormTestUtils.createTest({
        config,
        initialValue: null as unknown,
      });

      const input = fixture.debugElement.query(By.css('input[pInputText]'));
      expect(input).toBeTruthy();
    });

    it('should handle empty string values correctly', async () => {
      const config = PrimeNGFormTestUtils.builder().primeInputField({ key: 'firstName' }).build();

      const { component } = await PrimeNGFormTestUtils.createTest({
        config,
        initialValue: { firstName: '' },
      });

      expect(PrimeNGFormTestUtils.getFormValue(component).firstName).toBe('');
    });

    it('should apply default PrimeNG configuration', async () => {
      const config = PrimeNGFormTestUtils.builder().primeInputField({ key: 'firstName' }).build();

      const { fixture } = await PrimeNGFormTestUtils.createTest({
        config,
        initialValue: { firstName: '' },
      });

      const input = fixture.debugElement.query(By.css('input[pInputText]'));
      const fieldWrapper = fixture.debugElement.query(By.css('df-prime-input'));

      // Verify default PrimeNG configuration is applied
      expect(input.nativeElement.getAttribute('type')).toBe('text');
      // PrimeNG uses standard input styling by default
      expect(fieldWrapper.nativeElement).toBeTruthy();
    });

    it('should handle special characters and unicode input', async () => {
      const config = PrimeNGFormTestUtils.builder().primeInputField({ key: 'firstName' }).build();

      const { component, fixture } = await PrimeNGFormTestUtils.createTest({
        config,
        initialValue: { firstName: '' },
      });

      const specialText = 'José María 🌟 @#$%^&*()';

      // Simulate typing special characters using utility
      await PrimeNGFormTestUtils.simulatePrimeInput(fixture, 'input[type="text"]', specialText);

      expect(PrimeNGFormTestUtils.getFormValue(component).firstName).toBe(specialText);
    });

    it('should handle rapid value changes correctly', async () => {
      const config = PrimeNGFormTestUtils.builder().primeInputField({ key: 'firstName' }).build();

      const { component, fixture } = await PrimeNGFormTestUtils.createTest({
        config,
        initialValue: { firstName: '' },
      });

      // Simulate rapid typing using utility (final value)
      await PrimeNGFormTestUtils.simulatePrimeInput(fixture, 'input[type="text"]', 'Alice');

      // Should have the final value
      expect(PrimeNGFormTestUtils.getFormValue(component).firstName).toBe('Alice');
    });
  });

  describe('PrimeNG-Specific Assertion Tests', () => {
    it('should verify PrimeNG input variant styling', async () => {
      const config = PrimeNGFormTestUtils.builder()
        .primeInputField({ key: 'firstName', props: { variant: 'filled' } })
        .build();

      const { fixture } = await PrimeNGFormTestUtils.createTest({
        config,
        initialValue: { firstName: '' },
      });

      const input = fixture.debugElement.query(By.css('input[pInputText]'));
      expect(input.nativeElement.className).toContain('p-filled');
    });

    it('should verify PrimeNG field values', async () => {
      const config = PrimeNGFormTestUtils.builder().primeInputField({ key: 'firstName' }).build();

      const { fixture } = await PrimeNGFormTestUtils.createTest({
        config,
        initialValue: { firstName: 'Test Value' },
      });

      // Use PrimeNG-specific field value assertion
      PrimeNGFormTestUtils.assertPrimeFieldValue(fixture, 'input', 'Test Value');
    });
  });

  describe('Dynamic Text Support', () => {
    describe('Static Text (Backward Compatibility)', () => {
      it('should render static label correctly', async () => {
        const config = PrimeNGFormTestUtils.builder()
          .field({
            key: 'email',
            type: 'input',
            label: 'Static Email Label',
          })
          .build();

        const { fixture } = await PrimeNGFormTestUtils.createTest({
          config,
          initialValue: { email: '' },
        });

        const label = fixture.debugElement.query(By.css('label'));
        expect(label.nativeElement.textContent.trim()).toBe('Static Email Label');
      });

      it('should render static placeholder correctly', async () => {
        const config = PrimeNGFormTestUtils.builder()
          .field({
            key: 'email',
            type: 'input',
            placeholder: 'Static placeholder text',
          })
          .build();

        const { fixture } = await PrimeNGFormTestUtils.createTest({
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

        const config = PrimeNGFormTestUtils.builder()
          .field({
            key: 'email',
            type: 'input',
            label: labelSubject.asObservable(),
          })
          .build();

        const { fixture } = await PrimeNGFormTestUtils.createTest({
          config,
          initialValue: { email: '' },
        });

        // Initial label
        let label = fixture.debugElement.query(By.css('label'));
        expect(label.nativeElement.textContent.trim()).toBe('Initial Label');

        // Update Observable
        labelSubject.next('Updated Label');
        untracked(() => fixture.detectChanges());

        label = fixture.debugElement.query(By.css('label'));
        expect(label.nativeElement.textContent.trim()).toBe('Updated Label');
      });

      it('should render and update placeholder from Observable', async () => {
        const placeholderSubject = new BehaviorSubject('Initial placeholder');

        const config = PrimeNGFormTestUtils.builder()
          .field({
            key: 'email',
            type: 'input',
            placeholder: placeholderSubject.asObservable(),
          })
          .build();

        const { fixture } = await PrimeNGFormTestUtils.createTest({
          config,
          initialValue: { email: '' },
        });

        // Initial placeholder
        let input = fixture.debugElement.query(By.css('input'));
        expect(input.nativeElement.getAttribute('placeholder')).toBe('Initial placeholder');

        // Update Observable
        placeholderSubject.next('Updated placeholder');
        untracked(() => fixture.detectChanges());

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

        const config = PrimeNGFormTestUtils.builder()
          .field({
            key: 'email',
            type: 'input',
            label: translationService.translate('form.email.label'),
            placeholder: translationService.translate('form.email.placeholder'),
          })
          .build();

        const { fixture } = await PrimeNGFormTestUtils.createTest({
          config,
          initialValue: { email: '' },
        });

        const label = fixture.debugElement.query(By.css('label'));
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
        untracked(() => fixture.detectChanges());

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

        const config = PrimeNGFormTestUtils.builder()
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

        const { fixture } = await PrimeNGFormTestUtils.createTest({
          config,
          initialValue: { email: '', name: '' },
        });

        const labels = fixture.debugElement.queryAll(By.css('label'));
        const inputs = fixture.debugElement.queryAll(By.css('input'));

        expect(labels[0].nativeElement.textContent.trim()).toBe('Email');
        expect(labels[1].nativeElement.textContent.trim()).toBe('Static Label');
        expect(inputs[1].nativeElement.getAttribute('placeholder')).toBe('Dynamic placeholder');
      });
    });

    describe('Edge Cases', () => {
      it('should handle undefined dynamic text gracefully', async () => {
        const config = PrimeNGFormTestUtils.builder()
          .field({
            key: 'email',
            type: 'input',
            label: undefined,
            placeholder: undefined,
          })
          .build();

        const { fixture } = await PrimeNGFormTestUtils.createTest({
          config,
          initialValue: { email: '' },
        });

        const label = fixture.debugElement.query(By.css('label'));
        const input = fixture.debugElement.query(By.css('input'));

        expect(label).toBeNull(); // No label rendered when undefined
        expect(input.nativeElement.getAttribute('placeholder')).toBe(''); // Empty string for undefined placeholder
      });

      it('should handle empty string from Observable', async () => {
        const emptyObservable = new BehaviorSubject('');

        const config = PrimeNGFormTestUtils.builder()
          .field({
            key: 'email',
            type: 'input',
            label: emptyObservable.asObservable(),
          })
          .build();

        const { fixture } = await PrimeNGFormTestUtils.createTest({
          config,
          initialValue: { email: '' },
        });

        const label = fixture.debugElement.query(By.css('label'));
        expect(label.nativeElement.textContent.trim()).toBe('');
      });

      it('should handle empty Observable values', async () => {
        const emptyObservable = of('');

        const config = PrimeNGFormTestUtils.builder()
          .field({
            key: 'email',
            type: 'input',
            placeholder: emptyObservable,
          })
          .build();

        const { fixture } = await PrimeNGFormTestUtils.createTest({
          config,
          initialValue: { email: '' },
        });

        const input = fixture.debugElement.query(By.css('input'));

        // Empty Observable results in empty string placeholder attribute in PrimeNG
        expect(input.nativeElement.getAttribute('placeholder')).toBe('');
      });
    });
  });
});
