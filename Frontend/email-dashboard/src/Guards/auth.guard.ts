import { inject } from '@angular/core';
import { Router, CanActivateFn } from '@angular/router';
import { ApiService } from '../app/services/api.service';

// GUARD 1: Protects Internal Dashboard Modules
export const authGuard: CanActivateFn = (route, state) => {
  const apiService = inject(ApiService);
  const router = inject(Router);

  if (apiService.getToken()) {
    return true; // Token exists, open the door!
  }

  // No passport token found. Redirect to login instantly
  router.navigate(['/login']);
  return false;
};

// GUARD 2: Protects Public Auth Pages (Prevents going backward to Login while logged in)
export const publicGuard: CanActivateFn = (route, state) => {
  const apiService = inject(ApiService);
  const router = inject(Router);
  
  if (apiService.getToken()) {
    // User is already authenticated! Don't show login, force them forward to dashboard
    router.navigate(['/reports']);
    return false;
  }

  return true; // No token found, allow them to view the login/register screen
};
