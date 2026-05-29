import { computed, DestroyRef, ElementRef, inject, Injectable, isDevMode, PLATFORM_ID, Signal } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
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
 * instance's auto-id while more than one form is *visibly* mounted; else `''`.
 *
 * The auto-prefix is reactive (not latched): a form reverts to unprefixed once
 * it's the only visible one again, so navigating away from a multi-form page
 * (incl. ionic's cached `ion-router-outlet` stack) doesn't leave it stuck.
 */
@Injectable()
export class FormIdPrefixService {
  private readonly registry = inject(DynamicFormInstanceRegistry);
  private readonly options = inject(FORM_OPTIONS, { optional: true });
  private readonly logger = inject(DynamicFormLogger, { optional: true });
  private readonly host = inject(ElementRef<HTMLElement>).nativeElement;

  private readonly autoId = this.registry.register(this.host);

  private readonly rawPrefix = computed(() => this.options?.()?.idPrefix?.trim() || undefined);

  readonly prefix: Signal<string> = computed(() => {
    const explicit = this.rawPrefix();
    if (explicit) return sanitizeIdPrefix(explicit);
    return this.registry.multiplePresent() ? this.autoId : '';
  });

  constructor() {
    const destroyRef = inject(DestroyRef);
    destroyRef.onDestroy(() => this.registry.unregister(this.autoId));

    // A form's host box collapses to 0 when it (or an ancestor) becomes display:none
    // and restores when shown — re-evaluate the visible-form count on either edge.
    if (isPlatformBrowser(inject(PLATFORM_ID)) && typeof ResizeObserver !== 'undefined') {
      const ro = new ResizeObserver(() => this.registry.refreshVisibility());
      ro.observe(this.host);
      destroyRef.onDestroy(() => ro.disconnect());
    }

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
