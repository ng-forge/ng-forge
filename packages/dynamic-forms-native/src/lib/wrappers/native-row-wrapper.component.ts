import { ChangeDetectionStrategy, Component, input, viewChild, ViewContainerRef } from '@angular/core';
import type { FieldWrapper, WrapperFieldInputs } from '@ng-forge/dynamic-forms/integration';

/**
 * Replaces core's `row` wrapper, whose columns are CSS grid. React Native lays out with flexbox
 * only, so the row wraps its fields and each `df-col-N` class core puts on a field becomes a
 * percentage width (see field.css).
 */
@Component({
  selector: 'df-native-row-wrapper',
  template: `<ng-container #fieldComponent></ng-container>`,
  styleUrl: './native-row-wrapper.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class NativeRowWrapperComponent implements FieldWrapper {
  readonly fieldComponent = viewChild.required('fieldComponent', { read: ViewContainerRef });
  /** Accepted for the wrapper contract; the row does not read the wrapped field's inputs. */
  readonly fieldInputs = input<WrapperFieldInputs>();
}
