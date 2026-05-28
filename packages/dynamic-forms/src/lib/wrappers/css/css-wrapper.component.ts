import { ChangeDetectionStrategy, Component, input, Signal, ViewContainerRef, viewChild } from '@angular/core';
import { pipe, switchMap } from 'rxjs';
import { derivedFrom } from 'ngxtension/derived-from';
import { FieldWrapper } from '../../models/wrapper-type';
import { DynamicText } from '../../models/types/dynamic-text';
import { dynamicTextToObservable } from '../../utils/dynamic-text-to-observable';
import { WrapperFieldInputs } from '../wrapper-field-inputs';

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
