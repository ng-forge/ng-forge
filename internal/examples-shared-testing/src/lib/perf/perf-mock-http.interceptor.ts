import type { HttpEvent, HttpInterceptorFn } from '@angular/common/http';
import { HttpResponse } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { delay } from 'rxjs/operators';

const MOCK_DELAY_MS = 50;

const RESPONSES: Record<string, (url: URL) => unknown> = {
  '/mock-perf/exchange-rate': (url) => ({ rate: deterministicRate(url.searchParams.get('currency') || 'USD') }),
  '/mock-perf/permissions': (url) => ({ hide: ((url.searchParams.get('role') || '').length & 1) === 0 }),
  '/mock-perf/username-check': (url) => ({ available: ((url.searchParams.get('q') || '').length & 1) === 0 }),
  '/mock-perf/region-config': (url) => ({
    allowed: ((url.searchParams.get('region') || '').length & 1) === 0,
    discount: 0.05,
  }),
  '/mock-perf/tier-config': (url) => ({ multiplier: ((url.searchParams.get('tier') || '').length % 3) + 1 }),
  '/mock-perf/plan-features': () => ({ enabled: true, features: ['a', 'b', 'c'] }),
};

function deterministicRate(currency: string): number {
  let h = 0;
  for (let i = 0; i < currency.length; i++) h = (h * 31 + currency.charCodeAt(i)) | 0;
  return Math.abs(h % 1000) / 100 + 1;
}

export const perfMockHttpInterceptor: HttpInterceptorFn = (req, next): Observable<HttpEvent<unknown>> => {
  const url = new URL(req.url, 'http://localhost');
  if (!url.pathname.startsWith('/mock-perf/')) return next(req);

  const handler = RESPONSES[url.pathname];
  const body = handler ? handler(url) : { ok: true };
  return of(new HttpResponse({ status: 200, body }) as HttpEvent<unknown>).pipe(delay(MOCK_DELAY_MS));
};
