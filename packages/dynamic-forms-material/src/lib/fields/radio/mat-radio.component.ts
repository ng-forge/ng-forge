import { ChangeDetectionStrategy, Component, computed, ElementRef, inject, input } from '@angular/core';
import { FormField, FieldTree } from '@angular/forms/signals';
import { MatRadioButton, MatRadioGroup } from '@angular/material/radio';
import { DynamicTextPipe, FieldOption, ValueType } from '@ng-forge/dynamic-forms';
import { NgForgeField, provideSkipMetaTarget, setupMetaTracking } from '@ng-forge/dynamic-forms/integration';
import { MatRadioProps } from './mat-radio.type';
import { MatError } from '@angular/material/input';
import { AsyncPipe } from '@angular/common';

@Component({
  selector: 'df-mat-radio',
  imports: [MatRadioGroup, MatRadioButton, FormField, MatError, DynamicTextPipe, AsyncPipe],
  hostDirectives: [
    {
      directive: NgForgeField,
      inputs: ['field', 'key', 'label', 'placeholder', 'className', 'tabIndex', 'props', 'meta', 'validationMessages'],
    },
  ],
  // Manual meta tracking with dependents on `options`; opt out of directive-owned tracking.
  providers: [provideSkipMetaTarget()],
  template: `
    @let f = formFieldTree();
    @let radioGroupId = field.key() + '-radio-group';

    @if (field.label()) {
      <div class="radio-label">{{ field.label() | dynamicText | async }}</div>
    }

    <mat-radio-group
      [id]="radioGroupId"
      [formField]="f"
      [attr.aria-invalid]="field.ariaInvalid()"
      [attr.aria-required]="field.ariaRequired()"
      [attr.aria-describedby]="field.ariaDescribedBy()"
    >
      @for (option of options(); track option.value) {
        <mat-radio-button
          [value]="option.value"
          [disabled]="option.disabled || false"
          [color]="props()?.color || 'primary'"
          [labelPosition]="props()?.labelPosition || 'after'"
        >
          {{ option.label | dynamicText | async }}
        </mat-radio-button>
      }
    </mat-radio-group>

    @if (field.errorsToDisplay()[0]; as error) {
      <mat-error [id]="field.errorId()">{{ error.message }}</mat-error>
    } @else if (props()?.hint; as hint) {
      <div class="mat-hint" [id]="field.hintId()">{{ hint | dynamicText | async }}</div>
    }
  `,
  styleUrl: '../../styles/_form-field.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class MatRadioFieldComponent {
  private readonly elementRef = inject(ElementRef<HTMLElement>);

  protected readonly field = inject(NgForgeField);

  readonly options = input<FieldOption<ValueType>[]>([]);
  readonly props = input<MatRadioProps>();

  // Narrow FieldTree<unknown> to FieldTree<ValueType> for the inner control's strict template type-check.
  protected readonly formFieldTree = computed(() => this.field.field() as FieldTree<ValueType>);

  constructor() {
    // Manual meta tracking: dependents reference instance signals, which the
    // declarative `provideMetaTarget` provider can't accept.
    setupMetaTracking(this.elementRef, this.field.meta, {
      selector: 'input[type="radio"]',
      dependents: [this.options],
    });
  }
}
