import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ActiveAdapterService } from '../../services/active-adapter.service';

@Component({
  selector: 'docs-not-found',
  imports: [RouterLink],
  templateUrl: './not-found.component.html',
  styleUrl: './not-found.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NotFoundComponent {
  protected readonly adapter = inject(ActiveAdapterService);

  readonly adapterInfo = computed(() => {
    const name = this.adapter.adapter();
    return this.adapter.adapters.find((a) => a.name === name);
  });

  readonly gettingStartedLink = computed(() => `/${this.adapter.adapter()}/getting-started`);
  readonly examplesLink = computed(() => `/${this.adapter.adapter()}/examples`);
}
