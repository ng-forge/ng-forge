import { computed, DestroyRef, ElementRef, inject, Injectable, isDevMode, PLATFORM_ID, signal, Signal } from '@angular/core';
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

function isRendered(host: HTMLElement): boolean {
  if (!host.isConnected) return false;
  if (typeof host.checkVisibility === 'function') return host.checkVisibility();
  const rect = host.getBoundingClientRect();
  return rect.width > 0 || rect.height > 0;
}

/**
 * Per-form owner of the DOM-id prefix, published through `FORM_ID_PREFIX`.
 * Resolution: explicit `options.idPrefix` (trimmed + sanitized) wins; else the
 * instance's auto-id while more than one form is *visibly* mounted; else `''`.
 *
 * Not latched: a form reverts to unprefixed once it's the only visible one, so
 * navigating away from a multi-form page (incl. ionic's cached `ion-router-outlet`
 * stack) doesn't leave it stuck-prefixed.
 */
@Injectable()
export class FormIdPrefixService {
  private readonly registry = inject(DynamicFormInstanceRegistry);
  private readonly options = inject(FORM_OPTIONS, { optional: true });
  private readonly logger = inject(DynamicFormLogger, { optional: true });
  private readonly host = inject(ElementRef<HTMLElement>).nativeElement;

  // Optimistic: counts toward "multiple present" until the ResizeObserver confirms
  // whether it's actually rendered. Starting true keeps SSR and the client's first
  // render in agreement (both count-all), avoiding a hydration mismatch; the
  // observer corrects it after layout (a normal reactive update, not a hydration error).
  private readonly visible = signal(true);

  private readonly autoId = this.registry.register(this.visible);

  private readonly rawPrefix = computed(() => this.options?.()?.idPrefix?.trim() || undefined);

  readonly prefix: Signal<string> = computed(() => {
    const explicit = this.rawPrefix();
    if (explicit) return sanitizeIdPrefix(explicit);
    return this.registry.multiplePresent() ? this.autoId : '';
  });

  constructor() {
    const destroyRef = inject(DestroyRef);
    destroyRef.onDestroy(() => this.registry.unregister(this.autoId));

    // A host's box collapses to 0 on display:none and restores when shown. set() is
    // a no-op when the value is unchanged, so plain resizes don't churn field inputs.
    if (isPlatformBrowser(inject(PLATFORM_ID)) && typeof ResizeObserver !== 'undefined') {
      const ro = new ResizeObserver(() => this.visible.set(isRendered(this.host)));
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
