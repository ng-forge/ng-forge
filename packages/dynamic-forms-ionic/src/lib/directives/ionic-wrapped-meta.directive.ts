import { Directive, ElementRef, inject, input } from '@angular/core';
import { FieldMeta, applyMetaToElement } from '@ng-forge/dynamic-forms';
import { explicitEffect } from 'ngxtension/explicit-effect';

/**
 * Directive that applies meta attributes to Ionic components.
 *
 * Due to Shadow DOM encapsulation in Ionic, this directive applies meta attributes
 * to the host element rather than the internal input element. This is a limitation
 * of Ionic's component architecture.
 *
 * @example
 * ```html
 * <ion-checkbox [meta]="{ 'data-testid': 'terms-checkbox' }">
 *   Accept terms
 * </ion-checkbox>
 * ```
 */
@Directive({
  selector: 'ion-checkbox[meta], ion-toggle[meta], ion-radio[meta], ion-input[meta], ion-textarea[meta]',
})
export class IonicWrappedMetaDirective {
  private readonly el = inject(ElementRef<HTMLElement>);

  /**
   * Meta attributes to apply to the host element.
   * Note: Applied to host due to Shadow DOM encapsulation.
   */
  readonly meta = input<FieldMeta>();

  private appliedAttributes = new Set<string>();

  constructor() {
    explicitEffect([this.meta], ([meta]) => {
      // Shadow DOM - apply to host element only
      this.appliedAttributes = applyMetaToElement(this.el.nativeElement, meta, this.appliedAttributes);
    });
  }
}
