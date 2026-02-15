import { Component, signal, OnInit, inject, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { UsersService, UserDto } from '../../core/services/users.service';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-user-list',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule, MatIconModule],
  template: `
    <div class="p-4 md:p-6">
      <div class="flex flex-wrap items-center justify-between gap-4 mb-6">
        <div class="flex items-center gap-4">
          <h1 class="text-2xl font-semibold text-slate-800">List User</h1>
          <div class="relative">
            <span class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <mat-icon class="text-slate-400 scale-75">search</mat-icon>
            </span>
            <input 
              type="text" 
              [(ngModel)]="searchFilter" 
              placeholder="Search Username, Email, or Role..." 
              class="block w-80 pl-10 pr-3 py-2 border border-slate-200 rounded-lg text-sm placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all bg-white"
            >
          </div>
        </div>
        <a routerLink="/users/new" class="rounded-lg bg-blue-600 text-white px-4 py-2 font-medium hover:bg-blue-700 shadow-sm transition-all active:scale-95">Add User</a>
      </div>
      @if (loading()) {
        <p class="text-slate-500">Loading...</p>
      } @else {
        <div class="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden">
          <div class="overflow-x-auto">
            <table class="w-full text-sm">
              <thead class="bg-slate-100 border-b border-slate-200 text-slate-600 font-medium">
                <tr class="text-left">
                  <th class="p-3">ID</th>
                  <th class="p-3">Username</th>
                  <th class="p-3">Email</th>
                  <th class="p-3">Role</th>
                  <th class="p-3 w-32">Actions</th>
                </tr>
              </thead>
              <tbody>
                @for (u of paginatedUsers(); track u.id) {
                  <tr class="border-b border-slate-100 hover:bg-slate-50">
                    <td class="p-3 text-slate-600">{{ u.id }}</td>
                    <td class="p-3 font-medium text-slate-800">{{ u.username }}</td>
                    <td class="p-3 text-slate-600">{{ u.email ?? '–' }}</td>
                    <td class="p-3">
                      <span class="rounded px-2 py-0.5 text-xs font-medium" [class]="u.role === 'Admin' ? 'bg-amber-100 text-amber-800' : 'bg-slate-200 text-slate-700'">
                        {{ u.role }}
                      </span>
                    </td>
                    <td class="p-3">
                      <a [routerLink]="['/users', u.id, 'edit']" class="text-blue-600 hover:underline mr-2">Edit</a>
                      <button
                        type="button"
                        (click)="deleteUser(u)"
                        [disabled]="u.id === currentUserId()"
                        class="text-red-600 hover:underline disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                }
              </tbody>
            </table>
          </div>

          <!-- Pagination -->
          @if (filteredUsers().length > 0) {
            <div class="px-4 py-3 border-t border-slate-200 bg-slate-50 flex items-center justify-between gap-4 flex-wrap">
              <div class="text-sm text-slate-600">
                Showing <span class="font-medium text-slate-800">{{ startItem() }}</span> to 
                <span class="font-medium text-slate-800">{{ endItem() }}</span> of 
                <span class="font-medium text-slate-800">{{ filteredUsers().length }}</span> results
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

          @if (filteredUsers().length === 0) {
            <p class="p-8 text-center text-slate-500">No users found. @if(searchFilter()) { Try adjusting your search. }</p>
          }
        </div>
      }
    </div>
  `,
})
export class UserListComponent implements OnInit {
  private usersService = inject(UsersService);
  private auth = inject(AuthService);
  users = signal<UserDto[]>([]);
  loading = signal(true);
  currentUserId = signal<number | null>(null);
  searchFilter = signal('');

  filteredUsers = computed(() => {
    const query = this.searchFilter().toLowerCase().trim();
    if (!query) return this.users();
    return this.users().filter(u =>
      u.username.toLowerCase().includes(query) ||
      (u.email || '').toLowerCase().includes(query) ||
      (u.role || '').toLowerCase().includes(query)
    );
  });

  // Pagination state
  currentPage = signal(1);
  pageSize = signal(10);

  totalPages = computed(() => Math.ceil(this.filteredUsers().length / this.pageSize()));

  paginatedUsers = computed(() => {
    const start = (this.currentPage() - 1) * this.pageSize();
    const end = start + this.pageSize();
    return this.filteredUsers().slice(start, end);
  });

  startItem = computed(() => {
    if (this.filteredUsers().length === 0) return 0;
    return ((this.currentPage() - 1) * this.pageSize()) + 1;
  });
  endItem = computed(() => Math.min(this.currentPage() * this.pageSize(), this.filteredUsers().length));

  totalPagesArray = computed(() => {
    const total = this.totalPages();
    return Array.from({ length: total }, (_, i) => i + 1);
  });

  ngOnInit() {
    this.currentUserId.set(this.auth.user()?.id ?? null);
    this.usersService.list().subscribe({
      next: (list) => {
        this.users.set(list);
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });
  }

  deleteUser(u: UserDto) {
    if (!confirm('Delete user "' + u.username + '"?')) return;
    this.usersService.delete(u.id).subscribe({
      next: () => this.users.set(this.users().filter((x) => x.id !== u.id)),
      error: (err) => alert(err.error?.error || 'Delete failed'),
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
