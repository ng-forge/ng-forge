import { computed, type Signal } from '@angular/core';
import { FormSubmitEvent } from '@ng-forge/dynamic-forms';
import { submitButtonFieldMapper } from '@ng-forge/dynamic-forms/integration';

/**
 * The built-in submit mapper leaves `event` unset and relies on a native <form> submit event.
 * There is no DOM here, so the button dispatches FormSubmitEvent itself.
 */
export function nativeSubmitButtonMapper(...args: Parameters<typeof submitButtonFieldMapper>): Signal<Record<string, unknown>> {
  const base = submitButtonFieldMapper(...args);
  return computed(() => ({ ...base(), event: FormSubmitEvent }));
}
