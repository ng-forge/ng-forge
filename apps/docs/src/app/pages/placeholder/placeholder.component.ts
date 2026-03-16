import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'app-placeholder',
  template: `<p>Content routes will be wired in Phase 4.</p>`,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PlaceholderComponent {}
