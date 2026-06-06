import { NgComponentOutlet } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, inject, input, signal, Type } from '@angular/core';
import { explicitEffect } from 'ngxtension/explicit-effect';
import type { ComponentAddon } from '@ng-forge/dynamic-forms/internal';
import { DynamicFormLogger } from '@ng-forge/dynamic-forms/internal';
import { resolveDefaultExport } from '../utils/wrapper-chain/wrapper-chain';
import type { WrapperFieldInputs } from '@ng-forge/dynamic-forms/internal';

/**
 * Renderer for the universal `component` addon type.
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
  /** Accepted for contract uniformity — `NgComponentOutlet` setInput is strict; every kind must declare it. */
  readonly fieldInputs = input<WrapperFieldInputs | undefined>();

  protected readonly inputs = computed(() => (this.addon().inputs ?? {}) as Record<string, unknown>);

  /**
   * Latest async-loaded `{ addon, component }` pair. Tagging the result with
   * its source addon lets `resolvedComponent` filter stale loads structurally
   * — same kind-tagging pattern `DfAddonSlot` uses. When `addon` swaps
   * mid-load, the prior loader still completes and writes here, but the
   * computed ignores it because the recorded addon no longer matches the
   * current one.
   */
  private readonly asyncLoaded = signal<{ addon: ComponentAddon; component: Type<unknown> } | undefined>(undefined);

  protected readonly resolvedComponent = computed<Type<unknown> | undefined>(() => {
    const current = this.addon();
    const loaded = this.asyncLoaded();
    return loaded?.addon === current ? loaded.component : undefined;
  });

  constructor() {
    explicitEffect([this.addon], ([addon]) => {
      Promise.resolve(addon.component())
        .then((mod) => {
          const component = resolveDefaultExport(mod);
          if (component) this.asyncLoaded.set({ addon, component });
        })
        .catch((error: unknown) => {
          this.logger.warn(
            `Failed to load component addon (slot: '${addon.slot}'): ${error instanceof Error ? error.message : String(error)}`,
          );
        });
    });
  }
}
