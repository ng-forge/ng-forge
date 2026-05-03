import { ChangeDetectionStrategy, Component, computed, inject, input } from '@angular/core';
import { FormField } from '@angular/forms/signals';
import { DynamicTextPipe } from '@ng-forge/dynamic-forms';
import { NgForgeField, injectNgForgeField, NG_FORGE_FIELD_INPUTS, provideMetaTarget } from '@ng-forge/dynamic-forms/integration';
import { BsInputProps } from './bs-input.type';
import { AsyncPipe } from '@angular/common';
import { BOOTSTRAP_CONFIG } from '../../models/bootstrap-config.token';

@Component({
  selector: 'df-bs-input',
  imports: [FormField, DynamicTextPipe, AsyncPipe],
  styleUrl: '../../styles/_form-field.scss',
  hostDirectives: [{ directive: NgForgeField, inputs: [...NG_FORGE_FIELD_INPUTS] }],
  providers: [provideMetaTarget('input')],
  template: `
    @let f = field.field(); @let p = props(); @let inputId = field.key() + '-input';
    @if (effectiveFloatingLabel()) {
      <!-- Floating label variant -->
      <div class="form-floating mb-3">
        <input
          [formField]="f"
          [id]="inputId"
          [type]="p?.type ?? 'text'"
          [placeholder]="(field.placeholder() | dynamicText | async) ?? ''"
          [attr.tabindex]="field.tabIndex()"
          [attr.aria-invalid]="field.ariaInvalid()"
          [attr.aria-required]="field.ariaRequired()"
          [attr.aria-describedby]="field.ariaDescribedBy()"
          class="form-control"
          [class.form-control-sm]="effectiveSize() === 'sm'"
          [class.form-control-lg]="effectiveSize() === 'lg'"
          [class.form-control-plaintext]="p?.plaintext"
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
          [formField]="f"
          [id]="inputId"
          [type]="p?.type ?? 'text'"
          [placeholder]="(field.placeholder() | dynamicText | async) ?? ''"
          [attr.tabindex]="field.tabIndex()"
          [attr.aria-invalid]="field.ariaInvalid()"
          [attr.aria-required]="field.ariaRequired()"
          [attr.aria-describedby]="field.ariaDescribedBy()"
          class="form-control"
          [class.form-control-sm]="effectiveSize() === 'sm'"
          [class.form-control-lg]="effectiveSize() === 'lg'"
          [class.form-control-plaintext]="p?.plaintext"
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
export default class BsInputFieldComponent {
  private bootstrapConfig = inject(BOOTSTRAP_CONFIG, { optional: true });

  protected readonly field = injectNgForgeField<string>();

  readonly props = input<BsInputProps>();

  readonly effectiveSize = computed(() => this.props()?.size ?? this.bootstrapConfig?.size);
  readonly effectiveFloatingLabel = computed(() => this.props()?.floatingLabel ?? this.bootstrapConfig?.floatingLabel ?? false);
}
