import { Component, signal, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { ProjectsService, Project } from '../../core/services/projects.service';
import { ProjectMappingDialogComponent } from './project-mapping-dialog.component';

@Component({
  selector: 'app-project-view',
  standalone: true,
  imports: [CommonModule, RouterLink, MatButtonModule, MatIconModule, MatDialogModule],
  template: `
    <div class="p-4 md:p-6 max-w-5xl mx-auto">
      <!-- Header -->
      <div class="flex items-center justify-between mb-8">
        <div class="flex items-center gap-4">
          <a routerLink="/projects" class="text-slate-500 hover:text-slate-800 transition-colors">
            <mat-icon class="align-middle">arrow_back</mat-icon>
          </a>
          <h1 class="text-2xl font-bold text-slate-800">Project Details</h1>
        </div>
        <div class="flex gap-3">
          <a [routerLink]="['/projects', project()?.id, 'edit']" mat-stroked-button color="primary">
            <mat-icon>edit</mat-icon> Edit Project
          </a>
          <button (click)="onManageResources()" mat-flat-button color="primary">
            <mat-icon>group_add</mat-icon> Manage Resources
          </button>
        </div>
      </div>

      @if (loading()) {
        <div class="flex justify-center p-12">
          <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      } @else {
        @if (project(); as p) {
          <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <!-- Main Details -->
            <div class="lg:col-span-2 space-y-6">
              <div class="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                <div class="p-6 border-b border-slate-100 flex justify-between items-start">
                  <div>
                    <h2 class="text-xl font-bold text-slate-800 mb-1">{{ p.cr_name }}</h2>
                    <p class="text-sm text-slate-500 font-medium">Jira ID: {{ p.jira_id || 'N/A' }}</p>
                  </div>
                  <span class="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider" 
                        [ngClass]="{
                          'bg-blue-100 text-blue-700': p.current_status === 'Development Ongoing',
                          'bg-yellow-100 text-yellow-700': p.current_status === 'QA Ongoing',
                          'bg-green-100 text-green-700': p.current_status === 'Live',
                          'bg-slate-100 text-slate-700': !p.current_status
                        }">
                    {{ p.current_status || 'Draft' }}
                  </span>
                </div>
                <div class="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div class="space-y-4">
                    <div>
                      <label class="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1">Start Date</label>
                      <p class="text-slate-700 font-medium">{{ (p.start_date | date:'mediumDate') || 'Not set' }}</p>
                    </div>
                    <div>
                      <label class="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1">QA Release Date</label>
                      <p class="text-slate-700 font-medium">{{ (p.qa_release_date | date:'mediumDate') || 'Not set' }}</p>
                    </div>
                    <div>
                      <label class="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1">UAT Release Date</label>
                      <p class="text-slate-700 font-medium">{{ (p.uat_release_date | date:'mediumDate') || 'Not set' }}</p>
                    </div>
                  </div>
                  <div class="space-y-4">
                    <div>
                      <label class="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1">Live Release Date</label>
                      <p class="text-slate-700 font-medium text-green-600 font-bold">{{ (p.live_release_date | date:'mediumDate') || 'Not set' }}</p>
                    </div>
                    <div>
                      <label class="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1">Estimated Effort</label>
                      <p class="text-slate-700 font-medium">{{ p.estimated_effort || 0 }} Man-days</p>
                    </div>
                    <div>
                      <label class="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1">Actual Effort</label>
                      <p class="text-slate-700 font-medium">{{ p.actual_effort || 0 }} Man-days</p>
                    </div>
                  </div>
                </div>
                @if (p.particulars) {
                  <div class="p-6 bg-slate-50 border-t border-slate-100">
                    <label class="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-2">Particulars / Description</label>
                    <p class="text-slate-600 text-sm whitespace-pre-wrap">{{ p.particulars }}</p>
                  </div>
                }
              </div>
            </div>

            <!-- Allocated Resources -->
            <div class="lg:col-span-1">
              <div class="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden h-full">
                <div class="p-4 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center">
                  <h3 class="font-bold text-slate-800 text-sm flex items-center gap-2">
                    <mat-icon class="text-blue-600 scale-75">group</mat-icon>
                    Allocated Resources
                  </h3>
                  <span class="bg-blue-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                    {{ (p.Resources?.length || 0) }}
                  </span>
                </div>
                <div class="p-2">
                  @if (p.Resources && p.Resources.length > 0) {
                    <ul class="divide-y divide-slate-100">
                      @for (res of p.Resources; track res.id) {
                        <li class="p-3 hover:bg-slate-50 transition-colors flex items-center gap-3 group">
                          <div class="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 group-hover:bg-blue-50 group-hover:text-blue-600 transition-colors">
                            <mat-icon class="scale-75">person</mat-icon>
                          </div>
                          <div>
                            <p class="text-sm font-bold text-slate-800 leading-tight">{{ res.name }}</p>
                            <p class="text-[10px] text-slate-400 font-medium uppercase tracking-wider">
                              {{ res.Team?.team_name || 'No Team' }}
                            </p>
                          </div>
                        </li>
                      }
                    </ul>
                  } @else {
                    <div class="p-8 text-center">
                      <div class="bg-slate-100 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3">
                        <mat-icon class="text-slate-300">person_off</mat-icon>
                      </div>
                      <p class="text-xs text-slate-400 font-medium">No resources allocated yet.</p>
                      <button (click)="onManageResources()" class="mt-4 text-blue-600 text-xs font-bold hover:underline">
                        Assign Resources
                      </button>
                    </div>
                  }
                </div>
              </div>
            </div>
          </div>
        } @else {
          <div class="p-12 text-center bg-white rounded-xl border border-slate-200 shadow-sm">
            <p class="text-slate-500 font-medium">Project not found or failed to load.</p>
            <a routerLink="/projects" class="mt-4 inline-block text-blue-600 font-bold hover:underline">Back to List</a>
          </div>
        }
      }
    </div>
  `,
  styles: [`
    :host { display: block; }
  `]
})
export class ProjectViewComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private projectsService = inject(ProjectsService);
  private dialog = inject(MatDialog);

  project = signal<Project | null>(null);
  loading = signal(true);

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.loadProject(+id);
    }
  }

  loadProject(id: number) {
    this.loading.set(true);
    this.projectsService.get(id).subscribe({
      next: (data) => {
        this.project.set(data);
        this.loading.set(false);
      },
      error: (err) => {
        console.error('Failed to load project', err);
        this.loading.set(false);
      }
    });
  }

  onManageResources() {
    const p = this.project();
    if (!p) return;

    const dialogRef = this.dialog.open(ProjectMappingDialogComponent, {
      width: '800px',
      data: { projectId: p.id },
      disableClose: true
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.loadProject(p.id);
      }
    });
  }
}
