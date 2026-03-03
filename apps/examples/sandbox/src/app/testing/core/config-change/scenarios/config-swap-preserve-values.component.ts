import { ChangeDetectionStrategy, Component } from '@angular/core';
import { ReactiveConfigTestComponent } from '../../shared/reactive-config-test.component';
import { configSwapPreserveValuesConfigVariants } from './config-swap-preserve-values.scenario';

/**
 * Route component for the config swap with value preservation test.
 * Wraps ReactiveConfigTestComponent with the specific config variants.
 */
@Component({
  selector: 'example-config-swap-preserve-values',
  imports: [ReactiveConfigTestComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <example-reactive-config-test
      testId="config-swap-preserve-values"
      title="Config Swap with Value Preservation"
      description="Swap configs that share fields, verify shared field values persist"
      [configVariants]="configVariants"
      initialConfigKey="initial"
    />
  `,
})
export class ConfigSwapPreserveValuesComponent {
  readonly configVariants = configSwapPreserveValuesConfigVariants;
}
