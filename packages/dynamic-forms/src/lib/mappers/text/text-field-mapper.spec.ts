import { EnvironmentInjector, runInInjectionContext, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { textFieldMapper } from './text-field-mapper';
import { TextField } from '../../definitions/default/text-field';
import { FunctionRegistryService } from '../../core/registry/function-registry.service';
import { FieldContextRegistryService } from '../../core/registry/field-context-registry.service';
import { FIELD_SIGNAL_CONTEXT } from '../../models/field-signal-context.token';
import { vi } from 'vitest';

describe('textFieldMapper', () => {
  let parentInjector: EnvironmentInjector;
  let mockGetCustomFunctions: ReturnType<typeof vi.fn>;
  let mockCreateDisplayOnlyContext: ReturnType<typeof vi.fn>;

  beforeEach(async () => {
    mockGetCustomFunctions = vi.fn().mockReturnValue({});
    mockCreateDisplayOnlyContext = vi.fn().mockImplementation((fieldPath, customFunctions) => ({
      fieldValue: undefined,
      formValue: {},
      fieldPath,
      customFunctions: customFunctions || {},
    }));

    const mockFieldContextRegistry = {
      createDisplayOnlyContext: mockCreateDisplayOnlyContext,
    };

    const mockFunctionRegistry = {
      getCustomFunctions: mockGetCustomFunctions,
    };

    const mockFieldSignalContext = {
      injector: undefined,
      value: signal({}),
      defaultValues: () => ({}),
      form: {},
      defaultValidationMessages: undefined,
      formOptions: undefined,
      defaultProps: undefined,
    };

    await TestBed.configureTestingModule({
      providers: [
        { provide: FieldContextRegistryService, useValue: mockFieldContextRegistry },
        { provide: FunctionRegistryService, useValue: mockFunctionRegistry },
        { provide: FIELD_SIGNAL_CONTEXT, useValue: mockFieldSignalContext },
      ],
    }).compileComponents();

    parentInjector = TestBed.inject(EnvironmentInjector);
  });

  function testMapper(fieldDef: TextField): Record<string, unknown> {
    const inputsSignal = runInInjectionContext(parentInjector, () => textFieldMapper(fieldDef));
    return inputsSignal();
  }

  describe('base properties (from buildBaseInputs)', () => {
    it('should include key from base mapper', () => {
      const fieldDef: TextField = {
        key: 'infoText',
        type: 'text',
      };

      const inputs = testMapper(fieldDef);

      expect(inputs['key']).toBe('infoText');
    });

    it('should include label when defined', () => {
      const fieldDef: TextField = {
        key: 'infoText',
        type: 'text',
        label: 'Important Information',
      };

      const inputs = testMapper(fieldDef);

      expect(inputs['label']).toBe('Important Information');
    });

    it('should include className when defined', () => {
      const fieldDef: TextField = {
        key: 'infoText',
        type: 'text',
        className: 'info-section',
      };

      const inputs = testMapper(fieldDef);

      expect(inputs['className']).toContain('info-section');
    });

    it('should include tabIndex when defined', () => {
      const fieldDef: TextField = {
        key: 'infoText',
        type: 'text',
        tabIndex: 0,
      };

      const inputs = testMapper(fieldDef);

      expect(inputs['tabIndex']).toBe(0);
    });

    it('should include props when defined', () => {
      const fieldDef: TextField = {
        key: 'infoText',
        type: 'text',
        props: { variant: 'subtitle', color: 'primary' },
      };

      const inputs = testMapper(fieldDef);

      expect(inputs['props']).toEqual({ variant: 'subtitle', color: 'primary' });
    });
  });

  describe('logic evaluation for hidden state', () => {
    it('should NOT include hidden when no logic is defined', () => {
      const fieldDef: TextField = {
        key: 'infoText',
        type: 'text',
        label: 'Info',
      };

      const inputs = testMapper(fieldDef);

      expect(inputs).not.toHaveProperty('hidden');
    });

    it('should evaluate hidden logic with boolean condition', () => {
      const fieldDef: TextField = {
        key: 'infoText',
        type: 'text',
        label: 'Info',
        logic: [{ type: 'hidden', condition: true }],
      };

      const inputs = testMapper(fieldDef);

      expect(inputs['hidden']).toBe(true);
    });

    it('should evaluate hidden logic with false boolean condition', () => {
      const fieldDef: TextField = {
        key: 'infoText',
        type: 'text',
        label: 'Info',
        logic: [{ type: 'hidden', condition: false }],
      };

      const inputs = testMapper(fieldDef);

      expect(inputs['hidden']).toBe(false);
    });

    it('should handle multiple hidden logic conditions (OR logic)', () => {
      const fieldDef: TextField = {
        key: 'infoText',
        type: 'text',
        label: 'Info',
        logic: [
          { type: 'hidden', condition: false },
          { type: 'hidden', condition: true }, // One true makes the whole thing true
        ],
      };

      const inputs = testMapper(fieldDef);

      expect(inputs['hidden']).toBe(true);
    });

    it('should ignore non-hidden logic types', () => {
      const fieldDef: TextField = {
        key: 'infoText',
        type: 'text',
        label: 'Info',
        logic: [
          { type: 'disabled', condition: true }, // Should be ignored for text fields
        ],
      };

      const inputs = testMapper(fieldDef);

      // Only hidden logic should be evaluated, disabled should be ignored
      expect(inputs).not.toHaveProperty('hidden');
      expect(inputs).not.toHaveProperty('disabled');
    });
  });

  describe('excluded properties (NOT passed to component)', () => {
    it('should NOT include type in inputs', () => {
      const fieldDef: TextField = {
        key: 'infoText',
        type: 'text',
        label: 'Info',
      };

      const inputs = testMapper(fieldDef);

      expect(inputs).not.toHaveProperty('type');
    });

    it('should NOT include logic configuration in inputs', () => {
      const fieldDef: TextField = {
        key: 'infoText',
        type: 'text',
        label: 'Info',
        logic: [{ type: 'hidden', condition: false }],
      };

      const inputs = testMapper(fieldDef);

      expect(inputs).not.toHaveProperty('logic');
    });

    it('should NOT pass through unknown custom properties', () => {
      const fieldDef = {
        key: 'infoText',
        type: 'text' as const,
        label: 'Info',
        customUnknownProp: 'should not pass',
        anotherCustomProp: 123,
      };

      const inputs = testMapper(fieldDef as TextField);

      expect(inputs).not.toHaveProperty('customUnknownProp');
      expect(inputs).not.toHaveProperty('anotherCustomProp');
    });
  });

  describe('complete field integration', () => {
    it('should correctly map a complete text field definition', () => {
      const textField: TextField = {
        key: 'disclaimer',
        type: 'text',
        label: 'Please read the following carefully before proceeding.',
        className: 'disclaimer-text',
        tabIndex: -1,
        props: { variant: 'body2', italic: true },
      };

      const inputs = testMapper(textField);

      // Verify included properties
      expect(inputs['key']).toBe('disclaimer');
      expect(inputs['label']).toBe('Please read the following carefully before proceeding.');
      expect(inputs['className']).toContain('disclaimer-text');
      expect(inputs['tabIndex']).toBe(-1);
      expect(inputs['props']).toEqual({ variant: 'body2', italic: true });

      // Verify type is excluded
      expect(inputs).not.toHaveProperty('type');
    });

    it('should correctly map a text field with hidden logic', () => {
      mockCreateDisplayOnlyContext.mockImplementation((fieldPath, customFunctions) => ({
        fieldValue: undefined,
        formValue: { agreedToTerms: true },
        fieldPath,
        customFunctions: customFunctions || {},
      }));

      const textField: TextField = {
        key: 'termsAccepted',
        type: 'text',
        label: 'Thank you for accepting the terms.',
        logic: [
          {
            type: 'hidden',
            condition: {
              expression: '!agreedToTerms',
            },
          },
        ],
      };

      const inputs = testMapper(textField);

      expect(inputs['key']).toBe('termsAccepted');
      expect(inputs['label']).toBe('Thank you for accepting the terms.');
      expect(inputs['hidden']).toBe(false); // Should be visible when terms are agreed
    });
  });
});
