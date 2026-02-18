/**
 * Exhaustive type tests for HttpRequestConfig, HttpValidationResponseMapping,
 * DeclarativeHttpValidatorConfig, and ValidatorConfig union.
 */
import { expectTypeOf } from 'vitest';
import type { RequiredKeys, OptionalKeys } from '@ng-forge/utils';
import type { HttpRequestConfig } from './http-request-config';
import type { HttpValidationResponseMapping } from './http-response-mapping';
import type { DeclarativeHttpValidatorConfig, ValidatorConfig } from '../validation/validator-config';
import type { ConditionalExpression } from '../expressions/conditional-expression';

// ============================================================================
// HttpRequestConfig - Whitelist Test
// ============================================================================

describe('HttpRequestConfig - Exhaustive Whitelist', () => {
  type ExpectedKeys = 'url' | 'method' | 'queryParams' | 'body' | 'evaluateBodyExpressions' | 'headers';
  type ActualKeys = keyof HttpRequestConfig;

  it('should have exactly the expected keys', () => {
    expectTypeOf<ActualKeys>().toEqualTypeOf<ExpectedKeys>();
  });

  describe('required keys', () => {
    it('should have url as required', () => {
      expectTypeOf<RequiredKeys<HttpRequestConfig>>().toEqualTypeOf<'url'>();
    });
  });

  describe('optional keys', () => {
    it('should have method, queryParams, body, evaluateBodyExpressions, and headers as optional', () => {
      expectTypeOf<OptionalKeys<HttpRequestConfig>>().toEqualTypeOf<
        'method' | 'queryParams' | 'body' | 'evaluateBodyExpressions' | 'headers'
      >();
    });
  });

  describe('property types', () => {
    it('url should be string', () => {
      expectTypeOf<HttpRequestConfig['url']>().toEqualTypeOf<string>();
    });

    it('method should be HTTP method union', () => {
      expectTypeOf<HttpRequestConfig['method']>().toEqualTypeOf<'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE' | undefined>();
    });

    it('queryParams should be Record<string, string>', () => {
      expectTypeOf<HttpRequestConfig['queryParams']>().toEqualTypeOf<Record<string, string> | undefined>();
    });

    it('body should be Record<string, unknown>', () => {
      expectTypeOf<HttpRequestConfig['body']>().toEqualTypeOf<Record<string, unknown> | undefined>();
    });

    it('evaluateBodyExpressions should be boolean', () => {
      expectTypeOf<HttpRequestConfig['evaluateBodyExpressions']>().toEqualTypeOf<boolean | undefined>();
    });

    it('headers should be Record<string, string>', () => {
      expectTypeOf<HttpRequestConfig['headers']>().toEqualTypeOf<Record<string, string> | undefined>();
    });
  });
});

// ============================================================================
// HttpRequestConfig - Usage Examples
// ============================================================================

describe('HttpRequestConfig - Usage Examples', () => {
  it('should accept minimal config with only url', () => {
    const config = {
      url: '/api/validate',
    } as const satisfies HttpRequestConfig;

    expectTypeOf(config.url).toEqualTypeOf<'/api/validate'>();
  });

  it('should accept GET request with query params', () => {
    const config = {
      url: '/api/check-username',
      method: 'GET',
      queryParams: { username: 'fieldValue' },
    } as const satisfies HttpRequestConfig;

    expectTypeOf(config.method).toEqualTypeOf<'GET'>();
    expectTypeOf(config.queryParams).toMatchTypeOf<Record<string, string>>();
  });

  it('should accept POST request with body and expression evaluation', () => {
    const config = {
      url: '/api/validate-email',
      method: 'POST',
      body: { email: 'fieldValue', context: 'registration' },
      evaluateBodyExpressions: true,
    } as const satisfies HttpRequestConfig;

    expectTypeOf(config.method).toEqualTypeOf<'POST'>();
    expectTypeOf(config.evaluateBodyExpressions).toEqualTypeOf<true>();
  });

  it('should accept config with headers', () => {
    const config = {
      url: '/api/validate',
      headers: { 'X-Custom-Header': 'value', Accept: 'application/json' },
    } as const satisfies HttpRequestConfig;

    expectTypeOf(config.headers).toMatchTypeOf<Record<string, string>>();
  });

  it('should accept full config with all properties', () => {
    const config = {
      url: '/api/validate',
      method: 'PUT',
      queryParams: { id: 'formValue.id' },
      body: { data: 'fieldValue' },
      evaluateBodyExpressions: true,
      headers: { Authorization: 'Bearer token' },
    } as const satisfies HttpRequestConfig;

    expectTypeOf(config).toMatchTypeOf<HttpRequestConfig>();
  });
});

// ============================================================================
// HttpValidationResponseMapping - Whitelist Test
// ============================================================================

describe('HttpValidationResponseMapping - Exhaustive Whitelist', () => {
  type ExpectedKeys = 'validWhen' | 'errorKind' | 'errorParams';
  type ActualKeys = keyof HttpValidationResponseMapping;

  it('should have exactly the expected keys', () => {
    expectTypeOf<ActualKeys>().toEqualTypeOf<ExpectedKeys>();
  });

  describe('required keys', () => {
    it('should have validWhen and errorKind as required', () => {
      expectTypeOf<RequiredKeys<HttpValidationResponseMapping>>().toEqualTypeOf<'validWhen' | 'errorKind'>();
    });
  });

  describe('optional keys', () => {
    it('should have errorParams as optional', () => {
      expectTypeOf<OptionalKeys<HttpValidationResponseMapping>>().toEqualTypeOf<'errorParams'>();
    });
  });

  describe('property types', () => {
    it('validWhen should be string', () => {
      expectTypeOf<HttpValidationResponseMapping['validWhen']>().toEqualTypeOf<string>();
    });

    it('errorKind should be string', () => {
      expectTypeOf<HttpValidationResponseMapping['errorKind']>().toEqualTypeOf<string>();
    });

    it('errorParams should be Record<string, string>', () => {
      expectTypeOf<HttpValidationResponseMapping['errorParams']>().toEqualTypeOf<Record<string, string> | undefined>();
    });
  });
});

// ============================================================================
// HttpValidationResponseMapping - Usage Examples
// ============================================================================

describe('HttpValidationResponseMapping - Usage Examples', () => {
  it('should accept minimal mapping with validWhen and errorKind', () => {
    const mapping = {
      validWhen: 'response.available',
      errorKind: 'taken',
    } as const satisfies HttpValidationResponseMapping;

    expectTypeOf(mapping.validWhen).toEqualTypeOf<'response.available'>();
    expectTypeOf(mapping.errorKind).toEqualTypeOf<'taken'>();
  });

  it('should accept mapping with errorParams', () => {
    const mapping = {
      validWhen: 'response.valid',
      errorKind: 'invalidEmail',
      errorParams: { suggestion: 'response.suggestion', domain: 'response.domain' },
    } as const satisfies HttpValidationResponseMapping;

    expectTypeOf(mapping.errorParams).toMatchTypeOf<Record<string, string>>();
  });
});

// ============================================================================
// DeclarativeHttpValidatorConfig - Whitelist Test (L2)
// ============================================================================

describe('DeclarativeHttpValidatorConfig - Exhaustive Whitelist', () => {
  type ExpectedKeys = 'type' | 'http' | 'responseMapping' | 'when';
  type ActualKeys = keyof DeclarativeHttpValidatorConfig;

  it('should have exactly the expected keys', () => {
    expectTypeOf<ActualKeys>().toEqualTypeOf<ExpectedKeys>();
  });

  describe('required keys', () => {
    it('should have type, http, and responseMapping as required', () => {
      expectTypeOf<RequiredKeys<DeclarativeHttpValidatorConfig>>().toEqualTypeOf<'type' | 'http' | 'responseMapping'>();
    });
  });

  describe('optional keys', () => {
    it('should have when as optional', () => {
      expectTypeOf<OptionalKeys<DeclarativeHttpValidatorConfig>>().toEqualTypeOf<'when'>();
    });
  });

  describe('property types', () => {
    it('type should be literal "http"', () => {
      expectTypeOf<DeclarativeHttpValidatorConfig['type']>().toEqualTypeOf<'http'>();
    });

    it('http should be HttpRequestConfig', () => {
      expectTypeOf<DeclarativeHttpValidatorConfig['http']>().toEqualTypeOf<HttpRequestConfig>();
    });

    it('responseMapping should be HttpValidationResponseMapping', () => {
      expectTypeOf<DeclarativeHttpValidatorConfig['responseMapping']>().toEqualTypeOf<HttpValidationResponseMapping>();
    });

    it('when should be ConditionalExpression | undefined', () => {
      expectTypeOf<DeclarativeHttpValidatorConfig['when']>().toEqualTypeOf<ConditionalExpression | undefined>();
    });
  });
});

// ============================================================================
// ValidatorConfig Union Membership (L3)
// ============================================================================

describe('ValidatorConfig union', () => {
  it('should include DeclarativeHttpValidatorConfig as a member', () => {
    const config: DeclarativeHttpValidatorConfig = {
      type: 'http',
      http: { url: '/api/validate' },
      responseMapping: { validWhen: 'response.ok', errorKind: 'error' },
    };

    expectTypeOf(config).toMatchTypeOf<ValidatorConfig>();
  });

  it('should discriminate DeclarativeHttpValidatorConfig by type: "http"', () => {
    const config: ValidatorConfig = {
      type: 'http',
      http: { url: '/api' },
      responseMapping: { validWhen: 'response.ok', errorKind: 'error' },
    };

    if (config.type === 'http') {
      expectTypeOf(config).toEqualTypeOf<DeclarativeHttpValidatorConfig>();
    }
  });
});
