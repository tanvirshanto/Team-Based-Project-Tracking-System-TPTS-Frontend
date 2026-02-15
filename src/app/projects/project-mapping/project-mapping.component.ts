import { Component, signal, OnInit, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormControl } from '@angular/forms';
import { toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { ToastrService } from 'ngx-toastr';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { ProjectsService, Project } from '../../core/services/projects.service';
import { ResourcesService, Resource } from '../../core/services/resources.service';
import { AssignmentsService } from '../../core/services/assignments.service';
import { ConfirmDialogComponent } from '../../shared/confirm-dialog/confirm-dialog.component';

@Component({
    selector: 'app-project-mapping',
    standalone: true,
    imports: [
        CommonModule,
        FormsModule,
        ReactiveFormsModule,
        RouterLink,
        MatAutocompleteModule,
        MatInputModule,
        MatFormFieldModule,
        MatDialogModule,
        MatButtonModule,
        MatIconModule
    ],
    templateUrl: './project-mapping.component.html',
})
export class ProjectMappingComponent implements OnInit {
    project = signal<Project | null>(null);
    allResources = signal<Resource[]>([]);
    mappedResources = signal<Resource[]>([]);
    loading = signal(true);
    error = signal<string | null>(null);

    selectedResourceId = '';
    resourceSearchControl = new FormControl('');
    private searchSignal = toSignal(this.resourceSearchControl.valueChanges, { initialValue: '' });

    private dialog = inject(MatDialog);
    private toastr = inject(ToastrService);

    filteredResources = computed(() => {
        const search = (this.searchSignal() || '').toLowerCase();
        const available = this.availableResources;
        if (!search) return available;
        return available.filter(r => r.name.toLowerCase().includes(search));
    });

    displayResource(resource: Resource): string {
        return resource ? resource.name : '';
    }

    constructor(
        private route: ActivatedRoute,
        private projectsService: ProjectsService,
        private resourcesService: ResourcesService,
        private assignmentsService: AssignmentsService
    ) { }

    ngOnInit() {
        const id = this.route.snapshot.paramMap.get('id');
        if (id) {
            this.loadData(+id);
        }
    }

    loadData(projectId: number) {
        this.loading.set(true);

        // Load project details (includes mapped resources from backend we updated)
        this.projectsService.get(projectId).subscribe({
            next: (p) => {
                this.project.set(p);
                this.mappedResources.set(p.Resources || []);
                this.loading.set(false);
            },
            error: () => {
                this.error.set('Failed to load project details');
                this.loading.set(false);
            }
        });

        // Load ALL resources to choose from
        this.resourcesService.list().subscribe({
            next: (list) => this.allResources.set(list),
            error: () => console.error('Failed to load resources')
        });
    }

    get availableResources() {
        const mappedIds = this.mappedResources().map(r => r.id);
        return this.allResources().filter(r => !mappedIds.includes(r.id));
    }

    mapResource() {
        const projectId = this.project()?.id;
        const searchVal = this.resourceSearchControl.value;

        // Find the resource by name from the search input
        const resource = this.allResources().find(r => r.name === searchVal);
        const resourceId = resource?.id;

        if (!projectId || !resourceId) return;

        this.assignmentsService.mapResource(projectId, resourceId).subscribe({
            next: () => {
                this.resourceSearchControl.setValue('');
                this.loadData(projectId);
                this.toastr.success('Resource assigned successfully', 'Success');
            },
            error: (err) => {
                this.toastr.error(err.error?.error || 'Failed to map resource', 'Error');
            }
        });
    }

    unmapResource(resourceId: number) {
        const projectId = this.project()?.id;
        if (!projectId) return;

        const dialogRef = this.dialog.open(ConfirmDialogComponent, {
            width: '400px',
            data: {
                title: 'Remove Resource Mapping',
                message: 'Are you sure you want to remove this resource from the project?',
                confirmText: 'Remove',
                color: 'warn'
            }
        });

        dialogRef.afterClosed().subscribe(result => {
            if (result) {
                this.assignmentsService.unmapResource(projectId, resourceId).subscribe({
                    next: () => {
                        this.loadData(projectId);
                        this.toastr.success('Resource unassigned successfully', 'Success');
                    },
                    error: (err) => {
                        this.toastr.error(err.error?.error || 'Failed to unmap resource', 'Error');
                    }
                });
            }
        });
    }
}
