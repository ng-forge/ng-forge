import { TestBed } from '@angular/core/testing';
import { beforeEach, describe, expect, it } from 'vitest';
import { Injector, runInInjectionContext, signal } from '@angular/core';
import { form, schema } from '@angular/forms/signals';
import type { SchemaPath } from '@angular/forms/signals';
import { applyValidator, applyValidators } from '../../core/validation/validator-factory';
import { ValidatorConfig } from '../../models/validation/validator-config';
import { FunctionRegistryService, FieldContextRegistryService, RootFormRegistryService } from '../../core/registry';

describe('Validator Transformation Pipeline Integration', () => {
  let injector: Injector;
  const mockEntity = signal<Record<string, unknown>>({});
  const mockFormSignal = signal<unknown>(undefined);

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        FunctionRegistryService,
        FieldContextRegistryService,
        { provide: RootFormRegistryService, useValue: { formValue: mockEntity, rootForm: mockFormSignal } },
      ],
    });

    injector = TestBed.inject(Injector);
    mockEntity.set({});
    mockFormSignal.set(undefined);
  });

  describe('Static Validators', () => {
    it('should transform required config to required validator', () => {
      runInInjectionContext(injector, () => {
        const formValue = signal({ email: '' });
        const config: ValidatorConfig = { type: 'required' };

        const formInstance = form(
          formValue,
          schema<{ email: string }>((path) => {
            applyValidator(config, path.email);
          }),
        );
        mockFormSignal.set(formInstance);

        expect(formInstance().valid()).toBe(false);
        expect(formInstance().errors()).toBeDefined();

        formValue.set({ email: 'test@example.com' });
        expect(formInstance().valid()).toBe(true);
      });
    });

    it('should transform email config to email validator', () => {
      runInInjectionContext(injector, () => {
        const formValue = signal({ email: 'invalid-email' });
        const config: ValidatorConfig = { type: 'email' };

        const formInstance = form(
          formValue,
          schema<{ email: string }>((path) => {
            applyValidator(config, path.email as SchemaPath<string>);
          }),
        );
        mockFormSignal.set(formInstance);

        expect(formInstance().valid()).toBe(false);

        formValue.set({ email: 'valid@example.com' });
        expect(formInstance().valid()).toBe(true);
      });
    });

    it('should transform min config to min validator', () => {
      runInInjectionContext(injector, () => {
        const formValue = signal({ age: 10 });
        const config: ValidatorConfig = { type: 'min', value: 18 };

        const formInstance = form(
          formValue,
          schema<{ age: number }>((path) => {
            applyValidator(config, path.age as SchemaPath<number>);
          }),
        );
        mockFormSignal.set(formInstance);

        expect(formInstance().valid()).toBe(false);

        formValue.set({ age: 25 });
        expect(formInstance().valid()).toBe(true);
      });
    });

    it('should transform max config to max validator', () => {
      runInInjectionContext(injector, () => {
        const formValue = signal({ age: 100 });
        const config: ValidatorConfig = { type: 'max', value: 65 };

        const formInstance = form(
          formValue,
          schema<{ age: number }>((path) => {
            applyValidator(config, path.age as SchemaPath<number>);
          }),
        );
        mockFormSignal.set(formInstance);

        expect(formInstance().valid()).toBe(false);

        formValue.set({ age: 30 });
        expect(formInstance().valid()).toBe(true);
      });
    });

    it('should transform minLength config to minLength validator', () => {
      runInInjectionContext(injector, () => {
        const formValue = signal({ username: 'ab' });
        const config: ValidatorConfig = { type: 'minLength', value: 3 };

        const formInstance = form(
          formValue,
          schema<{ username: string }>((path) => {
            applyValidator(config, path.username as SchemaPath<string>);
          }),
        );
        mockFormSignal.set(formInstance);

        expect(formInstance().valid()).toBe(false);

        formValue.set({ username: 'alice' });
        expect(formInstance().valid()).toBe(true);
      });
    });

    it('should transform maxLength config to maxLength validator', () => {
      runInInjectionContext(injector, () => {
        const formValue = signal({ username: 'verylongusername' });
        const config: ValidatorConfig = { type: 'maxLength', value: 10 };

        const formInstance = form(
          formValue,
          schema<{ username: string }>((path) => {
            applyValidator(config, path.username as SchemaPath<string>);
          }),
        );
        mockFormSignal.set(formInstance);

        expect(formInstance().valid()).toBe(false);

        formValue.set({ username: 'alice' });
        expect(formInstance().valid()).toBe(true);
      });
    });

    it('should transform pattern config to pattern validator', () => {
      runInInjectionContext(injector, () => {
        const formValue = signal({ code: '123' });
        const config: ValidatorConfig = { type: 'pattern', value: /^[A-Z]{3}$/ };

        const formInstance = form(
          formValue,
          schema<{ code: string }>((path) => {
            applyValidator(config, path.code as SchemaPath<string>);
          }),
        );
        mockFormSignal.set(formInstance);

        expect(formInstance().valid()).toBe(false);

        formValue.set({ code: 'ABC' });
        expect(formInstance().valid()).toBe(true);
      });
    });

    it('should transform pattern config with string regex', () => {
      runInInjectionContext(injector, () => {
        const formValue = signal({ zipCode: 'invalid' });
        const config: ValidatorConfig = { type: 'pattern', value: '^\\d{5}$' };

        const formInstance = form(
          formValue,
          schema<{ zipCode: string }>((path) => {
            applyValidator(config, path.zipCode as SchemaPath<string>);
          }),
        );
        mockFormSignal.set(formInstance);

        expect(formInstance().valid()).toBe(false);

        formValue.set({ zipCode: '12345' });
        expect(formInstance().valid()).toBe(true);
      });
    });
  });

  describe('Dynamic Validators', () => {
    it('should apply min validator with static value', () => {
      runInInjectionContext(injector, () => {
        const formValue = signal({ score: 5 });
        const config: ValidatorConfig = {
          type: 'min',
          value: 10, // Static value, no expression
        };

        const formInstance = form(
          formValue,
          schema<{ score: number }>((path) => {
            applyValidator(config, path.score as SchemaPath<number>);
          }),
        );
        mockFormSignal.set(formInstance);

        // Score 5 < min 10 - invalid
        expect(formInstance().valid()).toBe(false);

        formValue.set({ score: 15 });
        // Score 15 >= min 10 - valid
        expect(formInstance().valid()).toBe(true);
      });
    });

    it('should apply max validator with static value', () => {
      runInInjectionContext(injector, () => {
        const formValue = signal({ quantity: 100 });
        const config: ValidatorConfig = {
          type: 'max',
          value: 50, // Static value, no expression
        };

        const formInstance = form(
          formValue,
          schema<{ quantity: number }>((path) => {
            applyValidator(config, path.quantity as SchemaPath<number>);
          }),
        );
        mockFormSignal.set(formInstance);

        // Quantity 100 > max 50 - invalid
        expect(formInstance().valid()).toBe(false);

        formValue.set({ quantity: 25 });
        // Quantity 25 <= max 50 - valid
        expect(formInstance().valid()).toBe(true);
      });
    });

    it('should re-evaluate static validators when field value changes', () => {
      runInInjectionContext(injector, () => {
        const formValue = signal({ age: 15 });
        const config: ValidatorConfig = {
          type: 'min',
          value: 18,
        };

        const formInstance = form(
          formValue,
          schema<{ age: number }>((path) => {
            applyValidator(config, path.age as SchemaPath<number>);
          }),
        );
        mockFormSignal.set(formInstance);

        // Initially invalid (15 < 18)
        expect(formInstance().valid()).toBe(false);

        // Update age to meet minimum
        formValue.set({ age: 21 });
        expect(formInstance().valid()).toBe(true);

        // Update age below minimum again
        formValue.set({ age: 17 });
        expect(formInstance().valid()).toBe(false);
      });
    });
  });

  describe('Multiple Validators', () => {
    it('should apply multiple validators to same field', () => {
      runInInjectionContext(injector, () => {
        const formValue = signal({ password: '' });
        const configs: ValidatorConfig[] = [
          { type: 'required' },
          { type: 'minLength', value: 8 },
          { type: 'pattern', value: /[A-Z]/ }, // Must contain uppercase
        ];

        const formInstance = form(
          formValue,
          schema<{ password: string }>((path) => {
            applyValidators(configs, path.password as SchemaPath<string>);
          }),
        );
        mockFormSignal.set(formInstance);

        // Empty - fails required
        expect(formInstance().valid()).toBe(false);

        // Too short - fails minLength
        formValue.set({ password: 'abc' });
        expect(formInstance().valid()).toBe(false);

        // Long enough but no uppercase - fails pattern
        formValue.set({ password: 'abcdefgh' });
        expect(formInstance().valid()).toBe(false);

        // Meets all requirements
        formValue.set({ password: 'Abcdefgh' });
        expect(formInstance().valid()).toBe(true);
      });
    });

    it('should combine validator errors correctly', () => {
      runInInjectionContext(injector, () => {
        const formValue = signal({ username: '' });
        const configs: ValidatorConfig[] = [{ type: 'required' }, { type: 'minLength', value: 3 }, { type: 'maxLength', value: 20 }];

        const formInstance = form(
          formValue,
          schema<{ username: string }>((path) => {
            applyValidators(configs, path.username as SchemaPath<string>);
          }),
        );
        mockFormSignal.set(formInstance);

        // Empty - should have errors
        expect(formInstance().valid()).toBe(false);
        expect(formInstance().errors()).toBeDefined();

        // Valid username - no errors (Angular returns empty array)
        formValue.set({ username: 'alice' });
        expect(formInstance().valid()).toBe(true);
        const errors = formInstance().errors();
        expect(Array.isArray(errors) ? errors.length === 0 : Object.keys(errors).length === 0).toBe(true);
      });
    });
  });

  describe('Edge Cases', () => {
    it('should handle email validator with empty string', () => {
      runInInjectionContext(injector, () => {
        const formValue = signal({ email: '' });
        const config: ValidatorConfig = { type: 'email' };

        const formInstance = form(
          formValue,
          schema<{ email: string }>((path) => {
            applyValidator(config, path.email as SchemaPath<string>);
          }),
        );
        mockFormSignal.set(formInstance);

        // Empty email is valid for email validator (use required separately)
        expect(formInstance().valid()).toBe(true);

        formValue.set({ email: 'invalid' });
        expect(formInstance().valid()).toBe(false);
      });
    });

    it('should handle pattern validator with special regex characters', () => {
      runInInjectionContext(injector, () => {
        const formValue = signal({ phone: '123-456-7890' });
        // Phone pattern: ###-###-####
        const config: ValidatorConfig = { type: 'pattern', value: /^\d{3}-\d{3}-\d{4}$/ };

        const formInstance = form(
          formValue,
          schema<{ phone: string }>((path) => {
            applyValidator(config, path.phone as SchemaPath<string>);
          }),
        );
        mockFormSignal.set(formInstance);

        expect(formInstance().valid()).toBe(true);

        formValue.set({ phone: '1234567890' }); // No dashes
        expect(formInstance().valid()).toBe(false);
      });
    });

    it('should handle min/max with boundary values', () => {
      runInInjectionContext(injector, () => {
        const formValue = signal({ rating: 5 });
        const configs: ValidatorConfig[] = [
          { type: 'min', value: 1 },
          { type: 'max', value: 10 },
        ];

        const formInstance = form(
          formValue,
          schema<{ rating: number }>((path) => {
            applyValidators(configs, path.rating as SchemaPath<number>);
          }),
        );
        mockFormSignal.set(formInstance);

        // Boundary: exactly min
        formValue.set({ rating: 1 });
        expect(formInstance().valid()).toBe(true);

        // Boundary: exactly max
        formValue.set({ rating: 10 });
        expect(formInstance().valid()).toBe(true);

        // Below min
        formValue.set({ rating: 0 });
        expect(formInstance().valid()).toBe(false);

        // Above max
        formValue.set({ rating: 11 });
        expect(formInstance().valid()).toBe(false);
      });
    });
  });
});
