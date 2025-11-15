import { Component, Renderer2, inject, DestroyRef } from '@angular/core';
import { RouterModule } from '@angular/router';
import { DOCUMENT } from '@angular/common';

@Component({
  imports: [RouterModule],
  selector: 'example-root',
  templateUrl: './app.html',
  styleUrl: './app.scss',
})
export class App {
  protected title = 'Material Examples';
  private renderer = inject(Renderer2);
  private document = inject(DOCUMENT);
  private destroyRef = inject(DestroyRef);

  constructor() {
    // Listen for theme messages from parent (docs app)
    const handleMessage = (event: MessageEvent) => {
      if (event.data?.type === 'THEME_CHANGE') {
        this.applyTheme(event.data.theme);
      }
    };

    window.addEventListener('message', handleMessage);

    // Clean up event listener on destroy
    this.destroyRef.onDestroy(() => {
      window.removeEventListener('message', handleMessage);
    });
  }

  private applyTheme(theme: 'light' | 'dark'): void {
    const htmlElement = this.document.documentElement;

    if (theme === 'dark') {
      this.renderer.addClass(htmlElement, 'dark');
    } else {
      this.renderer.removeClass(htmlElement, 'dark');
    }
  }
}
