import { Directive, ElementRef, inject, input } from '@angular/core';
import { setupMarkerAttrTracking } from '../utils/setup-meta-tracking';
import { NgForgeField } from './ng-forge-field.directive';

/**
 * Marker directive applied to the canonical control element of an
 * `NgForgeField`-using component. Forwards the field's `meta` AND
 * parent-derived aria signals (`aria-invalid`, `aria-required`,
 * `aria-describedby`) onto a target element.
 *
 * By default attributes land on the directive's own host. For wrapped
 * controls (e.g. `<mat-checkbox>`, `<p-toggleSwitch>`) where the canonical
 * native input is rendered as a descendant inside the wrapper, pass a CSS
 * selector through the input alias — the directive caches the resolved
 * descendant set and re-resolves only when the selector changes.
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
    const parent = inject(NgForgeField);
    setupMarkerAttrTracking(inject(ElementRef), parent, () => this.target());
    parent.markClaimed();
  }
}

/**
 * Selectorless companion directive for shadow-DOM-encapsulated components
 * (PrimeNG `p-select`, Ionic web components, etc.) where no light-DOM child
 * is the canonical control. Added to the component's `hostDirectives` so the
 * field's `meta` + parent aria land on the component's own host element.
 *
 * For split parent/control components (e.g. `df-prime-select` rendering
 * `df-prime-select-control` internally), place `NgForgeHostControl` on the
 * INNER control component's `hostDirectives` — the inner element is the
 * canonical control, and the marker's `inject(NgForgeField)` walks up the
 * element-injector tree to find the parent's directive instance.
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
// Empty `@Directive({})` is intentional — selectorless; used only via `hostDirectives`.
@Directive({})
export class NgForgeHostControl {
  constructor() {
    const parent = inject(NgForgeField);
    setupMarkerAttrTracking(inject(ElementRef), parent, () => undefined);
    parent.markClaimed();
  }
}
