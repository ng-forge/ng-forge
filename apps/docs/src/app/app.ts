import { Component, inject } from '@angular/core';
import { RouterModule } from '@angular/router';
import { NgDocNavbarComponent, NgDocRootComponent, NgDocSidebarComponent, NgDocThemeToggleComponent } from '@ng-doc/app';
import { NgDocThemeService } from '@ng-doc/app/services/theme';
import { startWith, tap } from 'rxjs';
import { toSignal } from '@angular/core/rxjs-interop';

@Component({
  imports: [RouterModule, NgDocRootComponent, NgDocNavbarComponent, NgDocSidebarComponent, NgDocThemeToggleComponent],
  selector: 'app-root',
  templateUrl: './app.html',
  styleUrl: './app.scss',
  host: {
    'class.dark-theme': 'isDark()',
    'class.light-theme': '!isDark()',
  },
})
export class App {
  readonly themeService = inject(NgDocThemeService);

  isDark = toSignal(
    this.themeService.themeChanges().pipe(
      startWith(this.themeService.currentTheme),
      tap((theme) => theme === 'dark')
    ),
    { requireSync: true }
  );
}
