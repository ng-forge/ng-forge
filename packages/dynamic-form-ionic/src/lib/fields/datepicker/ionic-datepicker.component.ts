import { ChangeDetectionStrategy, Component, input, signal } from '@angular/core';
import { FieldTree } from '@angular/forms/signals';
import { IonDatetime, IonInput, IonModal } from '@ionic/angular/standalone';
import { DynamicText, DynamicTextPipe } from '@ng-forge/dynamic-form';
import { IonicErrorsComponent } from '../../shared/ionic-errors.component';
import { IonicDatepickerComponent, IonicDatepickerProps } from './ionic-datepicker.type';
import { AsyncPipe } from '@angular/common';
import { format } from 'date-fns';

/**
 * Ionic datepicker field component
 */
@Component({
  selector: 'df-ionic-datepicker',
  imports: [
    IonInput,
    IonModal,
    IonDatetime,
    IonicErrorsComponent,
    DynamicTextPipe,
    AsyncPipe,
  ],
  template: `
    @let f = field();
    @let dateValue = f().value();

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
      @if (f().invalid() && f().touched()) {
        <div slot="error">
          <df-ionic-errors [errors]="f().errors()" [invalid]="f().invalid()" [touched]="f().touched()" />
        </div>
      }
    </ion-input>

    <ion-modal
      #modal
      [trigger]="key()"
      [isOpen]="isModalOpen()"
      (didDismiss)="closeModal()"
    >
      <ion-datetime
        [presentation]="props()?.presentation ?? 'date'"
        [value]="dateToIsoString(dateValue)"
        [multiple]="props()?.multiple ?? false"
        [preferWheel]="props()?.preferWheel ?? false"
        [showDefaultButtons]="props()?.showDefaultButtons ?? true"
        [showDefaultTitle]="props()?.showDefaultTitle ?? true"
        [showDefaultTimeLabel]="props()?.showDefaultTimeLabel ?? true"
        [showClearButton]="props()?.showClearButton ?? false"
        [doneText]="props()?.doneText ?? 'Done'"
        [cancelText]="props()?.cancelText ?? 'Cancel'"
        [size]="props()?.size ?? 'fixed'"
        [color]="props()?.color"
        [min]="dateToIsoString(minDate())"
        [max]="dateToIsoString(maxDate())"
        (ionChange)="onDateChange($event)"
      >
      </ion-datetime>
    </ion-modal>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    '[id]': '`${key()}`',
    '[attr.data-testid]': 'key()',
    '[class]': 'className()',
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
