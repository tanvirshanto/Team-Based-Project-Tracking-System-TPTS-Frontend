import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-forgot-password',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  template: `
    <div class="min-h-screen flex items-center justify-center bg-slate-900 px-4">
      <div class="w-full max-w-sm rounded-xl bg-slate-800 p-8 shadow-xl">
        <h1 class="text-xl font-bold text-white mb-6">Forgot password</h1>
        <form [formGroup]="form" (ngSubmit)="onSubmit()" class="space-y-4">
          <div>
            <label class="block text-sm font-medium text-slate-300 mb-1">Email</label>
            <input
              formControlName="email"
              type="email"
              class="w-full rounded-lg border border-slate-600 bg-slate-700 text-white px-3 py-2"
              placeholder="your@email.com"
            />
            @if (form.get('email')?.invalid && form.get('email')?.touched) {
              <p class="text-red-400 text-xs mt-1">Valid email required</p>
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
            {{ loading() ? 'Sending...' : 'Send reset link' }}
          </button>
        </form>
        <p class="mt-4 text-center text-sm text-slate-400">
          <a routerLink="/login" class="text-blue-400 hover:underline">Back to login</a>
        </p>
      </div>
    </div>
  `,
})
export class ForgotPasswordComponent {
  form = this.fb.nonNullable.group({
    email: ['', [Validators.required, Validators.email]],
  });
  loading = signal(false);
  message = signal<string | null>(null);
  error = signal<string | null>(null);

  constructor(private fb: FormBuilder, private auth: AuthService) {}

  onSubmit() {
    if (this.form.invalid) return;
    this.loading.set(true);
    this.message.set(null);
    this.error.set(null);
    this.auth.forgotPassword(this.form.getRawValue().email).subscribe({
      next: (res) => {
        this.loading.set(false);
        this.message.set(res.message);
        if (res.resetToken) this.message.set((this.message() ?? '') + ' Reset token (dev): ' + res.resetToken);
      },
      error: (err) => {
        this.loading.set(false);
        this.error.set(err.error?.error || 'Request failed');
      },
    });
  }
}
