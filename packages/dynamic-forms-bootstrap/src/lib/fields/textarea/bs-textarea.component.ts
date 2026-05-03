import { afterRenderEffect, ChangeDetectionStrategy, Component, computed, ElementRef, inject, input, viewChild } from '@angular/core';
import { FieldTree, FormField } from '@angular/forms/signals';
import { DynamicTextPipe } from '@ng-forge/dynamic-forms';
import { NgForgeField, NG_FORGE_FIELD_INPUTS, provideMetaTarget } from '@ng-forge/dynamic-forms/integration';
import { BsTextareaProps } from './bs-textarea.type';
import { AsyncPipe } from '@angular/common';

@Component({
  selector: 'df-bs-textarea',
  imports: [FormField, DynamicTextPipe, AsyncPipe],
  styleUrl: '../../styles/_form-field.scss',
  hostDirectives: [{ directive: NgForgeField, inputs: [...NG_FORGE_FIELD_INPUTS] }],
  providers: [provideMetaTarget('textarea')],
  template: `
    @let f = formFieldTree(); @let p = props(); @let textareaId = field.key() + '-textarea';
    @if (p?.floatingLabel) {
      <!-- Floating label variant -->
      <div class="form-floating mb-3">
        <textarea
          #textareaRef
          [formField]="f"
          [id]="textareaId"
          [placeholder]="(field.placeholder() | dynamicText | async) ?? ''"
          [attr.tabindex]="field.tabIndex()"
          [attr.aria-invalid]="field.ariaInvalid()"
          [attr.aria-required]="field.ariaRequired()"
          [attr.aria-describedby]="field.ariaDescribedBy()"
          class="form-control"
          [class.form-control-sm]="p?.size === 'sm'"
          [class.form-control-lg]="p?.size === 'lg'"
          [class.is-invalid]="f().invalid() && f().touched()"
          [class.is-valid]="f().valid() && f().touched() && p?.validFeedback"
        ></textarea>

        @if (field.label()) {
          <label [for]="textareaId">{{ field.label() | dynamicText | async }}</label>
        }
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
    } @else {
      <!-- Standard variant -->
      <div class="mb-3">
        @if (field.label()) {
          <label [for]="textareaId" class="form-label">{{ field.label() | dynamicText | async }}</label>
        }

        <textarea
          #textareaRef
          [formField]="f"
          [id]="textareaId"
          [placeholder]="(field.placeholder() | dynamicText | async) ?? ''"
          [attr.tabindex]="field.tabIndex()"
          [attr.aria-invalid]="field.ariaInvalid()"
          [attr.aria-required]="field.ariaRequired()"
          [attr.aria-describedby]="field.ariaDescribedBy()"
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
export default class BsTextareaFieldComponent {
  protected readonly field = inject(NgForgeField);

  readonly props = input<BsTextareaProps>();

  // Narrow FieldTree<unknown> to FieldTree<string> for the inner control's strict template type-check.
  protected readonly formFieldTree = computed(() => this.field.field() as FieldTree<string>);

  /**
   * Reference to the native textarea element.
   * Used to imperatively sync the readonly attribute since Angular Signal Forms'
   * [field] directive doesn't sync FieldState.readonly() to the DOM.
   */
  private readonly textareaRef = viewChild<ElementRef<HTMLTextAreaElement>>('textareaRef');

  /**
   * Computed signal that extracts the readonly state from the field.
   */
  private readonly isReadonly = computed(() => this.formFieldTree()().readonly());

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
