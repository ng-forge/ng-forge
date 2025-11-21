import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { Field, FieldTree } from '@angular/forms/signals';
import { IonItem, IonNote, IonRadio, IonRadioGroup } from '@ionic/angular/standalone';
import {
  createResolvedErrorsSignal,
  DynamicText,
  DynamicTextPipe,
  FieldOption,
  shouldShowErrors,
  ValidationMessages,
} from '@ng-forge/dynamic-forms';
import { IonicRadioComponent, IonicRadioProps } from './ionic-radio.type';
import { AsyncPipe } from '@angular/common';

/**
 * Ionic radio field component
 */
@Component({
  selector: 'df-ionic-radio',
  imports: [IonRadioGroup, IonRadio, IonItem, IonNote, Field, DynamicTextPipe, AsyncPipe],
  template: `
    @let f = field();
    @if (label(); as label) {
      <div class="radio-label">{{ label | dynamicText | async }}</div>
    }

    <ion-radio-group [field]="f" [compareWith]="props()?.compareWith || defaultCompare">
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

    @for (error of errorsToDisplay(); track error.kind) {
      <ion-note color="danger">{{ error.message }}</ion-note>
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
  readonly validationMessages = input<ValidationMessages>();
  readonly defaultValidationMessages = input<ValidationMessages>();

  readonly resolvedErrors = createResolvedErrorsSignal(this.field, this.validationMessages, this.defaultValidationMessages);
  readonly showErrors = shouldShowErrors(this.field);

  // Combine showErrors and resolvedErrors to avoid @if wrapper
  readonly errorsToDisplay = computed(() => (this.showErrors() ? this.resolvedErrors() : []));

  defaultCompare = Object.is;
}
