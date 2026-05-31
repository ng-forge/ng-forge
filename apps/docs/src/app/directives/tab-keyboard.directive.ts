import { Directive, ElementRef, inject, input, output } from '@angular/core';

// https://www.w3.org/WAI/ARIA/apg/patterns/tabs/ (automatic activation)
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
    this.selectChange.emit(items[nextIdx].id);
    const tabs = this.host.nativeElement.querySelectorAll<HTMLButtonElement>('[role="tab"]');
    tabs[nextIdx]?.focus();
  }
}

export default DocsTabKeyboardDirective;
