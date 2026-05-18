import { AsyncPipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { DynamicTextPipe, WrapperFieldInputs } from '@ng-forge/dynamic-forms';
import type { PrimeIconAddon } from '../types/addons';

/**
 * Renderer for the `prime-icon` addon kind.
 *
 * Outputs `<i class="pi pi-{icon}">`. The host is set `aria-hidden="true"`
 * by default; if the addon supplies an `ariaLabel`, it is applied so the
 * icon is announced by screen readers.
 */
@Component({
  selector: 'df-prime-icon-addon',
  imports: [AsyncPipe, DynamicTextPipe],
  template: `<i [class]="iconClass()" [attr.aria-label]="(ariaLabel() | dynamicText | async) || null"></i>`,
  host: {
    '[attr.aria-hidden]': 'hasAriaLabel() ? null : "true"',
  },
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PrimeIconAddonComponent {
  readonly addon = input.required<PrimeIconAddon>();
  /** Accepted for contract uniformity — `NgComponentOutlet` setInput is strict; every kind must declare it. */
  readonly fieldInputs = input<WrapperFieldInputs | undefined>();

  protected readonly iconClass = computed(() => `pi pi-${this.addon().icon}`);
  protected readonly ariaLabel = computed(() => this.addon().ariaLabel);
  protected readonly hasAriaLabel = computed(() => this.addon().ariaLabel !== undefined);
}
