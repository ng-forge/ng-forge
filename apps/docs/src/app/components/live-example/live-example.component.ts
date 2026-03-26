import { booleanAttribute, ChangeDetectionStrategy, Component, computed, inject, input, PLATFORM_ID, viewChild } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { FormConfig } from '@ng-forge/dynamic-forms';
import { SandboxMountDirective } from '@ng-forge/sandbox-harness';
import { ActiveAdapterService } from '../../services/active-adapter.service';
import { EXAMPLE_CONFIGS } from '../../example-configs';
import { EXAMPLES_REGISTRY } from '../../pages/examples-index/examples.registry';
import { createStackBlitzProject } from './stackblitz-project';

@Component({
  selector: 'docs-live-example',
  template: `
    @if (!shouldHide()) {
      <div class="live-example-wrapper">
        <div class="overlay-actions">
          @if (resolvedConfig()) {
            <button class="stackblitz-btn" type="button" title="Edit in StackBlitz" (click)="openInStackBlitz()">
              <svg class="stackblitz-icon" viewBox="0 0 28 28" aria-hidden="true">
                <polygon points="12.5,2 3,18 12,18 10,26 25,11 15,11 19,2" />
              </svg>
              StackBlitz
            </button>
          }
          <span class="adapter-badge">
            <img [src]="adapterInfo().icon" [alt]="adapterInfo().label" class="adapter-badge-icon" />
            {{ adapterInfo().label }}
          </span>
        </div>
        @if (!isLoaded()) {
          <div class="live-example-skeleton" role="status" aria-busy="true">
            <div class="skeleton-form">
              <div class="skeleton-field">
                <div class="skeleton-label"></div>
                <div class="skeleton-input"></div>
              </div>
              <div class="skeleton-field">
                <div class="skeleton-label"></div>
                <div class="skeleton-input"></div>
              </div>
              <div class="skeleton-field">
                <div class="skeleton-label short"></div>
                <div class="skeleton-input tall"></div>
              </div>
              <div class="skeleton-button"></div>
            </div>
            <span class="visually-hidden">Loading live example</span>
          </div>
        }
        <div
          class="live-example-container"
          [class.mounting]="!isLoaded()"
          sandboxMount
          #mount="sandboxMount"
          [adapter]="resolvedAdapter()"
          [route]="resolvedRoute()"
          [config]="resolvedConfig()"
          locationStrategy="memory"
          styleIsolation="scoped"
        ></div>
      </div>
    }
  `,
  styleUrl: './live-example.component.scss',
  imports: [SandboxMountDirective],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LiveExampleComponent {
  readonly scenario = input.required<string>();
  readonly hideForCustom = input(false, { transform: booleanAttribute });
  protected readonly activeAdapter = inject(ActiveAdapterService);
  private readonly isBrowser = isPlatformBrowser(inject(PLATFORM_ID));

  private readonly mountDirective = viewChild<SandboxMountDirective>('mount');

  protected readonly isLoaded = computed(() => {
    const mount = this.mountDirective();
    if (!mount) return false;
    try {
      const status = mount.mount.status();
      return status === 'resolved' || status === 'local';
    } catch {
      // NG0950: required input not yet available — still loading
      return false;
    }
  });

  protected readonly shouldHide = computed(() => this.hideForCustom() && this.activeAdapter.adapter() === 'custom');

  protected readonly resolvedAdapter = computed(() => {
    const adapter = this.activeAdapter.adapter();
    return adapter === 'custom' ? 'material' : adapter;
  });

  private readonly scenarioKey = computed(() => {
    const raw = this.scenario();
    return raw.startsWith('examples/') ? raw.slice('examples/'.length) : raw;
  });

  private readonly scenarioConfig = computed((): FormConfig | undefined => EXAMPLE_CONFIGS[this.scenarioKey()]);

  protected readonly resolvedConfig = computed(() => this.scenarioConfig());

  protected readonly resolvedRoute = computed(() => (this.scenarioConfig() ? '/examples/demo' : '/' + this.scenario()));

  /** Resolve scenario key to a human-readable title from the examples registry. */
  protected readonly exampleTitle = computed(() => {
    const key = this.scenarioKey();
    return EXAMPLES_REGISTRY.find((e) => e.id === key)?.title ?? '';
  });

  protected readonly adapterInfo = computed(
    () => this.activeAdapter.adapters.find((a) => a.name === this.resolvedAdapter()) ?? this.activeAdapter.adapters[0],
  );

  /** Serialized config as JS object notation for StackBlitz */
  private readonly configJson = computed(() => {
    const config = this.resolvedConfig();
    return config ? this.toJsObjectNotation(config, 0) : '';
  });

  openInStackBlitz(): void {
    if (!this.isBrowser) return;
    const config = this.resolvedConfig();
    if (!config) return;

    const title = this.exampleTitle() || this.scenarioKey();
    const project = createStackBlitzProject(this.resolvedAdapter(), this.configJson(), title);

    import('@stackblitz/sdk').then((sdk) => sdk.default.openProject(project, { openFile: 'src/app/app.component.ts' }));
  }

  private toJsObjectNotation(value: unknown, indent: number): string {
    const spaces = '  '.repeat(indent);
    const nextSpaces = '  '.repeat(indent + 1);

    if (value === null) return 'null';
    if (value === undefined) return 'undefined';
    if (typeof value === 'string') return `'${value.replace(/'/g, "\\'")}'`;
    if (typeof value === 'number' || typeof value === 'boolean') return String(value);
    if (value instanceof RegExp) return value.toString();

    if (Array.isArray(value)) {
      if (value.length === 0) return '[]';
      const items = value.map((item) => `${nextSpaces}${this.toJsObjectNotation(item, indent + 1)}`);
      return `[\n${items.join(',\n')}\n${spaces}]`;
    }

    if (typeof value === 'object') {
      const entries = Object.entries(value as Record<string, unknown>);
      if (entries.length === 0) return '{}';
      const props = entries.map(([key, val]) => {
        const formattedValue = this.toJsObjectNotation(val, indent + 1);
        return `${nextSpaces}${key}: ${formattedValue}`;
      });
      return `{\n${props.join(',\n')}\n${spaces}}`;
    }

    return String(value);
  }
}
