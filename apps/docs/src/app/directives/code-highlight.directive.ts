import { computed, Directive, inject, input, PLATFORM_ID } from '@angular/core';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';
import { isPlatformBrowser } from '@angular/common';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { combineLatest, from, of } from 'rxjs';
import { map, switchMap } from 'rxjs/operators';
import { highlightCode } from '../utils/shiki';

function escapeHtml(text: string): string {
  return text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

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

  /** Plain code block shown immediately while Shiki loads. */
  private readonly plainHtml = computed<SafeHtml>(() => {
    const code = this.code();
    if (!code) return this.sanitizer.bypassSecurityTrustHtml('');
    const lang = this.lang();
    return this.sanitizer.bypassSecurityTrustHtml(`<pre><code class="language-${lang}">${escapeHtml(code)}</code></pre>`);
  });

  /** Syntax-highlighted HTML — resolves asynchronously after Shiki loads. */
  private readonly highlighted$ = combineLatest([toObservable(this.code), toObservable(this.lang)]).pipe(
    switchMap(([code, lang]) => {
      if (!this.isBrowser || !code) {
        return of(null);
      }
      return from(highlightCode(code, lang));
    }),
    map((html) => (html ? this.sanitizer.bypassSecurityTrustHtml(html) : null)),
  );

  private readonly highlighted = toSignal(this.highlighted$, { initialValue: null });

  /** Show highlighted HTML when available, otherwise fall back to plain code. */
  readonly html = computed<SafeHtml>(() => this.highlighted() ?? this.plainHtml());
}
