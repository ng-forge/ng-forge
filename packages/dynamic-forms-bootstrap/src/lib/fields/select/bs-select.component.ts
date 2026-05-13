import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { FormField } from '@angular/forms/signals';
import { DynamicTextPipe, FieldOption } from '@ng-forge/dynamic-forms';
import {
  NgForgeControl,
  injectNgForgeField,
  NgForgeField,
  NgForgeFieldShell,
  NG_FORGE_FIELD_SHELL_INPUTS,
  NG_FORGE_VALUE_FIELD_INPUTS,
} from '@ng-forge/dynamic-forms/integration';
import { BsSelectProps } from './bs-select.type';
import { AsyncPipe } from '@angular/common';

@Component({
  selector: 'df-bs-select',
  imports: [FormField, DynamicTextPipe, AsyncPipe, NgForgeControl],
  styleUrl: '../../styles/_form-field.scss',
  hostDirectives: [
    { directive: NgForgeFieldShell, inputs: [...NG_FORGE_FIELD_SHELL_INPUTS] },
    { directive: NgForgeField, inputs: [...NG_FORGE_VALUE_FIELD_INPUTS] },
  ],
  template: `
    @let f = ngf.field(); @let selectId = ngf.key() + '-select';

    <div class="mb-3">
      @if (ngf.label(); as label) {
        <label [for]="selectId" class="form-label">{{ label | dynamicText | async }}</label>
      }
      <select
        ngForgeControl
        [formField]="f"
        [id]="selectId"
        [attr.tabindex]="ngf.tabIndex()"
        class="form-select"
        [class.form-select-sm]="props()?.size === 'sm'"
        [class.form-select-lg]="props()?.size === 'lg'"
        [class.is-invalid]="f().invalid() && f().touched()"
        [multiple]="props()?.multiple || false"
        [size]="props()?.htmlSize"
      >
        @if (ngf.placeholder(); as placeholder) {
          <option value="" disabled [selected]="!f().value()">{{ placeholder | dynamicText | async }}</option>
        }
        @for (option of options(); track option.value) {
          <option [value]="option.value" [disabled]="option.disabled || false" [selected]="isSelected(option.value, f().value())">
            {{ option.label | dynamicText | async }}
          </option>
        }
      </select>

      @if (ngf.errorsToDisplay()[0]; as error) {
        <div class="invalid-feedback d-block" [id]="ngf.errorId()" role="alert">{{ error.message }}</div>
      } @else if (props()?.hint; as hint) {
        <div class="form-text" [id]="ngf.hintId()">{{ hint | dynamicText | async }}</div>
      }
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
  styles: [
    `
      :host([hidden]) {
        display: none !important;
      }
    `,
  ],
})
export default class BsSelectFieldComponent {
  protected readonly ngf = injectNgForgeField<string>();

  readonly options = input<FieldOption<string>[]>([]);
  readonly props = input<BsSelectProps>();

  defaultCompare = Object.is;

  protected isSelected(optionValue: string, fieldValue: string | string[] | null): boolean {
    const compareWith = this.props()?.compareWith || this.defaultCompare;

    if (Array.isArray(fieldValue)) {
      return fieldValue.some((v) => compareWith(v, optionValue));
    }

    return fieldValue !== null && compareWith(fieldValue, optionValue);
  }
}
