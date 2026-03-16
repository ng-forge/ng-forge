import { ChangeDetectionStrategy, Component, computed, inject, Input } from '@angular/core';
import { NgDocIconComponent } from '@ng-doc/ui-kit';
import { ActiveAdapterService } from '../../services/active-adapter.service';

// @Input() is required here to satisfy the NgDocPageBreadcrumbs interface (breadcrumbs: string[])
// which ng-doc expects when registering a custom skeleton breadcrumb component.
@Component({
  selector: 'docs-breadcrumb',
  templateUrl: './breadcrumb.component.html',
  styleUrl: './breadcrumb.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [NgDocIconComponent],
})
export class DocsBreadcrumbComponent {
  @Input() breadcrumbs: string[] = [];

  private readonly adapterService = inject(ActiveAdapterService);

  readonly currentAdapter = computed(
    () => this.adapterService.adapters.find((a) => a.name === this.adapterService.adapter()) ?? this.adapterService.adapters[0],
  );
}
