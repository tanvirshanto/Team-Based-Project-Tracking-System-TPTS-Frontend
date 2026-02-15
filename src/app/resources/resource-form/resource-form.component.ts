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
import { ResourcesService } from '../../core/services/resources.service';
import { TeamsService, Team } from '../../core/services/teams.service';

@Component({
  selector: 'app-resource-form',
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
    <div class="p-4 md:p-6 max-w-xl">
      <div class="flex items-center gap-4 mb-6">
        <a routerLink="/resources" class="text-slate-500 hover:text-slate-800">← Resource List</a>
        <h1 class="text-2xl font-semibold text-slate-800">{{ isEdit() ? 'Edit Resource' : 'Create Resource' }}</h1>
      </div>

      <form [formGroup]="form" (ngSubmit)="onSubmit()" class="space-y-4 rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <div>
          <label class="block text-sm font-medium text-slate-700 mb-1">Name <span class="text-red-500">*</span></label>
          <input formControlName="name" type="text" class="w-full rounded-lg border border-slate-300 px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500" placeholder="Resource name" />
          @if (form.get('name')?.invalid && form.get('name')?.touched) {
            <p class="text-red-500 text-xs mt-1">Required</p>
          }
        </div>
        <div>
          <label class="block text-sm font-medium text-slate-700 mb-1">Team</label>
          <mat-form-field class="w-full" appearance="fill">
            <mat-label>Select Team</mat-label>
            <input type="text"
                   matInput
                   [formControl]="teamSearchControl"
                   [matAutocomplete]="auto">
            <mat-autocomplete #auto="matAutocomplete">
              <mat-option [value]="">-- No team --</mat-option>
              @for (t of filteredTeams(); track t.id) {
                <mat-option [value]="t.team_name">{{ t.team_name }}</mat-option>
              }
            </mat-autocomplete>
          </mat-form-field>
        </div>
        <div>
          <mat-form-field appearance="fill" class="w-full">
            <mat-label>Default Engaged Till</mat-label>
            <input matInput [matDatepicker]="engagedPicker" formControlName="default_engaged_till">
            <mat-datepicker-toggle matIconSuffix [for]="engagedPicker"></mat-datepicker-toggle>
            <mat-datepicker #engagedPicker></mat-datepicker>
          </mat-form-field>
        </div>
        <div class="flex gap-3 pt-2">
          <button type="submit" [disabled]="form.invalid || saving()" class="rounded-lg bg-blue-600 text-white px-4 py-2 font-medium hover:bg-blue-700 disabled:opacity-50">
            {{ saving() ? 'Saving...' : (isEdit() ? 'Update' : 'Create') }}
          </button>
          <a routerLink="/resources" class="rounded-lg border border-slate-300 px-4 py-2 text-slate-700 hover:bg-slate-50">Cancel</a>
        </div>
      </form>
    </div>
  `,
})
export class ResourceFormComponent implements OnInit {
  isEdit = signal(false);
  saving = signal(false);
  private toastr = inject(ToastrService);
  teams = signal<Team[]>([]);

  teamSearchControl = new FormControl('');
  private teamSearchSignal = toSignal(this.teamSearchControl.valueChanges, { initialValue: '' });

  filteredTeams = computed(() => {
    const search = (this.teamSearchSignal() || '').toLowerCase();
    const list = this.teams();
    if (!search) return list;
    return list.filter(t => t.team_name.toLowerCase().includes(search));
  });

  form = this.fb.nonNullable.group({
    name: ['', Validators.required],
    team_id: [null as number | null],
    default_engaged_till: [''],
  });

  constructor(
    private fb: FormBuilder,
    private resources: ResourcesService,
    private teamsService: TeamsService,
    private router: Router,
    private route: ActivatedRoute
  ) { }

  ngOnInit() {
    this.teamsService.getTeams().subscribe({
      next: (list) => this.teams.set(list),
      error: () => this.teams.set([]),
    });
    const id = this.route.snapshot.paramMap.get('id');
    if (id && id !== 'new') {
      this.isEdit.set(true);
      this.resources.get(+id).subscribe({
        next: (r) => {
          this.form.patchValue({
            name: r.name,
            team_id: r.team_id ?? null,
            default_engaged_till: r.default_engaged_till ? r.default_engaged_till.slice(0, 10) : '',
          });
          if (r.Team) {
            this.teamSearchControl.setValue(r.Team.team_name);
          }
        },
        error: () => this.router.navigate(['/resources']),
      });
    }
  }

  onSubmit() {
    if (this.form.invalid) return;
    const v = this.form.getRawValue();
    const selectedTeamName = this.teamSearchControl.value;
    const team = this.teams().find(t => t.team_name === selectedTeamName);

    const payload = {
      name: v.name,
      team_id: team ? team.id : undefined,
      default_engaged_till: v.default_engaged_till || null,
    };
    this.saving.set(true);
    const id = this.route.snapshot.paramMap.get('id');
    const isEdit = id && id !== 'new';
    const req = isEdit ? this.resources.update(+id, payload) : this.resources.create(payload);

    req.subscribe({
      next: () => {
        this.toastr.success(`Resource ${isEdit ? 'updated' : 'created'} successfully`, 'Success');
        this.router.navigate(['/resources']);
      },
      error: (err) => {
        this.saving.set(false);
        this.toastr.error(err.error?.error || err.error?.message || 'Save failed', 'Error');
      },
    });
  }
}
