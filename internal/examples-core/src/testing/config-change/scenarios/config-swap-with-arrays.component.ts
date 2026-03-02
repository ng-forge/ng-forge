import { ChangeDetectionStrategy, Component } from '@angular/core';
import { ReactiveConfigTestComponent } from '../../shared/reactive-config-test.component';
import { configSwapWithArraysConfigVariants } from './config-swap-with-arrays.scenario';

/**
 * Route component for the config swap with arrays test.
 * Wraps ReactiveConfigTestComponent with the specific config variants.
 */
@Component({
  selector: 'example-config-swap-with-arrays',
  imports: [ReactiveConfigTestComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <example-reactive-config-test
      testId="config-swap-with-arrays"
      title="Config Swap with Arrays"
      description="Swap configs containing different array fields, verify array transitions work correctly"
      [configVariants]="configVariants"
      initialConfigKey="initial"
    />
  `,
})
export class ConfigSwapWithArraysComponent {
  readonly configVariants = configSwapWithArraysConfigVariants;
}
