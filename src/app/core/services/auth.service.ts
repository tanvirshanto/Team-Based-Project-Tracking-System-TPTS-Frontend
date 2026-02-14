import { Injectable, signal, computed } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { tap, catchError, of } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface User {
  id: number;
  username: string;
  email?: string;
  role: string;
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly tokenKey = 'tpts_token';
  private userSignal = signal<User | null>(null);
  private tokenSignal = signal<string | null>(this.getStoredToken());

  readonly user = this.userSignal.asReadonly();
  readonly token = this.tokenSignal.asReadonly();
  readonly isLoggedIn = computed(() => !!this.tokenSignal());

  constructor(private http: HttpClient, private router: Router) {
    if (this.tokenSignal()) this.fetchMe();
  }

  private getStoredToken(): string | null {
    return localStorage.getItem(this.tokenKey);
  }

  login(username: string, password: string) {
    return this.http
      .post<{ token: string; user: User }>(`${environment.apiUrl}/auth/login`, { username, password })
      .pipe(
        tap((res) => {
          localStorage.setItem(this.tokenKey, res.token);
          this.tokenSignal.set(res.token);
          this.userSignal.set(res.user);
        })
      );
  }

  logout() {
    localStorage.removeItem(this.tokenKey);
    this.tokenSignal.set(null);
    this.userSignal.set(null);
    this.router.navigate(['/login']);
  }

  fetchMe() {
    this.http
      .get<User>(`${environment.apiUrl}/auth/me`)
      .pipe(
        tap((u) => this.userSignal.set(u)),
        catchError(() => {
          this.logout();
          return of(null);
        })
      )
      .subscribe();
  }

  forgotPassword(email: string) {
    return this.http.post<{ message: string; resetToken?: string }>(
      `${environment.apiUrl}/auth/forgot-password`,
      { email }
    );
  }

  resetPassword(token: string, newPassword: string) {
    return this.http.post<{ message: string }>(`${environment.apiUrl}/auth/reset-password`, {
      token,
      newPassword,
    });
  }

  isAdmin(): boolean {
    return this.userSignal()?.role === 'Admin';
  }
}
