import { Component, signal, computed, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { TeamsService, Team, TeamProject, TeamSummaryMember, ResponsibleDev } from '../../core/services/teams.service';

const STATUS_STYLES: Record<string, string> = {
  Live: 'bg-green-100 text-green-800',
  'QA Ongoing': 'bg-orange-100 text-orange-800',
  'Dev Ongoing': 'bg-blue-100 text-blue-800',
  'SRS Grooming': 'bg-slate-200 text-slate-700',
};

@Component({
  selector: 'app-team-detail',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="p-4 md:p-6 space-y-6">
      <div class="flex items-center gap-4 mb-2">
        <a routerLink="/teams" class="text-slate-500 hover:text-slate-800 transition-colors flex items-center gap-1">
          <i class="pi pi-arrow-left text-xs"></i>
          <span>Back to Teams</span>
        </a>
      </div>

      @if (loading()) {
        <div class="flex items-center justify-center py-20">
          <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      } @else {
        @if (team(); as t) {
          <div class="flex flex-wrap items-center justify-between gap-4">
            <div>
              <h1 class="text-2xl font-semibold text-slate-800">{{ t.team_name }}</h1>
              <p class="text-slate-600 font-medium mt-1 flex items-center gap-2">
                <i class="pi pi-user text-slate-400"></i>
                Manager: <span class="text-slate-900">{{ t.Manager?.name || 'Unassigned' }}</span>
              </p>
            </div>
            <div class="flex items-center gap-3">
              <a [routerLink]="['/teams', t.id, 'edit']" class="rounded-lg border border-slate-300 px-4 py-2 text-slate-700 font-semibold hover:bg-slate-50 transition-all flex items-center gap-2 shadow-sm">
                <i class="pi pi-pencil"></i>
                Edit Team
              </a>
            </div>
          </div>

          <!-- Team members summary -->
          <section class="rounded-2xl border border-slate-200 bg-white shadow-sm p-6 overflow-hidden">
            <div class="flex items-center gap-2 mb-4">
              <div class="w-8 h-8 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center">
                  <i class="pi pi-users text-sm"></i>
              </div>
              <h2 class="text-sm font-semibold text-slate-800 uppercase">Member Engagement</h2>
            </div>
            
            @if (summaryLoading()) {
              <p class="text-slate-500 text-sm">Loading members...</p>
            } @else if (teamSummary().length === 0) {
              <p class="text-slate-500 text-sm italic">No members found in this team.</p>
            } @else {
              <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                @for (m of teamSummary(); track m.id) {
                  <div class="rounded-xl bg-slate-50 border border-slate-100 p-4 transition-all hover:shadow-md hover:border-blue-100">
                    <div class="font-bold text-slate-800 mb-1">{{ m.name }}</div>
                    <div class="flex items-center gap-2 text-xs">
                      <span class="text-slate-500 uppercase font-medium text-[10px]">Engaged Till</span>
                      <span class="px-2 py-0.5 rounded bg-white border border-slate-200 text-blue-700 font-bold whitespace-nowrap">
                          {{ m.engaged_till || '–' }}
                      </span>
                    </div>
                  </div>
                }
              </div>
            }
          </section>

          <!-- Projects table -->
          <section class="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
            <div class="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50/50">
              <div class="flex items-center gap-2">
                  <div class="w-8 h-8 rounded-lg bg-indigo-100 text-indigo-600 flex items-center justify-center text-sm">
                      <i class="pi pi-folder-open"></i>
                  </div>
                  <h2 class="text-sm font-semibold text-slate-800 uppercase">Project Assignments</h2>
              </div>
               <span class="px-3 py-1 rounded-full bg-slate-200 text-slate-700 font-bold text-[10px]">{{ projects().length }} Total</span>
            </div>

            @if (projectsLoading()) {
              <p class="p-8 text-slate-500 text-sm italic">Loading projects...</p>
            } @else if (projects().length === 0) {
              <div class="p-12 text-center text-slate-500 italic">
                  <i class="pi pi-info-circle text-2xl mb-2 block opacity-30"></i>
                  No projects assigned to this team.
              </div>
            } @else {
              <div class="overflow-x-auto max-h-[60vh] overflow-y-auto custom-scrollbar">
                <table class="w-full text-sm border-collapse">
                  <thead class="sticky top-0 z-10 bg-slate-100/95 backdrop-blur-sm border-b border-slate-200">
                    <tr class="text-left text-slate-600 font-bold">
                      <th class="p-4 whitespace-nowrap">Serial</th>
                      <th class="p-4 whitespace-nowrap">JIRA ID</th>
                      <th class="p-4 whitespace-nowrap">CR Name</th>
                      <th class="p-4 whitespace-nowrap">Current Status</th>
                      <th class="p-4 whitespace-nowrap">Start Date</th>
                      <th class="p-4 whitespace-nowrap">QA Date</th>
                      <th class="p-4 whitespace-nowrap">UAT Date</th>
                      <th class="p-4 whitespace-nowrap">Live Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    @for (p of paginatedProjects(); track p.id; let i = $index) {
                      <tr class="border-b border-slate-100 hover:bg-blue-50/30 transition-colors">
                        <td class="p-4 text-slate-500 font-mono">{{ startItem() + i }}</td>
                        <td class="p-4 font-mono text-slate-700">{{ p.jira_id ?? '–' }}</td>
                        <td class="p-4">
                          <div class="font-bold text-slate-800 truncate max-w-[250px]" [title]="p.cr_name">{{ p.cr_name }}</div>
                        </td>
                        <td class="p-4">
                          <span class="rounded-full px-3 py-1 text-[10px] font-bold uppercase shadow-sm" [class]="statusClass(p.current_status)">
                            {{ p.current_status }}
                          </span>
                        </td>
                        <td class="p-4 text-slate-600 whitespace-nowrap">{{ p.start_date ?? '–' }}</td>
                        <td class="p-4 text-slate-600 whitespace-nowrap">{{ p.qa_release_date ?? '–' }}</td>
                        <td class="p-4 text-slate-600 whitespace-nowrap">{{ p.uat_release_date ?? '–' }}</td>
                        <td class="p-4 text-slate-600 whitespace-nowrap font-bold">{{ p.live_release_date ?? '–' }}</td>
                      </tr>
                    }
                  </tbody>
                </table>
              </div>

              <!-- Pagination -->
              <div class="px-6 py-4 border-t border-slate-100 bg-slate-50/50 flex items-center justify-between gap-4 flex-wrap">
                <div class="text-xs text-slate-500 font-medium">
                  Showing <span class="text-slate-900 font-semibold">{{ startItem() }}</span> - <span class="text-slate-900 font-semibold">{{ endItem() }}</span> of <span class="text-slate-900 font-semibold">{{ projects().length }}</span>
                </div>
                <div class="flex items-center gap-1.5">
                  <button (click)="prevPage()" [disabled]="currentPage() === 1" class="w-8 h-8 rounded-lg flex items-center justify-center bg-white border border-slate-200 text-slate-600 hover:border-blue-400 hover:text-blue-600 disabled:opacity-30 disabled:pointer-events-none transition-all shadow-sm">
                      <i class="pi pi-chevron-left text-xs"></i>
                  </button>
                  
                  <div class="flex items-center gap-1 mx-1">
                    @for (pg of totalPagesArray(); track pg) {
                      <button 
                        (click)="goToPage(pg)"
                        class="w-8 h-8 rounded-lg text-xs font-bold transition-all"
                        [ngClass]="{
                          'bg-blue-600 text-white shadow-md shadow-blue-500/20': currentPage() === pg,
                          'text-slate-600 hover:bg-slate-100': currentPage() !== pg
                        }">
                        {{ pg }}
                      </button>
                    }
                  </div>

                  <button (click)="nextPage()" [disabled]="currentPage() === totalPages()" class="w-8 h-8 rounded-lg flex items-center justify-center bg-white border border-slate-200 text-slate-600 hover:border-blue-400 hover:text-blue-600 disabled:opacity-30 disabled:pointer-events-none transition-all shadow-sm">
                      <i class="pi pi-chevron-right text-xs"></i>
                  </button>
                </div>
              </div>
            }
          </section>
        } @else {
          <div class="p-20 text-center">
              <div class="text-slate-400 text-5xl mb-4">
                  <i class="pi pi-exclamation-triangle"></i>
              </div>
              <h2 class="text-xl font-bold text-slate-800">Team not found</h2>
              <p class="text-slate-500 mt-2">The team you are looking for doesn't exist or has been deleted.</p>
              <a routerLink="/teams" class="mt-6 inline-block text-blue-600 font-bold hover:underline underline-offset-4">Browse all teams</a>
          </div>
        }
      }
    </div>
  `,
  styles: [`
    .custom-scrollbar::-webkit-scrollbar { width: 6px; height: 6px; }
    .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
    .custom-scrollbar::-webkit-scrollbar-thumb { background: #e2e8f0; border-radius: 10px; }
    .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #cbd5e1; }
  `]
})
export class TeamDetailComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private teamsService = inject(TeamsService);

  loading = signal(true);
  team = signal<Team | null>(null);
  projects = signal<TeamProject[]>([]);
  teamSummary = signal<TeamSummaryMember[]>([]);
  projectsLoading = signal(false);
  summaryLoading = signal(false);

  // Pagination state
  currentPage = signal(1);
  pageSize = signal(10);

  totalPages = computed(() => Math.ceil(this.projects().length / this.pageSize()));

  paginatedProjects = computed(() => {
    const start = (this.currentPage() - 1) * this.pageSize();
    const end = start + this.pageSize();
    return this.projects().slice(start, end);
  });

  startItem = computed(() => {
    if (this.projects().length === 0) return 0;
    return ((this.currentPage() - 1) * this.pageSize()) + 1;
  });
  endItem = computed(() => Math.min(this.currentPage() * this.pageSize(), this.projects().length));

  totalPagesArray = computed(() => {
    const total = this.totalPages();
    const current = this.currentPage();
    let start = Math.max(1, current - 2);
    let end = Math.min(total, start + 4);
    if (end - start < 4) start = Math.max(1, end - 4);
    const pages = [];
    for (let i = start; i <= end; i++) pages.push(i);
    return pages;
  });

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.loadTeamData(+id);
    } else {
      this.loading.set(false);
    }
  }

  loadTeamData(id: number) {
    this.loading.set(true);

    // Get basic team info
    this.teamsService.get(id).subscribe({
      next: (t) => {
        this.team.set(t);
        this.loading.set(false);
        this.loadDetails(id);
      },
      error: () => {
        this.team.set(null);
        this.loading.set(false);
      }
    });
  }

  loadDetails(id: number) {
    this.projectsLoading.set(true);
    this.summaryLoading.set(true);

    this.teamsService.getTeamProjects(id).subscribe({
      next: (list) => {
        this.projects.set(list);
        this.projectsLoading.set(false);
      },
      error: () => {
        this.projects.set([]);
        this.projectsLoading.set(false);
      }
    });

    this.teamsService.getTeamSummary(id).subscribe({
      next: (list) => {
        this.teamSummary.set(list);
        this.summaryLoading.set(false);
      },
      error: () => {
        this.teamSummary.set([]);
        this.summaryLoading.set(false);
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

  statusClass(status: string): string {
    return STATUS_STYLES[status] ?? 'bg-slate-200 text-slate-600';
  }
}
