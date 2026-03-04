import { NgDocPage } from '@ng-doc/core';
import InstallationPage from '../../installation/ng-doc.page';
import TextInputsPage from '../../schema-fields/field-types/text-inputs/ng-doc.page';
import TypeSafetyPage from '../type-safety/basics/ng-doc.page';
import IntegrationsPage from '../../ui-libs-integrations/ng-doc.page';

const BuildingAnAdapterPage: NgDocPage = {
  title: 'Building an Adapter',
  route: 'building-an-adapter',
  mdFile: './index.md',
  order: 3,
  prerequisites: [InstallationPage, TextInputsPage, TypeSafetyPage],
  related: [IntegrationsPage],
};

export default BuildingAnAdapterPage;
