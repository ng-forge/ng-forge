import {
  afterNextRender,
  ChangeDetectionStrategy,
  Component,
  computed,
  DestroyRef,
  ElementRef,
  inject,
  input,
  signal,
  viewChild,
} from '@angular/core';
import { loadRemoteModule } from '@angular-architects/native-federation';

type LibraryType = 'material' | 'primeng' | 'ionic' | 'bootstrap';

interface RemoteEntry {
  renderComponent: (container: HTMLElement, examplePath: string, inputs?: Record<string, unknown>) => Promise<() => void>;
}

@Component({
  selector: 'remote-example',
  template: `
    <div class="remote-example-container" [class]="containerClass()">
      @if (loading()) {
        <div class="remote-loading">
          <div class="spinner"></div>
          <p>Loading example...</p>
        </div>
      }
      @if (error()) {
        <div class="remote-error">
          <p>Failed to load example: {{ error() }}</p>
        </div>
      }
      <div #remoteContainer class="remote-content"></div>
    </div>
    @if (code()) {
      <details>
        <summary>Click to view config!</summary>
        <pre><code>{{ code() }}</code></pre>
      </details>
    }
  `,
  styles: [
    `
      :host {
        display: block;
        margin: 1.5rem 0;
      }

      .remote-example-container {
        position: relative;
        border: 1px solid var(--ng-doc-border-color, #e0e0e0);
        border-radius: 8px;
        overflow: hidden;
        background: var(--ng-doc-base-0, #ffffff);
        box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
        min-height: 200px;
      }

      .remote-content {
        min-height: 100px;
      }

      .remote-loading,
      .remote-error {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        padding: 2rem;
        text-align: center;
      }

      .remote-error {
        color: var(--ng-doc-danger, #f44336);
      }

      .spinner {
        width: 40px;
        height: 40px;
        border: 3px solid var(--ng-doc-border-color, #e0e0e0);
        border-top-color: var(--ng-doc-primary, #3f51b5);
        border-radius: 50%;
        animation: spin 0.8s linear infinite;
        margin-bottom: 1rem;
      }

      @keyframes spin {
        to {
          transform: rotate(360deg);
        }
      }

      .remote-loading p,
      .remote-error p {
        color: var(--ng-doc-text-muted, #757575);
        font-size: 0.875rem;
      }

      details {
        margin-top: 1rem;
        border: 1px solid var(--ng-doc-border-color, #e0e0e0);
        border-radius: 4px;
      }

      summary {
        cursor: pointer;
        font-weight: 500;
        padding: 0.75rem 1rem;
        background: var(--ng-doc-base-1, #f5f5f5);
        border-radius: 4px 4px 0 0;
        user-select: none;
        list-style: none;
      }

      summary::-webkit-details-marker {
        display: none;
      }

      summary::before {
        content: '▶';
        display: inline-block;
        margin-right: 0.5rem;
        transition: transform 0.2s;
      }

      details[open] summary::before {
        transform: rotate(90deg);
      }

      summary:hover {
        background: var(--ng-doc-base-2, #eeeeee);
      }

      details pre {
        margin: 0;
        padding: 1rem;
        background: #282c34;
        border-radius: 0 0 4px 4px;
        overflow-x: auto;
      }

      details code {
        color: #abb2bf;
        font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', 'Consolas', monospace;
        font-size: 0.875rem;
        line-height: 1.6;
        white-space: pre;
      }
    `,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class RemoteExampleComponent {
  library = input.required<LibraryType>();
  example = input.required<string>();
  code = input<string>();

  private readonly remoteContainer = viewChild<ElementRef<HTMLDivElement>>('remoteContainer');
  private readonly destroyRef = inject(DestroyRef);

  loading = signal(true);
  error = signal<string | null>(null);

  containerClass = computed(() => `remote-${this.library()}`);

  private readonly remoteNames: Record<LibraryType, string> = {
    material: 'material-examples',
    primeng: 'primeng-examples',
    ionic: 'ionic-examples',
    bootstrap: 'bootstrap-examples',
  };

  private cleanupFn: (() => void) | null = null;

  constructor() {
    // Use afterNextRender to ensure the view is ready and we're in the browser
    afterNextRender(() => {
      this.loadRemote();
    });
  }

  private async loadRemote(): Promise<void> {
    try {
      const remoteName = this.remoteNames[this.library()];

      const module = (await loadRemoteModule({
        remoteName,
        exposedModule: './routes',
      })) as RemoteEntry;

      // Get the container element
      const containerEl = this.remoteContainer()?.nativeElement;
      if (!containerEl) {
        this.error.set('Container element not found');
        return;
      }

      // Use the remote's renderComponent function
      // This ensures the component is created using the remote's Angular instance
      this.cleanupFn = await module.renderComponent(containerEl, this.example());

      // Register cleanup on destroy
      this.destroyRef.onDestroy(() => {
        if (this.cleanupFn) {
          this.cleanupFn();
          this.cleanupFn = null;
        }
      });
    } catch (err) {
      console.error('Failed to load remote module:', err);
      this.error.set(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      this.loading.set(false);
    }
  }
}
