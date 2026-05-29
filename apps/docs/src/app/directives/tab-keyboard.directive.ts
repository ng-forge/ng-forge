import { Directive, ElementRef, inject, input, output } from '@angular/core';

/**
 * WAI-ARIA tablist keyboard handler for tab strips that follow the
 * "automatic activation" pattern (Arrow keys move both focus AND
 * selection). Apply to the element with `role="tablist"`. The directive
 * assumes the tab buttons are descendants matching `[role="tab"]`.
 *
 *  - Arrow Left / Up   → previous tab (wraps)
 *  - Arrow Right / Down → next tab (wraps)
 *  - Home              → first tab
 *  - End               → last tab
 *
 * Reference: https://www.w3.org/WAI/ARIA/apg/patterns/tabs/
 */
@Directive({
  selector: '[docsTabKeyboard]',
  host: {
    '(keydown)': 'onKeydown($event)',
  },
})
export class DocsTabKeyboardDirective<T extends string> {
  readonly items = input.required<readonly { id: T }[]>({ alias: 'docsTabKeyboard' });
  readonly current = input.required<T>();
  readonly selectChange = output<T>();

  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef);

  onKeydown(event: KeyboardEvent): void {
    const items = this.items();
    if (items.length === 0) return;
    const currentIdx = items.findIndex((i) => i.id === this.current());

    let nextIdx: number;
    switch (event.key) {
      case 'ArrowRight':
      case 'ArrowDown':
        nextIdx = (currentIdx + 1) % items.length;
        break;
      case 'ArrowLeft':
      case 'ArrowUp':
        nextIdx = (currentIdx - 1 + items.length) % items.length;
        break;
      case 'Home':
        nextIdx = 0;
        break;
      case 'End':
        nextIdx = items.length - 1;
        break;
      default:
        return;
    }

    event.preventDefault();
    const next = items[nextIdx];
    this.selectChange.emit(next.id);

    // Move focus to the newly-active tab. focus() works on a tabindex=-1
    // element, so we don't need to wait for the [tabindex] binding to
    // update before focusing.
    const tabs = this.host.nativeElement.querySelectorAll<HTMLButtonElement>('[role="tab"]');
    tabs[nextIdx]?.focus();
  }
}

export default DocsTabKeyboardDirective;
