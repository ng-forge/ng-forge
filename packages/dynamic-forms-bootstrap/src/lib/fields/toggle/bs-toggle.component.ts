import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { FormField } from '@angular/forms/signals';
import { DynamicTextPipe } from '@ng-forge/dynamic-forms';
import { NgForgeControl, NgForgeField, injectNgForgeField, NG_FORGE_FIELD_INPUTS } from '@ng-forge/dynamic-forms/integration';
import { BsToggleProps } from './bs-toggle.type';
import { AsyncPipe } from '@angular/common';

@Component({
  selector: 'df-bs-toggle',
  imports: [FormField, DynamicTextPipe, AsyncPipe, NgForgeControl],
  styleUrl: '../../styles/_form-field.scss',
  hostDirectives: [{ directive: NgForgeField, inputs: [...NG_FORGE_FIELD_INPUTS] }],
  template: `
    @let f = ngf.field(); @let inputId = ngf.key() + '-input';

    <div
      class="form-check form-switch"
      [class.form-check-inline]="props()?.inline"
      [class.form-check-reverse]="props()?.reverse"
      [class.form-switch-sm]="props()?.size === 'sm'"
      [class.form-switch-lg]="props()?.size === 'lg'"
      [attr.hidden]="f().hidden() || null"
    >
      <input
        ngForgeControl
        type="checkbox"
        [formField]="f"
        [id]="inputId"
        class="form-check-input"
        [class.is-invalid]="f().invalid() && f().touched()"
        [attr.tabindex]="ngf.tabIndex()"
        [attr.aria-invalid]="ngf.ariaInvalid()"
        [attr.aria-required]="ngf.ariaRequired()"
        [attr.aria-describedby]="ngf.ariaDescribedBy()"
      />
      <label [for]="inputId" class="form-check-label">
        {{ ngf.label() | dynamicText | async }}
      </label>
    </div>

    @if (ngf.errorsToDisplay()[0]; as error) {
      <div class="invalid-feedback d-block" [id]="ngf.errorId()" role="alert">{{ error.message }}</div>
    } @else if (props()?.hint; as hint) {
      <div class="form-text" [id]="ngf.hintId()" [attr.hidden]="f().hidden() || null">{{ hint | dynamicText | async }}</div>
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

      /* Custom size variants for switches */
      .form-switch-sm .form-check-input {
        width: 1.75rem;
        height: 1rem;
        font-size: 0.875rem;
      }

      .form-switch-lg .form-check-input {
        width: 3rem;
        height: 1.75rem;
        font-size: 1.125rem;
      }
    `,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class BsToggleFieldComponent {
  protected readonly ngf = injectNgForgeField<boolean>();

  readonly props = input<BsToggleProps>();
}
