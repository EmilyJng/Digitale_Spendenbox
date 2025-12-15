import { Component } from '@angular/core';
import { Auth } from '../auth';
import { Router } from '@angular/router';
@Component({
  selector: 'app-dashboard',
  imports: [],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css',
})
export class Dashboard {
  constructor(private router: Router, private auth: Auth) {
    if(!this.auth.isLoggedIn()) {
      this.router.navigateByUrl('/login');
    }
  }
}
