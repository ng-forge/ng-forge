import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { Field, FieldTree } from '@angular/forms/signals';
import { IonCheckbox, IonNote } from '@ionic/angular/standalone';
import { DynamicText, DynamicTextPipe, ValidationMessages, createResolvedErrorsSignal, shouldShowErrors } from '@ng-forge/dynamic-form';
import { IonicCheckboxComponent, IonicCheckboxProps } from './ionic-checkbox.type';
import { AsyncPipe } from '@angular/common';

/**
 * Ionic checkbox field component
 */
@Component({
  selector: 'df-ionic-checkbox',
  imports: [IonCheckbox, IonNote, Field, DynamicTextPipe, AsyncPipe],
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

    @if (showErrors()) { @for (error of resolvedErrors(); track error.kind) {
    <ion-note color="danger">{{ error.message }}</ion-note>
    } }
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
  readonly validationMessages = input<ValidationMessages>();

  readonly resolvedErrors = createResolvedErrorsSignal(this.field, this.validationMessages);
  readonly showErrors = shouldShowErrors(this.field);
}
