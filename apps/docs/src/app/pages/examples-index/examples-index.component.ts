import { ChangeDetectionStrategy, Component, computed, signal } from '@angular/core';
import { RouterLink } from '@angular/router';

import { ALL_TAGS, EXAMPLES_REGISTRY, type ExampleItem } from './examples.registry';

@Component({
  selector: 'docs-examples-index',
  imports: [RouterLink],
  templateUrl: './examples-index.component.html',
  styleUrl: './examples-index.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ExamplesIndexComponent {
  readonly allTags = ALL_TAGS;
  readonly selectedTags = signal<Set<string>>(new Set());

  readonly filteredExamples = computed<ExampleItem[]>(() => {
    const selected = this.selectedTags();
    if (selected.size === 0) {
      return EXAMPLES_REGISTRY;
    }
    return EXAMPLES_REGISTRY.filter((example) => example.tags.some((tag) => selected.has(tag)));
  });

  toggleTag(tag: string): void {
    this.selectedTags.update((tags) => {
      // Single-select: if already selected, deselect (show all)
      // If not selected, select only this tag
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
