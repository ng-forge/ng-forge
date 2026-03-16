import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'docs-cascade-visual',
  template: `
    <div class="cascade">
      <div class="cascade__step">
        <div class="cascade__pill cascade__pill--1">Library-level</div>
        <code class="cascade__code">withXxxFields({{ '{' }}...{{ '}' }})</code>
        <span class="cascade__scope">All forms</span>
      </div>
      <span class="cascade__arrow">
        <svg
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="1.5"
          stroke-linecap="round"
          stroke-linejoin="round"
        >
          <path d="M5 12h14M13 6l6 6-6 6" />
        </svg>
      </span>
      <div class="cascade__step">
        <div class="cascade__pill cascade__pill--2">Form-level</div>
        <code class="cascade__code">defaultProps</code>
        <span class="cascade__scope">One form</span>
      </div>
      <span class="cascade__arrow">
        <svg
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="1.5"
          stroke-linecap="round"
          stroke-linejoin="round"
        >
          <path d="M5 12h14M13 6l6 6-6 6" />
        </svg>
      </span>
      <div class="cascade__step">
        <div class="cascade__pill cascade__pill--3">Field-level</div>
        <code class="cascade__code">props</code>
        <span class="cascade__scope">One field</span>
      </div>
    </div>
  `,
  styles: `
    @use 'tokens' as *;
    @use 'themes' as *;

    :host {
      display: block;
    }

    .cascade {
      display: flex;
      align-items: flex-start;
      justify-content: center;
      gap: 1rem;
      padding: 1.5rem 1rem;
    }

    .cascade__step {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 0.5rem;
      flex: 1;
      max-width: 180px;
    }

    .cascade__pill {
      padding: 0.5rem 1.25rem;
      border-radius: 2rem;
      font-weight: 600;
      font-size: 0.875rem;
      white-space: nowrap;
      letter-spacing: -0.01em;
    }

    .cascade__pill--1 {
      background: rgba(255, 77, 0, 0.08);
      color: $ember-core;
      border: 1.5px solid rgba(255, 77, 0, 0.3);
    }

    .cascade__pill--2 {
      background: rgba(255, 107, 43, 0.1);
      color: $ember-hot;
      border: 1.5px solid rgba(255, 107, 43, 0.35);
    }

    .cascade__pill--3 {
      background: rgba(255, 140, 66, 0.12);
      color: $ember-glow;
      border: 1.5px solid rgba(255, 140, 66, 0.4);
    }

    .cascade__code {
      font-family: $font-mono;
      font-size: 0.75rem;
      color: var(--forge-text-muted, #{$steel-mid});
    }

    .cascade__scope {
      font-size: 0.6875rem;
      color: var(--forge-text-muted, #{$steel-mid});
      font-style: italic;
    }

    .cascade__arrow {
      display: flex;
      align-items: center;
      color: var(--forge-base-4, #{$steel-dim});
      margin-top: 0.5rem;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CascadeVisualComponent {}
