import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { FormField } from '@angular/forms/signals';
import { DynamicTextPipe, FieldOption, ValueType } from '@ng-forge/dynamic-forms';
import {
  injectNgForgeField,
  NgForgeField,
  NgForgeFieldShell,
  NG_FORGE_FIELD_SHELL_INPUTS,
  NG_FORGE_VALUE_FIELD_INPUTS,
} from '@ng-forge/dynamic-forms/integration';
import { BsRadioProps } from './bs-radio.type';
import { AsyncPipe } from '@angular/common';
import { BsRadioGroupComponent } from './bs-radio-group.component';

@Component({
  selector: 'df-bs-radio',
  imports: [BsRadioGroupComponent, FormField, DynamicTextPipe, AsyncPipe],
  styleUrl: '../../styles/_form-field.scss',
  hostDirectives: [
    { directive: NgForgeFieldShell, inputs: [...NG_FORGE_FIELD_SHELL_INPUTS] },
    { directive: NgForgeField, inputs: [...NG_FORGE_VALUE_FIELD_INPUTS] },
  ],
  template: `
    @let f = ngf.field();

    <div class="mb-3">
      @if (ngf.label(); as label) {
        <div class="form-label">{{ label | dynamicText | async }}</div>
      }

      <df-bs-radio-group [formField]="f" [label]="ngf.label()" [options]="options()" [properties]="props()" />

      @if (ngf.errorsToDisplay()[0]; as error) {
        <div class="invalid-feedback d-block" [id]="ngf.errorId()" role="alert">{{ error.message }}</div>
      } @else if (props()?.hint; as hint) {
        <div class="form-text" [id]="ngf.hintId()">{{ hint | dynamicText | async }}</div>
      }
    </div>
  `,
  styles: [
    `
      :host {
        display: block;
      }

      :host([hidden]) {
        display: none !important;
      }
    `,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class BsRadioFieldComponent {
  protected readonly ngf = injectNgForgeField<ValueType>();

  readonly options = input<FieldOption<ValueType>[]>([]);
  readonly props = input<BsRadioProps>();
}
