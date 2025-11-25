import { ChangeDetectionStrategy, Component, computed, inject, input } from '@angular/core';
import { Field, FieldTree } from '@angular/forms/signals';
import { MatCheckbox } from '@angular/material/checkbox';
import { createResolvedErrorsSignal, DynamicText, DynamicTextPipe, shouldShowErrors, ValidationMessages } from '@ng-forge/dynamic-forms';
import { MatCheckboxComponent, MatCheckboxProps } from './mat-checkbox.type';
import { MatError } from '@angular/material/input';
import { AsyncPipe } from '@angular/common';
import { MATERIAL_CONFIG } from '../../models/material-config.token';

@Component({
  selector: 'df-mat-checkbox',
  imports: [MatCheckbox, Field, MatError, DynamicTextPipe, AsyncPipe],
  template: `
    @let f = field();

    <mat-checkbox
      [field]="f"
      [labelPosition]="props()?.labelPosition || 'after'"
      [indeterminate]="props()?.indeterminate || false"
      [color]="props()?.color || 'primary'"
      [disableRipple]="effectiveDisableRipple()"
      [attr.tabindex]="tabIndex()"
      [attr.hidden]="f().hidden() || null"
    >
      {{ label() | dynamicText | async }}
    </mat-checkbox>

    @if (props()?.hint; as hint) {
      <div class="mat-hint" [attr.hidden]="f().hidden() || null">{{ hint | dynamicText | async }}</div>
    }
    @for (error of errorsToDisplay(); track error.kind) {
      <mat-error [attr.hidden]="f().hidden() || null">{{ error.message }}</mat-error>
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
export default class MatCheckboxFieldComponent implements MatCheckboxComponent {
  private materialConfig = inject(MATERIAL_CONFIG, { optional: true });

  readonly field = input.required<FieldTree<boolean>>();
  readonly key = input.required<string>();

  // Properties
  readonly label = input<DynamicText>();
  readonly placeholder = input<DynamicText>();
  readonly className = input<string>('');
  readonly tabIndex = input<number>();
  readonly props = input<MatCheckboxProps>();
  readonly validationMessages = input<ValidationMessages>();
  readonly defaultValidationMessages = input<ValidationMessages>();

  readonly effectiveDisableRipple = computed(() => this.props()?.disableRipple ?? this.materialConfig?.disableRipple ?? false);

  readonly resolvedErrors = createResolvedErrorsSignal(this.field, this.validationMessages, this.defaultValidationMessages);
  readonly showErrors = shouldShowErrors(this.field);

  readonly errorsToDisplay = computed(() => (this.showErrors() ? this.resolvedErrors() : []));
}
