import { Component, ChangeDetectionStrategy, input, computed } from '@angular/core';

@Component({
  selector: 'app-theme-container',
  template: `
    <div [class]="themeClass()">
      <ng-content></ng-content>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ThemeContainerComponent {
  theme = input<'material' | 'primeng' | 'ionic'>('material');
  themeClass = computed(() => `theme-${this.theme()}`);
}
