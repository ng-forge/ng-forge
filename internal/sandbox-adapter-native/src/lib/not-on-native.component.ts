import { ChangeDetectionStrategy, Component } from '@angular/core';

/** For an example that exists only as a per-adapter scenario component, not as a shared config. */
@Component({
  selector: 'sandbox-not-on-native',
  template: `<p role="note">This example has no native version yet.</p>`,
  styles: `
    p {
      margin: 0;
      padding: 16px;
      font:
        14px/1.5 system-ui,
        sans-serif;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class NotOnNativeComponent {}
