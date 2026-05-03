import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { FormField } from '@angular/forms/signals';
import { DynamicTextPipe } from '@ng-forge/dynamic-forms';
import { NgForgeField, injectNgForgeField, NG_FORGE_FIELD_INPUTS, provideMetaTarget } from '@ng-forge/dynamic-forms/integration';
import { BsCheckboxProps } from './bs-checkbox.type';
import { AsyncPipe } from '@angular/common';

@Component({
  selector: 'df-bs-checkbox',
  imports: [FormField, DynamicTextPipe, AsyncPipe],
  styleUrl: '../../styles/_form-field.scss',
  hostDirectives: [{ directive: NgForgeField, inputs: [...NG_FORGE_FIELD_INPUTS] }],
  providers: [provideMetaTarget('input[type="checkbox"]')],
  template: `
    @let f = field.field(); @let checkboxId = field.key() + '-checkbox';

    <div
      class="form-check"
      [class.form-switch]="props()?.switch"
      [class.form-check-inline]="props()?.inline"
      [class.form-check-reverse]="props()?.reverse"
      [attr.hidden]="f().hidden() || null"
    >
      <input
        type="checkbox"
        [formField]="f"
        [id]="checkboxId"
        [indeterminate]="props()?.indeterminate ?? false"
        class="form-check-input"
        [class.is-invalid]="f().invalid() && f().touched()"
        [attr.tabindex]="field.tabIndex()"
        [attr.aria-invalid]="field.ariaInvalid()"
        [attr.aria-required]="field.ariaRequired()"
        [attr.aria-describedby]="field.ariaDescribedBy()"
      />
      <label [for]="checkboxId" class="form-check-label">
        {{ field.label() | dynamicText | async }}
      </label>
    </div>

    @if (field.errorsToDisplay()[0]; as error) {
      <div class="invalid-feedback d-block" [id]="field.errorId()" role="alert">{{ error.message }}</div>
    } @else if (props()?.hint; as hint) {
      <div class="form-text" [id]="field.hintId()" [attr.hidden]="f().hidden() || null">{{ hint | dynamicText | async }}</div>
    }
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
export default class BsCheckboxFieldComponent {
  protected readonly field = injectNgForgeField<boolean>();

  readonly props = input<BsCheckboxProps>();
}
