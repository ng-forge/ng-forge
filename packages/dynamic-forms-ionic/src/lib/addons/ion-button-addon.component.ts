import { AsyncPipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed } from '@angular/core';
import { IonButton, IonIcon, IonSpinner } from '@ionic/angular/standalone';
import { DynamicTextPipe } from '@ng-forge/dynamic-forms/integration';
import { injectNgForgeAddonAction, NgForgeAddonAction } from '@ng-forge/dynamic-forms/integration';
import type { IonButtonAddon } from '../types/addons';

/** Renderer for the `ion-button` addon kind. */
@Component({
  selector: 'df-ion-button-addon',
  imports: [IonButton, IonIcon, IonSpinner, DynamicTextPipe, AsyncPipe],
  hostDirectives: [NgForgeAddonAction],
  template: `
    <ion-button
      [attr.color]="color() ?? null"
      [fill]="fill()"
      [disabled]="action.disabled() || action.loading()"
      [attr.aria-label]="(ariaLabel() | dynamicText | async) ?? null"
      [attr.aria-busy]="action.loading() || null"
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
    @if (action.loading()) {
      <span class="df-ion-sr-only" role="status">Loading…</span>
    }
  `,
  styles: [
    `
      .df-ion-sr-only {
        position: absolute;
        width: 1px;
        height: 1px;
        padding: 0;
        margin: -1px;
        overflow: hidden;
        clip: rect(0, 0, 0, 0);
        white-space: nowrap;
        border: 0;
      }
    `,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class IonButtonAddonComponent {
  protected readonly action = injectNgForgeAddonAction<IonButtonAddon>();

  /** Re-exposed for template binding — same signal stored on the directive. */
  protected readonly addon = this.action.addon;

  protected readonly label = computed(() => this.addon().label);
  protected readonly ariaLabel = computed(() => this.addon().ariaLabel);
  protected readonly icon = computed(() => this.addon().icon);
  /** Default color is undefined so the button inherits the theme's text color
   *  (Ionic's `medium` would force low-contrast grey, which fails WCAG on dark
   *  surfaces). Consumers can still set `color: 'primary' | 'success' | ...`
   *  explicitly when they want adapter-styled coloring. */
  protected readonly color = computed(() => this.addon().color);
  protected readonly fill = computed(() => this.addon().fill ?? 'clear');
  /** Icon-only when there is an icon but no label — drives the `slot` choice.
   *  Truthy check on `label` mirrors Material's heuristic; empty-string label
   *  is treated as "no label" so the button doesn't render an invisible text
   *  slot beside the icon. */
  protected readonly iconOnly = computed(() => !!this.icon() && !this.label());
}
