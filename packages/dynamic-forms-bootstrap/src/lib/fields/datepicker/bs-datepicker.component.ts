import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { FormField } from '@angular/forms/signals';
import { DynamicTextPipe } from '@ng-forge/dynamic-forms';
import { NgForgeControl, injectNgForgeField, NgForgeFieldHost } from '@ng-forge/dynamic-forms/integration';
import { BsDatepickerProps } from './bs-datepicker.type';
import { AsyncPipe } from '@angular/common';
import { InputConstraintsDirective } from '../../directives/input-constraints.directive';

@Component({
  selector: 'df-bs-datepicker',
  imports: [FormField, DynamicTextPipe, AsyncPipe, InputConstraintsDirective, NgForgeControl],
  styleUrl: '../../styles/_form-field.scss',
  hostDirectives: [NgForgeFieldHost],
  template: `
    @let f = ngf.field(); @let p = props(); @let inputId = ngf.key() + '-input';
    @if (p?.floatingLabel) {
      <!-- Floating label variant -->
      <div class="form-floating mb-3">
        <input
          ngForgeControl
          dfBsInputConstraints
          [formField]="f"
          [id]="inputId"
          type="date"
          [placeholder]="(ngf.placeholder() | dynamicText | async) ?? ''"
          [dfMin]="minAsString()"
          [dfMax]="maxAsString()"
          [attr.tabindex]="ngf.tabIndex()"
          class="form-control"
          [class.form-control-sm]="p?.size === 'sm'"
          [class.form-control-lg]="p?.size === 'lg'"
          [class.is-invalid]="f().invalid() && f().touched()"
          [class.is-valid]="f().valid() && f().touched() && p?.validFeedback"
        />
        @if (ngf.label()) {
          <label [for]="inputId">{{ ngf.label() | dynamicText | async }}</label>
        }
        @if (p?.validFeedback && f().valid() && f().touched()) {
          <div class="valid-feedback d-block">
            {{ p?.validFeedback | dynamicText | async }}
          </div>
        }
        @if (ngf.errorsToDisplay()[0]; as error) {
          <div class="invalid-feedback d-block" [id]="ngf.errorId()" role="alert">{{ error.message }}</div>
        }
      </div>
    } @else {
      <!-- Standard variant -->
      <div class="mb-3">
        @if (ngf.label()) {
          <label [for]="inputId" class="form-label">{{ ngf.label() | dynamicText | async }}</label>
        }

        <input
          ngForgeControl
          dfBsInputConstraints
          [formField]="f"
          [id]="inputId"
          type="date"
          [placeholder]="(ngf.placeholder() | dynamicText | async) ?? ''"
          [dfMin]="minAsString()"
          [dfMax]="maxAsString()"
          [attr.tabindex]="ngf.tabIndex()"
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
        @if (ngf.errorsToDisplay()[0]; as error) {
          <div class="invalid-feedback d-block" [id]="ngf.errorId()" role="alert">{{ error.message }}</div>
        } @else if (p?.hint) {
          <div class="form-text" [id]="ngf.hintId()">{{ p?.hint | dynamicText | async }}</div>
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
  protected readonly ngf = injectNgForgeField<string>();

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
