import { AsyncPipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { DynamicTextPipe, WrapperFieldInputs } from '@ng-forge/dynamic-forms';
import type { BsIconAddon } from '../types/addons';

/** Renderer for the `bs-icon` addon kind. */
@Component({
  selector: 'df-bs-icon-addon',
  imports: [AsyncPipe, DynamicTextPipe],
  template: `<i [class]="iconClass()" [attr.aria-label]="(ariaLabel() | dynamicText | async) ?? null"></i>`,
  host: {
    '[attr.aria-hidden]': 'hasAriaLabel() ? null : "true"',
  },
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BsIconAddonComponent {
  readonly addon = input.required<BsIconAddon>();
  /** Accepted for contract uniformity — `NgComponentOutlet` setInput is strict; every kind must declare it. */
  readonly fieldInputs = input<WrapperFieldInputs | undefined>();

  protected readonly iconClass = computed(() => `bi bi-${this.addon().icon}`);
  protected readonly ariaLabel = computed(() => this.addon().ariaLabel);
  protected readonly hasAriaLabel = computed(() => this.addon().ariaLabel !== undefined);
}
