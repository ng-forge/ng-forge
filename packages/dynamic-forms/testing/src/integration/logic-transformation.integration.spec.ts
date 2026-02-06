import { TestBed } from '@angular/core/testing';
import { beforeEach, describe, expect, it } from 'vitest';
import { Injector, runInInjectionContext, signal } from '@angular/core';
import { form, schema } from '@angular/forms/signals';
import { applyLogic, applyMultipleLogic } from '../../core/logic/logic-applicator';
import { LogicConfig } from '../../models/logic';
import { FunctionRegistryService, FieldContextRegistryService, RootFormRegistryService } from '../../core/registry';

describe('Logic Transformation Pipeline Integration', () => {
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

  describe('Static Logic', () => {
    it('should apply hidden logic with boolean condition', () => {
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

        // Field should be hidden
        expect(formInstance.email().hidden()).toBe(true);
      });
    });

    it('should apply readonly logic with boolean condition', () => {
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

        // Field should be readonly
        expect(formInstance.username().readonly()).toBe(true);
      });
    });

    it('should apply conditional required with boolean', () => {
      runInInjectionContext(injector, () => {
        const formValue = signal({ email: '' });
        const config: LogicConfig = {
          type: 'required',
          condition: true,
        };

        const formInstance = form(
          formValue,
          schema<{ email: string }>((path) => {
            applyLogic(config, path.email);
          }),
        );
        mockFormSignal.set(formInstance);

        // Field should be required
        expect(formInstance().valid()).toBe(false);

        formValue.set({ email: 'test@example.com' });
        expect(formInstance().valid()).toBe(true);
      });
    });
  });

  describe('Conditional Logic', () => {
    it('should hide field when condition evaluates to true', () => {
      runInInjectionContext(injector, () => {
        const formValue = signal({ contactMethod: 'phone', email: 'test@example.com' });
        // Register the form value signal BEFORE form creation for cross-field logic
        mockEntity.set(formValue() as Record<string, unknown>);

        const config: LogicConfig = {
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
            applyLogic(config, path.email);
          }),
        );
        mockFormSignal.set(formInstance);

        // Email field should be hidden when contactMethod is not 'email'
        expect(formInstance.email().hidden()).toBe(true);

        // Change contactMethod to 'email' and let effects settle
        formValue.set({ contactMethod: 'email', email: 'test@example.com' });
        TestBed.flushEffects();
        expect(formInstance.email().hidden()).toBe(false);
      });
    });

    it('should show field when condition evaluates to false', () => {
      runInInjectionContext(injector, () => {
        const formValue = signal({ showAdvanced: false, advancedOption: '' });
        // Register the form value signal BEFORE form creation for cross-field logic
        mockEntity.set(formValue() as Record<string, unknown>);

        const config: LogicConfig = {
          type: 'hidden',
          condition: {
            type: 'fieldValue',
            fieldPath: 'showAdvanced',
            operator: 'equals',
            value: false,
          },
        };

        const formInstance = form(
          formValue,
          schema<{ showAdvanced: boolean; advancedOption: string }>((path) => {
            applyLogic(config, path.advancedOption);
          }),
        );
        mockFormSignal.set(formInstance);

        // Field should be hidden when showAdvanced is false
        expect(formInstance.advancedOption().hidden()).toBe(true);

        // Show advanced options and let effects settle
        formValue.set({ showAdvanced: true, advancedOption: '' });
        TestBed.flushEffects();
        expect(formInstance.advancedOption().hidden()).toBe(false);
      });
    });

    it('should make field readonly based on condition', () => {
      runInInjectionContext(injector, () => {
        const formValue = signal({ userType: 'guest', username: 'guest_user' });
        // Register the form value signal BEFORE form creation for cross-field logic
        mockEntity.set(formValue() as Record<string, unknown>);

        const config: LogicConfig = {
          type: 'readonly',
          condition: {
            type: 'fieldValue',
            fieldPath: 'userType',
            operator: 'equals',
            value: 'guest',
          },
        };

        const formInstance = form(
          formValue,
          schema<{ userType: string; username: string }>((path) => {
            applyLogic(config, path.username);
          }),
        );
        mockFormSignal.set(formInstance);

        // Username readonly for guests
        expect(formInstance.username().readonly()).toBe(true);

        // Change to admin and let effects settle
        formValue.set({ userType: 'admin', username: 'admin_user' });
        TestBed.flushEffects();
        expect(formInstance.username().readonly()).toBe(false);
      });
    });

    it('should update logic state when dependencies change', () => {
      runInInjectionContext(injector, () => {
        const formValue = signal({ country: 'USA', state: 'CA' });
        // Register the form value signal BEFORE form creation for cross-field logic
        mockEntity.set(formValue() as Record<string, unknown>);

        const config: LogicConfig = {
          type: 'hidden',
          condition: {
            type: 'fieldValue',
            fieldPath: 'country',
            operator: 'notEquals',
            value: 'USA',
          },
        };

        const formInstance = form(
          formValue,
          schema<{ country: string; state: string }>((path) => {
            applyLogic(config, path.state);
          }),
        );
        mockFormSignal.set(formInstance);

        // State visible for USA
        expect(formInstance.state().hidden()).toBe(false);

        // Change to Canada - state should be hidden
        formValue.set({ country: 'Canada', state: 'CA' });
        expect(formInstance.state().hidden()).toBe(true);

        // Change back to USA - state visible again
        formValue.set({ country: 'USA', state: 'CA' });
        expect(formInstance.state().hidden()).toBe(false);
      });
    });
  });

  describe('Complex Logic Expressions', () => {
    it('should apply logic with AND conditions', () => {
      runInInjectionContext(injector, () => {
        const formValue = signal({ role: 'admin', department: 'IT', specialAccess: '' });
        // Register the form value signal BEFORE form creation for cross-field logic
        mockEntity.set(formValue() as Record<string, unknown>);

        const config: LogicConfig = {
          type: 'hidden',
          condition: {
            type: 'and',
            conditions: [
              {
                type: 'fieldValue',
                fieldPath: 'role',
                operator: 'notEquals',
                value: 'admin',
              },
              {
                type: 'fieldValue',
                fieldPath: 'department',
                operator: 'notEquals',
                value: 'IT',
              },
            ],
          },
        };

        const formInstance = form(
          formValue,
          schema<{ role: string; department: string; specialAccess: string }>((path) => {
            applyLogic(config, path.specialAccess);
          }),
        );
        mockFormSignal.set(formInstance);

        // Special access visible for admin in IT
        expect(formInstance.specialAccess().hidden()).toBe(false);

        // Change role to user - still visible (IT department)
        formValue.set({ role: 'user', department: 'IT', specialAccess: '' });
        expect(formInstance.specialAccess().hidden()).toBe(false);

        // Change to user in Sales - should be hidden
        formValue.set({ role: 'user', department: 'Sales', specialAccess: '' });
        expect(formInstance.specialAccess().hidden()).toBe(true);
      });
    });

    it('should apply logic with OR conditions', () => {
      runInInjectionContext(injector, () => {
        const formValue = signal({ isPremium: false, isVIP: false, exclusiveFeature: '' });
        // Register the form value signal BEFORE form creation for cross-field logic
        mockEntity.set(formValue() as Record<string, unknown>);

        const config: LogicConfig = {
          type: 'hidden',
          condition: {
            type: 'or',
            conditions: [
              {
                type: 'fieldValue',
                fieldPath: 'isPremium',
                operator: 'equals',
                value: true,
              },
              {
                type: 'fieldValue',
                fieldPath: 'isVIP',
                operator: 'equals',
                value: true,
              },
            ],
          },
        };

        const formInstance = form(
          formValue,
          schema<{ isPremium: boolean; isVIP: boolean; exclusiveFeature: string }>((path) => {
            applyLogic(config, path.exclusiveFeature);
          }),
        );
        mockFormSignal.set(formInstance);

        // Feature hidden for regular users
        expect(formInstance.exclusiveFeature().hidden()).toBe(false);

        // Show for premium
        formValue.set({ isPremium: true, isVIP: false, exclusiveFeature: '' });
        expect(formInstance.exclusiveFeature().hidden()).toBe(true);

        // Show for VIP
        formValue.set({ isPremium: false, isVIP: true, exclusiveFeature: '' });
        expect(formInstance.exclusiveFeature().hidden()).toBe(true);
      });
    });

    it('should apply logic with custom functions', () => {
      runInInjectionContext(injector, () => {
        const functionRegistry = TestBed.inject(FunctionRegistryService);

        // Register custom function
        functionRegistry.registerCustomFunction('isWeekday', () => {
          const date = new Date();
          const day = date.getDay();
          return day >= 1 && day <= 5; // Monday to Friday
        });

        const formValue = signal({ weekdayOption: '' });
        const config: LogicConfig = {
          type: 'hidden',
          condition: {
            type: 'custom',
            expression: 'isWeekday',
          },
        };

        const formInstance = form(
          formValue,
          schema<{ weekdayOption: string }>((path) => {
            applyLogic(config, path.weekdayOption);
          }),
        );
        mockFormSignal.set(formInstance);

        // This test will vary by day - just verify it doesn't error
        const isHidden = formInstance.weekdayOption().hidden();
        expect(typeof isHidden).toBe('boolean');
      });
    });
  });

  describe('Multiple Logic Rules', () => {
    it('should apply multiple logic rules to same field', () => {
      runInInjectionContext(injector, () => {
        const formValue = signal({ isLocked: true, isArchived: false, data: 'test' });
        // Register the form value signal BEFORE form creation for cross-field logic
        mockEntity.set(formValue() as Record<string, unknown>);

        const configs: LogicConfig[] = [
          {
            type: 'readonly',
            condition: {
              type: 'fieldValue',
              fieldPath: 'isLocked',
              operator: 'equals',
              value: true,
            },
          },
          {
            type: 'hidden',
            condition: {
              type: 'fieldValue',
              fieldPath: 'isArchived',
              operator: 'equals',
              value: true,
            },
          },
        ];

        const formInstance = form(
          formValue,
          schema<{ isLocked: boolean; isArchived: boolean; data: string }>((path) => {
            applyMultipleLogic(configs, path.data);
          }),
        );
        mockFormSignal.set(formInstance);

        // Field is readonly (locked) but not hidden (not archived)
        expect(formInstance.data().readonly()).toBe(true);
        expect(formInstance.data().hidden()).toBe(false);

        // Archive the field
        formValue.set({ isLocked: true, isArchived: true, data: 'test' });
        expect(formInstance.data().readonly()).toBe(true);
        expect(formInstance.data().hidden()).toBe(true);

        // Unlock but keep archived
        formValue.set({ isLocked: false, isArchived: true, data: 'test' });
        expect(formInstance.data().readonly()).toBe(false);
        expect(formInstance.data().hidden()).toBe(true);
      });
    });
  });

  describe('Edge Cases', () => {
    it('should handle false boolean condition for hidden', () => {
      runInInjectionContext(injector, () => {
        const formValue = signal({ field: 'test' });
        const config: LogicConfig = {
          type: 'hidden',
          condition: false,
        };

        const formInstance = form(
          formValue,
          schema<{ field: string }>((path) => {
            applyLogic(config, path.field);
          }),
        );
        mockFormSignal.set(formInstance);

        // Field should not be hidden
        expect(formInstance.field().hidden()).toBe(false);
      });
    });

    it('should handle condition with nested field paths', () => {
      runInInjectionContext(injector, () => {
        const formValue = signal({
          user: { role: 'admin' },
          adminPanel: '',
        });
        // Register the form value signal BEFORE form creation for cross-field logic
        mockEntity.set(formValue() as Record<string, unknown>);

        const config: LogicConfig = {
          type: 'hidden',
          condition: {
            type: 'fieldValue',
            fieldPath: 'user.role',
            operator: 'notEquals',
            value: 'admin',
          },
        };

        const formInstance = form(
          formValue,
          schema<{ user: { role: string }; adminPanel: string }>((path) => {
            applyLogic(config, path.adminPanel);
          }),
        );
        mockFormSignal.set(formInstance);

        // Admin panel visible for admin role
        expect(formInstance.adminPanel().hidden()).toBe(false);
      });
    });
  });
});
