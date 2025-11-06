import { TestBed } from '@angular/core/testing';
import { beforeEach, describe, expect, it } from 'vitest';
import { Injector, runInInjectionContext, signal } from '@angular/core';
import { form, FieldPath, schema } from '@angular/forms/signals';
import { applyValidator, applyValidators } from '../../core/validation/validator-factory';
import { ValidatorConfig } from '../../models';
import { FunctionRegistryService, FieldContextRegistryService, RootFormRegistryService } from '../../core/registry';

describe('Validator Transformation Pipeline Integration', () => {
  let injector: Injector;
  let rootFormRegistry: RootFormRegistryService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [FunctionRegistryService, FieldContextRegistryService, RootFormRegistryService],
    });

    injector = TestBed.inject(Injector);
    rootFormRegistry = TestBed.inject(RootFormRegistryService);
  });

  describe('Static Validators', () => {
    it('should transform required config to required validator', () => {
      runInInjectionContext(injector, () => {
        const formValue = signal({ email: '' });
        const config: ValidatorConfig = { type: 'required' };

        const formInstance = form(
          formValue,
          schema<typeof formValue>((path) => {
            applyValidator(config, path.email);
          })
        );
        rootFormRegistry.registerRootForm(formInstance);

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
          schema<typeof formValue>((path) => {
            applyValidator(config, path.email as FieldPath<string>);
          })
        );
        rootFormRegistry.registerRootForm(formInstance);

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
          schema<typeof formValue>((path) => {
            applyValidator(config, path.age as FieldPath<number>);
          })
        );
        rootFormRegistry.registerRootForm(formInstance);

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
          schema<typeof formValue>((path) => {
            applyValidator(config, path.age as FieldPath<number>);
          })
        );
        rootFormRegistry.registerRootForm(formInstance);

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
          schema<typeof formValue>((path) => {
            applyValidator(config, path.username as FieldPath<string>);
          })
        );
        rootFormRegistry.registerRootForm(formInstance);

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
          schema<typeof formValue>((path) => {
            applyValidator(config, path.username as FieldPath<string>);
          })
        );
        rootFormRegistry.registerRootForm(formInstance);

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
          schema<typeof formValue>((path) => {
            applyValidator(config, path.code as FieldPath<string>);
          })
        );
        rootFormRegistry.registerRootForm(formInstance);

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
          schema<typeof formValue>((path) => {
            applyValidator(config, path.zipCode as FieldPath<string>);
          })
        );
        rootFormRegistry.registerRootForm(formInstance);

        expect(formInstance().valid()).toBe(false);

        formValue.set({ zipCode: '12345' });
        expect(formInstance().valid()).toBe(true);
      });
    });
  });

  describe('Conditional Validators', () => {
    it('should apply required validator when condition is true', () => {
      runInInjectionContext(injector, () => {
        const formValue = signal({ country: 'USA', state: '' });
        const config: ValidatorConfig = {
          type: 'required',
          when: {
            type: 'fieldValue',
            fieldPath: 'country',
            operator: 'equals',
            value: 'USA',
          },
        };

        const formInstance = form(
          formValue,
          schema<typeof formValue>((path) => {
            applyValidator(config, path.state);
          })
        );
        rootFormRegistry.registerRootForm(formInstance);

        // State is required when country is USA
        expect(formInstance().valid()).toBe(false);

        formValue.set({ country: 'USA', state: 'CA' });
        expect(formInstance().valid()).toBe(true);
      });
    });

    it('should NOT apply required validator when condition is false', () => {
      runInInjectionContext(injector, () => {
        const formValue = signal({ country: 'Canada', state: '' });
        const config: ValidatorConfig = {
          type: 'required',
          when: {
            type: 'fieldValue',
            fieldPath: 'country',
            operator: 'equals',
            value: 'USA',
          },
        };

        const formInstance = form(
          formValue,
          schema<typeof formValue>((path) => {
            applyValidator(config, path.state);
          })
        );
        rootFormRegistry.registerRootForm(formInstance);

        // State is NOT required when country is not USA
        expect(formInstance().valid()).toBe(true);
      });
    });

    it('should re-evaluate conditional validator when dependencies change', () => {
      runInInjectionContext(injector, () => {
        const formValue = signal({ country: 'Canada', state: '' });
        const config: ValidatorConfig = {
          type: 'required',
          when: {
            type: 'fieldValue',
            fieldPath: 'country',
            operator: 'equals',
            value: 'USA',
          },
        };

        const formInstance = form(
          formValue,
          schema<typeof formValue>((path) => {
            applyValidator(config, path.state);
          })
        );
        rootFormRegistry.registerRootForm(formInstance);

        // Initially valid (Canada doesn't require state)
        expect(formInstance().valid()).toBe(true);

        // Change to USA - now invalid because state is empty
        formValue.set({ country: 'USA', state: '' });
        expect(formInstance().valid()).toBe(false);

        // Fill in state - now valid
        formValue.set({ country: 'USA', state: 'CA' });
        expect(formInstance().valid()).toBe(true);

        // Change back to Canada - valid even with empty state
        formValue.set({ country: 'Canada', state: '' });
        expect(formInstance().valid()).toBe(true);
      });
    });
  });

  describe('Dynamic Validators', () => {
    it('should apply validator with dynamic expression value', () => {
      runInInjectionContext(injector, () => {
        const formValue = signal({ minAge: 18, age: 16 });
        const config: ValidatorConfig = {
          type: 'min',
          value: 0, // Placeholder, will use expression
          expression: 'formValue.minAge',
        };

        const formInstance = form(
          formValue,
          schema<typeof formValue>((path) => {
            applyValidator(config, path.age as FieldPath<number>);
          })
        );
        rootFormRegistry.registerRootForm(formInstance);

        // Age 16 < minAge 18
        expect(formInstance().valid()).toBe(false);

        formValue.set({ minAge: 18, age: 20 });
        expect(formInstance().valid()).toBe(true);
      });
    });

    it('should update validation when expression dependencies change', () => {
      runInInjectionContext(injector, () => {
        const formValue = signal({ minAge: 18, age: 20 });
        const config: ValidatorConfig = {
          type: 'min',
          value: 0,
          expression: 'formValue.minAge',
        };

        const formInstance = form(
          formValue,
          schema<typeof formValue>((path) => {
            applyValidator(config, path.age as FieldPath<number>);
          })
        );
        rootFormRegistry.registerRootForm(formInstance);

        // Initially valid (20 >= 18)
        expect(formInstance().valid()).toBe(true);

        // Increase minAge to 25, age is still 20
        formValue.set({ minAge: 25, age: 20 });
        expect(formInstance().valid()).toBe(false);

        // Increase age to meet new minimum
        formValue.set({ minAge: 25, age: 30 });
        expect(formInstance().valid()).toBe(true);
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
          schema<typeof formValue>((path) => {
            applyValidators(configs, path.password as FieldPath<string>);
          })
        );
        rootFormRegistry.registerRootForm(formInstance);

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
          schema<typeof formValue>((path) => {
            applyValidators(configs, path.username as FieldPath<string>);
          })
        );
        rootFormRegistry.registerRootForm(formInstance);

        // Empty - should have errors
        expect(formInstance().valid()).toBe(false);
        expect(formInstance().errors()).toBeDefined();

        // Valid username
        formValue.set({ username: 'alice' });
        expect(formInstance().valid()).toBe(true);
        expect(formInstance().errors()).toEqual({});
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
          schema<typeof formValue>((path) => {
            applyValidator(config, path.email as FieldPath<string>);
          })
        );
        rootFormRegistry.registerRootForm(formInstance);

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
          schema<typeof formValue>((path) => {
            applyValidator(config, path.phone as FieldPath<string>);
          })
        );
        rootFormRegistry.registerRootForm(formInstance);

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
          schema<typeof formValue>((path) => {
            applyValidators(configs, path.rating as FieldPath<number>);
          })
        );
        rootFormRegistry.registerRootForm(formInstance);

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
