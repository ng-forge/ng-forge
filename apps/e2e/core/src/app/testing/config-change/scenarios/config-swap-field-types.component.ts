import { ChangeDetectionStrategy, Component } from '@angular/core';
import { ReactiveConfigTestComponent } from '../../shared/reactive-config-test.component';
import { configSwapFieldTypesConfigVariants } from './config-swap-field-types.scenario';

/**
 * Route component for the type-swap config test. Hosts ReactiveConfigTestComponent
 * with two variants that share keys but differ in field `type`.
 */
@Component({
  selector: 'example-config-swap-field-types',
  imports: [ReactiveConfigTestComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <example-reactive-config-test
      testId="config-swap-field-types"
      title="Config Swap — Field Type Change on Shared Key"
      description="Swap a field from one type to another while keeping the same key"
      [configVariants]="configVariants"
      initialConfigKey="initial"
    />
  `,
})
export class ConfigSwapFieldTypesComponent {
  readonly configVariants = configSwapFieldTypesConfigVariants;
}
