import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import '@ng-forge/dynamic-forms-primeng';
import { ExampleScenarioComponent } from '@ng-forge/examples-shared-ui';
import { SANDBOX_FORM_CONFIG } from '@ng-forge/sandbox-harness';

@Component({
  selector: 'demo-scenario',
  template: `<example-scenario [scenario]="scenario" />`,
  imports: [ExampleScenarioComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class DemoScenarioComponent {
  readonly scenario = {
    id: 'demo',
    config: inject(SANDBOX_FORM_CONFIG),
  };
}
