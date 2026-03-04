import { NgDocPage } from '@ng-doc/core';
import AdvancedCategory from '../ng-doc.category';
import InstallationPage from '../../installation/ng-doc.page';
import TextInputsPage from '../../schema-fields/field-types/text-inputs/ng-doc.page';
import BuildingAnAdapterPage from '../custom-integrations/ng-doc.page';

const CustomFieldsRecipePage: NgDocPage = {
  title: 'Adding Custom Fields',
  mdFile: './index.md',
  category: AdvancedCategory,
  order: 5,
  prerequisites: [InstallationPage, TextInputsPage],
  related: [BuildingAnAdapterPage],
};

export default CustomFieldsRecipePage;
