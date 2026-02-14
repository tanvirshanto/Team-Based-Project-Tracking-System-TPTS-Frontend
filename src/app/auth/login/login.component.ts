import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  styles: [`
    @keyframes shake {
      0%, 100% { transform: translateX(0); }
      25% { transform: translateX(-4px); }
      75% { transform: translateX(4px); }
    }
    .animate-shake {
      animation: shake 0.4s cubic-bezier(.36,.07,.19,.97) both;
    }
    input::placeholder {
      color: rgba(148, 163, 184, 0.5);
    }
    .login-page {
      background: radial-gradient(circle at center, #0f172a 0%, #020617 100%);
    }
  `],
  template: `
    <div class="login-page min-h-screen flex items-center justify-center p-4 relative overflow-hidden bg-slate-950">
      <!-- Animated Mesh Gradient Background -->
      <div class="absolute inset-0 z-0">
        <div class="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-600/30 rounded-full blur-[120px] animate-pulse"></div>
        <div class="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-indigo-600/20 rounded-full blur-[120px] animate-pulse" style="animation-delay: 2s;"></div>
        <div class="absolute top-[20%] right-[10%] w-[30%] h-[30%] bg-purple-600/15 rounded-full blur-[100px] animate-pulse" style="animation-delay: 4s;"></div>
      </div>

      <!-- Dot Grid Overlay -->
      <div class="absolute inset-0 z-0 opacity-[0.15]" 
           style="background-image: radial-gradient(#fff 1px, transparent 1px); background-size: 32px 32px;">
      </div>

      <div class="relative z-10 w-full max-w-md">
        <div class="text-center mb-10">
          <div class="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 shadow-lg shadow-blue-500/30 mb-4">
            <svg class="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"/>
            </svg>
          </div>
          <h1 class="text-3xl font-extrabold text-white tracking-tight">
            TPTS <span class="text-blue-400">Portal</span>
          </h1>
          <p class="text-slate-400 text-sm mt-2 font-medium">Team-Based Project Tracking System</p>
        </div>

        <div class="backdrop-blur-xl bg-white/10 border border-white/20 rounded-3xl shadow-2xl p-8 md:p-10">
          <div class="mb-8">
            <h2 class="text-xl font-bold text-white">Welcome back</h2>
            <p class="text-slate-400 text-sm">Please enter your details to sign in</p>
          </div>

          <form [formGroup]="form" (ngSubmit)="onSubmit()" class="space-y-6">
            <div class="space-y-1.5">
              <label class="block text-xs font-semibold text-slate-300 uppercase tracking-wider ml-1">Username</label>
              <div class="relative group">
                <input
                  formControlName="username"
                  type="text"
                  class="w-full rounded-xl border border-white/10 bg-white/5 text-white placeholder-slate-500 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all"
                  placeholder="Enter username"
                />
              </div>
              @if (form.get('username')?.invalid && form.get('username')?.touched) {
                <p class="text-red-400 text-xs mt-1 ml-1 font-medium italic">Username is required</p>
              }
            </div>

            <div class="space-y-1.5">
              <label class="block text-xs font-semibold text-slate-300 uppercase tracking-wider ml-1">Password</label>
              <div class="relative group">
                <input
                  formControlName="password"
                  type="password"
                  class="w-full rounded-xl border border-white/10 bg-white/5 text-white placeholder-slate-500 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all"
                  placeholder="••••••••"
                />
              </div>
              @if (form.get('password')?.invalid && form.get('password')?.touched) {
                <p class="text-red-400 text-xs mt-1 ml-1 font-medium italic">Password is required</p>
              }
            </div>

            @if (error(); as err) {
              <div class="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
                <div class="flex items-center gap-2">
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
                  {{ err }}
                </div>
              </div>
            }

            <button
              type="submit"
              [disabled]="form.invalid || loading()"
              class="w-full rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white py-3.5 font-bold shadow-lg shadow-blue-600/20 active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed mt-2"
            >
              {{ loading() ? 'Authenticating...' : 'Sign In' }}
            </button>
          </form>

          <div class="mt-8 text-center pt-6 border-t border-white/5">
            <a routerLink="/forgot-password" class="text-sm font-medium text-slate-400 hover:text-white transition-colors">
              Having trouble signing in? <span class="text-blue-400">Reset Password</span>
            </a>
          </div>
        </div>
      </div>
    </div>
  `,
})
export class LoginComponent {
  form = this.fb.nonNullable.group({
    username: ['', Validators.required],
    password: ['', Validators.required],
  });
  loading = signal(false);
  error = signal<string | null>(null);

  constructor(
    private fb: FormBuilder,
    private auth: AuthService,
    private router: Router
  ) { }

  onSubmit() {
    if (this.form.invalid) return;
    this.loading.set(true);
    this.error.set(null);
    this.auth.login(this.form.getRawValue().username, this.form.getRawValue().password).subscribe({
      next: () => this.router.navigate(['/dashboard']),
      error: (err) => {
        this.loading.set(false);
        this.error.set(err.error?.error || 'Login failed');
      },
    });
  }
}
