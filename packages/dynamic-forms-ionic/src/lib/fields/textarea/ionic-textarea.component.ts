import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { Field, FieldTree } from '@angular/forms/signals';
import { IonNote, IonTextarea } from '@ionic/angular/standalone';
import { DynamicText, DynamicTextPipe, ValidationMessages } from '@ng-forge/dynamic-forms';
import { createResolvedErrorsSignal, shouldShowErrors } from '@ng-forge/dynamic-forms/integration';
import { IonicTextareaComponent, IonicTextareaProps } from './ionic-textarea.type';
import { AsyncPipe } from '@angular/common';

@Component({
  selector: 'df-ionic-textarea',
  imports: [IonTextarea, IonNote, Field, DynamicTextPipe, AsyncPipe],
  template: `
    @let f = field();

    <ion-textarea
      [field]="f"
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
      [helperText]="(props()?.helperText | dynamicText | async) ?? undefined"
      [errorText]="f().invalid() && f().touched() ? ((props()?.errorText | dynamicText | async) ?? undefined) : undefined"
      [attr.tabindex]="tabIndex()"
      [attr.aria-invalid]="isAriaInvalid()"
      [attr.aria-required]="isRequired() || null"
      [class.ion-invalid]="f().invalid()"
      [class.ion-touched]="f().touched()"
    >
      <div slot="error">
        @for (error of errorsToDisplay(); track error.kind; let i = $index) {
          <ion-note color="danger" [id]="errorId() + '-' + i" role="alert">{{ error.message }}</ion-note>
        }
      </div>
    </ion-textarea>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    '[id]': '`${key()}`',
    '[attr.data-testid]': 'key()',
    '[class]': 'className()',
    '[attr.hidden]': 'field()().hidden() || null',
  },
  styles: [
    `
      :host([hidden]) {
        display: none !important;
      }
    `,
  ],
})
export default class IonicTextareaFieldComponent implements IonicTextareaComponent {
  readonly field = input.required<FieldTree<string>>();
  readonly key = input.required<string>();

  readonly label = input<DynamicText>();
  readonly placeholder = input<DynamicText>();
  readonly className = input<string>('');
  readonly tabIndex = input<number>();
  readonly props = input<IonicTextareaProps>();
  readonly validationMessages = input<ValidationMessages>();
  readonly defaultValidationMessages = input<ValidationMessages>();

  readonly resolvedErrors = createResolvedErrorsSignal(this.field, this.validationMessages, this.defaultValidationMessages);
  readonly showErrors = shouldShowErrors(this.field);

  readonly errorsToDisplay = computed(() => (this.showErrors() ? this.resolvedErrors() : []));

  // ─────────────────────────────────────────────────────────────────────────────
  // Accessibility
  // ─────────────────────────────────────────────────────────────────────────────

  /** Base ID for error elements */
  readonly errorId = computed(() => `${this.key()}-error`);

  /** Whether the field is currently in an invalid state (invalid AND touched) */
  readonly isAriaInvalid = computed(() => {
    const fieldState = this.field()();
    return fieldState.invalid() && fieldState.touched();
  });

  /** Whether the field has a required validator */
  readonly isRequired = computed(() => {
    return this.field()().required?.() === true;
  });
}
