import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Application, KpiReport, SendEmailRequest, PaginatedEmailLogs} from '../models/email.model';

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  private baseUrl = 'https://localhost:7226/api';

  constructor(private http: HttpClient) { }


  // APP REGISTRY ENDPOINTS

  getApps(): Observable<Application[]> {
    return this.http.get<Application[]>(`${this.baseUrl}/AppRegistry`);
  }

  registerApp(app: Application): Observable<Application> {
    return this.http.post<Application>(`${this.baseUrl}/AppRegistry`, app);
  }

  updateAppStatus(id: number | undefined, status: string): Observable<Application> {
    return this.http.put<Application>(`${this.baseUrl}/AppRegistry/${id}/status`, `"${status}"`, {
      headers: { 'Content-Type': 'application/json' }
    });
  }


  // SINGLE DISPATCHER ENDPOINT

  sendEmail(request: SendEmailRequest): Observable<any> {
    return this.http.post(`${this.baseUrl}/Email/send`, request);
  }

  // BULK UPLOAD ENDPOINT 
  sendBulkEmails(campaignId: number, emails: any[]): Observable<any> {
    return this.http.post(`${this.baseUrl}/Email/bulk?campaignId=${campaignId}`, emails);
  }


  // REPORTS ENDPOINTS

  getLogs(pageNumber: number = 1, pageSize: number = 50): Observable<PaginatedEmailLogs> {
    const params = new HttpParams()
      .set('pageNumber', pageNumber.toString())
      .set('pageSize', pageSize.toString());

    return this.http.get<PaginatedEmailLogs>(`${this.baseUrl}/Reports/logs`, { params });
  }


  // KPI ENDPOINTS
  getKpis(timeframe: string): Observable<KpiReport> {
    const params = new HttpParams().set('timeframe', timeframe);
    return this.http.get<KpiReport>(`${this.baseUrl}/Reports/kpis`, { params });
  }
}