import { ChangeDetectionStrategy, Component, computed, ElementRef, inject, input } from '@angular/core';
import { explicitEffect } from 'ngxtension/explicit-effect';
import { FormField, FieldTree } from '@angular/forms/signals';
import { IonNote, IonTextarea } from '@ionic/angular/standalone';
import { DynamicText, DynamicTextPipe, ValidationMessages } from '@ng-forge/dynamic-forms';
import { createResolvedErrorsSignal, setupMetaTracking, shouldShowErrors, TextareaMeta } from '@ng-forge/dynamic-forms/integration';
import { IonicTextareaComponent, IonicTextareaProps } from './ionic-textarea.type';
import { AsyncPipe } from '@angular/common';
import { createAriaDescribedBySignal } from '../../utils/create-aria-described-by';

@Component({
  selector: 'df-ion-textarea',
  imports: [IonTextarea, IonNote, FormField, DynamicTextPipe, AsyncPipe],
  template: `
    @let f = field();
    @let textareaId = key() + '-textarea';

    <ion-textarea
      [id]="textareaId"
      [formField]="f"
      [label]="(label() | dynamicText | async) ?? undefined"
      [labelPlacement]="props()?.labelPlacement ?? 'stacked'"
      [placeholder]="(placeholder() | dynamicText | async) ?? ''"
      [rows]="props()?.rows ?? 4"
      [autoGrow]="props()?.autoGrow ?? false"
      [counter]="props()?.counter ?? false"
      [color]="props()?.color"
      [fill]="props()?.fill ?? 'outline'"
      [shape]="props()?.shape"
      [readonly]="f().readonly()"
      [helperText]="errorsToDisplay().length === 0 ? ((props()?.hint | dynamicText | async) ?? undefined) : undefined"
      [attr.tabindex]="tabIndex()"
      [attr.aria-invalid]="ariaInvalid()"
      [attr.aria-required]="ariaRequired()"
      [attr.aria-describedby]="ariaDescribedBy()"
    />
    @if (errorsToDisplay()[0]; as error) {
      <ion-note color="danger" class="df-ion-error" [id]="errorId()" role="alert">{{ error.message }}</ion-note>
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    '[id]': '`${key()}`',
    '[attr.data-testid]': 'key()',
    '[class]': 'className()',
    '[attr.hidden]': 'field()().hidden() || null',
  },
  styleUrl: '../../styles/_form-field.scss',
  styles: [
    `
      :host([hidden]) {
        display: none !important;
      }
    `,
  ],
})
export default class IonicTextareaFieldComponent implements IonicTextareaComponent {
  private readonly elementRef = inject(ElementRef<HTMLElement>);

  readonly field = input.required<FieldTree<string>>();
  readonly key = input.required<string>();

  readonly label = input<DynamicText>();
  readonly placeholder = input<DynamicText>();
  readonly className = input<string>('');
  readonly tabIndex = input<number>();
  readonly props = input<IonicTextareaProps>();
  readonly meta = input<TextareaMeta>();
  readonly validationMessages = input<ValidationMessages>();
  readonly defaultValidationMessages = input<ValidationMessages>();

  readonly resolvedErrors = createResolvedErrorsSignal(this.field, this.validationMessages, this.defaultValidationMessages);
  readonly showErrors = shouldShowErrors(this.field);

  readonly errorsToDisplay = computed(() => (this.showErrors() ? this.resolvedErrors() : []));

  constructor() {
    // Shadow DOM - apply meta to ion-textarea element
    setupMetaTracking(this.elementRef, this.meta, {
      selector: 'ion-textarea',
    });

    // Workaround: Ionic's ion-textarea does NOT automatically propagate aria-describedby changes
    // to the native textarea element inside its shadow DOM. This effect imperatively syncs the attribute
    // after a microtask to ensure Ionic has processed the attribute change.
    explicitEffect([this.ariaDescribedBy], ([describedBy]) => {
      queueMicrotask(() => {
        const ionTextarea = this.elementRef.nativeElement.querySelector('ion-textarea') as HTMLIonTextareaElement | null;
        if (ionTextarea?.getInputElement) {
          ionTextarea.getInputElement().then((textareaEl) => {
            if (textareaEl) {
              if (describedBy) {
                textareaEl.setAttribute('aria-describedby', describedBy);
              } else {
                textareaEl.removeAttribute('aria-describedby');
              }
            }
          });
        }
      });
    });
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // Accessibility
  // ─────────────────────────────────────────────────────────────────────────────

  /** Base ID for error elements */
  protected readonly errorId = computed(() => `${this.key()}-error`);

  /** Unique ID for the helper text element */
  protected readonly hintId = computed(() => `${this.key()}-hint`);

  /** Whether the field is currently in an invalid state (invalid AND touched) */
  protected readonly ariaInvalid = computed(() => {
    const fieldState = this.field()();
    return fieldState.invalid() && fieldState.touched();
  });

  /** Whether the field has a required validator */
  protected readonly ariaRequired = computed(() => {
    return this.field()().required?.() === true ? true : null;
  });

  /** aria-describedby linking to hint OR error elements (mutually exclusive) */
  protected readonly ariaDescribedBy = createAriaDescribedBySignal(
    this.errorsToDisplay,
    this.errorId,
    this.hintId,
    () => !!this.props()?.hint,
  );
}
