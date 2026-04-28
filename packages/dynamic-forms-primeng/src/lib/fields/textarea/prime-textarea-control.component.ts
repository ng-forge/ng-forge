import { ChangeDetectionStrategy, Component, computed, ElementRef, inject, input, model } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { FormValueControl } from '@angular/forms/signals';
import { setupMetaTracking, TextareaMeta } from '@ng-forge/dynamic-forms/integration';
import { TextareaModule } from 'primeng/textarea';

/**
 * A wrapper component for PrimeNG's textarea that implements FormValueControl.
 * This allows it to work with Angular's [field] directive from @angular/forms/signals.
 */
@Component({
  selector: 'df-prime-textarea-control',
  imports: [TextareaModule, FormsModule],
  template: `
    <textarea
      pInputTextarea
      [ngModel]="value()"
      (ngModelChange)="value.set($event)"
      [placeholder]="placeholder()"
      [attr.minlength]="minLength()"
      [attr.maxlength]="maxLength()"
      [attr.tabindex]="tabIndex()"
      [autoResize]="autoResize()"
      [disabled]="disabled()"
      [readonly]="readonly()"
      [invalid]="ariaInvalid()"
      [class]="styleClass()"
      [attr.aria-invalid]="ariaInvalid()"
      [attr.aria-required]="ariaRequired()"
      [attr.aria-describedby]="ariaDescribedBy()"
      (blur)="onBlur()"
    ></textarea>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PrimeTextareaControlComponent implements FormValueControl<string> {
  private readonly elementRef = inject(ElementRef<HTMLElement>);

  // ─────────────────────────────────────────────────────────────────────────────
  // FormValueControl implementation
  // ─────────────────────────────────────────────────────────────────────────────

  /** The value of the textarea - required by FormValueControl */
  readonly value = model<string>('');

  /** Tracks whether the field has been touched - used by Field directive */
  readonly touched = model<boolean>(false);

  /** Whether the field is disabled */
  readonly disabled = input<boolean>(false);

  /** Whether the field is readonly */
  readonly readonly = input<boolean>(false);

  /** Whether the field is invalid (from Field directive) */
  readonly invalid = input<boolean>(false);

  /** Whether the field is required (from Field directive) */
  readonly required = input<boolean>(false);

  // ─────────────────────────────────────────────────────────────────────────────
  // PrimeNG-specific props
  // ─────────────────────────────────────────────────────────────────────────────

  readonly placeholder = input<string>('');
  readonly rows = input<number>(4);
  readonly cols = input<number | undefined>(undefined);
  // Length-validator → DOM wiring uses Signal Forms's setInputOnDirectives to copy
  // FieldState.maxLength/minLength onto these camelCase-named inputs automatically.
  // The match must be exact-case — renaming these to lowercase would silently break the
  // wiring. The Ionic adapter takes the alternate strategy (direct template binding)
  // because <ion-input> / <ion-textarea> use lowercase property names we cannot rename.
  // See packages/dynamic-forms-ionic/src/lib/fields/input/ionic-input.component.ts.
  readonly maxLength = input<number | undefined>(undefined);
  readonly minLength = input<number | undefined>(undefined);
  readonly tabIndex = input<number | undefined>(undefined);
  readonly autoResize = input<boolean>(false);
  readonly styleClass = input<string>('');
  readonly meta = input<TextareaMeta>();

  /** aria-describedby IDs passed from parent */
  readonly ariaDescribedBy = input<string | null>(null);

  constructor() {
    setupMetaTracking(this.elementRef, this.meta, { selector: 'textarea' });
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // Computed ARIA attributes
  // ─────────────────────────────────────────────────────────────────────────────

  /** aria-invalid: true when field is invalid AND touched */
  protected readonly ariaInvalid = computed(() => {
    return this.invalid() && this.touched();
  });

  /** aria-required: true if field is required, null otherwise */
  protected readonly ariaRequired = computed(() => {
    return this.required() ? true : null;
  });

  /** Marks the field as touched when textarea loses focus */
  onBlur(): void {
    this.touched.set(true);
  }
}
