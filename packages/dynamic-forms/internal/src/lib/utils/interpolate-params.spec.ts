import { describe, it, expect } from 'vitest';
import { interpolateParams } from './interpolate-params';
import { ValidationError } from '../models/validation-types';

describe('interpolateParams', () => {
  it('should interpolate single parameter', () => {
    const message = 'Min value is {{min}}';
    const error: ValidationError = { kind: 'min', min: 5 };
    const result = interpolateParams(message, error);

    expect(result).toBe('Min value is 5');
  });

  it('should interpolate multiple parameters', () => {
    const message = 'Value must be between {{min}} and {{max}}';
    const error: ValidationError = { kind: 'range', min: 1, max: 10 };
    const result = interpolateParams(message, error);

    expect(result).toBe('Value must be between 1 and 10');
  });

  it('should handle requiredLength parameter', () => {
    const message = 'Must be {{requiredLength}} characters';
    const error: ValidationError = { kind: 'minlength', requiredLength: 8, actualLength: 5 };
    const result = interpolateParams(message, error);

    expect(result).toBe('Must be 8 characters');
  });

  it('should handle pattern parameter with RegExp', () => {
    const message = 'Must match pattern {{pattern}}';
    const error: ValidationError = { kind: 'pattern', pattern: /^\d+$/ };
    const result = interpolateParams(message, error);

    expect(result).toBe('Must match pattern /^\\d+$/');
  });

  it('should handle spaces around placeholder', () => {
    const message = 'Min is {{ min }} and max is {{  max  }}';
    const error: ValidationError = { kind: 'range', min: 1, max: 10 };
    const result = interpolateParams(message, error);

    expect(result).toBe('Min is 1 and max is 10');
  });

  it('should handle custom error parameters', () => {
    const message = 'Invalid {{customField}}, expected {{expected}}';
    const error = { kind: 'custom', customField: 'email', expected: 'valid email' } as ValidationError;
    const result = interpolateParams(message, error);

    expect(result).toBe('Invalid email, expected valid email');
  });

  it('should not interpolate kind parameter', () => {
    const message = 'Error {{kind}} occurred';
    const error: ValidationError = { kind: 'min', min: 5 };
    const result = interpolateParams(message, error);

    expect(result).toBe('Error {{kind}} occurred'); // kind should not be interpolated
  });

  it('should handle missing parameters', () => {
    const message = 'Min is {{min}}, max is {{max}}';
    const error: ValidationError = { kind: 'min', min: 5 };
    const result = interpolateParams(message, error);

    expect(result).toBe('Min is 5, max is {{max}}'); // Non-existent params stay as-is
  });

  it('should handle null values', () => {
    const message = 'Value is {{value}}';
    const error = { kind: 'custom', value: null } as ValidationError;
    const result = interpolateParams(message, error);

    expect(result).toBe('Value is ');
  });

  it('should handle undefined values', () => {
    const message = 'Value is {{value}}';
    const error = { kind: 'custom', value: undefined } as ValidationError;
    const result = interpolateParams(message, error);

    expect(result).toBe('Value is ');
  });

  it('should handle boolean values', () => {
    const message = 'Required: {{required}}, Disabled: {{disabled}}';
    const error = { kind: 'custom', required: true, disabled: false } as ValidationError;
    const result = interpolateParams(message, error);

    expect(result).toBe('Required: true, Disabled: false');
  });

  it('should handle Date objects', () => {
    const date = new Date('2024-01-01T00:00:00.000Z');
    const message = 'Date is {{date}}';
    const error = { kind: 'custom', date } as ValidationError;
    const result = interpolateParams(message, error);

    expect(result).toBe('Date is 2024-01-01T00:00:00.000Z');
  });

  it('should handle array values', () => {
    const message = 'Allowed values: {{allowed}}';
    const error = { kind: 'custom', allowed: ['a', 'b', 'c'] } as ValidationError;
    const result = interpolateParams(message, error);

    expect(result).toBe('Allowed values: a, b, c');
  });

  it('should handle object values', () => {
    const message = 'Config: {{config}}';
    const error = { kind: 'custom', config: { min: 1, max: 10 } } as ValidationError;
    const result = interpolateParams(message, error);

    expect(result).toBe('Config: {"min":1,"max":10}');
  });

  it('should handle string values', () => {
    const message = 'Field {{field}} is invalid';
    const error = { kind: 'custom', field: 'email' } as ValidationError;
    const result = interpolateParams(message, error);

    expect(result).toBe('Field email is invalid');
  });

  it('should handle number values', () => {
    const message = 'Value {{actual}} exceeds maximum {{max}}';
    const error: ValidationError = { kind: 'max', max: 100, actual: 150 };
    const result = interpolateParams(message, error);

    expect(result).toBe('Value 150 exceeds maximum 100');
  });

  it('should handle multiple occurrences of same placeholder', () => {
    const message = 'Min {{min}}, Max {{max}}, Min again {{min}}';
    const error: ValidationError = { kind: 'range', min: 1, max: 10 };
    const result = interpolateParams(message, error);

    expect(result).toBe('Min 1, Max 10, Min again 1');
  });

  it('should handle message with no placeholders', () => {
    const message = 'This field is required';
    const error: ValidationError = { kind: 'required' };
    const result = interpolateParams(message, error);

    expect(result).toBe('This field is required');
  });

  it('should handle actualLength parameter', () => {
    const message = 'Length is {{actualLength}}, required is {{requiredLength}}';
    const error: ValidationError = { kind: 'minlength', actualLength: 3, requiredLength: 5 };
    const result = interpolateParams(message, error);

    expect(result).toBe('Length is 3, required is 5');
  });

  it('should handle expected and actual parameters', () => {
    const message = 'Expected {{expected}}, got {{actual}}';
    const error = { kind: 'custom', expected: 'valid', actual: 'invalid' } as ValidationError;
    const result = interpolateParams(message, error);

    expect(result).toBe('Expected valid, got invalid');
  });

  // Angular Signal Forms compatibility tests
  describe('Angular Signal Forms format', () => {
    it('should handle minLength property (Signal Forms format) with requiredLength placeholder', () => {
      const message = 'Must be at least {{requiredLength}} characters';
      // Angular Signal Forms uses 'minLength' property, not 'requiredLength'
      const error = { kind: 'minLength', minLength: 5 } as ValidationError;
      const result = interpolateParams(message, error);

      expect(result).toBe('Must be at least 5 characters');
    });

    it('should handle maxLength property (Signal Forms format) with requiredLength placeholder', () => {
      const message = 'Must be at most {{requiredLength}} characters';
      // Angular Signal Forms uses 'maxLength' property, not 'requiredLength'
      const error = { kind: 'maxLength', maxLength: 10 } as ValidationError;
      const result = interpolateParams(message, error);

      expect(result).toBe('Must be at most 10 characters');
    });

    it('should handle minLength placeholder directly', () => {
      const message = 'Minimum length: {{minLength}}';
      const error = { kind: 'minLength', minLength: 5 } as ValidationError;
      const result = interpolateParams(message, error);

      expect(result).toBe('Minimum length: 5');
    });

    it('should handle maxLength placeholder directly', () => {
      const message = 'Maximum length: {{maxLength}}';
      const error = { kind: 'maxLength', maxLength: 100 } as ValidationError;
      const result = interpolateParams(message, error);

      expect(result).toBe('Maximum length: 100');
    });

    it('should prefer requiredLength over minLength when both present', () => {
      const message = 'Must be at least {{requiredLength}} characters';
      // Classic format takes precedence
      const error = { kind: 'minlength', requiredLength: 8, minLength: 5 } as ValidationError;
      const result = interpolateParams(message, error);

      expect(result).toBe('Must be at least 8 characters');
    });
  });
});
