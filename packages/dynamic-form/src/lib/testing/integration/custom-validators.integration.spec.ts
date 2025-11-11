import { TestBed } from '@angular/core/testing';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { Injector, runInInjectionContext, signal, Component } from '@angular/core';
import { form, FieldPath, schema, FieldContext, ValidationError } from '@angular/forms/signals';
import { applyValidator } from '../../core/validation/validator-factory';
import { CustomValidatorConfig, TreeValidatorConfig, FormConfig } from '../../models';
import { FunctionRegistryService, FieldContextRegistryService, RootFormRegistryService } from '../../core/registry';
import { DynamicForm } from '../../dynamic-form.component';
import { SimpleCustomValidator, ContextAwareValidator, TreeValidator } from '../../core/validation/validator-types';

// TODO: Update these legacy tests to use the new unified CustomValidator API
// The old SimpleCustomValidator, ContextAwareValidator, and TreeValidator types
// have been replaced with a single CustomValidator type.
// See async-http-validator.spec.ts for examples of the new API.
describe.skip('Custom Validators Integration (Legacy - needs API update)', () => {
  let injector: Injector;
  let rootFormRegistry: RootFormRegistryService;
  let functionRegistry: FunctionRegistryService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [FunctionRegistryService, FieldContextRegistryService, RootFormRegistryService],
    });

    injector = TestBed.inject(Injector);
    rootFormRegistry = TestBed.inject(RootFormRegistryService);
    functionRegistry = TestBed.inject(FunctionRegistryService);
  });

  describe('Simple Custom Validators', () => {
    it('should apply simple custom validator', () => {
      runInInjectionContext(injector, () => {
        // Register a simple validator that rejects spaces
        const noSpaces: SimpleCustomValidator<string> = (value) => {
          if (typeof value === 'string' && value.includes(' ')) {
            return { kind: 'noSpaces', message: 'Spaces not allowed' };
          }
          return null;
        };
        functionRegistry.registerSimpleValidator('noSpaces', noSpaces);

        const formValue = signal({ username: 'john doe' });
        const config: CustomValidatorConfig = {
          type: 'custom',
          functionName: 'noSpaces',
        };

        const formInstance = form(
          formValue,
          schema<typeof formValue>((path) => {
            applyValidator(config, path.username as FieldPath<string>);
          })
        );
        rootFormRegistry.registerRootForm(formInstance);

        // Should be invalid due to space
        expect(formInstance().valid()).toBe(false);
        const errors = formInstance().errors();
        expect(errors).toBeDefined();

        // Remove space - should be valid
        formValue.set({ username: 'johndoe' });
        expect(formInstance().valid()).toBe(true);
      });
    });

    it('should pass entire form value to simple validator', () => {
      runInInjectionContext(injector, () => {
        // Validator that checks if password matches confirm password
        const passwordMatch: SimpleCustomValidator<string> = (value, formValue) => {
          const form = formValue as Record<string, unknown>;
          if (form.password && value !== form.password) {
            return { kind: 'passwordMismatch', message: 'Passwords do not match' };
          }
          return null;
        };
        functionRegistry.registerSimpleValidator('passwordMatch', passwordMatch);

        const formValue = signal({ password: 'secret123', confirmPassword: 'secret456' });
        const config: CustomValidatorConfig = {
          type: 'custom',
          functionName: 'passwordMatch',
        };

        const formInstance = form(
          formValue,
          schema<typeof formValue>((path) => {
            applyValidator(config, path.confirmPassword as FieldPath<string>);
          })
        );
        rootFormRegistry.registerRootForm(formInstance);

        // Should be invalid - passwords don't match
        expect(formInstance().valid()).toBe(false);

        // Update to match - should be valid
        formValue.set({ password: 'secret123', confirmPassword: 'secret123' });
        expect(formInstance().valid()).toBe(true);
      });
    });

    it('should handle simple validator with custom error message', () => {
      runInInjectionContext(injector, () => {
        const minLength3: SimpleCustomValidator<string> = (value) => {
          if (typeof value === 'string' && value.length < 3) {
            return { kind: 'minLength', message: 'Too short' };
          }
          return null;
        };
        functionRegistry.registerSimpleValidator('minLength3', minLength3);

        const formValue = signal({ code: 'ab' });
        const config: CustomValidatorConfig = {
          type: 'custom',
          functionName: 'minLength3',
          errorMessage: 'Code must be at least 3 characters',
        };

        const formInstance = form(
          formValue,
          schema<typeof formValue>((path) => {
            applyValidator(config, path.code as FieldPath<string>);
          })
        );
        rootFormRegistry.registerRootForm(formInstance);

        expect(formInstance().valid()).toBe(false);
      });
    });
  });

  describe('Context-Aware Custom Validators', () => {
    it('should apply context-aware validator with field access', () => {
      runInInjectionContext(injector, () => {
        // Validator that compares current field value to another field
        const lessThanField: ContextAwareValidator<number> = (ctx, params) => {
          const value = ctx.value();
          const otherFieldName = params?.field as string;
          const rootValue = ctx.root()().value() as Record<string, unknown>;
          const otherValue = rootValue[otherFieldName];

          if (otherValue !== undefined && value >= otherValue) {
            return {
              kind: 'notLessThan',
              message: `Must be less than ${otherFieldName}`,
            };
          }
          return null;
        };
        functionRegistry.registerContextValidator('lessThanField', lessThanField);

        const formValue = signal({ minAge: 18, maxAge: 15 });
        const config: CustomValidatorConfig = {
          type: 'custom',
          functionName: 'lessThanField',
          params: { field: 'maxAge' },
        };

        const formInstance = form(
          formValue,
          schema<typeof formValue>((path) => {
            applyValidator(config, path.minAge as FieldPath<number>);
          })
        );
        rootFormRegistry.registerRootForm(formInstance);

        // minAge (18) >= maxAge (15) - should be invalid
        expect(formInstance().valid()).toBe(false);

        // Fix the values
        formValue.set({ minAge: 15, maxAge: 18 });
        expect(formInstance().valid()).toBe(true);
      });
    });

    it('should provide field state in context', () => {
      runInInjectionContext(injector, () => {
        let capturedContext: FieldContext<string> | null = null;

        const contextCapture: ContextAwareValidator<string> = (ctx) => {
          capturedContext = ctx;
          return null;
        };
        functionRegistry.registerContextValidator('contextCapture', contextCapture);

        const formValue = signal({ email: 'test@example.com' });
        const config: CustomValidatorConfig = {
          type: 'custom',
          functionName: 'contextCapture',
        };

        const formInstance = form(
          formValue,
          schema<typeof formValue>((path) => {
            applyValidator(config, path.email as FieldPath<string>);
          })
        );
        rootFormRegistry.registerRootForm(formInstance);

        // Trigger validation
        formInstance().valid();

        // Check that context was provided
        expect(capturedContext).not.toBeNull();
        if (capturedContext) {
          expect(capturedContext.value()).toBe('test@example.com');
        }
      });
    });
  });

  describe('Tree Validators', () => {
    it('should apply tree validator for cross-field validation', () => {
      runInInjectionContext(injector, () => {
        // Tree validator that checks if passwords match
        const passwordsMatch: TreeValidator = (ctx) => {
          const formValue = ctx.value() as Record<string, unknown>;
          const password = formValue.password;
          const confirmPassword = formValue.confirmPassword;

          if (password && confirmPassword && password !== confirmPassword) {
            // Return error targeting the confirmPassword field
            return {
              kind: 'passwordMismatch',
              message: 'Passwords must match',
            };
          }
          return null;
        };
        functionRegistry.registerTreeValidator('passwordsMatch', passwordsMatch);

        const formValue = signal({
          password: 'secret123',
          confirmPassword: 'secret456',
        });

        const config: TreeValidatorConfig = {
          type: 'customTree',
          functionName: 'passwordsMatch',
        };

        const formInstance = form(
          formValue,
          schema<typeof formValue>((path) => {
            applyValidator(config, path as any);
          })
        );
        rootFormRegistry.registerRootForm(formInstance);

        // Should be invalid - passwords don't match
        expect(formInstance().valid()).toBe(false);

        // Update to match
        formValue.set({
          password: 'secret123',
          confirmPassword: 'secret123',
        });
        expect(formInstance().valid()).toBe(true);
      });
    });

    it('should support multiple errors from tree validator', () => {
      runInInjectionContext(injector, () => {
        // Tree validator that returns multiple errors
        const validateAddressFields: TreeValidator = (ctx) => {
          const formValue = ctx.value() as Record<string, unknown>;
          const errors: ValidationError[] = [];

          if (!formValue.street) {
            errors.push({
              kind: 'required',
              message: 'Street is required',
            });
          }

          if (!formValue.city) {
            errors.push({
              kind: 'required',
              message: 'City is required',
            });
          }

          return errors.length > 0 ? errors : null;
        };
        functionRegistry.registerTreeValidator('validateAddressFields', validateAddressFields);

        const formValue = signal({
          street: '',
          city: '',
          zipCode: '12345',
        });

        const config: TreeValidatorConfig = {
          type: 'customTree',
          functionName: 'validateAddressFields',
        };

        const formInstance = form(
          formValue,
          schema<typeof formValue>((path) => {
            applyValidator(config, path as any);
          })
        );
        rootFormRegistry.registerRootForm(formInstance);

        // Should be invalid - both fields missing
        expect(formInstance().valid()).toBe(false);

        // Fix one field
        formValue.set({
          street: '123 Main St',
          city: '',
          zipCode: '12345',
        });
        expect(formInstance().valid()).toBe(false);

        // Fix both fields
        formValue.set({
          street: '123 Main St',
          city: 'Springfield',
          zipCode: '12345',
        });
        expect(formInstance().valid()).toBe(true);
      });
    });
  });

  describe('Auto-Detection (Simple to Context-Aware)', () => {
    it('should automatically adapt simple validator to work with context', () => {
      runInInjectionContext(injector, () => {
        // Register only a simple validator
        const noDigits: SimpleCustomValidator<string> = (value) => {
          if (typeof value === 'string' && /\d/.test(value)) {
            return { kind: 'noDigits', message: 'Digits not allowed' };
          }
          return null;
        };
        functionRegistry.registerSimpleValidator('noDigits', noDigits);

        const formValue = signal({ username: 'user123' });
        const config: CustomValidatorConfig = {
          type: 'custom',
          functionName: 'noDigits', // Will auto-detect and adapt
        };

        const formInstance = form(
          formValue,
          schema<typeof formValue>((path) => {
            applyValidator(config, path.username as FieldPath<string>);
          })
        );
        rootFormRegistry.registerRootForm(formInstance);

        // Should be invalid - contains digits
        expect(formInstance().valid()).toBe(false);

        // Remove digits
        formValue.set({ username: 'username' });
        expect(formInstance().valid()).toBe(true);
      });
    });

    it('should prefer context-aware validator over simple validator', () => {
      runInInjectionContext(injector, () => {
        let simpleValidatorCalled = false;
        let contextValidatorCalled = false;

        // Register both types with same name
        const simpleValidator: SimpleCustomValidator<string> = () => {
          simpleValidatorCalled = true;
          return null;
        };

        const contextValidator: ContextAwareValidator<string> = () => {
          contextValidatorCalled = true;
          return null;
        };

        functionRegistry.registerSimpleValidator('testValidator', simpleValidator);
        functionRegistry.registerContextValidator('testValidator', contextValidator);

        const formValue = signal({ field: 'test' });
        const config: CustomValidatorConfig = {
          type: 'custom',
          functionName: 'testValidator',
        };

        const formInstance = form(
          formValue,
          schema<typeof formValue>((path) => {
            applyValidator(config, path.field as FieldPath<string>);
          })
        );
        rootFormRegistry.registerRootForm(formInstance);

        // Trigger validation
        formInstance().valid();

        // Context-aware validator should be called, not simple
        expect(contextValidatorCalled).toBe(true);
        expect(simpleValidatorCalled).toBe(false);
      });
    });
  });

  describe('Conditional Custom Validators', () => {
    it('should apply custom validator conditionally', () => {
      runInInjectionContext(injector, () => {
        const minLength5: SimpleCustomValidator<string> = (value) => {
          if (typeof value === 'string' && value.length < 5) {
            return { kind: 'minLength', message: 'Must be at least 5 characters' };
          }
          return null;
        };
        functionRegistry.registerSimpleValidator('minLength5', minLength5);

        const formValue = signal({ country: 'USA', zipCode: '123' });
        const config: CustomValidatorConfig = {
          type: 'custom',
          functionName: 'minLength5',
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
            applyValidator(config, path.zipCode as FieldPath<string>);
          })
        );
        rootFormRegistry.registerRootForm(formInstance);

        // Should be invalid - USA requires 5 digit zip
        expect(formInstance().valid()).toBe(false);

        // Change country - validator no longer applies
        formValue.set({ country: 'Canada', zipCode: '123' });
        expect(formInstance().valid()).toBe(true);

        // Change back to USA - validator applies again
        formValue.set({ country: 'USA', zipCode: '123' });
        expect(formInstance().valid()).toBe(false);

        // Fix zip code
        formValue.set({ country: 'USA', zipCode: '12345' });
        expect(formInstance().valid()).toBe(true);
      });
    });
  });

  describe('SignalFormsConfig Registration', () => {
    it('should register validators from signalFormsConfig', () => {
      const noSpaces: SimpleCustomValidator<string> = (value) => {
        if (typeof value === 'string' && value.includes(' ')) {
          return { kind: 'noSpaces', message: 'Spaces not allowed' };
        }
        return null;
      };

      const config: FormConfig = {
        fields: [
          {
            type: 'input',
            key: 'username',
            label: 'Username',
            validators: [{ type: 'custom', functionName: 'noSpaces' }],
          },
        ],
        signalFormsConfig: {
          simpleValidators: {
            noSpaces,
          },
        },
      };

      @Component({
        selector: 'test-component',
        template: '<dynamic-form [config]="config" />',
        imports: [DynamicForm],
      })
      class TestComponent {
        config = config;
      }

      const fixture = TestBed.createComponent(TestComponent);

      // Access the DynamicForm component
      const dynamicForm = fixture.debugElement.children[0].componentInstance as DynamicForm;
      const registry = (dynamicForm as unknown).functionRegistry as FunctionRegistryService;

      // Check that validator was registered
      const registeredValidator = registry.getSimpleValidator('noSpaces');
      expect(registeredValidator).toBeDefined();
      expect(registeredValidator).toBe(noSpaces);
    });

    it('should register multiple validator types from signalFormsConfig', () => {
      const simpleValidator: SimpleCustomValidator<string> = (_value) => null;
      const contextValidator: ContextAwareValidator<string> = (_ctx) => null;
      const treeValidator: TreeValidator = (_ctx) => null;

      const config: FormConfig = {
        fields: [],
        signalFormsConfig: {
          simpleValidators: {
            simple: simpleValidator,
          },
          contextValidators: {
            context: contextValidator,
          },
          treeValidators: {
            tree: treeValidator,
          },
        },
      };

      @Component({
        selector: 'test-component',
        template: '<dynamic-form [config]="config" />',
        imports: [DynamicForm],
      })
      class TestComponent {
        config = config;
      }

      const fixture = TestBed.createComponent(TestComponent);
      const dynamicForm = fixture.debugElement.children[0].componentInstance as DynamicForm;
      const registry = (dynamicForm as unknown).functionRegistry as FunctionRegistryService;

      // Check all validators were registered
      expect(registry.getSimpleValidator('simple')).toBe(simpleValidator);
      expect(registry.getContextValidator('context')).toBe(contextValidator);
      expect(registry.getTreeValidator('tree')).toBe(treeValidator);
    });

    it('should clear validators when config changes', () => {
      const validator1: SimpleCustomValidator<string> = (_value) => null;
      const validator2: SimpleCustomValidator<string> = (_value) => null;

      const config1: FormConfig = {
        fields: [],
        signalFormsConfig: {
          simpleValidators: { validator1 },
        },
      };

      const config2: FormConfig = {
        fields: [],
        signalFormsConfig: {
          simpleValidators: { validator2 },
        },
      };

      @Component({
        selector: 'test-component',
        template: '<dynamic-form [config]="config" />',
        imports: [DynamicForm],
      })
      class TestComponent {
        config = signal(config1);
      }

      const fixture = TestBed.createComponent(TestComponent);
      const componentInstance = fixture.componentInstance;
      const dynamicForm = fixture.debugElement.children[0].componentInstance as DynamicForm;
      const registry = (dynamicForm as unknown).functionRegistry as FunctionRegistryService;

      // Initially validator1 is registered
      expect(registry.getSimpleValidator('validator1')).toBe(validator1);
      expect(registry.getSimpleValidator('validator2')).toBeUndefined();

      // Change config
      componentInstance.config.set(config2);
      fixture.detectChanges();

      // Now validator2 is registered, validator1 is cleared
      expect(registry.getSimpleValidator('validator1')).toBeUndefined();
      expect(registry.getSimpleValidator('validator2')).toBe(validator2);
    });
  });

  describe('Error Handling', () => {
    it('should warn when custom validator is not found', () => {
      runInInjectionContext(injector, () => {
        const consoleWarnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {
          // Mock implementation to suppress console warnings during test
        });

        const formValue = signal({ username: 'test' });
        const config: CustomValidatorConfig = {
          type: 'custom',
          functionName: 'nonExistentValidator',
        };

        const formInstance = form(
          formValue,
          schema<typeof formValue>((path) => {
            applyValidator(config, path.username as FieldPath<string>);
          })
        );
        rootFormRegistry.registerRootForm(formInstance);

        // Should not throw, but should warn
        expect(() => formInstance().valid()).not.toThrow();
        expect(consoleWarnSpy).toHaveBeenCalledWith(expect.stringContaining('Custom validator "nonExistentValidator" not found'));

        consoleWarnSpy.mockRestore();
      });
    });

    it('should handle validator that returns null (valid)', () => {
      runInInjectionContext(injector, () => {
        const alwaysValid: SimpleCustomValidator<string> = () => null;
        functionRegistry.registerSimpleValidator('alwaysValid', alwaysValid);

        const formValue = signal({ field: 'anything' });
        const config: CustomValidatorConfig = {
          type: 'custom',
          functionName: 'alwaysValid',
        };

        const formInstance = form(
          formValue,
          schema<typeof formValue>((path) => {
            applyValidator(config, path.field as FieldPath<string>);
          })
        );
        rootFormRegistry.registerRootForm(formInstance);

        expect(formInstance().valid()).toBe(true);
      });
    });

    it('should handle validator that returns error object', () => {
      runInInjectionContext(injector, () => {
        const alwaysInvalid: SimpleCustomValidator<string> = () => ({
          kind: 'invalid',
          message: 'Always invalid',
        });
        functionRegistry.registerSimpleValidator('alwaysInvalid', alwaysInvalid);

        const formValue = signal({ field: 'anything' });
        const config: CustomValidatorConfig = {
          type: 'custom',
          functionName: 'alwaysInvalid',
        };

        const formInstance = form(
          formValue,
          schema<typeof formValue>((path) => {
            applyValidator(config, path.field as FieldPath<string>);
          })
        );
        rootFormRegistry.registerRootForm(formInstance);

        expect(formInstance().valid()).toBe(false);
      });
    });
  });

  describe('Parameters', () => {
    it('should pass parameters to custom validator', () => {
      runInInjectionContext(injector, () => {
        const minLengthValidator: ContextAwareValidator<string> = (ctx, params) => {
          const value = ctx.value();
          const minLength = (params?.minLength as number) || 0;

          if (typeof value === 'string' && value.length < minLength) {
            return {
              kind: 'minLength',
              message: `Must be at least ${minLength} characters`,
            };
          }
          return null;
        };
        functionRegistry.registerContextValidator('minLength', minLengthValidator);

        const formValue = signal({ password: 'abc' });
        const config: CustomValidatorConfig = {
          type: 'custom',
          functionName: 'minLength',
          params: { minLength: 8 },
        };

        const formInstance = form(
          formValue,
          schema<typeof formValue>((path) => {
            applyValidator(config, path.password as FieldPath<string>);
          })
        );
        rootFormRegistry.registerRootForm(formInstance);

        // Should be invalid - too short
        expect(formInstance().valid()).toBe(false);

        // Long enough
        formValue.set({ password: 'password123' });
        expect(formInstance().valid()).toBe(true);
      });
    });

    it('should handle complex parameters', () => {
      runInInjectionContext(injector, () => {
        const rangeValidator: ContextAwareValidator<number> = (ctx, params) => {
          const value = ctx.value();
          const min = (params?.min as number) || 0;
          const max = (params?.max as number) || 100;

          if (value < min || value > max) {
            return {
              kind: 'outOfRange',
              message: `Must be between ${min} and ${max}`,
            };
          }
          return null;
        };
        functionRegistry.registerContextValidator('range', rangeValidator);

        const formValue = signal({ age: 150 });
        const config: CustomValidatorConfig = {
          type: 'custom',
          functionName: 'range',
          params: {
            min: 0,
            max: 120,
          },
        };

        const formInstance = form(
          formValue,
          schema<typeof formValue>((path) => {
            applyValidator(config, path.age as FieldPath<number>);
          })
        );
        rootFormRegistry.registerRootForm(formInstance);

        // Out of range
        expect(formInstance().valid()).toBe(false);

        // Within range
        formValue.set({ age: 25 });
        expect(formInstance().valid()).toBe(true);
      });
    });
  });
});
