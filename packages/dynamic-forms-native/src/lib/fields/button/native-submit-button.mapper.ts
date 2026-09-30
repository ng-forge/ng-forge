import { computed, Signal } from '@angular/core';
import { FormSubmitEvent } from '@ng-forge/dynamic-forms';
import { submitButtonFieldMapper } from '@ng-forge/dynamic-forms/integration';

/**
 * Core's submit mapper leaves `event` unset because web adapters render `<button type="submit">`
 * and let the `<form>` submit event do the work. There is no DOM form here, so the button
 * dispatches FormSubmitEvent itself.
 */
export function nativeSubmitButtonFieldMapper(...args: Parameters<typeof submitButtonFieldMapper>): Signal<Record<string, unknown>> {
  const base = submitButtonFieldMapper(...args);
  return computed(() => ({ ...base(), event: FormSubmitEvent }));
}
