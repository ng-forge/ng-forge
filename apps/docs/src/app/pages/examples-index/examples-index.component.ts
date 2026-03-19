import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';

import { ActiveAdapterService } from '../../services/active-adapter.service';
import { ALL_TAGS, EXAMPLES_REGISTRY, type ExampleItem } from './examples.registry';

interface ExampleViewModel extends ExampleItem {
  link: string;
}

@Component({
  selector: 'docs-examples-index',
  imports: [RouterLink],
  templateUrl: './examples-index.component.html',
  styleUrl: './examples-index.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ExamplesIndexComponent {
  private readonly activeAdapter = inject(ActiveAdapterService);
  readonly allTags = ALL_TAGS;
  readonly selectedTags = signal<Set<string>>(new Set());

  readonly filteredExamples = computed<ExampleViewModel[]>(() => {
    const selected = this.selectedTags();
    const adapter = this.activeAdapter.adapter();
    const items = selected.size === 0 ? EXAMPLES_REGISTRY : EXAMPLES_REGISTRY.filter((e) => e.tags.some((t) => selected.has(t)));
    return items.map((e) => ({ ...e, link: `/${adapter}${e.path}` }));
  });

  toggleTag(tag: string): void {
    this.selectedTags.update((tags) => {
      if (tags.has(tag)) {
        return new Set();
      }
      return new Set([tag]);
    });
  }

  isTagActive(tag: string): boolean {
    return this.selectedTags().has(tag);
  }

  clearFilters(): void {
    this.selectedTags.set(new Set());
  }
}
