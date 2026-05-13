import { ChangeDetectionStrategy, Component, computed, ElementRef, inject, input, model } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { FormValueControl } from '@angular/forms/signals';
import { NgForgeField, setupMetaTracking, TextareaMeta } from '@ng-forge/dynamic-forms/integration';
import { TextareaModule } from 'primeng/textarea';

/**
 * PrimeNG textarea wrapper implementing FormValueControl. Rendered inside
 * `df-prime-textarea` — picks up meta + aria from the ambient parent
 * NgForgeField via `setupMetaTracking` (selector: `'textarea'`).
 */
@Component({
  selector: 'df-prime-textarea-control',
  imports: [TextareaModule, FormsModule],
  template: `
    <textarea
      pInputTextarea
      [id]="inputId()"
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
  private readonly parentField = inject(NgForgeField, { optional: true });

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

  /** Id forwarded onto the inner <textarea> so the parent `<label [for]>` resolves correctly. */
  readonly inputId = input<string>('');
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

  // Meta + aria-describedby read from the ambient parent NgForgeField.
  protected readonly meta = computed<TextareaMeta | undefined>(() => this.parentField?.meta() as TextareaMeta | undefined);
  protected readonly ariaDescribedBy = computed<string | null>(() => this.parentField?.ariaDescribedBy() ?? null);

  // Aria signals read from the ambient parent NgForgeField — matches the
  // pattern in prime-datepicker-control / prime-select-control. Standalone
  // use (no parent) lands false / null.
  protected readonly ariaInvalid = computed<boolean>(() => this.parentField?.ariaInvalid() ?? false);
  protected readonly ariaRequired = computed<true | null>(() => this.parentField?.ariaRequired() ?? null);

  constructor() {
    this.parentField?.markClaimed();
    setupMetaTracking(this.elementRef, this.meta, { selector: 'textarea' });
  }

  /** Marks the field as touched when textarea loses focus */
  onBlur(): void {
    this.touched.set(true);
  }
}
