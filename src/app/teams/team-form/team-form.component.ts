import { Component, signal, OnInit, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators, FormControl } from '@angular/forms';
import { toSignal } from '@angular/core/rxjs-interop';
import { Router, ActivatedRoute, RouterLink } from '@angular/router';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { ToastrService } from 'ngx-toastr';
import { TeamsService, TeamCreateDto } from '../../core/services/teams.service';
import { ResourcesService, Resource } from '../../core/services/resources.service';

@Component({
  selector: 'app-team-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterLink,
    MatAutocompleteModule,
    MatInputModule,
    MatFormFieldModule
  ],
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
          <mat-form-field class="w-full" appearance="fill">
            <mat-label>Select Manager</mat-label>
            <input type="text"
                   matInput
                   [formControl]="managerSearchControl"
                   [matAutocomplete]="auto">
            <mat-autocomplete #auto="matAutocomplete">
              <mat-option [value]="">-- Select a manager --</mat-option>
              @for (r of filteredResources(); track r.id) {
                <mat-option [value]="r.name">{{ r.name }}</mat-option>
              }
            </mat-autocomplete>
          </mat-form-field>
          <p class="text-slate-500 text-[11px] mt-2 font-medium">Managers are selected from existing resources.</p>
        </div>
        

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
  private toastr = inject(ToastrService);
  resources = signal<Resource[]>([]);

  managerSearchControl = new FormControl('');
  private managerSearchSignal = toSignal(this.managerSearchControl.valueChanges, { initialValue: '' });

  filteredResources = computed(() => {
    const search = (this.managerSearchSignal() || '').toLowerCase();
    const list = this.resources();
    if (!search) return list;
    return list.filter(r => r.name.toLowerCase().includes(search));
  });

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
          if (t.Manager) {
            this.managerSearchControl.setValue(t.Manager.name);
          }
        },
        error: () => this.router.navigate(['/teams']),
      });
    }
  }

  onSubmit() {
    if (this.form.invalid) return;
    const v = this.form.getRawValue();
    const selectedManagerName = this.managerSearchControl.value;
    const manager = this.resources().find(r => r.name === selectedManagerName);

    const payload: TeamCreateDto = {
      team_name: v.team_name,
      manager_id: manager ? manager.id : null,
    };

    this.saving.set(true);
    const id = this.route.snapshot.paramMap.get('id');
    const isEditMode = this.isEdit() && id;
    const req = isEditMode ? this.teamsService.update(+id, payload) : this.teamsService.create(payload);

    req.subscribe({
      next: () => {
        this.toastr.success(`Team ${isEditMode ? 'updated' : 'created'} successfully`, 'Success');
        this.router.navigate(['/teams']);
      },
      error: (err) => {
        this.saving.set(false);
        this.toastr.error(err.error?.error || 'Save failed', 'Error');
      },
    });
  }
}
