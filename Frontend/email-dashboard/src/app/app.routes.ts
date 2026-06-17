import { Routes } from '@angular/router';

// We can remove the AdminHub import completely since we killed the Hub!
import { EmailDispatcher } from './pages/email-dispatcher/email-dispatcher';
import { AppRegistry } from './pages/app-registry/app-registry';
import { ConsumptionReport} from './pages/consumption-report/consumption-report';
import { AppRegister } from './pages/app-register/app-register';
import { AppLogin } from './pages/app-login/app-login';
 
export const routes: Routes = [
  // 1. The default route now instantly redirects to the Reports Dashboard
  { 
    path: '', 
    redirectTo: 'reports',
    pathMatch: 'full'
  },
  {
    path: 'registerUser',
    component : AppRegister
  },
  {
    path: 'login',
    component: AppLogin
  },
  { 
    path: 'dispatch', 
    component: EmailDispatcher
  },
  { 
    path: 'register', 
    component: AppRegistry
  },
  { 
    path: 'reports', 
    component: ConsumptionReport
  },
  // 2. The catch-all (if a user types a random URL) also redirects to the Dashboard
  { 
    path: '**', 
    redirectTo: 'reports' 
  }
];