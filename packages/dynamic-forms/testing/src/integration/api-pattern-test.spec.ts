import { TestBed } from '@angular/core/testing';
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

  it('should confirm formInstance.fieldName() API pattern works for hidden logic', () => {
    runInInjectionContext(injector, () => {
      const formValue = signal({ email: 'test@example.com' });
      const config: LogicConfig = {
        type: 'hidden',
        condition: true,
      };

      const formInstance = form(
        formValue,
        schema<{ email: string }>((path) => {
          applyLogic(config, path.email);
        }),
      );
      mockFormSignal.set(formInstance);

      // ✅ CORRECT PATTERN: formInstance.fieldName()
      expect(formInstance.email).toBeDefined(); // Field accessor exists
      expect(typeof formInstance.email).toBe('function'); // It's a function
      expect(formInstance.email()).toBeDefined(); // Returns field state
      expect(typeof formInstance.email().hidden).toBe('function'); // hidden is a signal
      expect(formInstance.email().hidden()).toBe(true); // Can read the value

      // ❌ WRONG PATTERN: formInstance().controls (should fail or be undefined)
      const rootState = formInstance();
      expect('controls' in rootState).toBe(false); // No controls property in Signal Forms!
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
        schema<{ username: string }>((path) => {
          applyLogic(config, path.username);
        }),
      );
      mockFormSignal.set(formInstance);

      // ✅ CORRECT PATTERN
      expect(formInstance.username().readonly()).toBe(true);

      // ❌ WRONG PATTERN (would throw if we tried to access it)
      const rootState = formInstance();
      expect('controls' in rootState).toBe(false);
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
        schema<{ email: string }>((path) => {
          applyLogic(hiddenConfig, path.email);
        }),
      );
      mockFormSignal.set(formInstance);

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
      // Register the form value signal BEFORE form creation for cross-field logic
      mockEntity.set(formValue() as Record<string, unknown>);

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
        schema<{ contactMethod: string; email: string }>((path) => {
          applyLogic(hiddenConfig, path.email);
        }),
      );

      // Register AFTER form creation (like component does)
      mockFormSignal.set(formInstance);

      // Email field should be hidden when contactMethod is not 'email'
      expect(formInstance.email().hidden()).toBe(true);

      // Change contactMethod to 'email'
      formValue.set({ contactMethod: 'email', email: 'test@example.com' });
      expect(formInstance.email().hidden()).toBe(false);
    });
  });
});
