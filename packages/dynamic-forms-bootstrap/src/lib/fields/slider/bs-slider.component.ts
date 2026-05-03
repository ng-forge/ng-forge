import { ChangeDetectionStrategy, Component, computed, inject, input } from '@angular/core';
import { FieldTree, FormField } from '@angular/forms/signals';
import { DynamicTextPipe } from '@ng-forge/dynamic-forms';
import { NgForgeField, NG_FORGE_FIELD_INPUTS, provideMetaTarget } from '@ng-forge/dynamic-forms/integration';
import { BsSliderProps } from './bs-slider.type';
import { AsyncPipe } from '@angular/common';
import { InputConstraintsDirective } from '../../directives/input-constraints.directive';

@Component({
  selector: 'df-bs-slider',
  imports: [FormField, DynamicTextPipe, AsyncPipe, InputConstraintsDirective],
  styleUrl: '../../styles/_form-field.scss',
  hostDirectives: [{ directive: NgForgeField, inputs: [...NG_FORGE_FIELD_INPUTS] }],
  providers: [provideMetaTarget('input')],
  template: `
    @let f = formFieldTree(); @let inputId = field.key() + '-input';

    <div class="mb-3">
      @if (field.label(); as label) {
        <label [for]="inputId" class="form-label">
          {{ label | dynamicText | async }}
          @if (props()?.showValue) {
            <span class="ms-2 badge bg-secondary"> {{ props()?.valuePrefix }}{{ f().value() }}{{ props()?.valueSuffix }} </span>
          }
        </label>
      }

      <input
        type="range"
        dfBsInputConstraints
        [formField]="f"
        [id]="inputId"
        [dfMin]="f().min?.() ?? props()?.min ?? min()"
        [dfMax]="f().max?.() ?? props()?.max ?? max()"
        [dfStep]="step() ?? props()?.step ?? 1"
        [attr.tabindex]="field.tabIndex()"
        [attr.aria-invalid]="field.ariaInvalid()"
        [attr.aria-required]="field.ariaRequired()"
        [attr.aria-describedby]="field.ariaDescribedBy()"
        class="form-range"
      />

      @if (field.errorsToDisplay()[0]; as error) {
        <div class="invalid-feedback d-block" [id]="field.errorId()" role="alert">{{ error.message }}</div>
      } @else if (props()?.hint; as hint) {
        <div class="form-text" [id]="field.hintId()">{{ hint | dynamicText | async }}</div>
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
  protected readonly field = inject(NgForgeField);

  readonly min = input<number>(0);
  readonly max = input<number>(100);
  readonly step = input<number>();

  readonly props = input<BsSliderProps>();

  // Narrow FieldTree<unknown> to FieldTree<number> for the inner control's strict template type-check.
  protected readonly formFieldTree = computed(() => this.field.field() as FieldTree<number>);
}
