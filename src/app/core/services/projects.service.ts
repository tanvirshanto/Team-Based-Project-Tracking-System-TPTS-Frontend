import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Resource } from './resources.service';

export interface Project {
  id: number;
  cr_name: string;
  jira_id: string | null;
  current_status: string;
  start_date: string | null;
  qa_release_date: string | null;
  uat_release_date: string | null;
  live_release_date: string | null;
  estimated_effort: number | null;
  actual_effort: number | null;
  particulars: string | null;
  Resources?: Resource[];
}

export interface ProjectCreateDto {
  cr_name: string;
  jira_id?: string;
  current_status?: string;
  start_date?: string | null;
  qa_release_date?: string | null;
  uat_release_date?: string | null;
  live_release_date?: string | null;
  estimated_effort?: number | null;
  actual_effort?: number | null;
  particulars?: string | null;
}

@Injectable({ providedIn: 'root' })
export class ProjectsService {
  constructor(private http: HttpClient) { }

  list(): Observable<Project[]> {
    return this.http.get<Project[]>(`${environment.apiUrl}/projects`);
  }

  get(id: number): Observable<Project> {
    return this.http.get<Project>(`${environment.apiUrl}/projects/${id}`);
  }

  create(data: ProjectCreateDto): Observable<Project> {
    return this.http.post<Project>(`${environment.apiUrl}/projects`, data);
  }

  update(id: number, data: Partial<ProjectCreateDto>): Observable<Project> {
    return this.http.put<Project>(`${environment.apiUrl}/projects/${id}`, data);
  }

  delete(id: number): Observable<{ message?: string }> {
    return this.http.delete<{ message?: string }>(`${environment.apiUrl}/projects/${id}`);
  }

  // Project Activities
  getActivities(projectId: number): Observable<ProjectActivity[]> {
    return this.http.get<ProjectActivity[]>(`${environment.apiUrl}/project-activities/project/${projectId}`);
  }

  addActivity(data: Partial<ProjectActivity>): Observable<ProjectActivity> {
    return this.http.post<ProjectActivity>(`${environment.apiUrl}/project-activities`, data);
  }

  updateActivity(id: number, data: Partial<ProjectActivity>): Observable<ProjectActivity> {
    return this.http.put<ProjectActivity>(`${environment.apiUrl}/project-activities/${id}`, data);
  }
}

export interface ProjectActivity {
  id: number;
  title: string;
  description: string;
  project_id: number;
  createdAt?: string;
  updatedAt?: string;
}
