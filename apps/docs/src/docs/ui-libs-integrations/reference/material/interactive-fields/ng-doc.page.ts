import { NgDocPage } from '@ng-doc/core';
import MaterialCategory from '../ng-doc.category';
import { ToggleIframeDemoComponent } from '../examples/toggle-iframe-demo.component';
import { SliderIframeDemoComponent } from '../examples/slider-iframe-demo.component';
import { DatepickerIframeDemoComponent } from '../examples/datepicker-iframe-demo.component';

const InteractiveFieldsPage: NgDocPage = {
  title: 'Interactive Fields',
  mdFile: './index.md',
  category: MaterialCategory,
  order: 30,
  demos: {
    ToggleIframeDemoComponent,
    SliderIframeDemoComponent,
    DatepickerIframeDemoComponent,
  },
};

export default InteractiveFieldsPage;
