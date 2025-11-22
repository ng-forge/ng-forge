import { Component, effect, HostBinding } from '@angular/core';
import { RouterModule } from '@angular/router';
import { IonApp, IonRouterOutlet } from '@ionic/angular/standalone';

@Component({
  imports: [RouterModule, IonApp, IonRouterOutlet],
  selector: 'example-root',
  templateUrl: './app.html',
  styleUrl: './app.scss',
})
export class App {
  protected title = 'Ionic Examples';

  @HostBinding('class.dark')
  isDark = false;

  constructor() {
    // Sync dark mode with document
    effect(() => {
      this.isDark = document.documentElement.classList.contains('dark');

      // Observe changes to the dark class on document
      const observer = new MutationObserver(() => {
        this.isDark = document.documentElement.classList.contains('dark');
      });

      observer.observe(document.documentElement, {
        attributes: true,
        attributeFilter: ['class'],
      });
    });
  }
}
