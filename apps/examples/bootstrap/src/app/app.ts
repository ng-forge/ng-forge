import { Component, effect, ElementRef, inject } from '@angular/core';
import { RouterModule } from '@angular/router';

@Component({
  imports: [RouterModule],
  selector: 'bs-example-root',
  templateUrl: './app.html',
  styleUrl: './app.scss',
})
export class App {
  protected title = 'Bootstrap Examples';

  private elementRef = inject(ElementRef);

  constructor() {
    // Set Bootstrap theme based on dark mode
    effect(() => {
      const isDark = document.documentElement.classList.contains('dark');
      const theme = isDark ? 'dark' : 'light';
      this.elementRef.nativeElement.setAttribute('data-bs-theme', theme);

      // Also observe changes to the dark class on document
      const observer = new MutationObserver(() => {
        const currentlyDark = document.documentElement.classList.contains('dark');
        const currentTheme = currentlyDark ? 'dark' : 'light';
        this.elementRef.nativeElement.setAttribute('data-bs-theme', currentTheme);
      });

      observer.observe(document.documentElement, {
        attributes: true,
        attributeFilter: ['class'],
      });
    });
  }
}
