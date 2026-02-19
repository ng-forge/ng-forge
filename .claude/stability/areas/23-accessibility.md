# Area 23 — Accessibility (Cross-Cutting)

## Key Files

- All field components across all 4 UI adapters
- `packages/dynamic-forms/src/lib/core/page-orchestrator/page-orchestrator.component.ts`
- `packages/dynamic-forms/src/lib/fields/array/array-field.component.ts`
- `packages/dynamic-forms-*/src/lib/utils/create-aria-described-by.ts` (each adapter)

## Scenarios to Check

- [ ] Focus management on page navigation — does focus move to first field on new page?
- [ ] Focus management on submit with invalid fields — does focus move to first invalid field?
- [ ] Focus management on array item add — does focus move to new item?
- [ ] Focus management on array item remove — where does focus go?
- [ ] `aria-live` regions — any present for dynamic content changes?
- [ ] `aria-hidden` on hidden pages — correctly applied?
- [ ] `aria-describedby` — create-aria-described-by utility correctness
- [ ] Error messages — associated with fields via `aria-describedby` or `aria-errormessage`?
- [ ] Required fields — `aria-required` attribute present?
- [ ] Disabled fields — `aria-disabled` vs native `disabled` attribute?
- [ ] Readonly fields — `aria-readonly` attribute?
- [ ] Keyboard navigation — tab order correct across containers, pages, arrays?
- [ ] Screen reader announcements — form status changes, validation errors
- [ ] Color contrast — delegated to UI adapters? Any library-level styles?

## Known Findings

- No focus management anywhere in the library. Page navigation, first-invalid-field on submit, array item add/remove — zero focus moves. No `aria-live` regions. Fully delegated to consuming applications with no guidance.
