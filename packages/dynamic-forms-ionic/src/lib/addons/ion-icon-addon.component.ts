import { AsyncPipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { IonIcon } from '@ionic/angular/standalone';
import { WrapperFieldInputs } from '@ng-forge/dynamic-forms/integration';
import { DynamicTextPipe } from '@ng-forge/dynamic-forms/integration';
import type { IonicIconAddon } from '../types/addons';

/** Renderer for the `ion-icon` addon type. */
@Component({
  selector: 'df-ion-icon-addon',
  imports: [IonIcon, AsyncPipe, DynamicTextPipe],
  template: `<ion-icon [name]="iconName()" [attr.aria-label]="(ariaLabel() | dynamicText | async) ?? null"></ion-icon>`,
  host: {
    '[attr.aria-hidden]': 'hasAriaLabel() ? null : "true"',
  },
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class IonicIconAddonComponent {
  readonly addon = input.required<IonicIconAddon>();
  /** Accepted for contract uniformity — `NgComponentOutlet` setInput is strict; every type must declare it. */
  readonly fieldInputs = input<WrapperFieldInputs | undefined>();

  protected readonly iconName = computed(() => this.addon().icon);
  protected readonly ariaLabel = computed(() => this.addon().ariaLabel);
  protected readonly hasAriaLabel = computed(() => this.addon().ariaLabel !== undefined);
}
