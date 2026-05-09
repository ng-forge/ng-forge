import {
  afterNextRender,
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  ElementRef,
  inject,
  input,
  Renderer2,
  signal,
  viewChild,
  viewChildren,
} from '@angular/core';
import { takeUntilDestroyed, toObservable } from '@angular/core/rxjs-interop';
import { DOCUMENT } from '@angular/common';
import { fromEvent, merge, Subject } from 'rxjs';
import { debounceTime, filter, map, startWith, switchMap } from 'rxjs/operators';
import type { HeadingEntry } from '../../services/content.service';

@Component({
  selector: 'docs-toc',
  template: `
    @if (headings().length > 0) {
      <nav class="toc" aria-label="Table of contents">
        <h4 class="toc-title">ON THIS PAGE</h4>
        <div class="toc-container">
          <div class="toc-selection" #selection></div>
          <ul class="toc-list">
            @for (heading of headings(); track heading.id) {
              <li #tocItem [class.depth-3]="heading.level === 3" [attr.data-selected]="activeId() === heading.id">
                <a
                  class="toc-link"
                  [class.active]="activeId() === heading.id"
                  [href]="'#' + heading.id"
                  (click)="scrollTo($event, heading.id)"
                >
                  {{ heading.text }}
                </a>
              </li>
            }
          </ul>
        </div>
      </nav>
    }
  `,
  styles: [
    `
      :host {
        display: block;
        position: sticky;
        top: 96px;
        max-height: calc(100vh - 120px);
        overflow-y: auto;
      }

      .toc {
        padding: 0;
      }

      .toc-title {
        font-size: 11px;
        font-weight: 600;
        letter-spacing: 0.1em;
        color: var(--forge-text-muted);
        margin: 0 0 16px;
        padding: 0;
      }

      .toc-container {
        position: relative;
      }

      .toc-selection {
        position: absolute;
        left: 0;
        width: 3px;
        border-radius: 2px;
        background-color: var(--forge-primary);
        transition:
          top 0.2s ease,
          height 0.2s ease;
      }

      .toc-list {
        list-style: none;
        margin: 0;
        padding: 0 0 0 8px;
        border-left: 1px solid var(--forge-border-color);
      }

      .toc-list li {
        margin: 0;
      }

      .toc-link {
        display: block;
        padding: 4px 0 4px 12px;
        font-size: 14px;
        line-height: 22px;
        color: var(--forge-text-muted);
        text-decoration: none;
        word-break: break-word;
        transition: color 0.15s ease;

        &:hover {
          color: var(--forge-primary);
        }

        &.active {
          color: var(--forge-primary);
        }
      }

      .depth-3 .toc-link {
        padding-left: 24px;
      }

      @media (max-width: 1280px) {
        :host {
          display: none;
        }
      }
    `,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TocComponent {
  private readonly document = inject(DOCUMENT);
  private readonly renderer = inject(Renderer2);
  private readonly destroyRef = inject(DestroyRef);

  readonly headings = input<HeadingEntry[]>([]);
  readonly activeId = signal<string>('');

  private readonly selectionRef = viewChild<ElementRef>('selection');
  private readonly tocItems = viewChildren<ElementRef>('tocItem');
  private readonly headings$ = toObservable(this.headings);
  private readonly clickedId$ = new Subject<string>();
  private readonly scrollLocked = signal(false);

  constructor() {
    afterNextRender({
      write: () => {
        // Click-driven selection: immediately select, lock scroll-spy, unlock after 800ms
        const clickSelection$ = this.clickedId$.pipe(
          switchMap((id) => {
            this.scrollLocked.set(true);
            return merge(
              // Emit the clicked id immediately
              [id],
              // Unlock scroll-spy after smooth scroll animation
              fromEvent(this.document, 'scroll').pipe(
                debounceTime(300),
                map(() => {
                  this.scrollLocked.set(false);
                  return null as string | null;
                }),
              ),
            );
          }),
          filter((id): id is string => id !== null),
        );

        // Scroll-driven selection: find closest heading
        const scrollSelection$ = merge(
          fromEvent(this.document, 'scroll').pipe(startWith(null)),
          this.headings$.pipe(
            filter((h) => h.length > 0),
            debounceTime(50),
          ),
        ).pipe(
          filter(() => !this.scrollLocked()),
          debounceTime(10),
          map(() => this.findActiveHeading()),
          filter((id): id is string => id !== null),
        );

        merge(clickSelection$, scrollSelection$)
          .pipe(takeUntilDestroyed(this.destroyRef))
          .subscribe((id) => {
            this.activeId.set(id);
            this.updateSelectionIndicator(id);
          });
      },
    });
  }

  scrollTo(event: Event, id: string): void {
    event.preventDefault();
    const el = this.document.getElementById(id);
    if (!el) return;

    this.clickedId$.next(id);
    el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    history.replaceState(null, '', `#${id}`);
  }

  private findActiveHeading(): string | null {
    const headingList = this.headings();
    if (!headingList.length) return null;

    const scrollEl = this.document.scrollingElement;
    if (!scrollEl) return null;

    const scrollTop = scrollEl.scrollTop;
    const scrollHeight = scrollEl.scrollHeight;
    const offsetHeight = scrollEl.clientHeight;
    const percentage = (scrollTop * 100) / (scrollHeight - offsetHeight || 1);
    const selectionLine = scrollTop + (offsetHeight * percentage) / 100;

    let closest: { id: string; distance: number } | null = null;

    for (const heading of headingList) {
      const el = this.document.getElementById(heading.id);
      // SSR: server DOM may return a stub element that doesn't implement
      // getBoundingClientRect. Skip rather than crash the prerender.
      if (!el || typeof (el as Element).getBoundingClientRect !== 'function') continue;
      const top = el.getBoundingClientRect().top + scrollTop;
      const distance = Math.abs(top - selectionLine);
      if (!closest || distance < closest.distance) {
        closest = { id: heading.id, distance };
      }
    }

    return closest?.id ?? null;
  }

  private updateSelectionIndicator(activeId: string): void {
    const selection = this.selectionRef();
    if (!selection) return;

    const items = this.tocItems();
    const headingList = this.headings();
    const index = headingList.findIndex((h) => h.id === activeId);

    if (index >= 0 && index < items.length) {
      const el = items[index].nativeElement as HTMLElement;
      this.renderer.setStyle(selection.nativeElement, 'top', `${el.offsetTop}px`);
      this.renderer.setStyle(selection.nativeElement, 'height', `${el.offsetHeight}px`);
    }
  }
}
