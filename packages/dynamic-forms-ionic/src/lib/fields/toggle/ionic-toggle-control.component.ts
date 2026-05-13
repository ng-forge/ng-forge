import { ChangeDetectionStrategy, Component, computed, input, model } from '@angular/core';
import type { FormCheckboxControl } from '@angular/forms/signals';
import { IonToggle } from '@ionic/angular/standalone';
import { NgForgeControl } from '@ng-forge/dynamic-forms/integration';

/**
 * ion-toggle wrapper implementing FormCheckboxControl. Rendered inside
 * `df-ion-toggle`. `NgForgeControl` on `<ion-toggle>` claims the ambient
 * parent NgForgeField and routes meta + aria onto that element.
 */
@Component({
  selector: 'df-ion-toggle-control',
  imports: [IonToggle, NgForgeControl],
  template: `
    <ion-toggle
      ngForgeControl
      [checked]="isChecked()"
      (ionChange)="onToggleChange($event)"
      (ionBlur)="onBlur()"
      [labelPlacement]="labelPlacement()"
      [justify]="justify()"
      [color]="color()"
      [enableOnOffLabels]="enableOnOffLabels()"
      [disabled]="isEffectivelyDisabled()"
      [attr.tabindex]="tabIndex()"
      [attr.aria-readonly]="ariaReadonly()"
    >
      <ng-content />
    </ion-toggle>
  `,
  styleUrl: '../../styles/_form-field.scss',
  host: {
    style: 'display: block',
  },
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class IonicToggleControlComponent implements FormCheckboxControl {
  // ─────────────────────────────────────────────────────────────────────────────
  // FormCheckboxControl implementation
  // ─────────────────────────────────────────────────────────────────────────────

  /** The checked state - required by FormCheckboxControl */
  readonly checked = model<boolean>(false);

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

  // aria-invalid / aria-required / aria-describedby are written to <ion-toggle>
  // by NgForgeControl. aria-readonly is Ionic-specific and stays template-side.
  protected readonly ariaReadonly = computed(() => (this.readonly() ? true : null));

  /** Computed checked state - ensures proper boolean conversion for ion-toggle */
  protected readonly isChecked = computed(() => {
    return this.checked() === true;
  });

  /**
   * ion-toggle doesn't have a native readonly attribute.
   * When readonly, we disable the toggle to prevent changes while maintaining the visual state.
   */
  protected readonly isEffectivelyDisabled = computed(() => {
    return this.disabled() || this.readonly();
  });

  // ─────────────────────────────────────────────────────────────────────────────
  // Event Handlers
  // ─────────────────────────────────────────────────────────────────────────────

  /** Handle toggle change - sync ion-toggle's checked state to our checked model */
  onToggleChange(event: CustomEvent<{ checked: boolean; value: string }>): void {
    this.checked.set(event.detail.checked);
  }

  /** Marks the field as touched when toggle loses focus */
  onBlur(): void {
    this.touched.set(true);
  }
}
