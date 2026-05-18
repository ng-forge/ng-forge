import { NgComponentOutlet } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, inject, input, signal, Type } from '@angular/core';
import { explicitEffect } from 'ngxtension/explicit-effect';
import { ComponentAddon } from '../models/addon/addon-def';
import { DynamicFormLogger } from '../providers/features/logger/logger.token';
import { resolveDefaultExport } from '../utils/wrapper-chain/wrapper-chain';
import { WrapperFieldInputs } from '../wrappers/wrapper-field-inputs';

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
  /** Accepted for contract uniformity — `NgComponentOutlet` setInput is strict; every kind must declare it. */
  readonly fieldInputs = input<WrapperFieldInputs | undefined>();

  protected readonly inputs = computed(() => (this.addon().inputs ?? {}) as Record<string, unknown>);

  private readonly resolvedComponentSignal = signal<Type<unknown> | undefined>(undefined);
  protected readonly resolvedComponent = this.resolvedComponentSignal.asReadonly();

  /** Monotonic load-token guards against stale promises winning when addon swaps mid-load. */
  private loadSeq = 0;

  constructor() {
    explicitEffect([this.addon], ([addon]) => {
      const seq = ++this.loadSeq;
      Promise.resolve(addon.component())
        .then((mod) => {
          if (seq !== this.loadSeq) return;
          this.resolvedComponentSignal.set(resolveDefaultExport(mod) ?? undefined);
        })
        .catch((error: unknown) => {
          if (seq !== this.loadSeq) return;
          this.logger.warn(`Failed to load component addon (slot: '${addon.slot}'): ${String(error)}`);
          this.resolvedComponentSignal.set(undefined);
        });
    });
  }
}
