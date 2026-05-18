import { AsyncPipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { IonIcon } from '@ionic/angular/standalone';
import { DynamicTextPipe, WrapperFieldInputs } from '@ng-forge/dynamic-forms';
import type { IonIconAddon } from '../types/addons';

/**
 * Renderer for the `ion-icon` addon kind.
 *
 * Outputs `<ion-icon [name]="icon">`. The host is set `aria-hidden="true"`
 * by default; if the addon supplies an `ariaLabel`, it is applied so the
 * icon is announced by screen readers.
 */
@Component({
  selector: 'df-ion-icon-addon',
  imports: [IonIcon, AsyncPipe, DynamicTextPipe],
  template: `<ion-icon [name]="iconName()" [attr.aria-label]="(ariaLabel() | dynamicText | async) || null"></ion-icon>`,
  host: {
    '[attr.aria-hidden]': 'hasAriaLabel() ? null : "true"',
  },
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class IonIconAddonComponent {
  readonly addon = input.required<IonIconAddon>();
  /** Accepted for contract uniformity — `NgComponentOutlet` setInput is strict; every kind must declare it. */
  readonly fieldInputs = input<WrapperFieldInputs | undefined>();

  protected readonly iconName = computed(() => this.addon().icon);
  protected readonly ariaLabel = computed(() => this.addon().ariaLabel);
  protected readonly hasAriaLabel = computed(() => this.addon().ariaLabel !== undefined);
}
