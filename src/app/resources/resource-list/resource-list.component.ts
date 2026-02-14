import { Component, signal, OnInit, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { ResourcesService, Resource } from '../../core/services/resources.service';

@Component({
  selector: 'app-resource-list',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="p-4 md:p-6">
      <div class="flex flex-wrap items-center justify-between gap-4 mb-6">
        <h1 class="text-2xl font-semibold text-slate-800">Resource List</h1>
        <a routerLink="/resources/new" class="rounded-lg bg-blue-600 text-white px-4 py-2 font-medium hover:bg-blue-700">Create Resource</a>
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
                  <th class="p-3 w-24">Actions</th>
                </tr>
              </thead>
              <tbody>
                @for (r of paginatedResources(); track r.id) {
                  <tr class="border-b border-slate-100 hover:bg-slate-50">
                    <td class="p-3 font-medium text-slate-800">{{ r.name }}</td>
                    <td class="p-3 text-slate-600">{{ r.Team?.team_name ?? '–' }}</td>
                    <td class="p-3 text-slate-600">{{ r.default_engaged_till ? (r.default_engaged_till | date:'shortDate') : '–' }}</td>
                    <td class="p-3">
                      <a [routerLink]="['/resources', r.id, 'edit']" class="text-blue-600 hover:underline">Edit</a>
                    </td>
                  </tr>
                }
              </tbody>
            </table>
          </div>

          <!-- Pagination -->
          @if (resources().length > 0) {
            <div class="px-4 py-3 border-t border-slate-200 bg-slate-50 flex items-center justify-between gap-4 flex-wrap">
              <div class="text-sm text-slate-600">
                Showing <span class="font-medium text-slate-800">{{ startItem() }}</span> to 
                <span class="font-medium text-slate-800">{{ endItem() }}</span> of 
                <span class="font-medium text-slate-800">{{ resources().length }}</span> results
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

          @if (resources().length === 0) {
            <p class="p-8 text-center text-slate-500">No resources. <a routerLink="/resources/new" class="text-blue-600 hover:underline">Create one</a>.</p>
          }
        }
      </div>
    </div>
  `,
})
export class ResourceListComponent implements OnInit {
  resources = signal<Resource[]>([]);
  loading = signal(true);

  // Pagination state
  currentPage = signal(1);
  pageSize = signal(10);

  totalPages = computed(() => Math.ceil(this.resources().length / this.pageSize()));

  paginatedResources = computed(() => {
    const start = (this.currentPage() - 1) * this.pageSize();
    const end = start + this.pageSize();
    return this.resources().slice(start, end);
  });

  startItem = computed(() => ((this.currentPage() - 1) * this.pageSize()) + 1);
  endItem = computed(() => Math.min(this.currentPage() * this.pageSize(), this.resources().length));

  totalPagesArray = computed(() => {
    const total = this.totalPages();
    return Array.from({ length: total }, (_, i) => i + 1);
  });

  constructor(private resourcesService: ResourcesService) { }

  ngOnInit() {
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
