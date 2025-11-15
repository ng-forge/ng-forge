import { Component, Renderer2, inject } from '@angular/core';
import { RouterModule } from '@angular/router';
import { DOCUMENT } from '@angular/common';

@Component({
  imports: [RouterModule],
  selector: 'bs-example-root',
  templateUrl: './app.html',
  styleUrl: './app.scss',
})
export class App {
  protected title = 'Bootstrap Examples';
  private renderer = inject(Renderer2);
  private document = inject(DOCUMENT);

  constructor() {
    // Listen for theme messages from parent (docs app)
    window.addEventListener('message', (event) => {
      if (event.data?.type === 'THEME_CHANGE') {
        this.applyTheme(event.data.theme);
      }
    });
  }

  private applyTheme(theme: 'light' | 'dark'): void {
    const htmlElement = this.document.documentElement;

    if (theme === 'dark') {
      // Bootstrap 5.3+ uses data-bs-theme attribute
      this.renderer.setAttribute(htmlElement, 'data-bs-theme', 'dark');
      this.renderer.addClass(htmlElement, 'dark');
    } else {
      this.renderer.setAttribute(htmlElement, 'data-bs-theme', 'light');
      this.renderer.removeClass(htmlElement, 'dark');
    }
  }
}
