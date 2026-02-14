import { Component, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, ActivatedRoute, RouterLink } from '@angular/router';
import { ProjectsService } from '../../core/services/projects.service';

const STATUS_OPTIONS = ['SRS Grooming', 'Dev Ongoing', 'QA Ongoing', 'Live'];

@Component({
  selector: 'app-project-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  template: `
    <div class="p-4 md:p-6 max-w-2xl">
      <div class="flex items-center gap-4 mb-6">
        <a routerLink="/projects" class="text-slate-500 hover:text-slate-800">← Project List</a>
        <h1 class="text-2xl font-semibold text-slate-800">{{ isEdit() ? 'Edit Project' : 'Create Project' }}</h1>
      </div>

      <form [formGroup]="form" (ngSubmit)="onSubmit()" class="space-y-4 rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <div>
          <label class="block text-sm font-medium text-slate-700 mb-1">CR Name <span class="text-red-500">*</span></label>
          <input formControlName="cr_name" type="text" class="w-full rounded-lg border border-slate-300 px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500" placeholder="CR Name" />
          @if (form.get('cr_name')?.invalid && form.get('cr_name')?.touched) {
            <p class="text-red-500 text-xs mt-1">Required</p>
          }
        </div>
        <div>
          <label class="block text-sm font-medium text-slate-700 mb-1">Jira ID</label>
          <input formControlName="jira_id" type="text" class="w-full rounded-lg border border-slate-300 px-3 py-2 focus:ring-2 focus:ring-blue-500" placeholder="e.g. JIRA-101" />
        </div>
        <div>
          <label class="block text-sm font-medium text-slate-700 mb-1">Current Status</label>
          <select formControlName="current_status" class="w-full rounded-lg border border-slate-300 px-3 py-2 focus:ring-2 focus:ring-blue-500">
            <option value="">-- Select --</option>
            @for (s of statusOptions; track s) {
              <option [value]="s">{{ s }}</option>
            }
          </select>
        </div>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label class="block text-sm font-medium text-slate-700 mb-1">Start Date</label>
            <input formControlName="start_date" type="date" class="w-full rounded-lg border border-slate-300 px-3 py-2 focus:ring-2 focus:ring-blue-500" />
          </div>
          <div>
            <label class="block text-sm font-medium text-slate-700 mb-1">QA Release Date</label>
            <input formControlName="qa_release_date" type="date" class="w-full rounded-lg border border-slate-300 px-3 py-2 focus:ring-2 focus:ring-blue-500" />
          </div>
        </div>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label class="block text-sm font-medium text-slate-700 mb-1">UAT Release Date</label>
            <input formControlName="uat_release_date" type="date" class="w-full rounded-lg border border-slate-300 px-3 py-2 focus:ring-2 focus:ring-blue-500" />
          </div>
          <div>
            <label class="block text-sm font-medium text-slate-700 mb-1">Live Release Date</label>
            <input formControlName="live_release_date" type="date" class="w-full rounded-lg border border-slate-300 px-3 py-2 focus:ring-2 focus:ring-blue-500" />
          </div>
        </div>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label class="block text-sm font-medium text-slate-700 mb-1">Estimated Effort</label>
            <input formControlName="estimated_effort" type="number" min="0" step="0.5" class="w-full rounded-lg border border-slate-300 px-3 py-2 focus:ring-2 focus:ring-blue-500" />
          </div>
          <div>
            <label class="block text-sm font-medium text-slate-700 mb-1">Actual Effort</label>
            <input formControlName="actual_effort" type="number" min="0" step="0.5" class="w-full rounded-lg border border-slate-300 px-3 py-2 focus:ring-2 focus:ring-blue-500" />
          </div>
        </div>
        <div>
          <label class="block text-sm font-medium text-slate-700 mb-1">Particulars</label>
          <textarea formControlName="particulars" rows="3" class="w-full rounded-lg border border-slate-300 px-3 py-2 focus:ring-2 focus:ring-blue-500" placeholder="Details..."></textarea>
        </div>
        @if (error(); as err) {
          <p class="text-red-500 text-sm">{{ err }}</p>
        }
        <div class="flex gap-3 pt-2">
          <button type="submit" [disabled]="form.invalid || saving()" class="rounded-lg bg-blue-600 text-white px-4 py-2 font-medium hover:bg-blue-700 disabled:opacity-50">
            {{ saving() ? 'Saving...' : (isEdit() ? 'Update' : 'Create') }}
          </button>
          <a routerLink="/projects" class="rounded-lg border border-slate-300 px-4 py-2 text-slate-700 hover:bg-slate-50">Cancel</a>
        </div>
      </form>
    </div>
  `,
})
export class ProjectFormComponent implements OnInit {
  isEdit = signal(false);
  saving = signal(false);
  error = signal<string | null>(null);
  statusOptions = STATUS_OPTIONS;

  form = this.fb.nonNullable.group({
    cr_name: ['', Validators.required],
    jira_id: [''],
    current_status: [''],
    start_date: [''],
    qa_release_date: [''],
    uat_release_date: [''],
    live_release_date: [''],
    estimated_effort: [null as number | null],
    actual_effort: [null as number | null],
    particulars: [''],
  });

  constructor(
    private fb: FormBuilder,
    private projects: ProjectsService,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    if (id && id !== 'new') {
      this.isEdit.set(true);
      this.projects.get(+id).subscribe({
        next: (p) => {
          this.form.patchValue({
            cr_name: p.cr_name,
            jira_id: p.jira_id ?? '',
            current_status: p.current_status ?? '',
            start_date: p.start_date ? p.start_date.slice(0, 10) : '',
            qa_release_date: p.qa_release_date ? p.qa_release_date.slice(0, 10) : '',
            uat_release_date: p.uat_release_date ? p.uat_release_date.slice(0, 10) : '',
            live_release_date: p.live_release_date ? p.live_release_date.slice(0, 10) : '',
            estimated_effort: p.estimated_effort ?? null,
            actual_effort: p.actual_effort ?? null,
            particulars: p.particulars ?? '',
          });
        },
        error: () => this.router.navigate(['/projects']),
      });
    }
  }

  onSubmit() {
    if (this.form.invalid) return;
    const v = this.form.getRawValue();
    const payload = {
      cr_name: v.cr_name,
      jira_id: v.jira_id || undefined,
      current_status: v.current_status || undefined,
      start_date: v.start_date || null,
      qa_release_date: v.qa_release_date || null,
      uat_release_date: v.uat_release_date || null,
      live_release_date: v.live_release_date || null,
      estimated_effort: v.estimated_effort ?? null,
      actual_effort: v.actual_effort ?? null,
      particulars: v.particulars || null,
    };
    this.saving.set(true);
    this.error.set(null);
    const id = this.route.snapshot.paramMap.get('id');
    const req = id && id !== 'new' ? this.projects.update(+id, payload) : this.projects.create(payload);
    req.subscribe({
      next: () => this.router.navigate(['/projects']),
      error: (err) => {
        this.saving.set(false);
        this.error.set(err.error?.error || err.error?.message || 'Save failed');
      },
    });
  }
}
