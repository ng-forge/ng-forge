import { ChangeDetectionStrategy, Component, computed, inject, input } from '@angular/core';
import { FieldTree, FormField } from '@angular/forms/signals';
import { DynamicTextPipe, FieldOption } from '@ng-forge/dynamic-forms';
import { NgForgeField, provideMetaTarget } from '@ng-forge/dynamic-forms/integration';
import { BsSelectProps } from './bs-select.type';
import { AsyncPipe } from '@angular/common';

@Component({
  selector: 'df-bs-select',
  imports: [FormField, DynamicTextPipe, AsyncPipe],
  styleUrl: '../../styles/_form-field.scss',
  hostDirectives: [
    {
      directive: NgForgeField,
      inputs: ['field', 'key', 'label', 'placeholder', 'className', 'tabIndex', 'props', 'meta', 'validationMessages'],
    },
  ],
  providers: [provideMetaTarget('select')],
  template: `
    @let f = formFieldTree(); @let selectId = field.key() + '-select';

    <div class="mb-3">
      @if (field.label(); as label) {
        <label [for]="selectId" class="form-label">{{ label | dynamicText | async }}</label>
      }
      <select
        [formField]="f"
        [id]="selectId"
        class="form-select"
        [class.form-select-sm]="props()?.size === 'sm'"
        [class.form-select-lg]="props()?.size === 'lg'"
        [class.is-invalid]="f().invalid() && f().touched()"
        [multiple]="props()?.multiple || false"
        [size]="props()?.htmlSize"
        [attr.aria-invalid]="field.ariaInvalid()"
        [attr.aria-required]="field.ariaRequired()"
        [attr.aria-describedby]="field.ariaDescribedBy()"
      >
        @if (field.placeholder(); as placeholder) {
          <option value="" disabled [selected]="!f().value()">{{ placeholder | dynamicText | async }}</option>
        }
        @for (option of options(); track option.value) {
          <option [value]="option.value" [disabled]="option.disabled || false" [selected]="isSelected(option.value, f().value())">
            {{ option.label | dynamicText | async }}
          </option>
        }
      </select>

      @if (field.errorsToDisplay()[0]; as error) {
        <div class="invalid-feedback d-block" [id]="field.errorId()" role="alert">{{ error.message }}</div>
      } @else if (props()?.hint; as hint) {
        <div class="form-text" [id]="field.hintId()">{{ hint | dynamicText | async }}</div>
      }
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
  styles: [
    `
      :host([hidden]) {
        display: none !important;
      }
    `,
  ],
})
export default class BsSelectFieldComponent {
  protected readonly field = inject(NgForgeField);

  readonly options = input<FieldOption<string>[]>([]);
  readonly props = input<BsSelectProps>();

  // Narrow FieldTree<unknown> to FieldTree<string> for the inner control's strict template type-check.
  protected readonly formFieldTree = computed(() => this.field.field() as FieldTree<string>);

  defaultCompare = Object.is;

  protected isSelected(optionValue: string, fieldValue: string | string[] | null): boolean {
    const compareWith = this.props()?.compareWith || this.defaultCompare;

    if (Array.isArray(fieldValue)) {
      return fieldValue.some((v) => compareWith(v, optionValue));
    }

    return fieldValue !== null && compareWith(fieldValue, optionValue);
  }
}
