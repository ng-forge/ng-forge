import { RouteMeta } from '@analogjs/router';
import { adapterGuard } from '../guards/adapter.guard';
import { DocsLayoutComponent } from '../layout/docs-layout.component';

export const routeMeta: RouteMeta = {
  canActivate: [adapterGuard],
};

export default DocsLayoutComponent;
