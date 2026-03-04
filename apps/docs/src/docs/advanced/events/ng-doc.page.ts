import { NgDocPage } from '@ng-doc/core';
import AdvancedCategory from '../ng-doc.category';
import InstallationPage from '../../installation/ng-doc.page';

const EventsPage: NgDocPage = {
  title: 'Events',
  mdFile: './index.md',
  category: AdvancedCategory,
  order: 2,
  prerequisites: [InstallationPage],
  related: [],
};

export default EventsPage;
