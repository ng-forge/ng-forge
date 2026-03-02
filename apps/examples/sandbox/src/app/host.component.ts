import { ChangeDetectionStrategy, Component, ElementRef, signal, viewChild, afterNextRender, inject } from '@angular/core';
import { SandboxHarness, SandboxRef, isAdapterName, AdapterName } from '@ng-forge/sandbox-harness';

const DEFAULT_ADAPTER: AdapterName = 'material';
const DEFAULT_ROUTES: Record<AdapterName, string> = {
  material: 'examples',
  bootstrap: 'examples',
  primeng: 'examples',
  ionic: 'examples',
  core: 'test',
};

/**
 * Extracts the adapter name from the hash URL.
 * Hash format: `#/<adapter>/...`
 */
function getAdapterFromHash(): AdapterName | null {
  const hash = window.location.hash.replace(/^#\/?/, '');
  const segment = hash.split('/')[0];
  return segment && isAdapterName(segment) ? segment : null;
}

@Component({
  selector: 'sandbox-host',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="sandbox-host">
      <nav class="sandbox-nav">
        <h1>Sandbox Examples</h1>
        <button class="adapter-btn" [class.active]="activeAdapter() === 'material'" (click)="navigateTo('material')">Material</button>
        <button class="adapter-btn" [class.active]="activeAdapter() === 'bootstrap'" (click)="navigateTo('bootstrap')">Bootstrap</button>
        <button class="adapter-btn" [class.active]="activeAdapter() === 'primeng'" (click)="navigateTo('primeng')">PrimeNG</button>
        <button class="adapter-btn" [class.active]="activeAdapter() === 'ionic'" (click)="navigateTo('ionic')">Ionic</button>
        <button class="adapter-btn" [class.active]="activeAdapter() === 'core'" (click)="navigateTo('core')">Core</button>
      </nav>

      @if (loading()) {
        <div class="adapter-loading">Loading adapter...</div>
      }

      <div class="adapter-container" #adapterContainer></div>
    </div>
  `,
})
export class HostComponent {
  private readonly harness = inject(SandboxHarness);
  private readonly containerRef = viewChild.required<ElementRef<HTMLElement>>('adapterContainer');

  readonly activeAdapter = signal<AdapterName | null>(null);
  readonly loading = signal(false);

  private currentRef: SandboxRef | null = null;

  constructor() {
    afterNextRender(() => {
      const adapter = getAdapterFromHash() ?? DEFAULT_ADAPTER;
      if (!getAdapterFromHash()) {
        window.location.hash = `#/${DEFAULT_ADAPTER}/${DEFAULT_ROUTES[DEFAULT_ADAPTER]}`;
      }
      this.switchTo(adapter);

      window.addEventListener('hashchange', () => {
        const newAdapter = getAdapterFromHash();
        if (newAdapter && newAdapter !== this.activeAdapter()) {
          this.switchTo(newAdapter);
        }
      });

      this.setupHeightBroadcasting();
    });
  }

  navigateTo(adapter: AdapterName): void {
    if (this.activeAdapter() === adapter) return;
    window.location.hash = `#/${adapter}/${DEFAULT_ROUTES[adapter]}`;
  }

  private async switchTo(adapter: AdapterName): Promise<void> {
    this.loading.set(true);
    this.activeAdapter.set(adapter);

    this.currentRef?.destroy();
    this.currentRef = null;

    const container = this.containerRef().nativeElement;
    container.innerHTML = '';

    try {
      const hashUrl = window.location.hash.replace(/^#/, '') || '/';
      this.currentRef = await this.harness.bootstrap(adapter, container, { route: hashUrl });
    } finally {
      this.loading.set(false);
    }
  }

  private setupHeightBroadcasting(): void {
    if (window.self === window.top) return;

    let lastHeight = 0;
    const broadcastHeight = (): void => {
      const height = document.documentElement.scrollHeight;
      if (Math.abs(height - lastHeight) > 2) {
        lastHeight = height;
        window.parent.postMessage({ type: 'resize', height }, '*');
      }
    };

    const observer = new ResizeObserver(() => broadcastHeight());
    observer.observe(document.body);

    const mutationObserver = new MutationObserver(() => broadcastHeight());
    mutationObserver.observe(document.body, { childList: true, subtree: true });
  }
}
