import { afterRenderEffect, Directive, ElementRef, inject, input } from '@angular/core';
import { applyMetaToElement, FieldMeta, isEqual } from '@ng-forge/dynamic-forms';
import { NgForgeField } from './ng-forge-field.directive';

/**
 * Apply meta to the directive's own host (when no target selector is set)
 * or to all descendants matching the selector. Tracks applied attributes
 * per element so changes to `meta` clear stale attributes.
 */
function setupControlMetaEffect(host: ElementRef<HTMLElement>, parent: NgForgeField, targetSelector: () => string | undefined): void {
  const appliedByElement = new WeakMap<Element, Set<string>>();
  let previousMeta: FieldMeta | undefined;

  afterRenderEffect({
    write: () => {
      const currentMeta = parent.meta();
      const selector = targetSelector()?.trim() || undefined;

      // Re-query every effect run when a selector is set: late-rendered
      // descendants (e.g. mat-radio-group children appearing on options
      // change) must still pick up meta. For the host-only path we can
      // short-circuit when meta hasn't changed.
      if (!selector && isEqual(currentMeta, previousMeta)) {
        return;
      }
      previousMeta = currentMeta;

      const targets: Element[] = selector ? Array.from(host.nativeElement.querySelectorAll(selector)) : [host.nativeElement];

      for (const el of targets) {
        const applied = appliedByElement.get(el) ?? new Set<string>();
        appliedByElement.set(el, applyMetaToElement(el as HTMLElement, currentMeta, applied));
      }
    },
  });
}

/**
 * Marker directive applied to the canonical control element of an
 * `NgForgeField`-using component. Forwards the field's `meta` (data-*,
 * aria-*, autocomplete, etc.) onto a target element.
 *
 * By default meta lands on the directive's own host element. For wrapped
 * controls (e.g. `<mat-checkbox>`, `<p-toggleSwitch>`) where the canonical
 * native input is rendered as a descendant inside the wrapper, pass a CSS
 * selector through the input alias — the directive queries the host
 * subtree and applies meta to every matching descendant on each render
 * cycle, so descendants rendered later are still covered.
 *
 * @example Bare native control
 * ```html
 * <input ngForgeControl [formField]="ngf.field()" />
 * ```
 *
 * @example Wrapped control with inner native input
 * ```html
 * <mat-checkbox ngForgeControl="input[type='checkbox']" [formField]="ngf.field()">
 *   {{ ngf.label() }}
 * </mat-checkbox>
 * ```
 *
 * @example Dynamic option list (radios rendered in @for)
 * ```html
 * @for (option of options(); track option.value) {
 *   <input type="radio" ngForgeControl [value]="option.value" />
 * }
 * ```
 *
 * Each `@for` iteration creates its own directive instance; Angular's
 * structural lifecycle handles add/remove naturally.
 */
@Directive({ selector: '[ngForgeControl]' })
export class NgForgeControl {
  readonly target = input<string | undefined>(undefined, { alias: 'ngForgeControl' });

  constructor() {
    setupControlMetaEffect(inject(ElementRef), inject(NgForgeField), () => this.target());
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
    setupControlMetaEffect(inject(ElementRef), inject(NgForgeField), () => undefined);
  }
}
