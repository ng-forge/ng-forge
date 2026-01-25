import { Directive, ElementRef, inject, afterNextRender, DestroyRef, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

/**
 * Directive that adds accordion behavior to the ng-doc sidebar.
 * When a category is expanded, all other categories are collapsed.
 *
 * Apply this to the ng-doc-sidebar element:
 * ```html
 * <ng-doc-sidebar sidebarAccordion />
 * ```
 */
@Directive({
  selector: 'ng-doc-sidebar[sidebarAccordion]',
})
export class SidebarAccordionDirective {
  private readonly elementRef = inject(ElementRef<HTMLElement>);
  private readonly destroyRef = inject(DestroyRef);
  private readonly platformId = inject(PLATFORM_ID);

  constructor() {
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }

    afterNextRender(() => {
      const sidebar = this.elementRef.nativeElement;

      // Listen for clicks on category expanders
      const handleClick = (event: Event) => {
        const target = event.target as HTMLElement;

        // Find if click was on a category expander (the button that toggles expansion)
        const expander = target.closest('.ng-doc-category-expander, ng-doc-icon[icon="arrow-right"]');
        if (!expander) return;

        // Find the clicked category container
        const categoryItem = target.closest('.ng-doc-sidebar-category, .ng-doc-side-bar-item-category');
        if (!categoryItem) return;

        // Use requestAnimationFrame to let ng-doc process the click first
        requestAnimationFrame(() => {
          // Check if this category is now expanded
          const isExpanded = categoryItem.classList.contains('expanded') || categoryItem.getAttribute('data-expanded') === 'true';

          if (isExpanded) {
            // Collapse all other categories
            const allCategories = sidebar.querySelectorAll('.ng-doc-sidebar-category, .ng-doc-side-bar-item-category');
            allCategories.forEach((cat: Element) => {
              if (cat !== categoryItem && (cat.classList.contains('expanded') || cat.getAttribute('data-expanded') === 'true')) {
                // Find and click the expander to collapse
                const otherExpander = cat.querySelector('.ng-doc-category-expander, ng-doc-icon[icon="arrow-right"]') as HTMLElement;
                if (otherExpander) {
                  otherExpander.click();
                }
              }
            });
          }
        });
      };

      sidebar.addEventListener('click', handleClick);

      this.destroyRef.onDestroy(() => {
        sidebar.removeEventListener('click', handleClick);
      });
    });
  }
}
