import { ChangeDetectorRef, Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ApiService } from '../../services/api.service';
import { UserRegister } from '../../models/email.model';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './app-register.html',
  styleUrl: './app-register.css',
})
export class AppRegister {
  private fb = inject(FormBuilder);
  private apiService = inject(ApiService);
  private router = inject(Router); // Inject router to jump to login page later

  registerForm: FormGroup;
  statusMessage = '';
  isSending = false;
  formSubmitted = false;
  showPasswordState = false;

  constructor(private cdr: ChangeDetectorRef) {
    this.registerForm = this.fb.group({
      email: [
        '',
        [
          Validators.required,
          Validators.pattern('^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,4}$')
        ]
      ],
      password: [
        '',
        [
          Validators.required,
          // Fixed JavaScript Regex Pattern matching: Requires 1 Uppercase, 1 Lowercase, 1 Digit, 1 Special Char, Min 8 characters
          Validators.pattern('^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[$@$!%*?&])[A-Za-z\\d$@$!%*?&]{8,}$')
        ]
      ]
    });
  }

  onSubmit() {
    this.formSubmitted = true;

    if (this.registerForm.invalid) {
      return; 
    }

    this.isSending = true;
    this.statusMessage = 'Registering New Identity...';

    // FIX FOR EDGE CASE 2: Fully disable the entire form group block immediately
    // This instantly freezes the input boxes in the UI, making it impossible 
    // for the user to type, click, or alter data while the request is mid-flight.
    this.registerForm.disable();

    const request: UserRegister = this.registerForm.value;

    this.apiService.registerUser(request).subscribe({
      next: (response) => {
        this.statusMessage = '🟢 Registration successful! Redirecting to login...';
        this.isSending = false;
        
        // Always unlock and reset forms cleanly when finished
        this.registerForm.enable();
        this.registerForm.reset();
        this.formSubmitted = false;

        setTimeout(() => {
          this.router.navigate(['/login']);
        }, 2000);
      },
      error: (error) => {
        console.error('Registration failed:', error);
        this.isSending = false;
        
        // FIX FOR EDGE CASE 2: Re-enable the input fields so the user can fix errors
        this.registerForm.enable();

        // FIX FOR BUG 1: Sanitize browser network engine crashes (ProgressEvents)
        if (error.status === 0 || (error.error instanceof ProgressEvent)) {
          // Status 0 means the browser couldn't even connect to the backend server gateway
          this.statusMessage = '❌ Unable to establish connection to the secure gateway.';
        } else {
          // Fallback to backend JSON error string if it exists
          this.statusMessage = `❌ ${error.error || 'Failed to register account. Please try again.'}`;
        }
      }
    });
  }
}