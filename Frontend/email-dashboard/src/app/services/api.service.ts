import { tap, timeout } from 'rxjs';
import { AuthResponse } from '../models/email.model';
import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Application, KpiReport, SendEmailRequest, PaginatedEmailLogs, UserRegister, UserLogin} from '../models/email.model';

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  private baseUrl = 'https://localhost:7226/api';

  constructor(private http: HttpClient) { }

  // User Credentials ENPOINTS

  registerUser(credentials: UserRegister): Observable<any> {
    // We expect a generic JSON message object back (e.g., { message: "Successful" })
    return this.http.post<any>(`${this.baseUrl}/Auth/register`, credentials);
  }

  // 2. Login Gate with Automated Token Capture
  // Login Gate with Automated Token Capture and Timeout Fail-Safe
  loginUser(bodyData: UserLogin): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.baseUrl}/Auth/login`, bodyData).pipe(
      // 1. Drop the connection if the server doesn't respond within 4000 milliseconds
      timeout(4000),
      
      // 2. The passive spy captures the token passport if successful
      tap((response: AuthResponse) => {
        if (response && response.token) {
          localStorage.setItem('auth_token', response.token);
        }
      })
    );
  }

  // 3. Helper Method: Check if User is Logged In
  getToken(): string | null {
    return localStorage.getItem('auth_token');
  }

  // 4. Helper Method: Clear Session (Logout)
  logoutUser(): void {
    localStorage.removeItem('auth_token');
  }

  getUserRole(): string | null {
  const token = this.getToken();
  if (!token) return null;

  try {
    // Decode the payload section of the JWT string
    const tokenPayload = JSON.parse(atob(token.split('.')[1]));
    
    // .NET JWT role claims usually map to this specific string key or 'role'
    return tokenPayload['http://schemas.microsoft.com/ws/2008/06/identity/claims/role'] || tokenPayload['role'] || null;
  } catch (error) {
    return null;
  }
}


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