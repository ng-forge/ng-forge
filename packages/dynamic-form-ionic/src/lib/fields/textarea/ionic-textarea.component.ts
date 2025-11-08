import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { Field, FieldTree } from '@angular/forms/signals';
import { IonTextarea } from '@ionic/angular/standalone';
import {
  DynamicText, DynamicTextPipe,
  ValidationMessages,
  createResolvedErrorsSignal,
  shouldShowErrors,
} from '@ng-forge/dynamic-form';
import { IonicTextareaComponent, IonicTextareaProps } from './ionic-textarea.type';
import { AsyncPipe } from '@angular/common';

/**
 * Ionic textarea field component
 */
@Component({
  selector: 'df-ionic-textarea',
  imports: [IonTextarea, Field, DynamicTextPipe, AsyncPipe],
  template: `
    @let f = field();

    <ion-textarea
      [field]="f"
      [label]="(label() | dynamicText | async) ?? undefined"
      [labelPlacement]="props()?.labelPlacement ?? 'stacked'"
      [placeholder]="(placeholder() | dynamicText | async) ?? ''"
      [rows]="props()?.rows ?? 4"
      [autoGrow]="props()?.autoGrow ?? false"
      [counter]="props()?.counter ?? false"
      [color]="props()?.color"
      [fill]="props()?.fill ?? 'outline'"
      [shape]="props()?.shape"
      [helperText]="(props()?.helperText | dynamicText | async) ?? undefined"
      [errorText]="f().invalid() && f().touched() ? (props()?.errorText | dynamicText | async) ?? undefined : undefined"
      [attr.tabindex]="tabIndex()"
    >
      @if (f().invalid() && f().touched()) {
      <div slot="error">
        @if (showErrors()) {
      @for (error of resolvedErrors(); track error.kind) {
        <ion-note color="danger">{{ error.message }}</ion-note>
      }
    }
      </div>
      }
    </ion-textarea>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    '[id]': '`${key()}`',
    '[attr.data-testid]': 'key()',
    '[class]': 'className()',
  },
})
export default class IonicTextareaFieldComponent implements IonicTextareaComponent {
  readonly field = input.required<FieldTree<string>>();
  readonly key = input.required<string>();

  readonly label = input<DynamicText>();
  readonly placeholder = input<DynamicText>();
  readonly className = input<string>('');
  readonly tabIndex = input<number>();
  readonly props = input<IonicTextareaProps>();
  readonly validationMessages = input<ValidationMessages>();

  readonly resolvedErrors = createResolvedErrorsSignal(this.field, this.validationMessages);
  readonly showErrors = shouldShowErrors(this.field);
}
