import { ChangeDetectionStrategy, Component } from '@angular/core';
import { ReactiveConfigTestComponent } from '../../shared/reactive-config-test.component';
import { configRemoveFieldsConfigVariants } from './config-remove-fields.scenario';

/**
 * Route component for the remove fields config change test.
 * Wraps ReactiveConfigTestComponent with the specific config variants.
 */
@Component({
  selector: 'example-config-remove-fields',
  imports: [ReactiveConfigTestComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <example-reactive-config-test
      testId="config-remove-fields"
      title="Remove Fields from Config"
      description="Switch to a subset config, verify removed fields disappear and remaining values persist"
      [configVariants]="configVariants"
      initialConfigKey="initial"
    />
  `,
})
export class ConfigRemoveFieldsComponent {
  readonly configVariants = configRemoveFieldsConfigVariants;
}
