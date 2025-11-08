import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { Field, FieldTree } from '@angular/forms/signals';
import { IonRange } from '@ionic/angular/standalone';
import {
  DynamicText, DynamicTextPipe,
  ValidationMessages,
  createResolvedErrorsSignal,
  shouldShowErrors,
} from '@ng-forge/dynamic-form';
import { IonicSliderComponent, IonicSliderProps } from './ionic-slider.type';
import { AsyncPipe } from '@angular/common';

/**
 * Ionic slider field component using IonRange
 */
@Component({
  selector: 'df-ionic-slider',
  imports: [IonRange, Field, DynamicTextPipe, AsyncPipe],
  template: `
    @let f = field();

    <ion-range
      [field]="f"
      [label]="(label() | dynamicText | async) ?? undefined"
      [labelPlacement]="props()?.labelPlacement ?? 'stacked'"
      [step]="props()?.step ?? 1"
      [dualKnobs]="props()?.dualKnobs ?? false"
      [pin]="props()?.pin ?? false"
      [pinFormatter]="props()?.pinFormatter"
      [ticks]="props()?.ticks ?? false"
      [snaps]="props()?.snaps ?? false"
      [color]="props()?.color ?? 'primary'"
      [attr.tabindex]="tabIndex()"
    />

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
export default class IonicSliderFieldComponent implements IonicSliderComponent {
  readonly field = input.required<FieldTree<number>>();
  readonly key = input.required<string>();

  readonly label = input<DynamicText>();
  readonly placeholder = input<DynamicText>();
  readonly className = input<string>('');
  readonly tabIndex = input<number>();

  readonly props = input<IonicSliderProps>();
  readonly validationMessages = input<ValidationMessages>();

  readonly resolvedErrors = createResolvedErrorsSignal(this.field, this.validationMessages);
  readonly showErrors = shouldShowErrors(this.field);
}
