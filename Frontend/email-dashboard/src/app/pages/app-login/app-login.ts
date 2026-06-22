import { ChangeDetectorRef, Component, inject ,} from '@angular/core';
import { Router } from '@angular/router';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ApiService } from '../../services/api.service';
import { UserLogin } from '../../models/email.model';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './app-login.html',
  styleUrl: './app-login.css' 
})
export class AppLogin {
  private fb = inject(FormBuilder);
  private apiService = inject(ApiService);
  private router = inject(Router);
  

  loginForm: FormGroup;
  statusMessage = '';
  isSending = false;
  formSubmitted = false;
  showPasswordState = false;

  constructor(private cdr: ChangeDetectorRef) {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required]]
    });
  }

  onSubmit() {
    this.formSubmitted = true;

    if (this.loginForm.invalid) {
      return; 
    }

    this.isSending = true;
    this.statusMessage = 'Verifying Credentials...';

    this.loginForm.disable();
    const credentials: UserLogin = this.loginForm.value;

    this.apiService.loginUser(credentials).subscribe({
      next: (response) => {
        this.statusMessage = '🟢 Authentication verified! Opening central console...';
        this.isSending = false;
        this.formSubmitted = false;
        this.loginForm.enable();
        this.loginForm.reset();
        
        setTimeout(() => {
          this.router.navigate(['/reports']);
        }, 2000);
        
        this.cdr.detectChanges();
      },
      error: (error) => {
        console.error('Login failed:', error);
        this.isSending = false;
        this.loginForm.enable();

         if (error.status === 0 || (error.error instanceof ProgressEvent)) {
          this.statusMessage = '❌ Unable to establish connection to the secure gateway.';
        } else {
          this.statusMessage = `❌ ${error.error || 'Invalid corporate email or access password.'}`;
        }
      }
    });
  }
}