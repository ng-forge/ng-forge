import { AsyncPipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { WrapperFieldInputs } from '@ng-forge/dynamic-forms/integration';
import { DynamicTextPipe } from '@ng-forge/dynamic-forms/integration';
import type { PrimeIconAddon } from '../types/addons';

/** Renderer for the `prime-icon` addon type. */
@Component({
  selector: 'df-prime-icon-addon',
  imports: [AsyncPipe, DynamicTextPipe],
  template: `<i [class]="iconClass()" [attr.aria-label]="(ariaLabel() | dynamicText | async) ?? null"></i>`,
  host: {
    '[attr.aria-hidden]': 'hasAriaLabel() ? null : "true"',
  },
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PrimeIconAddonComponent {
  readonly addon = input.required<PrimeIconAddon>();
  /** Accepted for contract uniformity — `NgComponentOutlet` setInput is strict; every type must declare it. */
  readonly fieldInputs = input<WrapperFieldInputs | undefined>();

  protected readonly iconClass = computed(() => `pi pi-${this.addon().icon}`);
  protected readonly ariaLabel = computed(() => this.addon().ariaLabel);
  protected readonly hasAriaLabel = computed(() => this.addon().ariaLabel !== undefined);
}
