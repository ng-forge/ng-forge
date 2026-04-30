import { NgComponentOutlet } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, input, signal, Type } from '@angular/core';
import { explicitEffect } from 'ngxtension/explicit-effect';
import { ComponentAddon } from '../models/addon/addon-def';
import { resolveDefaultExport } from '../utils/wrapper-chain/wrapper-chain';

/**
 * Renderer for the universal `component` addon kind.
 *
 * Loads the user-supplied component lazily (`addon.component()`) and renders
 * it via `NgComponentOutlet` with `addon.inputs` forwarded as input bindings.
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
  readonly addon = input.required<ComponentAddon>();

  protected readonly inputs = computed(() => (this.addon().inputs ?? {}) as Record<string, unknown>);

  private readonly resolvedComponentSignal = signal<Type<unknown> | undefined>(undefined);
  protected readonly resolvedComponent = this.resolvedComponentSignal.asReadonly();

  constructor() {
    // Re-resolve when the addon (and thus its loader) changes.
    explicitEffect([this.addon], ([addon]) => {
      Promise.resolve(addon.component())
        .then((mod) => this.resolvedComponentSignal.set(resolveDefaultExport(mod) ?? undefined))
        .catch(() => this.resolvedComponentSignal.set(undefined));
    });
  }
}
