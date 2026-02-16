import { Component, signal, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { ToastrService } from 'ngx-toastr';
import { ProjectsService } from '../../core/services/projects.service';

@Component({
    selector: 'app-project-activity-form',
    standalone: true,
    imports: [
        CommonModule,
        ReactiveFormsModule,
        MatInputModule,
        MatFormFieldModule,
        MatDialogModule,
        MatIconModule,
        MatButtonModule
    ],
    template: `
    <div class="dialog-container">
      <div class="flex items-center justify-between p-4 border-b border-slate-100 bg-slate-50/30">
        <h2 class="text-xl font-bold text-slate-800 m-0">{{ isEdit() ? 'Edit Activity' : 'Add Activity' }}</h2>
        <button type="button" mat-icon-button (click)="onCancel()" class="text-slate-400 hover:text-slate-600 transition-colors">
          <mat-icon class="scale-90">close</mat-icon>
        </button>
      </div>

      <form [formGroup]="form" (ngSubmit)="onSubmit()">
        <mat-dialog-content class="!m-0 !p-6 space-y-6 dialog-content-wrapper">
          <div>
            <label class="block text-sm font-semibold text-slate-700 mb-2 uppercase tracking-wider text-[11px]">Title <span class="text-red-500">*</span></label>
            <input 
              formControlName="title" 
              type="text" 
              class="w-full rounded-lg border-0 bg-slate-100/80 px-4 py-3 text-sm focus:ring-2 focus:ring-blue-500 transition-all outline-none" 
              placeholder="Enter activity title" 
            />
            @if (form.get('title')?.invalid && form.get('title')?.touched) {
              <p class="text-red-500 text-[11px] font-bold mt-1 uppercase tracking-tight">Required</p>
            }
          </div>

          <div>
            <label class="block text-sm font-semibold text-slate-700 mb-2 uppercase tracking-wider text-[11px]">Description <span class="text-red-500">*</span></label>
            <textarea 
              formControlName="description" 
              rows="4"
              class="w-full rounded-lg border-0 bg-slate-100/80 px-4 py-3 text-sm focus:ring-2 focus:ring-blue-500 transition-all outline-none resize-none" 
              placeholder="Enter activity description"
            ></textarea>
            @if (form.get('description')?.invalid && form.get('description')?.touched) {
              <p class="text-red-500 text-[11px] font-bold mt-1 uppercase tracking-tight">Required</p>
            }
          </div>
        </mat-dialog-content>

        <div class="p-4 border-t border-slate-100 bg-slate-50/50 flex justify-end gap-3 rounded-b-lg">
          <button type="button" (click)="onCancel()" class="rounded-lg border border-slate-200 px-6 py-2.5 text-sm font-bold text-slate-600 hover:bg-slate-100 transition-all active:scale-95">Cancel</button>
          <button type="submit" [disabled]="form.invalid || saving()" class="rounded-lg bg-blue-600 text-white px-8 py-2.5 text-sm font-bold hover:bg-blue-700 disabled:opacity-50 transition-all active:scale-95 shadow-md shadow-blue-500/20">
            {{ saving() ? 'Saving...' : (isEdit() ? 'Update Activity' : 'Add Activity') }}
          </button>
        </div>
      </form>
    </div>
  `,
    styles: [`
    .dialog-container {
      width: 100%;
      max-width: 500px;
    }
    .dialog-content-wrapper {
      max-height: 60vh;
      overflow-y: auto;
    }
  `]
})
export class ProjectActivityFormComponent implements OnInit {
    isEdit = signal(false);
    saving = signal(false);
    private toastr = inject(ToastrService);
    private dialogRef = inject(MatDialogRef<ProjectActivityFormComponent>);
    private dialogData = inject(MAT_DIALOG_DATA);
    private projectsService = inject(ProjectsService);
    private fb = inject(FormBuilder);

    form = this.fb.nonNullable.group({
        title: ['', Validators.required],
        description: ['', Validators.required],
    });

    ngOnInit() {
        if (this.dialogData?.activity) {
            this.isEdit.set(true);
            this.form.patchValue({
                title: this.dialogData.activity.title,
                description: this.dialogData.activity.description,
            });
        }
    }

    onSubmit() {
        if (this.form.invalid) return;
        this.saving.set(true);
        const v = this.form.getRawValue();
        const projectId = this.dialogData.projectId;
        const activityId = this.dialogData.activity?.id;

        const payload = {
            ...v,
            project_id: projectId
        };

        const req = this.isEdit()
            ? this.projectsService.updateActivity(activityId, v)
            : this.projectsService.addActivity(payload);

        req.subscribe({
            next: () => {
                this.toastr.success(`Activity ${this.isEdit() ? 'updated' : 'added'} successfully`);
                this.dialogRef.close(true);
            },
            error: (err) => {
                this.saving.set(false);
                this.toastr.error(err.error?.error || 'Failed to save activity');
            }
        });
    }

    onCancel() {
        this.dialogRef.close();
    }
}
