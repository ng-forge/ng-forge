import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { Field, FieldTree } from '@angular/forms/signals';
import { IonCheckbox } from '@ionic/angular/standalone';
import { DynamicText, DynamicTextPipe } from '@ng-forge/dynamic-form';
import { IonicErrorsComponent } from '../../shared/ionic-errors.component';
import { IonicCheckboxComponent, IonicCheckboxProps } from './ionic-checkbox.type';
import { AsyncPipe } from '@angular/common';

/**
 * Ionic checkbox field component
 */
@Component({
  selector: 'df-ionic-checkbox',
  imports: [IonCheckbox, IonicErrorsComponent, Field, DynamicTextPipe, AsyncPipe],
  template: `
    @let f = field();

    <ion-checkbox
      [field]="f"
      [labelPlacement]="props()?.labelPlacement ?? 'end'"
      [justify]="props()?.justify"
      [color]="props()?.color ?? 'primary'"
      [indeterminate]="props()?.indeterminate ?? false"
      [attr.tabindex]="tabIndex()"
    >
      {{ label() | dynamicText | async }}
    </ion-checkbox>

    <df-ionic-errors [errors]="f().errors()" [invalid]="f().invalid()" [touched]="f().touched()" />
  `,
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
export default class IonicCheckboxFieldComponent implements IonicCheckboxComponent {
  readonly field = input.required<FieldTree<boolean>>();
  readonly key = input.required<string>();

  // Properties
  readonly label = input<DynamicText>();
  readonly placeholder = input<DynamicText>();
  readonly className = input<string>('');
  readonly tabIndex = input<number>();
  readonly props = input<IonicCheckboxProps>();
}
