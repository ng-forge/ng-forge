import { ChangeDetectionStrategy, Component, computed, ElementRef, inject, signal, viewChildren } from '@angular/core';
import { ActiveAdapterService } from '../../services/active-adapter.service';
import { AdapterName } from '@ng-forge/sandbox-harness';

@Component({
  selector: 'app-adapter-sub-bar',
  template: `
    <div class="adapter-sub-bar">
      <div class="adapter-dropdown" [class.open]="isOpen()">
        <button
          class="adapter-trigger"
          (click)="toggle($event)"
          (keydown)="onTriggerKeydown($event)"
          [attr.aria-expanded]="isOpen()"
          aria-haspopup="listbox"
        >
          <span class="trigger-label">Adapter</span>
          <span class="trigger-divider"></span>
          <img [src]="currentAdapter().icon" [alt]="currentAdapter().label" class="trigger-icon" />
          <span class="trigger-name">{{ currentAdapter().label }}</span>
          <span class="trigger-chevron"></span>
        </button>

        @if (isOpen()) {
          <div class="adapter-menu" role="listbox">
            @for (adapter of activeAdapter.adapters; track adapter.name) {
              <button
                #optionButton
                class="adapter-option"
                [class.selected]="activeAdapter.adapter() === adapter.name"
                role="option"
                [attr.aria-selected]="activeAdapter.adapter() === adapter.name"
                (click)="select(adapter.name)"
                (keydown)="onOptionKeydown($event, $index)"
              >
                <img [src]="adapter.icon" [alt]="adapter.label" class="option-icon" />
                <span class="option-name">{{ adapter.label }}</span>
                @if (adapter.name !== 'custom') {
                  <span class="option-preview">PREVIEW</span>
                }
                <span class="option-check" [style.visibility]="activeAdapter.adapter() === adapter.name ? 'visible' : 'hidden'"></span>
              </button>
            }
          </div>
        }
      </div>
    </div>
  `,
  styleUrl: './adapter-sub-bar.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    '(document:click)': 'isOpen.set(false)',
  },
})
export class AdapterSubBarComponent {
  protected readonly activeAdapter = inject(ActiveAdapterService);
  protected readonly isOpen = signal(false);
  private readonly optionButtons = viewChildren<ElementRef<HTMLButtonElement>>('optionButton');

  protected readonly currentAdapter = computed(
    () => this.activeAdapter.adapters.find((a) => a.name === this.activeAdapter.adapter()) ?? this.activeAdapter.adapters[0],
  );

  protected toggle(event: MouseEvent): void {
    event.stopPropagation();
    this.isOpen.update((v) => !v);
  }

  protected select(name: AdapterName): void {
    this.isOpen.set(false);
    if (name !== this.activeAdapter.adapter()) {
      this.activeAdapter.switchTo(name);
    }
  }

  protected onTriggerKeydown(event: KeyboardEvent): void {
    if (event.key === 'ArrowDown' || event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      this.isOpen.set(true);
      requestAnimationFrame(() => this.focusOption(0));
    }
  }

  protected onOptionKeydown(event: KeyboardEvent, index: number): void {
    const count = this.activeAdapter.adapters.length;
    switch (event.key) {
      case 'ArrowDown':
        event.preventDefault();
        this.focusOption(Math.min(index + 1, count - 1));
        break;
      case 'ArrowUp':
        event.preventDefault();
        if (index === 0) {
          this.isOpen.set(false);
          (event.target as HTMLElement).closest('.adapter-dropdown')?.querySelector<HTMLButtonElement>('.adapter-trigger')?.focus();
        } else {
          this.focusOption(index - 1);
        }
        break;
      case 'Escape':
        event.preventDefault();
        this.isOpen.set(false);
        (event.target as HTMLElement).closest('.adapter-dropdown')?.querySelector<HTMLButtonElement>('.adapter-trigger')?.focus();
        break;
      case 'Home':
        event.preventDefault();
        this.focusOption(0);
        break;
      case 'End':
        event.preventDefault();
        this.focusOption(count - 1);
        break;
    }
  }

  private focusOption(index: number): void {
    this.optionButtons()?.[index]?.nativeElement.focus();
  }
}
