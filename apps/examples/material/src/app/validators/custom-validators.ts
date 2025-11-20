import type { CustomValidator } from '@ng-forge/dynamic-form';

/**
 * Validator that checks if a password is strong enough
 * Requirements: uppercase, lowercase, number, and special character
 */
export const strongPassword: CustomValidator<string> = (ctx) => {
  const value = ctx.value();

  if (!value || typeof value !== 'string') {
    return null;
  }

  const hasUppercase = /[A-Z]/.test(value);
  const hasLowercase = /[a-z]/.test(value);
  const hasNumber = /[0-9]/.test(value);
  const hasSpecial = /[!@#$%^&*(),.?":{}|<>]/.test(value);

  if (!hasUppercase || !hasLowercase || !hasNumber || !hasSpecial) {
    return {
      kind: 'strongPassword',
    };
  }

  return null;
};

/**
 * Validator that checks if a string contains no spaces
 */
export const noSpaces: CustomValidator<string> = (ctx) => {
  const value = ctx.value();

  if (!value || typeof value !== 'string') {
    return null;
  }

  if (value.includes(' ')) {
    return {
      kind: 'noSpaces',
    };
  }

  return null;
};

/**
 * Validator that checks if a value is within a specific range
 */
export const inRange: CustomValidator<number> = (ctx, params) => {
  const value = ctx.value();
  const min = (params?.min as number) ?? 0;
  const max = (params?.max as number) ?? 100;

  if (value === null || value === undefined) {
    return null;
  }

  const numValue = typeof value === 'string' ? parseFloat(value) : value;

  if (isNaN(numValue)) {
    return null;
  }

  if (numValue < min || numValue > max) {
    return {
      kind: 'range',
      params: { min, max, actual: numValue },
    };
  }

  return null;
};

/**
 * Cross-field validator that checks if one field's value is less than another's
 */
export const lessThan: CustomValidator = (ctx, params) => {
  const value = ctx.value();
  const compareToPath = params?.field as string;

  if (!compareToPath) {
    return null;
  }

  const otherValue = ctx.valueOf(compareToPath as any);

  if (value === undefined || value === null || otherValue === undefined || otherValue === null) {
    return null;
  }

  const numValue = typeof value === 'string' ? parseFloat(value) : Number(value);
  const numOtherValue = typeof otherValue === 'string' ? parseFloat(otherValue) : Number(otherValue);

  if (isNaN(numValue) || isNaN(numOtherValue)) {
    return null;
  }

  if (numValue >= numOtherValue) {
    return {
      kind: 'lessThan',
      params: { field: compareToPath, value: numValue, compareValue: numOtherValue },
    };
  }

  return null;
};

/**
 * Validator that checks if passwords match
 */
export const passwordsMatch: CustomValidator = (ctx) => {
  const confirmPassword = ctx.value();
  const password = ctx.valueOf('password' as any);

  if (!confirmPassword || !password) {
    return null;
  }

  if (confirmPassword !== password) {
    return {
      kind: 'passwordsMatch',
    };
  }

  return null;
};

/**
 * Export all validators as a registry object
 */
export const customValidators = {
  strongPassword,
  noSpaces,
  inRange,
  lessThan,
  passwordsMatch,
};
