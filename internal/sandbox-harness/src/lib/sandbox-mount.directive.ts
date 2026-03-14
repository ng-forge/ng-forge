import { Directive, ElementRef, inject, Injector, input, resource, runInInjectionContext } from '@angular/core';
import { FormConfig } from '@ng-forge/dynamic-forms';
import { SandboxHarness } from './sandbox-harness.service';
import { SandboxSlot } from './sandbox-slot';
import { AdapterName, SandboxBootstrapOptions, SandboxRef } from './types';

/**
 * Declarative sandbox mount directive — place on any element to embed a sandbox sub-app.
 *
 * ```html
 * <div sandboxMount [adapter]="activeAdapter" [route]="'/examples/input'" />
 * ```
 *
 * Uses Angular's `resource()` for:
 * - **Latest-wins cancellation**: when `adapter` or `route` changes, the previous load is
 *   aborted via `AbortSignal` before the new one begins.
 * - **Status tracking**: `mount.status()` exposes `'idle' | 'loading' | 'resolved' | 'error'`.
 * - **Native AbortSignal**: propagates to `fetch()` inside the harness for CSS loading.
 *
 * The slot is created lazily on first load so that the `locationStrategy` and `styleIsolation`
 * input values are already bound when the slot is constructed (Angular sets inputs before
 * triggering reactive effects, but after field initializers).
 */
@Directive({
  selector: '[sandboxMount]',
  exportAs: 'sandboxMount',
})
export class SandboxMountDirective {
  readonly adapter = input.required<AdapterName>();
  readonly route = input<string>('/');
  readonly locationStrategy = input<SandboxBootstrapOptions['locationStrategy']>('memory');
  readonly styleIsolation = input<SandboxBootstrapOptions['styleIsolation']>(undefined);
  /**
   * Optional FormConfig injected via SANDBOX_FORM_CONFIG in the sub-app.
   * Captured once when the slot is first created — later changes have no effect.
   */
  readonly config = input<FormConfig>();

  private readonly harness = inject(SandboxHarness);
  private readonly elementRef = inject<ElementRef<HTMLElement>>(ElementRef);
  private readonly injector = inject(Injector);

  // Created lazily on first loader invocation so that input values (locationStrategy,
  // styleIsolation, config) are already set by Angular before the slot options are captured.
  // These options are structural (affect sub-app creation) and cannot change after the slot
  // is constructed — later input changes are intentionally ignored.
  private slot: SandboxSlot | undefined;

  private getSlot(): SandboxSlot {
    if (!this.slot) {
      // runInInjectionContext is required because SandboxSlot's constructor calls
      // inject(DestroyRef) to auto-destroy cached apps when this directive is destroyed.
      this.slot = runInInjectionContext(this.injector, () =>
        this.harness.createSlot(this.elementRef.nativeElement, {
          locationStrategy: this.locationStrategy(),
          styleIsolation: this.styleIsolation(),
          config: this.config(),
        }),
      );
    }
    return this.slot;
  }

  /**
   * Resource wrapping the active mount operation. Cancels in-flight loads on param change.
   *
   * Note: resource() is currently experimental (Angular 19+) but provides native AbortSignal
   * integration and status tracking not yet available in stable APIs.
   */
  readonly mount = resource<SandboxRef, { adapter: AdapterName; route: string }>({
    params: () => ({ adapter: this.adapter(), route: this.route() }),
    loader: ({ params, abortSignal }) => this.getSlot().mount(params.adapter, params.route, abortSignal),
  });
}
