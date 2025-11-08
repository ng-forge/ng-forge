import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { Field, FieldTree } from '@angular/forms/signals';
import { IonRadioGroup, IonRadio, IonItem } from '@ionic/angular/standalone';
import {
  DynamicText, DynamicTextPipe, FieldOption,
  ValidationMessages,
  createResolvedErrorsSignal,
  shouldShowErrors,
} from '@ng-forge/dynamic-form';
import { IonicRadioComponent, IonicRadioProps } from './ionic-radio.type';
import { AsyncPipe } from '@angular/common';

/**
 * Ionic radio field component
 */
@Component({
  selector: 'df-ionic-radio',
  imports: [IonRadioGroup, IonRadio, IonItem, Field, DynamicTextPipe, AsyncPipe],
  template: `
    @let f = field();

    @if (label(); as label) {
    <div class="radio-label">{{ label | dynamicText | async }}</div>
    }

    <ion-radio-group
      [field]="f"
      [compareWith]="props()?.compareWith || defaultCompare"
    >
      @for (option of options(); track option.value) {
      <ion-item [lines]="'none'">
        <ion-radio
          [value]="option.value"
          [disabled]="option.disabled || false"
          [labelPlacement]="props()?.labelPlacement ?? 'end'"
          [justify]="props()?.justify"
          [color]="props()?.color ?? 'primary'"
        >
          {{ option.label | dynamicText | async }}
        </ion-radio>
      </ion-item>
      }
    </ion-radio-group>

    @if (showErrors()) {
      @for (error of resolvedErrors(); track error.kind) {
        <ion-note color="danger">{{ error.message }}</ion-note>
      }
    }
  `,
  styles: [
    `
      :host {
        display: block;
      }

      :host([hidden]) {
        display: none !important;
      }

      .radio-label {
        font-size: 0.875rem;
        font-weight: 500;
        margin-bottom: 0.5rem;
        color: var(--ion-text-color);
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
export default class IonicRadioFieldComponent<T> implements IonicRadioComponent<T> {
  readonly field = input.required<FieldTree<T>>();
  readonly key = input.required<string>();

  // Properties
  readonly label = input<DynamicText>();
  readonly placeholder = input<DynamicText>();
  readonly className = input<string>('');
  readonly tabIndex = input<number>();
  readonly options = input<FieldOption<T>[]>([]);
  readonly props = input<IonicRadioProps<T>>();

  defaultCompare = Object.is;
}
