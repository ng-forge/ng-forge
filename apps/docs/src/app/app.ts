import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { RouterModule } from '@angular/router';

import { ActiveAdapterService } from './services/active-adapter.service';
import { ThemeService } from './services/theme.service';

@Component({
  imports: [RouterModule],
  selector: 'app-root',
  templateUrl: './app.html',
  styleUrl: './app.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    '[attr.data-adapter]': 'activeAdapter.adapter()',
  },
})
export class App {
  protected readonly activeAdapter = inject(ActiveAdapterService);
  // ThemeService must be eagerly injected so it sets data-theme on <html> during bootstrap
  private readonly _theme = inject(ThemeService);
}
