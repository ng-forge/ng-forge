import { Directive, ElementRef, inject, input } from '@angular/core';
import { FieldMeta, applyMetaToElement } from '@ng-forge/dynamic-forms';
import { explicitEffect } from 'ngxtension/explicit-effect';

/**
 * Directive that applies meta attributes to the native input element inside PrimeNG components.
 *
 * PrimeNG components like p-checkbox, p-toggleSwitch, and p-radioButton wrap their
 * native input elements. This directive finds those internal inputs and applies meta attributes
 * to them, enabling proper accessibility and testing attributes.
 *
 * @example
 * ```html
 * <p-checkbox [meta]="{ 'data-testid': 'terms-checkbox' }">
 *   Accept terms
 * </p-checkbox>
 * ```
 */
@Directive({
  selector: 'p-checkbox[meta], p-toggleswitch[meta], p-toggleSwitch[meta], p-toggle-switch[meta], p-radiobutton[meta], p-radioButton[meta]',
})
export class PrimeWrappedMetaDirective {
  private readonly el = inject(ElementRef<HTMLElement>);

  /**
   * Meta attributes to apply to the native input element.
   */
  readonly meta = input<FieldMeta>();

  private appliedAttributes = new Set<string>();

  constructor() {
    explicitEffect([this.meta], ([meta]) => {
      const input = this.el.nativeElement.querySelector('input');
      if (input) {
        this.appliedAttributes = applyMetaToElement(input, meta, this.appliedAttributes);
      }
    });
  }
}
