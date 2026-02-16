import { Component, signal, OnInit, computed, inject, Optional } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators, FormControl } from '@angular/forms';
import { toSignal } from '@angular/core/rxjs-interop';
import { Router, ActivatedRoute, RouterLink } from '@angular/router';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
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
    MatDatepickerModule,
    MatDialogModule,
    MatIconModule,
    MatButtonModule
  ],
  template: `
    <div [class]="isDialog ? 'dialog-container' : 'p-4 md:p-6 max-w-xl'">
      <!-- Standalone Header -->
      <div class="flex items-center gap-4 mb-6" *ngIf="!isDialog">
        <a routerLink="/resources" class="text-slate-500 hover:text-slate-800 transition-colors">← Resource List</a>
        <h1 class="text-2xl font-semibold text-slate-800">{{ isEdit() ? 'Edit Resource' : 'Create Resource' }}</h1>
      </div>

      <!-- Dialog Header -->
      <div *ngIf="isDialog" class="flex items-center justify-between p-4 border-b border-slate-100 bg-slate-50/30">
        <h2 class="text-xl font-bold text-slate-800 m-0">{{ isEdit() ? 'Edit Resource' : 'Create Resource' }}</h2>
        <button type="button" mat-icon-button (click)="onCancel()" class="text-slate-400 hover:text-slate-600 transition-colors">
          <mat-icon class="scale-90">close</mat-icon>
        </button>
      </div>

      <form [formGroup]="form" (ngSubmit)="onSubmit()">
        <!-- Content Area -->
        @if (isDialog) {
          <mat-dialog-content class="!m-0 !p-6 space-y-6 dialog-content-wrapper">
            <ng-container *ngTemplateOutlet="formFields"></ng-container>
          </mat-dialog-content>
        } @else {
          <div class="space-y-6 rounded-xl border border-slate-200 bg-white p-8 shadow-sm">
            <ng-container *ngTemplateOutlet="formFields"></ng-container>
          </div>
        }

        <!-- Actions Area -->
        @if (isDialog) {
          <div class="p-4 border-t border-slate-100 bg-slate-50/50 flex justify-end gap-3 rounded-b-lg">
            <ng-container *ngTemplateOutlet="actionControls"></ng-container>
          </div>
        } @else {
          <div class="flex gap-3 pt-6 px-1">
            <ng-container *ngTemplateOutlet="actionControls"></ng-container>
          </div>
        }

        <!-- Shared Form Fields -->
        <ng-template #formFields>
          <div>
            <label class="block text-sm font-semibold text-slate-700 mb-2 uppercase tracking-wider text-[11px]">Name <span class="text-red-500">*</span></label>
            <input 
              formControlName="name" 
              type="text" 
              class="w-full rounded-lg border-0 bg-slate-100/80 px-4 py-3 text-sm focus:ring-2 focus:ring-blue-500 transition-all outline-none" 
              placeholder="Enter resource name" 
            />
            @if (form.get('name')?.invalid && form.get('name')?.touched) {
              <p class="text-red-500 text-[11px] font-bold mt-1 uppercase tracking-tight">Required</p>
            }
          </div>

          <div>
            <label class="block text-sm font-semibold text-slate-700 mb-2 uppercase tracking-wider text-[11px]">Team</label>
            <mat-form-field class="w-full no-subscript custom-field" appearance="fill">
              <mat-label>Select Team</mat-label>
              <input type="text" matInput [formControl]="teamSearchControl" [matAutocomplete]="auto">
              <mat-autocomplete #auto="matAutocomplete">
                <mat-option [value]="">-- No team --</mat-option>
                @for (t of filteredTeams(); track t.id) {
                  <mat-option [value]="t.team_name">{{ t.team_name }}</mat-option>
                }
              </mat-autocomplete>
              <mat-icon matSuffix class="text-slate-400 scale-75">groups</mat-icon>
            </mat-form-field>
          </div>

          <div>
            <label class="block text-sm font-semibold text-slate-700 mb-2 uppercase tracking-wider text-[11px]">Default Engaged Till</label>
            <mat-form-field appearance="fill" class="w-full no-subscript custom-field">
              <mat-label>Choose a date</mat-label>
              <input matInput [matDatepicker]="engagedPicker" formControlName="default_engaged_till">
              <mat-datepicker-toggle matIconSuffix [for]="engagedPicker"></mat-datepicker-toggle>
              <mat-datepicker #engagedPicker></mat-datepicker>
            </mat-form-field>
          </div>
        </ng-template>

        <!-- Shared Action Controls -->
        <ng-template #actionControls>
          @if (isDialog) {
            <button type="button" (click)="onCancel()" class="rounded-lg border border-slate-200 px-6 py-2.5 text-sm font-bold text-slate-600 hover:bg-slate-100 transition-all active:scale-95">Cancel</button>
          } @else {
            <a routerLink="/resources" class="rounded-lg border border-slate-200 px-6 py-2.5 text-sm font-bold text-slate-600 hover:bg-slate-100 transition-all active:scale-95">Cancel</a>
          }

          <button type="submit" [disabled]="form.invalid || saving()" class="rounded-lg bg-blue-600 text-white px-8 py-2.5 text-sm font-bold hover:bg-blue-700 disabled:opacity-50 transition-all active:scale-95 shadow-md shadow-blue-500/20">
            {{ saving() ? 'Saving...' : (isEdit() ? 'Update Resource' : 'Create Resource') }}
          </button>
        </ng-template>
      </form>
    </div>
  `,
  styles: [`
    :host ::ng-deep .no-subscript .mat-mdc-form-field-subscript-wrapper {
      display: none;
    }
    :host ::ng-deep .custom-field .mat-mdc-text-field-wrapper {
      background-color: rgb(241 245 249 / 0.8) !important;
      border-radius: 8px !important;
      padding-top: 8px !important;
    }
    :host ::ng-deep .custom-field .mat-mdc-form-field-focus-indicator {
      display: none;
    }
    :host ::ng-deep .custom-field .mdc-line-ripple {
      display: none;
    }
    .dialog-container {
      width: 100%;
      max-width: 500px;
      margin: 0 auto;
    }
    .dialog-content-wrapper {
      max-height: 65vh;
      overflow-y: auto;
      overflow-x: hidden;
    }
  `]
})
export class ResourceFormComponent implements OnInit {
  isEdit = signal(false);
  saving = signal(false);
  private toastr = inject(ToastrService);
  teams = signal<Team[]>([]);

  // Optional dialog injection
  private dialogRef = inject(MatDialogRef<ResourceFormComponent>, { optional: true });
  private dialogData = inject(MAT_DIALOG_DATA, { optional: true });
  isDialog = !!this.dialogRef;

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

    const resourceId = this.isDialog ? this.dialogData?.id : this.route.snapshot.paramMap.get('id');

    if (resourceId && resourceId !== 'new') {
      this.isEdit.set(true);
      this.resources.get(+resourceId).subscribe({
        next: (r) => {
          this.form.patchValue({
            name: r.name,
            team_id: r.team_id ?? null,
            default_engaged_till: r.default_engaged_till ? r.default_engaged_till.slice(0, 10) : '',
          });
          if (r.Team) {
            this.teamSearchControl.setValue(r.Team.team_name, { emitEvent: false });
          }
        },
        error: () => {
          if (!this.isDialog) this.router.navigate(['/resources']);
        },
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
      team_id: team ? team.id : null,
      default_engaged_till: v.default_engaged_till || null,
    };
    this.saving.set(true);

    const resourceId = this.isDialog ? this.dialogData?.id : this.route.snapshot.paramMap.get('id');
    const isEdit = !!resourceId && resourceId !== 'new';
    const req = isEdit ? this.resources.update(+resourceId, payload) : this.resources.create(payload);

    req.subscribe({
      next: () => {
        this.toastr.success(`Resource ${isEdit ? 'updated' : 'created'} successfully`, 'Success');
        if (this.isDialog) {
          this.dialogRef?.close(true);
        } else {
          this.router.navigate(['/resources']);
        }
      },
      error: (err) => {
        this.saving.set(false);
        this.toastr.error(err.error?.error || err.error?.message || 'Save failed', 'Error');
      },
    });
  }

  onCancel() {
    if (this.isDialog) {
      this.dialogRef?.close();
    }
  }
}
