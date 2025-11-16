import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { Field, FieldTree } from '@angular/forms/signals';
import { IonNote, IonSelect, IonSelectOption } from '@ionic/angular/standalone';
import {
  createResolvedErrorsSignal,
  DynamicText,
  DynamicTextPipe,
  FieldOption,
  shouldShowErrors,
  ValidationMessages,
} from '@ng-forge/dynamic-form';
import { IonicSelectComponent, IonicSelectProps } from './ionic-select.type';
import { AsyncPipe } from '@angular/common';

/**
 * Ionic select field component
 */
@Component({
  selector: 'df-ionic-select',
  imports: [IonSelect, IonSelectOption, IonNote, Field, DynamicTextPipe, AsyncPipe],
  template: `
    @let f = field();

    <ion-select
      [field]="f"
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
    >
      @for (option of options(); track option.value) {
        <ion-select-option [value]="option.value" [disabled]="option.disabled || false">
          {{ option.label | dynamicText | async }}
        </ion-select-option>
      }
      <div slot="error">
        @for (error of errorsToDisplay(); track error.kind) {
          <ion-note color="danger">{{ error.message }}</ion-note>
        }
      </div>
    </ion-select>
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
  readonly field = input.required<FieldTree<T>>();
  readonly key = input.required<string>();

  readonly label = input<DynamicText>();
  readonly placeholder = input<DynamicText>();

  readonly className = input<string>('');
  readonly tabIndex = input<number>();

  readonly options = input<FieldOption<T>[]>([]);
  readonly props = input<IonicSelectProps<T>>();
  readonly validationMessages = input<ValidationMessages>();
  readonly defaultValidationMessages = input<ValidationMessages>();

  readonly resolvedErrors = createResolvedErrorsSignal(this.field, this.validationMessages, this.defaultValidationMessages);
  readonly showErrors = shouldShowErrors(this.field);

  // Combine showErrors and resolvedErrors to avoid @if wrapper
  readonly errorsToDisplay = computed(() => (this.showErrors() ? this.resolvedErrors() : []));

  defaultCompare = Object.is;
}
