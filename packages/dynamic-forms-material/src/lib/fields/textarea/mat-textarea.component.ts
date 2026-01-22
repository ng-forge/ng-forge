import { afterRenderEffect, ChangeDetectionStrategy, Component, computed, ElementRef, inject, input, viewChild } from '@angular/core';
import { FormField, FieldTree } from '@angular/forms/signals';
import { MatError, MatFormField, MatLabel } from '@angular/material/form-field';
import { MatHint, MatInput } from '@angular/material/input';
import { DynamicText, DynamicTextPipe, ValidationMessages } from '@ng-forge/dynamic-forms';
import { createResolvedErrorsSignal, setupMetaTracking, shouldShowErrors, TextareaMeta } from '@ng-forge/dynamic-forms/integration';
import { MatTextareaComponent, MatTextareaProps } from './mat-textarea.type';
import { AsyncPipe } from '@angular/common';
import { MATERIAL_CONFIG } from '../../models/material-config.token';
import { createAriaDescribedBySignal } from '../../utils/create-aria-described-by';

@Component({
  selector: 'df-mat-textarea',
  imports: [MatFormField, MatLabel, MatInput, MatHint, FormField, MatError, DynamicTextPipe, AsyncPipe],
  template: `
    @let f = field();
    @let textareaId = key() + '-textarea';

    <mat-form-field [appearance]="effectiveAppearance()" [subscriptSizing]="effectiveSubscriptSizing()">
      @if (label()) {
        <mat-label>{{ label() | dynamicText | async }}</mat-label>
      }

      <textarea
        #textareaRef
        matInput
        [id]="textareaId"
        [formField]="f"
        [placeholder]="(placeholder() | dynamicText | async) ?? ''"
        [attr.tabindex]="tabIndex()"
        [attr.aria-invalid]="ariaInvalid()"
        [attr.aria-required]="ariaRequired()"
        [attr.aria-describedby]="ariaDescribedBy()"
        [style.resize]="props()?.resize || 'vertical'"
      ></textarea>

      @if (errorsToDisplay()[0]; as error) {
        <mat-error [id]="errorId()">{{ error.message }}</mat-error>
      } @else if (props()?.hint; as hint) {
        <mat-hint [id]="hintId()">{{ hint | dynamicText | async }}</mat-hint>
      }
    </mat-form-field>
  `,
  styleUrl: '../../styles/_form-field.scss',
  styles: [
    `
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
export default class MatTextareaFieldComponent implements MatTextareaComponent {
  private materialConfig = inject(MATERIAL_CONFIG, { optional: true });
  private readonly elementRef = inject(ElementRef<HTMLElement>);

  readonly field = input.required<FieldTree<string>>();
  readonly key = input.required<string>();

  readonly label = input<DynamicText>();
  readonly placeholder = input<DynamicText>();
  readonly className = input<string>('');
  readonly tabIndex = input<number>();
  readonly props = input<MatTextareaProps>();
  readonly meta = input<TextareaMeta>();
  readonly validationMessages = input<ValidationMessages>();
  readonly defaultValidationMessages = input<ValidationMessages>();

  constructor() {
    setupMetaTracking(this.elementRef, this.meta, { selector: 'textarea' });
  }

  /**
   * Reference to the native textarea element.
   * Used to imperatively sync the readonly attribute since Angular Signal Forms'
   * [field] directive doesn't sync FieldState.readonly() to the DOM.
   */
  private readonly textareaRef = viewChild<ElementRef<HTMLTextAreaElement>>('textareaRef');

  /**
   * Computed signal that extracts the readonly state from the field.
   * Used by the effect to reactively sync the readonly attribute to the DOM.
   */
  private readonly isReadonly = computed(() => this.field()().readonly());

  /**
   * Workaround: Angular Signal Forms' [field] directive does NOT sync the readonly
   * attribute to the DOM, even though FieldState.readonly() returns the correct value.
   * This effect imperatively sets/removes the readonly attribute on the native textarea
   * element whenever the readonly state changes.
   *
   * Note: We cannot use [readonly] or [attr.readonly] bindings because Angular throws
   * NG8022: "Binding to '[readonly]' is not allowed on nodes using the '[field]' directive"
   *
   * Uses afterRenderEffect to ensure DOM is ready before manipulating attributes.
   *
   * @see https://github.com/angular/angular/issues/65897
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
  protected readonly ariaDescribedBy = createAriaDescribedBySignal(
    this.errorsToDisplay,
    this.errorId,
    this.hintId,
    () => !!this.props()?.hint,
  );
}
