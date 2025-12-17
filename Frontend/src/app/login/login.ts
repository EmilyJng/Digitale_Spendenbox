// login.component.ts
import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { CheckboxModule } from 'primeng/checkbox';
import { PasswordModule } from 'primeng/password';
import { Auth } from '../auth';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-login',
  templateUrl: './login.html',
  styleUrls: ['./login.css'],
  imports: [ButtonModule, CheckboxModule, PasswordModule, CardModule, FormsModule],
})
export class Login {
  loading = false;
  serverError: string | null = null;
  password: string = '';
  username: string = '';

  constructor(private auth: Auth, private router: Router) {}

  login() {
    const isLoggedIn = this.auth.login(this.username, this.password);
  }
}
