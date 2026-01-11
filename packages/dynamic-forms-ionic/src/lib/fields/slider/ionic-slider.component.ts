import { ChangeDetectionStrategy, Component, computed, ElementRef, inject, input } from '@angular/core';
import { FormField, FieldTree } from '@angular/forms/signals';
import { IonNote, IonRange } from '@ionic/angular/standalone';
import { DynamicText, DynamicTextPipe, FieldMeta, ValidationMessages } from '@ng-forge/dynamic-forms';
import { createResolvedErrorsSignal, setupMetaTracking, shouldShowErrors } from '@ng-forge/dynamic-forms/integration';
import { IonicSliderComponent, IonicSliderProps } from './ionic-slider.type';
import { AsyncPipe } from '@angular/common';

@Component({
  selector: 'df-ion-slider',
  imports: [IonRange, IonNote, FormField, DynamicTextPipe, AsyncPipe],
  template: `
    @let f = field();

    <ion-range
      [formField]="f"
      [label]="(label() | dynamicText | async) ?? undefined"
      [labelPlacement]="props()?.labelPlacement ?? 'stacked'"
      [step]="props()?.step ?? 1"
      [dualKnobs]="props()?.dualKnobs ?? false"
      [pin]="props()?.pin ?? false"
      [pinFormatter]="props()?.pinFormatter ?? defaultPinFormatter"
      [ticks]="props()?.ticks ?? false"
      [snaps]="props()?.snaps ?? false"
      [color]="props()?.color ?? 'primary'"
      [attr.tabindex]="tabIndex()"
      [attr.aria-invalid]="isAriaInvalid()"
      [attr.aria-required]="isRequired() || null"
    />

    @for (error of errorsToDisplay(); track error.kind; let i = $index) {
      <ion-note color="danger" [id]="errorId() + '-' + i" role="alert">{{ error.message }}</ion-note>
    }
  `,
  styleUrl: '../../styles/_form-field.scss',
  styles: [
    `
      :host {
        display: block;
      }

      :host([hidden]) {
        display: none !important;
      }
    `,
  ],
  host: {
    '[class]': 'className()',
    '[id]': '`${key()}`',
    '[attr.data-testid]': 'key()',
    '[attr.hidden]': 'field()().hidden() || null',
  },
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class IonicSliderFieldComponent implements IonicSliderComponent {
  private readonly elementRef = inject(ElementRef<HTMLElement>);

  readonly field = input.required<FieldTree<number>>();
  readonly key = input.required<string>();

  readonly label = input<DynamicText>();
  readonly placeholder = input<DynamicText>();
  readonly className = input<string>('');
  readonly tabIndex = input<number>();

  readonly props = input<IonicSliderProps>();
  readonly meta = input<FieldMeta>();
  readonly validationMessages = input<ValidationMessages>();
  readonly defaultValidationMessages = input<ValidationMessages>();

  constructor() {
    setupMetaTracking(this.elementRef, this.meta);
  }

  readonly resolvedErrors = createResolvedErrorsSignal(this.field, this.validationMessages, this.defaultValidationMessages);
  readonly showErrors = shouldShowErrors(this.field);

  readonly errorsToDisplay = computed(() => (this.showErrors() ? this.resolvedErrors() : []));

  protected defaultPinFormatter = (value: number) => String(value);

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
