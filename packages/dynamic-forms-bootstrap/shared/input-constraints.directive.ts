import { Directive, ElementRef, inject, input } from '@angular/core';
import { explicitEffect } from 'ngxtension/explicit-effect';

/** Declaratively reflects min, max, and step signal inputs to a native form control. */
@Directive({
  selector: '[dfBsInputConstraints]',
})
export class InputConstraintsDirective {
  readonly dfMin = input<number | string | null | undefined>();
  readonly dfMax = input<number | string | null | undefined>();
  readonly dfStep = input<number | string | null | undefined>();

  private readonly element = inject<ElementRef<HTMLInputElement>>(ElementRef);

  private readonly minEffect = explicitEffect([this.dfMin], ([value]) => this.reflectAttribute('min', value));
  private readonly maxEffect = explicitEffect([this.dfMax], ([value]) => this.reflectAttribute('max', value));
  private readonly stepEffect = explicitEffect([this.dfStep], ([value]) => this.reflectAttribute('step', value));

  private reflectAttribute(name: 'min' | 'max' | 'step', value: number | string | null | undefined): void {
    if (value === null || value === undefined) {
      this.element.nativeElement.removeAttribute(name);
      return;
    }
    this.element.nativeElement.setAttribute(name, String(value));
  }
}
