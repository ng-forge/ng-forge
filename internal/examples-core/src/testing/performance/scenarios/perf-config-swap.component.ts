import { ChangeDetectionStrategy, Component } from '@angular/core';
import { ReactiveConfigTestComponent } from '../../shared/reactive-config-test.component';
import { perfConfigSwapConfigVariants } from './perf-config-swap.scenario';

@Component({
  selector: 'example-perf-config-swap',
  imports: [ReactiveConfigTestComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <example-reactive-config-test
      testId="perf-config-swap"
      title="Config Swap (100 fields)"
      description="Swap between two 100-field configs multiple times and measure transition time"
      [configVariants]="configVariants"
      initialConfigKey="initial"
    />
  `,
})
export class PerfConfigSwapComponent {
  readonly configVariants = perfConfigSwapConfigVariants;
}
