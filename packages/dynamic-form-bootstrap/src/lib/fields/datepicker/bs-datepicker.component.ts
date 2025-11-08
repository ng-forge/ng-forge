import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { Field, FieldTree } from '@angular/forms/signals';
import {
  DynamicText, DynamicTextPipe,
  ValidationMessages,
  createResolvedErrorsSignal,
  shouldShowErrors,
} from '@ng-forge/dynamic-form';
import { BsDatepickerComponent, BsDatepickerProps } from './bs-datepicker.type';
import { AsyncPipe } from '@angular/common';

/**
 * Bootstrap datepicker field component
 * Uses native HTML5 date input with Bootstrap 5 styling
 * Supports standard and floating label variants
 *
 * Note: ng-bootstrap datepicker integration (useNgBootstrap prop) is reserved for future enhancement
 */
@Component({
  selector: 'df-bs-datepicker',
  imports: [Field, DynamicTextPipe, AsyncPipe],
  styleUrl: '../../styles/_form-field.scss',
  template: `
    @let f = field(); @let p = props(); @if (p?.floatingLabel) {
    <!-- Floating label variant -->
    <div class="form-floating mb-3">
      <input
        [field]="f"
        [id]="key()"
        type="date"
        [placeholder]="(placeholder() | dynamicText | async) ?? ''"
        [attr.tabindex]="tabIndex()"
        class="form-control"
        [class.form-control-sm]="p?.size === 'sm'"
        [class.form-control-lg]="p?.size === 'lg'"
        [class.is-invalid]="f().invalid() && f().touched()"
        [class.is-valid]="f().valid() && f().touched() && p?.validFeedback"
      />
      @if (label()) {
      <label [for]="key()">{{ label() | dynamicText | async }}</label>
      } @if (p?.validFeedback && f().valid() && f().touched()) {
      <div class="valid-feedback d-block">
        {{ p?.validFeedback | dynamicText | async }}
      </div>
      }

      @if (showErrors()) {
      @for (error of resolvedErrors(); track error.kind) {
        <div class="invalid-feedback d-block">{{ error.message }}</div>
      }
    }
    </div>
    } @else {
    <!-- Standard variant -->
    <div class="mb-3">
      @if (label()) {
      <label [for]="key()" class="form-label">{{ label() | dynamicText | async }}</label>
      }

      <input
        [field]="f"
        [id]="key()"
        type="date"
        [placeholder]="(placeholder() | dynamicText | async) ?? ''"
        [attr.tabindex]="tabIndex()"
        class="form-control"
        [class.form-control-sm]="p?.size === 'sm'"
        [class.form-control-lg]="p?.size === 'lg'"
        [class.is-invalid]="f().invalid() && f().touched()"
        [class.is-valid]="f().valid() && f().touched() && p?.validFeedback"
      />

      @if (p?.helpText) {
      <div class="form-text">
        {{ p?.helpText | dynamicText | async }}
      </div>
      } @if (p?.validFeedback && f().valid() && f().touched()) {
      <div class="valid-feedback d-block">
        {{ p?.validFeedback | dynamicText | async }}
      </div>
      }

      @if (showErrors()) {
      @for (error of resolvedErrors(); track error.kind) {
        <div class="invalid-feedback d-block">{{ error.message }}</div>
      }
    }
    </div>
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    '[id]': '`${key()}`',
    '[attr.data-testid]': 'key()',
    '[class]': 'className()',
  },
})
export default class BsDatepickerFieldComponent implements BsDatepickerComponent {
  readonly field = input.required<FieldTree<Date | string>>();
  readonly key = input.required<string>();

  readonly label = input<DynamicText>();
  readonly placeholder = input<DynamicText>();
  readonly className = input<string>('');
  readonly tabIndex = input<number>();

  readonly minDate = input<string>();
  readonly maxDate = input<string>();
  readonly startAt = input<Date | null>(null);
  readonly props = input<BsDatepickerProps>();
  readonly validationMessages = input<ValidationMessages>();

  readonly resolvedErrors = createResolvedErrorsSignal(this.field, this.validationMessages);
  readonly showErrors = shouldShowErrors(this.field);
}
