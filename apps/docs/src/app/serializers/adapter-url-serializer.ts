import { inject, Injectable } from '@angular/core';
import { DOCUMENT } from '@angular/common';
import { DefaultUrlSerializer, UrlTree } from '@angular/router';
import { isAdapterName } from '@ng-forge/sandbox-harness';

/**
 * URL serializer that transparently prepends the active adapter prefix to bare ng-doc paths.
 *
 * ng-doc generates absolute routes like `/getting-started` and `/schema-fields/field-types`.
 * With `/:adapter` routing these must become `/material/getting-started` etc. for Angular's
 * router to match them correctly — for navigation AND for `routerLinkActive` active-state detection.
 *
 * Reading the current adapter from `document.location.pathname` avoids a circular dependency:
 * injecting `ActiveAdapterService` → `Router` → `UrlSerializer` → cycle.
 */
@Injectable()
export class AdapterAwareUrlSerializer extends DefaultUrlSerializer {
  private readonly document = inject(DOCUMENT);

  override parse(url: string): UrlTree {
    return super.parse(this.normalize(url));
  }

  private normalize(url: string): string {
    if (!url || url === '/' || url.startsWith('/#')) return url;

    const path = url.split(/[?#]/)[0];
    const firstSegment = path.split('/')[1];

    // Already has a valid adapter prefix — leave it alone
    if (firstSegment && isAdapterName(firstSegment) && firstSegment !== 'core') {
      return url;
    }

    return `/${this.currentAdapter()}${url}`;
  }

  private currentAdapter(): string {
    const pathname = this.document.location?.pathname ?? '/';
    const seg = pathname.split('/')[1];
    return isAdapterName(seg) && seg !== 'core' ? seg : 'material';
  }
}
