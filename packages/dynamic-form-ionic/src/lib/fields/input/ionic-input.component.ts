import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { Field, FieldTree } from '@angular/forms/signals';
import { IonInput, IonNote } from '@ionic/angular/standalone';
import { DynamicText, DynamicTextPipe, ValidationMessages, createResolvedErrorsSignal, shouldShowErrors } from '@ng-forge/dynamic-form';
import { IonicInputComponent, IonicInputProps } from './ionic-input.type';
import { AsyncPipe } from '@angular/common';

/**
 * Ionic input field component
 */
@Component({
  selector: 'df-ionic-input',
  imports: [IonInput, IonNote, Field, DynamicTextPipe, AsyncPipe],
  template: `
    @let f = field();

    <ion-input
      [field]="f"
      [label]="(label() | dynamicText | async) ?? undefined"
      [labelPlacement]="props()?.labelPlacement ?? 'stacked'"
      [placeholder]="(placeholder() | dynamicText | async) ?? ''"
      [clearInput]="props()?.clearInput ?? false"
      [counter]="props()?.counter ?? false"
      [color]="props()?.color"
      [fill]="props()?.fill ?? 'outline'"
      [shape]="props()?.shape"
      [helperText]="(props()?.helperText | dynamicText | async) ?? undefined"
      [errorText]="f().invalid() && f().touched() ? (props()?.errorText | dynamicText | async) ?? undefined : undefined"
      [attr.tabindex]="tabIndex()"
    >
      @if (showErrors()) {
      <div slot="error">
        @for (error of resolvedErrors(); track error.kind) {
        <ion-note color="danger">{{ error.message }}</ion-note>
        }
      </div>
      }
    </ion-input>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    '[id]': '`${key()}`',
    '[attr.data-testid]': 'key()',
    '[class]': 'className()',
  },
})
export default class IonicInputFieldComponent implements IonicInputComponent {
  readonly field = input.required<FieldTree<string>>();
  readonly key = input.required<string>();

  readonly label = input<DynamicText>();
  readonly placeholder = input<DynamicText>();
  readonly className = input<string>('');
  readonly tabIndex = input<number>();
  readonly props = input<IonicInputProps>();
  readonly validationMessages = input<ValidationMessages>();

  readonly resolvedErrors = createResolvedErrorsSignal(this.field, this.validationMessages);
  readonly showErrors = shouldShowErrors(this.field);
}
