import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { ApiService } from '../../services/api.service';
import { EmailLog, KpiReport } from '../../models/email.model';

@Component({
  selector: 'app-consumption-report',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './consumption-report.html',
  styleUrl: './consumption-report.css'
})
export class ConsumptionReport implements OnInit {
  searchTerm: string = '';
  statusFilter: string = 'All'; 
  timeframe: string = 'all'; 

  currentPage: number = 1;
  pageSize: number = 50;
  totalRecords: number = 0;
  totalPages: number = 1;
  isLoading: boolean = true;

  emailLogs: EmailLog[] = [];
  
  kpis: KpiReport = {
    totalMails: 0,
    failedMails: 0,
    successRate: 0
  };

  constructor(
    private apiService: ApiService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    this.loadLogs();
    this.loadKpis();
  }

  loadLogs() {
    this.isLoading = true; 

    this.apiService.getLogs(this.currentPage, this.pageSize).subscribe({
      next: (data) => {
        this.emailLogs = data.logs;
        this.totalRecords = data.totalRecords;
        this.currentPage = data.currentPage;
        this.totalPages = data.totalPages;
        
        this.isLoading = false; 
        this.cdr.detectChanges(); 
      },
      error: (err) => {
        console.error('Failed to load email logs', err);
        this.isLoading = false; 
        this.cdr.detectChanges();
      }
    });
  }

  loadKpis() {
    this.apiService.getKpis(this.timeframe).subscribe({
      next: (data) => {
        this.kpis = data;
        this.cdr.detectChanges(); 
      },
      error: (err) => console.error('Failed to load KPIs', err)
    });
  }

  onTimeframeChange(event: any) {
    this.timeframe = event.target.value;
    this.loadKpis(); 
  }

  // --- PAGINATION CONTROLS (NEW) ---
  nextPage() {
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
      this.loadLogs();
    }
  }

  previousPage() {
    if (this.currentPage > 1) {
      this.currentPage--;
      this.loadLogs();
    }
  }

  // --- THE FILTER ---
  // Note: Right now, this only searches the CURRENT page of 50 items. 
  // when using it in the real scenario then we would have passed the searchTerm to the C# backend too!
  get filteredLogs() {
    return this.emailLogs.filter(log => {
      const matchesStatus = this.statusFilter === 'All' || log.status === this.statusFilter;
      
      const searchLower = this.searchTerm.toLowerCase();
      const matchesSearch = 
        log.recipient.toLowerCase().includes(searchLower) || 
        log.appId.toLowerCase().includes(searchLower) ||
        (log.campaignId && log.campaignId.toString().includes(searchLower));

      return matchesStatus && matchesSearch;
    });
  }
}