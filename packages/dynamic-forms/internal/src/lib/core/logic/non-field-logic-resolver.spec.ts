import { resolveNonFieldHidden, resolveNonFieldDisabled, NonFieldLogicContext } from './non-field-logic-resolver';
import { LogicConfig } from '../../models/logic';
import { vi } from 'vitest';

describe('Non-Field Logic Resolvers', () => {
  // Create a mock form that satisfies the FieldTree interface
  function createMockForm(formValue: Record<string, unknown> = {}) {
    return vi.fn(() => ({
      value: vi.fn().mockReturnValue(formValue),
      valid: vi.fn().mockReturnValue(true),
      submitting: vi.fn().mockReturnValue(false),
    }));
  }

  describe('resolveNonFieldHidden', () => {
    describe('explicit hidden value', () => {
      it('should return true when explicitValue is true', () => {
        const ctx: NonFieldLogicContext = {
          form: createMockForm(),
          explicitValue: true,
        };

        const result = resolveNonFieldHidden(ctx);
        expect(result()).toBe(true);
      });

      it('should return false when explicitValue is false and no logic', () => {
        const ctx: NonFieldLogicContext = {
          form: createMockForm(),
          explicitValue: false,
        };

        const result = resolveNonFieldHidden(ctx);
        expect(result()).toBe(false);
      });

      it('should return false when no explicitValue and no logic', () => {
        const ctx: NonFieldLogicContext = {
          form: createMockForm(),
        };

        const result = resolveNonFieldHidden(ctx);
        expect(result()).toBe(false);
      });
    });

    describe('boolean condition logic', () => {
      it('should return true when hidden logic condition is true', () => {
        const ctx: NonFieldLogicContext = {
          form: createMockForm(),
          fieldLogic: [{ type: 'hidden', condition: true }],
        };

        const result = resolveNonFieldHidden(ctx);
        expect(result()).toBe(true);
      });

      it('should return false when hidden logic condition is false', () => {
        const ctx: NonFieldLogicContext = {
          form: createMockForm(),
          fieldLogic: [{ type: 'hidden', condition: false }],
        };

        const result = resolveNonFieldHidden(ctx);
        expect(result()).toBe(false);
      });

      it('should return true if ANY hidden condition is true (OR logic)', () => {
        const ctx: NonFieldLogicContext = {
          form: createMockForm(),
          fieldLogic: [
            { type: 'hidden', condition: false },
            { type: 'hidden', condition: true },
            { type: 'hidden', condition: false },
          ],
        };

        const result = resolveNonFieldHidden(ctx);
        expect(result()).toBe(true);
      });

      it('should return false when all hidden conditions are false', () => {
        const ctx: NonFieldLogicContext = {
          form: createMockForm(),
          fieldLogic: [
            { type: 'hidden', condition: false },
            { type: 'hidden', condition: false },
          ],
        };

        const result = resolveNonFieldHidden(ctx);
        expect(result()).toBe(false);
      });
    });

    describe('conditional expression logic', () => {
      it('should evaluate fieldValue expression and return true when condition met', () => {
        const ctx: NonFieldLogicContext = {
          form: createMockForm({ status: 'hidden' }),
          formValue: { status: 'hidden' },
          fieldLogic: [
            {
              type: 'hidden',
              condition: {
                type: 'fieldValue',
                fieldPath: 'status',
                operator: 'equals',
                value: 'hidden',
              },
            },
          ],
        };

        const result = resolveNonFieldHidden(ctx);
        expect(result()).toBe(true);
      });

      it('should evaluate fieldValue expression and return false when condition not met', () => {
        const ctx: NonFieldLogicContext = {
          form: createMockForm({ status: 'visible' }),
          formValue: { status: 'visible' },
          fieldLogic: [
            {
              type: 'hidden',
              condition: {
                type: 'fieldValue',
                fieldPath: 'status',
                operator: 'equals',
                value: 'hidden',
              },
            },
          ],
        };

        const result = resolveNonFieldHidden(ctx);
        expect(result()).toBe(false);
      });

      it('should evaluate javascript expression syntax', () => {
        const ctx: NonFieldLogicContext = {
          form: createMockForm({ showField: false }),
          formValue: { showField: false },
          fieldLogic: [
            {
              type: 'hidden',
              condition: {
                type: 'javascript',
                expression: '!showField',
              },
            },
          ],
        };

        const result = resolveNonFieldHidden(ctx);
        expect(result()).toBe(true);
      });
    });

    describe('ignores non-hidden logic types', () => {
      it('should ignore disabled logic when resolving hidden', () => {
        const ctx: NonFieldLogicContext = {
          form: createMockForm(),
          fieldLogic: [
            { type: 'disabled', condition: true },
            { type: 'readonly', condition: true },
            { type: 'required', condition: true },
          ] as LogicConfig[],
        };

        const result = resolveNonFieldHidden(ctx);
        expect(result()).toBe(false);
      });
    });

    describe('explicit value takes precedence', () => {
      it('should return true when explicitValue is true even with false logic', () => {
        const ctx: NonFieldLogicContext = {
          form: createMockForm(),
          explicitValue: true,
          fieldLogic: [{ type: 'hidden', condition: false }],
        };

        const result = resolveNonFieldHidden(ctx);
        expect(result()).toBe(true);
      });
    });
  });

  describe('resolveNonFieldDisabled', () => {
    describe('explicit disabled value', () => {
      it('should return true when explicitValue is true', () => {
        const ctx: NonFieldLogicContext = {
          form: createMockForm(),
          explicitValue: true,
        };

        const result = resolveNonFieldDisabled(ctx);
        expect(result()).toBe(true);
      });

      it('should return false when explicitValue is false and no logic', () => {
        const ctx: NonFieldLogicContext = {
          form: createMockForm(),
          explicitValue: false,
        };

        const result = resolveNonFieldDisabled(ctx);
        expect(result()).toBe(false);
      });

      it('should return false when no explicitValue and no logic', () => {
        const ctx: NonFieldLogicContext = {
          form: createMockForm(),
        };

        const result = resolveNonFieldDisabled(ctx);
        expect(result()).toBe(false);
      });
    });

    describe('boolean condition logic', () => {
      it('should return true when disabled logic condition is true', () => {
        const ctx: NonFieldLogicContext = {
          form: createMockForm(),
          fieldLogic: [{ type: 'disabled', condition: true }],
        };

        const result = resolveNonFieldDisabled(ctx);
        expect(result()).toBe(true);
      });

      it('should return false when disabled logic condition is false', () => {
        const ctx: NonFieldLogicContext = {
          form: createMockForm(),
          fieldLogic: [{ type: 'disabled', condition: false }],
        };

        const result = resolveNonFieldDisabled(ctx);
        expect(result()).toBe(false);
      });

      it('should return true if ANY disabled condition is true (OR logic)', () => {
        const ctx: NonFieldLogicContext = {
          form: createMockForm(),
          fieldLogic: [
            { type: 'disabled', condition: false },
            { type: 'disabled', condition: true },
          ],
        };

        const result = resolveNonFieldDisabled(ctx);
        expect(result()).toBe(true);
      });
    });

    describe('conditional expression logic', () => {
      it('should evaluate fieldValue expression for disabled', () => {
        const ctx: NonFieldLogicContext = {
          form: createMockForm({ isLocked: true }),
          formValue: { isLocked: true },
          fieldLogic: [
            {
              type: 'disabled',
              condition: {
                type: 'fieldValue',
                fieldPath: 'isLocked',
                operator: 'equals',
                value: true,
              },
            },
          ],
        };

        const result = resolveNonFieldDisabled(ctx);
        expect(result()).toBe(true);
      });

      it('should evaluate javascript expression syntax for disabled', () => {
        const ctx: NonFieldLogicContext = {
          form: createMockForm({ canEdit: false }),
          formValue: { canEdit: false },
          fieldLogic: [
            {
              type: 'disabled',
              condition: {
                type: 'javascript',
                expression: '!canEdit',
              },
            },
          ],
        };

        const result = resolveNonFieldDisabled(ctx);
        expect(result()).toBe(true);
      });
    });

    describe('ignores non-disabled logic types', () => {
      it('should ignore hidden logic when resolving disabled', () => {
        const ctx: NonFieldLogicContext = {
          form: createMockForm(),
          fieldLogic: [
            { type: 'hidden', condition: true },
            { type: 'readonly', condition: true },
            { type: 'required', condition: true },
          ] as LogicConfig[],
        };

        const result = resolveNonFieldDisabled(ctx);
        expect(result()).toBe(false);
      });
    });

    describe('explicit value takes precedence', () => {
      it('should return true when explicitValue is true even with false logic', () => {
        const ctx: NonFieldLogicContext = {
          form: createMockForm(),
          explicitValue: true,
          fieldLogic: [{ type: 'disabled', condition: false }],
        };

        const result = resolveNonFieldDisabled(ctx);
        expect(result()).toBe(true);
      });
    });
  });

  describe('mixed hidden and disabled logic', () => {
    it('should independently evaluate hidden and disabled from same logic array', () => {
      const formValue = { status: 'locked' };
      const form = createMockForm(formValue);

      const fieldLogic: LogicConfig[] = [
        {
          type: 'hidden',
          condition: {
            type: 'fieldValue',
            fieldPath: 'status',
            operator: 'equals',
            value: 'archived',
          },
        },
        {
          type: 'disabled',
          condition: {
            type: 'fieldValue',
            fieldPath: 'status',
            operator: 'equals',
            value: 'locked',
          },
        },
      ];

      const hiddenResult = resolveNonFieldHidden({ form, formValue, fieldLogic });
      const disabledResult = resolveNonFieldDisabled({ form, formValue, fieldLogic });

      // Hidden should be false (status is 'locked', not 'archived')
      expect(hiddenResult()).toBe(false);
      // Disabled should be true (status is 'locked')
      expect(disabledResult()).toBe(true);
    });
  });
});
