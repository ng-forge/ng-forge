import { ChangeDetectionStrategy, Component, input, signal } from '@angular/core';
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
import { DynamicTextPipe } from '@ng-forge/dynamic-forms';
import { NgForgeField, NG_FORGE_FIELD_INPUTS, injectNgForgeField, provideMetaTarget } from '@ng-forge/dynamic-forms/integration';
import { IonicDatepickerProps } from './ionic-datepicker.type';
import { AsyncPipe } from '@angular/common';
import { format } from 'date-fns';

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
  hostDirectives: [{ directive: NgForgeField, inputs: [...NG_FORGE_FIELD_INPUTS] }],
  providers: [provideMetaTarget('ion-input')],
  template: `
    @let f = field.field();
    @let dateValue = f().value();
    @let inputId = field.key() + '-input';

    <ion-input
      [id]="inputId"
      [label]="(field.label() | dynamicText | async) ?? undefined"
      [labelPlacement]="'stacked'"
      [placeholder]="(field.placeholder() | dynamicText | async) ?? ''"
      [disabled]="f().disabled()"
      [value]="formatDisplayDate(dateValue)"
      [readonly]="true"
      [fill]="'outline'"
      [attr.tabindex]="field.tabIndex()"
      [attr.aria-invalid]="field.ariaInvalid()"
      [attr.aria-required]="field.ariaRequired()"
      [attr.aria-describedby]="field.ariaDescribedBy()"
      (click)="!f().disabled() && openModal()"
    />
    @if (field.errorsToDisplay()[0]; as error) {
      <ion-note color="danger" class="df-ion-error" [id]="field.errorId()" role="alert">{{ error.message }}</ion-note>
    } @else if (props()?.hint; as hint) {
      <ion-note class="df-ion-hint" [id]="field.hintId()">{{ hint | dynamicText | async }}</ion-note>
    }

    <ion-modal [isOpen]="isModalOpen()" (didDismiss)="closeModal()">
      <ng-template>
        <ion-header>
          <ion-toolbar>
            <ion-title>{{ field.label() | dynamicText | async }}</ion-title>
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
})
export default class IonicDatepickerFieldComponent {
  protected readonly field = injectNgForgeField<Date | null>();

  readonly minDate = input<Date | null>(null);
  readonly maxDate = input<Date | null>(null);
  readonly startAt = input<Date | null>(null);
  readonly props = input<IonicDatepickerProps>();

  readonly isModalOpen = signal(false);

  openModal() {
    this.isModalOpen.set(true);
  }

  closeModal() {
    this.isModalOpen.set(false);
  }

  onDateChange(event: CustomEvent) {
    const value = event.detail.value;
    // ion-datetime emits ISO 8601 strings internally; convert to Date | null
    // to match the field tree's value type.
    if (value && typeof value === 'string' && value.length > 0) {
      const date = new Date(value);
      this.field.field()().value.set(date);
    } else {
      this.field.field()().value.set(null);
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
