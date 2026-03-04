import { NgDocPage } from '@ng-doc/core';
import DynamicBehaviorCategory from '../../ng-doc.category';
import InstallationPage from '../../../installation/ng-doc.page';
import TextInputsPage from '../../../schema-fields/field-types/text-inputs/ng-doc.page';
import DerivationPage from '../../value-derivation/basics/ng-doc.page';

const ConditionalLogicPage: NgDocPage = {
  title: 'Conditional Logic',
  mdFile: './index.md',
  category: DynamicBehaviorCategory,
  order: 1,
  prerequisites: [InstallationPage, TextInputsPage],
  related: [DerivationPage],
};

export default ConditionalLogicPage;
