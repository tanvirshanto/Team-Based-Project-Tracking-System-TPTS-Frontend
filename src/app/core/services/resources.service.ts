import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface Resource {
  id: number;
  name: string;
  team_id: number | null;
  Team?: { id: number; team_name: string } | null;
  default_engaged_till: string | null;
}

export interface ResourceCreateDto {
  name: string;
  team_id?: number | null;
  default_engaged_till?: string | null;
}

@Injectable({ providedIn: 'root' })
export class ResourcesService {
  constructor(private http: HttpClient) {}

  list(): Observable<Resource[]> {
    return this.http.get<Resource[]>(`${environment.apiUrl}/resources`);
  }

  get(id: number): Observable<Resource> {
    return this.http.get<Resource>(`${environment.apiUrl}/resources/${id}`);
  }

  create(data: ResourceCreateDto): Observable<Resource> {
    return this.http.post<Resource>(`${environment.apiUrl}/resources`, data);
  }

  update(id: number, data: Partial<ResourceCreateDto>): Observable<Resource> {
    return this.http.put<Resource>(`${environment.apiUrl}/resources/${id}`, data);
  }

  delete(id: number): Observable<{ message?: string }> {
    return this.http.delete<{ message?: string }>(`${environment.apiUrl}/resources/${id}`);
  }
}
