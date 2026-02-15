import { ChangeDetectionStrategy, Component, computed, ElementRef, inject, input, model } from '@angular/core';
import type { FormCheckboxControl } from '@angular/forms/signals';
import { IonToggle } from '@ionic/angular/standalone';
import { FieldMeta } from '@ng-forge/dynamic-forms';
import { setupMetaTracking } from '@ng-forge/dynamic-forms/integration';

/**
 * A wrapper component for Ionic's ion-toggle that implements FormCheckboxControl.
 * This allows it to work with Angular's [field] directive from @angular/forms/signals.
 *
 * We use FormCheckboxControl because ion-toggle is a boolean checkbox-like control.
 * The Field directive binds to the `checked` model for checkbox controls.
 */
@Component({
  selector: 'df-ion-toggle-control',
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
      [disabled]="isEffectivelyDisabled()"
      [attr.tabindex]="tabIndex()"
      [attr.aria-invalid]="ariaInvalid()"
      [attr.aria-required]="ariaRequired()"
      [attr.aria-readonly]="ariaReadonly()"
      [attr.aria-describedby]="ariaDescribedBy()"
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
  private readonly elementRef = inject(ElementRef<HTMLElement>);

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
  readonly meta = input<FieldMeta>();
  readonly ariaDescribedBy = input<string | null>(null);

  constructor() {
    // Shadow DOM - apply meta to ion-toggle element
    setupMetaTracking(this.elementRef, this.meta, {
      selector: 'ion-toggle',
    });
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

  /** aria-readonly: true if field is readonly, null otherwise */
  protected readonly ariaReadonly = computed(() => {
    return this.readonly() ? true : null;
  });

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
