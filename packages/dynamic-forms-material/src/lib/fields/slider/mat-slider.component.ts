import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { FormField } from '@angular/forms/signals';
import { MatSlider, MatSliderThumb } from '@angular/material/slider';
import { DynamicTextPipe } from '@ng-forge/dynamic-forms';
import { NgForgeControl, NgForgeField, injectNgForgeField, NG_FORGE_FIELD_INPUTS } from '@ng-forge/dynamic-forms/integration';
import { MatSliderProps } from './mat-slider.type';
import { MatError } from '@angular/material/input';
import { AsyncPipe } from '@angular/common';

@Component({
  selector: 'df-mat-slider',
  imports: [MatSlider, MatSliderThumb, MatError, DynamicTextPipe, AsyncPipe, FormField, NgForgeControl],
  hostDirectives: [{ directive: NgForgeField, inputs: [...NG_FORGE_FIELD_INPUTS] }],
  template: `
    @let f = field.field();
    @let inputId = field.key() + '-input';

    @if (field.label(); as label) {
      <div class="slider-label">{{ label | dynamicText | async }}</div>
    }

    <mat-slider
      [min]="f().min?.() ?? 0"
      [max]="f().max?.() ?? 100"
      [step]="step() ?? props()?.step ?? 1"
      [discrete]="props()?.thumbLabel || props()?.showThumbLabel"
      [showTickMarks]="props()?.tickInterval !== undefined"
      [color]="props()?.color || 'primary'"
      class="slider-container"
    >
      <input
        matSliderThumb
        ngForgeControl
        [id]="inputId"
        [formField]="f"
        [attr.tabindex]="field.tabIndex()"
        [attr.aria-invalid]="field.ariaInvalid()"
        [attr.aria-required]="field.ariaRequired()"
        [attr.aria-describedby]="field.ariaDescribedBy()"
      />
    </mat-slider>

    @if (field.errorsToDisplay()[0]; as error) {
      <mat-error [id]="field.errorId()">{{ error.message }}</mat-error>
    } @else if (props()?.hint; as hint) {
      <div class="mat-hint" [id]="field.hintId()">{{ hint | dynamicText | async }}</div>
    }
  `,
  styleUrl: '../../styles/_form-field.scss',
  styles: [
    `
      .slider-container {
        width: 100%;
      }
    `,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class MatSliderFieldComponent {
  protected readonly field = injectNgForgeField<number>();

  readonly step = input<number>();

  readonly props = input<MatSliderProps>();
}
