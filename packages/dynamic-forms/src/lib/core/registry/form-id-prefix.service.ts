import { computed, DestroyRef, inject, Injectable, isDevMode, linkedSignal, Signal } from '@angular/core';
import { explicitEffect } from 'ngxtension/explicit-effect';
import { FORM_OPTIONS } from '../../models/field-signal-context.token';
import { DynamicFormLogger } from '../../providers/features/logger/logger.token';
import { DynamicFormInstanceRegistry } from './dynamic-form-instance-registry.service';

// Whitespace breaks the space-separated aria-describedby list; punctuation breaks selectors.
const INVALID_ID_CHARS = /[^\w-]+/g;

function sanitizeIdPrefix(prefix: string): string {
  return prefix.replace(INVALID_ID_CHARS, '_');
}

/**
 * Per-form owner of the DOM-id prefix, published through `FORM_ID_PREFIX`.
 * Resolution: explicit `options.idPrefix` (trimmed + sanitized) wins; else the
 * instance's auto-id once more than one form is mounted; else `''`.
 */
@Injectable()
export class FormIdPrefixService {
  private readonly registry = inject(DynamicFormInstanceRegistry);
  private readonly options = inject(FORM_OPTIONS, { optional: true });
  private readonly logger = inject(DynamicFormLogger, { optional: true });

  private readonly autoId = this.registry.register();

  private readonly rawPrefix = computed(() => this.options?.()?.idPrefix?.trim() || undefined);

  // Latches true once a sibling is present; never reverts.
  private readonly latched = linkedSignal<boolean, boolean>({
    source: () => this.registry.multiplePresent(),
    computation: (multiplePresent, previous) => (previous?.value ?? false) || multiplePresent,
  });

  readonly prefix: Signal<string> = computed(() => {
    const explicit = this.rawPrefix();
    if (explicit) return sanitizeIdPrefix(explicit);
    return this.latched() ? this.autoId : '';
  });

  constructor() {
    inject(DestroyRef).onDestroy(() => this.registry.unregister(this.autoId));

    if (isDevMode()) {
      explicitEffect([this.rawPrefix], ([raw]) => {
        const safe = raw ? sanitizeIdPrefix(raw) : raw;
        if (raw && safe !== raw) {
          this.logger?.warn(`idPrefix "${raw}" sanitized to "${safe}".`);
        }
      });
    }
  }
}
