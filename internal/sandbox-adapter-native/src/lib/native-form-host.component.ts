import { afterNextRender, ChangeDetectionStrategy, Component, computed, DestroyRef, ElementRef, inject, input } from '@angular/core';
import type { FormConfig } from '@ng-forge/dynamic-forms';
import { ADDON_TYPE_REGISTRY, FIELD_REGISTRY } from '@ng-forge/dynamic-forms/integration';
// Not exported from integration; this docs-only library reads it to name wrappers native lacks.
// eslint-disable-next-line no-restricted-imports
import { WRAPPER_REGISTRY } from '@ng-forge/dynamic-forms/internal';
import { NgNativeIsland } from '@ng-native/web';
import { NativeFormComponent } from './native-form.component';
import { unsupportedTypes } from './unsupported-types';

/** What @ng-native/web writes into `document.head`: component styles and its reset. */
const NATIVE_STYLE = 'style[data-ng-native-component], style#angular-native-web-island-reset';

/**
 * Hosts the native form in the sandbox's DOM app as an ng-native island, or says what the example
 * needs that the native fields do not have yet. The island writes its styles to `document.head`,
 * which a sandbox's shadow root does not see, so they are mirrored in.
 */
@Component({
  selector: 'sandbox-native-form-host',
  imports: [NgNativeIsland],
  template: `
    @if (unsupported().length) {
      <p class="unsupported" role="note">
        Not available on ng-native yet. This example uses
        @for (type of unsupported(); track type; let last = $last) {
          <code>{{ type }}</code
          >{{ last ? '.' : ', ' }}
        }
      </p>
    } @else {
      <ng-native-island [component]="form" [inputs]="{ config: config() }" />
    }
  `,
  styles: `
    .unsupported {
      margin: 0;
      padding: 16px;
      font:
        14px/1.5 system-ui,
        sans-serif;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
  // The fields' colors use light-dark(), which follows `color-scheme`: the docs' theme, not the OS.
  host: { '[style.color-scheme]': 'theme()', '[style.display]': '"block"' },
})
export class NativeFormHostComponent {
  readonly config = input.required<FormConfig>();
  readonly theme = input<'light' | 'dark'>('light');
  protected readonly form = NativeFormComponent;

  private readonly registries = {
    fields: inject(FIELD_REGISTRY),
    addons: inject(ADDON_TYPE_REGISTRY),
    wrappers: inject(WRAPPER_REGISTRY),
  };
  protected readonly unsupported = computed(() => unsupportedTypes(this.config(), this.registries));

  constructor() {
    const element = inject<ElementRef<HTMLElement>>(ElementRef).nativeElement;
    const destroyRef = inject(DestroyRef);
    afterNextRender(() => {
      const root = element.getRootNode();
      if (!(root instanceof ShadowRoot)) return;
      const mirror = () => {
        for (const style of document.head.querySelectorAll<HTMLStyleElement>(NATIVE_STYLE)) {
          const key = style.getAttribute('data-ng-native-component') ?? style.id;
          if (root.querySelector(`style[data-native-mirror="${key}"]`)) continue;
          const copy = style.cloneNode(true) as HTMLStyleElement;
          copy.setAttribute('data-native-mirror', key);
          root.appendChild(copy);
        }
      };
      mirror();
      const observer = new MutationObserver(mirror);
      observer.observe(document.head, { childList: true });
      destroyRef.onDestroy(() => observer.disconnect());
    });
  }
}
