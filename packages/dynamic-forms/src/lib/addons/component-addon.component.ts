import { NgComponentOutlet } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, inject, input, signal, Type } from '@angular/core';
import { explicitEffect } from 'ngxtension/explicit-effect';
import { ComponentAddon } from '../models/addon/addon-def';
import { DynamicFormLogger } from '../providers/features/logger/logger.token';
import { resolveDefaultExport } from '../utils/wrapper-chain/wrapper-chain';

/**
 * Renderer for the universal `component` addon kind.
 *
 * Loads the user-supplied component lazily (`addon.component()`) and renders
 * it via `NgComponentOutlet` with `addon.inputs` forwarded as input bindings.
 * The wrapper-style `fieldInputs` bag is not propagated — user components
 * receive only what `addon.inputs` declares. Authors that need field state
 * should switch to the `template` kind or build a wrapper.
 *
 * @codeOnly The `component` loader is a function; this kind is dropped in
 * lenient validation when the config originated from JSON.
 */
@Component({
  selector: 'df-component-addon',
  imports: [NgComponentOutlet],
  template: `
    @if (resolvedComponent(); as cmp) {
      <ng-container *ngComponentOutlet="cmp; inputs: inputs()" />
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ComponentAddonComponent {
  private readonly logger = inject(DynamicFormLogger);

  readonly addon = input.required<ComponentAddon>();

  protected readonly inputs = computed(() => (this.addon().inputs ?? {}) as Record<string, unknown>);

  private readonly resolvedComponentSignal = signal<Type<unknown> | undefined>(undefined);
  protected readonly resolvedComponent = this.resolvedComponentSignal.asReadonly();

  constructor() {
    // Re-resolve when the addon (and thus its loader) changes.
    explicitEffect([this.addon], ([addon]) => {
      Promise.resolve(addon.component())
        .then((mod) => this.resolvedComponentSignal.set(resolveDefaultExport(mod) ?? undefined))
        .catch((error: unknown) => {
          // Surface the failure with the addon's slot for triage — silent
          // failures here would leave users wondering why their component
          // didn't render. Mirrors the dispatcher's behaviour for kind loaders.
          this.logger.warn(`Failed to load component addon (slot: '${addon.slot}'): ${String(error)}`);
          this.resolvedComponentSignal.set(undefined);
        });
    });
  }
}
