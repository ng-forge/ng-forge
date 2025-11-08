import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { FieldTree } from '@angular/forms/signals';
import { MatSlider, MatSliderThumb } from '@angular/material/slider';
import { DynamicText, DynamicTextPipe } from '@ng-forge/dynamic-form';
import { MatSliderComponent, MatSliderProps } from './mat-slider.type';
import { MatError } from '@angular/material/input';
import { AsyncPipe } from '@angular/common';

@Component({
  selector: 'df-mat-slider',
  imports: [MatSlider, MatSliderThumb, MatError, DynamicTextPipe, AsyncPipe],
  template: `
    @let f = field(); @if (label(); as label) {
    <div class="slider-label">{{ label | dynamicText | async }}</div>
    }

    <mat-slider
      [min]="f().min?.() ?? 0"
      [max]="f().max?.() ?? 100"
      [step]="props()?.step ?? 1"
      [discrete]="props()?.thumbLabel || props()?.showThumbLabel"
      [showTickMarks]="props()?.tickInterval !== undefined"
      [color]="props()?.color || 'primary'"
      class="slider-container"
    >
      <input matSliderThumb [(value)]="f().value" [disabled]="f().disabled()" [attr.tabindex]="tabIndex()" />
    </mat-slider>

    @if (props()?.hint; as hint) {
    <div class="mat-hint">{{ hint | dynamicText | async }}</div>
    } (showErrors()) { (error of resolvedErrors(); track error.kind) {
    <mat-error>{{ error.message }}</mat-error>
    } }
  `,
  styles: [
    `
      :host {
        display: block;
      }
    `,
  ],
  host: {
    '[class]': 'className()',
    '[id]': '`${key()}`',
    '[attr.data-testid]': 'key()',
  },
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class MatSliderFieldComponent implements MatSliderComponent {
  readonly field = input.required<FieldTree<number>>();
  readonly key = input.required<string>();

  readonly label = input<DynamicText>();
  readonly placeholder = input<DynamicText>();

  readonly className = input<string>('');
  readonly tabIndex = input<number>();

  readonly props = input<MatSliderProps>();
  readonly validationMessages = input<ValidationMessages>();

  readonly resolvedErrors = createResolvedErrorsSignal(this.field, this.validationMessages);
  readonly showErrors = shouldShowErrors(this.field);
}
