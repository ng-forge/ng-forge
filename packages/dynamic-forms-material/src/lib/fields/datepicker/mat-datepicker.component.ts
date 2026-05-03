import { ChangeDetectionStrategy, Component, computed, inject, input } from '@angular/core';
import { FormField, FieldTree } from '@angular/forms/signals';
import { MatError, MatFormField, MatLabel, MatSuffix } from '@angular/material/form-field';
import { MatHint, MatInput } from '@angular/material/input';
import { MatDatepicker, MatDatepickerInput, MatDatepickerToggle } from '@angular/material/datepicker';
import { DynamicTextPipe } from '@ng-forge/dynamic-forms';
import { NgForgeField, NG_FORGE_FIELD_INPUTS, provideMetaTarget } from '@ng-forge/dynamic-forms/integration';
import { MatDatepickerProps } from './mat-datepicker.type';
import { provideNativeDateAdapter } from '@angular/material/core';
import { AsyncPipe } from '@angular/common';
import { MATERIAL_CONFIG } from '../../models/material-config.token';

@Component({
  selector: 'df-mat-datepicker',
  imports: [
    MatFormField,
    MatLabel,
    MatInput,
    MatHint,
    MatDatepicker,
    MatDatepickerInput,
    MatDatepickerToggle,
    MatSuffix,
    FormField,
    MatError,
    DynamicTextPipe,
    AsyncPipe,
  ],
  hostDirectives: [{ directive: NgForgeField, inputs: [...NG_FORGE_FIELD_INPUTS] }],
  template: `
    @let inputId = field.key() + '-input';

    <mat-form-field
      [appearance]="effectiveAppearance()"
      [subscriptSizing]="effectiveSubscriptSizing()"
      [floatLabel]="effectiveFloatLabel()"
      [hideRequiredMarker]="effectiveHideRequiredMarker()"
    >
      @if (field.label(); as label) {
        <mat-label>{{ label | dynamicText | async }}</mat-label>
      }

      <input
        matInput
        [id]="inputId"
        [matDatepicker]="picker"
        [formField]="formFieldTree()"
        [placeholder]="(field.placeholder() | dynamicText | async) ?? ''"
        [attr.tabindex]="field.tabIndex()"
        [min]="minDate()"
        [max]="maxDate()"
        [attr.aria-invalid]="field.ariaInvalid()"
        [attr.aria-required]="field.ariaRequired()"
        [attr.aria-describedby]="field.ariaDescribedBy()"
      />

      <mat-datepicker-toggle matIconSuffix [for]="picker" />
      <mat-datepicker #picker [startAt]="startAt()" [startView]="props()?.startView || 'month'" [touchUi]="props()?.touchUi ?? false" />

      @if (field.errorsToDisplay()[0]; as error) {
        <mat-error [id]="field.errorId()">{{ error.message }}</mat-error>
      } @else if (props()?.hint; as hint) {
        <mat-hint [id]="field.hintId()">{{ hint | dynamicText | async }}</mat-hint>
      }
    </mat-form-field>
  `,
  styleUrl: '../../styles/_form-field.scss',
  styles: [
    `
      mat-form-field {
        width: 100%;
      }
    `,
  ],
  providers: [provideNativeDateAdapter(), provideMetaTarget('input')],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class MatDatepickerFieldComponent {
  private materialConfig = inject(MATERIAL_CONFIG, { optional: true });

  protected readonly field = inject(NgForgeField);

  readonly minDate = input<Date | null>(null);
  readonly maxDate = input<Date | null>(null);
  readonly startAt = input<Date | null>(null);
  readonly props = input<MatDatepickerProps>();

  // Narrow FieldTree<unknown> to FieldTree<string> for the inner control's strict template type-check.
  protected readonly formFieldTree = computed(() => this.field.field() as FieldTree<string>);

  readonly effectiveAppearance = computed(() => this.props()?.appearance ?? this.materialConfig?.appearance ?? 'outline');

  readonly effectiveSubscriptSizing = computed(() => this.props()?.subscriptSizing ?? this.materialConfig?.subscriptSizing ?? 'dynamic');

  readonly effectiveFloatLabel = computed(() => this.props()?.floatLabel ?? this.materialConfig?.floatLabel ?? 'auto');

  readonly effectiveHideRequiredMarker = computed(
    () => this.props()?.hideRequiredMarker ?? this.materialConfig?.hideRequiredMarker ?? false,
  );
}
