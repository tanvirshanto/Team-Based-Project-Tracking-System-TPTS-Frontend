import { Component, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { ResourcesService } from '../../core/services/resources.service';
import { TeamsService, Team } from '../../core/services/teams.service';

@Component({
  selector: 'app-manager-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  template: `
    <div class="p-4 md:p-6 max-w-xl">
      <div class="flex items-center gap-4 mb-6">
        <a routerLink="/dashboard" class="text-slate-500 hover:text-slate-800">← Back</a>
        <h1 class="text-2xl font-semibold text-slate-800">Create Manager</h1>
      </div>
      <p class="text-slate-600 text-sm mb-6">Managers are created as resources and can be assigned as team managers.</p>

      <form [formGroup]="form" (ngSubmit)="onSubmit()" class="space-y-4 rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <div>
          <label class="block text-sm font-medium text-slate-700 mb-1">Name <span class="text-red-500">*</span></label>
          <input formControlName="name" type="text" class="w-full rounded-lg border border-slate-300 px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500" placeholder="Manager name" />
          @if (form.get('name')?.invalid && form.get('name')?.touched) {
            <p class="text-red-500 text-xs mt-1">Required</p>
          }
        </div>
        <div>
          <label class="block text-sm font-medium text-slate-700 mb-1">Team</label>
          <select formControlName="team_id" class="w-full rounded-lg border border-slate-300 px-3 py-2 focus:ring-2 focus:ring-blue-500">
            <option [ngValue]="null">-- No team --</option>
            @for (t of teams(); track t.id) {
              <option [ngValue]="t.id">{{ t.team_name }}</option>
            }
          </select>
        </div>
        <div>
          <label class="block text-sm font-medium text-slate-700 mb-1">Default Engaged Till</label>
          <input formControlName="default_engaged_till" type="date" class="w-full rounded-lg border border-slate-300 px-3 py-2 focus:ring-2 focus:ring-blue-500" />
        </div>
        @if (error(); as err) {
          <p class="text-red-500 text-sm">{{ err }}</p>
        }
        <div class="flex gap-3 pt-2">
          <button type="submit" [disabled]="form.invalid || saving()" class="rounded-lg bg-blue-600 text-white px-4 py-2 font-medium hover:bg-blue-700 disabled:opacity-50">
            {{ saving() ? 'Saving...' : 'Create Manager' }}
          </button>
          <a routerLink="/dashboard" class="rounded-lg border border-slate-300 px-4 py-2 text-slate-700 hover:bg-slate-50">Cancel</a>
        </div>
      </form>
    </div>
  `,
})
export class ManagerFormComponent implements OnInit {
  saving = signal(false);
  error = signal<string | null>(null);
  teams = signal<Team[]>([]);

  form = this.fb.nonNullable.group({
    name: ['', Validators.required],
    team_id: [null as number | null],
    default_engaged_till: [''],
  });

  constructor(
    private fb: FormBuilder,
    private resources: ResourcesService,
    private teamsService: TeamsService,
    private router: Router
  ) {}

  ngOnInit() {
    this.teamsService.getTeams().subscribe({
      next: (list) => this.teams.set(list),
      error: () => this.teams.set([]),
    });
  }

  onSubmit() {
    if (this.form.invalid) return;
    const v = this.form.getRawValue();
    const payload = {
      name: v.name,
      team_id: v.team_id ?? undefined,
      default_engaged_till: v.default_engaged_till || null,
    };
    this.saving.set(true);
    this.error.set(null);
    this.resources.create(payload).subscribe({
      next: () => this.router.navigate(['/resources']),
      error: (err) => {
        this.saving.set(false);
        this.error.set(err.error?.error || err.error?.message || 'Create failed');
      },
    });
  }
}
