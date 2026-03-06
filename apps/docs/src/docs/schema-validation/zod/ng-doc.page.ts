import { NgDocPage } from '@ng-doc/core';
import SchemaValidationCategory from '../ng-doc.category';
import { LiveExampleComponent } from '../../../app/components/live-example/live-example.component';
import { DocsInstallCommandComponent } from '../../../app/components/install-command/install-command.component';

const ZodSchemaPage: NgDocPage = {
  title: 'Zod Validation',
  mdFile: './index.md',
  category: SchemaValidationCategory,
  order: 3,
  imports: [LiveExampleComponent, DocsInstallCommandComponent],
};

export default ZodSchemaPage;
