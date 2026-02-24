import { HttpRequestConfig } from '../../models/http/http-request-config';
import { EvaluationContext } from '../../models/expressions/evaluation-context';
import { HttpResourceRequest } from '../validation/validator-types';
import { ExpressionParser } from '../expressions/parser/expression-parser';

/**
 * Resolves an `HttpRequestConfig` into an `HttpResourceRequest` by evaluating
 * expression-based query params and (optionally) body values.
 *
 * Returns `null` if any path parameter resolves to `undefined` or `null`,
 * signaling that the request should be suppressed (the URL would be malformed).
 *
 * `debounceMs` is intentionally ignored — it's used by HTTP derivations/conditions (PRs 3-4),
 * not by validators.
 */
export function resolveHttpRequest(config: HttpRequestConfig, context: EvaluationContext): HttpResourceRequest | null {
  let url = config.url;

  if (config.params) {
    for (const [key, expression] of Object.entries(config.params)) {
      const value = ExpressionParser.evaluate(expression, context);
      if (value == null) {
        context.logger.debug(
          `HTTP request suppressed: path param '${key}' resolved to ${String(value)} ` +
            `(expression: '${expression}'). The request will not be sent.`,
        );
        return null;
      }
      url = url.replace(`:${key}`, encodeURIComponent(String(value)));
    }
  }

  if (config.queryParams) {
    const params = new URLSearchParams();
    for (const [key, expression] of Object.entries(config.queryParams)) {
      const value = ExpressionParser.evaluate(expression, context);
      params.set(key, value != null ? String(value) : '');
    }
    const queryString = params.toString();
    if (queryString) {
      url += (url.includes('?') ? '&' : '?') + queryString;
    }
  }

  const request: HttpResourceRequest = {
    url,
    method: config.method,
  };

  if (config.body) {
    if (config.evaluateBodyExpressions) {
      const resolvedBody: Record<string, unknown> = {};
      for (const [key, value] of Object.entries(config.body)) {
        if (typeof value === 'string') {
          resolvedBody[key] = ExpressionParser.evaluate(value, context);
        } else {
          resolvedBody[key] = value;
        }
      }
      request.body = resolvedBody;
    } else {
      request.body = config.body;
    }
  }

  if (config.headers) {
    request.headers = config.headers;
  }

  return request;
}
