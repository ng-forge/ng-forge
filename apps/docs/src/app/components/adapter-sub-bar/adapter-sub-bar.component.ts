import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { ActiveAdapterService } from '../../services/active-adapter.service';
import { AdapterName } from '@ng-forge/sandbox-harness';

@Component({
  selector: 'app-adapter-sub-bar',
  template: `
    <div class="adapter-sub-bar">
      <div class="adapter-dropdown" [class.open]="isOpen()">
        <button class="adapter-trigger" (click)="toggle($event)" [attr.aria-expanded]="isOpen()">
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
                class="adapter-option"
                [class.selected]="activeAdapter.adapter() === adapter.name"
                role="option"
                [attr.aria-selected]="activeAdapter.adapter() === adapter.name"
                (click)="select(adapter.name)"
              >
                <img [src]="adapter.icon" [alt]="adapter.label" class="option-icon" />
                <span class="option-name">{{ adapter.label }}</span>
                <span class="option-preview">PREVIEW</span>
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

  protected readonly currentAdapter = computed(
    () => this.activeAdapter.adapters.find((a) => a.name === this.activeAdapter.adapter()) ?? this.activeAdapter.adapters[0],
  );

  protected toggle(event: MouseEvent): void {
    event.stopPropagation();
    this.isOpen.update((v) => !v);
  }

  protected select(name: AdapterName): void {
    this.activeAdapter.switchTo(name);
    this.isOpen.set(false);
  }
}
