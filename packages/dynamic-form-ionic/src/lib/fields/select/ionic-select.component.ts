import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { Field, FieldTree } from '@angular/forms/signals';
import { IonSelect, IonSelectOption } from '@ionic/angular/standalone';
import { DynamicText, DynamicTextPipe, FieldOption } from '@ng-forge/dynamic-form';
import { IonicErrorsComponent } from '../../shared/ionic-errors.component';
import { IonicSelectComponent, IonicSelectProps } from './ionic-select.type';
import { AsyncPipe } from '@angular/common';

/**
 * Ionic select field component
 */
@Component({
  selector: 'df-ionic-select',
  imports: [IonSelect, IonSelectOption, IonicErrorsComponent, Field, DynamicTextPipe, AsyncPipe],
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
      [interfaceOptions]="props()?.interfaceOptions"
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
      } @if (f().invalid() && f().touched()) {
      <div slot="error">
        <df-ionic-errors [errors]="f().errors()" [invalid]="f().invalid()" [touched]="f().touched()" />
      </div>
      }
    </ion-select>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    '[id]': '`${key()}`',
    '[attr.data-testid]': 'key()',
    '[class]': 'className()',
  },
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

  defaultCompare = Object.is;
}
