import { AsyncPipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, inject, Injector, Signal, signal } from '@angular/core';
import { explicitEffect } from 'ngxtension/explicit-effect';
import { IonIcon, IonSpinner } from '@ionic/angular/standalone';
import { DynamicText, DynamicTextPipe, resolveDynamicValue } from '@ng-forge/dynamic-forms';
import { injectNgForgeAddonAction, NgForgeAddonAction } from '@ng-forge/dynamic-forms/integration';
import type { IonButtonAddon } from '../types/addons';

/**
 * Inline renderer for `ion-button` addons projected through `<ion-input>`'s
 * shadow-DOM `start` / `end` slots.
 *
 * Critical difference from `IonButtonAddonComponent`: the selector is an
 * attribute on `<ion-button>` itself, so the rendered DOM element IS
 * `<ion-button>` (not a wrapper that contains one). Ionic's shadow CSS
 * ships specific `::slotted(ion-button[slot=start|end])` rules that
 * size + style icon-only buttons natively (40×40, circular, themed
 * colors). Those rules only fire when the slotted element matches
 * `ion-button` directly — wrapping the button in `<df-addon-slot>` or
 * `<df-ion-button-addon>` breaks the `::slotted` match and the button
 * ends up untargeted by Ionic's layout, hence the previous "render
 * outside the input" workaround.
 *
 * `IonButtonAddonComponent` is still used by `<df-addon-slot>` (the
 * universal dispatcher) for cases where the addon is rendered outside
 * an `<ion-input>` host — its tag-based selector keeps it compatible
 * with `NgComponentOutlet`.
 */
@Component({
  selector: 'ion-button[df-ion-button-addon]',
  imports: [IonIcon, IonSpinner, DynamicTextPipe, AsyncPipe],
  hostDirectives: [NgForgeAddonAction],
  template: `
    @if (action.loading()) {
      <ion-spinner [slot]="iconOnly() ? 'icon-only' : 'start'" name="dots"></ion-spinner>
    } @else if (icon(); as ic) {
      <ion-icon [name]="ic" [slot]="iconOnly() ? 'icon-only' : 'start'"></ion-icon>
    }
    @if (label(); as lbl) {
      {{ lbl | dynamicText | async }}
    }
  `,
  host: {
    // ion-button is a Stencil web component; host bindings don't know about
    // its Angular input wrappers. Use `[attr.*]` for color/fill/disabled —
    // Stencil reflects these attributes to the underlying property.
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

  /**
   * Pre-resolved aria-label as a signal — host bindings can't use template
   * pipes (NG5001), so the `DynamicText` (string | Signal | Observable | i18n
   * key) is materialised via `resolveDynamicValue` driven from an
   * `explicitEffect`. `resolveDynamicValue` calls `toSignal` for Observable
   * inputs, which would throw NG0602 if invoked inside `computed`; the
   * effect-driven indirection runs it outside any reactive context.
   */
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
