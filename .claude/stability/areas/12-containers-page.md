# Area 12 — Containers: Page

## Key Files

- `packages/dynamic-forms/src/lib/fields/page/page-field.component.ts`
- `packages/dynamic-forms/src/lib/core/page-orchestrator/page-orchestrator.component.ts`
- `packages/dynamic-forms/src/lib/core/logic/non-field-logic-resolver.ts` (disableWhenPageInvalid)

## Scenarios to Check

- [ ] `currentPageValid` — does it check nested group/row fields or only top-level?
- [ ] `navigateToNextPage()` — validation guard present? Can be called programmatically without validation?
- [ ] `navigateToPreviousPage()` — does it skip hidden pages? Preserve values?
- [ ] `navigateToPage(index)` — bounds check, visibility check, hidden page handling
- [ ] Hidden page condition — does user get auto-redirected to next visible page?
- [ ] `currentPageIndex` clamping — when current page becomes hidden
- [ ] `disableWhenPageInvalid: true` — button-only or also guards programmatic navigation?
- [ ] Multi-page dirty/valid state — is page 1's state independent of page 2?
- [ ] Page visibility expressions — can they reference array item fields?
- [ ] Back navigation — values preserved? Validators re-run?
- [ ] First page hidden — does form start on first visible page?
- [ ] All pages hidden — what happens?
- [ ] Page field children rendering — lifecycle, lazy vs eager

## Known Findings

- **B2** (high) — `currentPageValid` only checks top-level fields; nested group/row fields invisible
- **B3** (high) — `navigateToNextPage()` has no validation guard; programmatic bypass
- **B15** (high) — Hidden page condition leaves user stranded; no auto-navigation
- **B24** (high) — `navigateToPage(index)` allows direct navigation to hidden page
