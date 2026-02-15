import { Component, signal, OnInit, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { ProjectsService, Project } from '../../core/services/projects.service';
import { ConfirmDialogComponent } from '../../shared/confirm-dialog/confirm-dialog.component';

@Component({
  selector: 'app-project-list',
  standalone: true,
  imports: [CommonModule, RouterLink, MatIconModule, MatButtonModule, MatDialogModule],
  template: `
    <div class="p-4 md:p-6">
      <div class="flex flex-wrap items-center justify-between gap-4 mb-6">
        <h1 class="text-2xl font-semibold text-slate-800">Project List</h1>
        <a routerLink="/projects/new" class="rounded-lg bg-blue-600 text-white px-4 py-2 font-medium hover:bg-blue-700">Create Project</a>
      </div>

      <div class="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden">
        @if (loading()) {
          <div class="p-8 text-center text-slate-500">Loading...</div>
        } @else {
          <div class="overflow-x-auto">
            <table class="w-full text-sm">
              <thead class="bg-slate-100 border-b border-slate-200">
                <tr class="text-left text-slate-600 font-medium">
                  <th class="p-3">CR Name</th>
                  <th class="p-3">Jira ID</th>
                  <th class="p-3">Status</th>
                  <th class="p-3">Responsible Dev</th>
                  <th class="p-3">Start</th>
                  <th class="p-3">QA Release</th>
                  <th class="p-3">UAT Release</th>
                  <th class="p-3">Live Release</th>
                  <th class="p-3">Est. Effort</th>
                  <th class="p-3">Actual Effort</th>
                  <th class="p-3 w-48 text-center">Actions</th>
                </tr>
              </thead>
              <tbody>
                @for (p of paginatedProjects(); track p.id) {
                  <tr class="border-b border-slate-100 hover:bg-slate-50">
                    <td class="p-3 font-medium text-slate-800">{{ p.cr_name }}</td>
                    <td class="p-3 text-slate-600">{{ p.jira_id || '–' }}</td>
                    <td class="p-3">
                      <span class="rounded px-2 py-0.5 text-xs font-medium" [class]="statusClass(p.current_status)">{{ p.current_status || '–' }}</span>
                    </td>
                    <td class="p-3 text-slate-600">
                      {{ getResponsibleDevs(p) }}
                    </td>
                    <td class="p-3 text-slate-600">{{ p.start_date ? (p.start_date | date:'shortDate') : '–' }}</td>
                    <td class="p-3 text-slate-600">{{ p.qa_release_date ? (p.qa_release_date | date:'shortDate') : '–' }}</td>
                    <td class="p-3 text-slate-600">{{ p.uat_release_date ? (p.uat_release_date | date:'shortDate') : '–' }}</td>
                    <td class="p-3 text-slate-600">{{ p.live_release_date ? (p.live_release_date | date:'shortDate') : '–' }}</td>
                    <td class="p-3 text-slate-600">{{ p.estimated_effort ?? '–' }}</td>
                    <td class="p-3 text-slate-600">{{ p.actual_effort ?? '–' }}</td>
                    <td class="p-3 flex justify-center gap-1">
                      <a [routerLink]="['/projects', p.id]" mat-icon-button color="primary" title="Mapping and Update Details">
                        <mat-icon>settings</mat-icon>
                      </a>
                      <button (click)="onDelete(p.id)" mat-icon-button color="warn" title="Delete Project">
                        <mat-icon>delete</mat-icon>
                      </button>
                    </td>
                  </tr>
                }
              </tbody>
            </table>
          </div>

          <!-- Pagination -->
          @if (projects().length > 0) {
            <div class="px-4 py-3 border-t border-slate-200 bg-slate-50 flex items-center justify-between gap-4 flex-wrap">
              <div class="text-sm text-slate-600">
                Showing <span class="font-medium text-slate-800">{{ startItem() }}</span> to 
                <span class="font-medium text-slate-800">{{ endItem() }}</span> of 
                <span class="font-medium text-slate-800">{{ projects().length }}</span> results
              </div>
              <div class="flex items-center gap-2">
                <button 
                  (click)="prevPage()" 
                  [disabled]="currentPage() === 1"
                  class="p-2 rounded hover:bg-slate-200 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                  aria-label="Previous page">
                  <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"/></svg>
                </button>
                
                <div class="flex items-center gap-1">
                  @for (pg of totalPagesArray(); track pg) {
                    <button 
                      (click)="goToPage(pg)"
                      class="min-w-[32px] h-8 rounded text-sm font-medium transition-colors"
                      [class.bg-blue-600]="currentPage() === pg"
                      [class.text-white]="currentPage() === pg"
                      [class.text-slate-600]="currentPage() !== pg"
                      [class.hover:bg-slate-200]="currentPage() !== pg">
                      {{ pg }}
                    </button>
                  }
                </div>

                <button 
                  (click)="nextPage()" 
                  [disabled]="currentPage() === totalPages()"
                  class="p-2 rounded hover:bg-slate-200 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                  aria-label="Next page">
                  <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/></svg>
                </button>
              </div>
            </div>
          }

          @if (projects().length === 0) {
            <p class="p-8 text-center text-slate-500">No projects. <a routerLink="/projects/new" class="text-blue-600 hover:underline">Create one</a>.</p>
          }
        }
      </div>
    </div>
  `,
})
export class ProjectListComponent implements OnInit {
  projects = signal<Project[]>([]);
  loading = signal(true);

  // Pagination state
  currentPage = signal(1);
  pageSize = signal(10);

  totalPages = computed(() => Math.ceil(this.projects().length / this.pageSize()));

  paginatedProjects = computed(() => {
    const start = (this.currentPage() - 1) * this.pageSize();
    const end = start + this.pageSize();
    return this.projects().slice(start, end);
  });

  startItem = computed(() => ((this.currentPage() - 1) * this.pageSize()) + 1);
  endItem = computed(() => Math.min(this.currentPage() * this.pageSize(), this.projects().length));

  totalPagesArray = computed(() => {
    const total = this.totalPages();
    return Array.from({ length: total }, (_, i) => i + 1);
  });

  private dialog = inject(MatDialog);
  constructor(private projectsService: ProjectsService) { }

  ngOnInit() {
    this.projectsService.list().subscribe({
      next: (list) => {
        this.projects.set(list);
        this.loading.set(false);
      },
      error: () => {
        this.projects.set([]);
        this.loading.set(false);
      },
    });
  }

  nextPage() {
    if (this.currentPage() < this.totalPages()) {
      this.currentPage.update(p => p + 1);
    }
  }

  prevPage() {
    if (this.currentPage() > 1) {
      this.currentPage.update(p => p - 1);
    }
  }

  goToPage(pg: number) {
    this.currentPage.set(pg);
  }

  statusClass(s: string): string {
    if (!s) return 'bg-slate-200 text-slate-600';
    if (s === 'Live') return 'bg-green-100 text-green-800';
    if (s === 'QA Ongoing') return 'bg-orange-100 text-orange-800';
    if (s === 'Dev Ongoing') return 'bg-blue-100 text-blue-800';
    if (s === 'SRS Grooming') return 'bg-slate-200 text-slate-700';
    return 'bg-slate-200 text-slate-600';
  }

  getResponsibleDevs(p: Project): string {
    if (!p.Resources || p.Resources.length === 0) return '–';
    return p.Resources.map(r => r.name).join(', ');
  }

  onDelete(id: number) {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      width: '400px',
      data: {
        title: 'Delete Project',
        message: 'Are you sure you want to delete this project? This action cannot be undone.',
        confirmText: 'Delete',
        color: 'warn'
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.projectsService.delete(id).subscribe({
          next: () => {
            this.projects.update(list => list.filter(p => p.id !== id));
          },
          error: (err) => {
            alert(err.error?.error || 'Failed to delete project');
          }
        });
      }
    });
  }
}
