import { Component, ChangeDetectorRef } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ApiService } from '../../services/api.service';
import { SendEmailRequest } from '../../models/email.model';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-email-dispatcher',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule, RouterModule],
  templateUrl: './email-dispatcher.html',
  styleUrl: './email-dispatcher.css',
})
export class EmailDispatcher {
  emailForm: FormGroup;
  statusMessage = '';
  isSending = false;
  formSubmitted = false;

  // --- BULK UPLOAD STATE ---
  selectedFile: File | null = null;
  parsedBulkEmails: any[] = [];
  isUploadingBulk: boolean = false;
  bulkUploadMessage: string = '';

  availableApps: string[] = [];

  constructor(
    private fb: FormBuilder,
    private apiService: ApiService,
    private cdr: ChangeDetectorRef,
  ) {
    this.emailForm = this.fb.group({
      appName: ['', Validators.required],
      recipient: [
        '',
        [
          Validators.required,
          Validators.pattern('^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,4}$'),],
      ],
      subject: ['', Validators.required],
      body: ['', Validators.required],
    });
  }

  ngOnInit() {
    this.apiService.getApps().subscribe({
      next: (apps) => {
        this.availableApps = apps.map((app) => app.name);
        this.cdr.detectChanges();
      },
      error: (err) => console.error('Could not load apps', err),
    });
  }

  // Catches the file when the user selects or drops it
  onFileSelected(event: any) {
    const file = event.target.files[0];
    
    if (file) {
      // Check if file is a CSV
      if (!file.name.toLowerCase().endsWith('.csv')) {
        this.bulkUploadMessage = '❌ Invalid file type. Please upload a .csv file.';
        this.selectedFile = null;
        this.parsedBulkEmails = [];
        this.cdr.detectChanges();
        return;
      }

      this.bulkUploadMessage = '';
      this.selectedFile = file;
      this.readCSVFile(file);
    }
  }

  // method to clear the selection
  removeFile(event: Event) {
    event.stopPropagation();
    this.selectedFile = null;
    this.parsedBulkEmails = [];
    this.bulkUploadMessage = '';
    this.cdr.detectChanges();
  }

  // The Browser reads the file text
  private readCSVFile(file: File) {
    const reader = new FileReader();
    reader.onload = (e: any) => {
      const csvText = e.target.result;
      this.parseCSVtoJSON(csvText);
    };
    reader.readAsText(file);
    this.cdr.detectChanges();
  }

  // 3. Conversion (Text to JSON Array)
  private parseCSVtoJSON(csvText: string) {
    const lines = csvText.split('\n');
    this.parsedBulkEmails = [];

    for (let i = 1; i < lines.length; i++) {
      const currentLine = lines[i].trim();
      if (!currentLine) continue;

      const columns = currentLine.split(',');

      if (columns.length >= 4) {
        this.parsedBulkEmails.push({
          appId: columns[0].trim(),
          recipient: columns[1].trim(),
          subject: columns[2].trim(),
          body: columns[3].trim(),
        });
        this.cdr.detectChanges();
      }
    }
  }

  // Send the payload to C#
  executeBulkUpload() {
    if (this.parsedBulkEmails.length === 0) return;

    this.isUploadingBulk = true;

    const generatedCampaignId = Math.floor(100000 + Math.random() * 900000);

    this.apiService.sendBulkEmails(generatedCampaignId, this.parsedBulkEmails).subscribe({
      next: (response: any) => {
        this.isUploadingBulk = false;
        this.bulkUploadMessage = `Success! Dispatched ${response.successful} emails. Batch ID: ${generatedCampaignId}`;
        this.cdr.detectChanges();

        this.selectedFile = null;
        this.parsedBulkEmails = [];
      },
      error: (err) => {
        this.isUploadingBulk = false;
        this.bulkUploadMessage = 'Fatal error during bulk dispatch.';
        console.error(err);
        this.cdr.detectChanges();
      },
    });
  }

  dispatchEmail() {
    this.formSubmitted = true;
    if (this.emailForm.invalid) {
      this.cdr.detectChanges();
      return;
    }

    this.isSending = true;
    this.statusMessage = '⏳ Dispatching email...';

    const request: SendEmailRequest = this.emailForm.value;

    this.apiService.sendEmail(request).subscribe({
      next: (response) => {
        this.statusMessage = '✅ Email successfully dispatched!';
        this.isSending = false;
        this.emailForm.reset({ appName: '' });
        this.formSubmitted = false;
        this.cdr.detectChanges();
      },
      error: (error) => {
        console.error('Dispatch failed:', error);
        this.statusMessage = '❌ Failed to send email. Check the console.';
        this.isSending = false;
        this.cdr.detectChanges();
      },
    });
  }
}
