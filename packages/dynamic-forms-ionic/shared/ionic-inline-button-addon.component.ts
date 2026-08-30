import { AsyncPipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, inject, Injector, type Signal, signal } from '@angular/core';
import { IonIcon, IonSpinner } from '@ionic/angular/standalone';
import type { DynamicText } from '@ng-forge/dynamic-forms';
import { DynamicTextPipe, injectNgForgeAddonAction, NgForgeAddonAction, resolveDynamicValue } from '@ng-forge/dynamic-forms/integration';
import { explicitEffect } from 'ngxtension/explicit-effect';
import type { IonicButtonAddon } from './addons';

/**
 * Inline `ion-button` addon whose host is the slotted Ionic button itself.
 * It lives in the shared entry because the lazily loaded input component
 * consumes it while the primary package must not pull in field renderers.
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
    '[attr.color]': 'color() ?? null',
    '[attr.fill]': 'fill()',
    '[attr.disabled]': 'action.disabled() || action.loading() ? "true" : null',
    '[attr.aria-label]': 'resolvedAriaLabel() ?? null',
    '[attr.aria-busy]': 'action.loading() || null',
    '(click)': 'action.dispatch()',
  },
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class IonicInlineButtonAddonComponent {
  private readonly injector = inject(Injector);
  protected readonly action = injectNgForgeAddonAction<IonicButtonAddon>();

  protected readonly addon = this.action.addon;
  protected readonly label = computed(() => this.addon().label);
  protected readonly ariaLabel = computed(() => this.addon().ariaLabel);
  protected readonly icon = computed(() => this.addon().icon);
  protected readonly color = computed(() => this.addon().color);
  protected readonly fill = computed(() => this.addon().fill ?? 'clear');
  protected readonly iconOnly = computed(() => !!this.icon() && !this.label());

  private readonly ariaLabelSignal = signal<Signal<string | undefined> | undefined>(undefined);
  protected readonly resolvedAriaLabel = computed(() => this.ariaLabelSignal()?.() ?? undefined);

  constructor() {
    explicitEffect([this.ariaLabel], ([raw]) => {
      if (raw === undefined) {
        this.ariaLabelSignal.set(undefined);
        return;
      }
      this.ariaLabelSignal.set(resolveDynamicValue<string | undefined>(raw as DynamicText, undefined, this.injector));
    });
  }
}
