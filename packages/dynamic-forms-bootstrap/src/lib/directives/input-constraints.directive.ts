import { Directive, ElementRef, inject, input } from '@angular/core';
import { explicitEffect } from 'ngxtension/explicit-effect';

/**
 * Directive to set min, max, and step attributes on form inputs
 */
@Directive({
  selector: '[dfBsInputConstraints]',
})
export class InputConstraintsDirective {
  readonly dfMin = input<number | string | null | undefined>();
  readonly dfMax = input<number | string | null | undefined>();
  readonly dfStep = input<number | string | null | undefined>();

  private readonly el = inject<ElementRef<HTMLInputElement>>(ElementRef);

  private readonly minEffect = explicitEffect([this.dfMin], ([minValue]) => {
    const nativeElement = this.el.nativeElement;
    if (minValue !== null && minValue !== undefined) {
      nativeElement.setAttribute('min', String(minValue));
    } else {
      nativeElement.removeAttribute('min');
    }
  });

  private readonly maxEffect = explicitEffect([this.dfMax], ([maxValue]) => {
    const nativeElement = this.el.nativeElement;
    if (maxValue !== null && maxValue !== undefined) {
      nativeElement.setAttribute('max', String(maxValue));
    } else {
      nativeElement.removeAttribute('max');
    }
  });

  private readonly stepEffect = explicitEffect([this.dfStep], ([stepValue]) => {
    const nativeElement = this.el.nativeElement;
    if (stepValue !== null && stepValue !== undefined) {
      nativeElement.setAttribute('step', String(stepValue));
    } else {
      nativeElement.removeAttribute('step');
    }
  });
}
