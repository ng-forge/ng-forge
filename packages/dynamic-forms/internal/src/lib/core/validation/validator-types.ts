import { FieldContext, ValidationError, TreeValidationResult } from '@angular/forms/signals';
import { Signal, ResourceRef } from '@angular/core';

/**
 * Custom validator function signature using Angular's public FieldContext API
 *
 * @template TValue The type of value stored in the field being validated
 */
export type CustomValidator<TValue = unknown> = (
  ctx: FieldContext<TValue>,
  params?: Record<string, unknown>,
) => ValidationError | ValidationError[] | null;

/**
 * Async custom validator configuration using Angular's resource-based API
 *
 * @template TValue The type of value stored in the field being validated
 * @template TParams The type of params passed to the resource
 * @template TResult The type of result returned by the resource
 */
export interface AsyncCustomValidator<TValue = unknown, TParams = unknown, TResult = unknown> {
  /**
   * Function that receives field context and returns resource params.
   * Params will be tracked as a signal and trigger resource reload when changed.
   */
  readonly params: (ctx: FieldContext<TValue>, config?: Record<string, unknown>) => TParams;

  /**
   * Function that creates a ResourceRef from the params signal.
   * The resource will be automatically managed by Angular's lifecycle.
   */
  readonly factory: (params: Signal<TParams | undefined>) => ResourceRef<TResult | undefined>;

  /**
   * Optional function to map successful resource result to validation errors.
   * Return null if validation passes, or ValidationError/ValidationError[] if validation fails.
   */
  readonly onSuccess?: (result: TResult, ctx: FieldContext<TValue>) => TreeValidationResult;

  /**
   * Optional error handler for resource errors (network failures, etc.).
   * Return null to ignore the error, or ValidationError to display it to the user.
   */
  readonly onError?: (error: unknown, ctx: FieldContext<TValue>) => ValidationError | ValidationError[] | null;
}

/** HTTP request configuration for validateHttp API */
export interface HttpResourceRequest {
  url: string;
  method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  body?: unknown;
  headers?: Record<string, string | string[]>;
}

/**
 * HTTP-based validator configuration for Angular's validateHttp API
 *
 * @template TValue The type of value stored in the field being validated
 * @template TResult The type of HTTP response
 */
export interface HttpCustomValidator<TValue = unknown, TResult = unknown> {
  /**
   * Function that returns the HTTP request configuration.
   * Can return:
   * - `undefined` to skip validation (e.g., if field is empty)
   * - `string` for simple GET requests (just the URL)
   * - `HttpResourceRequest` for full control (method, body, headers)
   */
  readonly request: (ctx: FieldContext<TValue>, config?: Record<string, unknown>) => string | HttpResourceRequest | undefined;

  /** REQUIRED function to map successful HTTP response to validation errors. */
  readonly onSuccess: (result: TResult, ctx: FieldContext<TValue>) => TreeValidationResult;

  /**
   * Optional error handler for HTTP errors (network failures, 4xx/5xx status codes).
   * Return null to ignore the error, or ValidationError to display it to the user.
   */
  readonly onError?: (error: unknown, ctx: FieldContext<TValue>) => ValidationError | ValidationError[] | null;
}
