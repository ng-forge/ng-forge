import { ChangeDetectionStrategy, Component, ElementRef, signal, viewChild, afterNextRender } from '@angular/core';
import { AdapterManagerService } from './adapter-manager.service';
import { AdapterName, isAdapterName } from './adapters/adapter-config';

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
  selector: 'unified-host',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="unified-host">
      <nav class="unified-nav">
        <h1>Unified Examples</h1>
        <button class="adapter-btn" [class.active]="activeAdapter() === 'material'" (click)="navigateTo('material')">Material</button>
        <button class="adapter-btn" [class.active]="activeAdapter() === 'bootstrap'" (click)="navigateTo('bootstrap')">Bootstrap</button>
        <button class="adapter-btn" [class.active]="activeAdapter() === 'primeng'" (click)="navigateTo('primeng')">PrimeNG</button>
        <button class="adapter-btn" [class.active]="activeAdapter() === 'ionic'" (click)="navigateTo('ionic')">Ionic</button>
      </nav>

      @if (loading()) {
        <div class="adapter-loading">Loading adapter...</div>
      }

      <div class="adapter-container" #adapterContainer></div>
    </div>
  `,
})
export class HostComponent {
  private readonly adapterManager = new AdapterManagerService();
  private readonly containerRef = viewChild.required<ElementRef<HTMLElement>>('adapterContainer');

  readonly activeAdapter = signal<AdapterName | null>(null);
  readonly loading = signal(false);

  constructor() {
    afterNextRender(() => {
      // On initial load, read adapter from hash or default to material
      const adapter = getAdapterFromHash() ?? 'material';
      if (!getAdapterFromHash()) {
        window.location.hash = '#/material/examples';
      }
      this.switchTo(adapter);

      // Listen for hash changes to detect adapter switches
      window.addEventListener('hashchange', () => {
        const newAdapter = getAdapterFromHash();
        if (newAdapter && newAdapter !== this.adapterManager.activeAdapterName) {
          this.switchTo(newAdapter);
        }
      });

      // Iframe height broadcasting
      this.setupHeightBroadcasting();
    });
  }

  navigateTo(adapter: AdapterName): void {
    if (this.activeAdapter() === adapter) return;
    window.location.hash = `#/${adapter}/examples`;
  }

  private async switchTo(adapter: AdapterName): Promise<void> {
    this.loading.set(true);
    this.activeAdapter.set(adapter);

    const container = this.containerRef().nativeElement;
    container.innerHTML = '';

    try {
      await this.adapterManager.switchTo(adapter, container);
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
