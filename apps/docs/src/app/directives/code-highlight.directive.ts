import { Directive, inject, input, PLATFORM_ID } from '@angular/core';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';
import { isPlatformBrowser } from '@angular/common';
import { DomSanitizer } from '@angular/platform-browser';
import { combineLatest, from, of } from 'rxjs';
import { map, switchMap } from 'rxjs/operators';
import { highlightCode } from '../utils/shiki';

@Directive({
  selector: '[codeHighlight]',
  host: {
    '[innerHTML]': 'html()',
    '[style.--forge-code-bg]': '"transparent"',
  },
})
export class CodeHighlightDirective {
  private readonly sanitizer = inject(DomSanitizer);
  private readonly isBrowser = isPlatformBrowser(inject(PLATFORM_ID));

  readonly code = input.required<string>({ alias: 'codeHighlight' });
  readonly lang = input<'typescript' | 'json' | 'bash' | 'scss'>('typescript');

  private readonly highlighted$ = combineLatest([toObservable(this.code), toObservable(this.lang)]).pipe(
    switchMap(([code, lang]) => {
      if (!this.isBrowser || !code) {
        return of('');
      }
      return from(highlightCode(code, lang));
    }),
    map((html) => this.sanitizer.bypassSecurityTrustHtml(html)),
  );

  readonly html = toSignal(this.highlighted$, { initialValue: this.sanitizer.bypassSecurityTrustHtml('') });
}
