import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface UserDto {
  id: number;
  username: string;
  email?: string;
  role: string;
  createdAt?: string;
}

@Injectable({ providedIn: 'root' })
export class UsersService {
  constructor(private http: HttpClient) {}

  list(): Observable<UserDto[]> {
    return this.http.get<UserDto[]>(`${environment.apiUrl}/auth/users`);
  }

  create(data: { username: string; password: string; email?: string; role?: string }): Observable<UserDto> {
    return this.http.post<UserDto>(`${environment.apiUrl}/auth/users`, data);
  }

  update(id: number, data: { username?: string; email?: string; role?: string; password?: string }): Observable<UserDto> {
    return this.http.put<UserDto>(`${environment.apiUrl}/auth/users/${id}`, data);
  }

  delete(id: number): Observable<{ message: string }> {
    return this.http.delete<{ message: string }>(`${environment.apiUrl}/auth/users/${id}`);
  }
}
