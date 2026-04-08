import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  Injectable,
  input,
  linkedSignal,
  PLATFORM_ID,
  resource,
  signal,
} from '@angular/core';
import { isPlatformBrowser, JsonPipe } from '@angular/common';
import { Clipboard } from '@angular/cdk/clipboard';
import { DomSanitizer } from '@angular/platform-browser';
import { DynamicForm } from '@ng-forge/dynamic-forms';
import { SANDBOX_THEME } from '@ng-forge/sandbox-harness';
import type { HighlighterCore } from 'shiki/core';
import { ExampleScenario } from './types';
import { injectQueryParams } from 'ngxtension/inject-query-params';
import { injectRouteData } from 'ngxtension/inject-route-data';

/** Lazy-loaded Shiki highlighter scoped to DI (SSR-safe — no module-level mutable state). */
@Injectable({ providedIn: 'root' })
class ExampleShikiService {
  private hlPromise: Promise<HighlighterCore> | null = null;

  getHighlighter(): Promise<HighlighterCore> {
    if (!this.hlPromise) {
      this.hlPromise = (async () => {
        const { createHighlighterCore } = await import('shiki/core');
        const { createOnigurumaEngine } = await import('shiki/engine/oniguruma');
        return createHighlighterCore({
          engine: createOnigurumaEngine(import('shiki/wasm')),
          themes: [import('shiki/dist/themes/material-theme-lighter.mjs'), import('shiki/dist/themes/material-theme-darker.mjs')],
          langs: [import('shiki/dist/langs/javascript.mjs')],
        });
      })();
    }
    return this.hlPromise;
  }
}

/**
 * Generic component for rendering a single example scenario.
 * Uses Forge design language with dark/light theme support.
 *
 * Reads scenario data from route data or accepts it as an input.
 * Supports `?minimal=true` query parameter to show only the form (landing page).
 * When embedded in a sandbox (docs live-example), the SANDBOX_THEME token is provided
 * by the harness so theme changes propagate automatically without DOM observation.
 */
@Component({
  selector: 'example-scenario',
  imports: [DynamicForm, JsonPipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './example-scenario.component.html',
  styleUrl: './example-scenario.component.scss',
  host: {
    class: 'example-container',
    '[class.in-iframe]': 'isInSandbox',
    '[attr.data-theme]': 'currentTheme()',
  },
})
export class ExampleScenarioComponent {
  private readonly clipboard = inject(Clipboard);
  private readonly sanitizer = inject(DomSanitizer);
  private readonly shiki = inject(ExampleShikiService);
  private readonly platformId = inject(PLATFORM_ID);
  private readonly isBrowser = isPlatformBrowser(this.platformId);

  /**
   * Injected by SandboxHarness when this component runs inside an embedded sandbox.
   * Null in standalone mode (new tab, SSR, unit tests).
   */
  private readonly sandboxTheme = inject(SANDBOX_THEME, { optional: true });

  /** True when running inside a docs sandbox embed. */
  readonly isInSandbox = this.sandboxTheme !== null;

  /** Scenario passed directly as input (for embedding in other components) */
  // eslint-disable-next-line @angular-eslint/no-input-rename
  scenarioInput = input<ExampleScenario | undefined>(undefined, { alias: 'scenario' });

  /** Scenario loaded from route data */
  private readonly routeScenario = injectRouteData<ExampleScenario | undefined>('scenario');

  /** Full minimal mode - hide all chrome, show only form (used by landing page) */
  private readonly minimalParam = injectQueryParams('minimal');
  minimal = computed(() => this.minimalParam() === 'true');

  /** Theme from query params (used for standalone / landing page embeds) */
  private readonly themeParam = injectQueryParams('theme');

  /** Hide "Form Data" output when embedded in sandbox or in minimal mode */
  hideFormOutput = computed(() => this.minimal() || this.isInSandbox);

  /** Active tab */
  activeTab = signal<'demo' | 'code'>('demo');

  /**
   * Resolved theme:
   * - In sandbox: driven directly by the harness-provided SANDBOX_THEME signal
   * - Standalone with ?theme=landing: forced dark (for landing page embeds)
   * - Standalone otherwise: falls back to ?theme query param or prefers-color-scheme
   */
  currentTheme = computed((): 'light' | 'dark' => {
    if (this.sandboxTheme !== null) return this.sandboxTheme();
    const queryParam = this.themeParam();
    if (queryParam === 'landing') return 'dark';
    return this.resolveTheme(queryParam ?? 'auto');
  });

  /** Copy feedback state */
  copied = signal(false);

  /** Resolved scenario - prefers input over route data */
  scenario = computed(() => {
    const fromInput = this.scenarioInput();
    const fromRoute = this.routeScenario();
    const resolved = fromInput ?? fromRoute;

    if (!resolved) {
      throw new Error('ExampleScenarioComponent requires a scenario via input or route data');
    }

    return resolved;
  });

  /** Config as JS-style object notation (no quotes around property keys) */
  configJson = computed(() => this.toJsObjectNotation(this.scenario().config, 0));

  /** Convert object to JavaScript-style notation without quoted property keys */
  private toJsObjectNotation(value: unknown, indent: number): string {
    const spaces = '  '.repeat(indent);
    const nextSpaces = '  '.repeat(indent + 1);

    if (value === null) return 'null';
    if (value === undefined) return 'undefined';
    if (typeof value === 'function') return 'Function';
    if (typeof value === 'string') return `'${value.replace(/'/g, "\\'")}'`;
    if (typeof value === 'number' || typeof value === 'boolean') return String(value);
    if (value instanceof RegExp) return value.toString();

    if (Array.isArray(value)) {
      if (value.length === 0) return '[]';
      const items = value.map((item) => `${nextSpaces}${this.toJsObjectNotation(item, indent + 1)}`);
      return `[\n${items.join(',\n')}\n${spaces}]`;
    }

    if (typeof value === 'object') {
      // StandardSchemaMarker (wraps Zod/Valibot/ArkType schemas)
      if ('ɵkind' in value && (value as Record<string, unknown>)['ɵkind'] === 'standardSchema') {
        const source = (value as Record<string, unknown>)['__source'];
        return typeof source === 'string' ? `standardSchema(${source})` : 'standardSchema(/* schema */)';
      }

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

  /** Syntax-highlighted config HTML using Shiki */
  private readonly highlightResource = resource({
    params: () => (this.isBrowser ? { code: this.configJson(), theme: this.currentTheme() } : undefined),
    loader: async ({ params }) => {
      if (!params.code) return '';
      const highlighter = await this.shiki.getHighlighter();
      const shikiTheme = params.theme === 'dark' ? 'material-theme-darker' : 'material-theme-lighter';
      return highlighter.codeToHtml(params.code, { lang: 'javascript', theme: shikiTheme });
    },
  });

  highlightedConfig = computed(() => {
    const html = this.highlightResource.value() ?? '';
    return this.sanitizer.bypassSecurityTrustHtml(html);
  });

  formValue = linkedSignal<Record<string, unknown>>(() => this.scenario().initialValue ?? {});

  /** Resolve theme from source to light/dark (standalone mode only) */
  private resolveTheme(theme: string | null | undefined): 'light' | 'dark' {
    if (!this.isBrowser) return 'light';
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;

    if (theme === 'auto' || theme === undefined) {
      return prefersDark ? 'dark' : 'light';
    } else if (theme === 'dark' || theme === 'landing') {
      return 'dark';
    }
    return 'light';
  }

  copyConfig(): void {
    this.clipboard.copy(this.configJson());
    this.copied.set(true);
    setTimeout(() => this.copied.set(false), 2000);
  }

  openFullscreen(): void {
    // Handle hash routing - the route is in the hash, not pathname
    const hash = window.location.hash.split('?')[0]; // Remove existing query params from hash
    const url = `${window.location.origin}${window.location.pathname}${hash}?minimal=true`;
    window.open(url, '_blank');
  }
}
