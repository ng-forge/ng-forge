import { ChangeDetectionStrategy, Component } from '@angular/core';
import { ReactiveConfigTestComponent } from '../../shared/reactive-config-test.component';
import { configSwapPagesConfigVariants } from './config-swap-pages.scenario';

/**
 * Route component for the config swap with pages test.
 * Wraps ReactiveConfigTestComponent with the specific config variants.
 */
@Component({
  selector: 'example-config-swap-pages',
  imports: [ReactiveConfigTestComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <example-reactive-config-test
      testId="config-swap-pages"
      title="Config Swap with Pages"
      description="Swap configs with different multi-page structures, verify page navigation resets correctly"
      [configVariants]="configVariants"
      initialConfigKey="initial"
    />
  `,
})
export class ConfigSwapPagesComponent {
  readonly configVariants = configSwapPagesConfigVariants;
}
