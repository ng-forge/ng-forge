import { Component, HostBinding, OnInit, OnDestroy } from '@angular/core';
import { RouterModule } from '@angular/router';

@Component({
  imports: [RouterModule],
  selector: 'example-root',
  templateUrl: './app.html',
  styleUrl: './app.scss',
})
export class App implements OnInit, OnDestroy {
  protected title = 'PrimeNG Examples';

  @HostBinding('class.dark')
  isDark = false;

  private messageListener = (event: MessageEvent) => {
    // Accept messages from any origin since we're in an iframe
    if (event.data && event.data.type === 'theme-change') {
      this.isDark = event.data.isDark;
      // Also update document root for global dark mode CSS
      if (this.isDark) {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    }
  };

  ngOnInit(): void {
    // Listen for theme changes from parent window
    window.addEventListener('message', this.messageListener);

    // Request initial theme state from parent
    window.parent.postMessage({ type: 'request-theme' }, '*');
  }

  ngOnDestroy(): void {
    window.removeEventListener('message', this.messageListener);
  }
}
