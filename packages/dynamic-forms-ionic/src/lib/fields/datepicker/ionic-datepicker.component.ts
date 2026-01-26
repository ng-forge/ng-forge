import { ChangeDetectionStrategy, Component, computed, ElementRef, inject, input, signal } from '@angular/core';
import { FieldTree } from '@angular/forms/signals';
import {
  IonButton,
  IonButtons,
  IonContent,
  IonDatetime,
  IonHeader,
  IonInput,
  IonModal,
  IonNote,
  IonTitle,
  IonToolbar,
} from '@ionic/angular/standalone';
import { DynamicText, DynamicTextPipe, ValidationMessages } from '@ng-forge/dynamic-forms';
import { createResolvedErrorsSignal, InputMeta, setupMetaTracking, shouldShowErrors } from '@ng-forge/dynamic-forms/integration';
import { IonicDatepickerComponent, IonicDatepickerProps } from './ionic-datepicker.type';
import { AsyncPipe } from '@angular/common';
import { format } from 'date-fns';
import { createAriaDescribedBySignal } from '../../utils/create-aria-described-by';

@Component({
  selector: 'df-ion-datepicker',
  imports: [
    IonInput,
    IonModal,
    IonDatetime,
    IonNote,
    IonButtons,
    IonHeader,
    IonContent,
    IonToolbar,
    IonTitle,
    IonButton,
    DynamicTextPipe,
    AsyncPipe,
  ],
  template: `
    @let f = field();
    @let dateValue = f().value();
    @let inputId = key() + '-input';

    <ion-input
      [id]="inputId"
      [label]="(label() | dynamicText | async) ?? undefined"
      [labelPlacement]="'stacked'"
      [placeholder]="(placeholder() | dynamicText | async) ?? ''"
      [disabled]="f().disabled()"
      [value]="formatDisplayDate(dateValue)"
      [readonly]="true"
      [fill]="'outline'"
      [attr.tabindex]="tabIndex()"
      [attr.aria-invalid]="ariaInvalid()"
      [attr.aria-required]="ariaRequired()"
      [attr.aria-describedby]="ariaDescribedBy()"
      (click)="!f().disabled() && openModal()"
    />
    @if (errorsToDisplay()[0]; as error) {
      <ion-note color="danger" class="df-ion-error" [id]="errorId()" role="alert">{{ error.message }}</ion-note>
    } @else if (props()?.hint; as hint) {
      <ion-note class="df-ion-hint" [id]="hintId()">{{ hint | dynamicText | async }}</ion-note>
    }

    <ion-modal [isOpen]="isModalOpen()" (didDismiss)="closeModal()">
      <ng-template>
        <ion-header>
          <ion-toolbar>
            <ion-title>{{ label() | dynamicText | async }}</ion-title>
            <ion-buttons slot="end">
              <ion-button (click)="closeModal()">Close</ion-button>
            </ion-buttons>
          </ion-toolbar>
        </ion-header>
        <ion-content>
          <ion-datetime
            [presentation]="props()?.presentation ?? 'date'"
            [value]="dateToIsoString(dateValue)"
            [multiple]="props()?.multiple ?? false"
            [preferWheel]="props()?.preferWheel ?? false"
            [showDefaultButtons]="props()?.showDefaultButtons ?? false"
            [showDefaultTitle]="props()?.showDefaultTitle ?? false"
            [showDefaultTimeLabel]="props()?.showDefaultTimeLabel ?? true"
            [showClearButton]="props()?.showClearButton ?? false"
            [color]="props()?.color"
            [min]="dateToIsoString(minDate())"
            [max]="dateToIsoString(maxDate())"
            (ionChange)="onDateChange($event)"
          >
          </ion-datetime>
        </ion-content>
      </ng-template>
    </ion-modal>
  `,
  styleUrl: '../../styles/_form-field.scss',
  styles: [
    `
      ion-input {
        cursor: pointer;
      }

      :host([hidden]) {
        display: none !important;
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
export default class IonicDatepickerFieldComponent implements IonicDatepickerComponent {
  private readonly elementRef = inject(ElementRef<HTMLElement>);

  readonly field = input.required<FieldTree<Date | null>>();
  readonly key = input.required<string>();

  readonly label = input<DynamicText>();
  readonly placeholder = input<DynamicText>();

  readonly className = input<string>('');
  readonly tabIndex = input<number>();

  readonly minDate = input<Date | null>(null);
  readonly maxDate = input<Date | null>(null);
  readonly startAt = input<Date | null>(null);
  readonly props = input<IonicDatepickerProps>();
  readonly meta = input<InputMeta>();
  readonly validationMessages = input<ValidationMessages>();
  readonly defaultValidationMessages = input<ValidationMessages>();

  readonly resolvedErrors = createResolvedErrorsSignal(this.field, this.validationMessages, this.defaultValidationMessages);
  readonly showErrors = shouldShowErrors(this.field);

  readonly errorsToDisplay = computed(() => (this.showErrors() ? this.resolvedErrors() : []));

  readonly isModalOpen = signal(false);

  constructor() {
    // Shadow DOM - apply meta to ion-input element
    setupMetaTracking(this.elementRef, this.meta, {
      selector: 'ion-input',
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

  openModal() {
    this.isModalOpen.set(true);
  }

  closeModal() {
    this.isModalOpen.set(false);
  }

  onDateChange(event: CustomEvent) {
    const value = event.detail.value;
    if (value) {
      const date = new Date(value);
      this.field()().value.set(date);
    } else {
      this.field()().value.set(null);
    }
    this.closeModal();
  }

  dateToIsoString(date: Date | null | undefined): string | undefined {
    if (!date) return undefined;
    return date.toISOString();
  }

  formatDisplayDate(date: Date | null | undefined): string {
    if (!date) return '';

    const presentation = this.props()?.presentation ?? 'date';

    switch (presentation) {
      case 'date':
        return format(date, 'MMM d, yyyy');
      case 'date-time':
      case 'time-date':
        return format(date, 'MMM d, yyyy, h:mm a');
      case 'time':
        return format(date, 'h:mm a');
      case 'month':
        return format(date, 'MMMM yyyy');
      case 'month-year':
        return format(date, 'MMM yyyy');
      case 'year':
        return format(date, 'yyyy');
      default:
        return format(date, 'MMM d, yyyy');
    }
  }
}
