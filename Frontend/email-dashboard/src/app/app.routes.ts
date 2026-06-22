import { Routes } from '@angular/router';
import { EmailDispatcher } from './pages/email-dispatcher/email-dispatcher';
import { AppRegistry } from './pages/app-registry/app-registry';
import { ConsumptionReport } from './pages/consumption-report/consumption-report';
import { AppRegister } from './pages/app-register/app-register';
import { AppLogin } from './pages/app-login/app-login';
import { authGuard, publicGuard } from '../Guards/auth.guard'; // Import your guards 

export const routes: Routes = [
  { 
    path: '', 
    redirectTo: 'reports',
    pathMatch: 'full'
  },
  {
    path: 'registerUser',
    component: AppRegister,
    canActivate: [publicGuard] // 🔒 Block if already logged in
  },
  {
    path: 'login',
    component: AppLogin,
    canActivate: [publicGuard] // 🔒 Block if already logged in
  },
  { 
    path: 'dispatch', 
    component: EmailDispatcher,
    canActivate: [authGuard] // 🔒 Lock down to verified sessions
  },
  { 
    path: 'register', 
    component: AppRegistry,
    canActivate: [authGuard] // 🔒 Lock down to verified sessions
  },
  { 
    path: 'reports', 
    component: ConsumptionReport,
    canActivate: [authGuard] // 🔒 Lock down to verified sessions
  },
  { 
    path: '**', 
    redirectTo: 'reports' 
  }
];