import { ChangeDetectionStrategy, Component, computed, inject, OnInit } from '@angular/core';
import { Router, RouterModule, NavigationEnd } from '@angular/router';
import { map, startWith, filter } from 'rxjs';
import { toSignal } from '@angular/core/rxjs-interop';

import { ActiveAdapterService } from './services/active-adapter.service';
import { ThemeService } from './services/theme.service';

@Component({
  imports: [RouterModule],
  selector: 'app-root',
  templateUrl: './app.html',
  styleUrl: './app.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    '[class.dark]': 'themeService.isDark()',
    '[attr.data-adapter]': 'activeAdapter.adapter()',
  },
})
export class App implements OnInit {
  private readonly router = inject(Router);
  protected readonly activeAdapter = inject(ActiveAdapterService);
  readonly themeService = inject(ThemeService);

  private readonly currentUrl = toSignal(
    this.router.events.pipe(
      filter((event): event is NavigationEnd => event instanceof NavigationEnd),
      map((event) => event.urlAfterRedirects),
      startWith(this.router.url),
    ),
    { requireSync: true },
  );

  readonly isLandingPage = computed(() => {
    const url = this.currentUrl();
    return url === '/' || url === '';
  });

  ngOnInit(): void {
    this.themeService.init();
  }
}
