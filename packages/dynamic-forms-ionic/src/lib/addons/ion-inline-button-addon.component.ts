import { AsyncPipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, inject, Injector, Signal, signal } from '@angular/core';
import { explicitEffect } from 'ngxtension/explicit-effect';
import { IonIcon, IonSpinner } from '@ionic/angular/standalone';
import { DynamicText } from '@ng-forge/dynamic-forms';
import { DynamicTextPipe, resolveDynamicValue } from '@ng-forge/dynamic-forms/integration';
import { injectNgForgeAddonAction, NgForgeAddonAction } from '@ng-forge/dynamic-forms/integration';
import type { IonButtonAddon } from '../types/addons';

/**
 * Inline `ion-button` addon — the host element IS `<ion-button>` so Ionic's
 * `::slotted(ion-button[slot=start|end])` shadow CSS matches and applies its
 * native icon-only sizing. `IonButtonAddonComponent` (tag selector) stays
 * for the universal `<df-addon-slot>` dispatcher when the addon is rendered
 * outside an `<ion-input>` host.
 */
@Component({
  selector: 'ion-button[df-ion-button-addon]',
  imports: [IonIcon, IonSpinner, DynamicTextPipe, AsyncPipe],
  hostDirectives: [NgForgeAddonAction],
  template: `
    @if (action.loading()) {
      <ion-spinner [slot]="iconOnly() ? 'icon-only' : 'start'" name="dots"></ion-spinner>
      <span class="df-ion-sr-only" role="status">Loading…</span>
    } @else if (icon(); as ic) {
      <ion-icon [name]="ic" [slot]="iconOnly() ? 'icon-only' : 'start'"></ion-icon>
    }
    @if (label(); as lbl) {
      {{ lbl | dynamicText | async }}
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
  host: {
    // Stencil reflects [attr.*] to the underlying ion-button properties.
    '[attr.color]': 'color() ?? null',
    '[attr.fill]': 'fill()',
    '[attr.disabled]': 'action.disabled() || action.loading() ? "true" : null',
    '[attr.aria-label]': 'resolvedAriaLabel() ?? null',
    '[attr.aria-busy]': 'action.loading() || null',
    '(click)': 'action.dispatch()',
  },
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class IonInlineButtonAddonComponent {
  private readonly injector = inject(Injector);
  protected readonly action = injectNgForgeAddonAction<IonButtonAddon>();

  protected readonly addon = this.action.addon;
  protected readonly label = computed(() => this.addon().label);
  protected readonly ariaLabel = computed(() => this.addon().ariaLabel);
  protected readonly icon = computed(() => this.addon().icon);
  protected readonly color = computed(() => this.addon().color);
  protected readonly fill = computed(() => this.addon().fill ?? 'clear');
  protected readonly iconOnly = computed(() => !!this.icon() && !this.label());

  // Host bindings can't use pipes (NG5001), so `DynamicText` is materialised
  // via an effect (resolveDynamicValue's toSignal can't run inside computed).
  private readonly _ariaLabelSignal = signal<Signal<string | undefined> | undefined>(undefined);
  protected readonly resolvedAriaLabel = computed(() => this._ariaLabelSignal()?.() ?? undefined);

  constructor() {
    explicitEffect([this.ariaLabel], ([raw]) => {
      if (raw === undefined) {
        this._ariaLabelSignal.set(undefined);
        return;
      }
      this._ariaLabelSignal.set(resolveDynamicValue<string | undefined>(raw as DynamicText, undefined, this.injector));
    });
  }
}
