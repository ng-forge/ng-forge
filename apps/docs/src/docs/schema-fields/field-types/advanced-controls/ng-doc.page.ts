import { NgDocPage } from '@ng-doc/core';
import { DocsAdapterPropsComponent } from '../../../../app/components/adapter-props/adapter-props.component';
import { LiveExampleComponent } from '../../../../app/components/live-example/live-example.component';
import FieldTypesCategory from '../ng-doc.category';
import TextInputsPage from '../text-inputs/ng-doc.page';
import SelectionFieldsPage from '../selection/ng-doc.page';

const AdvancedControlsPage: NgDocPage = {
  title: 'Advanced Controls',
  mdFile: './index.md',
  category: FieldTypesCategory,
  order: 3,
  imports: [LiveExampleComponent, DocsAdapterPropsComponent],
  prerequisites: [TextInputsPage, SelectionFieldsPage],
};

export default AdvancedControlsPage;
