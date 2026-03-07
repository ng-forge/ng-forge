import { NgDocPage } from '@ng-doc/core';
import { DocsInstallCommandComponent } from '../../app/components/install-command/install-command.component';
import { AdapterPickerComponent } from '../../app/components/adapter-picker/adapter-picker.component';
import { DocsIntegrationViewComponent } from '../../app/components/integration-view/integration-view.component';

const InstallationPage: NgDocPage = {
  title: 'Getting Started',
  route: 'getting-started',
  mdFile: './index.md',
  order: 1,
  imports: [DocsInstallCommandComponent, AdapterPickerComponent, DocsIntegrationViewComponent],
};

export default InstallationPage;
