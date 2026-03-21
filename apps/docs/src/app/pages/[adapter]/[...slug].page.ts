import { RouteMeta } from '@analogjs/router';
import { contentRedirectGuard } from '../../guards/content-redirect.guard';
import { DocPageComponent } from '../doc-page/doc-page.component';

export const routeMeta: RouteMeta = {
  canActivate: [contentRedirectGuard],
};

export default DocPageComponent;
