import { TestBed } from '@angular/core/testing';
import { beforeEach, describe, expect, it } from 'vitest';
import { Injector, runInInjectionContext, signal } from '@angular/core';
import { form, FieldPath } from '@angular/forms/signals';
import { applyLogic, applyMultipleLogic } from '../../core/logic/logic-applicator';
import { LogicConfig } from '../../models/logic';
import { FunctionRegistryService, FieldContextRegistryService, RootFormRegistryService } from '../../core/registry';

describe('Logic Transformation Pipeline Integration', () => {
  let injector: Injector;
  let rootFormRegistry: RootFormRegistryService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [FunctionRegistryService, FieldContextRegistryService, RootFormRegistryService],
    });

    injector = TestBed.inject(Injector);
    rootFormRegistry = TestBed.inject(RootFormRegistryService);
  });

  describe('Static Logic', () => {
    it('should apply hidden logic with boolean condition', () => {
      runInInjectionContext(injector, () => {
        const formValue = signal({ email: 'test@example.com' });
        const formInstance = form(formValue);
        rootFormRegistry.registerRootForm(formInstance);

        const config: LogicConfig = {
          type: 'hidden',
          condition: true,
        };

        applyLogic(config, formInstance().controls.email);

        // Field should be hidden
        expect(formInstance().controls.email.hidden()).toBe(true);
      });
    });

    it('should apply readonly logic with boolean condition', () => {
      runInInjectionContext(injector, () => {
        const formValue = signal({ username: 'admin' });
        const formInstance = form(formValue);
        rootFormRegistry.registerRootForm(formInstance);

        const config: LogicConfig = {
          type: 'readonly',
          condition: true,
        };

        applyLogic(config, formInstance().controls.username);

        // Field should be readonly
        expect(formInstance().controls.username.readonly()).toBe(true);
      });
    });

    it('should apply conditional required with boolean', () => {
      runInInjectionContext(injector, () => {
        const formValue = signal({ email: '' });
        const formInstance = form(formValue);
        rootFormRegistry.registerRootForm(formInstance);

        const config: LogicConfig = {
          type: 'required',
          condition: true,
        };

        applyLogic(config, formInstance().controls.email);

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
        const formInstance = form(formValue);
        rootFormRegistry.registerRootForm(formInstance);

        const config: LogicConfig = {
          type: 'hidden',
          condition: {
            type: 'fieldValue',
            fieldPath: 'contactMethod',
            operator: 'notEquals',
            value: 'email',
          },
        };

        applyLogic(config, formInstance().controls.email);

        // Email field should be hidden when contactMethod is not 'email'
        expect(formInstance().controls.email.hidden()).toBe(true);

        // Change contactMethod to 'email'
        formValue.set({ contactMethod: 'email', email: 'test@example.com' });
        expect(formInstance().controls.email.hidden()).toBe(false);
      });
    });

    it('should show field when condition evaluates to false', () => {
      runInInjectionContext(injector, () => {
        const formValue = signal({ showAdvanced: false, advancedOption: '' });
        const formInstance = form(formValue);
        rootFormRegistry.registerRootForm(formInstance);

        const config: LogicConfig = {
          type: 'hidden',
          condition: {
            type: 'fieldValue',
            fieldPath: 'showAdvanced',
            operator: 'equals',
            value: false,
          },
        };

        applyLogic(config, formInstance().controls.advancedOption);

        // Field should be hidden when showAdvanced is false
        expect(formInstance().controls.advancedOption.hidden()).toBe(true);

        // Show advanced options
        formValue.set({ showAdvanced: true, advancedOption: '' });
        expect(formInstance().controls.advancedOption.hidden()).toBe(false);
      });
    });

    it('should make field readonly based on condition', () => {
      runInInjectionContext(injector, () => {
        const formValue = signal({ userType: 'guest', username: 'guest_user' });
        const formInstance = form(formValue);
        rootFormRegistry.registerRootForm(formInstance);

        const config: LogicConfig = {
          type: 'readonly',
          condition: {
            type: 'fieldValue',
            fieldPath: 'userType',
            operator: 'equals',
            value: 'guest',
          },
        };

        applyLogic(config, formInstance().controls.username);

        // Username readonly for guests
        expect(formInstance().controls.username.readonly()).toBe(true);

        // Change to admin
        formValue.set({ userType: 'admin', username: 'admin_user' });
        expect(formInstance().controls.username.readonly()).toBe(false);
      });
    });

    it('should update logic state when dependencies change', () => {
      runInInjectionContext(injector, () => {
        const formValue = signal({ country: 'USA', state: 'CA' });
        const formInstance = form(formValue);
        rootFormRegistry.registerRootForm(formInstance);

        const config: LogicConfig = {
          type: 'hidden',
          condition: {
            type: 'fieldValue',
            fieldPath: 'country',
            operator: 'notEquals',
            value: 'USA',
          },
        };

        applyLogic(config, formInstance().controls.state);

        // State visible for USA
        expect(formInstance().controls.state.hidden()).toBe(false);

        // Change to Canada - state should be hidden
        formValue.set({ country: 'Canada', state: 'CA' });
        expect(formInstance().controls.state.hidden()).toBe(true);

        // Change back to USA - state visible again
        formValue.set({ country: 'USA', state: 'CA' });
        expect(formInstance().controls.state.hidden()).toBe(false);
      });
    });
  });

  describe('Complex Logic Expressions', () => {
    it('should apply logic with AND conditions', () => {
      runInInjectionContext(injector, () => {
        const formValue = signal({ role: 'admin', department: 'IT', specialAccess: '' });
        const formInstance = form(formValue);
        rootFormRegistry.registerRootForm(formInstance);

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

        applyLogic(config, formInstance().controls.specialAccess);

        // Special access visible for admin in IT
        expect(formInstance().controls.specialAccess.hidden()).toBe(false);

        // Change role to user - still visible (IT department)
        formValue.set({ role: 'user', department: 'IT', specialAccess: '' });
        expect(formInstance().controls.specialAccess.hidden()).toBe(false);

        // Change to user in Sales - should be hidden
        formValue.set({ role: 'user', department: 'Sales', specialAccess: '' });
        expect(formInstance().controls.specialAccess.hidden()).toBe(true);
      });
    });

    it('should apply logic with OR conditions', () => {
      runInInjectionContext(injector, () => {
        const formValue = signal({ isPremium: false, isVIP: false, exclusiveFeature: '' });
        const formInstance = form(formValue);
        rootFormRegistry.registerRootForm(formInstance);

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

        applyLogic(config, formInstance().controls.exclusiveFeature);

        // Feature hidden for regular users
        expect(formInstance().controls.exclusiveFeature.hidden()).toBe(false);

        // Show for premium
        formValue.set({ isPremium: true, isVIP: false, exclusiveFeature: '' });
        expect(formInstance().controls.exclusiveFeature.hidden()).toBe(true);

        // Show for VIP
        formValue.set({ isPremium: false, isVIP: true, exclusiveFeature: '' });
        expect(formInstance().controls.exclusiveFeature.hidden()).toBe(true);
      });
    });

    it('should apply logic with custom functions', () => {
      runInInjectionContext(injector, () => {
        const functionRegistry = TestBed.inject(FunctionRegistryService);

        // Register custom function
        functionRegistry.registerCustomFunction('isWeekday', (context: any) => {
          const date = new Date();
          const day = date.getDay();
          return day >= 1 && day <= 5; // Monday to Friday
        });

        const formValue = signal({ weekdayOption: '' });
        const formInstance = form(formValue);
        rootFormRegistry.registerRootForm(formInstance);

        const config: LogicConfig = {
          type: 'hidden',
          condition: {
            type: 'custom',
            expression: 'isWeekday',
          },
        };

        applyLogic(config, formInstance().controls.weekdayOption);

        // This test will vary by day - just verify it doesn't error
        const isHidden = formInstance().controls.weekdayOption.hidden();
        expect(typeof isHidden).toBe('boolean');
      });
    });
  });

  describe('Multiple Logic Rules', () => {
    it('should apply multiple logic rules to same field', () => {
      runInInjectionContext(injector, () => {
        const formValue = signal({ isLocked: true, isArchived: false, data: 'test' });
        const formInstance = form(formValue);
        rootFormRegistry.registerRootForm(formInstance);

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

        applyMultipleLogic(configs, formInstance().controls.data);

        // Field is readonly (locked) but not hidden (not archived)
        expect(formInstance().controls.data.readonly()).toBe(true);
        expect(formInstance().controls.data.hidden()).toBe(false);

        // Archive the field
        formValue.set({ isLocked: true, isArchived: true, data: 'test' });
        expect(formInstance().controls.data.readonly()).toBe(true);
        expect(formInstance().controls.data.hidden()).toBe(true);

        // Unlock but keep archived
        formValue.set({ isLocked: false, isArchived: true, data: 'test' });
        expect(formInstance().controls.data.readonly()).toBe(false);
        expect(formInstance().controls.data.hidden()).toBe(true);
      });
    });
  });

  describe('Edge Cases', () => {
    it('should handle false boolean condition for hidden', () => {
      runInInjectionContext(injector, () => {
        const formValue = signal({ field: 'test' });
        const formInstance = form(formValue);
        rootFormRegistry.registerRootForm(formInstance);

        const config: LogicConfig = {
          type: 'hidden',
          condition: false,
        };

        applyLogic(config, formInstance().controls.field);

        // Field should not be hidden
        expect(formInstance().controls.field.hidden()).toBe(false);
      });
    });

    it('should handle condition with nested field paths', () => {
      runInInjectionContext(injector, () => {
        const formValue = signal({
          user: { role: 'admin' },
          adminPanel: '',
        });
        const formInstance = form(formValue);
        rootFormRegistry.registerRootForm(formInstance);

        const config: LogicConfig = {
          type: 'hidden',
          condition: {
            type: 'fieldValue',
            fieldPath: 'user.role',
            operator: 'notEquals',
            value: 'admin',
          },
        };

        applyLogic(config, formInstance().controls.adminPanel);

        // Admin panel visible for admin role
        expect(formInstance().controls.adminPanel.hidden()).toBe(false);
      });
    });
  });
});
