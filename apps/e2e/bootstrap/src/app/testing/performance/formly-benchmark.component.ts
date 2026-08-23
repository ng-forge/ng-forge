import { ChangeDetectionStrategy, Component, computed, signal } from '@angular/core';
import { FormGroup, ReactiveFormsModule } from '@angular/forms';
import { FieldArrayType, FormlyModule, type FormlyFieldConfig } from '@ngx-formly/core';
import { FormlyBootstrapModule } from '@ngx-formly/bootstrap';
import {
  DIRECT_ENTRY_PAGE_COUNT,
  DIRECT_ENTRY_TOTAL_FIELDS,
  formlyDirectEntryFlat,
  formlyDirectEntryPages,
  formlyDirectEntryPlain,
} from '@ng-forge/examples-shared-testing/perf';

/**
 * Minimal `repeat` type. Formly ships no array type, so the head-to-head needs
 * one to match the ng-forge fixture's array fields.
 */
@Component({
  selector: 'bs-formly-repeat',
  imports: [FormlyModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @for (f of field.fieldGroup; track f.id) {
      <formly-field [field]="f" />
    }
  `,
})
export class FormlyRepeatTypeComponent extends FieldArrayType {}

/**
 * Formly counterpart of `DirectEntryBenchmarkComponent`. Renders only the active
 * page, matching ng-forge's paged mounting so neither side is charged for
 * controls the other isn't rendering.
 */
@Component({
  selector: 'bs-formly-benchmark',
  imports: [ReactiveFormsModule, FormlyModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <main class="benchmark" data-testid="formly-benchmark" [attr.data-total-fields]="totalFields" [attr.data-active-page-ready]="true">
      <div class="heading-slot">
        <h1 class="is-ready">{{ heading() }}</h1>
      </div>

      <nav aria-label="Benchmark page navigation">
        <button type="button" [disabled]="currentPage() === 0" (click)="previousPage()">Previous</button>
        <span aria-live="polite">Page {{ currentPage() + 1 }} of {{ pageCount }}</span>
        <button type="button" [disabled]="currentPage() === pageCount - 1" (click)="nextPage()">Next</button>
      </nav>

      <form [formGroup]="form">
        <formly-form [form]="form" [fields]="activeFields()" [model]="model" />
      </form>
    </main>
  `,
  styles: `
    :host {
      display: block;
    }

    .benchmark {
      width: min(100% - 2rem, 64rem);
      margin: 1rem auto;
    }
  `,
})
export class FormlyBenchmarkComponent {
  readonly totalFields = DIRECT_ENTRY_TOTAL_FIELDS;
  readonly pageCount = DIRECT_ENTRY_PAGE_COUNT;
  readonly currentPage = signal(0);

  readonly form = new FormGroup({});

  // One array item per page so both sides render 40 controls.
  readonly model: Record<string, unknown> = {
    field1: 'standard',
    field3: 'seed',
    field8: 10,
    field9: 0,
    ...Object.fromEntries(Array.from({ length: DIRECT_ENTRY_PAGE_COUNT }, (_, i) => [`page${i + 1}Items`, [{}]])),
  };

  // `?flat` instantiates all 240 controls at once. Formly couples control registration to
  // rendering — a hidden field gets no control — so matching ng-forge's whole-form model
  // means rendering every page, not hiding the inactive ones.
  private readonly params = new URL(location.href).searchParams;
  private readonly flat = this.params.has('flat');
  private readonly plain = this.params.has('plain');
  private readonly pages = formlyDirectEntryPages();
  private readonly flatFields = this.plain ? formlyDirectEntryPlain() : formlyDirectEntryFlat();
  readonly activeFields = computed<FormlyFieldConfig[]>(() => (this.flat || this.plain ? this.flatFields : this.pages[this.currentPage()]));

  readonly heading = computed(() => `Performance benchmark, page ${this.currentPage() + 1} of ${this.pageCount}`);

  /** Gated on page validity to match ng-forge's navigation semantics. */
  nextPage(): void {
    this.form.markAllAsTouched();
    if (this.form.invalid) return;
    this.currentPage.update((p) => Math.min(p + 1, this.pageCount - 1));
  }

  previousPage(): void {
    this.currentPage.update((p) => Math.max(p - 1, 0));
  }
}
