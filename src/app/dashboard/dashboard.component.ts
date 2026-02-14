import { Component, signal, computed, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DashboardService, ResourceEngagementRow } from '../core/services/dashboard.service';
import { TeamsService } from '../core/services/teams.service';
import { ProjectsService } from '../core/services/projects.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="p-4 md:p-6">
      <h1 class="text-2xl font-semibold text-slate-800 mb-6">Dashboard</h1>

      <!-- Statistics Cards -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <!-- Total Teams Card -->
        <div class="rounded-xl border border-blue-200 bg-gradient-to-br from-blue-50 to-blue-100 p-5 shadow-sm hover:shadow-md transition">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm font-medium text-blue-700">Total Teams</p>
              <p class="text-3xl font-bold text-blue-900 mt-1">{{ totalTeams() }}</p>
            </div>
            <div class="bg-blue-500 text-white rounded-full w-12 h-12 flex items-center justify-center">
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"/>
              </svg>
            </div>
          </div>
        </div>

        <!-- Dev Ongoing Card -->
        <div class="rounded-xl border border-green-200 bg-gradient-to-br from-green-50 to-green-100 p-5 shadow-sm hover:shadow-md transition">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm font-medium text-green-700">Dev Ongoing</p>
              <p class="text-3xl font-bold text-green-900 mt-1">{{ devOngoing() }}</p>
            </div>
            <div class="bg-green-500 text-white rounded-full w-12 h-12 flex items-center justify-center">
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4"/>
              </svg>
            </div>
          </div>
        </div>

        <!-- UAT Ongoing Card -->
        <div class="rounded-xl border border-orange-200 bg-gradient-to-br from-orange-50 to-orange-100 p-5 shadow-sm hover:shadow-md transition">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm font-medium text-orange-700">UAT Ongoing</p>
              <p class="text-3xl font-bold text-orange-900 mt-1">{{ uatOngoing() }}</p>
            </div>
            <div class="bg-orange-500 text-white rounded-full w-12 h-12 flex items-center justify-center">
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"/>
              </svg>
            </div>
          </div>
        </div>

        <!-- Total Resources Card -->
        <div class="rounded-xl border border-purple-200 bg-gradient-to-br from-purple-50 to-purple-100 p-5 shadow-sm hover:shadow-md transition">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm font-medium text-purple-700">Total Resources</p>
              <p class="text-3xl font-bold text-purple-900 mt-1">{{ totalResources() }}</p>
            </div>
            <div class="bg-purple-500 text-white rounded-full w-12 h-12 flex items-center justify-center">
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"/>
              </svg>
            </div>
          </div>
        </div>

        <!-- Free This Month Card -->
        <div class="rounded-xl border border-amber-200 bg-gradient-to-br from-amber-50 to-amber-100 p-5 shadow-sm hover:shadow-md transition">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm font-medium text-amber-700">Resources Free This Month</p>
              <p class="text-3xl font-bold text-amber-900 mt-1">{{ freeThisMonth() }}</p>
            </div>
            <div class="bg-amber-500 text-white rounded-full w-12 h-12 flex items-center justify-center">
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/>
              </svg>
            </div>
          </div>
        </div>

        <!-- Free Next Month Card -->
        <div class="rounded-xl border border-rose-200 bg-gradient-to-br from-rose-50 to-rose-100 p-5 shadow-sm hover:shadow-md transition">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm font-medium text-rose-700">Resources Free Next Month</p>
              <p class="text-3xl font-bold text-rose-900 mt-1">{{ freeNextMonth() }}</p>
            </div>
            <div class="bg-rose-500 text-white rounded-full w-12 h-12 flex items-center justify-center">
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 5l7 7-7 7M5 5l7 7-7 7"/>
              </svg>
            </div>
          </div>
        </div>
      </div>

      <!-- Monthly Engagement Chart -->
      <section class="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden mb-6 p-6">
        <div class="flex flex-wrap items-center justify-between gap-4 mb-6">
          <h2 class="text-lg font-semibold text-slate-800">Engagement Distribution ({{ currentYear }})</h2>
          <!-- Legend -->
          <div class="flex flex-wrap gap-3">
            @for (res of resourceColors(); track res.name) {
              <div class="flex items-center gap-1.5 text-xs text-slate-600">
                <span class="w-3 h-3 rounded-full" [style.background-color]="res.color"></span>
                <span>{{ res.name }}</span>
              </div>
            }
          </div>
        </div>

        <div class="h-64 flex items-end justify-between gap-2 px-2 relative border-b border-slate-200">
          @for (monthData of engagementData(); track monthData.month) {
            <div class="flex-1 flex flex-col items-center group relative h-full justify-end">
              <!-- Tooltip -->
              <div class="absolute -top-12 bg-slate-800 text-white text-[10px] rounded px-2 py-1 opacity-0 group-hover:opacity-100 transition pointer-events-none z-10 text-center shadow-lg min-w-[80px]">
                <div class="font-bold border-b border-slate-600 mb-1 pb-1">{{ monthData.count }} Resource(s)</div>
                <div class="space-y-0.5">
                  @for (res of monthData.resources; track res.name) {
                    <div class="whitespace-nowrap flex items-center gap-1 justify-center">
                      <span class="w-1.5 h-1.5 rounded-full" [style.background-color]="res.color"></span>
                      {{ res.name }}
                    </div>
                  }
                </div>
              </div>
              
              <!-- Stacked Bar -->
              <div 
                class="w-full max-w-[40px] flex flex-col-reverse transition-all duration-500 hover:scale-x-110 origin-bottom"
                [style.height.%]="(monthData.count / maxEngagement() * 100) || 2"
              >
                @for (res of monthData.resources; track res.name) {
                  <div 
                    class="w-full transition-all duration-300"
                    [class.rounded-t-md]="$last"
                    [style.flex-grow]="1"
                    [style.background-color]="res.color"
                    [title]="res.name"
                  ></div>
                }
                @if (monthData.count === 0) {
                  <div class="w-full h-1 bg-slate-100 rounded-t-sm"></div>
                }
              </div>
              
              <!-- Label -->
              <span class="text-[10px] text-slate-500 mt-2 absolute -bottom-6">{{ monthData.month }}</span>
            </div>
          }
        </div>
        <div class="mt-8"></div>
      </section>

      <!-- Resource Engagement Table -->
      <section class="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden">
        <div class="px-4 py-3 border-b border-slate-200 bg-slate-50">
          <h2 class="text-lg font-semibold text-slate-800">Resource engagement</h2>
          <p class="text-slate-500 text-sm mt-0.5">All resources with current engagement, status and particulars from projects</p>
        </div>
        @if (loading()) {
          <div class="p-8 text-center text-slate-500">
            <span class="inline-block animate-spin rounded-full h-8 w-8 border-2 border-blue-500 border-t-transparent"></span>
            <p class="mt-2">Loading...</p>
          </div>
        } @else {
          <div class="overflow-x-auto">
            <table class="w-full text-sm">
              <thead class="bg-slate-100 border-b border-slate-200">
                <tr class="text-left text-slate-600 font-medium">
                  <th class="p-3 whitespace-nowrap">Resource</th>
                  <th class="p-3 whitespace-nowrap">Engaged Till</th>
                  <th class="p-3 min-w-[200px]">Particular</th>
                  @if (hasJiraOrStatus()) {
                    <th class="p-3 whitespace-nowrap">Jira ID</th>
                    <th class="p-3 whitespace-nowrap">Status</th>
                  }
                </tr>
              </thead>
              <tbody>
                @for (row of paginatedRows(); track row.resourceName + row.engagedTill) {
                  <tr class="border-b border-slate-100 hover:bg-slate-50">
                    <td class="p-3 font-medium text-slate-800">{{ row.resourceName }}</td>
                    <td class="p-3 text-slate-600">{{ row.engagedTill || '–' }}</td>
                    <td class="p-3 text-slate-600 max-w-md" [title]="row.particular">{{ row.particular || '–' }}</td>
                    @if (hasJiraOrStatus()) {
                      <td class="p-3 text-slate-600">{{ row.jiraId || '–' }}</td>
                      <td class="p-3">
                        @if (row.projectStatus) {
                          <span class="inline-flex rounded px-2 py-0.5 text-xs font-medium" [ngClass]="STATUS_STYLES[row.projectStatus] || 'bg-slate-100 text-slate-800'">{{ row.projectStatus }}</span>
                        } @else {
                          –
                        }
                      </td>
                    }
                  </tr>
                }
              </tbody>
            </table>
          </div>

          <!-- Pagination -->
          @if (rows().length > 0) {
            <div class="px-4 py-3 border-t border-slate-200 bg-slate-50 flex items-center justify-between gap-4 flex-wrap">
              <div class="text-sm text-slate-600">
                Showing <span class="font-medium text-slate-800">{{ startItem() }}</span> to 
                <span class="font-medium text-slate-800">{{ endItem() }}</span> of 
                <span class="font-medium text-slate-800">{{ rows().length }}</span> results
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

          @if (rows().length === 0) {
            <p class="p-8 text-center text-slate-500">No engagement data.</p>
          }
        }
      </section>
    </div>
  `,
})
export class DashboardComponent implements OnInit {
  public STATUS_STYLES: Record<string, string> = {
    Live: 'bg-green-100 text-green-800',
    'QA Ongoing': 'bg-orange-100 text-orange-800',
    'Dev Ongoing': 'bg-blue-100 text-blue-800',
    'SRS Grooming': 'bg-slate-200 text-slate-700',
  };

  public COLOR_PALETTE = [
    '#3b82f6', // blue-500
    '#10b981', // emerald-500
    '#f59e0b', // amber-500
    '#8b5cf6', // violet-500
    '#ec4899', // pink-500
    '#06b6d4', // cyan-500
    '#f97316', // orange-500
    '#14b8a6', // teal-500
    '#6366f1', // indigo-500
    '#ef4444', // red-500
  ];

  rows = signal<ResourceEngagementRow[]>([]);
  loading = signal(true);
  teams = signal<any[]>([]);
  projects = signal<any[]>([]);
  currentYear = new Date().getFullYear();

  // Computed statistics
  totalTeams = computed(() => this.teams().length);
  totalResources = computed(() => {
    const uniqueResources = new Set(this.rows().map(r => r.resourceName));
    return uniqueResources.size;
  });
  devOngoing = computed(() =>
    this.projects().filter(p => p.current_status === 'Dev Ongoing').length
  );
  uatOngoing = computed(() =>
    this.projects().filter(p => p.current_status === 'QA Ongoing').length
  );

  freeThisMonth = computed(() => {
    const now = new Date();
    const currMonth = now.getMonth();
    const currYear = now.getFullYear();

    return this.rows().filter(row => {
      if (!row.engagedTill) return false;
      let date: Date | null = null;
      const dmyMatch = row.engagedTill.match(/^(\d{1,2})-(\d{1,2})-(\d{4})/);
      if (dmyMatch) {
        date = new Date(parseInt(dmyMatch[3], 10), parseInt(dmyMatch[2], 10) - 1, parseInt(dmyMatch[1], 10));
      } else {
        const parsed = new Date(row.engagedTill);
        if (!isNaN(parsed.getTime())) date = parsed;
      }
      return date && date.getMonth() === currMonth && date.getFullYear() === currYear;
    }).length;
  });

  freeNextMonth = computed(() => {
    const now = new Date();
    let nextMonth = now.getMonth() + 1;
    let nextYear = now.getFullYear();
    if (nextMonth > 11) {
      nextMonth = 0;
      nextYear++;
    }

    return this.rows().filter(row => {
      if (!row.engagedTill) return false;
      let date: Date | null = null;
      const dmyMatch = row.engagedTill.match(/^(\d{1,2})-(\d{1,2})-(\d{4})/);
      if (dmyMatch) {
        date = new Date(parseInt(dmyMatch[3], 10), parseInt(dmyMatch[2], 10) - 1, parseInt(dmyMatch[1], 10));
      } else {
        const parsed = new Date(row.engagedTill);
        if (!isNaN(parsed.getTime())) date = parsed;
      }
      return date && date.getMonth() === nextMonth && date.getFullYear() === nextYear;
    }).length;
  });

  monthLabels = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

  engagementData = computed(() => {
    const data = this.monthLabels.map(month => ({ month, count: 0, resources: [] as { name: string, color: string }[] }));
    const rows = this.rows();
    const colors = this.resourceColors();
    const currentYear = new Date().getFullYear();

    rows.forEach(row => {
      if (!row.engagedTill) return;

      let date: Date | null = null;

      // Try parsing DD-MM-YYYY manually first
      const dmyMatch = row.engagedTill.match(/^(\d{1,2})-(\d{1,2})-(\d{4})/);
      if (dmyMatch) {
        date = new Date(parseInt(dmyMatch[3], 10), parseInt(dmyMatch[2], 10) - 1, parseInt(dmyMatch[1], 10));
      } else {
        const parsed = new Date(row.engagedTill);
        if (!isNaN(parsed.getTime())) {
          date = parsed;
        }
      }

      if (date && date.getFullYear() === currentYear) {
        const month = date.getMonth();
        if (month >= 0 && month < 12) {
          const resColor = colors.find(c => c.name === row.resourceName)?.color || '#94a3b8';
          data[month].count++;
          data[month].resources.push({ name: row.resourceName, color: resColor });
        }
      }
    });
    return data;
  });

  resourceColors = computed(() => {
    const uniqueNames = Array.from(new Set(this.rows().map(r => r.resourceName)));
    return uniqueNames.map((name, i) => ({
      name,
      color: this.COLOR_PALETTE[i % this.COLOR_PALETTE.length]
    }));
  });

  maxEngagement = computed(() => {
    const counts = this.engagementData().map(d => d.count);
    const max = Math.max(...counts, 5);
    return max;
  });

  // Pagination state
  currentPage = signal(1);
  pageSize = signal(10);

  totalPages = computed(() => Math.ceil(this.rows().length / this.pageSize()));

  paginatedRows = computed(() => {
    const start = (this.currentPage() - 1) * this.pageSize();
    const end = start + this.pageSize();
    return this.rows().slice(start, end);
  });

  startItem = computed(() => {
    if (this.rows().length === 0) return 0;
    return ((this.currentPage() - 1) * this.pageSize()) + 1;
  });
  endItem = computed(() => Math.min(this.currentPage() * this.pageSize(), this.rows().length));

  totalPagesArray = computed(() => {
    const total = this.totalPages();
    const current = this.currentPage();

    // Show max 5 page buttons
    let start = Math.max(1, current - 2);
    let end = Math.min(total, start + 4);
    if (end - start < 4) start = Math.max(1, end - 4);

    const pages = [];
    for (let i = start; i <= end; i++) pages.push(i);
    return pages;
  });

  constructor(
    private dashboard: DashboardService,
    private teamsService: TeamsService,
    private projectsService: ProjectsService
  ) { }

  ngOnInit() {
    // Load resource engagement
    this.dashboard.getResourceEngagement().subscribe({
      next: (data) => {
        this.rows.set(data);
        this.loading.set(false);
      },
      error: () => {
        this.rows.set(this.dashboard.getSampleData());
        this.loading.set(false);
      },
    });

    // Load teams
    this.teamsService.getTeams().subscribe({
      next: (data) => this.teams.set(data),
      error: () => this.teams.set([]),
    });

    // Load projects
    this.projectsService.list().subscribe({
      next: (data) => this.projects.set(data),
      error: () => this.projects.set([]),
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

  hasJiraOrStatus(): boolean {
    return this.rows().some((r) => r.jiraId || r.projectStatus);
  }
}
