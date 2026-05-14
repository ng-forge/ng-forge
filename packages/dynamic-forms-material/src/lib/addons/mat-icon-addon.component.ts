import { AsyncPipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { MatIcon } from '@angular/material/icon';
import { DynamicTextPipe, WrapperFieldInputs } from '@ng-forge/dynamic-forms';
import type { MatIconAddon } from '../types/addons';

/**
 * Renderer for the `mat-icon` addon kind.
 *
 * Outputs `<mat-icon>{icon}</mat-icon>` using Material Icons ligatures. The
 * host is set `aria-hidden="true"` by default; if the addon supplies an
 * `ariaLabel`, it is applied so the icon is announced by screen readers.
 */
@Component({
  selector: 'df-mat-icon-addon',
  imports: [MatIcon, AsyncPipe, DynamicTextPipe],
  template: `<mat-icon [attr.aria-label]="ariaLabel() | dynamicText | async">{{ addon().icon }}</mat-icon>`,
  host: {
    '[attr.aria-hidden]': 'hasAriaLabel() ? null : "true"',
  },
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MatIconAddonComponent {
  readonly addon = input.required<MatIconAddon>();
  /** Accepted for contract uniformity — `NgComponentOutlet` setInput is strict; every kind must declare it. */
  readonly fieldInputs = input<WrapperFieldInputs | undefined>();

  protected readonly ariaLabel = computed(() => this.addon().ariaLabel);
  protected readonly hasAriaLabel = computed(() => this.addon().ariaLabel !== undefined);
}
