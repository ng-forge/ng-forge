import { ChangeDetectionStrategy, Component, computed, input, signal } from '@angular/core';
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
import { createResolvedErrorsSignal, DynamicText, DynamicTextPipe, shouldShowErrors, ValidationMessages } from '@ng-forge/dynamic-forms';
import { IonicDatepickerComponent, IonicDatepickerProps } from './ionic-datepicker.type';
import { AsyncPipe } from '@angular/common';
import { format } from 'date-fns';

@Component({
  selector: 'df-ionic-datepicker',
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
    @let f = field(); @let dateValue = f().value();

    <ion-input
      [label]="(label() | dynamicText | async) ?? undefined"
      [labelPlacement]="'stacked'"
      [placeholder]="(placeholder() | dynamicText | async) ?? ''"
      [disabled]="f().disabled()"
      [value]="formatDisplayDate(dateValue)"
      [readonly]="true"
      [fill]="'outline'"
      [attr.tabindex]="tabIndex()"
      (click)="!f().disabled() && openModal()"
    >
      <div slot="error">
        @for (error of errorsToDisplay(); track error.kind) {
          <ion-note color="danger">{{ error.message }}</ion-note>
        }
      </div>
    </ion-input>

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
  readonly validationMessages = input<ValidationMessages>();
  readonly defaultValidationMessages = input<ValidationMessages>();

  readonly resolvedErrors = createResolvedErrorsSignal(this.field, this.validationMessages, this.defaultValidationMessages);
  readonly showErrors = shouldShowErrors(this.field);

  // Combine showErrors and resolvedErrors to avoid @if wrapper
  readonly errorsToDisplay = computed(() => (this.showErrors() ? this.resolvedErrors() : []));

  readonly isModalOpen = signal(false);

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
