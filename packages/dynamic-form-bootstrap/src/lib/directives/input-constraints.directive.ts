import { Directive, effect, ElementRef, inject, input } from '@angular/core';
import { explicitEffect } from 'ngxtension';

/**
 * Directive to set min, max, and step attributes on form inputs
 * Workaround for Angular 21 NG8022 error when using [field] directive
 */
@Directive({
  selector: 'input[dfBsInputConstraints]',
})
export class InputConstraintsDirective {
  readonly dfMin = input<number | string | null | undefined>();
  readonly dfMax = input<number | string | null | undefined>();
  readonly dfStep = input<number | string | null | undefined>();

  private readonly el = inject<ElementRef<HTMLInputElement>>(ElementRef);

  constructor() {
    const nativeElement = this.el.nativeElement;

    explicitEffect([this.dfMin], ([minValue]) => {
      if (minValue !== null && minValue !== undefined) {
        nativeElement.setAttribute('min', String(minValue));
      } else {
        nativeElement.removeAttribute('min');
      }
    });

    explicitEffect([this.dfMax], ([maxValue]) => {
      if (maxValue !== null && maxValue !== undefined) {
        nativeElement.setAttribute('max', String(maxValue));
      } else {
        nativeElement.removeAttribute('max');
      }
    });

    explicitEffect([this.dfStep], ([stepValue]) => {
      if (stepValue !== null && stepValue !== undefined) {
        nativeElement.setAttribute('step', String(stepValue));
      } else {
        nativeElement.removeAttribute('step');
      }
    });
  }
}
