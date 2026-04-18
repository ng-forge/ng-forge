import { ChangeDetectionStrategy, Component, input, Signal, ViewContainerRef, viewChild } from '@angular/core';
import { pipe, switchMap } from 'rxjs';
import { derivedFrom } from 'ngxtension/derived-from';
import { FieldWrapperContract } from '../../models/wrapper-type';
import { DynamicText } from '../../models/types/dynamic-text';
import { dynamicTextToObservable } from '../../utils/dynamic-text-to-observable';
import { WrapperFieldInputs } from '../wrapper-field-inputs';

/**
 * Built-in CSS wrapper component.
 *
 * Applies CSS classes from the `cssClasses` config property to the host element,
 * wrapping the inner content (next wrapper or children) in its ViewContainerRef slot.
 *
 * Receives `cssClasses` as an individual Angular input (set by the outlet via
 * `setInput()`). `fieldInputs` carries the wrapped field's mapper outputs +
 * a read-only view of its form state (via `ReadonlyFieldTree`).
 *
 * @example
 * ```typescript
 * {
 *   type: 'container',
 *   key: 'styled',
 *   wrappers: [{ type: 'css', cssClasses: 'card p-4' }],
 *   fields: [...]
 * }
 * ```
 */
@Component({
  selector: 'df-css-wrapper',
  template: `<ng-container #fieldComponent></ng-container>`,
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    '[class]': 'resolvedClasses()',
  },
})
export default class CssWrapperComponent implements FieldWrapperContract {
  readonly fieldComponent = viewChild.required('fieldComponent', { read: ViewContainerRef });

  readonly cssClasses = input<DynamicText>();
  readonly fieldInputs = input<WrapperFieldInputs>();

  readonly resolvedClasses: Signal<string> = derivedFrom([this.cssClasses], pipe(switchMap(([value]) => dynamicTextToObservable(value))), {
    initialValue: '',
  });
}

export { CssWrapperComponent };
