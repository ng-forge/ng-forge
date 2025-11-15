import { Directive, effect, ElementRef, input } from '@angular/core';

/**
 * Directive to set min, max, and step attributes on form inputs
 * Workaround for Angular 21 NG8022 error when using [field] directive
 */
@Directive({
  selector: 'input[dfInputConstraints]',
})
export class InputConstraintsDirective {
  readonly dfMin = input<number | string | null | undefined>();
  readonly dfMax = input<number | string | null | undefined>();
  readonly dfStep = input<number | string | null | undefined>();

  constructor(private el: ElementRef<HTMLInputElement>) {
    // Use effect to reactively update attributes when inputs change
    effect(() => {
      const nativeElement = this.el.nativeElement;

      const minValue = this.dfMin();
      if (minValue !== null && minValue !== undefined) {
        nativeElement.setAttribute('min', String(minValue));
      } else {
        nativeElement.removeAttribute('min');
      }

      const maxValue = this.dfMax();
      if (maxValue !== null && maxValue !== undefined) {
        nativeElement.setAttribute('max', String(maxValue));
      } else {
        nativeElement.removeAttribute('max');
      }

      const stepValue = this.dfStep();
      if (stepValue !== null && stepValue !== undefined) {
        nativeElement.setAttribute('step', String(stepValue));
      } else {
        nativeElement.removeAttribute('step');
      }
    });
  }
}
