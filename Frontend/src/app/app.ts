import { Component, signal } from '@angular/core';
import { Router, RouterOutlet } from '@angular/router';
import type { MenuItem } from 'primeng/api';
import { MenubarModule } from 'primeng/menubar';
import { Auth } from './auth';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, MenubarModule],
  templateUrl: './app.html',
  styleUrl: './app.css',
})
export class App {
  protected readonly title = signal('Frontend');
  protected readonly isLoggedIn;

  constructor(private auth: Auth, private router: Router) {
    this.isLoggedIn = auth.isLoggedIn;
  }

  logout() {
    this.auth.logout();
  }

  login() {
    this.router.navigateByUrl('/login');
  }

  items: MenuItem[] = [
    {
      label: 'Home',
      routerLink: '/',
    },
    {
      label: 'Kampagnen',
      routerLink: '/campaign',
    },
    {
      label: 'Dashboard',
      routerLink: '/dashboard',
    },
  ];
}
