import { ChangeDetectionStrategy, Component } from '@angular/core';
import { ReactiveConfigTestComponent } from '../../shared/reactive-config-test.component';
import { reactiveConfigVariants } from './reactive-config-changes.scenario';

/**
 * Route component for the reactive config changes test.
 * Wraps ReactiveConfigTestComponent with the specific config variants.
 */
@Component({
  selector: 'example-reactive-config-changes',
  imports: [ReactiveConfigTestComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <example-reactive-config-test
      testId="reactive-config-changes"
      title="Reactive Config Changes"
      description="Tests adding, removing, and reordering fields at runtime without NG01902 errors"
      [configVariants]="configVariants"
      initialConfigKey="initial"
    />
  `,
})
export class ReactiveConfigChangesComponent {
  readonly configVariants = reactiveConfigVariants;
}
