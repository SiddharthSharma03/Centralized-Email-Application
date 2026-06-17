import { Component, OnInit, ChangeDetectorRef, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { ApiService } from '../../services/api.service';
import { Application } from '../../models/email.model';

@Component({
  selector: 'app-app-registry',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule, RouterModule],
  templateUrl: './app-registry.html',
  styleUrl: './app-registry.css'
})
export class AppRegistry implements OnInit {
  // Modern Angular 18 Property Injections
  private fb = inject(FormBuilder);
  private apiService = inject(ApiService);
  private cdr = inject(ChangeDetectorRef);

  registryForm!: FormGroup; // Marked as definitely initialized below
  registeredApps: Application[] = [];
  formSubmitted = false;
  isLoading: boolean = true;

  // --- ROLE SECURITY STATE ---
  isAdmin = false;

  // --- REGISTRATION MODAL STATE ---
  isModalOpen = false;
  pendingApp: any = null;

  // --- STATUS CHANGE MODAL STATE ---
  isStatusModalOpen = false;
  appToChange: any = null;
  newPendingStatus = '';

  ngOnInit() {
    // 1. Evaluate user role authority right at startup
    const role = this.apiService.getUserRole();
    this.isAdmin = (role === 'Admin');

    // 2. Build the structural validation form group shell
    this.initForm();

    // 3. Defensive Gate: Execute data engine download pipelines ONLY if user is Admin
    if (this.isAdmin) {
      this.loadApps();
    } else {
      this.isLoading = false; // Turn off initial skeleton/spinners for employees immediately
    }
  }

  private initForm() {
    this.registryForm = this.fb.group({
      name: ['', [
        Validators.required,
        Validators.minLength(3),
        Validators.maxLength(40),
        (control: any) => {
          const exists = this.registeredApps.some(
            app => app.name.toLowerCase() === control.value?.toLowerCase()
          );
          return exists ? { nameTaken: true } : null;
        }
      ]],
      contactEmail: ['', Validators.email],
      status: ['Testing', Validators.required] 
    });
  }

  loadApps() {
    this.apiService.getApps().subscribe({
      next: (data) => {
        this.registeredApps = data;
        this.isLoading = false;
        this.cdr.detectChanges(); 
      },
      error: (err) => {
        console.error('Failed to load apps from database', err);
        this.isLoading = false;
      }
    });
  }

  // --- REGISTRATION LOGIC ---
  initiateRegistration() {
    this.formSubmitted = true;

    if (this.registryForm.invalid) {
      this.cdr.detectChanges();
      return;
    }

    this.pendingApp = this.registryForm.value;
    this.isModalOpen = true;
  }

  confirmRegistration() {
    this.apiService.registerApp(this.pendingApp).subscribe({
      next: (response) => {
        this.loadApps(); 
        this.closeModal();
        this.registryForm.reset({ status: 'Testing' });
        this.formSubmitted = false; 
        this.cdr.detectChanges();
      },
      error: (err) => console.error('Registration failed in backend', err)
    });
  }

  closeModal() {
    this.isModalOpen = false;
    this.pendingApp = null;
  }

  // --- STATUS CHANGE LOGIC ---
  initiateStatusChange(app: Application, event: any) {
    this.appToChange = app;
    this.newPendingStatus = event.target.value;
    this.isStatusModalOpen = true;
    event.target.value = app.status;
  }

  confirmStatusChange() {
    if (this.appToChange && this.appToChange.id) {
      this.apiService.updateAppStatus(this.appToChange.id, this.newPendingStatus).subscribe({
        next: () => {
          this.appToChange.status = this.newPendingStatus;
          this.closeStatusModal();
          this.cdr.detectChanges();
        },
        error: (err) => console.error('Status update failed in backend', err)
      });
    }
  }

  closeStatusModal() {
    this.isStatusModalOpen = false;
    this.appToChange = null;
    this.newPendingStatus = '';
  }
}