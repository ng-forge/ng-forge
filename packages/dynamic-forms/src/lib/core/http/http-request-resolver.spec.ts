import { describe, expect, it } from 'vitest';
import { resolveHttpRequest } from './http-request-resolver';
import { HttpRequestConfig } from '../../models/http/http-request-config';
import { EvaluationContext } from '../../models/expressions/evaluation-context';

describe('resolveHttpRequest', () => {
  function createContext(overrides: Partial<EvaluationContext> = {}): EvaluationContext {
    return {
      fieldValue: 'test-value',
      formValue: { username: 'john', age: 25 },
      rootFormValue: { username: 'john', age: 25 },
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

  it('should handle null/undefined expression values as empty strings in query params', () => {
    const config: HttpRequestConfig = {
      url: '/api/check',
      queryParams: { missing: 'formValue.nonExistent' },
    };
    const ctx = createContext({ formValue: {} });
    const result = resolveHttpRequest(config, ctx);

    expect(result.url).toContain('missing=');
  });

  it('should pass body through unchanged when bodyExpressions is false', () => {
    const body = { key: 'formValue.username', nested: { deep: true } };
    const config: HttpRequestConfig = { url: '/api', method: 'POST', body };
    const result = resolveHttpRequest(config, createContext());

    expect(result.body).toEqual(body);
  });

  it('should pass body through unchanged when bodyExpressions is not set', () => {
    const body = { key: 'formValue.username' };
    const config: HttpRequestConfig = { url: '/api', method: 'POST', body };
    const result = resolveHttpRequest(config, createContext());

    expect(result.body).toEqual(body);
  });

  it('should evaluate top-level string values in body when bodyExpressions is true', () => {
    const config: HttpRequestConfig = {
      url: '/api',
      method: 'POST',
      body: { name: 'formValue.username', age: 'formValue.age' },
      bodyExpressions: true,
    };
    const result = resolveHttpRequest(config, createContext());

    expect(result.body).toEqual({ name: 'john', age: 25 });
  });

  it('should NOT recursively evaluate nested objects when bodyExpressions is true (shallow only)', () => {
    const nested = { innerExpr: 'formValue.username' };
    const config: HttpRequestConfig = {
      url: '/api',
      method: 'POST',
      body: {
        topLevel: 'fieldValue',
        nested,
      },
      bodyExpressions: true,
    };
    const result = resolveHttpRequest(config, createContext());
    const resultBody = result.body as Record<string, unknown>;

    expect(resultBody['topLevel']).toBe('test-value');
    // Nested object should be passed through as-is, not evaluated
    expect(resultBody['nested']).toEqual(nested);
  });

  it('should pass non-string body values through when bodyExpressions is true', () => {
    const config: HttpRequestConfig = {
      url: '/api',
      method: 'POST',
      body: { count: 42, active: true, name: 'fieldValue' },
      bodyExpressions: true,
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
});
