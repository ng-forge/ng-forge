import { ChangeDetectionStrategy, Component, input, Signal, ViewContainerRef, viewChild } from '@angular/core';
import { pipe, switchMap } from 'rxjs';
import { derivedFrom } from 'ngxtension/derived-from';
import { FieldWrapper } from '@ng-forge/dynamic-forms/internal';
import { DynamicText } from '@ng-forge/dynamic-forms/internal';
import { dynamicTextToObservable } from '@ng-forge/dynamic-forms/internal';
import { WrapperFieldInputs } from '@ng-forge/dynamic-forms/internal';

/** Built-in CSS wrapper component. */
@Component({
  selector: 'df-css-wrapper',
  template: `<ng-container #fieldComponent></ng-container>`,
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    '[class]': 'resolvedClasses()',
  },
})
export default class CssWrapperComponent implements FieldWrapper {
  readonly fieldComponent = viewChild.required('fieldComponent', { read: ViewContainerRef });

  readonly cssClasses = input<DynamicText>();
  readonly fieldInputs = input<WrapperFieldInputs>();

  readonly resolvedClasses: Signal<string> = derivedFrom([this.cssClasses], pipe(switchMap(([value]) => dynamicTextToObservable(value))), {
    initialValue: '',
  });
}

export { CssWrapperComponent };
