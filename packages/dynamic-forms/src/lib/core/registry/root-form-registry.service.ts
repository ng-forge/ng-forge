import { Signal } from '@angular/core';
import { FieldTree } from '@angular/forms/signals';

/**
 * Registry service that provides access to the root form and its values.
 *
 * Constructed via factory in `provideDynamicFormDI` with signals from
 * `FormStateManager` — no DI injection, no Maps, no lifecycle.
 */
export class RootFormRegistryService {
  constructor(
    readonly formValue: Signal<Record<string, unknown>>,
    readonly rootForm: Signal<FieldTree<Record<string, unknown>> | undefined>,
  ) {}
}
