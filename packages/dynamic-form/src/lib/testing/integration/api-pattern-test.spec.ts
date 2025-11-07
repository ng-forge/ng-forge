import { TestBed } from '@angular/core/testing';
import { describe, expect, it, beforeEach } from 'vitest';
import { Injector, runInInjectionContext, signal } from '@angular/core';
import { form, schema } from '@angular/forms/signals';
import { applyLogic } from '../../core/logic/logic-applicator';
import { LogicConfig } from '../../models/logic';
import { FunctionRegistryService, FieldContextRegistryService, RootFormRegistryService } from '../../core/registry';

/**
 * This test file confirms the correct API pattern for accessing
 * field-level properties (hidden, readonly) in Angular Signal Forms
 */
describe('Signal Forms API Pattern Confirmation', () => {
  let injector: Injector;
  let rootFormRegistry: RootFormRegistryService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [FunctionRegistryService, FieldContextRegistryService, RootFormRegistryService],
    });

    injector = TestBed.inject(Injector);
    rootFormRegistry = TestBed.inject(RootFormRegistryService);
  });

  it('should confirm formInstance.fieldName() API pattern works for hidden logic', () => {
    runInInjectionContext(injector, () => {
      const formValue = signal({ email: 'test@example.com' });
      const config: LogicConfig = {
        type: 'hidden',
        condition: true,
      };

      const formInstance = form(
        formValue,
        schema<typeof formValue>((path) => {
          applyLogic(config, path.email);
        })
      );
      rootFormRegistry.registerRootForm(formInstance);

      // ✅ CORRECT PATTERN: formInstance.fieldName()
      expect(formInstance.email).toBeDefined(); // Field accessor exists
      expect(typeof formInstance.email).toBe('function'); // It's a function
      expect(formInstance.email()).toBeDefined(); // Returns field state
      expect(typeof formInstance.email().hidden).toBe('function'); // hidden is a signal
      expect(formInstance.email().hidden()).toBe(true); // Can read the value

      // ❌ WRONG PATTERN: formInstance().controls (should fail or be undefined)
      const rootState = formInstance();
      expect(rootState.controls).toBeUndefined(); // No controls property in Signal Forms!
    });
  });

  it('should confirm formInstance.fieldName() API pattern works for readonly logic', () => {
    runInInjectionContext(injector, () => {
      const formValue = signal({ username: 'admin' });
      const config: LogicConfig = {
        type: 'readonly',
        condition: true,
      };

      const formInstance = form(
        formValue,
        schema<typeof formValue>((path) => {
          applyLogic(config, path.username);
        })
      );
      rootFormRegistry.registerRootForm(formInstance);

      // ✅ CORRECT PATTERN
      expect(formInstance.username().readonly()).toBe(true);

      // ❌ WRONG PATTERN (would throw if we tried to access it)
      const rootState = formInstance();
      expect(rootState.controls).toBeUndefined();
    });
  });

  it('should show both root-level and field-level access patterns', () => {
    runInInjectionContext(injector, () => {
      const formValue = signal({ email: '' });
      const hiddenConfig: LogicConfig = {
        type: 'hidden',
        condition: true,
      };

      const formInstance = form(
        formValue,
        schema<typeof formValue>((path) => {
          applyLogic(hiddenConfig, path.email);
        })
      );
      rootFormRegistry.registerRootForm(formInstance);

      // ROOT-LEVEL ACCESS: formInstance() returns root FieldState
      expect(formInstance().valid()).toBe(true); // Root validation state
      expect(formInstance().value()).toEqual({ email: '' }); // Root value

      // FIELD-LEVEL ACCESS: formInstance.fieldName() returns field FieldState
      expect(formInstance.email().hidden()).toBe(true); // Field logic state
      expect(formInstance.email().value()).toBe(''); // Field value
    });
  });

  it('should confirm conditional logic works with proper registry setup', () => {
    runInInjectionContext(injector, () => {
      const formValue = signal({ contactMethod: 'phone', email: 'test@example.com' });

      const hiddenConfig: LogicConfig = {
        type: 'hidden',
        condition: {
          type: 'fieldValue',
          fieldPath: 'contactMethod',
          operator: 'notEquals',
          value: 'email',
        },
      };

      const formInstance = form(
        formValue,
        schema<typeof formValue>((path) => {
          applyLogic(hiddenConfig, path.email);
        })
      );

      // Register AFTER form creation (like component does)
      rootFormRegistry.registerRootForm(formInstance);

      // Email field should be hidden when contactMethod is not 'email'
      expect(formInstance.email().hidden()).toBe(true);

      // Change contactMethod to 'email'
      formValue.set({ contactMethod: 'email', email: 'test@example.com' });
      expect(formInstance.email().hidden()).toBe(false);
    });
  });
});
