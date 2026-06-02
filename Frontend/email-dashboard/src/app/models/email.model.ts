export interface Application {
  id?: number;
  name: string;
  apiKey?: string;
  contactEmail?: string;
  status: string;
}

export interface EmailLog {
  id: number;
  appId: string;
  recipient: string;
  subject: string;
  status: string;
  sentAt: string | Date; 
  errorMessage?: string;
  campaignId?: number;
}

export interface KpiReport {
  totalMails: number;
  failedMails: number;
  successRate: number;
}

export interface SendEmailRequest {
  appName: string;
  recipient: string;
  subject: string;
  body: string;
}

export interface PaginatedEmailLogs {
  logs: EmailLog[];
  totalRecords: number;
  currentPage: number;  
  pageSize: number;
  totalPages: number;
}