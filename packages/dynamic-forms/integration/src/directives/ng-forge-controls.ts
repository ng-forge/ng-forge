import { afterRenderEffect, Directive, ElementRef, inject } from '@angular/core';
import { applyMetaToElement, FieldMeta, isEqual } from '@ng-forge/dynamic-forms';
import { NgForgeField } from './ng-forge-field.directive';

/**
 * Shared meta-forwarding effect. Reads the parent `NgForgeField`'s `meta`
 * signal and applies the resulting attributes (data-*, aria-*, autocomplete,
 * etc.) to a target DOM element. Handles add / update / remove via
 * `applyMetaToElement`, which receives the previously-applied attribute set
 * so stale attributes are cleared when `meta` changes.
 */
function setupControlMetaEffect(host: ElementRef<HTMLElement>, parent: NgForgeField): void {
  let appliedAttributes = new Set<string>();
  let previousMeta: FieldMeta | undefined;

  afterRenderEffect({
    write: () => {
      const currentMeta = parent.meta();
      if (isEqual(currentMeta, previousMeta)) {
        return;
      }
      previousMeta = currentMeta;
      appliedAttributes = applyMetaToElement(host.nativeElement, currentMeta, appliedAttributes);
    },
  });
}

/**
 * Marker directive applied to the canonical control element of an
 * `NgForgeField`-using component. Forwards the field's `meta` (data-*,
 * aria-*, autocomplete, etc.) onto its own host element.
 *
 * @example Single control
 * ```html
 * <input ngForgeControl [formField]="field.field()" />
 * ```
 *
 * @example Dynamic option list (e.g. radio buttons)
 * ```html
 * @for (option of options(); track option.value) {
 *   <input type="radio" ngForgeControl [value]="option.value" />
 * }
 * ```
 *
 * Each iteration of `@for` instantiates its own directive — Angular's
 * structural lifecycle creates and destroys instances as the option list
 * changes, replacing the previous `dependents` plumbing.
 */
@Directive({ selector: '[ngForgeControl]' })
export class NgForgeControl {
  constructor() {
    setupControlMetaEffect(inject(ElementRef), inject(NgForgeField));
  }
}

/**
 * Selectorless companion directive for shadow-DOM-encapsulated components
 * (PrimeNG `p-select`, Ionic web components, etc.) where no light-DOM child
 * is the canonical control. Added to the component's `hostDirectives` so the
 * field's `meta` lands on the component's own host element.
 *
 * @example
 * ```ts
 * \@Component({
 *   hostDirectives: [
 *     { directive: NgForgeField, inputs: [...NG_FORGE_FIELD_INPUTS] },
 *     NgForgeHostControl,
 *   ],
 *   template: `...`,
 * })
 * export class IonicInputField { ... }
 * ```
 */
@Directive({})
export class NgForgeHostControl {
  constructor() {
    setupControlMetaEffect(inject(ElementRef), inject(NgForgeField));
  }
}
