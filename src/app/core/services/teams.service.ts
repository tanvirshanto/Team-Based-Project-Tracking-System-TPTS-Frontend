import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface ResponsibleDev {
  id: number;
  name: string;
  team_id?: number;
  team_name?: string;
  default_engaged_till?: string;
}

export interface TeamProject {
  id: number;
  jira_id: string | null;
  cr_name: string;
  current_status: string;
  start_date: string | null;
  qa_release_date: string | null;
  uat_release_date: string | null;
  live_release_date: string | null;
  particulars: string | null;
  estimated_effort: number | null;
  actual_effort: number | null;
  responsible_devs: ResponsibleDev[];
  engaged_till_by_resource: Record<number, string>;
}

export interface TeamSummaryMember {
  id: number;
  name: string;
  default_engaged_till: string | null;
  engaged_till: string | null;
}

export interface Team {
  id: number;
  team_name: string;
  manager_id: number | null;
  Manager?: { id: number; name: string } | null;
  Resources?: { id: number; name: string; default_engaged_till: string | null }[];
}

export interface TeamCreateDto {
  team_name: string;
  manager_id?: number | null;
}

@Injectable({ providedIn: 'root' })
export class TeamsService {
  constructor(private http: HttpClient) {}

  getTeams(): Observable<Team[]> {
    return this.http.get<Team[]>(`${environment.apiUrl}/teams`);
  }

  get(id: number): Observable<Team> {
    return this.http.get<Team>(`${environment.apiUrl}/teams/${id}`);
  }

  create(data: TeamCreateDto): Observable<Team> {
    return this.http.post<Team>(`${environment.apiUrl}/teams`, data);
  }

  update(id: number, data: Partial<TeamCreateDto>): Observable<Team> {
    return this.http.put<Team>(`${environment.apiUrl}/teams/${id}`, data);
  }

  delete(id: number): Observable<{ message?: string }> {
    return this.http.delete<{ message?: string }>(`${environment.apiUrl}/teams/${id}`);
  }

  getTeamProjects(teamId: number): Observable<TeamProject[]> {
    return this.http.get<TeamProject[]>(`${environment.apiUrl}/teams/${teamId}/projects`);
  }

  getTeamSummary(teamId: number): Observable<TeamSummaryMember[]> {
    return this.http.get<TeamSummaryMember[]>(`${environment.apiUrl}/teams/${teamId}/summary`);
  }
}
