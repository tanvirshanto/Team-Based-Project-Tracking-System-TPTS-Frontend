import { Component, signal, OnInit, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators, FormControl } from '@angular/forms';
import { toSignal } from '@angular/core/rxjs-interop';
import { Router, ActivatedRoute, RouterLink } from '@angular/router';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { ToastrService } from 'ngx-toastr';
import { ProjectsService } from '../../core/services/projects.service';

const STATUS_OPTIONS = ['SRS Grooming', 'Dev Ongoing', 'QA Ongoing', 'Live'];

@Component({
  selector: 'app-project-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterLink,
    MatAutocompleteModule,
    MatInputModule,
    MatFormFieldModule,
    MatDatepickerModule
  ],
  template: `
    <div class="p-4 md:p-6 max-w-2xl">
      <div class="flex items-center gap-4 mb-6">
        <a [routerLink]="isEdit() ? ['/projects', route.snapshot.paramMap.get('id')] : ['/projects']" class="text-slate-500 hover:text-slate-800">
          ← {{ isEdit() ? 'Back to Details' : 'Project List' }}
        </a>
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
          <mat-form-field class="w-full" appearance="fill">
            <mat-label>Select Status</mat-label>
            <input type="text"
                   matInput
                   [formControl]="statusSearchControl"
                   [matAutocomplete]="auto">
            <mat-autocomplete #auto="matAutocomplete">
              @for (s of filteredStatusOptions(); track s) {
                <mat-option [value]="s">{{ s }}</mat-option>
              }
            </mat-autocomplete>
          </mat-form-field>
        </div>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <mat-form-field appearance="fill" class="w-full">
            <mat-label>Start Date</mat-label>
            <input matInput [matDatepicker]="startPicker" formControlName="start_date">
            <mat-datepicker-toggle matIconSuffix [for]="startPicker"></mat-datepicker-toggle>
            <mat-datepicker #startPicker></mat-datepicker>
          </mat-form-field>

          <mat-form-field appearance="fill" class="w-full">
            <mat-label>QA Release Date</mat-label>
            <input matInput [matDatepicker]="qaPicker" formControlName="qa_release_date">
            <mat-datepicker-toggle matIconSuffix [for]="qaPicker"></mat-datepicker-toggle>
            <mat-datepicker #qaPicker></mat-datepicker>
          </mat-form-field>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <mat-form-field appearance="fill" class="w-full">
            <mat-label>UAT Release Date</mat-label>
            <input matInput [matDatepicker]="uatPicker" formControlName="uat_release_date">
            <mat-datepicker-toggle matIconSuffix [for]="uatPicker"></mat-datepicker-toggle>
            <mat-datepicker #uatPicker></mat-datepicker>
          </mat-form-field>

          <mat-form-field appearance="fill" class="w-full">
            <mat-label>Live Release Date</mat-label>
            <input matInput [matDatepicker]="livePicker" formControlName="live_release_date">
            <mat-datepicker-toggle matIconSuffix [for]="livePicker"></mat-datepicker-toggle>
            <mat-datepicker #livePicker></mat-datepicker>
          </mat-form-field>
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
        <div class="flex gap-3 pt-2">
          <button type="submit" [disabled]="form.invalid || saving()" class="rounded-lg bg-blue-600 text-white px-4 py-2 font-medium hover:bg-blue-700 disabled:opacity-50">
            {{ saving() ? 'Saving...' : (isEdit() ? 'Update' : 'Create') }}
          </button>
          <a [routerLink]="isEdit() ? ['/projects', route.snapshot.paramMap.get('id')] : ['/projects']" class="rounded-lg border border-slate-300 px-4 py-2 text-slate-700 hover:bg-slate-50">Cancel</a>
        </div>
      </form>
    </div>
  `,
})
export class ProjectFormComponent implements OnInit {
  isEdit = signal(false);
  saving = signal(false);
  private toastr = inject(ToastrService);
  statusOptions = STATUS_OPTIONS;

  statusSearchControl = new FormControl('');
  private statusSearchSignal = toSignal(this.statusSearchControl.valueChanges, { initialValue: '' });

  filteredStatusOptions = computed(() => {
    const search = (this.statusSearchSignal() || '').toLowerCase();
    if (!search) return this.statusOptions;
    return this.statusOptions.filter(s => s.toLowerCase().includes(search));
  });

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
    protected route: ActivatedRoute
  ) { }

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
          this.statusSearchControl.setValue(p.current_status ?? '');
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
      current_status: this.statusSearchControl.value || undefined,
      start_date: v.start_date || null,
      qa_release_date: v.qa_release_date || null,
      uat_release_date: v.uat_release_date || null,
      live_release_date: v.live_release_date || null,
      estimated_effort: v.estimated_effort ?? null,
      actual_effort: v.actual_effort ?? null,
      particulars: v.particulars || null,
    };
    this.saving.set(true);
    const id = this.route.snapshot.paramMap.get('id');
    const isEdit = id && id !== 'new';
    const req = isEdit ? this.projects.update(+id, payload) : this.projects.create(payload);

    req.subscribe({
      next: () => {
        this.toastr.success(`Project ${isEdit ? 'updated' : 'created'} successfully`, 'Success');
        if (isEdit) {
          this.router.navigate(['/projects', id]);
        } else {
          this.router.navigate(['/projects']);
        }
      },
      error: (err) => {
        this.saving.set(false);
        this.toastr.error(err.error?.error || err.error?.message || 'Save failed', 'Error');
      },
    });
  }
}
