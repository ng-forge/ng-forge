import { ChangeDetectionStrategy, Component } from '@angular/core';
import { ReactiveConfigTestComponent } from '../../shared/reactive-config-test.component';
import { agentConfigSwapVariants } from './agent-config-swap.scenario';

/**
 * Route component for the WebMCP config swap test.
 * Wraps ReactiveConfigTestComponent with the WebMCP config variants.
 */
@Component({
  selector: 'example-agent-config-swap',
  imports: [ReactiveConfigTestComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <example-reactive-config-test
      testId="agent-config-swap"
      title="Agent Config Swap"
      description="Tools follow the config: renaming, revoking submission, and opting out all take effect"
      [configVariants]="configVariants"
      initialConfigKey="initial"
    />
  `,
})
export class AgentConfigSwapComponent {
  readonly configVariants = agentConfigSwapVariants;
}
