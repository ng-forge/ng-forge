import { describe, expect, it, vi } from 'vitest';
import { evaluateHttpValidationResponse } from './http-response-evaluator';
import { HttpValidationResponseMapping } from '../../models/http/http-response-mapping';
import { Logger } from '../../providers/features/logger/logger.interface';

describe('evaluateHttpValidationResponse', () => {
  function createLogger(): Logger {
    return {
      debug: vi.fn(),
      info: vi.fn(),
      warn: vi.fn(),
      error: vi.fn(),
    };
  }

  it('should return null when validWhen evaluates to true', () => {
    const mapping: HttpValidationResponseMapping = {
      validWhen: 'response.available',
      errorKind: 'taken',
    };
    const result = evaluateHttpValidationResponse({ available: true }, mapping, createLogger());

    expect(result).toBeNull();
  });

  it('should return error with kind when validWhen evaluates to false', () => {
    const mapping: HttpValidationResponseMapping = {
      validWhen: 'response.available',
      errorKind: 'taken',
    };
    const result = evaluateHttpValidationResponse({ available: false }, mapping, createLogger());

    expect(result).toEqual({ kind: 'taken' });
  });

  it('should evaluate errorParams expressions and include them in the error', () => {
    const mapping: HttpValidationResponseMapping = {
      validWhen: 'response.valid',
      errorKind: 'invalid',
      errorParams: {
        suggestion: 'response.suggestion',
        count: 'response.alternativeCount',
      },
    };
    const response = { valid: false, suggestion: 'john_doe', alternativeCount: 3 };
    const result = evaluateHttpValidationResponse(response, mapping, createLogger());

    expect(result).toEqual({
      kind: 'invalid',
      suggestion: 'john_doe',
      count: 3,
    });
  });

  it('should only have access to { response } scope — not formValue or fieldValue', () => {
    const mapping: HttpValidationResponseMapping = {
      validWhen: 'response.ok',
      errorKind: 'error',
    };
    // Even if formValue/fieldValue existed in the response, the scope is { response }
    const result = evaluateHttpValidationResponse({ ok: true }, mapping, createLogger());

    expect(result).toBeNull();
  });

  it('should log warning and return error on validWhen expression error (fail-closed)', () => {
    const logger = createLogger();
    const mapping: HttpValidationResponseMapping = {
      // Invalid expression syntax triggers an ExpressionParser error
      validWhen: 'response.constructor()',
      errorKind: 'expressionError',
    };
    const result = evaluateHttpValidationResponse({ ok: true }, mapping, logger);

    expect(result).toEqual({ kind: 'expressionError' });
    expect(logger.warn).toHaveBeenCalled();
  });

  it('should log warning for errorParam expression errors but still return the base error', () => {
    const logger = createLogger();
    const mapping: HttpValidationResponseMapping = {
      validWhen: 'response.valid',
      errorKind: 'invalid',
      errorParams: {
        // Invalid expression triggers error in errorParam evaluation
        broken: 'response.constructor()',
      },
    };
    const result = evaluateHttpValidationResponse({ valid: false }, mapping, logger);

    expect(result).toEqual({ kind: 'invalid' });
    expect(logger.warn).toHaveBeenCalled();
  });

  it('should use strict boolean check — non-boolean values are treated as invalid', () => {
    const mapping: HttpValidationResponseMapping = {
      validWhen: 'response.status',
      errorKind: 'error',
    };

    // Non-boolean truthy values should NOT pass (strict boolean check)
    const logger1 = createLogger();
    expect(evaluateHttpValidationResponse({ status: 'ok' }, mapping, logger1)).toEqual({ kind: 'error' });
    expect(logger1.warn).toHaveBeenCalled();

    const logger2 = createLogger();
    expect(evaluateHttpValidationResponse({ status: 1 }, mapping, logger2)).toEqual({ kind: 'error' });
    expect(logger2.warn).toHaveBeenCalled();

    // Non-boolean falsy values should also warn
    const logger3 = createLogger();
    expect(evaluateHttpValidationResponse({ status: 0 }, mapping, logger3)).toEqual({ kind: 'error' });
    expect(logger3.warn).toHaveBeenCalled();

    const logger4 = createLogger();
    expect(evaluateHttpValidationResponse({ status: '' }, mapping, logger4)).toEqual({ kind: 'error' });
    expect(logger4.warn).toHaveBeenCalled();

    // Only explicit true passes
    expect(evaluateHttpValidationResponse({ status: true }, mapping, createLogger())).toBeNull();
  });
});
