import { NgDocPage } from '@ng-doc/core';
import SchemaValidationCategory from '../ng-doc.category';
import { ZodIframeDemoComponent } from './zod-iframe-demo.component';

const ZodSchemaPage: NgDocPage = {
  title: 'Standard Schema (Zod)',
  mdFile: './index.md',
  category: SchemaValidationCategory,
  order: 3,
  demos: {
    ZodIframeDemoComponent,
  },
};

export default ZodSchemaPage;
