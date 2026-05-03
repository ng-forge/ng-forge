import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { FormField } from '@angular/forms/signals';
import { DynamicTextPipe } from '@ng-forge/dynamic-forms';
import { NgForgeField, NG_FORGE_FIELD_INPUTS, injectNgForgeField, provideMetaTarget } from '@ng-forge/dynamic-forms/integration';
import { BsDatepickerProps } from './bs-datepicker.type';
import { AsyncPipe } from '@angular/common';
import { InputConstraintsDirective } from '../../directives/input-constraints.directive';

@Component({
  selector: 'df-bs-datepicker',
  imports: [FormField, DynamicTextPipe, AsyncPipe, InputConstraintsDirective],
  styleUrl: '../../styles/_form-field.scss',
  hostDirectives: [{ directive: NgForgeField, inputs: [...NG_FORGE_FIELD_INPUTS] }],
  providers: [provideMetaTarget('input')],
  template: `
    @let f = field.field(); @let p = props(); @let inputId = field.key() + '-input';
    @if (p?.floatingLabel) {
      <!-- Floating label variant -->
      <div class="form-floating mb-3">
        <input
          dfBsInputConstraints
          [formField]="f"
          [id]="inputId"
          type="date"
          [placeholder]="(field.placeholder() | dynamicText | async) ?? ''"
          [dfMin]="minAsString()"
          [dfMax]="maxAsString()"
          [attr.tabindex]="field.tabIndex()"
          [attr.aria-invalid]="field.ariaInvalid()"
          [attr.aria-required]="field.ariaRequired()"
          [attr.aria-describedby]="field.ariaDescribedBy()"
          class="form-control"
          [class.form-control-sm]="p?.size === 'sm'"
          [class.form-control-lg]="p?.size === 'lg'"
          [class.is-invalid]="f().invalid() && f().touched()"
          [class.is-valid]="f().valid() && f().touched() && p?.validFeedback"
        />
        @if (field.label()) {
          <label [for]="inputId">{{ field.label() | dynamicText | async }}</label>
        }
        @if (p?.validFeedback && f().valid() && f().touched()) {
          <div class="valid-feedback d-block">
            {{ p?.validFeedback | dynamicText | async }}
          </div>
        }
        @if (field.errorsToDisplay()[0]; as error) {
          <div class="invalid-feedback d-block" [id]="field.errorId()" role="alert">{{ error.message }}</div>
        }
      </div>
    } @else {
      <!-- Standard variant -->
      <div class="mb-3">
        @if (field.label()) {
          <label [for]="inputId" class="form-label">{{ field.label() | dynamicText | async }}</label>
        }

        <input
          dfBsInputConstraints
          [formField]="f"
          [id]="inputId"
          type="date"
          [placeholder]="(field.placeholder() | dynamicText | async) ?? ''"
          [dfMin]="minAsString()"
          [dfMax]="maxAsString()"
          [attr.tabindex]="field.tabIndex()"
          [attr.aria-invalid]="field.ariaInvalid()"
          [attr.aria-required]="field.ariaRequired()"
          [attr.aria-describedby]="field.ariaDescribedBy()"
          class="form-control"
          [class.form-control-sm]="p?.size === 'sm'"
          [class.form-control-lg]="p?.size === 'lg'"
          [class.is-invalid]="f().invalid() && f().touched()"
          [class.is-valid]="f().valid() && f().touched() && p?.validFeedback"
        />

        @if (p?.validFeedback && f().valid() && f().touched()) {
          <div class="valid-feedback d-block">
            {{ p?.validFeedback | dynamicText | async }}
          </div>
        }
        @if (field.errorsToDisplay()[0]; as error) {
          <div class="invalid-feedback d-block" [id]="field.errorId()" role="alert">{{ error.message }}</div>
        } @else if (p?.hint) {
          <div class="form-text" [id]="field.hintId()">{{ p?.hint | dynamicText | async }}</div>
        }
      </div>
    }
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
export default class BsDatepickerFieldComponent {
  protected readonly field = injectNgForgeField<Date | string>();

  readonly minDate = input<Date | string | null>(null);
  readonly maxDate = input<Date | string | null>(null);
  readonly startAt = input<Date | null>(null);
  readonly props = input<BsDatepickerProps>();

  // Helper methods to convert Date to string for HTML attributes
  readonly minAsString = computed(() => {
    const min = this.minDate();
    return min instanceof Date ? min.toISOString().split('T')[0] : min;
  });

  readonly maxAsString = computed(() => {
    const max = this.maxDate();
    return max instanceof Date ? max.toISOString().split('T')[0] : max;
  });
}
