import { ChangeDetectionStrategy, Component, inject, input, signal } from '@angular/core';
import { Clipboard } from '@angular/cdk/clipboard';

@Component({
  selector: 'docs-copy-button',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: 'code-copy-btn',
    '[class.copied]': 'copied()',
    '(click)': 'copy()',
    '(mouseleave)': 'copied.set(false)',
  },
  template: `
    <svg
      viewBox="0 0 24 24"
      width="16"
      height="16"
      fill="none"
      stroke="currentColor"
      stroke-width="2"
      stroke-linecap="round"
      stroke-linejoin="round"
    >
      <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
      <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
    </svg>
  `,
  styles: `
    :host {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 32px;
      height: 32px;
      border-radius: 6px;
      border: none;
      background: transparent;
      color: var(--forge-text-muted);
      cursor: pointer;
      opacity: 0;
      transition:
        opacity 0.15s ease,
        color 0.15s ease;
      position: absolute;
      top: 8px;
      right: 8px;
      z-index: 1;
    }
    :host(:hover) {
      color: var(--forge-text);
    }
    :host(.copied) {
      opacity: 1;
      color: #ff8c42;
    }
    :host(.copied)::after {
      content: 'Copied!';
      position: absolute;
      bottom: calc(100% + 6px);
      right: 0;
      font-size: 11px;
      font-weight: 600;
      color: #fff;
      background: #ff4d00;
      padding: 4px 10px;
      border-radius: 6px;
      white-space: nowrap;
      pointer-events: none;
      animation: copy-toast-in 0.15s ease;
    }
    @keyframes copy-toast-in {
      from {
        opacity: 0;
        transform: translateY(4px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }
  `,
})
export class CopyButtonComponent {
  readonly code = input.required<string>();
  protected readonly copied = signal(false);
  private readonly clipboard = inject(Clipboard);

  copy(): void {
    this.clipboard.copy(this.code());
    this.copied.set(true);
    setTimeout(() => this.copied.set(false), 2000);
  }
}
