// Extend NgDocPage with prerequisites/related support (used by ng-doc builder at runtime)
import '@ng-doc/core';

declare module '@ng-doc/core' {
  interface NgDocPage {
    prerequisites?: NgDocPage[];
    related?: NgDocPage[];
  }
}
