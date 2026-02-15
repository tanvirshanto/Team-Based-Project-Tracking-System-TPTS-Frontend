import { Component, signal, OnInit, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { ResourcesService, Resource } from '../../core/services/resources.service';
import { ResourceFormComponent } from '../resource-form/resource-form.component';

@Component({
  selector: 'app-resource-list',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule, MatIconModule, MatDialogModule, MatButtonModule],
  template: `
    <div class="p-4 md:p-6">
      <div class="flex flex-wrap items-center justify-between gap-4 mb-6">
        <div class="flex items-center gap-4">
          <h1 class="text-2xl font-semibold text-slate-800">Resource List</h1>
          <div class="relative">
            <span class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <mat-icon class="text-slate-400 scale-75">search</mat-icon>
            </span>
            <input 
              type="text" 
              [(ngModel)]="searchFilter" 
              placeholder="Search Name or Team..." 
              class="block w-80 pl-10 pr-3 py-2 border border-slate-200 rounded-lg text-sm placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all bg-white"
            >
          </div>
        </div>
        <a routerLink="/resources/new" class="rounded-lg bg-blue-600 text-white px-4 py-2 font-medium hover:bg-blue-700 shadow-sm transition-all active:scale-95 flex items-center gap-2">
          <mat-icon class="scale-90">add</mat-icon>
          Create Resource
        </a>
      </div>

      <div class="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden">
        @if (loading()) {
          <div class="p-8 text-center text-slate-500">Loading...</div>
        } @else {
          <div class="overflow-x-auto">
            <table class="w-full text-sm">
              <thead class="bg-slate-100 border-b border-slate-200">
                <tr class="text-left text-slate-600 font-medium">
                  <th class="p-3">Name</th>
                  <th class="p-3">Team</th>
                  <th class="p-3">Default Engaged Till</th>
                  <th class="p-3 w-32">Actions</th>
                </tr>
              </thead>
              <tbody>
                @for (r of paginatedResources(); track r.id) {
                  <tr class="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                    <td class="p-3 font-medium text-slate-800">{{ r.name }}</td>
                    <td class="p-3 text-slate-600">{{ r.Team?.team_name ?? '–' }}</td>
                    <td class="p-3 text-slate-600">{{ r.default_engaged_till ? (r.default_engaged_till | date:'shortDate') : '–' }}</td>
                    <td class="p-3">
                      <button 
                        (click)="editResource(r)"
                        class="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-blue-700 bg-blue-50 border border-blue-100 rounded-lg hover:bg-blue-600 hover:text-white hover:border-blue-600 transition-all active:scale-95 group shadow-sm"
                      >
                        <mat-icon class="text-[16px] w-[16px] h-[16px] scale-75 transition-colors group-hover:text-white">edit</mat-icon>
                        Edit
                      </button>
                    </td>
                  </tr>
                }
              </tbody>
            </table>
          </div>

          <!-- Pagination -->
          @if (filteredResources().length > 0) {
            <div class="px-4 py-3 border-t border-slate-200 bg-slate-50 flex items-center justify-between gap-4 flex-wrap">
              <div class="text-sm text-slate-600">
                Showing <span class="font-medium text-slate-800">{{ startItem() }}</span> to 
                <span class="font-medium text-slate-800">{{ endItem() }}</span> of 
                <span class="font-medium text-slate-800">{{ filteredResources().length }}</span> results
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

          @if (filteredResources().length === 0) {
            <p class="p-8 text-center text-slate-500">No resources found. @if(searchFilter()) { Try adjusting your search. } @else { <a routerLink="/resources/new" class="text-blue-600 hover:underline">Create one</a>. }</p>
          }
        }
      </div>
    </div>
  `,
})
export class ResourceListComponent implements OnInit {
  private resourcesService = inject(ResourcesService);
  private dialog = inject(MatDialog);

  resources = signal<Resource[]>([]);
  loading = signal(true);
  searchFilter = signal('');

  filteredResources = computed(() => {
    const query = this.searchFilter().toLowerCase().trim();
    if (!query) return this.resources();
    return this.resources().filter(r =>
      r.name.toLowerCase().includes(query) ||
      (r.Team?.team_name || '').toLowerCase().includes(query)
    );
  });

  // Pagination state
  currentPage = signal(1);
  pageSize = signal(10);

  totalPages = computed(() => Math.ceil(this.filteredResources().length / this.pageSize()));

  paginatedResources = computed(() => {
    const start = (this.currentPage() - 1) * this.pageSize();
    const end = start + this.pageSize();
    return this.filteredResources().slice(start, end);
  });

  startItem = computed(() => {
    if (this.filteredResources().length === 0) return 0;
    return ((this.currentPage() - 1) * this.pageSize()) + 1;
  });
  endItem = computed(() => Math.min(this.currentPage() * this.pageSize(), this.filteredResources().length));

  totalPagesArray = computed(() => {
    const total = this.totalPages();
    return Array.from({ length: total }, (_, i) => i + 1);
  });

  ngOnInit() {
    this.loadResources();
  }

  loadResources() {
    this.loading.set(true);
    this.resourcesService.list().subscribe({
      next: (list) => {
        this.resources.set(list);
        this.loading.set(false);
      },
      error: () => {
        this.resources.set([]);
        this.loading.set(false);
      },
    });
  }

  editResource(r: Resource) {
    const dialogRef = this.dialog.open(ResourceFormComponent, {
      width: '500px',
      data: { id: r.id }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.loadResources();
      }
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
}
