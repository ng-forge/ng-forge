import { ChangeDetectionStrategy, Component } from '@angular/core';
import { ReactiveConfigTestComponent } from '../../shared/reactive-config-test.component';
import { configAddFieldsConfigVariants } from './config-add-fields.scenario';

/**
 * Route component for the add fields config change test.
 * Wraps ReactiveConfigTestComponent with the specific config variants.
 */
@Component({
  selector: 'example-config-add-fields',
  imports: [ReactiveConfigTestComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <example-reactive-config-test
      testId="config-add-fields"
      title="Add Fields to Config"
      description="Switch to a superset config, verify new fields appear and existing values persist"
      [configVariants]="configVariants"
      initialConfigKey="initial"
    />
  `,
})
export class ConfigAddFieldsComponent {
  readonly configVariants = configAddFieldsConfigVariants;
}
