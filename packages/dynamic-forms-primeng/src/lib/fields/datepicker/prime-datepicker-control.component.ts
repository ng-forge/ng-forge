import { ChangeDetectionStrategy, Component, computed, ElementRef, inject, input, model } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { FormValueControl } from '@angular/forms/signals';
import { NgForgeField, setupMetaTracking, InputMeta } from '@ng-forge/dynamic-forms/integration';
import { DatePicker } from 'primeng/datepicker';

/** ISO string, or an array of them in `multiple` and `range` modes. */
type PrimeDatepickerValue = string | readonly string[] | null;

/**
 * PrimeNG DatePicker wrapper implementing FormValueControl. Value is stored
 * as an ISO date string. Rendered inside `df-prime-datepicker` — picks up
 * meta + aria from the ambient parent NgForgeField (selector: `'input'`).
 */
@Component({
  selector: 'df-prime-datepicker-control',
  imports: [DatePicker, FormsModule],
  template: `
    <p-datepicker
      [inputId]="inputId()"
      [ngModel]="dateValue()"
      (ngModelChange)="onModelChange($event)"
      (onSelect)="onSelect($event)"
      (onClear)="onClear()"
      [placeholder]="placeholder()"
      [disabled]="disabled()"
      [readonlyInput]="readonly()"
      [invalid]="ariaInvalid()"
      [dateFormat]="dateFormat()"
      [inline]="inline()"
      [showIcon]="showIcon()"
      [showButtonBar]="showButtonBar()"
      [selectionMode]="selectionMode()"
      [touchUI]="touchUI()"
      [view]="view()"
      [minDate]="minDate()"
      [maxDate]="maxDate()"
      [defaultDate]="defaultDate()"
      [styleClass]="styleClass()"
      [attr.tabindex]="tabIndex()"
      [attr.aria-invalid]="ariaInvalid()"
      [attr.aria-required]="ariaRequired()"
      [attr.aria-describedby]="ariaDescribedBy()"
      (onBlur)="onBlur()"
    />
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PrimeDatepickerControlComponent implements FormValueControl<PrimeDatepickerValue> {
  private readonly elementRef = inject(ElementRef<HTMLElement>);
  private readonly parentField = inject(NgForgeField, { optional: true });

  // ─────────────────────────────────────────────────────────────────────────────
  // FormValueControl implementation
  // ─────────────────────────────────────────────────────────────────────────────

  /** The value of the datepicker as ISO string - required by FormValueControl */
  readonly value = model<PrimeDatepickerValue>(null);

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
  // PrimeNG DatePicker-specific props
  // ─────────────────────────────────────────────────────────────────────────────

  readonly inputId = input<string>('');
  readonly placeholder = input<string>('');
  readonly dateFormat = input<string>('mm/dd/yy');
  readonly inline = input<boolean>(false);
  readonly showIcon = input<boolean>(true);
  readonly showButtonBar = input<boolean>(false);
  readonly selectionMode = input<'single' | 'multiple' | 'range'>('single');
  readonly touchUI = input<boolean>(false);
  readonly view = input<'date' | 'month' | 'year'>('date');
  readonly minDate = input<Date | null>(null);
  readonly maxDate = input<Date | null>(null);
  readonly defaultDate = input<Date | null>(null);
  readonly styleClass = input<string>('');
  readonly tabIndex = input<number | undefined>(undefined);

  // Meta + aria read from the ambient parent NgForgeField.
  protected readonly meta = computed<InputMeta | undefined>(() => this.parentField?.meta() as InputMeta | undefined);
  protected readonly ariaInvalid = computed<boolean>(() => this.parentField?.ariaInvalid() ?? false);
  protected readonly ariaRequired = computed<true | null>(() => this.parentField?.ariaRequired() ?? null);
  protected readonly ariaDescribedBy = computed<string | null>(() => this.parentField?.ariaDescribedBy() ?? null);

  constructor() {
    this.parentField?.markClaimed();
    setupMetaTracking(this.elementRef, this.meta, { selector: 'input' });
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // Date conversion
  // ─────────────────────────────────────────────────────────────────────────────

  /** Converts the stored ISO string(s) to Date(s) for PrimeNG's ngModel */
  protected readonly dateValue = computed(() => {
    const val = this.value();
    if (!val) return null;
    return Array.isArray(val) ? val.map(toDate).filter((date) => date !== null) : toDate(val as string);
  });

  /** Handles ngModel changes (from typing or calendar selection) */
  onModelChange(date: Date | readonly (Date | null)[] | null): void {
    if (Array.isArray(date)) {
      // A range being picked arrives as [start, null]; keep the start.
      this.value.set(date.filter(isValidDate).map((d) => d.toISOString()));
    } else {
      this.value.set(isValidDate(date) ? date.toISOString() : null);
    }
  }

  /** Handles date selection from DatePicker calendar - converts Date to ISO string */
  onSelect(event: Date): void {
    // In multiple and range modes onSelect reports one date; ngModelChange carries the full selection.
    if (this.selectionMode() !== 'single') return;
    this.value.set(isValidDate(event) ? event.toISOString() : null);
  }

  /** Handles clear action from DatePicker */
  onClear(): void {
    this.value.set(null);
  }

  /** Marks the field as touched when datepicker loses focus */
  onBlur(): void {
    this.touched.set(true);
    this.parentField?.field()().markAsTouched();
  }
}

function isValidDate(value: unknown): value is Date {
  return value instanceof Date && !isNaN(value.getTime());
}

function toDate(value: string): Date | null {
  const date = new Date(value);
  return isValidDate(date) ? date : null;
}
