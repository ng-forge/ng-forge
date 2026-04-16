import { ChangeDetectionStrategy, Component, input, ViewContainerRef, viewChild } from '@angular/core';
import { FieldWrapperContract } from '../../models/wrapper-type';
import { WrapperFieldInputs } from '../wrapper-field-inputs';

/**
 * Built-in row wrapper component.
 *
 * Applies the grid/flex layout that `{ type: 'row' }` fields historically rendered.
 * The `rowFieldMapper` synthesizes a `{ type: 'row' }` wrapper into the container
 * field so the user-facing config stays `{ type: 'row', fields: [...] }` while the
 * runtime uses the container + wrapper pipeline.
 *
 * Children use the shared `df-col-1`..`df-col-12` utilities on their own `col`
 * property to size within the flex row.
 */
@Component({
  selector: 'df-row-wrapper',
  template: `<ng-container #fieldComponent></ng-container>`,
  styleUrl: './row-wrapper.component.scss',
  host: {
    class: 'df-field df-row',
  },
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class RowWrapperComponent implements FieldWrapperContract {
  readonly fieldComponent = viewChild.required('fieldComponent', { read: ViewContainerRef });

  /**
   * Mapper outputs for the wrapped field.
   * The row wrapper itself does not consume these — the input is accepted
   * for contract consistency so the outlet can set it on any wrapper.
   */
  readonly fieldInputs = input<WrapperFieldInputs>();
}

export { RowWrapperComponent };
