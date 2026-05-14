import { afterRenderEffect, ChangeDetectionStrategy, Component, computed, ElementRef, input, viewChild } from '@angular/core';
import { FormField } from '@angular/forms/signals';
import { DynamicTextPipe } from '@ng-forge/dynamic-forms';
import { NgForgeControl, injectNgForgeField, NgForgeFieldHost } from '@ng-forge/dynamic-forms/integration';
import { BsTextareaProps } from './bs-textarea.type';
import { AsyncPipe } from '@angular/common';

@Component({
  selector: 'df-bs-textarea',
  imports: [FormField, DynamicTextPipe, AsyncPipe, NgForgeControl],
  styleUrl: '../../styles/_form-field.scss',
  hostDirectives: [NgForgeFieldHost],
  template: `
    @let f = ngf.field(); @let p = props(); @let textareaId = ngf.key() + '-textarea';
    @if (p?.floatingLabel) {
      <!-- Floating label variant -->
      <div class="form-floating mb-3">
        <textarea
          ngForgeControl
          #textareaRef
          [formField]="f"
          [id]="textareaId"
          [placeholder]="(ngf.placeholder() | dynamicText | async) ?? ''"
          [attr.tabindex]="ngf.tabIndex()"
          class="form-control"
          [class.form-control-sm]="p?.size === 'sm'"
          [class.form-control-lg]="p?.size === 'lg'"
          [class.is-invalid]="f().invalid() && f().touched()"
          [class.is-valid]="f().valid() && f().touched() && p?.validFeedback"
        ></textarea>

        @if (ngf.label()) {
          <label [for]="textareaId">{{ ngf.label() | dynamicText | async }}</label>
        }
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
    } @else {
      <!-- Standard variant -->
      <div class="mb-3">
        @if (ngf.label()) {
          <label [for]="textareaId" class="form-label">{{ ngf.label() | dynamicText | async }}</label>
        }

        <textarea
          ngForgeControl
          #textareaRef
          [formField]="f"
          [id]="textareaId"
          [placeholder]="(ngf.placeholder() | dynamicText | async) ?? ''"
          [attr.tabindex]="ngf.tabIndex()"
          class="form-control"
          [class.form-control-sm]="p?.size === 'sm'"
          [class.form-control-lg]="p?.size === 'lg'"
          [class.is-invalid]="f().invalid() && f().touched()"
          [class.is-valid]="f().valid() && f().touched() && p?.validFeedback"
        ></textarea>

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
export default class BsTextareaFieldComponent {
  protected readonly ngf = injectNgForgeField<string>();

  readonly props = input<BsTextareaProps>();

  /**
   * Reference to the native textarea element.
   * Used to imperatively sync the readonly attribute since Angular Signal Forms'
   * [field] directive doesn't sync FieldState.readonly() to the DOM.
   */
  private readonly textareaRef = viewChild<ElementRef<HTMLTextAreaElement>>('textareaRef');

  /**
   * Computed signal that extracts the readonly state from the field.
   */
  private readonly isReadonly = computed(() => this.ngf.field()().readonly());

  /**
   * Workaround: Angular Signal Forms' [field] directive does NOT sync the readonly
   * attribute to the DOM. This effect imperatively sets/removes the readonly attribute
   * on the native textarea element whenever the readonly state changes.
   */
  private readonly syncReadonlyToDom = afterRenderEffect({
    write: () => {
      const textareaRef = this.textareaRef();
      const isReadonly = this.isReadonly();
      if (textareaRef?.nativeElement) {
        if (isReadonly) {
          textareaRef.nativeElement.setAttribute('readonly', '');
        } else {
          textareaRef.nativeElement.removeAttribute('readonly');
        }
      }
    },
  });
}
