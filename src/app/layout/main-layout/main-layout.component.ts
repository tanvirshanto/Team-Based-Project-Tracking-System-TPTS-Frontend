import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-main-layout',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="flex h-screen bg-slate-50 overflow-hidden">
      <!-- Sidebar -->
      <aside 
        class="flex flex-col bg-slate-900 text-white shrink-0 border-r border-slate-800 transition-all duration-300 ease-in-out"
        [class.w-64]="!isSidebarCollapsed()"
        [class.w-0]="isSidebarCollapsed()"
        [class.opacity-0]="isSidebarCollapsed()"
        [class.invisible]="isSidebarCollapsed()"
      >
        <div class="p-6 border-b border-slate-800">
          <div class="flex items-center gap-3">
            <div class="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <i class="pi pi-chart-bar text-white text-lg"></i>
            </div>
            <div>
              <h1 class="text-lg font-bold text-white tracking-tight leading-none">TPTS</h1>
              <p class="text-slate-500 text-[10px] mt-1 font-medium tracking-wide">PROJECT TRACKING</p>
            </div>
          </div>
        </div>

        <nav class="flex-1 overflow-y-auto py-6">
          <div class="px-6 mb-2 text-slate-500 text-[10px] font-bold uppercase tracking-widest">Main</div>
          <a
            routerLink="/dashboard"
            routerLinkActive="bg-blue-600 text-white shadow-lg shadow-blue-900/20"
            [routerLinkActiveOptions]="{ exact: true }"
            class="flex items-center gap-3 mx-4 px-4 py-2.5 rounded-lg text-slate-400 hover:bg-slate-800 hover:text-white transition-all group"
          >
            <i class="pi pi-home" [class.text-white]="isActive('/dashboard')"></i>
            <span class="text-sm font-medium">Dashboard</span>
          </a>

          <div class="px-6 mt-8 mb-2 text-slate-500 text-[10px] font-bold uppercase tracking-widest">Teams</div>
          <a
            routerLink="/teams"
            routerLinkActive="bg-blue-600 text-white shadow-lg shadow-blue-900/20"
            class="flex items-center gap-3 mx-4 px-4 py-2.5 rounded-lg text-slate-400 hover:bg-slate-800 hover:text-white transition-all group"
          >
            <i class="pi pi-users"></i>
            <span class="text-sm font-medium">Team Dashboard</span>
          </a>

          <div class="px-6 mt-8 mb-2 text-slate-500 text-[10px] font-bold uppercase tracking-widest">Planning</div>
          <a
            routerLink="/projects"
            routerLinkActive="bg-blue-600 text-white shadow-lg shadow-blue-900/20"
            class="flex items-center gap-3 mx-4 px-4 py-2.5 rounded-lg text-slate-400 hover:bg-slate-800 hover:text-white transition-all group"
          >
            <i class="pi pi-briefcase"></i>
            <span class="text-sm font-medium">Project List</span>
          </a>
          <a
            routerLink="/resources"
            routerLinkActive="bg-blue-600 text-white shadow-lg shadow-blue-900/20"
            class="flex items-center gap-3 mx-4 px-4 py-2.5 rounded-lg text-slate-400 hover:bg-slate-800 hover:text-white transition-all group"
          >
            <i class="pi pi-id-card"></i>
            <span class="text-sm font-medium">Resource List</span>
          </a>

          @if (auth.isAdmin()) {
            <div class="px-6 mt-8 mb-2 text-slate-500 text-[10px] font-bold uppercase tracking-widest">Administration</div>
            <a
              routerLink="/users"
              routerLinkActive="bg-blue-600 text-white shadow-lg shadow-blue-900/20"
              class="flex items-center gap-3 mx-4 px-4 py-2.5 rounded-lg text-slate-400 hover:bg-slate-800 hover:text-white transition-all group"
            >
              <i class="pi pi-user-edit"></i>
              <span class="text-sm font-medium">Manage Users</span>
            </a>
          }
        </nav>

        <div class="p-4 border-t border-slate-800">

        </div>
      </aside>

      <!-- Main Content Container -->
      <div class="flex-1 flex flex-col min-w-0 overflow-hidden">
        <!-- Top Header -->
        <header class="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-6 shrink-0 relative z-20">
          <div class="flex items-center gap-4">
            <button 
              (click)="toggleSidebar()" 
              class="p-2 rounded-lg hover:bg-slate-100 text-slate-500 hover:text-slate-800 transition-colors active:scale-95"
              title="Toggle Sidebar"
            >
              <i class="pi" [ngClass]="isSidebarCollapsed() ? 'pi-bars' : 'pi-align-left'"></i>
            </button>
            <h2 class="text-sm font-semibold text-slate-400">Workspace / <span class="text-slate-800">{{ getPageTitle() }}</span></h2>
          </div>

          <div class="flex items-center gap-6">
            <div class="flex items-center gap-3 pl-6 border-l border-slate-100">
              <div class="flex flex-col items-end">
                <span class="text-sm font-bold text-slate-800 leading-none">{{ auth.user()?.username }}</span>
                <span class="text-[10px] font-semibold text-blue-600 uppercase tracking-wider mt-1">{{ auth.user()?.role }}</span>
              </div>
              <div class="w-10 h-10 bg-slate-100 rounded-full flex items-center justify-center border-2 border-white shadow-sm ring-1 ring-slate-100 overflow-hidden">
                 <i class="pi pi-user text-slate-400"></i>
              </div>
              <button
                (click)="auth.logout()"
                class="ml-2 flex items-center gap-2 px-4 py-2 rounded-lg bg-red-50 text-red-600 hover:bg-red-600 hover:text-white transition-all text-xs font-bold border border-red-100"
              >
                <i class="pi pi-power-off"></i>
                <span>Logout</span>
              </button>
            </div>
          </div>
        </header>

        <!-- Dynamic Content -->
        <main class="flex-1 overflow-y-auto bg-slate-50/50 custom-scrollbar">
          <div class="max-w-[1600px] mx-auto">
            <router-outlet></router-outlet>
          </div>
        </main>
      </div>
    </div>
  `,
})
export class MainLayoutComponent {
  isSidebarCollapsed = signal(false);

  constructor(public auth: AuthService, private router: Router) { }

  toggleSidebar() {
    this.isSidebarCollapsed.update(v => !v);
  }

  isActive(route: string): boolean {
    return this.router.url === route;
  }

  getPageTitle(): string {
    const url = this.router.url;
    if (url.includes('/dashboard')) return 'Dashboard';
    if (url.includes('/teams')) return 'Teams';
    if (url.includes('/projects')) return 'Projects';
    if (url.includes('/resources')) return 'Resources';
    if (url.includes('/users')) return 'Users';
    return 'TPTS';
  }
}
