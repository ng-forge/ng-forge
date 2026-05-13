import { ChangeDetectionStrategy, Component, computed, inject, input } from '@angular/core';
import { FormField } from '@angular/forms/signals';
import { DynamicTextPipe } from '@ng-forge/dynamic-forms';
import {
  NgForgeControl,
  injectNgForgeField,
  NgForgeField,
  NgForgeFieldShell,
  NG_FORGE_FIELD_SHELL_INPUTS,
  NG_FORGE_VALUE_FIELD_INPUTS,
} from '@ng-forge/dynamic-forms/integration';
import { BsInputProps } from './bs-input.type';
import { AsyncPipe } from '@angular/common';
import { BOOTSTRAP_CONFIG } from '../../models/bootstrap-config.token';

@Component({
  selector: 'df-bs-input',
  imports: [FormField, DynamicTextPipe, AsyncPipe, NgForgeControl],
  styleUrl: '../../styles/_form-field.scss',
  hostDirectives: [
    { directive: NgForgeFieldShell, inputs: [...NG_FORGE_FIELD_SHELL_INPUTS] },
    { directive: NgForgeField, inputs: [...NG_FORGE_VALUE_FIELD_INPUTS] },
  ],
  template: `
    @let f = ngf.field(); @let p = props(); @let inputId = ngf.key() + '-input';
    @if (floatingLabel()) {
      <!-- Floating label variant -->
      <div class="form-floating mb-3">
        <input
          ngForgeControl
          [formField]="f"
          [id]="inputId"
          [type]="p?.type ?? 'text'"
          [placeholder]="(ngf.placeholder() | dynamicText | async) ?? ''"
          [attr.tabindex]="ngf.tabIndex()"
          class="form-control"
          [class.form-control-sm]="size() === 'sm'"
          [class.form-control-lg]="size() === 'lg'"
          [class.form-control-plaintext]="p?.plaintext"
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
          [formField]="f"
          [id]="inputId"
          [type]="p?.type ?? 'text'"
          [placeholder]="(ngf.placeholder() | dynamicText | async) ?? ''"
          [attr.tabindex]="ngf.tabIndex()"
          class="form-control"
          [class.form-control-sm]="size() === 'sm'"
          [class.form-control-lg]="size() === 'lg'"
          [class.form-control-plaintext]="p?.plaintext"
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
export default class BsInputFieldComponent {
  private bootstrapConfig = inject(BOOTSTRAP_CONFIG, { optional: true });

  protected readonly ngf = injectNgForgeField<string>();

  readonly props = input<BsInputProps>();

  readonly size = computed(() => this.props()?.size ?? this.bootstrapConfig?.size);
  readonly floatingLabel = computed(() => this.props()?.floatingLabel ?? this.bootstrapConfig?.floatingLabel ?? false);
}
