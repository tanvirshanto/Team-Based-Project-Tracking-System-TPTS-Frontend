import { Component, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, Router } from '@angular/router';
import { TeamsService, Team } from '../../core/services/teams.service';

@Component({
  selector: 'app-team-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="space-y-4">
      <!-- Team cards grid -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        @for (team of teams(); track team.id) {
          <div 
            [routerLink]="['/teams', team.id]"
            class="group relative rounded-2xl border-2 p-6 cursor-pointer transition-all duration-300 border-slate-200 bg-white hover:border-blue-200 hover:shadow-lg hover:shadow-slate-200/50"
          >
            <!-- Actions -->
            <div class="absolute top-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
              <button 
                [routerLink]="['/teams', team.id, 'edit']"
                (click)="$event.stopPropagation()"
                class="w-8 h-8 rounded-full bg-slate-100 text-slate-600 hover:bg-blue-600 hover:text-white flex items-center justify-center transition-all shadow-sm"
                title="Edit Team"
              >
                <i class="pi pi-pencil text-[10px]"></i>
              </button>
              <button 
                (click)="$event.stopPropagation(); deleteTeam(team)"
                class="w-8 h-8 rounded-full bg-slate-100 text-slate-600 hover:bg-red-600 hover:text-white flex items-center justify-center transition-all shadow-sm"
                title="Delete Team"
              >
                <i class="pi pi-trash text-[10px]"></i>
              </button>
            </div>

            <div class="flex items-center gap-4 mb-4">
              <div class="w-12 h-12 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center shadow-inner">
                <i class="pi pi-users text-xl"></i>
              </div>
              <div>
                <h3 class="text-lg font-semibold text-slate-800">{{ team.team_name }}</h3>
                <p class="text-[11px] font-medium text-blue-600 uppercase mt-0.5">Team Identity</p>
              </div>
            </div>

            <div class="space-y-3 pt-2 border-t border-slate-100">
              <div class="flex items-center justify-between text-sm">
                <span class="text-slate-500 font-medium">Manager</span>
                <span class="text-slate-800 font-semibold">{{ team.Manager?.name || 'Unassigned' }}</span>
              </div>
              <div class="flex items-center justify-between text-sm">
                <span class="text-slate-500 font-medium">Resources</span>
                <span class="px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 font-bold text-[10px]">{{ team.Resources?.length || 0 }}</span>
              </div>
            </div>
          </div>
        }
      </div>

      @if (teams().length === 0) {
        <div class="p-12 text-center rounded-2xl border-2 border-dashed border-slate-200">
            <p class="text-slate-500 font-medium italic">No teams available. Create one to get started!</p>
        </div>
      }
    </div>
  `,
})
export class TeamDashboardComponent {
  private teamsService = inject(TeamsService);
  private router = inject(Router);

  teams = signal<Team[]>([]);

  constructor() {
    this.loadTeams();
  }

  loadTeams() {
    this.teamsService.getTeams().subscribe({
      next: (list) => this.teams.set(list),
      error: () => this.teams.set([]),
    });
  }

  deleteTeam(team: Team) {
    if (confirm(`Are you sure you want to delete team "${team.team_name}"? This action cannot be undone.`)) {
      this.teamsService.delete(team.id).subscribe({
        next: () => {
          this.loadTeams();
        },
        error: (err) => alert(err.error?.error || 'Delete failed'),
      });
    }
  }
}
