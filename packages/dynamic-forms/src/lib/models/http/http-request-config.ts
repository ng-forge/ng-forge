/**
 * Configuration for an HTTP request used by declarative HTTP validators, derivations, and conditions.
 *
 * All string values in `queryParams` are treated as expressions evaluated by ExpressionParser.
 * When `evaluateBodyExpressions` is true, top-level string values in `body` are also evaluated as expressions (shallow only).
 */
export interface HttpRequestConfig {
  /** URL to send the request to */
  url: string;

  /** HTTP method. Defaults to 'GET' */
  method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';

  /**
   * URL path parameters. Keys correspond to `:key` placeholders in the URL.
   * Values are expressions evaluated by ExpressionParser against the current EvaluationContext.
   *
   * @example
   * ```typescript
   * {
   *   url: '/api/users/:userId/orders/:orderId',
   *   params: { userId: 'formValue.userId', orderId: 'fieldValue' }
   * }
   * // With userId=42 and fieldValue='abc' → '/api/users/42/orders/abc'
   * ```
   */
  params?: Record<string, string>;

  /**
   * Query parameters appended to the URL.
   * Values are expressions evaluated by ExpressionParser against the current EvaluationContext.
   */
  queryParams?: Record<string, string>;

  /** Request body (for POST/PUT/PATCH) */
  body?: Record<string, unknown>;

  /**
   * When true, top-level string values in `body` are treated as expressions
   * and evaluated by ExpressionParser (shallow only — nested objects are passed through as-is).
   */
  evaluateBodyExpressions?: boolean;

  /** HTTP headers to include in the request */
  headers?: Record<string, string>;
}
