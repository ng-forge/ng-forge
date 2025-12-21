/**
 * Base error class for all Dynamic Forms errors.
 *
 * This class centralizes the `[Dynamic Forms]` prefix, ensuring consistent
 * error messaging across the library without requiring each error site to
 * manually include the prefix.
 */
export class DynamicFormError extends Error {
  private static readonly PREFIX = '[Dynamic Forms]';

  constructor(message: string) {
    super(`${DynamicFormError.PREFIX} ${message}`);
    this.name = 'DynamicFormError';
  }
}
