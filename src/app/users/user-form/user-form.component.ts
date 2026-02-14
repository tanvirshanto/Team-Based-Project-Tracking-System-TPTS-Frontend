import { Component, signal, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { UsersService } from '../../core/services/users.service';

@Component({
  selector: 'app-user-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  template: `
    <div class="p-4 md:p-6">
      <header class="flex items-center gap-4 mb-6">
        <a routerLink="/users" class="text-slate-500 hover:text-slate-800">← List User</a>
        <h1 class="text-2xl font-semibold text-slate-800">{{ isEdit() ? 'Edit user' : 'Add User' }}</h1>
      </header>
      <form [formGroup]="form" (ngSubmit)="onSubmit()" class="max-w-md space-y-4 rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <div>
          <label class="block text-sm font-medium text-slate-700 mb-1">Username</label>
          <input
            formControlName="username"
            type="text"
            class="w-full rounded-lg border border-slate-300 px-3 py-2 focus:ring-2 focus:ring-blue-500"
            placeholder="username"
          />
          @if (form.get('username')?.invalid && form.get('username')?.touched) {
            <p class="text-red-500 text-xs mt-1">Required</p>
          }
        </div>
        <div>
          <label class="block text-sm font-medium text-slate-700 mb-1">Email</label>
          <input
            formControlName="email"
            type="email"
            class="w-full rounded-lg border border-slate-300 px-3 py-2 focus:ring-2 focus:ring-blue-500"
            placeholder="user@example.com"
          />
        </div>
        <div>
          <label class="block text-sm font-medium text-slate-700 mb-1">
            Password {{ isEdit() ? '(leave blank to keep current)' : '' }}
          </label>
          <input
            formControlName="password"
            type="password"
            class="w-full rounded-lg border border-slate-300 px-3 py-2 focus:ring-2 focus:ring-blue-500"
            placeholder="••••••••"
          />
          @if (!isEdit() && form.get('password')?.invalid && form.get('password')?.touched) {
            <p class="text-red-400 text-xs mt-1">Required, min 6 characters</p>
          }
          @if (isEdit() && form.get('password')?.value && form.get('password')?.invalid && form.get('password')?.touched) {
            <p class="text-red-400 text-xs mt-1">Min 6 characters</p>
          }
        </div>
        <div>
          <label class="block text-sm font-medium text-slate-700 mb-1">Role</label>
          <select
            formControlName="role"
            class="w-full rounded-lg border border-slate-300 px-3 py-2 focus:ring-2 focus:ring-blue-500"
          >
            <option value="User">User</option>
            <option value="Admin">Admin</option>
          </select>
        </div>
@if (error(); as err) {
            <p class="text-red-500 text-sm">{{ err }}</p>
          }
          <div class="flex gap-3">
            <button
              type="submit"
              [disabled]="form.invalid || loading()"
              class="rounded-lg bg-blue-600 text-white px-4 py-2 font-medium hover:bg-blue-700 disabled:opacity-50"
            >
              {{ loading() ? 'Saving...' : (isEdit() ? 'Update' : 'Create') }}
            </button>
            <a
              routerLink="/users"
              class="rounded-lg border border-slate-300 px-4 py-2 text-slate-700 hover:bg-slate-50"
            >
              Cancel
            </a>
          </div>
        </form>
    </div>
  `,
})
export class UserFormComponent implements OnInit {
  private fb = inject(FormBuilder);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private usersService = inject(UsersService);

  isEdit = signal(false);
  loading = signal(false);
  error = signal<string | null>(null);

  form = this.fb.nonNullable.group({
    username: ['', Validators.required],
    email: [''],
    password: ['', [Validators.minLength(6)]],
    role: ['User' as 'User' | 'Admin'],
  });

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    if (id && id !== 'new') {
      this.isEdit.set(true);
      this.form.get('password')?.clearValidators();
      this.form.get('password')?.setValidators([Validators.minLength(6)]);
      this.form.get('password')?.updateValueAndValidity();
      this.usersService.list().subscribe({
        next: (list) => {
          const u = list.find((x) => x.id === +id);
          if (u) {
            this.form.patchValue({
              username: u.username,
              email: u.email ?? '',
              role: u.role as 'User' | 'Admin',
            });
          }
        },
      });
    } else {
      this.form.get('password')?.setValidators([Validators.required, Validators.minLength(6)]);
      this.form.get('password')?.updateValueAndValidity();
    }
  }

  onSubmit() {
    if (this.form.invalid) return;
    this.loading.set(true);
    this.error.set(null);
    const { username, email, role, password } = this.form.getRawValue();
    if (this.isEdit()) {
      const id = Number(this.route.snapshot.paramMap.get('id'));
      this.usersService.update(id, { username, email: email || undefined, role, password: password || undefined }).subscribe({
        next: () => this.router.navigate(['/users']),
        error: (err) => {
          this.loading.set(false);
          this.error.set(err.error?.error || 'Update failed');
        },
      });
    } else {
      if (!password) return;
      this.usersService.create({ username, email: email || undefined, role, password }).subscribe({
        next: () => this.router.navigate(['/users']),
        error: (err) => {
          this.loading.set(false);
          this.error.set(err.error?.error || 'Create failed');
        },
      });
    }
  }
}
