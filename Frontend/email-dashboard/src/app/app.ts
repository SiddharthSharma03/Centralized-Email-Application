import { Component, inject } from '@angular/core';
import { Router, RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, RouterLink, RouterLinkActive, CommonModule],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class AppComponent {
  private router = inject(Router);

  // Returns true only if the user is on an active dashboard module page
  showSidebar(): boolean {
    const currentUrl = this.router.url;
    return !(currentUrl.includes('registerUser') || currentUrl.includes('login'));
    
  }
}