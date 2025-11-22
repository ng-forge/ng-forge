import { Component, effect, OnInit, signal } from '@angular/core';
import { RouterModule } from '@angular/router';
import { fromEvent } from 'rxjs';
import { filter, map } from 'rxjs/operators';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

@Component({
  imports: [RouterModule],
  selector: 'example-root',
  templateUrl: './app.html',
  styleUrl: './app.scss',
  host: {
    '[class.dark]': 'isDark()',
  },
})
export class App implements OnInit {
  protected title = 'PrimeNG Examples';

  isDark = signal(false);

  constructor() {
    // Listen for theme change messages from parent window
    fromEvent<MessageEvent>(window, 'message')
      .pipe(
        filter((event) => event.data?.type === 'theme-change'),
        map((event) => event.data.isDark as boolean),
        takeUntilDestroyed(),
      )
      .subscribe((isDark) => {
        this.isDark.set(isDark);
      });

    // Update document root when signal changes
    effect(() => {
      const darkMode = this.isDark();
      if (darkMode) {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    });
  }

  ngOnInit(): void {
    // Request initial theme state from parent
    window.parent.postMessage({ type: 'request-theme' }, '*');
  }
}
