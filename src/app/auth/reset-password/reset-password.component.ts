import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-reset-password',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  template: `
    <div class="min-h-screen flex items-center justify-center bg-slate-900 px-4">
      <div class="w-full max-w-sm rounded-xl bg-slate-800 p-8 shadow-xl">
        <h1 class="text-xl font-bold text-white mb-6">Reset password</h1>
        <form [formGroup]="form" (ngSubmit)="onSubmit()" class="space-y-4">
          <input type="hidden" formControlName="token" />
          <div>
            <label class="block text-sm font-medium text-slate-300 mb-1">New password</label>
            <input
              formControlName="newPassword"
              type="password"
              class="w-full rounded-lg border border-slate-600 bg-slate-700 text-white px-3 py-2"
              placeholder="••••••••"
            />
            @if (form.get('newPassword')?.invalid && form.get('newPassword')?.touched) {
              <p class="text-red-400 text-xs mt-1">Min 6 characters</p>
            }
          </div>
          @if (message(); as msg) {
            <p class="text-green-400 text-sm">{{ msg }}</p>
          }
          @if (error(); as err) {
            <p class="text-red-400 text-sm">{{ err }}</p>
          }
          <button
            type="submit"
            [disabled]="form.invalid || loading()"
            class="w-full rounded-lg bg-blue-600 text-white py-2 font-medium hover:bg-blue-700 disabled:opacity-50"
          >
            {{ loading() ? 'Resetting...' : 'Reset password' }}
          </button>
        </form>
        <p class="mt-4 text-center text-sm text-slate-400">
          <a routerLink="/login" class="text-blue-400 hover:underline">Back to login</a>
        </p>
      </div>
    </div>
  `,
})
export class ResetPasswordComponent {
  form = this.fb.nonNullable.group({
    token: ['', Validators.required],
    newPassword: ['', [Validators.required, Validators.minLength(6)]],
  });
  loading = signal(false);
  message = signal<string | null>(null);
  error = signal<string | null>(null);

  constructor(
    private fb: FormBuilder,
    private auth: AuthService,
    private route: ActivatedRoute,
    private router: Router
  ) {
    const t = this.route.snapshot.queryParams['token'];
    if (t) this.form.patchValue({ token: t });
  }

  onSubmit() {
    if (this.form.invalid) return;
    this.loading.set(true);
    this.message.set(null);
    this.error.set(null);
    const { token, newPassword } = this.form.getRawValue();
    this.auth.resetPassword(token, newPassword).subscribe({
      next: (res) => {
        this.loading.set(false);
        this.message.set(res.message + ' Redirecting to login...');
        setTimeout(() => this.router.navigate(['/login']), 2000);
      },
      error: (err) => {
        this.loading.set(false);
        this.error.set(err.error?.error || 'Reset failed');
      },
    });
  }
}
