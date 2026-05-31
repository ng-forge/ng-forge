/** Base error class for all Dynamic Forms errors. */
export class DynamicFormError extends Error {
  private static readonly PREFIX = '[Dynamic Forms]';

  constructor(message: string) {
    super(`${DynamicFormError.PREFIX} ${message}`);
    this.name = 'DynamicFormError';
  }
}
