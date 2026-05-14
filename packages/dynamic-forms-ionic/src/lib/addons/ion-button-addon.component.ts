import { AsyncPipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed } from '@angular/core';
import { IonButton, IonIcon, IonSpinner } from '@ionic/angular/standalone';
import { DynamicTextPipe } from '@ng-forge/dynamic-forms';
import { injectNgForgeAddonAction, NgForgeAddonAction } from '@ng-forge/dynamic-forms/integration';
import type { IonicButtonAddon } from '../types/addons';

/**
 * Renderer for the `ion-button` addon kind.
 *
 * Wraps Ionic's `<ion-button>`. Click dispatch (preset / actionRef /
 * action precedence, multi-set warning, `disabled` / `loading`
 * resolution) lives on `NgForgeAddonAction`; this component focuses on
 * the visual layer. While `action.loading()`, an `<ion-spinner>` is
 * rendered in place of the icon and the button is disabled.
 */
@Component({
  selector: 'df-ion-button-addon',
  imports: [IonButton, IonIcon, IonSpinner, DynamicTextPipe, AsyncPipe],
  hostDirectives: [NgForgeAddonAction],
  template: `
    <ion-button
      [color]="color()"
      [fill]="fill()"
      [disabled]="action.disabled() || action.loading()"
      [attr.aria-label]="(ariaLabel() | dynamicText | async) || null"
      (click)="action.dispatch()"
    >
      @if (action.loading()) {
        <ion-spinner [slot]="iconOnly() ? 'icon-only' : 'start'" name="dots"></ion-spinner>
      } @else if (icon(); as ic) {
        <ion-icon [name]="ic" [slot]="iconOnly() ? 'icon-only' : 'start'"></ion-icon>
      }
      @if (label(); as lbl) {
        {{ lbl | dynamicText | async }}
      }
    </ion-button>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class IonButtonAddonComponent {
  protected readonly action = injectNgForgeAddonAction<IonicButtonAddon>();

  /** Re-exposed for template binding — same signal stored on the directive. */
  protected readonly addon = this.action.addon;

  protected readonly label = computed(() => this.addon().label);
  protected readonly ariaLabel = computed(() => this.addon().ariaLabel);
  protected readonly icon = computed(() => this.addon().icon);
  protected readonly color = computed(() => this.addon().color ?? 'medium');
  protected readonly fill = computed(() => this.addon().fill ?? 'clear');
  /** Icon-only when there is an icon but no label — drives the `slot` choice. */
  protected readonly iconOnly = computed(() => this.icon() !== undefined && this.label() === undefined);
}
