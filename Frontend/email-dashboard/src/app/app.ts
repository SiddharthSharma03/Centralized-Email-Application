import { Component, OnInit, inject } from '@angular/core';
import { Router, RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';
import { CommonModule } from '@angular/common';
import { ApiService } from './services/api.service'; // Make sure this path is correct

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, RouterLink, RouterLinkActive, CommonModule],
  templateUrl: './app.html'
})
export class AppComponent implements OnInit {
  private router = inject(Router);
  private apiService = inject(ApiService);

  userEmail: string = 'Operator';
  userRole: string = 'Clearance Pending';
  userInitials: string = 'OP';

  ngOnInit() {
    this.hydrateUserProfile();
  }

  // Reads the active JWT token properties to populate the profile panel layout
  hydrateUserProfile() {
    const token = this.apiService.getToken();
    if (!token) return;

    try {
      const tokenPayload = JSON.parse(atob(token.split('.')[1]));
      
      // 1. Extract email from .NET Identity claims array keys
      const emailClaim = tokenPayload['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress'] || tokenPayload['email'];
      if (emailClaim) {
        this.userEmail = emailClaim;
        // Strip everything after the @ to create cleanly formatted initials (e.g., admin@collabera.com -> AD)
        this.userInitials = emailClaim.substring(0, 2).toUpperCase();
      }

      // 2. Extract authorization group clearance
      const roleClaim = tokenPayload['http://schemas.microsoft.com/ws/2008/06/identity/claims/role'] || tokenPayload['role'];
      if (roleClaim) {
        this.userRole = roleClaim;
      }
    } catch (error) {
      console.error('Failed to process session profile identity tokens:', error);
    }
  }

  showSidebar(): boolean {
    const currentUrl = this.router.url;
    const hideOnPages = ['registerUser', 'login'];
    const hide = hideOnPages.some(page => currentUrl.includes(page));
    
    // If the sidebar is waking up from a login transition, re-run token parsing
    if (!hide && this.userEmail === 'Operator') {
      this.hydrateUserProfile();
    }
    
    return !hide;
  }

  onLogout() {
    localStorage.removeItem('auth_token');
    
    // Reset component state parameters back to blank defaults on exit
    this.userEmail = 'Operator';
    this.userRole = 'Clearance Pending';
    this.userInitials = 'OP';

    this.router.navigate(['/login'], { replaceUrl: true });
  }
}