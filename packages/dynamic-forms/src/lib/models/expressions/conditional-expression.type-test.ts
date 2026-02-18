/**
 * Type-level tests for HttpCondition, AsyncCondition, and ConditionalExpression.
 * This file is never executed — it only needs to compile without errors.
 */

import type { ConditionalExpression, HttpCondition, AsyncCondition } from './conditional-expression';

// ============================================================================
// HttpCondition tests
// ============================================================================

// HttpCondition is assignable to ConditionalExpression
const httpCondition: HttpCondition = {
  type: 'http',
  http: { url: '/api/check' },
};
const _asConditional: ConditionalExpression = httpCondition;

// ConditionalExpression discriminates type: 'http' correctly
function handleCondition(expr: ConditionalExpression): void {
  if (expr.type === 'http') {
    // Inside this block, expr is narrowed to HttpCondition
    const _url: string = expr.http.url;
    const _pending: boolean | undefined = expr.pendingValue;
    const _responseExpr: string | undefined = expr.responseExpression;
    const _cacheDuration: number | undefined = expr.cacheDurationMs;
    const _debounce: number | undefined = expr.http.debounceMs;
    const _method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE' | undefined = expr.http.method;
    void [_url, _pending, _responseExpr, _cacheDuration, _debounce, _method];
  }
}

// Required properties
const _requiredOnly: HttpCondition = {
  type: 'http',
  http: { url: '/api/check' },
};

// All optional properties
const _allProps: HttpCondition = {
  type: 'http',
  http: {
    url: '/api/check',
    method: 'POST',
    queryParams: { field: 'fieldValue' },
    body: { key: 'value' },
    evaluateBodyExpressions: true,
    headers: { Authorization: 'Bearer token' },
    debounceMs: 500,
  },
  responseExpression: 'response.allowed',
  pendingValue: true,
  cacheDurationMs: 60000,
};

// @ts-expect-error — type is required
const _missingType: HttpCondition = { http: { url: '/api' } };

// @ts-expect-error — http is required
const _missingHttp: HttpCondition = { type: 'http' };

// ============================================================================
// AsyncCondition tests
// ============================================================================

// AsyncCondition is assignable to ConditionalExpression
const asyncCondition: AsyncCondition = {
  type: 'async',
  asyncFunctionName: 'checkPermission',
};
const _asyncAsConditional: ConditionalExpression = asyncCondition;

// ConditionalExpression discriminates type: 'async' correctly
function handleAsyncCondition(expr: ConditionalExpression): void {
  if (expr.type === 'async') {
    // Inside this block, expr is narrowed to AsyncCondition
    const _fnName: string = expr.asyncFunctionName;
    const _pending: boolean | undefined = expr.pendingValue;
    const _debounce: number | undefined = expr.debounceMs;
    void [_fnName, _pending, _debounce];
  }
}

// Required properties only
const _asyncRequiredOnly: AsyncCondition = {
  type: 'async',
  asyncFunctionName: 'checkPermission',
};

// All optional properties
const _asyncAllProps: AsyncCondition = {
  type: 'async',
  asyncFunctionName: 'checkPermission',
  pendingValue: true,
  debounceMs: 500,
};

// @ts-expect-error — type is required
const _asyncMissingType: AsyncCondition = { asyncFunctionName: 'fn' };

// @ts-expect-error — asyncFunctionName is required
const _asyncMissingFn: AsyncCondition = { type: 'async' };

void [
  _asConditional,
  handleCondition,
  _requiredOnly,
  _allProps,
  _missingType,
  _missingHttp,
  _asyncAsConditional,
  handleAsyncCondition,
  _asyncRequiredOnly,
  _asyncAllProps,
  _asyncMissingType,
  _asyncMissingFn,
];
