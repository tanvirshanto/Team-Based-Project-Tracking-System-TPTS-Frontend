import { Component, signal, OnInit, computed, inject, Optional } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators, FormControl } from '@angular/forms';
import { toSignal } from '@angular/core/rxjs-interop';
import { Router, ActivatedRoute, RouterLink } from '@angular/router';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
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
    MatFormFieldModule,
    MatDialogModule,
    MatIconModule,
    MatButtonModule
  ],
  template: `
    <div [class]="isDialog ? 'dialog-container' : 'p-4 md:p-6 max-w-xl'">
      <!-- Standalone Header -->
      <div class="flex items-center gap-4 mb-6" *ngIf="!isDialog">
        <a routerLink="/teams" class="text-slate-500 hover:text-slate-800 transition-colors flex items-center gap-1">
          <i class="pi pi-arrow-left text-xs"></i>
          <span>Team Dashboard</span>
        </a>
        <h1 class="text-2xl font-semibold text-slate-800">{{ isEdit() ? 'Edit Team' : 'Create Team' }}</h1>
      </div>

      <!-- Dialog Header -->
      <div *ngIf="isDialog" class="flex items-center justify-between p-4 border-b border-slate-100 bg-slate-50/30">
        <h2 class="text-xl font-bold text-slate-800 m-0">{{ isEdit() ? 'Edit Team' : 'Create Team' }}</h2>
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
            <label class="block text-sm font-semibold text-slate-700 mb-2 uppercase tracking-wider text-[11px]">Team Name <span class="text-red-500">*</span></label>
            <input 
              formControlName="team_name" 
              type="text" 
              class="w-full rounded-lg border-0 bg-slate-100/80 px-4 py-3 text-sm focus:ring-2 focus:ring-blue-500 transition-all outline-none" 
              placeholder="e.g. Frontend Squad" 
            />
            @if (form.get('team_name')?.invalid && form.get('team_name')?.touched) {
              <p class="text-red-500 text-[11px] font-bold mt-1 uppercase tracking-tight">Required</p>
            }
          </div>
          
          <div>
            <label class="block text-sm font-semibold text-slate-700 mb-2 uppercase tracking-wider text-[11px]">Team Manager</label>
            <mat-form-field class="w-full no-subscript custom-field" appearance="fill">
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
              <mat-icon matSuffix class="text-slate-400 scale-75">person</mat-icon>
            </mat-form-field>
            <p class="text-slate-500 text-[10px] mt-2 font-medium italic">Managers are selected from existing resources.</p>
          </div>
        </ng-template>

        <!-- Shared Action Controls -->
        <ng-template #actionControls>
          @if (isDialog) {
            <button type="button" (click)="onCancel()" class="rounded-lg border border-slate-200 px-6 py-2.5 text-sm font-bold text-slate-600 hover:bg-slate-100 transition-all active:scale-95">Cancel</button>
          } @else {
            <a routerLink="/teams" class="rounded-lg border border-slate-200 px-6 py-2.5 text-sm font-bold text-slate-600 hover:bg-slate-100 transition-all active:scale-95">Cancel</a>
          }

          <button type="submit" [disabled]="form.invalid || saving()" class="rounded-lg bg-blue-600 text-white px-8 py-2.5 text-sm font-bold hover:bg-blue-700 disabled:opacity-50 transition-all active:scale-95 shadow-md shadow-blue-500/20">
            @if (saving()) {
              <i class="pi pi-spin pi-spinner mr-2"></i>
              Saving...
            } @else {
              {{ isEdit() ? 'Update Team' : 'Create Team' }}
            }
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

  // Optional dialog injection
  private dialogRef = inject(MatDialogRef<TeamFormComponent>, { optional: true });
  private dialogData = inject(MAT_DIALOG_DATA, { optional: true });
  isDialog = !!this.dialogRef;

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

    const id = this.isDialog ? this.dialogData?.id : this.route.snapshot.paramMap.get('id');
    if (id && id !== 'new') {
      this.isEdit.set(true);
      this.teamsService.get(+id).subscribe({
        next: (t) => {
          this.form.patchValue({
            team_name: t.team_name,
            manager_id: t.manager_id ?? null,
          });
          if (t.Manager) {
            this.managerSearchControl.setValue(t.Manager.name, { emitEvent: false });
          }
        },
        error: () => {
          if (!this.isDialog) this.router.navigate(['/teams']);
        },
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
    const id = this.isDialog ? this.dialogData?.id : this.route.snapshot.paramMap.get('id');
    const isEditMode = this.isEdit() && id;
    const req = isEditMode ? this.teamsService.update(+id, payload) : this.teamsService.create(payload);

    req.subscribe({
      next: () => {
        this.toastr.success(`Team ${isEditMode ? 'updated' : 'created'} successfully`, 'Success');
        if (this.isDialog) {
          this.dialogRef?.close(true);
        } else {
          this.router.navigate(['/teams']);
        }
      },
      error: (err) => {
        this.saving.set(false);
        this.toastr.error(err.error?.error || 'Save failed', 'Error');
      },
    });
  }

  onCancel() {
    if (this.isDialog) {
      this.dialogRef?.close();
    }
  }
}
