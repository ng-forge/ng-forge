import { ChangeDetectionStrategy, Component, computed, ElementRef, inject, input } from '@angular/core';
import { FormField, FieldTree } from '@angular/forms/signals';
import { IonNote, IonSelect, IonSelectOption } from '@ionic/angular/standalone';
import { DynamicText, DynamicTextPipe, FieldMeta, FieldOption, ValidationMessages } from '@ng-forge/dynamic-forms';
import { createResolvedErrorsSignal, setupMetaTracking, shouldShowErrors } from '@ng-forge/dynamic-forms/integration';
import { IonicSelectComponent, IonicSelectProps } from './ionic-select.type';
import { AsyncPipe } from '@angular/common';

@Component({
  selector: 'df-ionic-select',
  imports: [IonSelect, IonSelectOption, IonNote, FormField, DynamicTextPipe, AsyncPipe],
  template: `
    @let f = field();
    @let ariaInvalid = isAriaInvalid();
    @let ariaRequired = isRequired() || null;

    <ion-select
      [formField]="f"
      [label]="(label() | dynamicText | async) ?? undefined"
      [labelPlacement]="props()?.labelPlacement ?? 'stacked'"
      [placeholder]="(placeholder() ?? props()?.placeholder | dynamicText | async) ?? ''"
      [multiple]="props()?.multiple ?? false"
      [compareWith]="props()?.compareWith ?? defaultCompare"
      [interface]="props()?.interface ?? 'alert'"
      [interfaceOptions]="props()?.interfaceOptions ?? {}"
      [cancelText]="props()?.cancelText ?? 'Cancel'"
      [okText]="props()?.okText ?? 'OK'"
      [color]="props()?.color"
      [fill]="props()?.fill ?? 'outline'"
      [shape]="props()?.shape"
      [attr.tabindex]="tabIndex()"
      [attr.aria-invalid]="ariaInvalid"
      [attr.aria-required]="ariaRequired"
    >
      @for (option of options(); track option.value) {
        <ion-select-option [value]="option.value" [disabled]="option.disabled || false">
          {{ option.label | dynamicText | async }}
        </ion-select-option>
      }
    </ion-select>
    @for (error of errorsToDisplay(); track error.kind; let i = $index) {
      <ion-note color="danger" class="df-ionic-error" [id]="errorId() + '-' + i" role="alert">{{ error.message }}</ion-note>
    }
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
export default class IonicSelectFieldComponent<T> implements IonicSelectComponent<T> {
  private readonly elementRef = inject(ElementRef<HTMLElement>);

  readonly field = input.required<FieldTree<T>>();
  readonly key = input.required<string>();

  readonly label = input<DynamicText>();
  readonly placeholder = input<DynamicText>();

  readonly className = input<string>('');
  readonly tabIndex = input<number>();

  readonly options = input<FieldOption<T>[]>([]);
  readonly props = input<IonicSelectProps<T>>();
  readonly meta = input<FieldMeta>();
  readonly validationMessages = input<ValidationMessages>();
  readonly defaultValidationMessages = input<ValidationMessages>();

  constructor() {
    setupMetaTracking(this.elementRef, this.meta);
  }

  readonly resolvedErrors = createResolvedErrorsSignal(this.field, this.validationMessages, this.defaultValidationMessages);
  readonly showErrors = shouldShowErrors(this.field);

  readonly errorsToDisplay = computed(() => (this.showErrors() ? this.resolvedErrors() : []));

  defaultCompare = Object.is;

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
