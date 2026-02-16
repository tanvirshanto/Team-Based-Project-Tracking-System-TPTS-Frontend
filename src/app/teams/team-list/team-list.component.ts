import { Component, ViewChild, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { TeamDashboardComponent } from '../../dashboard/team-dashboard/team-dashboard.component';
import { TeamFormComponent } from '../team-form/team-form.component';

@Component({
  selector: 'app-team-list',
  standalone: true,
  imports: [CommonModule, TeamDashboardComponent, RouterLink, MatDialogModule, MatButtonModule],
  template: `
    <div class="p-4 md:p-6">
      <div class="flex flex-wrap items-center justify-between gap-4 mb-6">
        <div>
          <h1 class="text-2xl font-semibold text-slate-800">Team List</h1>
          <p class="text-slate-600 text-sm mt-1">Select a team to view members (engaged till) and projects.</p>
        </div>
        <button (click)="createTeam()" class="rounded-lg bg-blue-600 text-white px-4 py-2 font-medium hover:bg-blue-700 transition-all shadow-sm flex items-center gap-2 active:scale-95">
          <i class="pi pi-plus text-sm"></i>
          <span>Create Team</span>
        </button>
      </div>
      
      <app-team-dashboard #dashboard />
    </div>
  `,
})
export class TeamListComponent {
  private dialog = inject(MatDialog);
  @ViewChild('dashboard') dashboard!: TeamDashboardComponent;

  createTeam() {
    const dialogRef = this.dialog.open(TeamFormComponent, {
      width: '500px',
      data: {}
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.dashboard.loadTeams();
      }
    });
  }
}
