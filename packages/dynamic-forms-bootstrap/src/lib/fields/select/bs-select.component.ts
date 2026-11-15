import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { FormField } from '@angular/forms/signals';
import { FieldOption } from '@ng-forge/dynamic-forms';
import { DynamicTextPipe } from '@ng-forge/dynamic-forms/integration';
import { NgForgeControl, injectNgForgeField, NgForgeFieldHost } from '@ng-forge/dynamic-forms/integration';
import { BsSelectProps } from './bs-select.type';
import { AsyncPipe } from '@angular/common';

@Component({
  selector: 'df-bs-select',
  imports: [FormField, DynamicTextPipe, AsyncPipe, NgForgeControl],
  styleUrl: '../../styles/_form-field.scss',
  hostDirectives: [NgForgeFieldHost],
  template: `
    @let f = ngf.field(); @let p = props(); @let selectId = ngf.key() + '-select';

    <div class="mb-3" [class.form-floating]="p?.floatingLabel">
      @if (!p?.floatingLabel && ngf.label(); as label) {
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
        [class.is-valid]="f().valid() && f().touched() && p?.validFeedback"
        [multiple]="props()?.multiple || false"
        [attr.size]="props()?.htmlSize ?? null"
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
      @if (p?.floatingLabel && ngf.label(); as label) {
        <label [for]="selectId">{{ label | dynamicText | async }}</label>
      }

      @if (p?.validFeedback && f().valid() && f().touched()) {
        <div class="valid-feedback d-block">{{ p?.validFeedback | dynamicText | async }}</div>
      }
      @if (ngf.errorsToDisplay()[0]; as error) {
        <div class="invalid-feedback d-block" [id]="ngf.errorId()" role="alert">{{ error.message }}</div>
      } @else if (p?.invalidFeedback && f().invalid() && f().touched()) {
        <div class="invalid-feedback d-block" [id]="ngf.errorId()" role="alert">{{ p?.invalidFeedback | dynamicText | async }}</div>
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
