import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface Assignment {
    project_id: number;
    resource_id: number;
}

@Injectable({
    providedIn: 'root'
})
export class AssignmentsService {
    private apiUrl = `${environment.apiUrl}/assignments`;

    constructor(private http: HttpClient) { }

    mapResource(projectId: number, resourceId: number): Observable<Assignment> {
        return this.http.post<Assignment>(this.apiUrl, { project_id: projectId, resource_id: resourceId });
    }

    unmapResource(projectId: number, resourceId: number): Observable<any> {
        return this.http.delete(this.apiUrl, { body: { project_id: projectId, resource_id: resourceId } });
    }

    getAssignmentsByProject(projectId: number): Observable<any[]> {
        return this.http.get<any[]>(`${this.apiUrl}/project/${projectId}`);
    }
}
