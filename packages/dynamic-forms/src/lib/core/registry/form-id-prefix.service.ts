import { computed, DestroyRef, effect, inject, Injectable, signal, Signal } from '@angular/core';
import { FORM_OPTIONS } from '../../models/field-signal-context.token';
import { DynamicFormInstanceRegistry } from './dynamic-form-instance-registry.service';

/**
 * Per-form (component-scoped) owner of the DOM-id prefix. Registers this form
 * with the root {@link DynamicFormInstanceRegistry} on construction and
 * unregisters via `DestroyRef`, so the registry's live count stays accurate.
 *
 * Exposes {@link prefix} — the Signal published through `FORM_ID_PREFIX` and
 * read by `mapFieldToInputs`. Resolution:
 * - explicit `options.idPrefix` (trimmed) wins, always;
 * - otherwise the instance's auto-id, once more than one form is mounted;
 * - otherwise `''` (no prefix — the single-form default).
 *
 * The "more than one form" trigger latches: once it fires, this form keeps its
 * prefix even if the sibling later unmounts, so already-rendered ids don't
 * churn back to unprefixed mid-session.
 */
@Injectable()
export class FormIdPrefixService {
  private readonly registry = inject(DynamicFormInstanceRegistry);
  private readonly options = inject(FORM_OPTIONS, { optional: true });

  private readonly autoId = this.registry.register();
  private readonly latched = signal(false);

  /** Effective DOM-id prefix for this form instance. */
  readonly prefix: Signal<string> = computed(() => {
    const explicit = this.options?.()?.idPrefix?.trim();
    if (explicit) return explicit;
    return this.latched() ? this.autoId : '';
  });

  constructor() {
    inject(DestroyRef).onDestroy(() => this.registry.unregister());
    // Latch true the first time a sibling form is present; never revert.
    effect(() => {
      if (this.registry.multiplePresent()) {
        this.latched.set(true);
      }
    });
  }
}
