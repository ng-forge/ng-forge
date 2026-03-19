import { InjectionToken } from '@angular/core';
import { OverlayContainer } from '@angular/cdk/overlay';

/**
 * Mutable reference to the shadow root, set after `createComponent()` attaches the shadow DOM.
 * Before that point, `current` is `null` and the overlay container falls back to `document.body`.
 */
export type ShadowRootRef = { current: ShadowRoot | null };

/**
 * Injection token for the mutable shadow root reference.
 * Provided by `SandboxHarness.bootstrap()` in scoped mode so that the
 * `ShadowDomOverlayContainer` can lazily resolve the shadow root.
 */
export const SHADOW_ROOT_REF = new InjectionToken<ShadowRootRef>('SHADOW_ROOT_REF');

/**
 * Custom CDK `OverlayContainer` that appends the overlay container element
 * to a shadow root instead of `document.body`.
 *
 * This is necessary because CDK-based overlays (datepicker, select, menu, etc.)
 * render inside `.cdk-overlay-container` which is normally at `document.body`.
 * When the form is rendered inside a shadow root, those overlays would be outside
 * the shadow boundary and miss all the adapter styles.
 *
 * The shadow root reference is provided via `SHADOW_ROOT_REF` and is `null` during
 * `createApplication()`. By the time an overlay is first opened (user interaction),
 * `createComponent()` has already run and the reference is populated.
 */
export class ShadowDomOverlayContainer extends OverlayContainer {
  private _shadowRootRef: ShadowRootRef = { current: null };

  /** Called by the factory provider to set the shadow root reference. */
  setShadowRootRef(ref: ShadowRootRef): void {
    this._shadowRootRef = ref;
  }

  protected override _createContainer(): void {
    const containerClass = 'cdk-overlay-container';
    const container = this._document.createElement('div');
    container.classList.add(containerClass);

    const target = this._shadowRootRef.current;
    if (target) {
      target.appendChild(container);
    } else {
      // Fallback — should not happen in practice since overlays are opened by user
      // interaction, well after createComponent() sets the shadow root reference.
      this._document.body.appendChild(container);
    }

    this._containerElement = container;
  }
}
