import type { Routes } from '@angular/router';
import { Home } from './home/home';
import { Login } from './login/login';
import { Dashboard } from './dashboard/dashboard';
import { Donors } from './donors/donors';
import { Campaign } from './campaign/campaign';
import { Payment } from './payment/payment';
import { Contactform } from './contactform/contactform';

export const routes: Routes = [
  {
    path: '',
    component: Home,
  },
  {
    path: 'login',
    component: Login,
  },
  {
    path: 'dashboard',
    component: Dashboard,
  },
  {
    path: 'donors',
    component: Donors,
  },
  {
    path: 'campaign',
    component: Campaign,
  },
  {
    path: 'checkout/:campaignId',
    component: Payment,
  },
  {
    path: 'contactform',
    component: Contactform,
  },
];
