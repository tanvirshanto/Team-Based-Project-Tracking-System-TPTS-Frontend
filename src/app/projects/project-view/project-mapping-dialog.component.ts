import { Component, signal, OnInit, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormControl } from '@angular/forms';
import { toSignal } from '@angular/core/rxjs-interop';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { ToastrService } from 'ngx-toastr';
import { ProjectsService, Project } from '../../core/services/projects.service';
import { ResourcesService, Resource } from '../../core/services/resources.service';
import { AssignmentsService } from '../../core/services/assignments.service';

@Component({
    selector: 'app-project-mapping-dialog',
    standalone: true,
    imports: [
        CommonModule,
        FormsModule,
        ReactiveFormsModule,
        MatAutocompleteModule,
        MatInputModule,
        MatFormFieldModule,
        MatDialogModule,
        MatButtonModule,
        MatIconModule
    ],
    template: `
    <div class="flex items-center justify-between p-4 border-b border-slate-200">
      <h2 class="text-xl font-semibold text-slate-800 m-0 flex items-center gap-2">
        <mat-icon class="text-blue-600">group_add</mat-icon>
        Resource Mapping: {{ project()?.cr_name }}
      </h2>
      <button mat-icon-button (click)="close()" class="text-slate-400">
        <mat-icon>close</mat-icon>
      </button>
    </div>

    <mat-dialog-content class="!p-6 !pt-4 min-w-[600px] max-h-[80vh]">
      @if (loading()) {
        <div class="p-8 text-center text-slate-500">Loading details...</div>
      } @else {
        <!-- Mapping Section -->
        <div class="grid grid-cols-1 md:grid-cols-3 gap-6 pt-2">
          <!-- Add Mapping Form -->
          <div class="md:col-span-1">
            <div class="rounded-xl border border-slate-200 bg-slate-50/50 p-4">
              <h3 class="text-sm font-semibold text-slate-700 mb-3 uppercase tracking-wider">Assign New</h3>
              <div class="space-y-4">
                <mat-form-field class="w-full" appearance="fill">
                  <mat-label>Search Resource</mat-label>
                  <input type="text" placeholder="e.g. John Doe" aria-label="Resource" matInput
                    [formControl]="resourceSearchControl" [matAutocomplete]="auto">
                  <mat-autocomplete #auto="matAutocomplete">
                    @for (r of filteredResources(); track r.id) {
                      <mat-option [value]="r.name">
                        {{ r.name }}
                      </mat-option>
                    }
                  </mat-autocomplete>
                </mat-form-field>

                <button mat-flat-button color="primary" (click)="mapResource()" 
                  [disabled]="!resourceSearchControl.value"
                  class="w-full !rounded-lg py-2 font-semibold shadow-sm">
                  Assign to Project
                </button>
              </div>
            </div>
          </div>

          <!-- Current Mappings Table -->
          <div class="md:col-span-2">
            <div class="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden flex flex-col h-full">
              <div class="p-3 border-b border-slate-200 bg-slate-50/50">
                <h3 class="text-sm font-semibold text-slate-700 uppercase tracking-wider">Assigned Resources</h3>
              </div>
              <div class="overflow-y-auto max-h-[400px]">
                <table class="w-full text-sm">
                  <thead class="bg-slate-50 border-b border-slate-200 sticky top-0 z-10">
                    <tr class="text-left text-slate-500 font-medium h-10">
                      <th class="px-4">Name</th>
                      <th class="px-4">Current Team</th>
                      <th class="px-4 w-16 text-center">Action</th>
                    </tr>
                  </thead>
                  <tbody class="divide-y divide-slate-100">
                    @for (r of mappedResources(); track r.id) {
                      <tr class="hover:bg-slate-50 transition-colors h-12">
                        <td class="px-4 font-medium text-slate-800">{{ r.name }}</td>
                        <td class="px-4 text-slate-600">{{ r.Team?.team_name || '–' }}</td>
                        <td class="px-4 text-center">
                          <button mat-icon-button color="warn" class="scale-90" (click)="unmapResource(r.id)" title="Remove mapping">
                            <mat-icon>delete</mat-icon>
                          </button>
                        </td>
                      </tr>
                    }
                    @if (mappedResources().length === 0) {
                      <tr>
                        <td colspan="3" class="p-8 text-center text-slate-400 italic">No resources assigned yet.</td>
                      </tr>
                    }
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      }
    </mat-dialog-content>

    <div class="p-4 border-t border-slate-200 flex justify-end bg-slate-50">
      <button mat-button (click)="close()" class="!rounded-lg px-6 font-medium text-slate-600">Close</button>
    </div>
  `,
    styles: [`
    :host { display: block; }
    mat-dialog-content { min-height: 400px; }
  `]
})
export class ProjectMappingDialogComponent implements OnInit {
    project = signal<Project | null>(null);
    allResources = signal<Resource[]>([]);
    mappedResources = signal<Resource[]>([]);
    loading = signal(true);

    resourceSearchControl = new FormControl('');
    private searchSignal = toSignal(this.resourceSearchControl.valueChanges, { initialValue: '' });

    private dialogRef = inject(MatDialogRef<ProjectMappingDialogComponent>);
    private data = inject(MAT_DIALOG_DATA) as { projectId: number };
    private projectsService = inject(ProjectsService);
    private resourcesService = inject(ResourcesService);
    private assignmentsService = inject(AssignmentsService);
    private toastr = inject(ToastrService);

    filteredResources = computed(() => {
        const search = (this.searchSignal() || '').toLowerCase();
        const available = this.availableResources;
        if (!search) return available;
        return available.filter(r => r.name.toLowerCase().includes(search));
    });

    get availableResources() {
        const mappedIds = this.mappedResources().map(r => r.id);
        return this.allResources().filter(r => !mappedIds.includes(r.id));
    }

    ngOnInit() {
        if (this.data.projectId) {
            this.loadData(this.data.projectId);
        }
    }

    loadData(projectId: number) {
        this.loading.set(true);

        this.projectsService.get(projectId).subscribe({
            next: (p) => {
                this.project.set(p);
                this.mappedResources.set(p.Resources || []);
                this.loading.set(false);
            },
            error: () => {
                this.toastr.error('Failed to load project details');
                this.loading.set(false);
            }
        });

        this.resourcesService.list().subscribe({
            next: (list) => this.allResources.set(list),
            error: () => console.error('Failed to load resources')
        });
    }

    mapResource() {
        const projectId = this.data.projectId;
        const searchVal = this.resourceSearchControl.value;
        const resource = this.allResources().find(r => r.name === searchVal);
        const resourceId = resource?.id;

        if (!projectId || !resourceId) {
            this.toastr.warning('Please select a valid resource');
            return;
        }

        this.assignmentsService.mapResource(projectId, resourceId).subscribe({
            next: () => {
                this.resourceSearchControl.setValue('');
                this.loadData(projectId);
                this.toastr.success('Resource assigned successfully');
            },
            error: (err) => {
                this.toastr.error(err.error?.error || 'Failed to map resource');
            }
        });
    }

    unmapResource(resourceId: number) {
        const projectId = this.data.projectId;
        if (!projectId) return;

        this.assignmentsService.unmapResource(projectId, resourceId).subscribe({
            next: () => {
                this.loadData(projectId);
                this.toastr.success('Resource removed successfully');
            },
            error: (err) => {
                this.toastr.error(err.error?.error || 'Failed to unmap resource');
            }
        });
    }

    close() {
        this.dialogRef.close(true);
    }
}
