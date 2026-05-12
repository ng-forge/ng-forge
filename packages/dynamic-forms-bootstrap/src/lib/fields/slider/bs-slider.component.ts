import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { FormField } from '@angular/forms/signals';
import { DynamicTextPipe } from '@ng-forge/dynamic-forms';
import { NgForgeControl, NgForgeField, injectNgForgeField, NG_FORGE_FIELD_INPUTS } from '@ng-forge/dynamic-forms/integration';
import { BsSliderProps } from './bs-slider.type';
import { AsyncPipe } from '@angular/common';
import { InputConstraintsDirective } from '../../directives/input-constraints.directive';

@Component({
  selector: 'df-bs-slider',
  imports: [FormField, DynamicTextPipe, AsyncPipe, InputConstraintsDirective, NgForgeControl],
  styleUrl: '../../styles/_form-field.scss',
  hostDirectives: [{ directive: NgForgeField, inputs: [...NG_FORGE_FIELD_INPUTS] }],
  template: `
    @let f = ngf.field(); @let inputId = ngf.key() + '-input';

    <div class="mb-3">
      @if (ngf.label(); as label) {
        <label [for]="inputId" class="form-label">
          {{ label | dynamicText | async }}
          @if (props()?.showValue) {
            <span class="ms-2 badge bg-secondary"> {{ props()?.valuePrefix }}{{ f().value() }}{{ props()?.valueSuffix }} </span>
          }
        </label>
      }

      <input
        ngForgeControl
        type="range"
        dfBsInputConstraints
        [formField]="f"
        [id]="inputId"
        [dfMin]="f().min?.() ?? props()?.min ?? min()"
        [dfMax]="f().max?.() ?? props()?.max ?? max()"
        [dfStep]="step() ?? props()?.step ?? 1"
        [attr.tabindex]="ngf.tabIndex()"
        class="form-range"
      />

      @if (ngf.errorsToDisplay()[0]; as error) {
        <div class="invalid-feedback d-block" [id]="ngf.errorId()" role="alert">{{ error.message }}</div>
      } @else if (props()?.hint; as hint) {
        <div class="form-text" [id]="ngf.hintId()">{{ hint | dynamicText | async }}</div>
      }
    </div>
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
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class BsSliderFieldComponent {
  protected readonly ngf = injectNgForgeField<number>();

  readonly min = input<number>(0);
  readonly max = input<number>(100);
  readonly step = input<number>();

  readonly props = input<BsSliderProps>();
}
