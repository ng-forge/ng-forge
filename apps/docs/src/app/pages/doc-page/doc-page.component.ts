import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { map, switchMap } from 'rxjs';
import { ContentService } from '../../services/content.service';
import { ContentComponentsDirective } from '../../directives/content-components.directive';

/**
 * Generic documentation page component.
 * Loads and renders markdown content based on the current route slug.
 */
@Component({
  selector: 'app-doc-page',
  imports: [ContentComponentsDirective],
  template: `
    <article class="doc-page">
      @if (content()?.error) {
        <div class="doc-page-error">{{ content()!.error }}</div>
      } @else if (content()?.html) {
        <div class="doc-page-content" contentComponents [innerHTML]="content()!.html"></div>
      } @else {
        <div class="doc-page-loading">Loading...</div>
      }
    </article>
  `,
  styles: [
    `
      .doc-page-error {
        color: var(--forge-text-muted);
        font-style: italic;
        padding: 2rem 0;
      }
      .doc-page-loading {
        color: var(--forge-text-muted);
        padding: 2rem 0;
      }
      .doc-page-content {
        line-height: 1.7;
        color: var(--forge-text);

        :first-child {
          margin-top: 0;
        }

        h1,
        h2,
        h3,
        h4 {
          color: var(--forge-text);
          font-weight: 600;
          margin-top: 2rem;
          margin-bottom: 0.75rem;
        }

        h1 {
          font-size: 2rem;
          border-bottom: 1px solid var(--forge-base-3);
          padding-bottom: 0.5rem;
        }

        h2 {
          font-size: 1.5rem;
        }

        h3 {
          font-size: 1.25rem;
        }

        a {
          color: var(--forge-link-color);
          text-decoration: none;
          &:hover {
            color: var(--forge-link-hover-color);
            text-decoration: underline;
          }
        }

        code {
          background: var(--forge-code-bg);
          padding: 0.15em 0.4em;
          border-radius: 4px;
          font-size: 0.875em;
          font-family: 'JetBrains Mono', monospace;
        }

        pre {
          background: var(--forge-code-bg);
          border: 1px solid var(--forge-border-color);
          border-radius: 8px;
          padding: 1rem;
          overflow-x: auto;
          margin: 1rem 0;

          code {
            background: none;
            padding: 0;
            border-radius: 0;
            font-size: 0.85rem;
          }
        }

        blockquote {
          border-left: 3px solid var(--forge-primary);
          margin: 1rem 0;
          padding: 0.5rem 1rem;
          background: var(--forge-base-1);
          border-radius: 0 4px 4px 0;
        }

        table {
          width: 100%;
          border-collapse: collapse;
          margin: 1rem 0;
        }

        th,
        td {
          border: 1px solid var(--forge-border-color);
          padding: 0.5rem 0.75rem;
          text-align: left;
        }

        th {
          background: var(--forge-base-1);
          font-weight: 600;
        }

        img {
          max-width: 100%;
          border-radius: 8px;
        }

        ul,
        ol {
          padding-left: 1.5rem;
        }

        li {
          margin-bottom: 0.25rem;
        }

        hr {
          border: none;
          border-top: 1px solid var(--forge-base-3);
          margin: 1.5rem 0;
        }
      }
    `,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DocPageComponent {
  private readonly route = inject(ActivatedRoute);
  private readonly contentService = inject(ContentService);

  private readonly content$ = this.route.url.pipe(
    map((segments) => segments.map((s) => s.path).join('/')),
    switchMap((slug) => this.contentService.load(slug)),
  );

  readonly content = toSignal(this.content$);
}
