import { ChangeDetectionStrategy, Component } from '@angular/core';

/**
 * Three-pillar visual breakdown of ng-forge's `customFnConfig` validator
 * surface — sync, HTTP, and Angular resource-API. Replaces dense prose in
 * the migration guide's Validators section.
 */
@Component({
  selector: 'docs-validator-pillars',
  template: `
    <div class="vp">
      <div class="vp__pillar">
        <div class="vp__chip vp__chip--sync">Sync</div>
        <code class="vp__code">customFnConfig.validators</code>
        <p class="vp__desc">Local checks: regex, range, custom predicates.</p>
        <code class="vp__sig">(ctx) => &#123; kind &#125; | null</code>
      </div>
      <div class="vp__pillar">
        <div class="vp__chip vp__chip--http">HTTP</div>
        <code class="vp__code">customFnConfig.httpValidators</code>
        <p class="vp__desc">"Ping the server with this value" — uniqueness, availability, address lookup.</p>
        <code class="vp__sig">&#123; request, onSuccess &#125;</code>
      </div>
      <div class="vp__pillar">
        <div class="vp__chip vp__chip--async">Async (resource)</div>
        <code class="vp__code">customFnConfig.asyncValidators</code>
        <p class="vp__desc">Arbitrary Angular <code>resource()</code>-API workflows beyond plain HTTP.</p>
        <code class="vp__sig">&#123; params, factory, onSuccess &#125;</code>
      </div>
    </div>
  `,
  styles: `
    @use 'tokens' as *;

    :host {
      display: block;
      margin: $space-6 0;
    }

    .vp {
      display: grid;
      grid-template-columns: repeat(3, minmax(0, 1fr));
      gap: $space-4;
    }

    .vp__pillar {
      display: flex;
      flex-direction: column;
      align-items: flex-start;
      gap: $space-2;
      padding: $space-4;
      border: 1px solid var(--forge-border-color, #2a2824);
      border-radius: $radius-md;
      background: var(--forge-base-1, #131210);
      min-width: 0;
    }

    .vp__chip {
      padding: $space-1 $space-3;
      border-radius: 999px;
      font-weight: 600;
      font-size: $text-xs;
      letter-spacing: 0.02em;
      white-space: nowrap;
    }

    .vp__chip--sync {
      background: rgba(255, 77, 0, 0.08);
      color: $ember-core;
      border: 1.5px solid rgba(255, 77, 0, 0.3);
    }

    .vp__chip--http {
      background: rgba(255, 107, 43, 0.1);
      color: $ember-hot;
      border: 1.5px solid rgba(255, 107, 43, 0.35);
    }

    .vp__chip--async {
      background: rgba(255, 140, 66, 0.12);
      color: $ember-glow;
      border: 1.5px solid rgba(255, 140, 66, 0.4);
    }

    .vp__code {
      font-family: $font-mono;
      font-size: $text-sm;
      color: var(--forge-text, #e8e4de);
      background: var(--forge-base-0, #0a0908);
      padding: 2px 6px;
      border-radius: $radius-sm;
      max-width: 100%;
      overflow-wrap: break-word;
      word-break: break-word;
    }

    .vp__desc {
      margin: 0;
      font-size: $text-sm;
      line-height: 1.45;
      color: var(--forge-text-muted, #9a958c);
    }

    .vp__desc code {
      font-family: $font-mono;
      font-size: 0.9em;
      padding: 0 2px;
      color: var(--forge-text, #e8e4de);
    }

    .vp__sig {
      margin-top: auto;
      font-family: $font-mono;
      font-size: $text-xs;
      color: var(--forge-text-muted, #9a958c);
      font-style: italic;
      background: transparent;
      padding: 0;
    }

    @media (max-width: 768px) {
      .vp {
        grid-template-columns: 1fr;
      }
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class ValidatorPillarsComponent {}
