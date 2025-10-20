import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { DemoFormComponent } from './demo-form.component';

@Component({
  imports: [DemoFormComponent, RouterModule],
  selector: 'app-root',
  templateUrl: './app.html',
  styleUrl: './app.scss',
})
export class App {
  protected title = 'ng-forge Dynamic Forms Demo';
}
