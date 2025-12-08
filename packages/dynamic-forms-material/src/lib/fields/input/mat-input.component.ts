import { ChangeDetectionStrategy, Component, computed, ElementRef, inject, input, viewChild } from '@angular/core';
import { Field, FieldTree } from '@angular/forms/signals';
import { MatError, MatFormField, MatLabel } from '@angular/material/form-field';
import { MatHint, MatInput } from '@angular/material/input';
import { createResolvedErrorsSignal, DynamicText, DynamicTextPipe, shouldShowErrors, ValidationMessages } from '@ng-forge/dynamic-forms';
import { MatInputComponent, MatInputProps } from './mat-input.type';
import { AsyncPipe } from '@angular/common';
import { MATERIAL_CONFIG } from '../../models/material-config.token';
import { explicitEffect } from 'ngxtension/explicit-effect';

@Component({
  selector: 'df-mat-input',
  imports: [MatFormField, MatLabel, MatInput, MatHint, Field, MatError, DynamicTextPipe, AsyncPipe],
  template: `
    @let f = field();
    @let ariaInvalid = this.ariaInvalid(); @let ariaRequired = this.ariaRequired();
    @let ariaDescribedBy = this.ariaDescribedBy();

    <mat-form-field [appearance]="effectiveAppearance()" [subscriptSizing]="effectiveSubscriptSizing()">
      @if (label()) {
        <mat-label>{{ label() | dynamicText | async }}</mat-label>
      }
      @switch (props()?.type ?? 'text') {
        @case ('email') {
          <input
            #inputRef
            matInput
            type="email"
            [field]="f"
            [placeholder]="(placeholder() | dynamicText | async) ?? ''"
            [attr.tabindex]="tabIndex()"
            [attr.aria-invalid]="ariaInvalid"
            [attr.aria-required]="ariaRequired"
            [attr.aria-describedby]="ariaDescribedBy"
          />
        }
        @case ('password') {
          <input
            #inputRef
            matInput
            type="password"
            [field]="f"
            [placeholder]="(placeholder() | dynamicText | async) ?? ''"
            [attr.tabindex]="tabIndex()"
            [attr.aria-invalid]="ariaInvalid"
            [attr.aria-required]="ariaRequired"
            [attr.aria-describedby]="ariaDescribedBy"
          />
        }
        @case ('number') {
          <input
            #inputRef
            matInput
            type="number"
            [field]="f"
            [placeholder]="(placeholder() | dynamicText | async) ?? ''"
            [attr.tabindex]="tabIndex()"
            [attr.aria-invalid]="ariaInvalid"
            [attr.aria-required]="ariaRequired"
            [attr.aria-describedby]="ariaDescribedBy"
          />
        }
        @case ('tel') {
          <input
            #inputRef
            matInput
            type="tel"
            [field]="f"
            [placeholder]="(placeholder() | dynamicText | async) ?? ''"
            [attr.tabindex]="tabIndex()"
            [attr.aria-invalid]="ariaInvalid"
            [attr.aria-required]="ariaRequired"
            [attr.aria-describedby]="ariaDescribedBy"
          />
        }
        @case ('url') {
          <input
            #inputRef
            matInput
            type="url"
            [field]="f"
            [placeholder]="(placeholder() | dynamicText | async) ?? ''"
            [attr.tabindex]="tabIndex()"
            [attr.aria-invalid]="ariaInvalid"
            [attr.aria-required]="ariaRequired"
            [attr.aria-describedby]="ariaDescribedBy"
          />
        }
        @default {
          <input
            #inputRef
            matInput
            type="text"
            [field]="f"
            [placeholder]="(placeholder() | dynamicText | async) ?? ''"
            [attr.tabindex]="tabIndex()"
            [attr.aria-invalid]="ariaInvalid"
            [attr.aria-required]="ariaRequired"
            [attr.aria-describedby]="ariaDescribedBy"
          />
        }
      }
      @if (props()?.hint; as hint) {
        <mat-hint [id]="hintId()">{{ hint | dynamicText | async }}</mat-hint>
      }
      @for (error of errorsToDisplay(); track error.kind; let i = $index) {
        <mat-error [id]="errorId() + '-' + i">{{ error.message }}</mat-error>
      }
    </mat-form-field>
  `,
  styles: [
    `
      :host {
        display: block;
        width: 100%;
      }

      :host([hidden]) {
        display: none !important;
      }

      mat-form-field {
        width: 100%;
      }
    `,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    '[id]': '`${key()}`',
    '[attr.data-testid]': 'key()',
    '[class]': 'className()',
    '[attr.hidden]': 'field()().hidden() || null',
  },
})
export default class MatInputFieldComponent implements MatInputComponent {
  private materialConfig = inject(MATERIAL_CONFIG, { optional: true });

  readonly field = input.required<FieldTree<string>>();
  readonly key = input.required<string>();

  /**
   * Reference to the native input element.
   * Used to imperatively sync the readonly attribute since Angular Signal Forms'
   * [field] directive doesn't sync FieldState.readonly() to the DOM.
   */
  private readonly inputRef = viewChild<ElementRef<HTMLInputElement>>('inputRef');

  /**
   * Computed signal that extracts the readonly state from the field.
   * Used by the effect to reactively sync the readonly attribute to the DOM.
   */
  private readonly isReadonly = computed(() => this.field()().readonly());

  /**
   * Workaround: Angular Signal Forms' [field] directive does NOT sync the readonly
   * attribute to the DOM, even though FieldState.readonly() returns the correct value.
   * This effect imperatively sets/removes the readonly attribute on the native input
   * element whenever the readonly state changes.
   *
   * Note: We cannot use [readonly] or [attr.readonly] bindings because Angular throws
   * NG8022: "Binding to '[readonly]' is not allowed on nodes using the '[field]' directive"
   *
   * @see https://github.com/angular/angular/issues/65897
   */
  private readonly syncReadonlyToDom = explicitEffect([this.inputRef, this.isReadonly], ([inputRef, isReadonly]) => {
    if (inputRef?.nativeElement) {
      if (isReadonly) {
        inputRef.nativeElement.setAttribute('readonly', '');
      } else {
        inputRef.nativeElement.removeAttribute('readonly');
      }
    }
  });

  readonly label = input<DynamicText>();
  readonly placeholder = input<DynamicText>();
  readonly className = input<string>('');
  readonly tabIndex = input<number>();
  readonly props = input<MatInputProps>();
  readonly validationMessages = input<ValidationMessages>();
  readonly defaultValidationMessages = input<ValidationMessages>();

  readonly effectiveAppearance = computed(() => this.props()?.appearance ?? this.materialConfig?.appearance ?? 'outline');

  readonly effectiveSubscriptSizing = computed(() => this.props()?.subscriptSizing ?? this.materialConfig?.subscriptSizing ?? 'dynamic');

  readonly resolvedErrors = createResolvedErrorsSignal(this.field, this.validationMessages, this.defaultValidationMessages);
  readonly showErrors = shouldShowErrors(this.field);

  readonly errorsToDisplay = computed(() => (this.showErrors() ? this.resolvedErrors() : []));

  // ─────────────────────────────────────────────────────────────────────────────
  // Accessibility
  // ─────────────────────────────────────────────────────────────────────────────

  /** Unique ID for the hint element, used for aria-describedby */
  protected readonly hintId = computed(() => `${this.key()}-hint`);

  /** Base ID for error elements, used for aria-describedby */
  protected readonly errorId = computed(() => `${this.key()}-error`);

  /** aria-invalid: true when field is invalid AND touched, false otherwise */
  protected readonly ariaInvalid = computed(() => {
    const fieldState = this.field()();
    return fieldState.invalid() && fieldState.touched();
  });

  /** aria-required: true if field is required, null otherwise (to remove attribute) */
  protected readonly ariaRequired = computed(() => {
    return this.field()().required?.() === true ? true : null;
  });

  /** aria-describedby: links to hint and error messages for screen readers */
  protected readonly ariaDescribedBy = computed(() => {
    const ids: string[] = [];

    if (this.props()?.hint) {
      ids.push(this.hintId());
    }

    const errors = this.errorsToDisplay();
    errors.forEach((_, i) => {
      ids.push(`${this.errorId()}-${i}`);
    });

    return ids.length > 0 ? ids.join(' ') : null;
  });
}
