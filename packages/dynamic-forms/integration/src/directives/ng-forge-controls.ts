import { Directive, ElementRef, inject, input } from '@angular/core';
import { setupMarkerAttrTracking } from '../utils/setup-meta-tracking';
import { NgForgeField } from './ng-forge-field.directive';

/**
 * Marker directive applied to the canonical control element of an
 * `NgForgeField`-using component. Forwards the field's `meta` AND
 * parent-derived aria signals (`aria-invalid`, `aria-required`,
 * `aria-describedby`) onto a target element.
 *
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
