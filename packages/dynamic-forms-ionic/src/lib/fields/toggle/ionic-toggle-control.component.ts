import { ChangeDetectionStrategy, Component, computed, input, model } from '@angular/core';
import type { FormValueControl } from '@angular/forms/signals';
import { IonToggle } from '@ionic/angular/standalone';

/**
 * A wrapper component for Ionic's ion-toggle that implements FormValueControl.
 * This allows it to work with Angular's [field] directive from @angular/forms/signals.
 *
 * We use FormValueControl<boolean> instead of FormCheckboxControl because
 * the Field directive binds to the `value` model for value-based controls.
 */
@Component({
  selector: 'df-ionic-toggle-control',
  imports: [IonToggle],
  template: `
    <ion-toggle
      [checked]="isChecked()"
      (ionChange)="onToggleChange($event)"
      (ionBlur)="onBlur()"
      [labelPlacement]="labelPlacement()"
      [justify]="justify()"
      [color]="color()"
      [enableOnOffLabels]="enableOnOffLabels()"
      [disabled]="disabled()"
      [attr.tabindex]="tabIndex()"
      [attr.aria-invalid]="ariaInvalid()"
      [attr.aria-required]="ariaRequired()"
    >
      <ng-content />
    </ion-toggle>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class IonicToggleControlComponent implements FormValueControl<boolean> {
  // ─────────────────────────────────────────────────────────────────────────────
  // FormValueControl implementation
  // ─────────────────────────────────────────────────────────────────────────────

  /** The value - required by FormValueControl */
  readonly value = model<boolean>(false);

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
  // Ionic-specific props
  // ─────────────────────────────────────────────────────────────────────────────

  readonly labelPlacement = input<'start' | 'end' | 'fixed' | 'stacked'>('end');
  readonly justify = input<'start' | 'end' | 'space-between' | undefined>(undefined);
  readonly color = input<string>('primary');
  readonly enableOnOffLabels = input<boolean>(false);
  readonly tabIndex = input<number | undefined>(undefined);

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

  /** Computed checked state - ensures proper boolean conversion for ion-toggle */
  protected readonly isChecked = computed(() => {
    return this.value() === true;
  });

  // ─────────────────────────────────────────────────────────────────────────────
  // Event Handlers
  // ─────────────────────────────────────────────────────────────────────────────

  /** Handle toggle change - sync ion-toggle's checked state to our value model */
  onToggleChange(event: CustomEvent<{ checked: boolean; value: string }>): void {
    this.value.set(event.detail.checked);
  }

  /** Marks the field as touched when toggle loses focus */
  onBlur(): void {
    this.touched.set(true);
  }
}
