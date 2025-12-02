import { Component } from '@angular/core';
import { IonContent, IonHeader, IonItem, IonList, IonTitle, IonToolbar } from '@ionic/angular/standalone';

@Component({
  selector: 'example-index',
  imports: [IonContent, IonHeader, IonTitle, IonToolbar, IonList, IonItem],
  template: `
    <ion-header>
      <ion-toolbar>
        <ion-title>Ionic Examples</ion-title>
      </ion-toolbar>
    </ion-header>

    <ion-content>
      <div class="index-container">
        <h1>Ionic Examples</h1>
        <p>Select an example from the navigation or use direct links in documentation.</p>

        <ion-list>
          <ion-item>
            <p>Examples will be added as routes are created</p>
          </ion-item>
        </ion-list>
      </div>
    </ion-content>
  `,
  styles: [
    `
      .index-container {
        padding: 1rem;
      }

      h1 {
        margin-bottom: 1rem;
      }
    `,
  ],
})
export default class IndexComponent {}
