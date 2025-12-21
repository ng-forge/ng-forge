import { Directive, ElementRef, inject, input } from '@angular/core';
import { explicitEffect } from 'ngxtension/explicit-effect';
import { FieldMeta } from '../definitions/base/field-meta';
import { applyMetaToElement } from '../utils/apply-meta';

/**
 * Directive that applies meta attributes to native form elements.
 *
 * This directive is used for elements that have direct access to native inputs,
 * such as input, textarea, and select elements. For wrapped components (like
 * Material, PrimeNG, Ionic), use the library-specific wrapped-meta directives.
 *
 * @example
 * ```html
 * <input [meta]="{ autocomplete: 'email', 'data-testid': 'email-input' }" />
 * <textarea [meta]="{ spellcheck: true }" />
 * ```
 */
@Directive({
  selector: 'input[meta], textarea[meta], select[meta]',
})
export class FieldMetaDirective {
  private readonly el = inject(ElementRef<HTMLElement>);

  /**
   * Meta attributes to apply to the element.
   */
  readonly meta = input<FieldMeta>();

  private appliedAttributes = new Set<string>();

  constructor() {
    explicitEffect([this.meta], ([meta]) => {
      this.appliedAttributes = applyMetaToElement(this.el.nativeElement, meta, this.appliedAttributes);
    });
  }
}
