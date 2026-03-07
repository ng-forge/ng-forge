import { ChangeDetectionStrategy, Component } from '@angular/core';
import { ReactiveConfigTestComponent } from '../../shared/reactive-config-test.component';
import { configSwapSimpleConfigVariants } from './config-swap-simple.scenario';

/**
 * Route component for the simple config swap test.
 * Wraps ReactiveConfigTestComponent with the specific config variants.
 */
@Component({
  selector: 'example-config-swap-simple',
  imports: [ReactiveConfigTestComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <example-reactive-config-test
      testId="config-swap-simple"
      title="Simple Config Swap"
      description="Swap entire config, verify form re-renders with new fields"
      [configVariants]="configVariants"
      initialConfigKey="initial"
    />
  `,
})
export class ConfigSwapSimpleComponent {
  readonly configVariants = configSwapSimpleConfigVariants;
}
