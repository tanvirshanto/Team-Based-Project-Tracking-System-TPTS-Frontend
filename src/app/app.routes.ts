import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';
import { adminGuard } from './core/guards/admin.guard';

export const routes: Routes = [
  { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
  { path: 'login', loadComponent: () => import('./auth/login/login.component').then((m) => m.LoginComponent) },
  {
    path: 'forgot-password',
    loadComponent: () => import('./auth/forgot-password/forgot-password.component').then((m) => m.ForgotPasswordComponent),
  },
  {
    path: 'reset-password',
    loadComponent: () => import('./auth/reset-password/reset-password.component').then((m) => m.ResetPasswordComponent),
  },
  {
    path: '',
    canActivate: [authGuard],
    loadComponent: () => import('./layout/main-layout/main-layout.component').then((m) => m.MainLayoutComponent),
    children: [
      { path: 'dashboard', loadComponent: () => import('./dashboard/dashboard.component').then((m) => m.DashboardComponent) },
      { path: 'teams', loadComponent: () => import('./teams/team-list/team-list.component').then((m) => m.TeamListComponent) },
      { path: 'teams/new', loadComponent: () => import('./teams/team-form/team-form.component').then((m) => m.TeamFormComponent) },
      { path: 'teams/:id', loadComponent: () => import('./teams/team-detail/team-detail.component').then((m) => m.TeamDetailComponent) },
      { path: 'teams/:id/edit', loadComponent: () => import('./teams/team-form/team-form.component').then((m) => m.TeamFormComponent) },
      { path: 'projects', loadComponent: () => import('./projects/project-list/project-list.component').then((m) => m.ProjectListComponent) },
      { path: 'projects/new', loadComponent: () => import('./projects/project-form/project-form.component').then((m) => m.ProjectFormComponent) },
      { path: 'projects/:id/edit', loadComponent: () => import('./projects/project-form/project-form.component').then((m) => m.ProjectFormComponent) },
      { path: 'resources', loadComponent: () => import('./resources/resource-list/resource-list.component').then((m) => m.ResourceListComponent) },
      { path: 'resources/new', loadComponent: () => import('./resources/resource-form/resource-form.component').then((m) => m.ResourceFormComponent) },
      { path: 'resources/:id/edit', loadComponent: () => import('./resources/resource-form/resource-form.component').then((m) => m.ResourceFormComponent) },
      { path: 'managers/new', loadComponent: () => import('./managers/manager-form/manager-form.component').then((m) => m.ManagerFormComponent) },
      { path: 'users', loadComponent: () => import('./users/user-list/user-list.component').then((m) => m.UserListComponent), canActivate: [adminGuard] },
      { path: 'users/new', loadComponent: () => import('./users/user-form/user-form.component').then((m) => m.UserFormComponent), canActivate: [adminGuard] },
      { path: 'users/:id/edit', loadComponent: () => import('./users/user-form/user-form.component').then((m) => m.UserFormComponent), canActivate: [adminGuard] },
    ],
  },
  { path: '**', redirectTo: 'dashboard' },
];
