import { ChangeDetectionStrategy, Component, input, ViewContainerRef, viewChild } from '@angular/core';
import { FieldWrapper } from '../../models/wrapper-type';
import { WrapperFieldInputs } from '../wrapper-field-inputs';

/** Built-in row wrapper component. */
@Component({
  selector: 'df-row-wrapper',
  template: `<ng-container #fieldComponent></ng-container>`,
  styleUrl: './row-wrapper.component.scss',
  host: {
    class: 'df-field df-row',
  },
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class RowWrapperComponent implements FieldWrapper {
  readonly fieldComponent = viewChild.required('fieldComponent', { read: ViewContainerRef });

  /**
   * Mapper outputs for the wrapped field.
   * The row wrapper itself does not consume these — the input is accepted
   * for contract consistency so the outlet can set it on any wrapper.
   */
  readonly fieldInputs = input<WrapperFieldInputs>();
}

export { RowWrapperComponent };
