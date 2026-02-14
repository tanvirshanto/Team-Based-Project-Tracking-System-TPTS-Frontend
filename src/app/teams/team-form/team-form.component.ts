import { Component, signal, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, ActivatedRoute, RouterLink } from '@angular/router';
import { TeamsService, TeamCreateDto } from '../../core/services/teams.service';
import { ResourcesService, Resource } from '../../core/services/resources.service';

@Component({
    selector: 'app-team-form',
    standalone: true,
    imports: [CommonModule, ReactiveFormsModule, RouterLink],
    template: `
    <div class="p-4 md:p-6 max-w-xl">
      <div class="flex items-center gap-4 mb-6">
        <a routerLink="/teams" class="text-slate-500 hover:text-slate-800 transition-colors flex items-center gap-1">
          <i class="pi pi-arrow-left text-xs"></i>
          <span>Team Dashboard</span>
        </a>
        <h1 class="text-2xl font-semibold text-slate-800">{{ isEdit() ? 'Edit Team' : 'Create Team' }}</h1>
      </div>

      <form [formGroup]="form" (ngSubmit)="onSubmit()" class="space-y-6 rounded-xl border border-slate-200 bg-white p-8 shadow-sm">
        <div>
          <label class="block text-sm font-semibold text-slate-700 mb-2">Team Name <span class="text-red-500">*</span></label>
          <input 
            formControlName="team_name" 
            type="text" 
            class="w-full rounded-lg border border-slate-300 px-4 py-2.5 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all outline-none" 
            placeholder="e.g. Frontend Squad" 
          />
          @if (form.get('team_name')?.invalid && form.get('team_name')?.touched) {
            <p class="text-red-500 text-xs mt-1 font-medium">Team name is required</p>
          }
        </div>
        
        <div>
          <label class="block text-sm font-semibold text-slate-700 mb-2">Team Manager</label>
          <select 
            formControlName="manager_id" 
            class="w-full rounded-lg border border-slate-300 px-4 py-2.5 focus:ring-2 focus:ring-blue-500 outline-none transition-all appearance-none bg-no-repeat bg-[right_1rem_center]"
            style="background-image: url('data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%22292.4%22%20height%3D%22292.4%22%3E%3Cpath%20fill%3D%22%2364748b%22%20d%3D%22M287%2069.4a17.6%2017.6%200%200%200-13-5.4H18.4c-5%200-9.3%201.8-12.9%205.4A17.6%2017.6%200%200%200%200%2082.2c0%205%201.8%209.3%205.4%2012.9l128%20127.9c3.6%203.6%207.8%205.4%2012.8%205.4s9.2-1.8%2012.8-5.4L287%2095c3.5-3.5%205.4-7.8%205.4-12.8%200-5-1.9-9.2-5.5-12.8z%22%2F%3E%3C%2Fsvg%3E'); background-size: .65em auto;"
          >
            <option [ngValue]="null">-- Select a manager --</option>
            @for (r of resources(); track r.id) {
              <option [ngValue]="r.id">{{ r.name }}</option>
            }
          </select>
          <p class="text-slate-500 text-[11px] mt-2 font-medium">Managers are selected from existing resources.</p>
        </div>
        
        @if (error(); as err) {
          <div class="p-3 rounded-lg bg-red-50 border border-red-100 text-red-600 text-sm font-medium">
            <i class="pi pi-exclamation-circle mr-2"></i>
            {{ err }}
          </div>
        }

        <div class="flex gap-4 pt-4 border-t border-slate-100">
          <button 
            type="submit" 
            [disabled]="form.invalid || saving()" 
            class="flex-1 rounded-lg bg-blue-600 text-white px-6 py-2.5 font-bold hover:bg-blue-700 disabled:opacity-50 transition-all shadow-md shadow-blue-500/20 active:scale-95"
          >
            @if (saving()) {
              <i class="pi pi-spin pi-spinner mr-2"></i>
              Saving...
            } @else {
              {{ isEdit() ? 'Update Team' : 'Create Team' }}
            }
          </button>
          <a 
            routerLink="/teams" 
            class="flex-1 rounded-lg border border-slate-300 px-6 py-2.5 text-slate-700 font-bold hover:bg-slate-50 transition-all text-center active:scale-95"
          >
            Cancel
          </a>
        </div>
      </form>
    </div>
  `,
})
export class TeamFormComponent implements OnInit {
    private fb = inject(FormBuilder);
    private teamsService = inject(TeamsService);
    private resourcesService = inject(ResourcesService);
    private router = inject(Router);
    private route = inject(ActivatedRoute);

    isEdit = signal(false);
    saving = signal(false);
    error = signal<string | null>(null);
    resources = signal<Resource[]>([]);

    form = this.fb.nonNullable.group({
        team_name: ['', Validators.required],
        manager_id: [null as number | null],
    });

    ngOnInit() {
        this.resourcesService.list().subscribe({
            next: (list) => this.resources.set(list),
            error: () => this.resources.set([]),
        });

        const id = this.route.snapshot.paramMap.get('id');
        if (id && id !== 'new') {
            this.isEdit.set(true);
            this.teamsService.get(+id).subscribe({
                next: (t) => {
                    this.form.patchValue({
                        team_name: t.team_name,
                        manager_id: t.manager_id ?? null,
                    });
                },
                error: () => this.router.navigate(['/teams']),
            });
        }
    }

    onSubmit() {
        if (this.form.invalid) return;
        const v = this.form.getRawValue();
        const payload: TeamCreateDto = {
            team_name: v.team_name,
            manager_id: v.manager_id ?? null,
        };

        this.saving.set(true);
        this.error.set(null);
        const id = this.route.snapshot.paramMap.get('id');
        const req = this.isEdit() && id ? this.teamsService.update(+id, payload) : this.teamsService.create(payload);

        req.subscribe({
            next: () => this.router.navigate(['/teams']),
            error: (err) => {
                this.saving.set(false);
                this.error.set(err.error?.error || 'Save failed');
            },
        });
    }
}
