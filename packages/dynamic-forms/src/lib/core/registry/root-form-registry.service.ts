import { computed, inject, Injectable } from '@angular/core';
import { DYNAMIC_FORM_REF } from './dynamic-form-ref.token';

/**
 * Registry service that provides access to the root form and its values.
 *
 * Injects `DYNAMIC_FORM_REF` (provided by DynamicForm) and exposes computed
 * signals — no imperative register/unregister lifecycle, no Maps, no formId
 * indirection.
 *
 * This service should be provided at the component level to ensure proper
 * isolation between different form instances.
 */
@Injectable()
export class RootFormRegistryService {
  private readonly formRef = inject(DYNAMIC_FORM_REF);

  /** Current form values — reads directly from the entity signal. */
  readonly formValue = computed<Record<string, unknown>>(() => this.formRef.entity());

  /** The FieldTree instance. */
  readonly rootForm = computed(() => this.formRef.form());
}
