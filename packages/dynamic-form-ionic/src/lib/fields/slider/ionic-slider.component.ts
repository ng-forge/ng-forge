import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { Field, FieldTree } from '@angular/forms/signals';
import { IonRange } from '@ionic/angular/standalone';
import { DynamicText, DynamicTextPipe } from '@ng-forge/dynamic-form';
import { IonicErrorsComponent } from '../../shared/ionic-errors.component';
import { IonicSliderComponent, IonicSliderProps } from './ionic-slider.type';
import { AsyncPipe } from '@angular/common';

/**
 * Ionic slider field component using IonRange
 */
@Component({
  selector: 'df-ionic-slider',
  imports: [IonRange, IonicErrorsComponent, Field, DynamicTextPipe, AsyncPipe],
  template: `
    @let f = field();

    <ion-range
      [field]="f"
      [label]="(label() | dynamicText | async) ?? undefined"
      [labelPlacement]="props()?.labelPlacement ?? 'stacked'"
      [min]="minValue()"
      [max]="maxValue()"
      [step]="step()"
      [dualKnobs]="props()?.dualKnobs ?? false"
      [pin]="props()?.pin ?? false"
      [pinFormatter]="props()?.pinFormatter"
      [ticks]="props()?.ticks ?? false"
      [snaps]="props()?.snaps ?? false"
      [color]="props()?.color ?? 'primary'"
      [disabled]="f().disabled()"
      [attr.tabindex]="tabIndex()"
    />

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
export default class IonicSliderFieldComponent implements IonicSliderComponent {
  readonly field = input.required<FieldTree<number>>();
  readonly key = input.required<string>();

  readonly label = input<DynamicText>();
  readonly placeholder = input<DynamicText>();
  readonly className = input<string>('');
  readonly tabIndex = input<number>();

  readonly minValue = input<number>(0);
  readonly maxValue = input<number>(100);
  readonly step = input<number>(1);

  readonly props = input<IonicSliderProps>();
}
