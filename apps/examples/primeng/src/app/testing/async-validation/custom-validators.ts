import { AsyncCustomValidator, HttpCustomValidator } from '@ng-forge/dynamic-forms';
import { rxResource } from '@angular/core/rxjs-interop';
import { of } from 'rxjs';
import { delay, map } from 'rxjs/operators';

// Mock database of taken product codes
const TAKEN_PRODUCT_CODES = ['PROD-001', 'PROD-002', 'PROD-123'];

/**
 * Resource-based async validator (simulates database lookup)
 */
export const checkProductCode: AsyncCustomValidator = {
  params: (ctx) => ctx.value() as string,
  factory: (params) => {
    return rxResource({
      stream: () => {
        const currentParams = params() as string | undefined;

        if (!currentParams) {
          return of(false);
        }
        // Simulate async database lookup with 500ms delay
        return of(currentParams).pipe(
          delay(500),
          map((code) => TAKEN_PRODUCT_CODES.includes(code)),
        );
      },
    });
  },
  onSuccess: (result: unknown) => {
    // If product code is found in the taken list, return error
    return result ? { kind: 'productCodeTaken' } : null;
  },
  onError: (error: unknown) => {
    console.error('Product code check failed:', error);
    return null; // Don't block form on errors
  },
};

/**
 * HTTP GET validator for username availability
 */
export const checkUsernameAvailability: HttpCustomValidator = {
  request: (ctx) => `/api/users/check-username?username=${encodeURIComponent(String(ctx.value()))}`,
  onSuccess: (response: unknown) => {
    const result = response as { available: boolean };
    return result.available ? null : { kind: 'usernameTaken' };
  },
  onError: () => null, // Don't block form on network errors
};

/**
 * HTTP POST validator for email validation
 */
export const validateEmail: HttpCustomValidator = {
  request: (ctx) => ({
    url: '/api/users/validate-email',
    method: 'POST' as const,
    body: {
      email: ctx.value(),
    },
  }),
  onSuccess: (response: unknown) => {
    const result = response as { valid: boolean };
    return result.valid ? null : { kind: 'invalidEmail' };
  },
  onError: () => null,
};
