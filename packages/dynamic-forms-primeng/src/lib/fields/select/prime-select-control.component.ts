import { ChangeDetectionStrategy, Component, computed, inject, input, model } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { FormValueControl } from '@angular/forms/signals';
import { FieldOption, ValueType } from '@ng-forge/dynamic-forms';
import { NgForgeField, NgForgeHostControl } from '@ng-forge/dynamic-forms/integration';
import { Select, SelectChangeEvent } from 'primeng/select';
import { MultiSelect, MultiSelectChangeEvent } from 'primeng/multiselect';

/**
 * PrimeNG Select/MultiSelect wrapper implementing FormValueControl. Intended
 * to be rendered inside `df-prime-select` — `NgForgeHostControl` claims the
 * ambient parent NgForgeField for meta/aria. Standalone use loses meta unless
 * the explicit ariaX inputs are bound.
 */
@Component({
  selector: 'df-prime-select-control',
  imports: [Select, MultiSelect, FormsModule],
  hostDirectives: [NgForgeHostControl],
  template: `
    @if (multiple()) {
      <p-multiSelect
        [inputId]="inputId()"
        [ngModel]="multiValue()"
        (onChange)="onMultiSelectChange($event)"
        [options]="options()"
        optionLabel="label"
        optionValue="value"
        [placeholder]="placeholder()"
        [disabled]="disabled()"
        [invalid]="ariaInvalid()"
        [filter]="filter()"
        [showClear]="showClear()"
        [styleClass]="styleClass()"
        [attr.aria-invalid]="ariaInvalid()"
        [attr.aria-required]="ariaRequired()"
        [attr.aria-describedby]="ariaDescribedBy()"
        (onBlur)="onBlur()"
        (onHide)="onBlur()"
      />
    } @else {
      <p-select
        [inputId]="inputId()"
        [ngModel]="value()"
        (onChange)="onSelectChange($event)"
        [options]="options()"
        optionLabel="label"
        optionValue="value"
        [placeholder]="placeholder()"
        [disabled]="disabled()"
        [invalid]="ariaInvalid()"
        [filter]="filter()"
        [showClear]="showClear()"
        [styleClass]="styleClass()"
        [attr.aria-invalid]="ariaInvalid()"
        [attr.aria-required]="ariaRequired()"
        [attr.aria-describedby]="ariaDescribedBy()"
        (onBlur)="onBlur()"
        (onHide)="onBlur()"
      />
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PrimeSelectControlComponent implements FormValueControl<ValueType> {
  // Ambient parent NgForgeField — feeds aria fallback for inner <p-select> bindings.
  private readonly parentField = inject(NgForgeField, { optional: true, skipSelf: true });

  // ─────────────────────────────────────────────────────────────────────────────
  // FormValueControl implementation
  // ─────────────────────────────────────────────────────────────────────────────

  /** The value of the select - required by FormValueControl */
  readonly value = model<ValueType>(undefined as unknown as ValueType);

  /** Tracks whether the field has been touched - used by FormField directive */
  readonly touched = model<boolean>(false);

  /** Whether the field is disabled */
  readonly disabled = input<boolean>(false);

  /** Whether the field is readonly */
  readonly readonly = input<boolean>(false);

  /** Whether the field is invalid (from FormField directive) */
  readonly invalid = input<boolean>(false);

  /** Whether the field is required (from FormField directive) */
  readonly required = input<boolean>(false);

  // ─────────────────────────────────────────────────────────────────────────────
  // PrimeNG Select-specific props
  // ─────────────────────────────────────────────────────────────────────────────

  readonly inputId = input<string>('');
  readonly placeholder = input<string>('');
  readonly options = input<FieldOption<ValueType>[]>([]);
  readonly multiple = input<boolean>(false);
  readonly filter = input<boolean>(false);
  readonly showClear = input<boolean>(false);
  readonly styleClass = input<string>('');

  // Aria signals read from the ambient parent NgForgeField. Standalone use
  // (no parent) lands `false` / `null`.
  protected readonly ariaInvalid = computed<boolean>(() => this.parentField?.ariaInvalid() ?? false);
  protected readonly ariaRequired = computed<true | null>(() => this.parentField?.ariaRequired() ?? null);
  protected readonly ariaDescribedBy = computed<string | null>(() => this.parentField?.ariaDescribedBy() ?? null);

  // ─────────────────────────────────────────────────────────────────────────────
  // Multi-select value handling
  // ─────────────────────────────────────────────────────────────────────────────

  /** Computed to cast value as array for multi-select */
  protected readonly multiValue = computed(() => {
    const val = this.value();
    return Array.isArray(val) ? val : [];
  });

  /** Handles single select change event */
  onSelectChange(event: SelectChangeEvent): void {
    this.value.set(event.value);
  }

  /** Handles multi select change event */
  onMultiSelectChange(event: MultiSelectChangeEvent): void {
    // Store as array for multi-select - cast to ValueType since that's what the field expects
    this.value.set(event.value as unknown as ValueType);
  }

  /** Marks the field as touched when select loses focus */
  onBlur(): void {
    this.touched.set(true);
  }
}
