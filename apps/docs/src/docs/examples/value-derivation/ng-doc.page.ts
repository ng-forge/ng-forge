import { NgDocPage } from '@ng-doc/core';
import { LiveExampleComponent } from '../../../app/components/live-example/live-example.component';

const ValueDerivationExamplePage: NgDocPage = {
  title: 'Value Derivation',
  mdFile: './index.md',
  route: 'examples/value-derivation',
  hidden: true,
  imports: [LiveExampleComponent],
};

export default ValueDerivationExamplePage;
