import { Directive, ElementRef, inject, input } from '@angular/core';
import { FieldMeta, applyMetaToElement } from '@ng-forge/dynamic-forms';
import { explicitEffect } from 'ngxtension/explicit-effect';

/**
 * Directive that applies meta attributes to Material components.
 *
 * For components with accessible native inputs (mat-checkbox, mat-slide-toggle, mat-radio-group),
 * meta attributes are applied directly to the internal input elements.
 *
 * For components without accessible native inputs (mat-select), meta attributes are applied
 * to the host element instead.
 *
 * @example
 * ```html
 * <mat-checkbox [meta]="{ 'data-testid': 'terms-checkbox' }">
 *   Accept terms
 * </mat-checkbox>
 *
 * <mat-select [meta]="{ 'data-testid': 'country-select' }">
 *   ...
 * </mat-select>
 * ```
 */
@Directive({
  selector: 'mat-checkbox[meta], mat-slide-toggle[meta], mat-radio-group[meta], mat-select[meta]',
})
export class MatWrappedMetaDirective {
  private readonly el = inject(ElementRef<HTMLElement>);

  /**
   * Meta attributes to apply to the element(s).
   */
  readonly meta = input<FieldMeta>();

  private appliedAttributes = new Set<string>();

  constructor() {
    explicitEffect([this.meta], ([meta]) => {
      const tagName = this.el.nativeElement.tagName.toLowerCase();

      // mat-select has no native input - apply to host element
      if (tagName === 'mat-select') {
        this.appliedAttributes = applyMetaToElement(this.el.nativeElement, meta, this.appliedAttributes);
        return;
      }

      // Radio groups have multiple inputs, checkbox/toggle have one
      const isRadioGroup = tagName === 'mat-radio-group';
      const inputs = isRadioGroup
        ? Array.from(this.el.nativeElement.querySelectorAll('input[type="radio"]'))
        : [this.el.nativeElement.querySelector('input')];

      inputs.forEach((input) => {
        if (input) {
          this.appliedAttributes = applyMetaToElement(input, meta, this.appliedAttributes);
        }
      });
    });
  }
}
