import { Component, Renderer2, inject } from '@angular/core';
import { RouterModule } from '@angular/router';
import { DOCUMENT } from '@angular/common';
import { fromEvent } from 'rxjs';
import { filter } from 'rxjs/operators';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

@Component({
  imports: [RouterModule],
  selector: 'example-root',
  templateUrl: './app.html',
  styleUrl: './app.scss',
})
export class App {
  protected title = 'PrimeNG Examples';
  private renderer = inject(Renderer2);
  private document = inject(DOCUMENT);

  constructor() {
    // Listen for theme messages from parent (docs app)
    fromEvent<MessageEvent>(window, 'message')
      .pipe(
        filter((event) => event.data?.type === 'THEME_CHANGE'),
        takeUntilDestroyed()
      )
      .subscribe((event) => {
        this.applyTheme(event.data.theme);
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
