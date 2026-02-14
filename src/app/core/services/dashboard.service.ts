import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { environment } from '../../../environments/environment';

export interface ResourceEngagementRow {
  resourceId?: number;
  resourceName: string;
  engagedTill: string;
  particular: string;
  jiraId?: string;
  projectStatus?: string;
}

@Injectable({ providedIn: 'root' })
export class DashboardService {
  constructor(private http: HttpClient) { }

  getResourceEngagement(): Observable<ResourceEngagementRow[]> {
    return this.http
      .get<ResourceEngagementRow[]>(`${environment.apiUrl}/dashboard/resource-engagement`)
      .pipe(
        catchError(() => of(this.getSampleData()))
      );
  }

  getSampleData(): ResourceEngagementRow[] {
    return [
      { resourceName: 'Toyeb', engagedTill: '03-02-2026', particular: 'Analysis and Development of UAT Observations. Revamp Phase 2 is pending on BA for configuration analysis' },
      { resourceName: 'Shakif', engagedTill: '03-02-2026', particular: '' },
      { resourceName: 'Nobin', engagedTill: '22-01-2026', particular: '' },
      { resourceName: 'Imran', engagedTill: '15-02-2026', particular: 'Amar Hishab Release 1' },
      { resourceName: 'Kanon', engagedTill: '30-01-2026', particular: 'Amar Hishab Release 2' },
    ];
  }
}
