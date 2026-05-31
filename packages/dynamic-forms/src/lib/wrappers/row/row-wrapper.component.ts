import { ChangeDetectionStrategy, Component, input, ViewContainerRef, viewChild } from '@angular/core';
import { FieldWrapper } from '@ng-forge/dynamic-forms/internal';
import { WrapperFieldInputs } from '@ng-forge/dynamic-forms/internal';

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
