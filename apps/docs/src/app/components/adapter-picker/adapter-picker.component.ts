import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { ActiveAdapterService } from '../../services/active-adapter.service';

@Component({
  selector: 'docs-adapter-picker',
  template: `
    <div class="adapter-picker">
      @for (adapter of activeAdapter.adapters; track adapter.name) {
        <button
          class="adapter-card"
          [class.active]="activeAdapter.adapter() === adapter.name"
          (click)="activeAdapter.switchTo(adapter.name)"
        >
          <img [src]="adapter.icon" [alt]="adapter.label" loading="lazy" />
          <span>{{ adapter.label }}</span>
        </button>
      }
    </div>
  `,
  styleUrl: './adapter-picker.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class AdapterPickerComponent {
  protected readonly activeAdapter = inject(ActiveAdapterService);
}
