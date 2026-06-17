import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { ApiService } from './api.service';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const apiService = inject(ApiService); 
  const token = apiService.getToken();   

  if (token) {
    const clonedReq = req.clone({ 
      setHeaders: { 
        Authorization: `Bearer ${token}` 
      } 
    });
    
    return next(clonedReq);
  }

  return next(req); 
};