import { describe, expect, it, vi } from 'vitest';
import { resolveHttpRequest } from './http-request-resolver';
import { HttpRequestConfig } from '../../models/http/http-request-config';
import { EvaluationContext } from '../../models/expressions/evaluation-context';
import { Logger } from '../../providers/features/logger/logger.interface';
import { ExpressionParserError } from '../expressions/parser/types';

describe('resolveHttpRequest', () => {
  const noopLogger: Logger = { debug: vi.fn(), info: vi.fn(), warn: vi.fn(), error: vi.fn() };

  function createContext(overrides: Partial<EvaluationContext> = {}): EvaluationContext {
    return {
      fieldValue: 'test-value',
      formValue: { username: 'john', age: 25 },
      rootFormValue: { username: 'john', age: 25 },
      fieldPath: 'username',
      logger: noopLogger,
      customFunctions: {},
      ...overrides,
    };
  }

  it('should return a request with the URL and default method when no extras are provided', () => {
    const config: HttpRequestConfig = { url: '/api/validate' };
    const result = resolveHttpRequest(config, createContext());

    expect(result.url).toBe('/api/validate');
    expect(result.method).toBeUndefined();
  });

  it('should pass through the method', () => {
    const config: HttpRequestConfig = { url: '/api/validate', method: 'POST' };
    const result = resolveHttpRequest(config, createContext());

    expect(result.method).toBe('POST');
  });

  it('should evaluate expression-based query params and encode them in the URL', () => {
    const config: HttpRequestConfig = {
      url: '/api/check',
      queryParams: {
        name: 'formValue.username',
        value: 'fieldValue',
      },
    };
    const result = resolveHttpRequest(config, createContext());

    expect(result.url).toBe('/api/check?name=john&value=test-value');
  });

  it('should append query params with & when URL already has a query string', () => {
    const config: HttpRequestConfig = {
      url: '/api/check?existing=true',
      queryParams: { name: 'formValue.username' },
    };
    const result = resolveHttpRequest(config, createContext());

    expect(result.url).toBe('/api/check?existing=true&name=john');
  });

  it('should not modify URL when queryParams is an empty object (L1)', () => {
    const config: HttpRequestConfig = {
      url: '/api/check',
      queryParams: {},
    };
    const result = resolveHttpRequest(config, createContext());

    expect(result.url).toBe('/api/check');
  });

  it('should handle null/undefined expression values as empty strings in query params', () => {
    const config: HttpRequestConfig = {
      url: '/api/check',
      queryParams: { missing: 'formValue.nonExistent' },
    };
    const ctx = createContext({ formValue: {} });
    const result = resolveHttpRequest(config, ctx);

    expect(result.url).toContain('missing=');
  });

  it('should pass body through unchanged when evaluateBodyExpressions is false', () => {
    const body = { key: 'formValue.username', nested: { deep: true } };
    const config: HttpRequestConfig = { url: '/api', method: 'POST', body };
    const result = resolveHttpRequest(config, createContext());

    expect(result.body).toEqual(body);
  });

  it('should pass body through unchanged when evaluateBodyExpressions is not set', () => {
    const body = { key: 'formValue.username' };
    const config: HttpRequestConfig = { url: '/api', method: 'POST', body };
    const result = resolveHttpRequest(config, createContext());

    expect(result.body).toEqual(body);
  });

  it('should evaluate top-level string values in body when evaluateBodyExpressions is true', () => {
    const config: HttpRequestConfig = {
      url: '/api',
      method: 'POST',
      body: { name: 'formValue.username', age: 'formValue.age' },
      evaluateBodyExpressions: true,
    };
    const result = resolveHttpRequest(config, createContext());

    expect(result.body).toEqual({ name: 'john', age: 25 });
  });

  it('should NOT recursively evaluate nested objects when evaluateBodyExpressions is true (shallow only)', () => {
    const nested = { innerExpr: 'formValue.username' };
    const config: HttpRequestConfig = {
      url: '/api',
      method: 'POST',
      body: {
        topLevel: 'fieldValue',
        nested,
      },
      evaluateBodyExpressions: true,
    };
    const result = resolveHttpRequest(config, createContext());
    const resultBody = result.body as Record<string, unknown>;

    expect(resultBody['topLevel']).toBe('test-value');
    // Nested object should be passed through as-is, not evaluated
    expect(resultBody['nested']).toEqual(nested);
  });

  it('should pass non-string body values through when evaluateBodyExpressions is true', () => {
    const config: HttpRequestConfig = {
      url: '/api',
      method: 'POST',
      body: { count: 42, active: true, name: 'fieldValue' },
      evaluateBodyExpressions: true,
    };
    const result = resolveHttpRequest(config, createContext());
    const resultBody = result.body as Record<string, unknown>;

    expect(resultBody['count']).toBe(42);
    expect(resultBody['active']).toBe(true);
    expect(resultBody['name']).toBe('test-value');
  });

  it('should include headers when provided', () => {
    const config: HttpRequestConfig = {
      url: '/api',
      headers: { Authorization: 'Bearer token', 'Content-Type': 'application/json' },
    };
    const result = resolveHttpRequest(config, createContext());

    expect(result.headers).toEqual({
      Authorization: 'Bearer token',
      'Content-Type': 'application/json',
    });
  });

  it('should not include headers when not provided', () => {
    const config: HttpRequestConfig = { url: '/api' };
    const result = resolveHttpRequest(config, createContext());

    expect(result.headers).toBeUndefined();
  });

  it('should not include debounceMs in the output', () => {
    const config: HttpRequestConfig = { url: '/api', debounceMs: 500 };
    const result = resolveHttpRequest(config, createContext());

    expect(result).not.toHaveProperty('debounceMs');
  });

  describe('path params', () => {
    it('should replace :key placeholders with evaluated expression values', () => {
      const config: HttpRequestConfig = {
        url: '/api/users/:userId',
        params: { userId: 'formValue.username' },
      };
      const result = resolveHttpRequest(config, createContext());

      expect(result.url).toBe('/api/users/john');
    });

    it('should replace multiple path params in one URL', () => {
      const config: HttpRequestConfig = {
        url: '/api/users/:name/age/:age',
        params: { name: 'formValue.username', age: 'formValue.age' },
      };
      const result = resolveHttpRequest(config, createContext());

      expect(result.url).toBe('/api/users/john/age/25');
    });

    it('should combine path params with query params', () => {
      const config: HttpRequestConfig = {
        url: '/api/users/:userId/orders',
        params: { userId: 'formValue.username' },
        queryParams: { status: "'active'" },
      };
      const result = resolveHttpRequest(config, createContext());

      expect(result.url).toBe('/api/users/john/orders?status=active');
    });

    it('should URL-encode special characters in path param values', () => {
      const config: HttpRequestConfig = {
        url: '/api/users/:userId',
        params: { userId: 'fieldValue' },
      };
      const ctx = createContext({ fieldValue: 'hello world/special&chars' });
      const result = resolveHttpRequest(config, ctx);

      expect(result.url).toBe('/api/users/hello%20world%2Fspecial%26chars');
    });

    it('should leave URL unchanged when param key has no matching :placeholder', () => {
      const config: HttpRequestConfig = {
        url: '/api/users',
        params: { userId: 'formValue.username' },
      };
      const result = resolveHttpRequest(config, createContext());

      expect(result.url).toBe('/api/users');
    });

    it('should return null when expression evaluates to null/undefined (suppresses request)', () => {
      const config: HttpRequestConfig = {
        url: '/api/users/:userId',
        params: { userId: 'formValue.nonExistent' },
      };
      const ctx = createContext({ formValue: {} });
      const result = resolveHttpRequest(config, ctx);

      expect(result).toBeNull();
    });
  });

  describe('expression error handling', () => {
    it('should return undefined (coerced to empty string) for a deeply nested path that does not exist in queryParams', () => {
      const config: HttpRequestConfig = {
        url: '/api/check',
        queryParams: { deep: 'formValue.a.b.c.d' },
      };
      const ctx = createContext({ formValue: { username: 'john' } });
      const result = resolveHttpRequest(config, ctx);

      // ExpressionParser.evaluate traverses: formValue.a -> undefined, then .b on undefined -> undefined, etc.
      // resolveHttpRequest coerces null/undefined to '' via `value != null ? String(value) : ''`
      expect(result.url).toBe('/api/check?deep=');
    });

    it('should throw ExpressionParserError for invalid expression syntax in queryParams', () => {
      const config: HttpRequestConfig = {
        url: '/api/check',
        queryParams: { bad: '@#$invalid' },
      };

      // The parser throws ExpressionParserError for unexpected characters.
      // resolveHttpRequest does NOT catch this — it propagates to the caller.
      expect(() => resolveHttpRequest(config, createContext())).toThrow(ExpressionParserError);
    });

    it('should throw ExpressionParserError for an empty string expression in queryParams', () => {
      const config: HttpRequestConfig = {
        url: '/api/check',
        queryParams: { empty: '' },
      };

      // The parser throws ExpressionParserError('Empty expression') for empty strings.
      expect(() => resolveHttpRequest(config, createContext())).toThrow(ExpressionParserError);
    });

    it('should resolve to undefined for a body expression referencing a non-existent path when evaluateBodyExpressions is true', () => {
      const config: HttpRequestConfig = {
        url: '/api',
        method: 'POST',
        body: { missing: 'formValue.x.y.z' },
        evaluateBodyExpressions: true,
      };
      const result = resolveHttpRequest(config, createContext());
      const resultBody = result.body as Record<string, unknown>;

      // MemberAccess on undefined returns undefined (no throw), so the body value is undefined.
      expect(resultBody['missing']).toBeUndefined();
    });

    it('should throw ExpressionParserError for malformed expression in body when evaluateBodyExpressions is true', () => {
      const config: HttpRequestConfig = {
        url: '/api',
        method: 'POST',
        body: { broken: '@invalid' },
        evaluateBodyExpressions: true,
      };

      // The tokenizer throws ExpressionParserError('Unexpected character: @') for invalid characters.
      // resolveHttpRequest does NOT catch expression errors — they propagate.
      expect(() => resolveHttpRequest(config, createContext())).toThrow(ExpressionParserError);
    });

    it('should throw ExpressionParserError for unterminated string literal in queryParams', () => {
      const config: HttpRequestConfig = {
        url: '/api/check',
        queryParams: { bad: "'unterminated" },
      };

      // The tokenizer throws ExpressionParserError('Unterminated string literal') when a string is not closed.
      expect(() => resolveHttpRequest(config, createContext())).toThrow(ExpressionParserError);
    });

    it('should not throw for body with malformed expression when evaluateBodyExpressions is false', () => {
      const config: HttpRequestConfig = {
        url: '/api',
        method: 'POST',
        body: { broken: '@#$invalid' },
        evaluateBodyExpressions: false,
      };

      // With evaluateBodyExpressions=false, body is passed through without expression evaluation.
      const result = resolveHttpRequest(config, createContext());
      expect(result.body).toEqual({ broken: '@#$invalid' });
    });
  });
});
